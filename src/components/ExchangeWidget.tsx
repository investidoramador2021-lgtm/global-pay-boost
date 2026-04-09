import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownUp, Loader2, Search, Copy, Check, ArrowLeft, ArrowRight, ArrowLeftRight, Clock, CheckCircle2, AlertCircle, ExternalLink, Wallet, QrCode, XCircle, Info, Mail, RefreshCw, Shield, Lock, ChevronDown } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

const POPULAR_TICKERS = ["btc", "eth", "usdt", "usdttrc20", "sol", "xrp", "doge", "bnb", "ltc", "usdc", "trx"];

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
      toast({ title: "MetaMask not found", description: "Please install MetaMask browser extension. If you have multiple wallets, ensure MetaMask is enabled.", variant: "destructive" });
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
      toast({ title: "Trust Wallet not found", description: "Please install Trust Wallet browser extension.", variant: "destructive" });
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
          }
        } catch (err) {
          console.error("Status poll error:", err);
        }
      };
      poll();
      statusPollRef.current = setInterval(poll, 15000);
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
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Limitless Web3.0 Crypto Exchange</h2>
              <span className="flex items-center gap-1.5 rounded-full border border-trust/30 bg-trust/10 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-trust">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-trust opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-trust"></span>
                </span>
                System Online
              </span>
            </div>

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
                          <img src="https://trustwallet.com/assets/images/media/assets/trust_platform.svg" alt="Trust Wallet" className="h-5 w-5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
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
                <Button className="w-full bg-trust text-trust-foreground hover:bg-trust/90" size="lg" onClick={handleNewExchange}>
                  Start New Exchange
                </Button>
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
    </motion.div>
  );
};

export default ExchangeWidget;
