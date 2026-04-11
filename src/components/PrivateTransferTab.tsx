import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, Lock, Shield, CheckCircle2, ArrowDownUp, Copy, Check, Clock, AlertCircle, ExternalLink, QrCode, Mail, Search, ArrowLeft, RefreshCw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
import DestinationAddressInput, { tickerToAddressType } from "@/components/DestinationAddressInput";
import { supabase } from "@/integrations/supabase/client";
import {
  getCurrencies,
  getEstimate,
  getMinAmount,
  createTransaction,
  getTransactionStatus,
  type Currency,
  type TransactionResult,
  type TransactionStatus,
} from "@/lib/changenow";
import { useToast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/use-push-notifications";

const DISPLAY_TICKER_MAP: Record<string, string> = {
  usdterc20: "USDT", usdttrc20: "USDT", usdtbsc: "USDT", usdtsol: "USDT",
  usdtmatic: "USDT", usdtarc20: "USDT", usdtarb: "USDT", usdtop: "USDT",
  usdtton: "USDT", usdtcelo: "USDT", usdtapt: "USDT", usdtassethub: "USDT",
  usdcsol: "USDC", usdcmatic: "USDC", usdcbsc: "USDC", usdcarc20: "USDC",
  usdcop: "USDC", usdcarb: "USDC", usdcbase: "USDC", usdccelo: "USDC",
  usdcsui: "USDC", usdcapt: "USDC", usdcmon: "USDC", usdczksync: "USDC",
  usdcalgo: "USDC", ethbsc: "ETH", etharb: "ETH", ethop: "ETH",
  ethbase: "ETH", ethlna: "ETH", ethmanta: "ETH", bnbbsc: "BNB",
};

function displayTicker(c: { ticker: string }): string {
  return DISPLAY_TICKER_MAP[c.ticker.toLowerCase()] || c.ticker.toUpperCase();
}

const NETWORK_FRIENDLY_NAME: Record<string, string> = {
  "TRC20": "Tron", "ERC20": "Ethereum", "Binance Smart Chain": "BNB Chain",
  "SOL": "Solana", "Polygon": "Polygon", "AVAX C-CHAIN": "Avalanche",
  "Arbitrum One": "Arbitrum", "Optimism": "Optimism", "Base": "Base",
  "TON": "TON", "CELO": "Celo", "Aptos": "Aptos", "Sui": "Sui",
};

function networkLabel(c: { ticker: string; name: string }): string | null {
  const match = c.name.match(/\(([^)]+)\)/);
  if (match) return NETWORK_FRIENDLY_NAME[match[1]] || match[1];
  if (DISPLAY_TICKER_MAP[c.ticker.toLowerCase()]) {
    const raw = c.ticker.toLowerCase();
    const base = DISPLAY_TICKER_MAP[raw].toLowerCase();
    const suffix = raw.replace(base, "");
    return suffix ? suffix.toUpperCase() : null;
  }
  return null;
}

type Step = "form" | "address" | "deposit" | "status";

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  waiting: { label: "Waiting for deposit", color: "text-muted-foreground", icon: <Clock className="h-5 w-5" /> },
  confirming: { label: "Confirming transaction", color: "text-primary", icon: <Loader2 className="h-5 w-5 animate-spin" /> },
  exchanging: { label: "Processing through shielded route", color: "text-primary", icon: <Loader2 className="h-5 w-5 animate-spin" /> },
  sending: { label: "Sending to recipient", color: "text-trust", icon: <Loader2 className="h-5 w-5 animate-spin" /> },
  finished: { label: "Private transfer complete!", color: "text-trust", icon: <CheckCircle2 className="h-5 w-5" /> },
  failed: { label: "Transfer failed", color: "text-destructive", icon: <AlertCircle className="h-5 w-5" /> },
  refunded: { label: "Refunded", color: "text-muted-foreground", icon: <AlertCircle className="h-5 w-5" /> },
  overdue: { label: "Overdue", color: "text-destructive", icon: <AlertCircle className="h-5 w-5" /> },
};

const PrivateTransferTab = () => {
  const { toast } = useToast();
  const { subscribe: subscribePush, supported: pushSupported } = usePushNotifications();
  const pushSubscribedRef = useRef(false);

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [fromCurrency, setFromCurrency] = useState<Currency | null>(null);
  const [toCurrency, setToCurrency] = useState<Currency | null>(null);
  const [sendAmount, setSendAmount] = useState("1");
  const [estimatedAmount, setEstimatedAmount] = useState<string>("");
  const [minAmount, setMinAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [estimating, setEstimating] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const [step, setStep] = useState<Step>("form");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [addressValid, setAddressValid] = useState(false);
  const [extraId, setExtraId] = useState("");
  const [creatingTx, setCreatingTx] = useState(false);
  const [transaction, setTransaction] = useState<TransactionResult | null>(null);
  const [txStatus, setTxStatus] = useState<TransactionStatus | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [speedForecast, setSpeedForecast] = useState<string | null>(null);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const statusPollRef = useRef<ReturnType<typeof setInterval>>();

  // Rate lock
  const [rateLockSeconds, setRateLockSeconds] = useState(60);
  const [rateExpired, setRateExpired] = useState(false);
  const [refreshingRate, setRefreshingRate] = useState(false);
  const rateLockRef = useRef<ReturnType<typeof setInterval>>();

  const belowMin = minAmount > 0 && parseFloat(sendAmount) > 0 && parseFloat(sendAmount) < minAmount;

  // Load currencies
  useEffect(() => {
    getCurrencies()
      .then((data) => {
        if (Array.isArray(data)) {
          setCurrencies(data);
          setFromCurrency(data.find((c) => c.ticker === "btc") || data[0]);
          setToCurrency(data.find((c) => c.ticker === "eth") || data[1]);
        }
      })
      .catch(() => {
        toast({ title: "Connection issue", description: "Could not load currencies. Please refresh.", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, []);

  // Estimate — always fixed rate for private transfers
  const fetchEstimate = useCallback(async () => {
    if (!fromCurrency || !toCurrency || !sendAmount || parseFloat(sendAmount) <= 0) return;
    setEstimating(true);
    try {
      const est = await getEstimate(fromCurrency.ticker, toCurrency.ticker, sendAmount, true);
      setEstimatedAmount(est.estimatedAmount?.toString() || "—");
      if (est.transactionSpeedForecast) setSpeedForecast(est.transactionSpeedForecast);
    } catch {
      setEstimatedAmount("—");
      setSpeedForecast(null);
    }
    try {
      const min = await getMinAmount(fromCurrency.ticker, toCurrency.ticker, true);
      setMinAmount(min.minAmount || 0);
    } catch {
      setMinAmount(0);
    } finally {
      setEstimating(false);
    }
  }, [fromCurrency, toCurrency, sendAmount]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchEstimate, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [fetchEstimate]);

  // Poll status
  useEffect(() => {
    if (step === "status" && transaction?.id) {
      const poll = async () => {
        try {
          const status = await getTransactionStatus(transaction.id);
          setTxStatus(status);
          if (["finished", "failed", "refunded"].includes(status.status)) {
            if (statusPollRef.current) clearInterval(statusPollRef.current);
            if (status.status === "finished") {
              supabase.functions.invoke("send-push-notification", {
                method: "POST",
                body: { transaction_id: transaction.id, title: "Private Transfer Complete ✅", body: `Your shielded ${status.fromCurrency?.toUpperCase()} → ${status.toCurrency?.toUpperCase()} transfer is done!`, url: "/" },
              }).catch(console.error);
            }
          }
        } catch (err) {
          console.error("Status poll error:", err);
        }
      };
      poll();
      statusPollRef.current = setInterval(poll, 15000);
      if (pushSupported && !pushSubscribedRef.current) {
        pushSubscribedRef.current = true;
        subscribePush(transaction.id).catch(console.error);
      }
      return () => { if (statusPollRef.current) clearInterval(statusPollRef.current); };
    }
  }, [step, transaction?.id]);

  // Rate lock countdown
  useEffect(() => {
    if (step === "address" && addressValid) {
      setRateLockSeconds(60);
      setRateExpired(false);
      if (rateLockRef.current) clearInterval(rateLockRef.current);
      rateLockRef.current = setInterval(() => {
        setRateLockSeconds((prev) => {
          if (prev <= 1) { clearInterval(rateLockRef.current!); setRateExpired(true); return 0; }
          return prev - 1;
        });
      }, 1000);
      return () => { if (rateLockRef.current) clearInterval(rateLockRef.current); };
    } else if (step !== "address") {
      if (rateLockRef.current) clearInterval(rateLockRef.current);
    }
  }, [step, addressValid]);

  const handleRefreshRate = async () => {
    setRefreshingRate(true);
    try { await fetchEstimate(); } finally {
      setRefreshingRate(false);
      setRateLockSeconds(60);
      setRateExpired(false);
      if (rateLockRef.current) clearInterval(rateLockRef.current);
      rateLockRef.current = setInterval(() => {
        setRateLockSeconds((prev) => {
          if (prev <= 1) { clearInterval(rateLockRef.current!); setRateExpired(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleSwap = () => { setFromCurrency(toCurrency); setToCurrency(fromCurrency); };

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyButton = ({ text, label }: { text: string; label: string }) => (
    <button onClick={() => handleCopy(text, label)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" title="Copy">
      {copied === label ? <Check className="h-3.5 w-3.5 text-trust" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );

  const saveTransaction = async (tx: TransactionResult, recipientAddr: string) => {
    try {
      const stored = JSON.parse(localStorage.getItem("mrc_recent_txs") || "[]");
      stored.unshift({ id: tx.id, from: tx.fromCurrency, to: tx.toCurrency, amount: tx.amount, date: new Date().toISOString() });
      localStorage.setItem("mrc_recent_txs", JSON.stringify(stored.slice(0, 10)));
    } catch {}
    try {
      await supabase.from("swap_transactions").insert({
        transaction_id: tx.id,
        recipient_address: recipientAddr.trim().toLowerCase(),
        payin_address: (tx.payinAddress || "").trim().toLowerCase(),
        from_currency: tx.fromCurrency,
        to_currency: tx.toCurrency,
        amount: tx.amount,
      });
    } catch {}
  };

  const handleCreateTransaction = async () => {
    if (!fromCurrency || !toCurrency || !recipientAddress.trim()) return;
    setCreatingTx(true);
    try {
      const result = await createTransaction({
        from: fromCurrency.ticker,
        to: toCurrency.ticker,
        amount: parseFloat(sendAmount),
        address: recipientAddress.trim(),
        ...(extraId && { extraId }),
      });
      setTransaction(result);
      saveTransaction(result, recipientAddress);
      setStep("deposit");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction creation failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setCreatingTx(false);
    }
  };

  const handleNewTransfer = () => {
    setStep("form");
    setRecipientAddress("");
    setAddressValid(false);
    setExtraId("");
    setTransaction(null);
    setTxStatus(null);
    setNotifyEmail("");
    setEmailSubmitted(false);
  };

  const handleEmailSubscribe = async () => {
    if (!notifyEmail.trim() || !transaction?.id) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notifyEmail.trim())) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    setEmailSubmitting(true);
    try {
      await supabase.from("transfer_email_subscriptions").insert({ transaction_id: transaction.id, email: notifyEmail.trim() });
      setEmailSubmitted(true);
      toast({ title: "Subscribed", description: "You'll receive email updates for this transfer." });
    } catch {
      toast({ title: "Error", description: "Could not subscribe. Try again.", variant: "destructive" });
    } finally {
      setEmailSubmitting(false);
    }
  };

  // Sorted currencies
  const POPULAR_TICKERS = ["btc", "eth", "usdt", "usdttrc20", "sol", "xrp", "doge", "bnb", "ltc", "usdc", "trx"];
  const sortedCurrencies = [...currencies].sort((a, b) => {
    const ai = POPULAR_TICKERS.indexOf(a.ticker);
    const bi = POPULAR_TICKERS.indexOf(b.ticker);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.ticker.localeCompare(b.ticker);
  });

  const filteredCurrencies = sortedCurrencies.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
  });

  const CurrencyPicker = ({ show, onSelect, onClose, exclude }: { show: boolean; onSelect: (c: Currency) => void; onClose: () => void; exclude?: string }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={onClose}>
        <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-elevated" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2 border-b border-border p-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input autoFocus placeholder="Search currency..." className="flex-1 bg-transparent font-body text-sm text-foreground outline-none placeholder:text-muted-foreground" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <button onClick={() => { onClose(); setSearchQuery(""); }} className="font-body text-xs text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
          <div className="flex gap-2 border-b border-border px-4 pb-3">
            {["btc", "eth", "sol", "usdc"].map((ticker) => {
              const c = currencies.find((cur) => cur.ticker === ticker);
              if (!c) return null;
              return (
                <button key={ticker} onClick={() => { onSelect(c); onClose(); setSearchQuery(""); }} className="flex items-center gap-1.5 rounded-lg border border-border bg-accent px-3 py-1.5 font-display text-xs font-semibold uppercase text-foreground transition-colors hover:border-primary/40">
                  {c.image && <img src={c.image} alt="" className="h-4 w-4 rounded-full" />}
                  {ticker}
                </button>
              );
            })}
          </div>
          <div className="overflow-y-auto p-2" style={{ maxHeight: 350 }}>
            {filteredCurrencies.filter((c) => c.ticker !== exclude).slice(0, 50).map((c) => (
              <button key={c.ticker} onClick={() => { onSelect(c); onClose(); setSearchQuery(""); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent">
                {c.image ? <img src={c.image} alt="" className="h-6 w-6 rounded-full" loading="lazy" /> : <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent font-display text-xs font-bold uppercase">{c.ticker[0]}</div>}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-sm font-semibold uppercase text-foreground">{displayTicker(c)}</span>
                    {networkLabel(c) && <span className="rounded bg-accent px-1.5 py-0.5 font-body text-[9px] uppercase text-muted-foreground">{networkLabel(c)}</span>}
                  </div>
                  <span className="block truncate font-body text-xs text-muted-foreground">{c.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground animate-pulse">Loading currencies…</span>
      </div>
    );
  }

  // ===== FORM STEP =====
  if (step === "form") {
    return (
      <div>
        {/* Privacy banner */}
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/[0.06] p-3.5">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-display text-sm font-semibold text-foreground">Shielded Routing Active</p>
            <p className="mt-0.5 font-body text-xs text-muted-foreground leading-relaxed">
              Send crypto without exposing your wallet or transaction history. Professional, shielded routing for every transfer.
            </p>
          </div>
        </div>

        {/* Trustpilot badge */}
        <div className="mb-4 flex items-center justify-center gap-2 rounded-lg border border-border bg-accent/50 px-3 py-2">
          <span className="font-body text-xs font-semibold text-foreground">★★★★★</span>
          <span className="font-body text-[11px] text-muted-foreground">4.6 on Trustpilot</span>
          <span className="text-[10px] text-muted-foreground">|</span>
          <span className="flex items-center gap-1 font-body text-[10px] text-trust"><Lock className="h-3 w-3" /> Fixed-Rate Guaranteed</span>
        </div>

        {/* Popular assets */}
        <div className="mb-4 flex items-center gap-2">
          <span className="font-body text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Popular:</span>
          {["btc", "eth", "usdt", "sol"].map((ticker) => {
            const c = currencies.find((cur) => cur.ticker === ticker);
            if (!c) return null;
            return (
              <button key={ticker} onClick={() => setFromCurrency(c)} className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-display text-xs font-semibold uppercase transition-colors ${fromCurrency?.ticker === ticker ? "border-primary bg-primary/10 text-primary" : "border-border bg-accent text-foreground hover:border-primary/40"}`}>
                {c.image && <img src={c.image} alt="" className="h-4 w-4 rounded-full" />}
                {ticker}
              </button>
            );
          })}
        </div>

        {/* You Send */}
        <div className="relative">
          <label className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">You Send</label>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-accent p-4">
            <Input type="number" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} className="flex-1 border-none bg-transparent p-0 font-display text-2xl font-bold text-foreground shadow-none focus-visible:ring-0" min={0} step="any" />
            <button onClick={() => setShowFromPicker(true)} className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5 transition-colors hover:bg-primary/20">
              {fromCurrency?.image && <img src={fromCurrency.image} alt="" className="h-5 w-5 rounded-full" />}
              <span className="font-display text-sm font-semibold uppercase text-primary">{fromCurrency ? displayTicker(fromCurrency) : "Select"}</span>
              {fromCurrency && networkLabel(fromCurrency) && <span className="rounded bg-primary/20 px-1 py-0.5 font-body text-[9px] uppercase text-primary">{networkLabel(fromCurrency)}</span>}
            </button>
          </div>
          {belowMin && <p className="mt-1 font-body text-xs text-destructive">Minimum amount: {minAmount} {fromCurrency ? displayTicker(fromCurrency) : ""}</p>}
          <CurrencyPicker show={showFromPicker} onSelect={setFromCurrency} onClose={() => setShowFromPicker(false)} exclude={toCurrency?.ticker} />
        </div>

        {/* Rate info */}
        <div className="my-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 rounded-md border border-trust/20 bg-trust/5 px-2 py-1 font-body text-[10px] font-medium text-trust">
              <Lock className="h-3 w-3" /> Fixed rate locked
            </span>
            {fromCurrency && toCurrency && estimatedAmount && estimatedAmount !== "—" && parseFloat(sendAmount) > 0 && (
              <span className="font-body text-[10px] text-muted-foreground">
                1 {displayTicker(fromCurrency)} ≈ {(parseFloat(estimatedAmount) / parseFloat(sendAmount)).toFixed(6)} {displayTicker(toCurrency)}
              </span>
            )}
          </div>
          <button onClick={handleSwap} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-primary transition-colors hover:bg-accent" aria-label="Swap currencies">
            <ArrowDownUp className="h-4 w-4" />
          </button>
        </div>

        {/* Recipient Gets */}
        <div className="relative">
          <label className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Recipient Gets <span className="text-trust font-bold">(GUARANTEED)</span>
          </label>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-accent p-4">
            <span className="flex-1 font-display text-2xl font-bold text-foreground">
              {estimating ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : `≈ ${estimatedAmount || "—"}`}
            </span>
            <button onClick={() => setShowToPicker(true)} className="flex items-center gap-2 rounded-lg bg-trust/10 px-4 py-2.5 transition-colors hover:bg-trust/20">
              {toCurrency?.image && <img src={toCurrency.image} alt="" className="h-5 w-5 rounded-full" />}
              <span className="font-display text-sm font-semibold uppercase text-trust">{toCurrency ? displayTicker(toCurrency) : "Select"}</span>
              {toCurrency && networkLabel(toCurrency) && <span className="rounded bg-trust/20 px-1 py-0.5 font-body text-[9px] uppercase text-trust">{networkLabel(toCurrency)}</span>}
            </button>
          </div>
          <CurrencyPicker show={showToPicker} onSelect={setToCurrency} onClose={() => setShowToPicker(false)} exclude={fromCurrency?.ticker} />
        </div>

        {/* Recipient wallet address */}
        <div className="mt-4">
          <label className="mb-1.5 flex items-center gap-1.5 font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Shield className="h-3 w-3" /> Recipient Wallet Address
          </label>
          <DestinationAddressInput
            value={recipientAddress}
            onChange={setRecipientAddress}
            onValidChange={setAddressValid}
            currencyTicker={toCurrency?.ticker}
            expectedNetworkType={toCurrency ? tickerToAddressType(toCurrency.ticker?.toLowerCase(), toCurrency.network?.toLowerCase()) : undefined}
          />
        </div>

        {/* CTA */}
        <Button
          className="mt-5 w-full min-h-[52px] rounded-xl text-base font-bold tracking-wide transition-all duration-300 hover:shadow-neon shadow-card"
          size="lg"
          style={{
            background: "linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(var(--primary)) 100%)",
            color: "hsl(var(--primary-foreground))",
          }}
          disabled={!estimatedAmount || estimatedAmount === "—" || belowMin || !addressValid}
          onClick={() => setStep("address")}
        >
          <Shield className="mr-2 h-4 w-4" /> Start Private Transfer
        </Button>

        {/* Trust signals */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-accent/50 p-2.5 text-center">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-body text-[10px] font-medium text-muted-foreground">Shielded Route</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-accent/50 p-2.5 text-center">
            <Lock className="h-4 w-4 text-primary" />
            <span className="font-body text-[10px] font-medium text-muted-foreground">Fixed Rate</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-accent/50 p-2.5 text-center">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="font-body text-[10px] font-medium text-muted-foreground">No Trail</span>
          </div>
        </div>
        <p className="mt-2 text-center font-body text-xs text-muted-foreground">
          No hidden fees · No account required · Permissionless
        </p>
      </div>
    );
  }

  // ===== ADDRESS CONFIRMATION STEP =====
  if (step === "address") {
    return (
      <motion.div key="pt-address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
        <button onClick={() => setStep("form")} className="mb-4 flex items-center gap-1.5 font-body text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h2 className="mb-2 font-display text-lg font-semibold text-foreground">Confirm Private Transfer</h2>
        <p className="mb-4 font-body text-sm text-muted-foreground">
          Review your shielded transfer details before proceeding.
        </p>

        <div className="rounded-xl border border-border bg-accent/40 p-4 space-y-3">
          <div className="flex justify-between font-body text-sm"><span className="text-muted-foreground">You send</span><span className="font-semibold text-foreground">{sendAmount} {fromCurrency ? displayTicker(fromCurrency) : ""}</span></div>
          <div className="flex justify-between font-body text-sm"><span className="text-muted-foreground">Recipient gets (guaranteed)</span><span className="font-semibold text-trust">≈ {estimatedAmount} {toCurrency ? displayTicker(toCurrency) : ""}</span></div>
          <div className="border-t border-border pt-2"><div className="flex items-start justify-between font-body text-xs"><span className="text-muted-foreground">Recipient address</span><span className="max-w-[200px] break-all text-right font-mono text-foreground">{recipientAddress}</span></div></div>
        </div>

        {/* Rate lock */}
        {!rateExpired ? (
          <div className="mt-3 flex items-center justify-center gap-2 font-body text-xs text-muted-foreground">
            <Lock className="h-3 w-3 text-trust" />
            Rate locked for <span className="font-semibold text-trust">{rateLockSeconds}s</span>
          </div>
        ) : (
          <div className="mt-3 flex flex-col items-center gap-2">
            <p className="font-body text-xs text-destructive">Rate expired. Please refresh.</p>
            <Button variant="outline" size="sm" onClick={handleRefreshRate} disabled={refreshingRate}>
              {refreshingRate ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1.5 h-3.5 w-3.5" />}
              Refresh Rate
            </Button>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Shield className="h-4 w-4 shrink-0 text-primary" />
          <p className="font-body text-[11px] text-muted-foreground">
            Your transfer will be routed through a liquidity pool to shield the sender's wallet address from the recipient's transaction history.
          </p>
        </div>

        <Button
          className="mt-5 w-full min-h-[52px]"
          size="lg"
          disabled={creatingTx || rateExpired}
          onClick={handleCreateTransaction}
        >
          {creatingTx ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating transfer…</> : <><Lock className="mr-2 h-4 w-4" />Confirm & Generate Deposit Address</>}
        </Button>
      </motion.div>
    );
  }

  // ===== DEPOSIT STEP =====
  if (step === "deposit" && transaction) {
    return (
      <motion.div key="pt-deposit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10"><Shield className="h-4 w-4 text-primary" /></div>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">Deposit to Shielded Address</h3>
            <p className="font-body text-[11px] text-muted-foreground">Send exactly <span className="font-semibold text-foreground">{transaction.amount} {transaction.fromCurrency?.toUpperCase()}</span> to the address below</p>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <div className="rounded-xl border border-border bg-background p-3">
            <QRCodeSVG value={transaction.payinAddress} size={160} />
          </div>
        </div>

        <div className="font-body text-sm">
          <span className="text-muted-foreground">Shielded deposit address</span>
          <div className="mt-1 flex items-center gap-2">
            <code className="flex-1 break-all rounded-lg border border-border bg-background px-3 py-2 font-body text-xs text-foreground">{transaction.payinAddress}</code>
            <CopyButton text={transaction.payinAddress} label="payin" />
          </div>
        </div>
        {transaction.payinExtraId && (
          <div className="mt-3 font-body text-sm">
            <span className="text-muted-foreground">Extra ID / Memo</span>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 break-all rounded-lg border border-border bg-background px-3 py-2 font-body text-xs text-foreground">{transaction.payinExtraId}</code>
              <CopyButton text={transaction.payinExtraId} label="extra-id" />
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Shield className="h-4 w-4 shrink-0 text-primary" />
          <p className="font-body text-[11px] text-muted-foreground">
            Funds deposited here will be routed through shielded liquidity pools, masking your original wallet address before delivery to the recipient.
          </p>
        </div>

        {/* Email notification */}
        {!emailSubmitted ? (
          <div className="mt-4 space-y-2">
            <label className="font-body text-xs font-medium text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> Get notified when complete</label>
            <div className="flex gap-2">
              <Input type="email" placeholder="your@email.com" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} className="flex-1 font-body text-sm" />
              <Button size="sm" onClick={handleEmailSubscribe} disabled={emailSubmitting || !notifyEmail.trim()}>
                {emailSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Notify Me"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2 font-body text-xs text-trust"><CheckCircle2 className="h-4 w-4" /> You'll be notified at {notifyEmail}</div>
        )}

        <Button className="mt-5 w-full min-h-[48px]" size="lg" onClick={() => { setStep("status"); }}>
          I've Sent the Deposit →
        </Button>
      </motion.div>
    );
  }

  // ===== STATUS STEP =====
  if (step === "status" && transaction) {
    const statusInfo = STATUS_LABELS[txStatus?.status || "waiting"] || STATUS_LABELS.waiting;
    return (
      <motion.div key="pt-status" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
        <div className="mb-4 flex flex-col items-center gap-3 text-center">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${txStatus?.status === "finished" ? "bg-trust/10" : txStatus?.status === "failed" ? "bg-destructive/10" : "bg-primary/10"}`}>
            <span className={statusInfo.color}>{statusInfo.icon}</span>
          </div>
          <div>
            <h3 className={`font-display text-lg font-bold ${statusInfo.color}`}>{statusInfo.label}</h3>
            <p className="mt-1 font-body text-xs text-muted-foreground">Transfer ID: {transaction.id}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-accent/40 p-4 space-y-3">
          <div className="flex justify-between font-body text-sm"><span className="text-muted-foreground">Sending</span><span className="font-semibold">{txStatus?.amountSend || transaction.amount} {transaction.fromCurrency?.toUpperCase()}</span></div>
          {txStatus?.amountReceive && <div className="flex justify-between font-body text-sm"><span className="text-muted-foreground">Recipient receives</span><span className="font-semibold text-trust">{txStatus.amountReceive} {transaction.toCurrency?.toUpperCase()}</span></div>}
          {txStatus?.payinHash && (
            <div className="border-t border-border pt-2"><span className="font-body text-xs text-muted-foreground">Deposit hash</span><div className="mt-1 flex items-center gap-2"><code className="flex-1 break-all rounded-lg border border-border bg-background px-3 py-2 font-body text-xs">{txStatus.payinHash}</code><CopyButton text={txStatus.payinHash} label="payin-hash" /></div></div>
          )}
          {txStatus?.payoutHash && (
            <div><span className="font-body text-xs text-muted-foreground">Payout hash</span><div className="mt-1 flex items-center gap-2"><code className="flex-1 break-all rounded-lg border border-border bg-background px-3 py-2 font-body text-xs">{txStatus.payoutHash}</code><CopyButton text={txStatus.payoutHash} label="payout-hash" /></div></div>
          )}
        </div>

        {txStatus?.status === "finished" && (
          <div className="mt-6 space-y-3">
            <div className="flex flex-col items-center gap-2 rounded-xl border border-primary/20 bg-primary/[0.06] p-4 text-center">
              <span className="text-sm font-medium text-foreground">How was your experience?</span>
              <a href="https://www.trustpilot.com/evaluate/mrcglobalpay.com" target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-2 rounded-lg bg-[#00b67a] px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90">
                Leave us a review ⭐
              </a>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 bg-trust text-trust-foreground hover:bg-trust/90" size="lg" onClick={handleNewTransfer}>New Transfer</Button>
              {typeof navigator !== "undefined" && !!navigator.share && (
                <Button variant="outline" size="lg" className="shrink-0" onClick={async () => {
                  try { await navigator.share({ title: "Private Transfer Complete — MRC GlobalPay", text: `Shielded ${txStatus.fromCurrency?.toUpperCase()} → ${txStatus.toCurrency?.toUpperCase()} transfer completed on MRC GlobalPay.`, url: "https://mrcglobalpay.com/private-transfer" }); } catch {}
                }}>
                  <Share2 className="h-4 w-4 mr-1.5" /> Share
                </Button>
              )}
            </div>
          </div>
        )}
        {txStatus?.status === "failed" && (
          <Button className="mt-6 w-full" size="lg" variant="destructive" onClick={handleNewTransfer}>Try Again</Button>
        )}
        {!["finished", "failed", "refunded"].includes(txStatus?.status || "") && (
          <p className="mt-4 text-center font-body text-xs text-muted-foreground">Status refreshes automatically every 15 seconds</p>
        )}
      </motion.div>
    );
  }

  return null;
};

export default PrivateTransferTab;
