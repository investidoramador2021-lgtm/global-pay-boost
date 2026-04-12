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
  service_fee_percent: number;
  service_fee_amount: number;
  net_crypto_amount: number;
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
        setError(t("invoice.payPageNotFound"));
      } else {
        setInvoice(data as Invoice);
      }
      setLoading(false);
    };
    fetchInvoice();
  }, [token, t]);

  const isExpired = invoice ? new Date(invoice.expires_at) < new Date() : false;
  const ticker = invoice?.crypto_ticker?.toUpperCase() || "";

  return (
    <>
      <Helmet>
        <title>{t("invoice.payPageTitle")} — MRC Global Pay</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <SiteHeader />
      <main className="min-h-screen bg-background pt-20 pb-16 px-4">
        <div className="mx-auto max-w-lg">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">{t("invoice.payPageLoading")}</span>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
              <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-destructive" />
              <h2 className="font-display text-lg font-bold text-foreground">{t("invoice.payPageNotFound")}</h2>
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
                    <p className="text-xs text-muted-foreground">{t("invoice.statusPageRequester")}: {invoice.requester_name}</p>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl bg-accent/50 p-4">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t("invoice.payPageBilledTo")}</span>
                    <span className="text-sm font-semibold text-foreground">{invoice.payer_name}</span>
                  </div>

                  {/* Fee Breakdown */}
                  <div className="rounded-lg border border-border bg-background/50 p-3 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("invoice.feeBreakdownTitle")}</p>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-muted-foreground">{t("invoice.payPageRequestedAmount")}</span>
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {Number(invoice.crypto_amount)} {ticker}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-muted-foreground">
                        {t("invoice.payPageServiceFee")} ({invoice.service_fee_percent}%)
                      </span>
                      <span className="font-mono text-xs text-destructive">
                        −{Number(invoice.service_fee_amount)} {ticker}
                      </span>
                    </div>
                    <p className="text-[9px] text-muted-foreground italic">{t("invoice.payPageFeeDeducted")}</p>
                    <div className="flex justify-between border-t border-border pt-2">
                      <span className="text-[10px] font-bold text-primary">{t("invoice.payPageReceiverGets")}</span>
                      <span className="font-display text-sm font-bold text-primary">
                        {Number(invoice.net_crypto_amount)} {ticker}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t("invoice.amountLabel")} ({invoice.fiat_currency})</span>
                    <span className="font-display text-lg font-bold text-foreground">
                      {Number(invoice.fiat_amount).toLocaleString()} {invoice.fiat_currency}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t("invoice.payPageStatus")}</span>
                    <span className={`text-xs font-bold uppercase ${
                      invoice.status === 'paid' ? 'text-trust' :
                      invoice.status === 'expired' ? 'text-destructive' :
                      'text-amber-400'
                    }`}>
                      {invoice.status === 'pending' ? t("invoice.payPageAwaitingPayment") : invoice.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t("invoice.payPageRateLockExpires")}</span>
                    <span className="text-xs text-amber-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(invoice.expires_at).toLocaleDateString()} ({Math.max(0, Math.ceil((new Date(invoice.expires_at).getTime() - Date.now()) / 3600000))}h)
                    </span>
                  </div>
                </div>

                {isExpired ? (
                  <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-center">
                    <AlertTriangle className="mx-auto mb-1 h-5 w-5 text-destructive" />
                    <p className="text-sm font-semibold text-destructive">{t("invoice.payPageExpired")}</p>
                    <p className="text-xs text-muted-foreground">{t("invoice.payPageExpiredSub")}</p>
                  </div>
                ) : invoice.status === 'paid' ? (
                  <div className="mt-4 rounded-lg border border-trust/30 bg-trust/5 p-3 text-center">
                    <p className="text-sm font-semibold text-trust">{t("invoice.payPagePaid")}</p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-lg border border-border bg-background p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t("invoice.payPageSendExactly")}</p>
                      <p className="font-mono text-xs break-all text-foreground">{invoice.wallet_address}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center"
                       dangerouslySetInnerHTML={{ __html: t("invoice.payPageSendInstruction", { amount: Number(invoice.crypto_amount), ticker }) }}
                    />
                  </div>
                )}

                {/* Tax Disclaimer */}
                <p className="mt-4 text-[9px] text-center text-muted-foreground italic">
                  {t("invoice.taxDisclaimer")}
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => window.open(`${window.location.origin}/status/${token}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" /> {t("invoice.payPageTrackStatus")}
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