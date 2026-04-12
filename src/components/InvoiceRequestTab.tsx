import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, ChevronDown, X, Copy, Check, FileText, Mail, Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DestinationAddressInput from "@/components/DestinationAddressInput";
import { supabase } from "@/integrations/supabase/client";
import {
  getCurrencies,
  type Currency,
} from "@/lib/changenow";

// Tier-1 assets only for Invoice tab
const TIER1_TICKERS = ["btc", "eth", "usdc", "usdttrc20", "ltc", "doge"];
const FIAT_OPTIONS = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "BRL"] as const;

const FIAT_TO_USD: Record<string, number> = {
  USD: 1, EUR: 1.08, GBP: 1.27, CAD: 0.73, AUD: 0.65, JPY: 0.0064, BRL: 0.19,
};

const DISPLAY_TICKER_MAP: Record<string, string> = {
  usdterc20: "USDT", usdttrc20: "USDT", usdtbsc: "USDT", usdtsol: "USDT",
  usdcsol: "USDC", usdcmatic: "USDC", usdcbsc: "USDC", usdcbase: "USDC",
};

function displayTicker(c: { ticker: string }): string {
  return DISPLAY_TICKER_MAP[c.ticker.toLowerCase()] || c.ticker.toUpperCase();
}

function networkLabel(c: { ticker: string; name: string }): string | null {
  const match = c.name.match(/\(([^)]+)\)/);
  if (match) return match[1];
  if (DISPLAY_TICKER_MAP[c.ticker.toLowerCase()]) {
    const raw = c.ticker.toLowerCase();
    const base = DISPLAY_TICKER_MAP[raw].toLowerCase();
    const suffix = raw.replace(base, "");
    return suffix ? suffix.toUpperCase() : null;
  }
  return null;
}

const INVOICE_EXPIRY_HOURS = 168; // 7 days
const SERVICE_FEE_PERCENT = 0.5;

const InvoiceRequestTab = () => {
  const { t, i18n } = useTranslation();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);

  const [fiatCurrency, setFiatCurrency] = useState<typeof FIAT_OPTIONS[number]>("USD");
  const [fiatAmount, setFiatAmount] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [lastEdited, setLastEdited] = useState<"fiat" | "crypto">("fiat");
  const [fiatRate, setFiatRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(false);

  const [payerName, setPayerName] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [receiveCurrency, setReceiveCurrency] = useState<Currency | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [addressValid, setAddressValid] = useState(false);
  const [requesterEmail, setRequesterEmail] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [invoiceId, setInvoiceId] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCurrencies().then((data) => {
      if (cancelled || !Array.isArray(data)) return;
      // Filter to Tier-1 assets only
      const tier1 = data.filter((c) => TIER1_TICKERS.includes(c.ticker.toLowerCase()));
      setCurrencies(tier1);
      const btc = tier1.find((c) => c.ticker === "btc");
      if (btc) setReceiveCurrency(btc);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const fetchRate = useCallback(async (ticker: string, fiat: string) => {
    if (!ticker) return;
    setRateLoading(true);
    try {
      const coinId = mapTickerToCoinGeckoId(ticker);
      const { data } = await supabase.functions.invoke("coingecko-prices", {
        body: { ids: [coinId] },
      });
      const usdPrice = data?.[coinId]?.usd;
      if (usdPrice) {
        const fiatMultiplier = FIAT_TO_USD[fiat] || 1;
        setFiatRate(usdPrice * fiatMultiplier);
      }
    } catch {
      // silent
    } finally {
      setRateLoading(false);
    }
  }, []);

  useEffect(() => {
    if (receiveCurrency) fetchRate(receiveCurrency.ticker, fiatCurrency);
  }, [receiveCurrency, fiatCurrency, fetchRate]);

  useEffect(() => {
    if (!fiatRate) return;
    if (lastEdited === "fiat" && fiatAmount) {
      const val = parseFloat(fiatAmount);
      if (!isNaN(val) && val > 0) setCryptoAmount((val / fiatRate).toFixed(8).replace(/\.?0+$/, ""));
    }
  }, [fiatAmount, fiatRate, lastEdited]);

  useEffect(() => {
    if (!fiatRate) return;
    if (lastEdited === "crypto" && cryptoAmount) {
      const val = parseFloat(cryptoAmount);
      if (!isNaN(val) && val > 0) setFiatAmount((val * fiatRate).toFixed(2));
    }
  }, [cryptoAmount, fiatRate, lastEdited]);

  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) return currencies;
    const q = searchQuery.toLowerCase();
    return currencies.filter(
      (c) => c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [currencies, searchQuery]);

  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const canSubmit = payerName.trim() && requesterName.trim() && receiveCurrency
    && parseFloat(cryptoAmount) > 0 && walletAddress.trim() && addressValid
    && isEmailValid(requesterEmail) && isEmailValid(payerEmail);

  const serviceFeeAmount = useMemo(() => {
    const crypto = parseFloat(cryptoAmount);
    if (isNaN(crypto) || crypto <= 0) return 0;
    return parseFloat((crypto * SERVICE_FEE_PERCENT / 100).toFixed(8));
  }, [cryptoAmount]);

  const netCryptoAmount = useMemo(() => {
    const crypto = parseFloat(cryptoAmount);
    if (isNaN(crypto) || crypto <= 0) return 0;
    return parseFloat((crypto - serviceFeeAmount).toFixed(8));
  }, [cryptoAmount, serviceFeeAmount]);

  const handleIssueInvoice = async () => {
    if (!canSubmit) return;
    const id = `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    setInvoiceId(id);

    try {
      // 1. Save invoice to database — the token is auto-generated by the DB
      const { data: invoiceRow, error: insertErr } = await supabase
        .from("invoices")
        .insert({
          invoice_id: id,
          payer_name: payerName.trim(),
          payer_email: payerEmail.trim().toLowerCase(),
          requester_name: requesterName.trim(),
          requester_email: requesterEmail.trim().toLowerCase(),
          fiat_amount: parseFloat(fiatAmount),
          fiat_currency: fiatCurrency,
          crypto_amount: parseFloat(cryptoAmount),
          crypto_ticker: receiveCurrency ? receiveCurrency.ticker : "btc",
          wallet_address: walletAddress.trim(),
          language: i18n.language || "en",
          service_fee_percent: SERVICE_FEE_PERCENT,
          service_fee_amount: serviceFeeAmount,
          net_crypto_amount: netCryptoAmount,
        })
        .select("token, expires_at")
        .single();

      if (insertErr || !invoiceRow) {
        console.error("Invoice insert failed:", insertErr);
        setInvoiceGenerated(true);
        return;
      }

      const token = invoiceRow.token;
      const siteUrl = window.location.origin;
      const payUrl = `${siteUrl}/pay/${token}`;
      const statusUrl = `${siteUrl}/status/${token}`;
      const expiresAt = new Date(invoiceRow.expires_at).toLocaleDateString();
      const tickerDisplay = receiveCurrency ? displayTicker(receiveCurrency) : "BTC";

      // 2. Send invoice email to payer
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "invoice-to-payer",
          recipientEmail: payerEmail.trim().toLowerCase(),
          idempotencyKey: `invoice-payer-${id}`,
          templateData: {
            payerName: payerName.trim(),
            requesterName: requesterName.trim(),
            fiatAmount: fiatAmount,
            fiatCurrency,
            cryptoAmount,
            cryptoTicker: tickerDisplay,
            serviceFeePercent: String(SERVICE_FEE_PERCENT),
            serviceFeeAmount: String(serviceFeeAmount),
            netCryptoAmount: String(netCryptoAmount),
            invoiceId: id,
            payUrl,
            statusUrl,
            expiresAt,
            language: i18n.language || "en",
          },
        },
      });

      // 3. Send confirmation email to requester
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "invoice-requester-confirmation",
          recipientEmail: requesterEmail.trim().toLowerCase(),
          idempotencyKey: `invoice-requester-${id}`,
          templateData: {
            requesterName: requesterName.trim(),
            payerName: payerName.trim(),
            payerEmail: payerEmail.trim().toLowerCase(),
            fiatAmount: fiatAmount,
            fiatCurrency,
            cryptoAmount,
            cryptoTicker: tickerDisplay,
            serviceFeePercent: String(SERVICE_FEE_PERCENT),
            serviceFeeAmount: String(serviceFeeAmount),
            netCryptoAmount: String(netCryptoAmount),
            invoiceId: id,
            statusUrl,
            expiresAt,
            language: i18n.language || "en",
          },
        },
      });

      // 4. Telegram notification
      await supabase.functions.invoke("telegram-notify", {
        body: {
          type: "swap",
          message: `[MRC GlobalPay] 📄 Invoice Issued\nID: ${id}\nGross: ${cryptoAmount} ${tickerDisplay} (${fiatAmount} ${fiatCurrency})\nFee: ${serviceFeeAmount} ${tickerDisplay} (${SERVICE_FEE_PERCENT}%)\nNet: ${netCryptoAmount} ${tickerDisplay}\nPayer: ${payerName}\nIssuer: ${requesterName}\nExpiry: ${INVOICE_EXPIRY_HOURS}h`,
        },
      });
    } catch (err) {
      console.error("Invoice flow error:", err);
    }

    setInvoiceGenerated(true);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/?invoice=${invoiceId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewInvoice = () => {
    setInvoiceGenerated(false);
    setInvoiceId("");
    setPayerName("");
    setRequesterName("");
    setFiatAmount("");
    setCryptoAmount("");
    setRequesterEmail("");
    setPayerEmail("");
  };

  const handleFiatInput = (v: string) => {
    setFiatAmount(v.replace(/[^\d.]/g, ""));
    setLastEdited("fiat");
  };

  const handleCryptoInput = (v: string) => {
    setCryptoAmount(v.replace(/[^\d.]/g, ""));
    setLastEdited("crypto");
  };

  if (loading) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="font-body text-sm text-muted-foreground">{t("invoice.loadingAssets")}</span>
      </div>
    );
  }

  if (invoiceGenerated) {
    const expiresAt = new Date(Date.now() + INVOICE_EXPIRY_HOURS * 3600 * 1000);
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-trust/30 bg-trust/5 p-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-trust/20">
            <Check className="h-6 w-6 text-trust" />
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">{t("invoice.invoiceIssued")}</h3>
          <p className="mt-1 font-body text-xs text-muted-foreground">
            {t("invoice.sentTo")} <span className="font-semibold text-foreground">{payerEmail}</span>
          </p>
        </div>

        <div className="rounded-xl border border-border bg-accent/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">{t("invoice.invoiceIdLabel")}</span>
            <span className="font-mono text-xs font-semibold text-foreground">{invoiceId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">{t("invoice.amountLabel")}</span>
            <span className="font-display text-sm font-bold text-foreground">
              {cryptoAmount} {receiveCurrency && displayTicker(receiveCurrency)}
              <span className="ml-1 text-xs font-normal text-muted-foreground">≈ {fiatAmount} {fiatCurrency}</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">
              {t("invoice.serviceFeeLabel", { percent: SERVICE_FEE_PERCENT })}
            </span>
            <span className="font-mono text-xs text-destructive">
              −{serviceFeeAmount} {receiveCurrency && displayTicker(receiveCurrency)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2">
            <span className="font-body text-[10px] uppercase tracking-wider font-bold text-primary">{t("invoice.receiverGetsLabel")}</span>
            <span className="font-display text-sm font-bold text-primary">
              {netCryptoAmount} {receiveCurrency && displayTicker(receiveCurrency)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">{t("invoice.payerLabel")}</span>
            <span className="font-body text-xs text-foreground">{payerName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">{t("invoice.expiresLabel")}</span>
            <span className="font-body text-xs text-amber-400 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {expiresAt.toLocaleDateString()} ({INVOICE_EXPIRY_HOURS / 24} {t("invoice.daysLabel")})
            </span>
          </div>
        </div>

        <p className="text-[9px] text-center text-muted-foreground italic px-2">
          {t("invoice.taxDisclaimer")}
        </p>

        <Button onClick={handleCopyLink} variant="outline" className="w-full gap-2">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? t("invoice.copied") : t("invoice.copyLink")}
        </Button>
        <Button onClick={handleNewInvoice} className="w-full gap-2">
          <FileText className="h-4 w-4" /> {t("invoice.createAnother")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-sm font-bold text-foreground">{t("invoice.header")}</h3>
          <p className="font-body text-[10px] text-muted-foreground">{t("invoice.headerDesc")}</p>
        </div>
      </div>

      {/* Identity Fields */}
      <div className="space-y-2">
        <div>
          <label className="mb-1 block font-body text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("invoice.payerName")} <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder={t("invoice.payerNamePlaceholder")}
            value={payerName}
            onChange={(e) => setPayerName(e.target.value)}
            className="h-10 bg-accent/50 border-border font-body text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block font-body text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("invoice.requesterName")} <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder={t("invoice.requesterNamePlaceholder")}
            value={requesterName}
            onChange={(e) => setRequesterName(e.target.value)}
            className="h-10 bg-accent/50 border-border font-body text-sm"
          />
        </div>
      </div>

      {/* Asset Selector */}
      <div>
        <label className="mb-1 block font-body text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("invoice.receiveAsset")} <span className="text-destructive">*</span>
        </label>
        <button
          type="button"
          onClick={() => { setShowPicker(true); setSearchQuery(""); }}
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-accent/50 px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
        >
          {receiveCurrency?.image && (
            <img src={receiveCurrency.image} alt="" className="h-5 w-5 rounded-full" />
          )}
          <span>{receiveCurrency ? displayTicker(receiveCurrency) : t("widget.select")}</span>
          {receiveCurrency && networkLabel(receiveCurrency) && (
            <span className="text-[9px] text-muted-foreground">{networkLabel(receiveCurrency)}</span>
          )}
          <ChevronDown className="h-3.5 w-3.5 ml-auto opacity-60" />
        </button>
      </div>

      {/* Dual Amount Input: Fiat ↔ Crypto */}
      <div>
        <label className="mb-1 block font-body text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("invoice.youReceive")} <span className="text-destructive">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="relative">
            <select
              value={fiatCurrency}
              onChange={(e) => setFiatCurrency(e.target.value as typeof FIAT_OPTIONS[number])}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-transparent border-none text-xs font-bold text-foreground focus:outline-none cursor-pointer pr-1"
            >
              {FIAT_OPTIONS.map((f) => (
                <option key={f} value={f} className="bg-background text-foreground">{f}</option>
              ))}
            </select>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={fiatAmount}
              onChange={(e) => handleFiatInput(e.target.value)}
              className="h-10 bg-accent/50 border-border font-display text-lg font-bold text-right pl-16"
            />
          </div>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
              {receiveCurrency ? displayTicker(receiveCurrency) : "—"}
            </span>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0.00000000"
              value={cryptoAmount}
              onChange={(e) => handleCryptoInput(e.target.value)}
              className="h-10 bg-accent/50 border-border font-display text-lg font-bold text-right pl-16"
            />
          </div>
        </div>
        {rateLoading && (
          <p className="mt-1 font-body text-[10px] text-muted-foreground flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" /> {t("invoice.fetchingRate")}
          </p>
        )}
        {fiatRate && !rateLoading && (
          <p className="mt-1 font-body text-[10px] text-muted-foreground">
            1 {receiveCurrency ? displayTicker(receiveCurrency) : ""} ≈ {fiatRate.toLocaleString()} {fiatCurrency}
          </p>
        )}
      </div>

      {/* Wallet Address */}
      <div>
        <label className="mb-1 block font-body text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("invoice.yourWallet")} <span className="text-destructive">*</span>
        </label>
        <DestinationAddressInput
          value={walletAddress}
          onChange={setWalletAddress}
          onValidChange={setAddressValid}
          currencyTicker={receiveCurrency?.ticker}
        />
      </div>

      {/* Emails */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block font-body text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("invoice.yourEmail")} <span className="text-destructive">*</span>
          </label>
          <Input
            type="email"
            placeholder={t("invoice.requesterEmailPlaceholder")}
            value={requesterEmail}
            onChange={(e) => setRequesterEmail(e.target.value)}
            className="h-10 bg-accent/50 border-border font-body text-xs"
          />
        </div>
        <div>
          <label className="mb-1 block font-body text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("invoice.payerEmail")} <span className="text-destructive">*</span>
          </label>
          <Input
            type="email"
            placeholder={t("invoice.payerEmailPlaceholder")}
            value={payerEmail}
            onChange={(e) => setPayerEmail(e.target.value)}
            className="h-10 bg-accent/50 border-border font-body text-xs"
          />
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <p className="font-body text-[10px] leading-relaxed text-muted-foreground"
           dangerouslySetInnerHTML={{ __html: t("invoice.rateLockInfo", { days: INVOICE_EXPIRY_HOURS / 24, hours: INVOICE_EXPIRY_HOURS }) }}
        />
      </div>

      {/* Submit */}
      <Button
        onClick={handleIssueInvoice}
        disabled={!canSubmit}
        className="w-full min-h-[48px] gap-2 font-display text-sm font-bold uppercase tracking-wider"
      >
        <Mail className="h-4 w-4" /> {t("invoice.issueInvoice")}
      </Button>

      {/* Asset Picker Overlay */}
      {showPicker && (
        <div className="absolute inset-0 z-50 flex flex-col rounded-2xl bg-background/98 p-4 backdrop-blur-xl border border-border">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-display text-sm font-bold text-foreground">{t("invoice.selectAsset")}</h4>
            <button onClick={() => setShowPicker(false)} className="rounded-full p-1.5 hover:bg-accent">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <Input
            placeholder={t("invoice.searchAssets")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-3 h-9 bg-accent/50 border-border text-sm"
            autoFocus
          />
          <div className="flex-1 overflow-y-auto space-y-1 max-h-[300px]">
            {filteredCurrencies.map((c) => (
              <button
                key={`${c.ticker}-${c.network}`}
                onClick={() => { setReceiveCurrency(c); setShowPicker(false); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent"
              >
                {c.image && <img src={c.image} alt="" className="h-5 w-5 rounded-full" />}
                <div className="min-w-0 flex-1">
                  <span className="font-display text-sm font-semibold text-foreground">{displayTicker(c)}</span>
                  {networkLabel(c) && <span className="ml-1.5 text-[9px] text-muted-foreground">{networkLabel(c)}</span>}
                  <div className="truncate text-[10px] text-muted-foreground">{c.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function mapTickerToCoinGeckoId(ticker: string): string {
  const map: Record<string, string> = {
    btc: "bitcoin", eth: "ethereum", sol: "solana", xrp: "ripple",
    usdt: "tether", usdttrc20: "tether", usdterc20: "tether", usdtbsc: "tether", usdtsol: "tether",
    usdc: "usd-coin", usdcsol: "usd-coin", usdcmatic: "usd-coin", usdcbsc: "usd-coin", usdcbase: "usd-coin",
    bnb: "binancecoin", ltc: "litecoin", trx: "tron", doge: "dogecoin",
    ada: "cardano", dot: "polkadot", avax: "avalanche-2", matic: "matic-network",
    link: "chainlink", uni: "uniswap", atom: "cosmos", near: "near",
    xmr: "monero", xlm: "stellar", algo: "algorand", ftm: "fantom",
  };
  return map[ticker.toLowerCase()] || ticker.toLowerCase();
}

export default InvoiceRequestTab;
