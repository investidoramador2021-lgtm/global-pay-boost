import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileText, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

interface Invoice {
  id: string;
  invoice_id: string;
  payer_name: string;
  requester_name: string;
  fiat_amount: number;
  fiat_currency: string;
  crypto_amount: number;
  crypto_ticker: string;
  status: string;
  expires_at: string;
  created_at: string;
}

const statusConfig: Record<string, { icon: typeof Clock; label: string; color: string }> = {
  pending: { icon: Clock, label: "Awaiting Payment", color: "text-amber-400" },
  paid: { icon: CheckCircle2, label: "Settled", color: "text-trust" },
  expired: { icon: AlertTriangle, label: "Expired", color: "text-destructive" },
};

const InvoiceStatus = () => {
  const { token } = useParams<{ token: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    const fetchInvoice = async () => {
      const { data, error: err } = await supabase
        .from("invoices")
        .select("*")
        .eq("token", token)
        .maybeSingle();
      if (err || !data) {
        setError("Invoice not found or invalid link.");
      } else {
        setInvoice(data as Invoice);
      }
      setLoading(false);
    };
    fetchInvoice();
  }, [token]);

  const cfg = invoice ? (statusConfig[invoice.status] || statusConfig.pending) : statusConfig.pending;
  const StatusIcon = cfg.icon;

  return (
    <>
      <Helmet>
        <title>Invoice Status — MRC Global Pay</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <SiteHeader />
      <main className="min-h-screen bg-background pt-20 pb-16 px-4">
        <div className="mx-auto max-w-lg">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading status…</span>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
              <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-destructive" />
              <h2 className="font-display text-lg font-bold text-foreground">Not Found</h2>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            </div>
          )}

          {invoice && !loading && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg space-y-4">
              <div className="text-center">
                <StatusIcon className={`mx-auto mb-2 h-12 w-12 ${cfg.color}`} />
                <h1 className="font-display text-xl font-bold text-foreground">Invoice #{invoice.invoice_id}</h1>
                <p className={`mt-1 text-sm font-bold uppercase ${cfg.color}`}>{cfg.label}</p>
              </div>

              <div className="space-y-3 rounded-xl bg-accent/50 p-4">
                <div className="flex justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Payer</span>
                  <span className="text-sm text-foreground">{invoice.payer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Requester</span>
                  <span className="text-sm text-foreground">{invoice.requester_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Amount</span>
                  <span className="font-display text-base font-bold text-foreground">
                    {Number(invoice.fiat_amount).toLocaleString()} {invoice.fiat_currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Crypto</span>
                  <span className="font-mono text-sm text-foreground">
                    {Number(invoice.crypto_amount)} {invoice.crypto_ticker.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Issued</span>
                  <span className="text-xs text-muted-foreground">{new Date(invoice.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Expires</span>
                  <span className="text-xs text-amber-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(invoice.expires_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-center text-muted-foreground">
                This page updates automatically. Rate locked for 168 hours (7 days).
              </p>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
};

export default InvoiceStatus;
