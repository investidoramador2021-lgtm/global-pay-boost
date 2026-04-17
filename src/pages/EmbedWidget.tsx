import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown, Loader2, X, Copy, Check, ArrowLeft } from "lucide-react";
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

export const SUPPORTED_LANGS = ["en", "es", "pt", "fr", "ja", "fa", "ur", "he", "af", "hi", "vi", "tr", "uk"];

export const pickSupportedLang = (candidates: readonly (string | undefined | null)[]): string => {
  for (const raw of candidates) {
    if (!raw) continue;
    const base = raw.toLowerCase().split("-")[0];
    if (SUPPORTED_LANGS.includes(base)) return base;
  }
  return "en";
};

const DEFAULT_FROM = "btc";
const DEFAULT_TO = "usdt";
const QUICK_TICKERS = ["btc", "eth", "sol", "usdt", "usdc", "xrp", "bnb", "doge", "ada", "dot"];

const sanitizeAmountInput = (value: string) => {
  const normalized = value.replace(/,/g, ".").replace(/[^\d.]/g, "");
  const [whole = "", ...rest] = normalized.split(".");

  if (rest.length === 0) return whole;

  return `${whole}.${rest.join("")}`;
};

const formatEnteredAmount = (value: string) => {
  if (!value) return "";

  const [whole, decimal] = value.split(".");
  const wholeNumber = whole ? Number(whole) : 0;
  const formattedWhole = new Intl.NumberFormat("en-US").format(wholeNumber);

  return decimal !== undefined ? `${formattedWhole}.${decimal}` : formattedWhole;
};

const formatQuoteAmount = (value: string) => {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) return value;

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: numeric >= 1 ? 2 : 4,
    maximumFractionDigits: numeric >= 1 ? 6 : 8,
  }).format(numeric);
};

const EmbedWidget = () => {
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const refId = searchParams.get("ref") || "";
  const detectBrowserLang = (): string => {
    if (typeof navigator === "undefined") return "en";
    return pickSupportedLang([...(navigator.languages || []), navigator.language]);
  };
  const rawLangParam = searchParams.get("lang");
  const langParam = (rawLangParam || detectBrowserLang()).toLowerCase();
  const lang = SUPPORTED_LANGS.includes(langParam) ? langParam : "en";
  // Theme: accept ?mode=light|dark (preferred) or ?theme=light|dark (legacy). Default: dark.
  const themeParam = (searchParams.get("mode") || searchParams.get("theme") || "dark").toLowerCase();
  const isLight = themeParam === "light";
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [fromCurrency, setFromCurrency] = useState<Currency | null>(null);
  const [toCurrency, setToCurrency] = useState<Currency | null>(null);
  const [amount, setAmount] = useState("1");
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [activeSelector, setActiveSelector] = useState<"from" | "to" | null>(null);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [estimating, setEstimating] = useState(false);
  const [estimatedAmount, setEstimatedAmount] = useState<string>("");
  const [minAmount, setMinAmount] = useState<number>(0);

  // Inline swap flow state
  const [step, setStep] = useState<"quote" | "wallet" | "deposit">("quote");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [extraId, setExtraId] = useState("");
  const [creatingTx, setCreatingTx] = useState(false);
  const [txError, setTxError] = useState("");
  const [transaction, setTransaction] = useState<TransactionResult | null>(null);
  const [txStatus, setTxStatus] = useState<TransactionStatus | null>(null);
  const [copied, setCopied] = useState<"address" | "amount" | "extra" | null>(null);

  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    document.documentElement.lang = lang;
    const rtlLangs = ["ar", "he", "fa", "ur"];
    document.documentElement.dir = rtlLangs.includes(lang) ? "rtl" : "ltr";
  }, [lang, i18n]);

  useEffect(() => {
    // Apply theme from ?mode= / ?theme= so the embedded widget matches the host site.
    if (isLight) {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
    document.body.style.margin = "0";
    document.body.style.background = "transparent";

    // Persist the affiliate ref token so any swap created in this browsing
    // session (including the new tab opened by handleSwap) is attributed.
    if (refId) {
      try {
        sessionStorage.setItem("mrc_partner_ref", refId);
        localStorage.setItem("mrc_partner_ref", refId);
      } catch { /* sessionStorage may be blocked in some embed contexts */ }
    }
  }, [isLight, refId]);

  useEffect(() => {
    let cancelled = false;

    const loadCurrencies = async () => {
      try {
        const data = await getCurrencies();
        if (!Array.isArray(data) || cancelled) return;

        const filtered = data.filter((currency) => QUICK_TICKERS.includes(currency.ticker));
        const paramFrom = searchParams.get("from")?.toLowerCase() || DEFAULT_FROM;
        const paramTo = searchParams.get("to")?.toLowerCase() || DEFAULT_TO;
        const from = filtered.find((currency) => currency.ticker === paramFrom) || filtered.find((currency) => currency.ticker === DEFAULT_FROM) || filtered[0] || null;
        const to = filtered.find((currency) => currency.ticker === paramTo) || filtered.find((currency) => currency.ticker === DEFAULT_TO) || filtered[1] || null;

        setCurrencies(filtered);
        setFromCurrency(from);
        setToCurrency(to && to.ticker !== from?.ticker ? to : filtered.find((currency) => currency.ticker !== from?.ticker) || null);
      } finally {
        if (!cancelled) setLoadingCurrencies(false);
      }
    };

    loadCurrencies();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchQuote = async () => {
      if (!fromCurrency || !toCurrency || !amount || Number.parseFloat(amount) <= 0) {
        setEstimatedAmount("");
        return;
      }

      setEstimating(true);

      try {
        const [estimate, min] = await Promise.all([
          getEstimate(fromCurrency.ticker, toCurrency.ticker, amount, true),
          getMinAmount(fromCurrency.ticker, toCurrency.ticker, true),
        ]);

        if (cancelled) return;

        setEstimatedAmount(estimate.estimatedAmount?.toString() || "");
        setMinAmount(min.minAmount || 0);
      } catch {
        if (!cancelled) {
          setEstimatedAmount("");
          setMinAmount(0);
        }
      } finally {
        if (!cancelled) setEstimating(false);
      }
    };

    const timeout = window.setTimeout(fetchQuote, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [amount, fromCurrency, toCurrency]);

  const amountDisplayValue = isAmountFocused ? amount : formatEnteredAmount(amount);
  const belowMin = useMemo(() => {
    const parsed = Number.parseFloat(amount);
    return Number.isFinite(parsed) && parsed > 0 && minAmount > 0 && parsed < minAmount;
  }, [amount, minAmount]);

  const handleSwap = () => {
    if (!fromCurrency || !toCurrency || !amount) return;

    const lang = searchParams.get("lang");
    const langPath = lang && lang !== "en" ? `/${lang}` : "";
    const base = `https://mrcglobalpay.com${langPath}`;
    const params = new URLSearchParams({ from: fromCurrency.ticker, to: toCurrency.ticker, amount });
    if (refId) params.set("ref", refId);
    const source = searchParams.get("source");
    if (source) params.set("source", source);
    if (lang) params.set("lang", lang);
    const url = `${base}/?${params.toString()}`;

    // Try popup first; if blocked (common in cross-origin iframes on partner sites),
    // fall back to navigating the top-level window so the user always reaches the swap page.
    const win = window.open(url, "_blank", "noopener");
    if (!win) {
      try {
        window.top!.location.href = url;
      } catch {
        // top is cross-origin & blocked — last resort: navigate self
        window.location.href = url;
      }
    }
  };

  const handleTokenSelect = (currency: Currency) => {
    if (activeSelector === "from") {
      setFromCurrency(currency);
      if (toCurrency?.ticker === currency.ticker) {
        setToCurrency(currencies.find((item) => item.ticker !== currency.ticker) || null);
      }
    }

    if (activeSelector === "to") {
      setToCurrency(currency);
      if (fromCurrency?.ticker === currency.ticker) {
        setFromCurrency(currencies.find((item) => item.ticker !== currency.ticker) || null);
      }
    }

    setActiveSelector(null);
  };

  const selectorCurrencies = currencies.filter((currency) => {
    if (activeSelector === "from") return currency.ticker !== toCurrency?.ticker;
    if (activeSelector === "to") return currency.ticker !== fromCurrency?.ticker;
    return true;
  });

  if (loadingCurrencies) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          background: "transparent",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        <div
          className="flex w-full max-w-[360px] items-center justify-center rounded-2xl border border-white/[0.12] p-12"
          style={{
            background: "linear-gradient(135deg, rgba(20,22,36,0.92) 0%, rgba(14,16,28,0.96) 100%)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <Loader2 className="h-6 w-6 animate-spin text-white/70" />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "8px",
        background: "transparent",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        className={`relative w-full max-w-[360px] overflow-hidden rounded-2xl border p-5 ${
          isLight ? "border-slate-200" : "border-white/[0.12]"
        }`}
        style={{
          background: isLight
            ? "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"
            : "linear-gradient(135deg, rgba(20,22,36,0.92) 0%, rgba(14,16,28,0.96) 100%)",
          backdropFilter: "blur(24px)",
          boxShadow: isLight
            ? "0 8px 32px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.6)"
            : "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
          color: isLight ? "#0f172a" : undefined,
        }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-wider text-white/50">{t("widget.tabs.exchange", "Crypto Swap")}</span>
          </div>
          <span className="text-right text-[10px] text-white/30">{t("widget.dustFriendly", "Dust-friendly • From $0.30")}</span>
        </div>

        <div className="mb-2 rounded-xl border border-white/[0.06] bg-white/[0.04] p-3">
          <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-white/40">{t("widget.youSend", "You Send")}</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveSelector("from")}
              className="flex min-w-[108px] shrink-0 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.06] px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/[0.1]"
            >
              {fromCurrency?.image ? (
                <img src={fromCurrency.image} alt={fromCurrency.name} className="h-4 w-4 rounded-full" loading="lazy" />
              ) : null}
              <span className="truncate uppercase">{fromCurrency?.ticker || "---"}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
            </button>

            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amountDisplayValue}
              onFocus={() => setIsAmountFocused(true)}
              onBlur={() => setIsAmountFocused(false)}
              onChange={(event) => setAmount(sanitizeAmountInput(event.target.value))}
              className="min-w-0 flex-1 bg-transparent text-right text-xl font-semibold text-white outline-none placeholder:text-white/20"
            />
          </div>
        </div>

        <div className="relative z-10 -my-1 flex justify-center">
          <button
            type="button"
            onClick={() => {
              setFromCurrency(toCurrency);
              setToCurrency(fromCurrency);
            }}
            className="rounded-full border border-white/[0.1] bg-white/[0.06] p-1.5 transition-colors hover:bg-white/[0.1]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M5 10l3 3 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="mt-2 mb-2 rounded-xl border border-white/[0.06] bg-white/[0.04] p-3">
          <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-white/40">{t("widget.youGet", "You Get")}</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveSelector("to")}
              className="flex min-w-[108px] shrink-0 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.06] px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/[0.1]"
            >
              {toCurrency?.image ? (
                <img src={toCurrency.image} alt={toCurrency.name} className="h-4 w-4 rounded-full" loading="lazy" />
              ) : null}
              <span className="truncate uppercase">{toCurrency?.ticker || "---"}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
            </button>

            <div className="min-w-0 flex-1 text-right">
              <div className="truncate text-xl font-semibold text-white/90">
                {estimating ? t("widget.loading", "Loading...") : estimatedAmount ? formatQuoteAmount(estimatedAmount) : "—"}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-white/35">
                {belowMin
                  ? `${t("widget.minimumAmount", "Minimum amount:")} ${formatQuoteAmount(String(minAmount))} ${fromCurrency?.ticker?.toUpperCase()}`
                  : estimatedAmount
                    ? `${t("widget.estimated", "(estimated)")} ${toCurrency?.ticker?.toUpperCase()}`
                    : t("widget.enterAmount", "Enter an amount")}
              </div>
            </div>
          </div>
        </div>

        {belowMin ? (
          <div className="mb-4 rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-[11px] text-amber-100">
            {t("widget.minimumAmount", "Minimum amount:")} {formatQuoteAmount(String(minAmount))} {fromCurrency?.ticker?.toUpperCase()}
          </div>
        ) : (
          <div className="mb-4 text-right text-[10px] uppercase tracking-wider text-white/30">
            {t("widget.fixedRate", "Live fixed-rate pricing")}
          </div>
        )}

        <button
          onClick={handleSwap}
          disabled={!amount || Number.parseFloat(amount) <= 0 || belowMin}
          className="w-full rounded-xl py-3 text-sm font-bold uppercase tracking-wider transition-all disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            background: "linear-gradient(135deg, hsl(160 100% 45%) 0%, hsl(200 100% 45%) 100%)",
            color: "#0a0c14",
            boxShadow: "0 4px 16px rgba(0,200,150,0.3)",
          }}
        >
          {t("widget.exchangeNow", "Swap Now")} →
        </button>

        <div className="mt-3 text-center">
          <a
            href={(() => {
              const lang = searchParams.get("lang");
              const langPath = lang && lang !== "en" ? `/${lang}` : "";
              const qs = new URLSearchParams();
              if (refId) qs.set("ref", refId);
              if (lang) qs.set("lang", lang);
              const qsStr = qs.toString();
              return `https://mrcglobalpay.com${langPath}${qsStr ? `?${qsStr}` : ""}`;
            })()}
            target="_blank"
            rel="noopener"
            className="text-[10px] text-white/30 transition-colors hover:text-white/50"
          >
            {t("widget.poweredBy", "Powered by")} <span className="font-semibold">MRC GlobalPay</span>
          </a>
        </div>

        {activeSelector && (
          <div className="absolute inset-0 z-50 flex flex-col rounded-2xl bg-[#0b0e18]/95 p-3 backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-white/35">{t("widget.select", "Select")}</div>
                <div className="text-sm font-semibold text-white">
                  {activeSelector === "from" ? t("widget.youSend", "You Send") : t("widget.youGet", "You Get")}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSelector(null)}
                className="rounded-full border border-white/[0.12] bg-white/[0.05] p-2 text-white/70 transition-colors hover:bg-white/[0.1] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid max-h-[280px] gap-2 overflow-y-auto pr-1">
              {selectorCurrencies.map((currency) => (
                <button
                  key={`${currency.ticker}-${currency.network}`}
                  type="button"
                  onClick={() => handleTokenSelect(currency)}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-3 text-left transition-colors hover:bg-white/[0.08]"
                >
                  {currency.image ? (
                    <img src={currency.image} alt={currency.name} className="h-5 w-5 rounded-full" loading="lazy" />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="font-medium uppercase text-white">{currency.ticker}</div>
                    <div className="truncate text-xs text-white/45">{currency.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmbedWidget;
