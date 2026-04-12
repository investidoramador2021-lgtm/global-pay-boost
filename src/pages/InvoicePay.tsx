import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileText, Clock, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

interface Invoice {
  id: string;
  invoice_id: string;
  token: string;
  payer_name: string;
  payer_email: string;
  requester_name: string;
  fiat_amount: number;
  fiat_currency: string;
  crypto_amount: number;
  crypto_ticker: string;
  wallet_address: string;
  status: string;
  expires_at: string;
  created_at: string;
}

const InvoicePay = () => {
  const { token } = useParams<{ token: string }>();
  const { t } = useTranslation();
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

  const isExpired = invoice ? new Date(invoice.expires_at) < new Date() : false;

  return (
    <>
      <Helmet>
        <title>Pay Invoice — MRC Global Pay</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <SiteHeader />
      <main className="min-h-screen bg-background pt-20 pb-16 px-4">
        <div className="mx-auto max-w-lg">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading invoice…</span>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
              <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-destructive" />
              <h2 className="font-display text-lg font-bold text-foreground">Invoice Not Found</h2>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            </div>
          )}

          {invoice && !loading && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="font-display text-xl font-bold text-foreground">Invoice #{invoice.invoice_id}</h1>
                    <p className="text-xs text-muted-foreground">From {invoice.requester_name}</p>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl bg-accent/50 p-4">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Billed To</span>
                    <span className="text-sm font-semibold text-foreground">{invoice.payer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Amount</span>
                    <span className="font-display text-lg font-bold text-foreground">
                      {Number(invoice.fiat_amount).toLocaleString()} {invoice.fiat_currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Crypto Equivalent</span>
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {Number(invoice.crypto_amount)} {invoice.crypto_ticker.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
                    <span className={`text-xs font-bold uppercase ${
                      invoice.status === 'paid' ? 'text-trust' :
                      invoice.status === 'expired' ? 'text-destructive' :
                      'text-amber-400'
                    }`}>
                      {invoice.status === 'pending' ? 'Awaiting Payment' : invoice.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Rate Lock Expires</span>
                    <span className="text-xs text-amber-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(invoice.expires_at).toLocaleDateString()} ({Math.ceil((new Date(invoice.expires_at).getTime() - Date.now()) / 3600000)}h)
                    </span>
                  </div>
                </div>

                {isExpired ? (
                  <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-center">
                    <AlertTriangle className="mx-auto mb-1 h-5 w-5 text-destructive" />
                    <p className="text-sm font-semibold text-destructive">This invoice has expired.</p>
                    <p className="text-xs text-muted-foreground">Please contact the requester for a new invoice.</p>
                  </div>
                ) : invoice.status === 'paid' ? (
                  <div className="mt-4 rounded-lg border border-trust/30 bg-trust/5 p-3 text-center">
                    <p className="text-sm font-semibold text-trust">This invoice has been paid.</p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-lg border border-border bg-background p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Send exactly to this wallet:</p>
                      <p className="font-mono text-xs break-all text-foreground">{invoice.wallet_address}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center">
                      Send exactly <span className="font-semibold text-foreground">{Number(invoice.crypto_amount)} {invoice.crypto_ticker.toUpperCase()}</span> to the address above. The payment will be confirmed automatically.
                    </p>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => window.open(`${window.location.origin}/status/${token}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" /> Track Payment Status
              </Button>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
};

export default InvoicePay;
