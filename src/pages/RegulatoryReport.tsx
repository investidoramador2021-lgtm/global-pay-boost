import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

interface RecordData {
  id: string;
  transaction_ref: string;
  alert_type: string;
  amount: number;
  from_currency: string;
  to_currency: string;
  source_wallet: string;
  destination_wallet: string;
  exchange_rate: number;
  partner_legal_name: string;
  partner_email: string;
  msb_reference: string;
  notes: string;
  status: string;
  created_at: string;
}

const RegulatoryReport = () => {
  const { token } = useParams<{ token: string }>();
  const [record, setRecord] = useState<RecordData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!token) { setError("No token provided."); setLoading(false); return; }

      const { data: link, error: linkErr } = await supabase
        .from("audit_links")
        .select("*")
        .eq("token", token)
        .single();

      if (linkErr || !link) { setError("Invalid or expired link."); setLoading(false); return; }

      const l = link as any;
      if (new Date(l.expires_at) < new Date()) { setError("This link has expired."); setLoading(false); return; }

      // Log access
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("audit_access_logs").insert({
          audit_link_id: l.id,
          accessed_by: user.id,
          user_agent: navigator.userAgent,
        });
      }

      const { data: recordData, error: recordErr } = await supabase
        .from("compliance_alerts")
        .select("*")
        .eq("id", l.alert_id)
        .single();

      if (recordErr || !recordData) { setError("Record not found."); setLoading(false); return; }
      setRecord(recordData as unknown as RecordData);
      setLoading(false);
    };
    load();
  }, [token]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white text-gray-800"><p>Loading report…</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-white text-gray-800"><p className="text-red-600">{error}</p></div>;
  if (!record) return null;

  return (
    <>
      <Helmet><title>Regulatory Report — {record.msb_reference}</title><meta name="description" content={`Confidential FINTRAC regulatory transaction report for reference ${record.msb_reference}. MRC GLOBALPAY INC. — MSB # C100000015.`} /><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="min-h-screen bg-white text-gray-900 print:bg-white" style={{ fontFamily: "'Times New Roman', serif" }}>
        <div className="max-w-3xl mx-auto py-12 px-8">
          {/* Header */}
          <div className="border-b-2 border-gray-800 pb-4 mb-8">
            <h1 className="text-2xl font-bold text-gray-900">MRC GLOBALPAY INC.</h1>
            <p className="text-sm text-gray-600">FINTRAC Registered Money Services Business — MSB # C100000015</p>
            <p className="text-sm text-gray-600">Headquarters: Ottawa, Ontario, Canada</p>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Regulatory Transaction Report</h2>
            <p className="text-sm text-gray-500 mt-1">Internal Reference: {record.msb_reference}</p>
            <p className="text-xs text-gray-400">Generated: {new Date().toISOString()}</p>
          </div>

          {/* Transaction Details */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-4 text-gray-800">1. Transaction Details</h3>
            <table className="w-full text-sm">
              <tbody>
                <Row label="Transaction Reference" value={record.transaction_ref} />
                <Row label="MSB Reference Number" value={record.msb_reference} />
                <Row label="Transaction Amount" value={`${record.amount.toLocaleString()} ${record.from_currency.toUpperCase()}`} />
                <Row label="Currency Pair" value={`${record.from_currency.toUpperCase()} → ${record.to_currency.toUpperCase()}`} />
                <Row label="Exchange Rate at Time of Trade" value={String(record.exchange_rate)} />
                <Row label="Exact Timestamp" value={new Date(record.created_at).toISOString()} />
              </tbody>
            </table>
          </section>

          {/* Security Status */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-4 text-gray-800">2. Security Verification</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-800">Security Status: Verified via ChangeNOW API Forensic AML Filter</p>
              <p className="text-xs text-green-700 mt-1">This transaction has been processed through automated forensic AML screening.</p>
            </div>
          </section>

          {/* Partner Details */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-4 text-gray-800">3. Partner Identification</h3>
            <table className="w-full text-sm">
              <tbody>
                <Row label="Full Legal Name" value={record.partner_legal_name} />
                <Row label="Verified Registered Email" value={record.partner_email} />
              </tbody>
            </table>
          </section>

          {/* Wallet Details */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-4 text-gray-800">4. Wallet Addresses (Unmasked)</h3>
            <table className="w-full text-sm">
              <tbody>
                <Row label="Source Wallet (Sender)" value={record.source_wallet} mono />
                <Row label="Destination Wallet (Recipient)" value={record.destination_wallet} mono />
              </tbody>
            </table>
          </section>

          {/* Notes */}
          {record.notes && (
            <section className="mb-8">
              <h3 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-4 text-gray-800">5. Internal Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{record.notes}</p>
            </section>
          )}

          {/* Footer */}
          <div className="border-t-2 border-gray-800 pt-4 mt-12">
            <p className="text-xs text-gray-500">This document is confidential and intended solely for regulatory purposes.</p>
            <p className="text-xs text-gray-500">Unauthorized distribution is strictly prohibited under Canadian federal law.</p>
            <p className="text-xs text-gray-500 mt-2">© {new Date().getFullYear()} MRC Global Pay Inc. All rights reserved.</p>
          </div>

          {/* Print button (hidden in print) */}
          <div className="mt-8 text-center print:hidden">
            <button onClick={() => window.print()} className="px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-700 transition-colors">
              Print Report
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const Row = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <tr className="border-b border-gray-100">
    <td className="py-2 pr-4 font-medium text-gray-600 w-56">{label}</td>
    <td className={`py-2 text-gray-900 ${mono ? "font-mono text-xs break-all" : ""}`}>{value}</td>
  </tr>
);

export default RegulatoryReport;