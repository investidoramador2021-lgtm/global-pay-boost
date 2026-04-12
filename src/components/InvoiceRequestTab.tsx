import { useState, useEffect, useRef, useMemo } from "react";
import { Loader2, ChevronDown, X, Copy, Check, FileText, Mail, Clock, Lock, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DestinationAddressInput, { tickerToAddressType } from "@/components/DestinationAddressInput";
import {
  getCurrencies,
  getEstimate,
  getMinAmount,
  type Currency,
} from "@/lib/changenow";

const POPULAR_TICKERS = ["btc", "eth", "usdt", "usdttrc20", "sol", "xrp", "usdc", "bnb", "ltc", "trx"];

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

const InvoiceRequestTab = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [payerName, setPayerName] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [receiveCurrency, setReceiveCurrency] = useState<Currency | null>(null);
  const [receiveAmount, setReceiveAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [addressValid, setAddressValid] = useState(false);
  const [requesterEmail, setRequesterEmail] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Generated invoice state
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [invoiceId, setInvoiceId] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCurrencies().then((data) => {
      if (cancelled || !Array.isArray(data)) return;
      setCurrencies(data);
      const btc = data.find((c) => c.ticker === "btc");
      if (btc) setReceiveCurrency(btc);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) return currencies.slice(0, 50);
    const q = searchQuery.toLowerCase();
    return currencies.filter(
      (c) => c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [currencies, searchQuery]);

  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const canSubmit = payerName.trim() && requesterName.trim() && receiveCurrency
    && parseFloat(receiveAmount) > 0 && walletAddress.trim() && addressValid
    && isEmailValid(requesterEmail) && isEmailValid(payerEmail);

  const handleIssueInvoice = () => {
    if (!canSubmit) return;
    const id = `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    setInvoiceId(id);
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
    setReceiveAmount("");
    setRequesterEmail("");
    setPayerEmail("");
  };

  if (loading) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="font-body text-sm text-muted-foreground">Loading assets…</span>
      </div>
    );
  }

  if (invoiceGenerated) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-trust/30 bg-trust/5 p-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-trust/20">
            <Check className="h-6 w-6 text-trust" />
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">Invoice Issued</h3>
          <p className="mt-1 font-body text-xs text-muted-foreground">
            A professional invoice has been sent to <span className="font-semibold text-foreground">{payerEmail}</span>
          </p>
        </div>

        <div className="rounded-xl border border-border bg-accent/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">Invoice ID</span>
            <span className="font-mono text-xs font-semibold text-foreground">{invoiceId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">Amount</span>
            <span className="font-display text-sm font-bold text-foreground">{receiveAmount} {receiveCurrency && displayTicker(receiveCurrency)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">Payer</span>
            <span className="font-body text-xs text-foreground">{payerName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">Expires</span>
            <span className="font-body text-xs text-amber-400 flex items-center gap-1"><Clock className="h-3 w-3" /> 7 Days</span>
          </div>
        </div>

        <Button onClick={handleCopyLink} variant="outline" className="w-full gap-2">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy Invoice Link"}
        </Button>

        <Button onClick={handleNewInvoice} className="w-full gap-2">
          <FileText className="h-4 w-4" /> Create Another Invoice
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
          <h3 className="font-display text-sm font-bold text-foreground">Professional Invoice</h3>
          <p className="font-body text-[10px] text-muted-foreground">Request crypto payments with locked rates</p>
        </div>
      </div>

      {/* Identity Fields */}
      <div className="space-y-2">
        <div>
          <label className="mb-1 block font-body text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Payer / Company Name <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="Enter payer or company name"
            value={payerName}
            onChange={(e) => setPayerName(e.target.value)}
            className="h-10 bg-accent/50 border-border font-body text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block font-body text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Your Name / Company <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="Enter your name or company"
            value={requesterName}
            onChange={(e) => setRequesterName(e.target.value)}
            className="h-10 bg-accent/50 border-border font-body text-sm"
          />
        </div>
      </div>

      {/* Amount & Asset */}
      <div>
        <label className="mb-1 block font-body text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          You Receive <span className="text-destructive">*</span>
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setShowPicker(true); setSearchQuery(""); }}
            className="flex min-w-[120px] shrink-0 items-center gap-2 rounded-lg border border-border bg-accent/50 px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            {receiveCurrency?.image && (
              <img src={receiveCurrency.image} alt="" className="h-5 w-5 rounded-full" />
            )}
            <span>{receiveCurrency ? displayTicker(receiveCurrency) : "Select"}</span>
            {receiveCurrency && networkLabel(receiveCurrency) && (
              <span className="text-[9px] text-muted-foreground">{networkLabel(receiveCurrency)}</span>
            )}
            <ChevronDown className="h-3.5 w-3.5 ml-auto opacity-60" />
          </button>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={receiveAmount}
            onChange={(e) => setReceiveAmount(e.target.value.replace(/[^\d.]/g, ""))}
            className="h-10 bg-accent/50 border-border font-display text-lg font-bold text-right"
          />
        </div>
      </div>

      {/* Wallet Address */}
      <div>
        <label className="mb-1 block font-body text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Your Wallet Address <span className="text-destructive">*</span>
        </label>
        <DestinationAddressInput
          value={walletAddress}
          onChange={setWalletAddress}
          onValidChange={setAddressValid}
          currencyTicker={receiveCurrency?.ticker}
        />
      </div>

      {/* Emails */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block font-body text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Your Email <span className="text-destructive">*</span>
          </label>
          <Input
            type="email"
            placeholder="you@email.com"
            value={requesterEmail}
            onChange={(e) => setRequesterEmail(e.target.value)}
            className="h-10 bg-accent/50 border-border font-body text-xs"
          />
        </div>
        <div>
          <label className="mb-1 block font-body text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Payer Email <span className="text-destructive">*</span>
          </label>
          <Input
            type="email"
            placeholder="payer@email.com"
            value={payerEmail}
            onChange={(e) => setPayerEmail(e.target.value)}
            className="h-10 bg-accent/50 border-border font-body text-xs"
          />
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <p className="font-body text-[10px] leading-relaxed text-muted-foreground">
          The receive amount is <span className="font-semibold text-foreground">locked</span>. Your client selects their payment asset and we handle the conversion. Invoice expires in <span className="font-semibold text-foreground">7 days</span>.
        </p>
      </div>

      {/* Submit */}
      <Button
        onClick={handleIssueInvoice}
        disabled={!canSubmit}
        className="w-full min-h-[48px] gap-2 font-display text-sm font-bold uppercase tracking-wider"
      >
        <Mail className="h-4 w-4" /> Issue Professional Invoice
      </Button>

      {/* Asset Picker Overlay */}
      {showPicker && (
        <div className="absolute inset-0 z-50 flex flex-col rounded-2xl bg-background/98 p-4 backdrop-blur-xl border border-border">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-display text-sm font-bold text-foreground">Select Receive Asset</h4>
            <button onClick={() => setShowPicker(false)} className="rounded-full p-1.5 hover:bg-accent">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <Input
            placeholder="Search assets…"
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

export default InvoiceRequestTab;
