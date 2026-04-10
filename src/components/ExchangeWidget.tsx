import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownUp, Loader2, Search, Copy, Check, ArrowLeft, ArrowRight, ArrowLeftRight, Clock, CheckCircle2, AlertCircle, ExternalLink, Wallet, QrCode, XCircle, Info, Mail, RefreshCw, Shield, Lock, ChevronDown, Share2, CreditCard, Repeat } from "lucide-react";
import DestinationAddressInput, { tickerToAddressType } from "@/components/DestinationAddressInput";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
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
import {
  getGuardarianCurrencies,
  getGuardarianEstimate,
  getGuardarianMinMax,
  getGuardarianPartnerToken,
  createGuardarianTransaction,
  createGuardarianSellTransaction,
  getGuardarianPaymentMethods,
  type GuardarianCurrency,
  type GuardarianEstimate,
  type GuardarianPaymentMethod,
} from "@/lib/guardarian";
import { useToast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/use-push-notifications";

const POPULAR_TICKERS = ["btc", "eth", "usdt", "usdttrc20", "sol", "xrp", "doge", "bnb", "ltc", "usdc", "trx"];

// Fiat currency → country code for flag images
const FIAT_TO_COUNTRY: Record<string, string> = {
  USD: "us", EUR: "eu", GBP: "gb", CAD: "ca", AUD: "au", JPY: "jp", CHF: "ch",
  NOK: "no", SEK: "se", DKK: "dk", NZD: "nz", BRL: "br", ARS: "ar", MXN: "mx",
  COP: "co", CLP: "cl", PEN: "pe", AED: "ae", SAR: "sa", QAR: "qa", KWD: "kw",
  BHD: "bh", OMR: "om", TRY: "tr", ZAR: "za", NGN: "ng", KES: "ke", GHS: "gh",
  EGP: "eg", MAD: "ma", TND: "tn", INR: "in", PKR: "pk", BDT: "bd", LKR: "lk",
  IDR: "id", MYR: "my", THB: "th", VND: "vn", PHP: "ph", SGD: "sg", HKD: "hk",
  TWD: "tw", KRW: "kr", CNY: "cn", ILS: "il", PLN: "pl", CZK: "cz", HUF: "hu",
  RON: "ro", BGN: "bg", HRK: "hr", RSD: "rs", UAH: "ua", GEL: "ge", KZT: "kz",
  UZS: "uz", RUB: "ru", ISK: "is", JOD: "jo", BWP: "bw", MUR: "mu", UGX: "ug",
  TZS: "tz", XOF: "sn", XAF: "cm", DOP: "do", CRC: "cr", GTQ: "gt", BOB: "bo",
  PYG: "py", UYU: "uy", VES: "ve", JMD: "jm", TTD: "tt", BBD: "bb", BSD: "bs",
  BZD: "bz", GYD: "gy", SRD: "sr", FJD: "fj", TOP: "to", WST: "ws", PGK: "pg",
  MVR: "mv", NPR: "np", MMK: "mm", KHR: "kh", LAK: "la", BND: "bn", MNT: "mn",
  AFN: "af", IRR: "ir", IQD: "iq", SYP: "sy", LBP: "lb", LYD: "ly", SDG: "sd",
  ETB: "et", AOA: "ao", MZN: "mz", ZMW: "zm", ZWL: "zw", MWK: "mw", RWF: "rw",
  BIF: "bi", DJF: "dj", ERN: "er", SOS: "so", GMD: "gm", SLL: "sl", GNF: "gn",
  LRD: "lr", CVE: "cv", STN: "st", KMF: "km", SCR: "sc", MGA: "mg", LSL: "ls",
  SZL: "sz", NAD: "na", CDF: "cd", XPF: "pf", ALL: "al", MKD: "mk", BAM: "ba",
  MDL: "md", GIP: "gi", FKP: "fk", SHP: "sh", AWG: "aw", ANG: "an", HTG: "ht",
  PAB: "pa", NIO: "ni", HNL: "hn", SVC: "sv", CUP: "cu", BMD: "bm", KYD: "ky",
};

function fiatFlagUrl(ticker: string): string {
  const code = FIAT_TO_COUNTRY[ticker.toUpperCase()];
  if (!code) return "";
  return `https://flagcdn.com/w40/${code}.png`;
}

function guardarianLogoUrl(c: GuardarianCurrency): string {
  const raw = c.networks?.[0]?.logo_url || "";
  if (!raw) return "";
  if (raw.startsWith("http")) return raw;
  return `https://guardarian.com${raw}`;
}

const ProviderMark = ({ letter, tone = "primary" }: { letter: string; tone?: "primary" | "muted" }) => (
  <div
    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border font-display text-sm font-black uppercase shadow-card ${
      tone === "primary"
        ? "border-primary/20 bg-primary/10 text-primary"
        : "border-border bg-accent text-foreground"
    }`}
    aria-hidden="true"
  >
    {letter}
  </div>
);

const PaymentMethodChip = ({ label, accent = false }: { label: string; accent?: boolean }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-1 font-body text-[10px] font-semibold tracking-wide ${
      accent
        ? "border-primary/20 bg-primary/10 text-primary"
        : "border-border bg-background/80 text-muted-foreground"
    }`}
  >
    {label}
  </span>
);

const GuardarianAssetIcon = ({ currency, small = false }: { currency: GuardarianCurrency; small?: boolean }) => {
  const logo = guardarianLogoUrl(currency);
  const [failed, setFailed] = useState(!logo);

  useEffect(() => {
    setFailed(!logo);
  }, [logo]);

  const sizeClass = small ? "h-4 w-4 text-[9px]" : "h-5 w-5 text-[10px]";

  if (failed || !logo) {
    return (
      <div className={`flex ${sizeClass} items-center justify-center rounded-full bg-accent font-display font-bold uppercase text-foreground`}>
        {currency.ticker.slice(0, 1)}
      </div>
    );
  }

  return (
    <img
      src={logo}
      alt={currency.name}
      className={`${sizeClass} rounded-full object-cover`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

// Display-friendly ticker: strips network suffixes so users see "USDT" not "usdttrc20"
const DISPLAY_TICKER_MAP: Record<string, string> = {
  usdterc20: "USDT",
  usdttrc20: "USDT",
  usdtbsc: "USDT",
  usdtsol: "USDT",
  usdtmatic: "USDT",
  usdtarc20: "USDT",
  usdtarb: "USDT",
  usdtop: "USDT",
  usdtton: "USDT",
  usdtcelo: "USDT",
  usdtapt: "USDT",
  usdtassethub: "USDT",
  usdcsol: "USDC",
  usdcmatic: "USDC",
  usdcbsc: "USDC",
  usdcarc20: "USDC",
  usdcop: "USDC",
  usdcarb: "USDC",
  usdcbase: "USDC",
  usdccelo: "USDC",
  usdcsui: "USDC",
  usdcapt: "USDC",
  usdcmon: "USDC",
  usdczksync: "USDC",
  usdcalgo: "USDC",
  ethbsc: "ETH",
  etharb: "ETH",
  ethop: "ETH",
  ethbase: "ETH",
  ethlna: "ETH",
  ethmanta: "ETH",
  bnbbsc: "BNB",
};

function displayTicker(c: { ticker: string; name?: string }): string {
  return DISPLAY_TICKER_MAP[c.ticker.toLowerCase()] || c.ticker.toUpperCase();
}

// Map short network codes to user-friendly blockchain names
const NETWORK_FRIENDLY_NAME: Record<string, string> = {
  "TRC20": "Tron",
  "ERC20": "Ethereum",
  "Binance Smart Chain": "BNB Chain",
  "SOL": "Solana",
  "Polygon": "Polygon",
  "AVAX C-CHAIN": "Avalanche",
  "Arbitrum One": "Arbitrum",
  "Optimism": "Optimism",
  "Base": "Base",
  "TON": "TON",
  "CELO": "Celo",
  "Aptos": "Aptos",
  "Sui": "Sui",
  "Linea": "Linea",
  "Manta": "Manta",
  "ZkSync Era": "zkSync",
  "Algorand": "Algorand",
  "Assethub": "Polkadot",
  "Monad": "Monad",
  "HyperEVM": "Hyperliquid",
};

function networkLabel(c: { ticker: string; name: string }): string | null {
  // Extract network from name in parentheses, e.g. "Tether (TRC20)" → "TRC20"
  const match = c.name.match(/\(([^)]+)\)/);
  if (match) {
    return NETWORK_FRIENDLY_NAME[match[1]] || match[1];
  }
  // If display ticker differs from raw ticker, there's a network suffix but no parenthetical
  if (DISPLAY_TICKER_MAP[c.ticker.toLowerCase()]) {
    const raw = c.ticker.toLowerCase();
    const base = DISPLAY_TICKER_MAP[raw].toLowerCase();
    const suffix = raw.replace(base, "");
    return suffix ? suffix.toUpperCase() : null;
  }
  return null;
}

type Step = "exchange" | "address" | "deposit" | "status";

// Chain detection helpers
const EVM_NETWORKS = ["eth", "bsc", "matic", "avax", "arb", "op", "base", "celo", "ftm", "one", "glmr", "movr"];
const SOLANA_NETWORKS = ["sol"];

function getChainType(currency: Currency | null): "evm" | "solana" | "other" {
  if (!currency) return "other";
  const network = currency.network?.toLowerCase() || "";
  const ticker = currency.ticker?.toLowerCase() || "";
  if (EVM_NETWORKS.includes(network) || ["eth", "bnb", "matic", "avax", "usdt", "usdc", "dai", "wbtc", "link", "uni", "aave", "hype", "bera"].includes(ticker)) return "evm";
  if (SOLANA_NETWORKS.includes(network) || ticker === "sol") return "solana";
  return "other";
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  waiting: { label: "Waiting for deposit", color: "text-muted-foreground", icon: <Clock className="h-5 w-5" /> },
  confirming: { label: "Confirming transaction", color: "text-primary", icon: <Loader2 className="h-5 w-5 animate-spin" /> },
  exchanging: { label: "Exchanging", color: "text-primary", icon: <Loader2 className="h-5 w-5 animate-spin" /> },
  sending: { label: "Sending to your wallet", color: "text-trust", icon: <Loader2 className="h-5 w-5 animate-spin" /> },
  finished: { label: "Exchange complete!", color: "text-trust", icon: <CheckCircle2 className="h-5 w-5" /> },
  failed: { label: "Exchange failed", color: "text-destructive", icon: <AlertCircle className="h-5 w-5" /> },
  refunded: { label: "Refunded", color: "text-muted-foreground", icon: <AlertCircle className="h-5 w-5" /> },
  overdue: { label: "Overdue", color: "text-destructive", icon: <AlertCircle className="h-5 w-5" /> },
};

const ExchangeWidget = () => {
  const { toast } = useToast();
  const { subscribe: subscribePush, supported: pushSupported } = usePushNotifications();
  const pushSubscribedRef = useRef(false);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [fromCurrency, setFromCurrency] = useState<Currency | null>(null);
  const [toCurrency, setToCurrency] = useState<Currency | null>(null);
  const [sendAmount, setSendAmount] = useState("1");
  const [estimatedAmount, setEstimatedAmount] = useState<string>("");
  const [minAmount, setMinAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // ===== Dual-tab mode: "exchange" (ChangeNOW) vs "buysell" (Guardarian) =====
  type WidgetMode = "exchange" | "buysell";
  type FiatFlow = "buy" | "sell";
  const [widgetMode, setWidgetMode] = useState<WidgetMode>("exchange");
  const [gTradeDirection, setGTradeDirection] = useState<FiatFlow>("buy");
  const [guardarianFiat, setGuardarianFiat] = useState<GuardarianCurrency[]>([]);
  const [guardarianCrypto, setGuardarianCrypto] = useState<GuardarianCurrency[]>([]);
  const [guardarianLoading, setGuardarianLoading] = useState(false);
  const [guardarianLoaded, setGuardarianLoaded] = useState(false);
  const [gFromCurrency, setGFromCurrency] = useState<GuardarianCurrency | null>(null);
  const [gToCurrency, setGToCurrency] = useState<GuardarianCurrency | null>(null);
  const [gSendAmount, setGSendAmount] = useState("100");
  const [gEstimatedAmount, setGEstimatedAmount] = useState<string>("");
  const [gEstimating, setGEstimating] = useState(false);
  const [gMinAmount, setGMinAmount] = useState<number>(0);
  const [gMaxAmount, setGMaxAmount] = useState<number>(999999);
  const gDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [gShowFromPicker, setGShowFromPicker] = useState(false);
  const [gShowToPicker, setGShowToPicker] = useState(false);
  const [gSearchQuery, setGSearchQuery] = useState("");
  type BuySellStep = "form" | "compare" | "checkout";
  const [gStep, setGStep] = useState<BuySellStep>("form");
  const [gFullEstimate, setGFullEstimate] = useState<GuardarianEstimate | null>(null);
  const [gPayoutAddress, setGPayoutAddress] = useState("");
  const [gPayoutEmail, setGPayoutEmail] = useState("");
  const [gCreatingTx, setGCreatingTx] = useState(false);
  const [gCheckoutUrl, setGCheckoutUrl] = useState("");
  const [gSelectedProvider, setGSelectedProvider] = useState<"guardarian" | "transak">("guardarian");
  const [gShowReview, setGShowReview] = useState(false);
  const [gCurrencyRetryCount, setGCurrencyRetryCount] = useState(0);
  const [gCurrencyError, setGCurrencyError] = useState(false);
  const [gPaymentMethods, setGPaymentMethods] = useState<GuardarianPaymentMethod[]>([]);
  const [gSelectedPaymentMethod, setGSelectedPaymentMethod] = useState<string>("");

  // Transaction flow state
  const [step, setStep] = useState<Step>("exchange");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [refLinkAddressLocked, setRefLinkAddressLocked] = useState(false);
  const [addressValid, setAddressValid] = useState(false);
  const [refundAddress, setRefundAddress] = useState("");
  const [extraId, setExtraId] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [creatingTx, setCreatingTx] = useState(false);
  const [transaction, setTransaction] = useState<TransactionResult | null>(null);
  const [txStatus, setTxStatus] = useState<TransactionStatus | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [speedForecast, setSpeedForecast] = useState<string | null>(null);
  const [fixedRate, setFixedRate] = useState(true);
  const [connectedWallet, setConnectedWallet] = useState<{ address: string; type: "evm" | "solana" } | null>(null);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const statusPollRef = useRef<ReturnType<typeof setInterval>>();

  // Price lock timer state
  const [rateLockSeconds, setRateLockSeconds] = useState(60);
  const [rateExpired, setRateExpired] = useState(false);
  const [refreshingRate, setRefreshingRate] = useState(false);
  const rateLockRef = useRef<ReturnType<typeof setInterval>>();

  // Wallet connection handlers
  const connectMetaMask = async () => {
    if (typeof window === "undefined") {
      toast({ title: "MetaMask not found", description: "Please install MetaMask browser extension.", variant: "destructive" });
      return;
    }
    const eth = (window as any).ethereum;
    let provider = eth;
    if (eth?.providers?.length) {
      provider = eth.providers.find((p: any) => p.isMetaMask && !p.isTrust) || eth.providers.find((p: any) => p.isMetaMask);
    }
    if (!provider || !provider.isMetaMask) {
      window.open("https://metamask.io/download/", "_blank", "noopener");
      toast({ title: "MetaMask not detected", description: "Opening MetaMask download page. Install it and refresh.", variant: "destructive" });
      return;
    }
    try {
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      if (accounts?.[0]) {
        setRecipientAddress(accounts[0]);
        setConnectedWallet({ address: accounts[0], type: "evm" });
        toast({ title: "Wallet connected", description: `Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}` });
      }
    } catch (err: any) {
      if (err?.code === 4001) return;
      toast({ title: "Connection failed", description: err?.message || "Could not connect MetaMask", variant: "destructive" });
    }
  };

  const connectTrustWallet = async () => {
    if (typeof window === "undefined") {
      toast({ title: "Trust Wallet not found", description: "Please install Trust Wallet browser extension.", variant: "destructive" });
      return;
    }
    const eth = (window as any).ethereum;
    let provider: any = null;
    // Trust Wallet injects trustwallet on the window or sets isTrust on the provider
    if ((window as any).trustwallet) {
      provider = (window as any).trustwallet;
    } else if (eth?.providers?.length) {
      provider = eth.providers.find((p: any) => p.isTrust || p.isTrustWallet);
    } else if (eth?.isTrust || eth?.isTrustWallet) {
      provider = eth;
    }
    if (!provider) {
      window.open("https://trustwallet.com/browser-extension", "_blank", "noopener");
      toast({ title: "Trust Wallet not detected", description: "Opening Trust Wallet download page. Install it and refresh.", variant: "destructive" });
      return;
    }
    try {
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      if (accounts?.[0]) {
        setRecipientAddress(accounts[0]);
        setConnectedWallet({ address: accounts[0], type: "evm" });
        toast({ title: "Wallet connected", description: `Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}` });
      }
    } catch (err: any) {
      if (err?.code === 4001) return;
      toast({ title: "Connection failed", description: err?.message || "Could not connect Trust Wallet", variant: "destructive" });
    }
  };

  const connectPhantom = async () => {
    if (typeof window === "undefined" || !(window as any).solana?.isPhantom) {
      toast({ title: "Phantom not found", description: "Please install Phantom wallet extension.", variant: "destructive" });
      return;
    }
    try {
      const resp = await (window as any).solana.connect();
      const address = resp.publicKey.toString();
      setRecipientAddress(address);
      setConnectedWallet({ address, type: "solana" });
      toast({ title: "Wallet connected", description: `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` });
    } catch (err: any) {
      if (err?.code === 4001) return;
      toast({ title: "Connection failed", description: err?.message || "Could not connect Phantom", variant: "destructive" });
    }
  };

  const [retrying, setRetrying] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  const [trackInput, setTrackInput] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);
  const [walletResults, setWalletResults] = useState<{ transaction_id: string; from_currency: string; to_currency: string; amount: number; created_at: string }[]>([]);

  // Persist recent transactions in localStorage + DB
  const saveTransaction = async (tx: TransactionResult, recipientAddr: string) => {
    // localStorage
    try {
      const stored = JSON.parse(localStorage.getItem("mrc_recent_txs") || "[]");
      const entry = { id: tx.id, from: tx.fromCurrency, to: tx.toCurrency, amount: tx.amount, date: new Date().toISOString() };
      stored.unshift(entry);
      localStorage.setItem("mrc_recent_txs", JSON.stringify(stored.slice(0, 10)));
    } catch (e) {
      console.error("[MRC] localStorage save failed:", e);
    }
    // DB — allows wallet-based lookup across devices
    try {
      const addr = recipientAddr.trim().toLowerCase();
      const payinAddr = (tx.payinAddress || "").trim().toLowerCase();
      console.log("[MRC] Saving transaction to DB:", { id: tx.id, addr, payinAddr, from: tx.fromCurrency, to: tx.toCurrency, amount: tx.amount });
      const { error } = await supabase.from("swap_transactions").insert({
        transaction_id: tx.id,
        recipient_address: addr,
        payin_address: payinAddr,
        from_currency: tx.fromCurrency,
        to_currency: tx.toCurrency,
        amount: tx.amount,
      });
      if (error) {
        console.error("[MRC] DB save error:", error);
        toast({ title: "Note", description: "Transaction created but tracking save failed. Save your Transaction ID: " + tx.id, variant: "destructive" });
      } else {
        console.log("[MRC] Transaction saved to DB successfully");
      }
    } catch (e) {
      console.error("[MRC] DB save exception:", e);
    }
  };

  const getRecentTxs = (): { id: string; from: string; to: string; amount: number; date: string }[] => {
    try { return JSON.parse(localStorage.getItem("mrc_recent_txs") || "[]"); } catch { return []; }
  };

  // Normalise wallet addresses for DB search — handles BCH cashaddr, case, etc.
  const normaliseWalletForSearch = (raw: string): string[] => {
    let addr = raw.trim();
    const variants: Set<string> = new Set();
    // Strip BCH cashaddr prefix
    if (addr.toLowerCase().startsWith("bitcoincash:")) {
      addr = addr.slice("bitcoincash:".length);
    }
    // Always include lowercase (EVM, BTC, TRON all lowercase-safe)
    variants.add(addr.toLowerCase());
    // Also include original case for Solana (Base58 is case-sensitive)
    variants.add(addr);
    return [...variants];
  };

  const handleTrackTransaction = async () => {
    const input = trackInput.trim();
    if (!input) return;
    setTrackLoading(true);
    setWalletResults([]);

    // Detect if input looks like a wallet address
    const looksLikeWallet = input.length >= 26;

    if (looksLikeWallet) {
      // Wallet address — search DB by recipient OR payin address with normalization
      try {
        const variants = normaliseWalletForSearch(input);
        // Build OR filter for all variants × both columns
        const orClauses = variants.flatMap(v => [
          `recipient_address.eq.${v}`,
          `payin_address.eq.${v}`,
        ]).join(",");
        const { data, error } = await supabase
          .from("swap_transactions")
          .select("transaction_id, from_currency, to_currency, amount, created_at")
          .or(orClauses)
          .order("created_at", { ascending: false })
          .limit(10);
        if (error) throw error;
        if (data && data.length > 0) {
          setWalletResults(data);
          setTrackLoading(false);
          return;
        }
      } catch {}
      toast({
        title: "No transfers found yet",
        description: "Wallet tracking works for all new swaps. Your next swap will appear here automatically.",
      });
      setTrackLoading(false);
      return;
    }

    // Short input — treat as Transaction ID
    try {
      const status = await getTransactionStatus(input);
      if (status?.id) {
        setTransaction({ id: status.id, payinAddress: status.payinAddress, payoutAddress: status.payoutAddress, fromCurrency: status.fromCurrency, toCurrency: status.toCurrency, amount: status.amountSend || 0 } as TransactionResult);
        setTxStatus(status);
        setStep("status");
        setShowTracker(false);
        setTrackInput("");
        document.getElementById("exchange-widget")?.scrollIntoView({ behavior: "smooth", block: "start" });
        setTrackLoading(false);
        return;
      }
    } catch {}

    toast({ title: "Not found", description: "Could not find a transfer with this ID. Double-check and try again.", variant: "destructive" });
    setTrackLoading(false);
  };

  const handleSelectWalletTx = async (txId: string) => {
    setTrackLoading(true);
    try {
      const status = await getTransactionStatus(txId);
      if (!status?.id) throw new Error("Not found");
      setTransaction({ id: status.id, payinAddress: status.payinAddress, payoutAddress: status.payoutAddress, fromCurrency: status.fromCurrency, toCurrency: status.toCurrency, amount: status.amountSend || 0 } as TransactionResult);
      setTxStatus(status);
      setStep("status");
      setShowTracker(false);
      setTrackInput("");
      setWalletResults([]);
      document.getElementById("exchange-widget")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      toast({ title: "Error", description: "Could not fetch transaction status.", variant: "destructive" });
    } finally {
      setTrackLoading(false);
    }
  };

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    const loadCurrencies = () => {
      setLoading(true);
      const params = new URLSearchParams(window.location.search);
      const paramFrom = params.get("from")?.toLowerCase();
      const rawTo = params.get("to")?.toLowerCase();
      const paramAmount = params.get("amount");

      // Solana AI & DePIN ticker mapping — "clean URL" to "widget ticker" auto-correct
      const TICKER_MAP: Record<string, string> = {
        // AI & Compute
        goat: "goatsol",
        nos: "nossol",
        io: "iosol",
        aixbt: "aixbtsol",
        render: "render",
        akt: "aktsol",
        // DePIN / Infrastructure
        hnt: "hnt",
        mobile: "mobilesol",
        honey: "honeysol",
        pyth: "pyth",
        // Institutional & RWA
        ondo: "ondosol",
        jup: "jup",
        link: "link",
        ena: "enasol",
        eigen: "eigensol",
        // Solana Staking (LSTs)
        jupsol: "jupsolsol",
        jto: "jtosol",
        inf: "infsol",
        bpsol: "bpsol",
        // Retail & Meme
        mew: "mewsol",
        bome: "bomesol",
        kama: "kamasol",
        elon: "elonsol",
        bad: "badsol",
        banana: "bananasol",
        babydoge: "babydoge",
        bera: "bera",
        near: "nearsol",
      };

      // Tokens pending liquidity — default to USDC (Solana) with warning
      const PENDING_TOKENS = new Set(["eliza", "elizasol", "virtual", "virtualsol", "zerebro", "zerebrosol", "pippin", "pippinsol", "ai16z", "ai16zsol"]);

      let paramTo = rawTo ? (TICKER_MAP[rawTo] || rawTo) : undefined;
      const paramFromMapped = paramFrom ? (TICKER_MAP[paramFrom] || paramFrom) : undefined;

      // If user requests a pending token, show professional notice and default to USDC
      let liquidityPending = false;
      if (rawTo && PENDING_TOKENS.has(rawTo)) {
        paramTo = "usdcsol";
        liquidityPending = true;
      }
      if (paramFrom && PENDING_TOKENS.has(paramFrom)) {
        liquidityPending = true;
      }

      getCurrencies()
        .then((data) => {
          if (Array.isArray(data)) {
            setCurrencies(data);

            // Helper: find currency by mapped ticker, fallback to raw param
            const findCurrency = (mapped: string | undefined, raw: string | undefined) => {
              if (!mapped) return null;
              const exact = data.find((c) => c.ticker === mapped);
              if (exact) return exact;
              // If mapped ticker not found, try raw as last resort
              if (raw && raw !== mapped) return data.find((c) => c.ticker === raw) || null;
              return null;
            };

            const fromMatch = findCurrency(paramFromMapped, paramFrom);
            const toMatch = findCurrency(paramTo, rawTo);
            setFromCurrency(fromMatch || data.find((c) => c.ticker === "btc") || data[0]);
            setToCurrency(toMatch || data.find((c) => c.ticker === "eth") || data[1]);
            if (paramAmount && parseFloat(paramAmount) > 0) {
              setSendAmount(paramAmount);
            }
            // Ref-link address hydration
            const paramAddress = params.get("address")?.trim();
            if (paramAddress) {
              setRecipientAddress(paramAddress);
              setRefLinkAddressLocked(true);
            }
            if (liquidityPending) {
              toast({
                title: "Liquidity Pending",
                description: `The token "${rawTo?.toUpperCase() || paramFrom?.toUpperCase()}" is not yet available for instant swaps. We've defaulted to USDC (Solana). Check back soon for updates.`,
              });
            }
            retryCount = 0;
            setRetrying(false);
          }
        })
        .catch(() => {
          if (retryCount < maxRetries) {
            retryCount++;
            setRetrying(true);
            setTimeout(loadCurrencies, 3000 * retryCount);
          } else {
            setRetrying(false);
            toast({ title: "Connection issue", description: "Could not load currencies. Please refresh the page.", variant: "destructive" });
          }
        })
        .finally(() => setLoading(false));
    };

    loadCurrencies();
  }, []);

  // Load Guardarian currencies on first switch to buysell mode — with retry
  const loadGuardarianCurrencies = useCallback(async (retryNum = 0) => {
    setGuardarianLoading(true);
    setGCurrencyError(false);
    try {
      const data = await getGuardarianCurrencies();
      if ((data as any)?.fallback) throw new Error("Provider unavailable");
      const fiat = (data.fiat_currencies || []).filter((c: GuardarianCurrency) => c.enabled && c.is_available !== false);
      const crypto = (data.crypto_currencies || []).filter((c: GuardarianCurrency) => c.enabled && c.is_available !== false);
      setGuardarianFiat(fiat);
      setGuardarianCrypto(crypto);
      // Deep-link pre-selection: check URL params
      const dlParams = new URLSearchParams(window.location.search);
      const dlFiat = dlParams.get("fiat")?.toUpperCase();
      const dlCrypto = dlParams.get("crypto")?.toUpperCase();
      setGFromCurrency(fiat.find((c: GuardarianCurrency) => c.ticker === (dlFiat || "USD")) || fiat.find((c: GuardarianCurrency) => c.ticker === "EUR") || fiat[0] || null);
      setGToCurrency(crypto.find((c: GuardarianCurrency) => c.ticker === (dlCrypto || "BTC")) || crypto[0] || null);
      setGuardarianLoaded(true);
      setGCurrencyRetryCount(0);
    } catch (err) {
      console.error("Failed to load Guardarian currencies:", err);
      if (retryNum < 3) {
        setGCurrencyRetryCount(retryNum + 1);
        setTimeout(() => loadGuardarianCurrencies(retryNum + 1), 2000 * (retryNum + 1));
      } else {
        setGCurrencyError(true);
      }
    } finally {
      setGuardarianLoading(false);
    }
  }, []);

  useEffect(() => {
    if (widgetMode !== "buysell" || guardarianLoaded) return;
    loadGuardarianCurrencies();
  }, [widgetMode, guardarianLoaded, loadGuardarianCurrencies]);

  // Extract payment methods from currency data when fiat currency changes
  useEffect(() => {
    if (widgetMode !== "buysell") return;
    const fiatCurrency = gTradeDirection === "buy" ? gFromCurrency : gToCurrency;
    if (!fiatCurrency) { setGPaymentMethods([]); return; }

    // Payment methods are embedded in the currency's networks
    const allMethods: GuardarianPaymentMethod[] = [];
    const seen = new Set<string>();
    // Collect from networks
    for (const net of fiatCurrency.networks || []) {
      for (const pm of net.payment_methods || []) {
        if (!seen.has(pm.type)) {
          seen.add(pm.type);
          allMethods.push(pm);
        }
      }
    }
    // Also collect from top-level payment_methods
    for (const pm of fiatCurrency.payment_methods || []) {
      if (!seen.has(pm.type)) {
        seen.add(pm.type);
        allMethods.push(pm);
      }
    }
    setGPaymentMethods(allMethods);
    setGSelectedPaymentMethod(allMethods.length > 0 ? allMethods[0].type : "");
  }, [widgetMode, gFromCurrency?.ticker, gToCurrency?.ticker, gTradeDirection]);

  // Deep-link: ?tab=buy&crypto=SOL&fiat=USD activates Buy/Sell tab automatically
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab")?.toLowerCase();
    if (tab === "buy" || tab === "sell" || tab === "buysell") {
      setWidgetMode("buysell");
      if (tab === "sell") setGTradeDirection("sell");
    }
  }, []);

  // Guardarian estimate
  const fetchGuardarianEstimate = useCallback(async () => {
    if (!gFromCurrency || !gToCurrency || !gSendAmount || parseFloat(gSendAmount) <= 0) {
      setGEstimatedAmount("");
      return;
    }
    setGEstimating(true);
    try {
      // Pick first available network
      const fromNetwork = gFromCurrency.networks?.[0]?.network || gFromCurrency.ticker;
      const toNetwork = gToCurrency.networks?.[0]?.network || gToCurrency.ticker;
      const [est, minMax] = await Promise.all([
        getGuardarianEstimate({
          from_currency: gFromCurrency.ticker,
          to_currency: gToCurrency.ticker,
          from_network: fromNetwork,
          to_network: toNetwork,
          from_amount: gSendAmount,
        }),
        getGuardarianMinMax({
          from_currency: gFromCurrency.ticker,
          to_currency: gToCurrency.ticker,
          from_network: fromNetwork,
          to_network: toNetwork,
        }),
      ]);
      setGEstimatedAmount(est.value || "—");
      setGFullEstimate(est);
      setGMinAmount(minMax.min || 0);
      setGMaxAmount(minMax.max || 999999);
    } catch {
      setGEstimatedAmount("—");
    } finally {
      setGEstimating(false);
    }
  }, [gFromCurrency, gToCurrency, gSendAmount]);

  useEffect(() => {
    if (widgetMode !== "buysell") return;
    if (gDebounceRef.current) clearTimeout(gDebounceRef.current);
    gDebounceRef.current = setTimeout(fetchGuardarianEstimate, 600);
    return () => { if (gDebounceRef.current) clearTimeout(gDebounceRef.current); };
  }, [fetchGuardarianEstimate, widgetMode]);

  const fetchEstimate = useCallback(async () => {
    if (!fromCurrency || !toCurrency || !sendAmount || parseFloat(sendAmount) <= 0) {
      setEstimatedAmount("");
      return;
    }
    setEstimating(true);
    try {
      const est = await getEstimate(fromCurrency.ticker, toCurrency.ticker, sendAmount, fixedRate);
      setEstimatedAmount(est.estimatedAmount?.toString() || "—");
      if (est.transactionSpeedForecast) {
        setSpeedForecast(est.transactionSpeedForecast);
      }
    } catch {
      setEstimatedAmount("—");
      setSpeedForecast(null);
    }
    try {
      const min = await getMinAmount(fromCurrency.ticker, toCurrency.ticker, fixedRate);
      setMinAmount(min.minAmount || 0);
    } catch {
      setMinAmount(0);
    } finally {
      setEstimating(false);
    }
  }, [fromCurrency, toCurrency, sendAmount, fixedRate]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchEstimate, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [fetchEstimate]);

  // Poll transaction status
  useEffect(() => {
    if (step === "status" && transaction?.id) {
      const poll = async () => {
         try {
          const status = await getTransactionStatus(transaction.id);
          setTxStatus(status);
          if (["finished", "failed", "refunded"].includes(status.status)) {
            if (statusPollRef.current) clearInterval(statusPollRef.current);
            // Trigger push notification on completion
            if (status.status === "finished") {
              supabase.functions.invoke("send-push-notification", {
                method: "POST",
                body: {
                  transaction_id: transaction.id,
                  title: "Swap Complete ✅",
                  body: `Your ${status.fromCurrency?.toUpperCase()} → ${status.toCurrency?.toUpperCase()} swap is done! ${status.amountReceive ? status.amountReceive + " " + status.toCurrency?.toUpperCase() + " received." : ""}`,
                  url: "/",
                },
              }).catch(console.error);
            }
          }
        } catch (err) {
          console.error("Status poll error:", err);
        }
      };
      poll();
      statusPollRef.current = setInterval(poll, 15000);

      // Auto-subscribe to push notifications for this transaction
      if (pushSupported && !pushSubscribedRef.current) {
        pushSubscribedRef.current = true;
        subscribePush(transaction.id).catch(console.error);
      }

      return () => { if (statusPollRef.current) clearInterval(statusPollRef.current); };
    }
  }, [step, transaction?.id]);

  // Price lock countdown - starts when on address step with a valid address
  useEffect(() => {
    if (step === "address" && addressValid) {
      setRateLockSeconds(60);
      setRateExpired(false);
      if (rateLockRef.current) clearInterval(rateLockRef.current);
      rateLockRef.current = setInterval(() => {
        setRateLockSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(rateLockRef.current!);
            setRateExpired(true);
            return 0;
          }
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
    try {
      await fetchEstimate();
    } finally {
      setRefreshingRate(false);
      setRateLockSeconds(60);
      setRateExpired(false);
      if (rateLockRef.current) clearInterval(rateLockRef.current);
      rateLockRef.current = setInterval(() => {
        setRateLockSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(rateLockRef.current!);
            setRateExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const scrollToWidget = () => {
    document.getElementById("exchange-widget")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleExchangeNow = () => {
    setStep("address");
    scrollToWidget();
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
        ...(refundAddress && { refundAddress: refundAddress.trim() }),
      });
      setTransaction(result);
      saveTransaction(result, recipientAddress);
      setStep("deposit");
      scrollToWidget();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction creation failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setCreatingTx(false);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleProceedToStatus = () => {
    setStep("status");
    scrollToWidget();
  };

  const handleNewExchange = () => {
    setStep("exchange");
    setRecipientAddress("");
    setAddressValid(false);
    setRefundAddress("");
    setExtraId("");
    setTransaction(null);
    setTxStatus(null);
    setConnectedWallet(null);
    setNotifyEmail("");
    setEmailSubmitted(false);
    scrollToWidget();
  };

  const handleEmailSubscribe = async () => {
    if (!notifyEmail.trim() || !transaction?.id) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(notifyEmail.trim())) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    setEmailSubmitting(true);
    try {
      const { error } = await supabase.from("transfer_email_subscriptions").insert({
        transaction_id: transaction.id,
        email: notifyEmail.trim(),
      });
      if (error) throw error;
      // Send swap confirmation email
      try {
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "swap-confirmation",
            recipientEmail: notifyEmail.trim(),
            idempotencyKey: `swap-confirm-${transaction.id}`,
            templateData: {
              transactionId: transaction.id,
              fromAmount: String(transaction.amount ?? sendAmount),
              fromCurrency: transaction.fromCurrency || fromCurrency?.ticker || "",
              toCurrency: transaction.toCurrency || toCurrency?.ticker || "",
              recipientAddress: recipientAddress.trim(),
              depositAddress: transaction.payinAddress || "",
            },
          },
        });
      } catch (emailErr) {
        console.error("[MRC] Swap confirmation email failed:", emailErr);
      }
      setEmailSubmitted(true);
      toast({ title: "Subscribed!", description: "You'll receive a confirmation email with your exchange details." });
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Could not subscribe", variant: "destructive" });
    } finally {
      setEmailSubmitting(false);
    }
  };

  const handleStartGuardarianCheckout = async () => {
    if (!gFromCurrency || !gToCurrency) {
      toast({ title: "Select currencies", description: "Choose what you want to pay with and receive first.", variant: "destructive" });
      return;
    }

    if (!gEstimatedAmount || gEstimatedAmount === "—") {
      toast({ title: "Quote unavailable", description: "Wait for a valid quote before continuing.", variant: "destructive" });
      return;
    }

    // Buy mode requires wallet address; sell mode collects payout at checkout
    if (gTradeDirection === "buy" && !gPayoutAddress.trim()) {
      toast({ title: "Wallet required", description: `Enter your ${gToCurrency.ticker} wallet address to continue.`, variant: "destructive" });
      return;
    }

    // Show review overlay instead of redirecting immediately
    setGShowReview(true);
  };

  const handleConfirmGuardarianCheckout = async () => {
    setGShowReview(false);
    setGCreatingTx(true);

    try {
      let result: any;

      if (gTradeDirection === "sell") {
        // Sell flow: crypto → fiat via /v1/transaction/sell
        result = await createGuardarianSellTransaction({
          from_amount: parseFloat(gSendAmount),
          from_currency: gFromCurrency!.ticker,
          to_currency: gToCurrency!.ticker,
          from_network: gFromCurrency!.networks?.[0]?.network,
          to_network: gToCurrency!.networks?.[0]?.network,
          deposit_address: gPayoutAddress.trim() || undefined,
          ...(gSelectedPaymentMethod ? { payment_method: gSelectedPaymentMethod } : {}),
        });
      } else {
        // Buy flow: fiat → crypto via /v1/transaction
        result = await createGuardarianTransaction({
          from_amount: parseFloat(gSendAmount),
          from_currency: gFromCurrency!.ticker,
          to_currency: gToCurrency!.ticker,
          from_network: gFromCurrency!.networks?.[0]?.network,
          to_network: gToCurrency!.networks?.[0]?.network,
          payout_address: gPayoutAddress.trim(),
          ...(gSelectedPaymentMethod ? { payment_method: gSelectedPaymentMethod } : {}),
        });
      }

      // If the API returns a redirect_url, open it in a new tab (clean redirect)
      const redirectUrl = result?.redirect_url;
      if (redirectUrl) {
        window.open(redirectUrl, "_blank", "noopener,noreferrer");
        toast({ title: "Checkout opened", description: "Complete your purchase in the new tab. You can close this overlay." });
        return;
      }

      // Fallback: use calculator widget URL in a new tab
      const token = await getGuardarianPartnerToken();
      if (!token) throw new Error("Provider is not configured.");

      const params = new URLSearchParams({
        partner_api_token: token,
        default_fiat_currency: gTradeDirection === "buy" ? gFromCurrency!.ticker : gToCurrency!.ticker,
        default_crypto_currency: gTradeDirection === "buy" ? gToCurrency!.ticker : gFromCurrency!.ticker,
        default_fiat_amount: gSendAmount,
        payout_address: gPayoutAddress.trim(),
        theme: "blue",
        type: gTradeDirection === "sell" ? "sell" : "buy",
      });

      const widgetUrl = `https://guardarian.com/calculator/v1?${params.toString()}`;
      setGCheckoutUrl(widgetUrl);
      window.open(widgetUrl, "_blank", "noopener,noreferrer");
      toast({ title: "Checkout opened", description: "Complete your purchase in the new tab." });
    } catch (err: any) {
      // Final fallback: open calculator widget directly
      try {
        const token = await getGuardarianPartnerToken();
        const params = new URLSearchParams({
          partner_api_token: token || "",
          default_fiat_currency: gTradeDirection === "buy" ? gFromCurrency!.ticker : gToCurrency!.ticker,
          default_crypto_currency: gTradeDirection === "buy" ? gToCurrency!.ticker : gFromCurrency!.ticker,
          default_fiat_amount: gSendAmount,
          payout_address: gPayoutAddress.trim(),
          theme: "blue",
          type: gTradeDirection === "sell" ? "sell" : "buy",
        });
        const widgetUrl = `https://guardarian.com/calculator/v1?${params.toString()}`;
        window.open(widgetUrl, "_blank", "noopener,noreferrer");
        toast({ title: "Checkout opened", description: "Complete your purchase in the new tab." });
      } catch {
        toast({ title: "Service Temporarily Unavailable", description: "Please try again in a moment.", variant: "destructive" });
      }
    } finally {
      setGCreatingTx(false);
    }
  };

  const filteredCurrencies = currencies.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.ticker.includes(q) || c.name.toLowerCase().includes(q);
  });

  const sortedCurrencies = [...filteredCurrencies].sort((a, b) => {
    const aPopular = POPULAR_TICKERS.indexOf(a.ticker);
    const bPopular = POPULAR_TICKERS.indexOf(b.ticker);
    if (aPopular !== -1 && bPopular !== -1) return aPopular - bPopular;
    if (aPopular !== -1) return -1;
    if (bPopular !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  const belowMin = parseFloat(sendAmount) > 0 && minAmount > 0 && parseFloat(sendAmount) < minAmount;

  const BATCH_SIZE = 50;

  const CurrencyList = ({ currencies: items, onSelect }: { currencies: Currency[]; onSelect: (c: Currency) => void }) => {
    const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
    const listRef = useRef<HTMLDivElement>(null);

    const handleScroll = useCallback(() => {
      const el = listRef.current;
      if (!el) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
        setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, items.length));
      }
    }, [items.length]);

    useEffect(() => { setVisibleCount(BATCH_SIZE); }, [items.length]);

    return (
      <div ref={listRef} onScroll={handleScroll} className="overflow-y-auto p-2" style={{ maxHeight: 400 }}>
        {items.slice(0, visibleCount).map((c) => (
          <button
            key={`${c.ticker}-${c.network}`}
            onClick={() => onSelect(c)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent"
          >
            {c.image && <img src={c.image} alt={c.name} className="h-6 w-6 rounded-full" loading="lazy" />}
            <div>
              <span className="font-display text-sm font-semibold uppercase text-foreground">{displayTicker(c)}</span>
              {networkLabel(c) && (
                <span className="ms-1.5 rounded bg-muted px-1.5 py-0.5 font-body text-[10px] uppercase text-muted-foreground">{networkLabel(c)}</span>
              )}
              <span className="ms-2 font-body text-xs text-muted-foreground">{c.name}</span>
            </div>
          </button>
        ))}
        {visibleCount < items.length && (
          <div className="py-2 text-center font-body text-xs text-muted-foreground">Scroll for more...</div>
        )}
      </div>
    );
  };

  const GuardarianCryptoList = ({ items, onSelect }: { items: GuardarianCurrency[]; onSelect: (c: GuardarianCurrency) => void }) => {
    const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
    const listRef = useRef<HTMLDivElement>(null);

    const handleScroll = useCallback(() => {
      const el = listRef.current;
      if (!el) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
        setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, items.length));
      }
    }, [items.length]);

    useEffect(() => { setVisibleCount(BATCH_SIZE); }, [items.length]);

    return (
      <div ref={listRef} onScroll={handleScroll} className="overflow-y-auto p-2" style={{ maxHeight: 400 }}>
        {items.slice(0, visibleCount).map((c) => (
          <button
            key={`${c.ticker}-${c.networks?.[0]?.network || ''}`}
            onClick={() => onSelect(c)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent"
          >
            <GuardarianAssetIcon currency={c} />
            <div>
              <span className="font-display text-sm font-semibold uppercase text-foreground">{c.ticker}</span>
              {c.networks?.[0]?.network && c.networks[0].network !== c.ticker && (
                <span className="ms-1.5 rounded bg-muted px-1.5 py-0.5 font-body text-[10px] uppercase text-muted-foreground">{c.networks[0].network}</span>
              )}
              <span className="ms-2 font-body text-xs text-muted-foreground">{c.name}</span>
            </div>
          </button>
        ))}
        {visibleCount < items.length && (
          <div className="py-2 text-center font-body text-xs text-muted-foreground">Scroll for more...</div>
        )}
      </div>
    );
  };

  const CurrencyPicker = ({
    show,
    onSelect,
    onClose,
    exclude,
  }: {
    show: boolean;
    onSelect: (c: Currency) => void;
    onClose: () => void;
    exclude?: string;
  }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={onClose}>
        <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-elevated" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2 border-b border-border p-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              placeholder="Search currency..."
              className="flex-1 bg-transparent font-body text-sm text-foreground outline-none placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={() => { onClose(); setSearchQuery(""); }} className="font-body text-xs text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </div>
          {/* Mobile Quick-Select */}
          <div className="flex gap-2 border-b border-border px-4 pb-3">
            {["btc", "eth", "sol", "usdc"].map((ticker) => {
              const c = currencies.find((cur) => cur.ticker === ticker);
              if (!c) return null;
              return (
                <button
                  key={ticker}
                  onClick={() => { onSelect(c); onClose(); setSearchQuery(""); }}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-accent px-3 py-1.5 font-display text-xs font-semibold uppercase text-foreground transition-colors hover:border-primary/40"
                >
                  {c.image && <img src={c.image} alt="" className="h-4 w-4 rounded-full" />}
                  {ticker}
                </button>
              );
            })}
          </div>
          <CurrencyList
            currencies={sortedCurrencies.filter((c) => c.ticker !== exclude)}
            onSelect={(c) => { onSelect(c); onClose(); setSearchQuery(""); }}
          />
        </div>
      </div>
    );
  };

  if (loading || retrying) {
    return (
      <div className="flex h-80 flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card shadow-elevated">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {retrying && <p className="text-sm text-muted-foreground animate-pulse">Reloading currencies…</p>}
      </div>
    );
  }

  const CopyButton = ({ text, label }: { text: string; label: string }) => (
    <button
      onClick={() => handleCopy(text, label)}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      title="Copy"
    >
      {copied === label ? <Check className="h-3.5 w-3.5 text-trust" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      id="exchange-widget"
      className="relative scroll-mt-24 rounded-2xl border border-border bg-card p-6 shadow-elevated sm:p-8"
    >
      <AnimatePresence mode="wait">
        {/* ===== STEP 1: Exchange Form ===== */}
        {step === "exchange" && (
          <motion.div key="exchange" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* ===== MODE TABS: Exchange | Buy/Sell ===== */}
            <div className="mb-5 flex items-center justify-between gap-2">
              <div className="flex rounded-xl border border-border bg-accent p-1 gap-1 max-[480px]:w-full max-[480px]:grid max-[480px]:grid-cols-2">
                <button
                  onClick={() => { setWidgetMode("exchange"); setGStep("form"); setGCheckoutUrl(""); }}
                  className={`flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 font-display text-sm font-semibold transition-all ${
                    widgetMode === "exchange"
                      ? "bg-primary text-primary-foreground shadow-card"
                      : "text-muted-foreground hover:text-foreground hover:bg-background"
                  }`}
                >
                  <Repeat className="h-4 w-4" /> Exchange
                </button>
                <button
                  onClick={() => setWidgetMode("buysell")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 font-display text-sm font-semibold transition-all ${
                    widgetMode === "buysell"
                      ? "bg-primary text-primary-foreground shadow-card"
                      : "text-muted-foreground hover:text-foreground hover:bg-background"
                  }`}
                >
                  <CreditCard className="h-4 w-4" /> Buy / Sell
                </button>
              </div>
              <span className="hidden min-[481px]:flex items-center gap-1.5 rounded-full border border-trust/30 bg-trust/10 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-trust">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-trust opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-trust"></span>
                </span>
                Online
              </span>
            </div>

            {/* ===== BUY/SELL MODE (Guardarian) ===== */}
            {widgetMode === "buysell" && (
              <div>
                {guardarianLoading ? (
                  <div className="flex h-60 flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground animate-pulse">
                      {gCurrencyRetryCount > 0 ? `Retrying… (${gCurrencyRetryCount}/3)` : "Loading currencies…"}
                    </span>
                  </div>
                ) : gCurrencyError ? (
                  <div className="flex h-60 flex-col items-center justify-center gap-3 text-center">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                    <p className="text-sm text-muted-foreground">Could not load currencies. Please try again.</p>
                    <Button variant="outline" size="sm" onClick={() => loadGuardarianCurrencies(0)}>
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Retry
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Buy / Sell toggle */}
                    <div className="mb-4 flex rounded-lg border border-border bg-accent p-0.5 gap-0.5">
                      <button
                        onClick={() => {
                          if (gTradeDirection !== "buy") {
                            // Swap currencies: sell→buy means from=fiat, to=crypto
                            const prevFrom = gFromCurrency;
                            const prevTo = gToCurrency;
                            setGFromCurrency(prevTo);
                            setGToCurrency(prevFrom);
                          }
                          setGTradeDirection("buy");
                        }}
                        className={`flex-1 rounded-md px-3 py-1.5 font-display text-xs font-semibold transition-all ${
                          gTradeDirection === "buy" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >Buy</button>
                      <button
                        onClick={() => {
                          if (gTradeDirection !== "sell") {
                            // Swap currencies: buy→sell means from=crypto, to=fiat
                            const prevFrom = gFromCurrency;
                            const prevTo = gToCurrency;
                            setGFromCurrency(prevTo);
                            setGToCurrency(prevFrom);
                          }
                          setGTradeDirection("sell");
                        }}
                        className={`flex-1 rounded-md px-3 py-1.5 font-display text-xs font-semibold transition-all ${
                          gTradeDirection === "sell" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >Sell</button>
                    </div>

                    {/* You Pay (Fiat) */}
                    <div className="relative">
                      <label className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {gTradeDirection === "buy" ? "You Pay (Fiat)" : "You Sell (Crypto)"}
                      </label>
                      <div className="flex items-center gap-3 rounded-xl border border-border bg-accent p-4">
                        <Input
                          type="number"
                          value={gSendAmount}
                          onChange={(e) => setGSendAmount(e.target.value)}
                          className="flex-1 border-none bg-transparent p-0 font-display text-2xl font-bold text-foreground shadow-none focus-visible:ring-0"
                          min={0}
                          step="any"
                        />
                        <button onClick={() => setGShowFromPicker(true)} className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5 transition-colors hover:bg-primary/20">
                          {gFromCurrency && (
                            gTradeDirection === "buy" && fiatFlagUrl(gFromCurrency.ticker)
                              ? <img src={fiatFlagUrl(gFromCurrency.ticker)} alt="" className="h-5 w-5 rounded-full object-cover" />
                              : gTradeDirection === "sell" && <GuardarianAssetIcon currency={gFromCurrency} />
                          )}
                          <span className="font-display text-sm font-semibold uppercase text-primary">{gFromCurrency?.ticker || "Select"}</span>
                          <ChevronDown className="h-3.5 w-3.5 text-primary/60" />
                        </button>
                      </div>
                      {/* Min/Max validation */}
                      {parseFloat(gSendAmount) > 0 && gMinAmount > 0 && parseFloat(gSendAmount) < gMinAmount && (
                        <p className="mt-1 font-body text-xs text-destructive">
                          Minimum: {gMinAmount} {gFromCurrency?.ticker}
                        </p>
                      )}
                      {parseFloat(gSendAmount) > 0 && gMaxAmount < 999999 && parseFloat(gSendAmount) > gMaxAmount && (
                        <p className="mt-1 font-body text-xs text-destructive">
                          Maximum: {gMaxAmount} {gFromCurrency?.ticker}
                        </p>
                      )}

                      {/* From Currency Picker — shows fiat for buy, crypto for sell */}
                      {gShowFromPicker && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setGShowFromPicker(false)}>
                          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-elevated" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2 border-b border-border p-4">
                              <Search className="h-4 w-4 text-muted-foreground" />
                              <input
                                autoFocus
                                placeholder={gTradeDirection === "buy" ? "Search fiat currency..." : "Search crypto..."}
                                className="flex-1 bg-transparent font-body text-sm text-foreground outline-none placeholder:text-muted-foreground"
                                value={gSearchQuery}
                                onChange={(e) => setGSearchQuery(e.target.value)}
                              />
                              <button onClick={() => { setGShowFromPicker(false); setGSearchQuery(""); }} className="font-body text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                            </div>
                            {gTradeDirection === "buy" ? (
                              <div className="overflow-y-auto p-2" style={{ maxHeight: 400 }}>
                                {guardarianFiat
                                  .filter((c) => !gSearchQuery || c.ticker.toLowerCase().includes(gSearchQuery.toLowerCase()) || c.name.toLowerCase().includes(gSearchQuery.toLowerCase()))
                                  .map((c) => (
                                    <button
                                      key={c.ticker}
                                      onClick={() => { setGFromCurrency(c); setGShowFromPicker(false); setGSearchQuery(""); }}
                                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent"
                                    >
                                      {fiatFlagUrl(c.ticker) && <img src={fiatFlagUrl(c.ticker)} alt={c.ticker} className="h-6 w-6 rounded-full object-cover" loading="lazy" />}
                                      <span className="font-display text-sm font-semibold uppercase text-foreground">{c.ticker}</span>
                                      <span className="font-body text-xs text-muted-foreground">{c.name}</span>
                                    </button>
                                  ))}
                              </div>
                            ) : (
                              <GuardarianCryptoList
                                items={guardarianCrypto.filter((c) => {
                                  if (!gSearchQuery) return true;
                                  const q = gSearchQuery.toLowerCase();
                                  return c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
                                })}
                                onSelect={(c) => { setGFromCurrency(c); setGShowFromPicker(false); setGSearchQuery(""); }}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Rate & Fee info bar */}
                    <div className="my-3 flex flex-wrap items-center justify-center gap-2">
                      <span className="flex items-center gap-1 rounded-md border border-trust/20 bg-trust/5 px-2 py-1 font-body text-[10px] font-medium text-trust sm:text-[11px]">
                        <CheckCircle2 className="h-3 w-3" /> No extra fees
                      </span>
                      {gFullEstimate?.estimated_exchange_rate && gFromCurrency && gToCurrency && (
                        <span className="font-body text-[10px] text-muted-foreground sm:text-[11px]">
                          Estimated Rate: 1 {gFromCurrency.ticker} ≈ {gFullEstimate.estimated_exchange_rate} {gToCurrency.ticker}
                        </span>
                      )}
                    </div>

                    {/* You Get (Crypto) */}
                    <div className="relative">
                      <label className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {gTradeDirection === "buy" ? "You Receive (Crypto)" : "You Get (Fiat)"}
                      </label>
                      <div className="flex items-center gap-3 rounded-xl border border-border bg-accent p-4">
                        <span className="flex-1 font-display text-2xl font-bold text-foreground">
                          {gEstimating ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : `≈ ${gEstimatedAmount || "—"}`}
                        </span>
                        <button onClick={() => setGShowToPicker(true)} className="flex items-center gap-2 rounded-lg bg-trust/10 px-4 py-2.5 transition-colors hover:bg-trust/20">
                          {gToCurrency && (
                            gTradeDirection === "sell" && fiatFlagUrl(gToCurrency.ticker)
                              ? <img src={fiatFlagUrl(gToCurrency.ticker)} alt="" className="h-5 w-5 rounded-full object-cover" />
                              : gTradeDirection === "buy" && <GuardarianAssetIcon currency={gToCurrency} />
                          )}
                          <span className="font-display text-sm font-semibold uppercase text-trust">{gToCurrency?.ticker || "Select"}</span>
                          <ChevronDown className="h-3.5 w-3.5 text-trust/60" />
                        </button>
                      </div>

                      {/* To Currency Picker — shows crypto for buy, fiat for sell */}
                      {gShowToPicker && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setGShowToPicker(false)}>
                          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-elevated" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2 border-b border-border p-4">
                              <Search className="h-4 w-4 text-muted-foreground" />
                              <input
                                autoFocus
                                placeholder={gTradeDirection === "buy" ? "Search crypto..." : "Search fiat currency..."}
                                className="flex-1 bg-transparent font-body text-sm text-foreground outline-none placeholder:text-muted-foreground"
                                value={gSearchQuery}
                                onChange={(e) => setGSearchQuery(e.target.value)}
                              />
                              <button onClick={() => { setGShowToPicker(false); setGSearchQuery(""); }} className="font-body text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                            </div>
                            {gTradeDirection === "buy" ? (
                              <>
                                {/* Quick Select */}
                                <div className="flex gap-2 border-b border-border px-4 pb-3">
                                  {["BTC", "ETH", "SOL", "USDT"].map((ticker) => {
                                    const c = guardarianCrypto.find((cur) => cur.ticker === ticker);
                                    if (!c) return null;
                                    return (
                                      <button
                                        key={ticker}
                                        onClick={() => { setGToCurrency(c); setGShowToPicker(false); setGSearchQuery(""); }}
                                        className="flex items-center gap-1.5 rounded-lg border border-border bg-accent px-3 py-1.5 font-display text-xs font-semibold uppercase text-foreground transition-colors hover:border-primary/40"
                                      >
                                        <GuardarianAssetIcon currency={c} small />
                                        {ticker}
                                      </button>
                                    );
                                  })}
                                </div>
                                <GuardarianCryptoList
                                  items={guardarianCrypto.filter((c) => {
                                    if (!gSearchQuery) return true;
                                    const q = gSearchQuery.toLowerCase();
                                    return c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.networks?.some((n) => n.network.toLowerCase().includes(q) || n.name.toLowerCase().includes(q));
                                  })}
                                  onSelect={(c) => { setGToCurrency(c); setGShowToPicker(false); setGSearchQuery(""); }}
                                />
                              </>
                            ) : (
                              <div className="overflow-y-auto p-2" style={{ maxHeight: 400 }}>
                                {guardarianFiat
                                  .filter((c) => !gSearchQuery || c.ticker.toLowerCase().includes(gSearchQuery.toLowerCase()) || c.name.toLowerCase().includes(gSearchQuery.toLowerCase()))
                                  .map((c) => (
                                    <button
                                      key={c.ticker}
                                      onClick={() => { setGToCurrency(c); setGShowToPicker(false); setGSearchQuery(""); }}
                                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent"
                                    >
                                      {fiatFlagUrl(c.ticker) && <img src={fiatFlagUrl(c.ticker)} alt={c.ticker} className="h-6 w-6 rounded-full object-cover" loading="lazy" />}
                                      <span className="font-display text-sm font-semibold uppercase text-foreground">{c.ticker}</span>
                                      <span className="font-body text-xs text-muted-foreground">{c.name}</span>
                                    </button>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {gStep === "form" && (
                      <>
                        {/* Wallet address — compact inline */}
                        <div className="mt-4">
                          <label className="mb-1.5 flex items-center gap-1.5 font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            <Wallet className="h-3 w-3" />
                            {gTradeDirection === "sell"
                              ? `Your bank / ${gToCurrency?.ticker || "fiat"} payout details`
                              : `Your ${gToCurrency?.ticker || "crypto"} wallet`}
                          </label>
                          <Input
                            type="text"
                            placeholder={gTradeDirection === "sell"
                              ? `Payout details will be collected at checkout`
                              : `Paste your ${gToCurrency?.ticker || "crypto"} address`}
                            value={gPayoutAddress}
                            onChange={(e) => setGPayoutAddress(e.target.value)}
                            className="min-h-[48px] rounded-xl border-border bg-accent font-mono text-xs placeholder:text-muted-foreground/50"
                          />
                        </div>

                        {/* Fee breakdown — slim */}
                        {gFullEstimate && (
                          <div className="mt-3 space-y-1.5 rounded-xl border border-border bg-accent/40 px-4 py-3">
                            {gFullEstimate.service_fees?.map((fee, i) => (
                              <div key={i} className="flex items-center justify-between font-body text-[11px]">
                                <span className="text-muted-foreground">Fee ({fee.percentage})</span>
                                <span className="font-medium text-foreground">{fee.amount} {fee.currency}</span>
                              </div>
                            ))}
                            {gFullEstimate.network_fee && (
                              <div className="flex items-center justify-between font-body text-[11px]">
                                <span className="text-muted-foreground">Network</span>
                                <span className="font-medium text-foreground">{parseFloat(gFullEstimate.network_fee.amount).toFixed(6)} {gFullEstimate.network_fee.currency}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between border-t border-border pt-1.5 font-body text-[11px]">
                              <span className="text-muted-foreground">Rate</span>
                              <span className="font-medium text-foreground">1 {gFromCurrency?.ticker} ≈ {gFullEstimate.estimated_exchange_rate} {gToCurrency?.ticker}</span>
                            </div>
                          </div>
                        )}

                        {/* Dynamic Payment Methods */}
                        {gPaymentMethods.length > 0 && (
                          <div className="mt-3">
                            <label className="mb-1.5 block font-body text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              Payment Method
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                              {gPaymentMethods.map((pm) => {
                                const label = pm.type?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || pm.payment_category;
                                const isSelected = gSelectedPaymentMethod === pm.type;
                                return (
                                  <button
                                    key={pm.type}
                                    onClick={() => setGSelectedPaymentMethod(pm.type)}
                                    className={`inline-flex items-center rounded-full border px-2.5 py-1 font-body text-[10px] font-semibold tracking-wide transition-all ${
                                      isSelected
                                        ? "border-primary/30 bg-primary/10 text-primary shadow-sm"
                                        : "border-border bg-background/80 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                                    }`}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* CTA */}
                        <Button
                          className="mt-5 w-full min-h-[52px] rounded-xl text-base font-bold tracking-wide transition-all duration-300 hover:shadow-neon shadow-card"
                          size="lg"
                          style={{
                            background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--trust)) 100%)",
                            color: "hsl(var(--primary-foreground))",
                          }}
                          disabled={gCreatingTx || !gEstimatedAmount || gEstimatedAmount === "—" || (parseFloat(gSendAmount) < gMinAmount) || (parseFloat(gSendAmount) > gMaxAmount)}
                          onClick={handleStartGuardarianCheckout}
                        >
                          {gCreatingTx ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Opening checkout…</>
                          ) : gTradeDirection === "sell" ? (
                            <><CreditCard className="mr-2 h-4 w-4" />Sell {gFromCurrency?.ticker || "Crypto"}</>
                          ) : (
                            <><CreditCard className="mr-2 h-4 w-4" />Buy {gToCurrency?.ticker || "Crypto"}</>
                          )}
                        </Button>

                        {/* Trust signals — compact row */}
                        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                          <span className="flex items-center gap-1 font-body text-[10px] text-muted-foreground"><Shield className="h-3 w-3 text-primary" /> Regulated provider</span>
                          <span className="flex items-center gap-1 font-body text-[10px] text-muted-foreground"><Lock className="h-3 w-3 text-primary" /> Secure checkout</span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                          {gPaymentMethods.length > 0 ? (
                            gPaymentMethods.slice(0, 5).map((pm) => {
                              const label = pm.type?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || pm.payment_category;
                              return <PaymentMethodChip key={pm.type} label={label} accent={gSelectedPaymentMethod === pm.type} />;
                            })
                          ) : (
                            <>
                              <PaymentMethodChip label="Visa" accent />
                              <PaymentMethodChip label="Mastercard" accent />
                              <PaymentMethodChip label="SEPA" />
                              <PaymentMethodChip label="Apple Pay" />
                              <PaymentMethodChip label="Google Pay" />
                            </>
                          )}
                        </div>
                      </>
                    )}

                    {/* ===== STEP 2: PROVIDER COMPARISON ===== */}
                    {false && gStep === "compare" && (
                      <div className="mt-4 space-y-4">
                        <button
                          onClick={() => { setGCheckoutUrl(""); setGStep("form"); }}
                          className="flex items-center gap-1.5 font-body text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" /> Back
                        </button>
                        <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-elevated">
                          <div className="bg-hero-gradient p-4 text-primary-foreground sm:p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-foreground/75">Live quote</p>
                                <h3 className="mt-1 font-display text-xl font-bold">Payment offers</h3>
                                <p className="mt-1 max-w-lg font-body text-xs text-primary-foreground/80">
                                  Final availability can vary by country, bank, payment method, and verification status.
                                </p>
                              </div>
                              <span className="inline-flex w-fit items-center rounded-full border border-primary-foreground/20 bg-background/10 px-3 py-1 font-body text-[11px] font-semibold uppercase tracking-wide text-primary-foreground">
                                In-app first
                              </span>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                              <div className="rounded-2xl border border-primary-foreground/15 bg-background/10 p-4">
                                <p className="font-body text-[11px] uppercase tracking-wide text-primary-foreground/70">You pay</p>
                                <p className="mt-1 font-display text-2xl font-bold">{gSendAmount} {gFromCurrency?.ticker}</p>
                              </div>
                              <div className="rounded-2xl border border-primary-foreground/15 bg-background/10 p-4">
                                <p className="font-body text-[11px] uppercase tracking-wide text-primary-foreground/70">You get</p>
                                <p className="mt-1 font-display text-2xl font-bold">{gEstimating ? "…" : gEstimatedAmount || "—"} {gToCurrency?.ticker}</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 p-4 sm:p-5">
                            <div>
                              <label className="mb-1.5 block font-body text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                Recipient {gToCurrency?.ticker} address
                              </label>
                              <Input
                                type="text"
                                placeholder={`Enter your ${gToCurrency?.ticker || "crypto"} wallet address`}
                                value={gPayoutAddress}
                                onChange={(e) => setGPayoutAddress(e.target.value)}
                                className="min-h-[52px] rounded-2xl border-border bg-background font-mono text-xs"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => setGSelectedProvider("guardarian")}
                              className={`w-full rounded-[24px] border p-4 text-left transition-all duration-200 ${
                                gSelectedProvider === "guardarian"
                                  ? "border-primary bg-primary/5 shadow-card"
                                  : "border-border bg-card hover:border-primary/40"
                              }`}
                            >
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex items-start gap-3">
                                  <ProviderMark letter="G" />
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-display text-lg font-bold text-foreground">Guardarian</span>
                                      <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wide text-primary">Live</span>
                                    </div>
                                    <p className="mt-1 font-body text-xs text-muted-foreground">
                                      Embedded checkout with region-aware availability and provider-side compliance checks.
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      <PaymentMethodChip label="Visa" accent />
                                      <PaymentMethodChip label="Mastercard" accent />
                                      <PaymentMethodChip label="SEPA" />
                                      <PaymentMethodChip label="Apple Pay" />
                                      <PaymentMethodChip label="Google Pay" />
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                                  <div>
                                    <p className="font-body text-[11px] uppercase tracking-wide text-muted-foreground">Estimated receive</p>
                                    <p className="mt-1 font-display text-xl font-bold text-foreground">{gEstimating ? "…" : gEstimatedAmount || "—"} {gToCurrency?.ticker}</p>
                                  </div>
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                                    <CheckCircle2 className="h-4 w-4" />
                                  </div>
                                </div>
                              </div>
                            </button>

                            <div className="w-full rounded-[24px] border border-border bg-accent/40 p-4 opacity-80">
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex items-start gap-3">
                                  <ProviderMark letter="T" tone="muted" />
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-display text-lg font-bold text-foreground">Transak</span>
                                      <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Unavailable</span>
                                    </div>
                                    <p className="mt-1 font-body text-xs text-muted-foreground">
                                      Hidden from checkout until valid partner credentials are configured.
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      <PaymentMethodChip label="Visa" />
                                      <PaymentMethodChip label="Mastercard" />
                                      <PaymentMethodChip label="Bank transfer" />
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-full border border-border bg-background px-3 py-1 font-body text-[11px] font-medium text-muted-foreground">
                                  Broken path removed
                                </div>
                              </div>
                            </div>

                            {gFullEstimate && (
                              <div className="rounded-2xl border border-border bg-accent/40 p-4 space-y-2">
                                {gFullEstimate.service_fees?.map((fee, i) => (
                                  <div key={i} className="flex items-center justify-between gap-3 font-body text-[11px]">
                                    <span className="text-muted-foreground">Service fee ({fee.percentage})</span>
                                    <span className="font-medium text-foreground">{fee.amount} {fee.currency}</span>
                                  </div>
                                ))}
                                {gFullEstimate.network_fee && (
                                  <div className="flex items-center justify-between gap-3 font-body text-[11px]">
                                    <span className="text-muted-foreground">Network fee</span>
                                    <span className="font-medium text-foreground">{parseFloat(gFullEstimate.network_fee.amount).toFixed(8)} {gFullEstimate.network_fee.currency}</span>
                                  </div>
                                )}
                                <div className="flex items-center justify-between gap-3 border-t border-border pt-2 font-body text-[11px]">
                                  <span className="text-muted-foreground">Rate</span>
                                  <span className="font-medium text-foreground">1 {gFromCurrency?.ticker} ≈ {gFullEstimate.estimated_exchange_rate} {gToCurrency?.ticker}</span>
                                </div>
                              </div>
                            )}

                            <Button
                              className="w-full min-h-[52px] rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-neon shadow-card text-sm font-bold transition-all duration-300"
                              size="lg"
                              disabled={gCreatingTx || !gPayoutAddress.trim() || gSelectedProvider !== "guardarian"}
                              onClick={handleStartGuardarianCheckout}
                            >
                              {gCreatingTx ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CreditCard className="mr-2 h-4 w-4" />Continue with Guardarian</>}
                            </Button>

                            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                              <span className="flex items-center gap-1 font-body text-[10px] text-muted-foreground"><Shield className="h-3 w-3" /> Regulated</span>
                              <span className="flex items-center gap-1 font-body text-[10px] text-muted-foreground"><Lock className="h-3 w-3" /> KYC-compliant</span>
                              <span className="flex items-center gap-1 font-body text-[10px] text-muted-foreground"><CheckCircle2 className="h-3 w-3" /> Embedded when supported</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {gStep === "checkout" && (
                      <div className="mt-4 space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <button
                            onClick={() => setGStep("compare")}
                            className="flex items-center gap-1.5 font-body text-xs text-muted-foreground transition-colors hover:text-foreground"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" /> Back to offers
                          </button>

                          {gCheckoutUrl && (
                            <button
                              onClick={() => window.open(gCheckoutUrl, "_blank", "noopener,noreferrer")}
                              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 font-body text-xs font-semibold text-foreground transition-colors hover:bg-accent"
                            >
                              Open in new tab <ExternalLink className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-elevated">
                          <div className="border-b border-border bg-accent/40 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
                            <div>
                              <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Secure checkout</p>
                              <h3 className="mt-1 font-display text-lg font-bold text-foreground">Complete your purchase without leaving this page</h3>
                              <p className="mt-1 font-body text-xs text-muted-foreground">
                                Some bank or identity verification flows can still open provider-controlled windows when required.
                              </p>
                            </div>

                            <div className="mt-3 flex items-center gap-3 sm:mt-0">
                              <ProviderMark letter="G" />
                              <div>
                                <p className="font-display text-sm font-bold text-foreground">Guardarian</p>
                                <p className="font-body text-[11px] text-muted-foreground">{gSendAmount} {gFromCurrency?.ticker} → {gEstimatedAmount || "—"} {gToCurrency?.ticker}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-background p-2 sm:p-3">
                            {gCheckoutUrl ? (
                              <iframe
                                title="Guardarian checkout"
                                src={gCheckoutUrl}
                                className="h-[720px] w-full rounded-[24px] border border-border bg-background"
                                referrerPolicy="strict-origin-when-cross-origin"
                              />
                            ) : (
                              <div className="flex h-[420px] items-center justify-center rounded-[24px] border border-border bg-accent/30">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 rounded-2xl border border-border bg-accent/50 p-3 font-body text-[11px] text-muted-foreground">
                          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>If your browser or bank blocks the embedded step, use the fallback button above to continue in a new tab.</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ===== EXCHANGE MODE (ChangeNOW) ===== */}
            {widgetMode === "exchange" && (
              <>
                {/* Rate Type Toggle */}
                <div className="mb-4 flex items-center gap-2">
                  <button
                    onClick={() => setFixedRate(true)}
                    className={`relative rounded-lg border px-3 py-1.5 font-body text-xs font-semibold transition-colors ${
                      fixedRate
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                        : "border-border bg-accent text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <Lock className="me-1 inline h-3 w-3" /> Fixed Rate
                    <span className="ms-1.5 inline-flex rounded bg-primary/20 px-1.5 py-0.5 font-body text-[9px] font-bold uppercase tracking-wider text-primary">
                      Recommended
                    </span>
                  </button>
                  <button
                    onClick={() => setFixedRate(false)}
                    className={`rounded-lg border px-3 py-1.5 font-body text-xs font-semibold transition-colors ${
                      !fixedRate
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-accent text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    Expected Rate
                  </button>
                </div>

                {/* Popular Assets Quick Select */}
                <div className="mb-4 flex items-center gap-2">
                  <span className="font-body text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Popular:</span>
                  {["btc", "eth", "usdt", "sol"].map((ticker) => {
                    const c = currencies.find((cur) => cur.ticker === ticker);
                    if (!c) return null;
                    return (
                      <button
                        key={ticker}
                        onClick={() => setFromCurrency(c)}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-display text-xs font-semibold uppercase transition-colors ${
                          fromCurrency?.ticker === ticker
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-accent text-foreground hover:border-primary/40"
                        }`}
                      >
                        {c.image && <img src={c.image} alt="" className="h-4 w-4 rounded-full" />}
                        {ticker}
                      </button>
                    );
                  })}
                </div>

                <div className="relative">
                  <label className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">You Send</label>
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-accent p-4 sm:p-4">
                    <Input
                      type="number"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      className="flex-1 border-none bg-transparent p-0 font-display text-2xl font-bold text-foreground shadow-none focus-visible:ring-0"
                      min={0}
                      step="any"
                    />
                    <button onClick={() => setShowFromPicker(true)} className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5 transition-colors hover:bg-primary/20 touch-target">
                      {fromCurrency?.image && <img src={fromCurrency.image} alt="" className="h-5 w-5 rounded-full" />}
                      <span className="font-display text-sm font-semibold uppercase text-primary">{fromCurrency ? displayTicker(fromCurrency) : "Select"}</span>
                      {fromCurrency && networkLabel(fromCurrency) && (
                        <span className="rounded bg-primary/20 px-1 py-0.5 font-body text-[9px] uppercase text-primary">{networkLabel(fromCurrency)}</span>
                      )}
                    </button>
                  </div>
                  {belowMin && (
                    <p className="mt-1 font-body text-xs text-destructive">
                      Minimum amount: {minAmount} {fromCurrency ? displayTicker(fromCurrency) : ""}
                    </p>
                  )}
                  <CurrencyPicker show={showFromPicker} onSelect={setFromCurrency} onClose={() => setShowFromPicker(false)} exclude={toCurrency?.ticker} />
                </div>

                {/* Rate info bar */}
                <div className="my-3 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                    <span className="flex items-center gap-1 rounded-md border border-trust/20 bg-trust/5 px-2 py-1 font-body text-[10px] font-medium text-trust sm:text-[11px]">
                      <CheckCircle2 className="h-3 w-3" /> All fees included
                    </span>
                    {fromCurrency && toCurrency && estimatedAmount && estimatedAmount !== "—" && parseFloat(sendAmount) > 0 && (
                      <span className="font-body text-[10px] text-muted-foreground sm:text-[11px]">
                        1 {displayTicker(fromCurrency)} ≈ {(parseFloat(estimatedAmount) / parseFloat(sendAmount)).toFixed(6)} {displayTicker(toCurrency)}
                      </span>
                    )}
                  </div>
                  <button onClick={handleSwap} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-primary transition-colors hover:bg-accent" aria-label="Swap currencies">
                    <ArrowDownUp className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative">
                  <label className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    You Get {fixedRate ? <span className="text-trust font-bold">(GUARANTEED)</span> : "(estimated)"}
                  </label>
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-accent p-4 sm:p-4">
                    <span className="flex-1 font-display text-2xl font-bold text-foreground">
                      {estimating ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : `≈ ${estimatedAmount || "—"}`}
                    </span>
                    <button onClick={() => setShowToPicker(true)} className="flex items-center gap-2 rounded-lg bg-trust/10 px-4 py-2.5 transition-colors hover:bg-trust/20 touch-target">
                      {toCurrency?.image && <img src={toCurrency.image} alt="" className="h-5 w-5 rounded-full" />}
                      <span className="font-display text-sm font-semibold uppercase text-trust">{toCurrency ? displayTicker(toCurrency) : "Select"}</span>
                      {toCurrency && networkLabel(toCurrency) && (
                        <span className="rounded bg-trust/20 px-1 py-0.5 font-body text-[9px] uppercase text-trust">{networkLabel(toCurrency)}</span>
                      )}
                    </button>
                  </div>
                  <CurrencyPicker show={showToPicker} onSelect={setToCurrency} onClose={() => setShowToPicker(false)} exclude={fromCurrency?.ticker} />
                </div>

                <Button className="mt-5 w-full min-h-[52px] bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-neon shadow-card text-base font-bold transition-shadow duration-300" size="lg" disabled={!estimatedAmount || estimatedAmount === "—" || belowMin} onClick={handleExchangeNow}>
                  Exchange Now
                </Button>
                <p className="mt-1.5 flex items-center justify-center gap-1.5 font-body text-[11px] text-muted-foreground">
                  <Shield className="h-3 w-3 text-primary" />
                  Secure Swap via Registered MSB
                </p>
              </>
            )}

            {/* Trust signals row */}
            <div className="mt-2 grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-accent/50 p-2.5 text-center">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-body text-[10px] font-medium text-muted-foreground">Reliable Exchange</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-accent/50 p-2.5 text-center">
                <Lock className="h-4 w-4 text-primary" />
                <span className="font-body text-[10px] font-medium text-muted-foreground">Highest Protection</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-accent/50 p-2.5 text-center">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="font-body text-[10px] font-medium text-muted-foreground">Complete Anonymity</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-3">
              <p className="font-body text-xs text-muted-foreground">No hidden fees · No account required · Permissionless</p>
              {speedForecast && (
                <span className="flex items-center gap-1 font-body text-xs text-primary">
                  <Clock className="h-3 w-3" /> ~{speedForecast}
                </span>
              )}
            </div>

            {/* Track existing transfer */}
            <div className="mt-5 pt-5 border-t border-border/60">
              <button
                onClick={() => setShowTracker(!showTracker)}
                className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-primary/25 bg-primary/[0.06] px-4 py-3 font-body text-sm font-medium text-primary transition-all hover:bg-primary/[0.12] hover:border-primary/40 hover:shadow-[0_0_20px_-4px_hsl(var(--primary)/0.15)]"
              >
                <Search className="h-4 w-4 transition-transform group-hover:scale-110" />
                Track an Existing Transfer
                <ChevronDown className={`h-3.5 w-3.5 opacity-60 transition-transform duration-200 ${showTracker ? "rotate-180" : ""}`} />
              </button>
              {showTracker && (
                <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Search box */}
                  <div className="rounded-xl border border-border/80 bg-accent/40 p-5 space-y-3.5 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                        <Search className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="font-display text-sm font-semibold text-foreground">Find Your Transfer</p>
                        <p className="font-body text-[11px] text-muted-foreground">Enter a wallet address or transaction ID</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Wallet address or Transaction ID"
                        value={trackInput}
                        onChange={(e) => setTrackInput(e.target.value)}
                        className="flex-1 font-body text-sm border-border/80 bg-background/60 placeholder:text-muted-foreground/50 focus-visible:ring-primary/30"
                        onKeyDown={(e) => e.key === "Enter" && handleTrackTransaction()}
                      />
                      <Button
                        onClick={handleTrackTransaction}
                        disabled={!trackInput.trim() || trackLoading}
                        className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-5 shadow-sm"
                      >
                        {trackLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                          <span className="flex items-center gap-1.5"><Search className="h-3.5 w-3.5" /> Find</span>
                        )}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "BTC", example: "bc1q…, 1A…, 3M…" },
                        { label: "ETH/EVM", example: "0x…" },
                        { label: "SOL", example: "Base58" },
                        { label: "TRON", example: "T…" },
                        { label: "BCH", example: "bitcoincash:…" },
                      ].map(({ label }) => (
                        <span key={label} className="rounded-md border border-border/60 bg-background/50 px-2 py-0.5 font-body text-[10px] font-medium text-muted-foreground">{label}</span>
                      ))}
                    </div>
                  </div>

                  {/* Wallet lookup results */}
                  {walletResults.length > 0 && (
                    <div className="rounded-xl border border-trust/30 bg-trust/[0.04] p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-trust/10">
                          <CheckCircle2 className="h-3.5 w-3.5 text-trust" />
                        </div>
                        <p className="font-display text-sm font-semibold text-foreground">
                          {walletResults.length} transfer{walletResults.length > 1 ? "s" : ""} found
                        </p>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {walletResults.map((tx) => (
                          <button
                            key={tx.transaction_id}
                            onClick={() => handleSelectWalletTx(tx.transaction_id)}
                            className="group flex w-full items-center justify-between gap-3 rounded-lg border border-border/80 bg-background/60 px-4 py-3 text-left transition-all hover:border-primary/40 hover:bg-accent/60 hover:shadow-sm"
                          >
                            <div className="min-w-0 space-y-0.5">
                              <span className="flex items-center gap-1.5 font-body text-sm font-semibold text-foreground">
                                <ArrowLeftRight className="h-3.5 w-3.5 text-primary" />
                                {Number(tx.amount)} {tx.from_currency?.toUpperCase()} → {tx.to_currency?.toUpperCase()}
                              </span>
                              <span className="block font-body text-[11px] text-muted-foreground">
                                {new Date(tx.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <code className="font-body text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
                                {tx.transaction_id.slice(0, 8)}…
                              </code>
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent transactions from localStorage */}
                  {(() => {
                    const recent = getRecentTxs();
                    if (recent.length === 0) return null;
                    return (
                      <div className="rounded-xl border border-border/80 bg-accent/30 p-4 shadow-sm">
                        <p className="mb-2.5 font-display text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-primary/70" /> Recent transfers on this device
                        </p>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto">
                          {recent.map((tx) => (
                            <button
                              key={tx.id}
                              onClick={() => { setTrackInput(tx.id); }}
                              className="group flex w-full items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2.5 text-left transition-all hover:border-primary/40 hover:bg-accent/60"
                            >
                              <div className="min-w-0">
                                <span className="font-body text-xs font-semibold text-foreground">
                                  {tx.amount} {tx.from?.toUpperCase()} → {tx.to?.toUpperCase()}
                                </span>
                                <span className="ms-2 font-body text-[10px] text-muted-foreground">
                                  {new Date(tx.date).toLocaleDateString()}
                                </span>
                              </div>
                              <code className="shrink-0 font-body text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
                                {tx.id.slice(0, 8)}…
                              </code>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ===== STEP 2: Recipient Address ===== */}
        {step === "address" && (
          <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={() => setStep("exchange")} className="mb-4 flex items-center gap-1.5 font-body text-sm text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            <h2 className="mb-2 font-display text-lg font-semibold text-foreground">
              Enter your {toCurrency?.ticker?.toUpperCase()} Recipient Address
            </h2>
            <p className="mb-4 font-body text-sm text-muted-foreground">
              Your <span className="font-semibold uppercase text-foreground">{toCurrency?.ticker}</span> will be sent to this address.
            </p>

            {/* Wallet Connect Buttons */}
            {(() => {
              const chainType = getChainType(toCurrency);
              if (chainType === "other") return null;
              return (
                <div className="mb-4 space-y-2">
                  <label className="block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Connect Wallet
                  </label>
                  <div className="flex gap-2">
                    {chainType === "evm" && (
                      <>
                        <button
                          onClick={connectMetaMask}
                          className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-3 transition-all active:scale-[0.98] ${
                            connectedWallet?.type === "evm"
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card text-foreground hover:border-primary/50 hover:shadow-card"
                          }`}
                        >
                          <svg className="h-5 w-5" viewBox="0 0 35 33" fill="none"><path d="M32.96 1l-13.14 9.72 2.45-5.73L32.96 1z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/><path d="M2.66 1l13.02 9.81L13.35 4.99 2.66 1z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/><path d="M28.23 23.53l-3.5 5.34 7.49 2.06 2.15-7.28-6.14-.12zM.99 23.65l2.13 7.28 7.47-2.06-3.48-5.34-6.12.12z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          <span className="font-display text-sm font-semibold">MetaMask</span>
                        </button>
                        <button
                          onClick={connectTrustWallet}
                          className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-3 transition-all active:scale-[0.98] ${
                            connectedWallet?.type === "evm"
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card text-foreground hover:border-primary/50 hover:shadow-card"
                          }`}
                        >
                          <Shield className="h-5 w-5 text-[hsl(220,90%,56%)]" />
                          <span className="font-display text-sm font-semibold">Trust</span>
                        </button>
                      </>
                    )}
                    {connectedWallet?.type === "evm" && (
                      <div className="col-span-2 text-center font-body text-xs text-primary">
                        {connectedWallet.address.slice(0, 6)}...{connectedWallet.address.slice(-4)}
                      </div>
                    )}
                    {chainType === "solana" && (
                      <button
                        onClick={connectPhantom}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-3 transition-all active:scale-[0.98] ${
                          connectedWallet?.type === "solana"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-foreground hover:border-primary/50 hover:shadow-card"
                        }`}
                      >
                        <Wallet className="h-5 w-5" />
                        <span className="font-display text-sm font-semibold">
                          {connectedWallet?.type === "solana"
                            ? `${connectedWallet.address.slice(0, 6)}...${connectedWallet.address.slice(-4)}`
                            : "Phantom"}
                        </span>
                      </button>
                    )}
                  </div>
                  {connectedWallet && (
                    <button
                      onClick={() => { setConnectedWallet(null); setRecipientAddress(""); }}
                      className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Disconnect wallet
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Divider when wallet connect is available */}
            {getChainType(toCurrency) !== "other" && (
              <div className="mb-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="font-body text-xs text-muted-foreground">or enter manually</span>
                <div className="h-px flex-1 bg-border" />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {toCurrency?.ticker?.toUpperCase()} Wallet Address *
                </label>
                <DestinationAddressInput
                  value={recipientAddress}
                  onChange={refLinkAddressLocked ? () => {} : setRecipientAddress}
                  onValidChange={setAddressValid}
                  currencyTicker={toCurrency?.ticker}
                  expectedNetworkType={tickerToAddressType(toCurrency?.ticker, toCurrency?.network)}
                  disabled={refLinkAddressLocked}
                />
              </div>

              {toCurrency?.hasExternalId && (
                <div>
                  <label className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Memo / Extra ID (if required)
                  </label>
                  <Input
                    placeholder="Memo, tag, or extra ID"
                    value={extraId}
                    onChange={(e) => setExtraId(e.target.value)}
                    className="font-body text-sm"
                  />
                </div>
              )}

            </div>

            {/* Summary */}
            <div className="mt-6 rounded-xl border border-border bg-accent p-4">
              <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Exchange Summary</h3>
              <div className="space-y-2 font-body text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">You send</span>
                  <span className="font-semibold text-foreground">{sendAmount} {fromCurrency?.ticker?.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">You get (est.)</span>
                  <span className={`font-semibold transition-opacity ${rateExpired ? "text-muted-foreground opacity-50" : "text-foreground"}`}>
                    {refreshingRate ? <Loader2 className="inline h-3.5 w-3.5 animate-spin" /> : <>≈ {estimatedAmount}</>} {toCurrency?.ticker?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="mt-5 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-border accent-trust"
              />
              <span className="font-body text-xs text-muted-foreground leading-relaxed">
                I've read and agree to the{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                  Terms of Use
                </a>
                ,{" "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                  Privacy Policy
                </a>
                {" "}and{" "}
                <a href="/aml" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                  AML Policy
                </a>
              </span>
            </label>

            {/* Price Lock Countdown */}
            {addressValid && (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-accent/50 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  {rateExpired ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <div className="relative flex items-center justify-center">
                      <svg className="h-5 w-5 -rotate-90" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="8" fill="none" strokeWidth="2" className="stroke-muted" />
                        <circle
                          cx="10" cy="10" r="8" fill="none" strokeWidth="2"
                          className={`transition-all duration-1000 ease-linear ${rateLockSeconds <= 10 ? "stroke-amber-400" : "stroke-primary"}`}
                          strokeDasharray={`${2 * Math.PI * 8}`}
                          strokeDashoffset={`${2 * Math.PI * 8 * (1 - rateLockSeconds / 60)}`}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  )}
                  <span
                    className={`font-body text-xs transition-colors ${
                      rateExpired
                        ? "text-destructive"
                        : rateLockSeconds <= 10
                        ? "text-amber-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {rateExpired ? (
                      <>Rate expired.</>
                    ) : (
                      <>
                        Rate locked for{" "}
                        <span style={{ fontFamily: "'Roboto Mono', monospace" }} className="font-semibold">
                          {String(Math.floor(rateLockSeconds / 60)).padStart(2, "0")}:{String(rateLockSeconds % 60).padStart(2, "0")}
                        </span>
                      </>
                    )}
                  </span>
                </div>
                <button
                  onClick={handleRefreshRate}
                  disabled={refreshingRate}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                  title="Refresh rate"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${refreshingRate ? "animate-spin" : ""}`} />
                </button>
              </div>
            )}

            <Button
              id="execute-swap"
              aria-label="Initiate cryptocurrency swap"
              className="mt-4 w-full min-h-[52px] bg-trust text-trust-foreground hover:bg-trust/90 text-base font-bold"
              size="lg"
              disabled={!addressValid || !termsAccepted || creatingTx || rateExpired}
              onClick={handleCreateTransaction}
            >
              {creatingTx ? <><Loader2 className="me-2 h-4 w-4 animate-spin" /> Creating Exchange...</> : "Confirm & Create Exchange"}
            </Button>
          </motion.div>
        )}

        {/* ===== STEP 3: Deposit Address ===== */}
        {step === "deposit" && transaction && (
          <motion.div key="deposit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-trust/10">
                <CheckCircle2 className="h-6 w-6 text-trust" />
              </div>
              <h2 className="font-display text-lg font-semibold text-foreground">Please send the funds you would like to exchange</h2>
            </div>

            <div className="space-y-4">
              {/* Amount + Address + QR */}
              <div className="rounded-xl border border-border bg-accent p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <label className="mb-1 block font-body text-xs text-muted-foreground">Amount</label>
                    <p className="font-display text-xl font-bold text-foreground">
                      {sendAmount} {fromCurrency?.ticker?.toUpperCase()}
                    </p>
                    <label className="mb-1 mt-3 block font-body text-xs text-muted-foreground">To this address</label>
                    <div className="flex items-center gap-2">
                      <code id="deposit-address-display" className="break-all font-body text-sm font-semibold text-foreground">
                        {transaction.payinAddress}
                      </code>
                      <CopyButton text={transaction.payinAddress} label="deposit" />
                    </div>
                    {transaction.payinExtraId && (
                      <div className="mt-2">
                        <label className="mb-0.5 block font-body text-xs text-muted-foreground">Memo / Extra ID</label>
                        <div className="flex items-center gap-2">
                          <code className="break-all font-body text-sm font-semibold text-foreground">
                            {transaction.payinExtraId}
                          </code>
                          <CopyButton text={transaction.payinExtraId} label="memo" />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* QR Code */}
                  <div className="shrink-0 rounded-lg border border-border bg-white p-2">
                    <QRCodeSVG
                      value={(() => {
                        const ticker = fromCurrency?.ticker?.toLowerCase() || "";
                        const addr = transaction.payinAddress;
                        const amount = sendAmount;
                        // EVM chains use ethereum: URI
                        if (["eth", "bnb", "matic", "avax", "arb", "op"].some(t => ticker.includes(t)) || fromCurrency?.network === "eth" || fromCurrency?.network === "bsc" || fromCurrency?.network === "matic") {
                          return `ethereum:${addr}?value=${amount}`;
                        }
                        // Bitcoin
                        if (ticker === "btc") return `bitcoin:${addr}?amount=${amount}`;
                        // Solana
                        if (ticker === "sol") return `solana:${addr}?amount=${amount}`;
                        // Default: just the address
                        return addr;
                      })()}
                      size={96}
                      level="M"
                      className="h-24 w-24"
                    />
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <p className="font-body text-xs text-amber-600 dark:text-amber-400">
                  ⚠ Please be careful not to deposit your {fromCurrency?.ticker?.toUpperCase()} from a smart contract.
                </p>
              </div>

              {/* Wallet deposit buttons — only for EVM-compatible tokens */}
              {(() => {
                const ticker = fromCurrency?.ticker?.toLowerCase() || "";
                const network = fromCurrency?.network?.toLowerCase() || "";
                const isEvm = ["eth", "bsc", "matic", "avax", "arb", "op", "base"].includes(network) ||
                  ["eth", "bnb", "matic", "avax", "usdt", "usdc", "dai", "wbtc", "link", "uni", "aave", "hype", "bera"].some(t => ticker === t);
                if (!isEvm) return null;

                const handleMetaMask = async () => {
                  const eth = typeof window !== "undefined" ? (window as any).ethereum : null;
                  let provider = eth;
                  if (eth?.providers?.length) {
                    provider = eth.providers.find((p: any) => p.isMetaMask && !p.isTrust) || eth.providers.find((p: any) => p.isMetaMask);
                  }
                  if (!provider || !provider.isMetaMask) {
                    toast({ title: "MetaMask not found", description: "Please install MetaMask browser extension to use this feature.", variant: "destructive" });
                    return;
                  }
                  try {
                    const accounts = await provider.request({ method: "eth_requestAccounts" });
                    if (!accounts?.[0]) throw new Error("No account found");
                    
                    // For native ETH/BNB transfers
                    const isNative = ["eth", "bnb", "matic", "avax"].includes(ticker);
                    if (isNative) {
                      const weiValue = "0x" + (BigInt(Math.floor(parseFloat(sendAmount) * 1e18))).toString(16);
                      await provider.request({
                        method: "eth_sendTransaction",
                        params: [{
                          from: accounts[0],
                          to: transaction.payinAddress,
                          value: weiValue,
                        }],
                      });
                      toast({ title: "Transaction sent!", description: "Your deposit has been submitted via MetaMask." });
                      handleProceedToStatus();
                    } else {
                      // For ERC-20 tokens, just copy address since we'd need the contract address
                      await navigator.clipboard.writeText(transaction.payinAddress);
                      toast({ title: "Address copied", description: "Please send the tokens to the copied address via MetaMask." });
                    }
                  } catch (err: any) {
                    if (err?.code === 4001) return; // User rejected
                    toast({ title: "MetaMask Error", description: err?.message || "Transaction failed", variant: "destructive" });
                  }
                };

                return (
                  <div className="space-y-2">
                    <label className="block font-body text-xs font-medium text-muted-foreground">Deposit with</label>
                    <button
                      onClick={handleMetaMask}
                      className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-orange-400/50 hover:shadow-card active:scale-[0.99]"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
                        <Wallet className="h-5 w-5 text-orange-500" />
                      </div>
                      <span className="font-display text-sm font-semibold text-foreground">Pay with MetaMask</span>
                    </button>
                    <button
                      onClick={() => {
                        handleCopy(transaction.payinAddress, "wc-address");
                        toast({ title: "Address copied", description: "Open your preferred wallet app and send to the copied address." });
                      }}
                      className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-blue-400/50 hover:shadow-card active:scale-[0.99]"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                        <QrCode className="h-5 w-5 text-blue-500" />
                      </div>
                      <span className="font-display text-sm font-semibold text-foreground">Copy for Wallet App</span>
                    </button>
                  </div>
                );
              })()}

              {/* Transaction ID */}
              <div className="rounded-xl border border-border bg-accent p-4">
                <label className="mb-1 block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">Transaction ID</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 break-all font-body text-sm text-foreground">{transaction.id}</code>
                  <CopyButton text={transaction.id} label="txid" />
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-xl border border-border bg-accent p-4">
                <div className="space-y-2 font-body text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sending</span>
                    <span className="font-semibold text-foreground">{sendAmount} {fromCurrency?.ticker?.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Receiving to</span>
                    <span className="max-w-[200px] truncate font-semibold text-foreground">{transaction.payoutAddress}</span>
                  </div>
                </div>
              </div>

              {/* Useful tips */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-5">
                <h3 className="font-display text-base font-semibold text-foreground">Useful tips to know</h3>

                <div>
                  <p className="font-display text-sm font-semibold text-foreground mb-2">We will process your transaction even if you:</p>
                  <ul className="space-y-2">
                    {[
                      "Send a deposit in the wrong network, if this asset is supported on our service",
                      "Create a transaction with a wrong coin",
                      "Send more than one deposit for the same transaction",
                      "Send a deposit long after the exchange was created or completed",
                    ].map((tip) => (
                      <li key={tip} className="flex items-start gap-2 font-body text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-trust" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="font-display text-sm font-semibold text-foreground mb-2">We will not be able to proceed on the initial terms if you:</p>
                  <ul className="space-y-2">
                    {[
                      "Send a deposit for a fixed-rate exchange after the rate expires, provided that the rate declines over this timeframe",
                      "Make a transaction using the wrong contract address",
                    ].map((tip) => (
                      <li key={tip} className="flex items-start gap-2 font-body text-sm text-muted-foreground">
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 rounded-lg border border-border bg-accent p-3">
                    <p className="font-body text-xs text-muted-foreground">
                      In these cases, we encourage you to contact our <a href="mailto:support@globalpayboost.com" className="font-semibold text-trust hover:underline">support team</a>. The exchange can be continued from there, or alternatively, you are free to request a refund.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="font-display text-sm font-semibold text-foreground mb-2">How to cancel an exchange:</p>
                  <ul className="space-y-2">
                    {[
                      "If you didn't send any funds yet, there is no need to cancel the transaction, you can simply create a new one",
                      "If you have already sent the funds for the exchange, immediately contact our support team for assistance",
                    ].map((tip) => (
                      <li key={tip} className="flex items-start gap-2 font-body text-sm text-muted-foreground">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Email notification box */}
            <div className="mt-6 rounded-xl border border-border bg-accent p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="mb-3 font-display text-sm font-semibold text-foreground">
                    Want to get status on your email?
                  </p>
                  {emailSubmitted ? (
                    <div className="flex items-center gap-2 rounded-lg border border-trust/20 bg-trust/5 p-3">
                      <CheckCircle2 className="h-4 w-4 text-trust" />
                      <span className="font-body text-sm text-trust">Subscribed! We'll notify you of updates.</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        className="flex-1 font-body text-sm"
                        maxLength={255}
                      />
                      <Button
                        onClick={handleEmailSubscribe}
                        disabled={!notifyEmail.trim() || emailSubmitting}
                        className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                      >
                        {emailSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg" onClick={handleProceedToStatus}>
              I've Sent the Deposit — Track Status
            </Button>
          </motion.div>
        )}

        {/* ===== STEP 4: Transaction Status ===== */}
        {step === "status" && transaction && (
          <motion.div key="status" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="mb-6 font-display text-lg font-semibold text-foreground">Transaction Status</h2>

            {/* Status indicator */}
            {txStatus && (
              <div className="mb-6">
                {(() => {
                  const s = STATUS_LABELS[txStatus.status] || { label: txStatus.status, color: "text-muted-foreground", icon: <Clock className="h-5 w-5" /> };
                  return (
                    <div className={`flex items-center gap-3 rounded-xl border border-border bg-accent p-4 ${s.color}`}>
                      {s.icon}
                      <div>
                        <p className="font-display text-sm font-semibold">{s.label}</p>
                        <p className="font-body text-xs text-muted-foreground">Transaction ID: {txStatus.id}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Progress steps */}
            <div className="mb-6 space-y-0">
              {["waiting", "confirming", "exchanging", "sending", "finished"].map((statusKey, i, arr) => {
                const currentIdx = arr.indexOf(txStatus?.status || "waiting");
                const isDone = i < currentIdx;
                const isCurrent = i === currentIdx;
                const isFailed = txStatus?.status === "failed" && isCurrent;
                return (
                  <div key={statusKey} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                        isDone ? "border-trust bg-trust text-trust-foreground" :
                        isCurrent ? (isFailed ? "border-destructive bg-destructive text-destructive-foreground" : "border-primary bg-primary text-primary-foreground") :
                        "border-border bg-background text-muted-foreground"
                      }`}>
                        {isDone ? <Check className="h-3 w-3" /> : <span className="font-body text-[10px] font-bold">{i + 1}</span>}
                      </div>
                      {i < arr.length - 1 && <div className={`h-6 w-0.5 ${isDone ? "bg-trust" : "bg-border"}`} />}
                    </div>
                    <div className="pb-6">
                      <p className={`font-body text-sm ${isDone || isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                        {STATUS_LABELS[statusKey]?.label || statusKey}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Details */}
            {txStatus && (
              <div className="space-y-3">
                {txStatus.amountSend && (
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Amount sent</span>
                    <span className="font-semibold text-foreground">{txStatus.amountSend} {txStatus.fromCurrency.toUpperCase()}</span>
                  </div>
                )}
                {txStatus.amountReceive && (
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Amount received</span>
                    <span className="font-semibold text-trust">{txStatus.amountReceive} {txStatus.toCurrency.toUpperCase()}</span>
                  </div>
                )}
                {txStatus.payinHash && (
                  <div className="font-body text-sm">
                    <span className="text-muted-foreground">Deposit hash</span>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="flex-1 break-all rounded-lg border border-border bg-background px-3 py-2 font-body text-xs text-foreground">
                        {txStatus.payinHash}
                      </code>
                      <CopyButton text={txStatus.payinHash} label="payin-hash" />
                    </div>
                  </div>
                )}
                {txStatus.payoutHash && (
                  <div className="font-body text-sm">
                    <span className="text-muted-foreground">Payout hash</span>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="flex-1 break-all rounded-lg border border-border bg-background px-3 py-2 font-body text-xs text-foreground">
                        {txStatus.payoutHash}
                      </code>
                      <CopyButton text={txStatus.payoutHash} label="payout-hash" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {txStatus?.status === "finished" && (
              <div className="mt-6 space-y-3">
                <div className="flex flex-col items-center gap-2 rounded-xl border border-primary/20 bg-primary/[0.06] p-4 text-center">
                  <span className="text-sm font-medium text-foreground">How was your experience?</span>
                  <p className="text-xs text-muted-foreground">Your feedback helps us improve and helps others find us</p>
                  <a
                    href="https://www.trustpilot.com/evaluate/mrcglobalpay.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-2 rounded-lg bg-[#00b67a] px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  >
                    Leave us a review ⭐
                  </a>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-trust text-trust-foreground hover:bg-trust/90"
                    size="lg"
                    onClick={handleNewExchange}
                  >
                    Start New Exchange
                  </Button>
                  {typeof navigator !== "undefined" && !!navigator.share && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="shrink-0"
                      onClick={async () => {
                        try {
                          await navigator.share({
                            title: "Crypto Swap Complete — MRC GlobalPay",
                            text: `I just swapped ${txStatus.fromCurrency?.toUpperCase()} → ${txStatus.toCurrency?.toUpperCase()}${txStatus.amountReceive ? ` and received ${txStatus.amountReceive} ${txStatus.toCurrency?.toUpperCase()}` : ""} on MRC GlobalPay — fast, no KYC, non-custodial!`,
                            url: "https://mrcglobalpay.com",
                          });
                        } catch (e) {
                          // User cancelled or share failed silently
                        }
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-1.5" />
                      Share
                    </Button>
                  )}
                </div>
              </div>
            )}
            {txStatus?.status === "failed" && (
              <Button className="mt-6 w-full" size="lg" variant="destructive" onClick={handleNewExchange}>
                Try Again
              </Button>
            )}
            {!["finished", "failed", "refunded"].includes(txStatus?.status || "") && (
              <p className="mt-4 text-center font-body text-xs text-muted-foreground">
                Status refreshes automatically every 15 seconds
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Review Summary Overlay ===== */}
      {gShowReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4" onClick={() => setGShowReview(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-bold text-foreground">Review your order</h3>
            <p className="mt-1 font-body text-xs text-muted-foreground">Please confirm the details before proceeding to checkout.</p>

            <div className="mt-5 space-y-3 rounded-xl border border-border bg-accent/50 p-4">
              <div className="flex items-center justify-between font-body text-sm">
                <span className="text-muted-foreground">You pay</span>
                <span className="font-semibold text-foreground">{gSendAmount} {gFromCurrency?.ticker}</span>
              </div>
              <div className="flex items-center justify-between font-body text-sm">
                <span className="text-muted-foreground">You receive (est.)</span>
                <span className="font-semibold text-foreground">≈ {gEstimatedAmount} {gToCurrency?.ticker}</span>
              </div>
              {gFullEstimate?.estimated_exchange_rate && (
                <div className="flex items-center justify-between font-body text-xs">
                  <span className="text-muted-foreground">Exchange rate</span>
                  <span className="text-foreground">1 {gFromCurrency?.ticker} ≈ {gFullEstimate.estimated_exchange_rate} {gToCurrency?.ticker}</span>
                </div>
              )}
              {gFullEstimate?.network_fee && (
                <div className="flex items-center justify-between font-body text-xs">
                  <span className="text-muted-foreground">Network fee</span>
                  <span className="text-foreground">{parseFloat(gFullEstimate.network_fee.amount).toFixed(6)} {gFullEstimate.network_fee.currency}</span>
                </div>
              )}
              {gFullEstimate?.service_fees?.map((fee, i) => (
                <div key={i} className="flex items-center justify-between font-body text-xs">
                  <span className="text-muted-foreground">Service fee ({fee.percentage})</span>
                  <span className="text-foreground">{fee.amount} {fee.currency}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2">
                <div className="flex items-start justify-between font-body text-xs">
                  <span className="text-muted-foreground">Wallet</span>
                  <span className="max-w-[200px] break-all text-right font-mono text-foreground">{gPayoutAddress}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <Shield className="h-4 w-4 shrink-0 text-primary" />
              <p className="font-body text-[11px] text-muted-foreground">You'll be redirected to Guardarian's secure checkout to complete your payment.</p>
            </div>

            <div className="mt-5 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setGShowReview(false)}>Cancel</Button>
              <Button
                className="flex-1 min-h-[44px]"
                disabled={gCreatingTx}
                onClick={handleConfirmGuardarianCheckout}
              >
                {gCreatingTx ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                Confirm & Pay
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ExchangeWidget;
