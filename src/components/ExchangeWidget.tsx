import { useState, useEffect, useCallback, useRef, forwardRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownUp, Loader2, Search, Copy, Check, ArrowLeft, ArrowRight, ArrowLeftRight, Clock, CheckCircle2, AlertCircle, ExternalLink, Wallet, QrCode, XCircle, Info, Mail, RefreshCw, Shield, Lock, ChevronDown, Share2, CreditCard, Repeat, EyeOff, Link2, FileText, Landmark, TrendingUp } from "lucide-react";
import PrivateTransferTab from "@/components/PrivateTransferTab";
import PermanentBridgeTab from "@/components/PermanentBridgeTab";
import InvoiceRequestTab from "@/components/InvoiceRequestTab";
import FeeBreakdown from "@/components/FeeBreakdown";
import SystemPulse from "@/components/SystemPulse";
import DestinationAddressInput, { tickerToAddressType } from "@/components/DestinationAddressInput";
import CollateralSelector from "@/components/CollateralSelector";
import { COLLATERAL_ASSETS, LTV_BY_RISK, type CollateralAsset } from "@/lib/coinrabbit-assets";
import { EARN_ASSETS as EARN_ASSETS_LIST } from "@/lib/coinrabbit-earn-assets";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
import {
  type Currency,
  type TransactionResult,
  type TransactionStatus,
} from "@/lib/changenow";
import {
  getAggregatedCurrencies,
  getBestEstimate,
  getBestMinAmount,
  createBestTransaction,
  getStatusByProvider,
  generateMrcTxId,
  type Provider,
} from "@/lib/liquidity-aggregator";
import {
  getGuardarianCurrencies,
  getGuardarianEstimate,
  getGuardarianMinMax,
  getGuardarianPaymentMethods,
  createGuardarianTransaction,
  getPayoutFieldsForCurrency,
  type GuardarianCurrency,
  type GuardarianEstimate,
  type GuardarianPaymentMethod,
  type GuardarianBankDetails,
  type PayoutFieldDef,
} from "@/lib/guardarian";
import { resolvePaymentMethodDisplay, getSmartDefaultMethod } from "@/components/PaymentMethodLogos";
import { useToast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/use-push-notifications";


// Most popular pinned to top of selector. USDT (TRON) is included explicitly per
// user demand even though it's a network-suffixed ticker.
const POPULAR_TICKERS = ["btc", "eth", "usdttrc20", "usdt", "usdc", "sol", "bnb", "xrp", "doge", "ltc", "trx", "usdterc20", "usdcerc20", "usdcsol"];

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

function normalizeIban(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function formatIban(value: string): string {
  return normalizeIban(value).replace(/(.{4})/g, "$1 ").trim();
}

function isValidIban(value: string): boolean {
  const normalized = normalizeIban(value);
  return normalized.length >= 15 && normalized.length <= 34 && /^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(normalized);
}

function normalizeBic(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function isValidBic(value: string): boolean {
  return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(normalizeBic(value));
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

const GuardarianAssetIcon = forwardRef<HTMLImageElement | HTMLDivElement, { currency: GuardarianCurrency; small?: boolean }>(({ currency, small = false }, ref) => {
  const logo = guardarianLogoUrl(currency);
  const [failed, setFailed] = useState(!logo);

  useEffect(() => {
    setFailed(!logo);
  }, [logo]);

  const sizeClass = small ? "h-4 w-4 text-[9px]" : "h-5 w-5 text-[10px]";

  if (failed || !logo) {
    return (
      <div ref={ref as React.Ref<HTMLDivElement>} className={`flex ${sizeClass} items-center justify-center rounded-full bg-accent font-display font-bold uppercase text-foreground`}>
        {currency.ticker.slice(0, 1)}
      </div>
    );
  }

  return (
    <img
      ref={ref as React.Ref<HTMLImageElement>}
      src={logo}
      alt={currency.name}
      className={`${sizeClass} rounded-full object-cover`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
});
GuardarianAssetIcon.displayName = "GuardarianAssetIcon";

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
  // New 2026 listings — show clean tickers in UI while keeping API ticker intact
  prlsol: "PRL",
  raveerc20: "RAVE",
  stablebsc: "STABLE",
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

// Force-network mapping for tickers whose API metadata omits a network field
const FORCED_NETWORK_BY_TICKER: Record<string, string> = {
  prlsol: "Solana",
  raveerc20: "Ethereum",
  stablebsc: "BNB Chain",
  msftonerc20: "Ethereum",
  spyonerc20: "Ethereum",
  metaonerc20: "Ethereum",
};

function networkLabel(c: { ticker: string; name: string }): string | null {
  const tickerLower = c.ticker.toLowerCase();
  if (FORCED_NETWORK_BY_TICKER[tickerLower]) return FORCED_NETWORK_BY_TICKER[tickerLower];
  // Extract network from name in parentheses, e.g. "Tether (TRC20)" → "TRC20"
  const match = c.name.match(/\(([^)]+)\)/);
  if (match) {
    return NETWORK_FRIENDLY_NAME[match[1]] || match[1];
  }
  // If display ticker differs from raw ticker, there's a network suffix but no parenthetical
  if (DISPLAY_TICKER_MAP[tickerLower]) {
    const raw = tickerLower;
    const base = DISPLAY_TICKER_MAP[raw].toLowerCase();
    const suffix = raw.replace(base, "");
    return suffix ? suffix.toUpperCase() : null;
  }
  return null;
}

// Brand-colored network badges (like ChangeNOW). Maps a normalized network label
// to Tailwind bg/text classes. Falls back to neutral muted styling when unknown.
const NETWORK_BADGE_STYLES: Record<string, string> = {
  TRX: "bg-[#EF4444] text-white",
  TRC20: "bg-[#EF4444] text-white",
  TRON: "bg-[#EF4444] text-white",
  ETH: "bg-[#60A5FA] text-white",
  ERC20: "bg-[#60A5FA] text-white",
  ETHEREUM: "bg-[#60A5FA] text-white",
  BSC: "bg-[#F0B90B] text-black",
  BEP20: "bg-[#F0B90B] text-black",
  "BNB CHAIN": "bg-[#F0B90B] text-black",
  SOL: "bg-[#9945FF] text-white",
  SOLANA: "bg-[#9945FF] text-white",
  SPL: "bg-[#9945FF] text-white",
  MATIC: "bg-[#8247E5] text-white",
  POLYGON: "bg-[#8247E5] text-white",
  ARB: "bg-[#28A0F0] text-white",
  ARBITRUM: "bg-[#28A0F0] text-white",
  OP: "bg-[#FF0420] text-white",
  OPTIMISM: "bg-[#FF0420] text-white",
  BASE: "bg-[#0052FF] text-white",
  AVAXC: "bg-[#E84142] text-white",
  AVAX: "bg-[#E84142] text-white",
  TON: "bg-[#0098EA] text-white",
  APT: "bg-[#06D6A0] text-black",
  APTOS: "bg-[#06D6A0] text-black",
  CELO: "bg-[#FCFF52] text-black",
  ALGO: "bg-[#000000] text-white",
  ALGORAND: "bg-[#000000] text-white",
  SUI: "bg-[#4DA2FF] text-white",
  ZKSYNC: "bg-[#8C8DFC] text-white",
  MON: "bg-[#7C3AED] text-white",
  MONAD: "bg-[#7C3AED] text-white",
  MANTA: "bg-[#1E40AF] text-white",
  ASSETHUB: "bg-[#E6007A] text-white",
};

function networkBadgeClass(label: string | null | undefined): string {
  if (!label) return "";
  return NETWORK_BADGE_STYLES[label.toUpperCase()] || "bg-muted text-muted-foreground";
}

// Builds an extended descriptive name like "Tether USD (TRON)" when the raw
// `name` doesn't already include the network. Mirrors ChangeNOW's UI labeling.
function extendedName(c: { ticker: string; name: string }): string {
  const baseName = c.name?.trim() || c.ticker.toUpperCase();
  // Strip any pre-existing "(...)" so we control the network suffix.
  const cleanBase = baseName.replace(/\s*\([^)]+\)\s*$/, "").trim();
  const net = networkLabel(c);
  if (!net) return cleanBase || baseName;
  return `${cleanBase} (${net})`;
}

function normalizeTokenSearchValue(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function matchesExchangeCurrencySearch(c: Currency, query: string): boolean {
  if (!query) return true;

  const q = query.toLowerCase().trim();
  const qNormalized = normalizeTokenSearchValue(query);
  const display = displayTicker(c);
  const network = networkLabel(c) || "";
  const searchable = [
    c.ticker,
    c.name,
    display,
    network,
    `${display} ${network}`,
    `${c.name} ${network}`,
  ];

  return searchable.some((value) => {
    const raw = value.toLowerCase();
    return raw.includes(q) || normalizeTokenSearchValue(value).includes(qNormalized);
  });
}

// Curated category filters for the swap picker. Tickers are matched case-insensitively
// against Currency.ticker — values that are LE-only will simply not appear if the
// aggregator hasn't loaded LE coverage yet, which is the desired graceful-degradation.
const PICKER_CATEGORIES = [
  { id: "all", label: "All", tickers: null as string[] | null },
  {
    id: "ai",
    label: "Trending AI",
    tickers: ["prl", "prlsol", "rave", "raveerc20", "fet", "agix", "rndr", "render", "tao", "ocean", "akt", "wld", "near", "inj", "grt", "vana"],
  },
  {
    id: "stocks",
    label: "Tokenized Stocks",
    tickers: ["nvda", "nvdaonerc20", "msft", "msftonerc20", "spy", "spyonerc20", "tsla", "tslaonerc20", "aapl", "aaplonerc20", "googl", "googlonerc20", "amzn", "amznonerc20", "meta", "metaonerc20"],
  },
  {
    id: "stables",
    label: "Stables",
    tickers: ["usdt", "usdterc20", "usdttrc20", "usdtbsc", "usdtsol", "usdtarb", "usdtop", "usdtmatic", "usdc", "usdcerc20", "usdcsol", "usdcbsc", "usdcarb", "usdcop", "usdcmatic", "usdcspl", "dai", "daierc20", "pyusd", "fdusd", "tusd", "usde"],
  },
] as const;

type PickerCategoryId = typeof PICKER_CATEGORIES[number]["id"];

function matchesPickerCategory(c: Currency, categoryId: string): boolean {
  const cat = PICKER_CATEGORIES.find((x) => x.id === categoryId);
  if (!cat || !cat.tickers) return true;
  const ticker = c.ticker.toLowerCase();
  return (cat.tickers as readonly string[]).includes(ticker);
}

function matchesGuardarianCurrencySearch(c: GuardarianCurrency, query: string): boolean {
  if (!query) return true;

  const q = query.toLowerCase().trim();
  const qNormalized = normalizeTokenSearchValue(query);
  const networks = c.networks?.flatMap((n) => [n.network || "", n.name || ""]) || [];
  const searchable = [c.ticker, c.name, ...networks];

  return searchable.some((value) => {
    const raw = value.toLowerCase();
    return raw.includes(q) || normalizeTokenSearchValue(value).includes(qNormalized);
  });
}

const ExchangeCurrencyPickerView = ({
  show,
  currencies,
  exclude,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  onSelect,
  onClose,
  activeCategory,
  onCategoryChange,
}: {
  show: boolean;
  currencies: Currency[];
  exclude?: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  onSelect: (c: Currency) => void;
  onClose: () => void;
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}) => {
  if (!show) return null;

  const visibleCurrencies = currencies.filter((c) => c.ticker !== exclude);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-elevated" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-border p-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            placeholder={searchPlaceholder}
            className="flex-1 bg-transparent font-body text-sm text-foreground outline-none placeholder:text-muted-foreground"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button onClick={onClose} className="font-body text-xs text-muted-foreground hover:text-foreground">
            Cancel
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 border-b border-border px-4 pb-3 pt-3">
          {PICKER_CATEGORIES.map((cat) => {
            const active = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={
                  "rounded-full border px-3 py-1 font-body text-[11px] font-medium uppercase tracking-wide transition-colors " +
                  (active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:text-foreground")
                }
              >
                {cat.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 border-b border-border px-4 pb-3">
          {["btc", "eth", "sol", "usdc"].map((ticker) => {
            const c = visibleCurrencies.find((cur) => cur.ticker === ticker);
            if (!c) return null;
            return (
              <button
                key={ticker}
                onClick={() => onSelect(c)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-accent px-3 py-1.5 font-display text-xs font-semibold uppercase text-foreground transition-colors hover:border-primary/40"
              >
                {c.image && <img src={c.image} alt="" className="h-4 w-4 rounded-full" />}
                {ticker}
              </button>
            );
          })}
        </div>
        <CurrencyListView currencies={visibleCurrencies} onSelect={onSelect} />
      </div>
    </div>
  );
};

function getPreferredGuardarianNetworkCode(currency: GuardarianCurrency | null): string | undefined {
  if (!currency || currency.currency_type === "FIAT") return undefined;

  const ticker = currency.ticker.trim().toUpperCase();
  const currencyName = currency.name.trim().toUpperCase();
  const preferredNetwork = currency.networks?.find((network) => {
    const networkCode = network.network?.trim().toUpperCase();
    const networkName = network.name?.trim().toUpperCase();

    return networkCode === ticker || networkName === currencyName;
  });

  return preferredNetwork?.network?.trim() || currency.networks?.[0]?.network?.trim();
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

const STATUS_ICONS: Record<string, { color: string; icon: React.ReactNode }> = {
  waiting: { color: "text-muted-foreground", icon: <Clock className="h-5 w-5" /> },
  confirming: { color: "text-primary", icon: <Loader2 className="h-5 w-5 animate-spin" /> },
  exchanging: { color: "text-primary", icon: <Loader2 className="h-5 w-5 animate-spin" /> },
  sending: { color: "text-trust", icon: <Loader2 className="h-5 w-5 animate-spin" /> },
  finished: { color: "text-trust", icon: <CheckCircle2 className="h-5 w-5" /> },
  failed: { color: "text-destructive", icon: <AlertCircle className="h-5 w-5" /> },
  refunded: { color: "text-muted-foreground", icon: <AlertCircle className="h-5 w-5" /> },
  overdue: { color: "text-destructive", icon: <AlertCircle className="h-5 w-5" /> },
};

const CURRENCY_LIST_BATCH = 50;

// Hoisted to module scope so the scroll container is not recreated on every parent
// re-render (e.g. when typing in search). Recreating remounts the div and resets scroll.
const CurrencyListView = ({ currencies: items, onSelect }: { currencies: Currency[]; onSelect: (c: Currency) => void }) => {
  const [visibleCount, setVisibleCount] = useState(CURRENCY_LIST_BATCH);
  const listRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
      setVisibleCount((prev) => Math.min(prev + CURRENCY_LIST_BATCH, items.length));
    }
  }, [items.length]);

  useEffect(() => { setVisibleCount(CURRENCY_LIST_BATCH); }, [items.length]);

  return (
    <div ref={listRef} onScroll={handleScroll} className="overflow-y-auto p-2" style={{ maxHeight: 400 }}>
      {items.slice(0, visibleCount).map((c) => (
        <button
          key={`${c.ticker}-${c.network}`}
          onClick={() => onSelect(c)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent"
        >
          {c.image ? (
            <img src={c.image} alt={c.name} className="h-6 w-6 rounded-full shrink-0" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold uppercase text-muted-foreground" aria-hidden>
              {c.ticker.slice(0, 2)}
            </span>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-sm font-semibold uppercase text-foreground shrink-0">{displayTicker(c)}</span>
              {networkLabel(c) && (
                <span className={`shrink-0 rounded px-1.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide ${networkBadgeClass(networkLabel(c))}`}>
                  {networkLabel(c)}
                </span>
              )}
            </div>
            <span className="truncate font-body text-xs text-muted-foreground">{extendedName(c)}</span>
          </div>
        </button>
      ))}
      {visibleCount < items.length && (
        <div className="py-2 text-center font-body text-xs text-muted-foreground">Scroll for more...</div>
      )}
    </div>
  );
};

const GuardarianCryptoListView = ({ items, onSelect }: { items: GuardarianCurrency[]; onSelect: (c: GuardarianCurrency) => void }) => {
  const [visibleCount, setVisibleCount] = useState(CURRENCY_LIST_BATCH);
  const listRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
      setVisibleCount((prev) => Math.min(prev + CURRENCY_LIST_BATCH, items.length));
    }
  }, [items.length]);

  useEffect(() => { setVisibleCount(CURRENCY_LIST_BATCH); }, [items.length]);

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

const STATUS_LABEL_KEYS: Record<string, string> = {
  waiting: "widget.statusWaiting",
  confirming: "widget.statusConfirming",
  exchanging: "widget.statusExchanging",
  sending: "widget.statusSending",
  finished: "widget.statusFinished",
  failed: "widget.statusFailed",
  refunded: "widget.statusRefunded",
  overdue: "widget.statusOverdue",
};

/* ── Compact LTV Gauge: slim horizontal bar with glowing indicator ── */
function LtvGauge({ value, max = 90 }: { value: number; max?: number }) {
  const pct = Math.min(value / max, 1) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "hsl(220 20% 15%)" }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, hsl(160 100% 45%), hsl(45 100% 55%), hsl(0 80% 55%))",
            boxShadow: "0 0 8px hsl(160 100% 45% / 0.4)",
            transition: "width 0.4s ease",
          }}
        />
        {/* Needle dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-background"
          style={{
            left: `${pct}%`,
            transform: `translate(-50%, -50%)`,
            background: pct > 80 ? "hsl(0 80% 55%)" : pct > 55 ? "hsl(45 100% 55%)" : "hsl(160 100% 45%)",
            boxShadow: `0 0 6px ${pct > 80 ? "hsl(0 80% 55% / 0.6)" : "hsl(160 100% 45% / 0.5)"}`,
          }}
        />
      </div>
      <span className="font-mono text-sm font-bold text-[#D4AF37] tabular-nums w-10 text-right">{value}%</span>
    </div>
  );
}

/* ── Compact Loan Widget for homepage ── */
function LoanWidgetPanel() {
  const { t } = useTranslation();
  const [asset, setAsset] = useState<CollateralAsset>(COLLATERAL_ASSETS[0]);
  const [usdValue, setUsdValue] = useState("1000");
  const riskConfig = LTV_BY_RISK[asset.riskTier];
  const maxLtv = riskConfig.ltvOptions[riskConfig.ltvOptions.length - 1];
  const borrowable = Math.floor((parseFloat(usdValue) || 0) * (maxLtv / 100));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#D4AF37]">{t("lend.collateralLabel")}</label>
        <CollateralSelector value={asset.ticker} onChange={setAsset} compact />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-[#D4AF37]">{t("lend.collateralValueUsd")}</label>
        <Input
          type="number"
          placeholder="1,000"
          value={usdValue}
          onChange={(e) => setUsdValue(e.target.value)}
          className="font-mono border-[#D4AF37]/20 focus:border-[#D4AF37] focus:ring-[#D4AF37]/30"
        />
      </div>

      {/* LTV Gauge */}
      <div className="rounded-lg border border-[#D4AF37]/15 p-3" style={{ background: "hsl(220 25% 8% / 0.5)" }}>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">{t("lend.maxLtv")}</div>
        <LtvGauge value={maxLtv} />
      </div>

      <div className="rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("lend.youCanBorrow")}</span>
          <span className="font-bold text-[#D4AF37]">~${borrowable.toLocaleString()} USDT</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{t("lend.interestRate")}</span>
          <span className="font-mono text-[#D4AF37]">{riskConfig.baseRate}% APR</span>
        </div>
      </div>
      <a
        href="/lend"
        className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-display text-sm font-bold text-background shadow-lg transition-all hover:shadow-xl"
        style={{
          background: "linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)",
          boxShadow: "0 4px 16px rgba(212,175,55,0.3)",
        }}
      >
        <Landmark className="h-4 w-4" /> {t("lend.getInstantLoan")}
      </a>
    </div>
  );
}

/* ── Compact Earn Widget Calculator for homepage ── */
function EarnWidgetPanel() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "fa" ? "fa-IR" : i18n.language === "ur" ? "ur-PK" : i18n.language === "he" ? "he-IL" : i18n.language;
  const fmtUsd = useCallback((v: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(v), [locale]);

  const EARN_KEY = (a: typeof EARN_ASSETS_LIST[0]) => `${a.ticker}-${a.network}`;
  const [selectedKey, setSelectedKey] = useState(EARN_KEY(EARN_ASSETS_LIST[0]));
  const [deposit, setDeposit] = useState("");

  const selected = useMemo(
    () => EARN_ASSETS_LIST.find((a) => EARN_KEY(a) === selectedKey) ?? EARN_ASSETS_LIST[0],
    [selectedKey],
  );

  const numDeposit = parseFloat(deposit) || 0;
  const apy = selected.apy;
  const monthlyReward = numDeposit * (apy / 12 / 100);
  const annualReturn = numDeposit * (apy / 100);

  return (
    <div className="space-y-4">
      {/* Asset selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">{t("lend.depositAsset", "Deposit Asset")}</label>
        <select
          value={selectedKey}
          onChange={(e) => setSelectedKey(e.target.value)}
          className="flex h-9 w-full items-center rounded-md border border-[#D4AF37]/30 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {EARN_ASSETS_LIST.map((a) => (
            <option key={EARN_KEY(a)} value={EARN_KEY(a)}>{a.ticker} — {a.name} ({a.network})</option>
          ))}
        </select>
      </div>

      {/* Deposit input */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">{t("lend.yourDeposit", "Your Deposit")}</label>
        <div className="relative">
          <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
          <input
            type="number"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            placeholder="1,000"
            className="flex h-10 w-full rounded-md border border-[#D4AF37]/30 bg-background ps-7 pe-3 py-2 text-base font-mono ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 md:text-sm"
          />
        </div>
      </div>

      {/* Live APY with Sparkline */}
      <div className="rounded-xl border border-[#D4AF37]/20 p-4" style={{ background: "hsl(220 25% 8% / 0.6)", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.35)" }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{selected.ticker} {t("lend.annualYield", "Annual Yield")}</div>
            <div className="text-3xl font-bold text-[#D4AF37]">{apy}% <span className="text-sm font-normal">APY</span></div>
          </div>
          {/* Sparkline SVG — yield growth curve */}
          <svg viewBox="0 0 80 32" className="w-20 h-8 shrink-0" aria-label="Yield trend">
            <defs>
              <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 28 Q10 26 16 22 T32 18 T48 12 T64 8 T80 4" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M0 28 Q10 26 16 22 T32 18 T48 12 T64 8 T80 4 V32 H0 Z" fill="url(#sparkGrad)" />
          </svg>
        </div>
      </div>

      {/* 1-year projection */}
      {numDeposit > 0 && (
        <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-3 text-center space-y-0.5">
          <div className="text-[10px] text-muted-foreground">{t("lend.inOneYear", "In 1 year you will have")}</div>
          <div className="text-2xl font-bold text-emerald-400">{fmtUsd(numDeposit + annualReturn)}</div>
          <div className="text-xs text-emerald-400/80">{fmtUsd(numDeposit)} + {fmtUsd(annualReturn)} {t("lend.interest", "interest")}</div>
        </div>
      )}

      {/* Earnings breakdown */}
      {numDeposit > 0 && (
        <div className="grid grid-cols-3 gap-px rounded-lg border border-border overflow-hidden bg-border">
          <div className="bg-card p-2.5 text-center">
            <div className="text-[10px] text-muted-foreground">{t("lend.monthlyReward", "Monthly Reward")}</div>
            <div className="text-sm font-bold text-[#D4AF37] font-mono">{fmtUsd(monthlyReward)}</div>
          </div>
          <div className="bg-card p-2.5 text-center">
            <div className="text-[10px] text-muted-foreground">{t("lend.interestAccrual", "Interest Accrual")}</div>
            <div className="text-sm font-bold text-foreground">{t("lend.daily", "Daily")}</div>
          </div>
          <div className="bg-card p-2.5 text-center">
            <div className="text-[10px] text-muted-foreground">{t("lend.term", "Term")}</div>
            <div className="text-sm font-bold text-foreground">{t("lend.flexible", "Flexible")}</div>
          </div>
        </div>
      )}

      {/* Start Earning */}
      <a
        href="/lend?tab=earn"
        className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-display text-sm font-bold text-background shadow-lg transition-all hover:shadow-xl"
        style={{
          background: "linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)",
          boxShadow: "0 4px 16px rgba(212,175,55,0.3)",
        }}
      >
        <TrendingUp className="h-4 w-4" /> {t("lend.startEarning", "Start Earning")}
      </a>
    </div>
  );
}

interface ExchangeWidgetProps {
  onTabChange?: (tab: "exchange" | "buysell" | "private" | "bridge" | "request" | "loan" | "earn") => void;
  defaultFrom?: string;
  defaultTo?: string;
}

const ExchangeWidget = ({ onTabChange, defaultFrom, defaultTo }: ExchangeWidgetProps = {}) => {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const { subscribe: subscribePush, supported: pushSupported } = usePushNotifications();
  const pushSubscribedRef = useRef(false);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [fromCurrency, setFromCurrency] = useState<Currency | null>(null);
  const [toCurrency, setToCurrency] = useState<Currency | null>(null);
  const [sendAmount, setSendAmount] = useState("1");
  const [estimatedAmount, setEstimatedAmount] = useState<string>("");
  const [minAmount, setMinAmount] = useState<number>(0);
  const [sendBoxHighlight, setSendBoxHighlight] = useState(false);

  // Listen for proactive bot popup to highlight the YOU SEND box
  useEffect(() => {
    const handler = () => {
      setSendBoxHighlight(true);
      setTimeout(() => setSendBoxHighlight(false), 6000);
    };
    window.addEventListener("mrc-highlight-send-box", handler);
    return () => window.removeEventListener("mrc-highlight-send-box", handler);
  }, []);
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pickerCategory, setPickerCategory] = useState<string>("all");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // ===== Dual-tab mode: "exchange" (ChangeNOW) vs "buysell" (Guardarian) =====
  type WidgetMode = "exchange" | "buysell" | "private" | "bridge" | "request" | "loan" | "earn";
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
  const [gSepaIban, setGSepaIban] = useState("");
  const [gSepaBic, setGSepaBic] = useState("");
  const [gCreatingTx, setGCreatingTx] = useState(false);
  const [gCheckoutUrl, setGCheckoutUrl] = useState("");
  const [gSelectedProvider, setGSelectedProvider] = useState<"guardarian" | "transak">("guardarian");
  const [gShowReview, setGShowReview] = useState(false);
  const [gCurrencyRetryCount, setGCurrencyRetryCount] = useState(0);
  const [gCurrencyError, setGCurrencyError] = useState(false);
  const [gPaymentMethods, setGPaymentMethods] = useState<GuardarianPaymentMethod[]>([]);
  const [gSelectedPaymentMethod, setGSelectedPaymentMethod] = useState<string>("");
  const [gEstimateError, setGEstimateError] = useState("");
  const gEstimateRequestIdRef = useRef(0);
  const [gPaymentOpened, setGPaymentOpened] = useState(false);

  const getGuardarianDefaults = useCallback((
    direction: FiatFlow,
    fiatOptions: GuardarianCurrency[],
    cryptoOptions: GuardarianCurrency[],
    preferredFiatTicker?: string,
    preferredCryptoTicker?: string,
  ) => {
    // Locale-aware fiat default: PT users get BRL (PIX as #1 payment method)
    const localeFiatTicker = i18n.language === "pt" ? "BRL" : null;
    const fallbackFiatTicker = localeFiatTicker || (direction === "sell" ? "EUR" : "USD");
    const fiatSelection = fiatOptions.find((c) => c.ticker === preferredFiatTicker)
      || fiatOptions.find((c) => c.ticker === fallbackFiatTicker)
      || fiatOptions.find((c) => c.ticker === "EUR")
      || fiatOptions[0]
      || null;
    const cryptoSelection = cryptoOptions.find((c) => c.ticker === preferredCryptoTicker)
      || cryptoOptions.find((c) => c.ticker === "BTC")
      || cryptoOptions[0]
      || null;

    return direction === "sell"
      ? { from: cryptoSelection, to: fiatSelection, amount: "0.01" }
      : { from: fiatSelection, to: cryptoSelection, amount: "100" };
  }, [i18n.language]);

  const applyGuardarianDefaults = useCallback((
    direction: FiatFlow,
    options?: {
      fiatOptions?: GuardarianCurrency[];
      cryptoOptions?: GuardarianCurrency[];
      preferredFiatTicker?: string;
      preferredCryptoTicker?: string;
    },
  ) => {
    const fiatOptions = options?.fiatOptions || guardarianFiat;
    const cryptoOptions = options?.cryptoOptions || guardarianCrypto;
    const defaults = getGuardarianDefaults(
      direction,
      fiatOptions,
      cryptoOptions,
      options?.preferredFiatTicker,
      options?.preferredCryptoTicker,
    );

    setGFromCurrency(defaults.from);
    setGToCurrency(defaults.to);
    setGSendAmount(defaults.amount);
  }, [guardarianFiat, guardarianCrypto, getGuardarianDefaults]);

  // Sell-flow: dynamic bank detail fields
  const [gBankFields, setGBankFields] = useState<Record<string, string>>({});
  const gPayoutFieldDefs = gTradeDirection === "sell" && gToCurrency?.currency_type === "FIAT"
    ? getPayoutFieldsForCurrency(gToCurrency.ticker)
    : [];
  const gBankFieldsValid = gPayoutFieldDefs.length === 0 || gPayoutFieldDefs.every((f) => {
    const val = gBankFields[f.key] || "";
    return f.validate(val);
  });


  const [step, setStep] = useState<Step>("exchange");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [refLinkAddressLocked, setRefLinkAddressLocked] = useState(false);
  const [addressValid, setAddressValid] = useState(false);
  const [refundAddress, setRefundAddress] = useState("");
  const [extraId, setExtraId] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [creatingTx, setCreatingTx] = useState(false);
  const [transaction, setTransaction] = useState<TransactionResult | null>(null);
  const [txProvider, setTxProvider] = useState<Provider>("cn");
  const [winningProvider, setWinningProvider] = useState<Provider>("cn");
  const [bestRateActive, setBestRateActive] = useState(false);
  const [txStatus, setTxStatus] = useState<TransactionStatus | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [speedForecast, setSpeedForecast] = useState<string | null>(null);
  const [fixedRate, setFixedRate] = useState(true);
  const [connectedWallet, setConnectedWallet] = useState<{ address: string; type: "evm" | "solana" } | null>(null);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const statusPollRef = useRef<ReturnType<typeof setInterval>>();

  // Price lock timer state (post-address-entry, 60s confirmation window)
  const [rateLockSeconds, setRateLockSeconds] = useState(60);
  const [rateExpired, setRateExpired] = useState(false);
  const [refreshingRate, setRefreshingRate] = useState(false);
  const rateLockRef = useRef<ReturnType<typeof setInterval>>();

  // Fixed-Rate pre-confirmation lock — 15-minute guaranteed window from quote
  const FIXED_LOCK_DURATION = 15 * 60;
  const [fixedLockSeconds, setFixedLockSeconds] = useState(FIXED_LOCK_DURATION);
  const fixedLockRef = useRef<ReturnType<typeof setInterval>>();

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
  const saveTransaction = async (tx: TransactionResult, recipientAddr: string, provider: Provider = "cn") => {
    // Generate MRC Global Pay-branded reference ID
    const mrcTxId = generateMrcTxId(tx.id);
    // localStorage
    try {
      const stored = JSON.parse(localStorage.getItem("mrc_recent_txs") || "[]");
      const entry = { id: tx.id, mrcId: mrcTxId, provider, from: tx.fromCurrency, to: tx.toCurrency, amount: tx.amount, date: new Date().toISOString() };
      stored.unshift(entry);
      localStorage.setItem("mrc_recent_txs", JSON.stringify(stored.slice(0, 10)));
    } catch (e) {
      console.error("[MRC] localStorage save failed:", e);
    }
    // DB — allows wallet-based lookup across devices
    try {
      const addr = recipientAddr.trim().toLowerCase();
      const payinAddr = (tx.payinAddress || "").trim().toLowerCase();
      console.log("[MRC] Saving transaction to DB:", { id: tx.id, mrcId: mrcTxId, provider, addr, payinAddr });
      const refCode = sessionStorage.getItem("mrc_partner_ref") || null;
      const { error } = await supabase.from("swap_transactions").insert({
        transaction_id: tx.id,
        recipient_address: addr,
        payin_address: payinAddr,
        from_currency: tx.fromCurrency,
        to_currency: tx.toCurrency,
        amount: tx.amount,
        ref_code: refCode,
        provider,
        mrc_tx_id: mrcTxId,
        kind: "swap",
      } as any);
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
      const status = await getStatusByProvider(input, "cn");
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
      const status = await getStatusByProvider(txId, "cn");
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
      const paramFrom = (params.get("from") || defaultFrom)?.toLowerCase();
      const rawTo = (params.get("to") || defaultTo)?.toLowerCase();
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
        // 2026 listings — Sovereign AI Stack
        prl: "prlsol",
        rave: "raveerc20",
        stable: "stablebsc",
        // Tokenized RWA equities (Ondo) — accept bare ticker, "a"-prefix (aNVDA), and "_stock" suffix
        nvda: "nvdaonerc20",
        anvda: "nvdaonerc20",
        nvda_stock: "nvdaonerc20",
        msft: "msftonerc20",
        amsft: "msftonerc20",
        msft_stock: "msftonerc20",
        spy: "spyonerc20",
        aspy: "spyonerc20",
        spy_stock: "spyonerc20",
        meta: "metaonerc20",
        ameta: "metaonerc20",
        meta_stock: "metaonerc20",
        tsla: "tslaonerc20",
        atsla: "tslaonerc20",
        tsla_stock: "tslaonerc20",
        aapl: "aaplonerc20",
        aaapl: "aaplonerc20",
        aapl_stock: "aaplonerc20",
        googl: "googlonerc20",
        agoogl: "googlonerc20",
        googl_stock: "googlonerc20",
        amzn: "amznonerc20",
        aamzn: "amznonerc20",
        amzn_stock: "amznonerc20",
        // High-utility L1s / payments
        xec: "xec",
        ecash: "xec",
        // RWA / commodities
        paxg: "paxg",
        xaut: "xaut",
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

      getAggregatedCurrencies()
        .then((rawResp) => {
          // Defensive: API may return [...] OR {data: [...]} depending on transport/proxy
          const data: Currency[] | null = Array.isArray(rawResp)
            ? (rawResp as Currency[])
            : Array.isArray((rawResp as { data?: unknown })?.data)
              ? ((rawResp as { data: Currency[] }).data)
              : null;

          if (data && data.length > 0) {
            setCurrencies(data);

            const findCurrency = (mapped: string | undefined, raw: string | undefined) => {
              if (!mapped) return null;
              const exact = data.find((c) => c.ticker === mapped);
              if (exact) return exact;
              if (raw && raw !== mapped) {
                const rawMatch = data.find((c) => c.ticker === raw);
                if (rawMatch) return rawMatch;
              }
              const prefix = data.find((c) => c.ticker.startsWith(mapped));
              return prefix || null;
            };

            const fromMatch = findCurrency(paramFromMapped, paramFrom);
            const toMatch = findCurrency(paramTo, rawTo);
            const nextFrom = fromMatch || data.find((c) => c.ticker === "btc") || data[0];
            const nextTo = toMatch || data.find((c) => c.ticker === "eth") || data[1];
            setFromCurrency(nextFrom);
            setToCurrency(nextTo);
            if (paramAmount && parseFloat(paramAmount) > 0) {
              setSendAmount(paramAmount);
            }
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
          } else {
            // Empty/malformed payload — treat as failure so retry kicks in
            throw new Error("Empty currencies payload");
          }
        })

        .catch(() => {
          if (retryCount < maxRetries) {
            retryCount++;
            setRetrying(true);
            setTimeout(loadCurrencies, 3000 * retryCount);
          } else {
            setRetrying(true);
            // Silent retry — no red error toast; keep showing "Refreshing Rates…"
            setTimeout(loadCurrencies, 5000);
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
      // Deep-link pre-selection: check URL params and trade direction
      const dlParams = new URLSearchParams(window.location.search);
      const dlFiat = (dlParams.get("fiat") || dlParams.get("from"))?.toUpperCase();
      const dlCrypto = (dlParams.get("crypto") || dlParams.get("to"))?.toUpperCase();
      const dlTab = dlParams.get("tab")?.toLowerCase();
      const initialDirection: FiatFlow = dlTab === "sell"
        ? "sell"
        : dlTab === "buy"
          ? "buy"
          : gTradeDirection;

      const defaults = getGuardarianDefaults(initialDirection, fiat, crypto, dlFiat, dlCrypto);
      setGFromCurrency(defaults.from);
      setGToCurrency(defaults.to);
      setGSendAmount(defaults.amount);
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
  }, [gTradeDirection, getGuardarianDefaults]);

  useEffect(() => {
    if (widgetMode !== "buysell" || guardarianLoaded) return;
    loadGuardarianCurrencies();
  }, [widgetMode, guardarianLoaded, loadGuardarianCurrencies]);

  useEffect(() => {
    if (widgetMode !== "buysell" || !guardarianLoaded) return;

    const sellMismatch = gTradeDirection === "sell"
      && (gFromCurrency?.currency_type !== "CRYPTO" || gToCurrency?.currency_type !== "FIAT");
    const buyMismatch = gTradeDirection === "buy"
      && (gFromCurrency?.currency_type !== "FIAT" || gToCurrency?.currency_type !== "CRYPTO");

    if (sellMismatch || buyMismatch) {
      applyGuardarianDefaults(gTradeDirection);
    }
  }, [
    widgetMode,
    guardarianLoaded,
    gTradeDirection,
    gFromCurrency?.currency_type,
    gToCurrency?.currency_type,
    applyGuardarianDefaults,
  ]);

  const collectGuardarianPaymentMethods = useCallback((currency: GuardarianCurrency | null) => {
    if (!currency) return [] as GuardarianPaymentMethod[];
    const allMethods: GuardarianPaymentMethod[] = [];
    const seen = new Set<string>();
    const addMethod = (pm: GuardarianPaymentMethod | undefined) => {
      if (!pm?.type || seen.has(pm.type)) return;
      seen.add(pm.type);
      allMethods.push(pm);
    };
    for (const net of currency.networks || []) {
      for (const pm of net.payment_methods || []) addMethod(pm as GuardarianPaymentMethod);
    }
    for (const pm of currency.payment_methods || []) addMethod(pm as GuardarianPaymentMethod);
    return allMethods;
  }, []);

  const pickPreferredGuardarianMethod = useCallback((ticker: string | undefined, methods: GuardarianPaymentMethod[], direction: FiatFlow) => {
    const smartDefault = getSmartDefaultMethod(ticker || "");
    if (smartDefault) {
      const match = methods.find((pm) => {
        const rawCandidates = [pm.type, pm.payment_method, pm.payment_category]
          .filter(Boolean)
          .map((value) => String(value).toUpperCase());
        return rawCandidates.some((value) => value === smartDefault || value.includes(smartDefault));
      });
      if (match) return match.type;
    }
    if (ticker?.toUpperCase() === "BRL") return methods.find((pm) => /PIX/i.test(pm.type) || /PIX/i.test(pm.payment_method || "") || /PIX/i.test(pm.payment_category || ""))?.type || "";
    if (ticker?.toUpperCase() === "EUR") return methods.find((pm) => /SEPA|OPEN_BANKING/i.test(pm.type) || /SEPA|OPEN_BANKING/i.test(pm.payment_method || "") || /SEPA|OPEN_BANKING/i.test(pm.payment_category || ""))?.type || "";
    if (ticker?.toUpperCase() === "GBP") return methods.find((pm) => /FPS|FASTER/i.test(pm.type) || /FPS|FASTER/i.test(pm.payment_method || "") || /FPS|FASTER/i.test(pm.payment_category || ""))?.type || "";
    return methods[0]?.type || "";
  }, []);

  const resolveGuardarianPaymentMethod = useCallback((
    ticker: string | undefined,
    methods: GuardarianPaymentMethod[],
    selectedMethod: string,
    direction: FiatFlow,
  ) => {
    const eligibleMethods = methods.filter((pm) => direction === "sell" ? pm.withdrawal_enabled : pm.deposit_enabled);
    const methodPool = eligibleMethods.length ? eligibleMethods : (direction === "sell" ? [] : methods);

    if (!methodPool.length) return "";

    const preferredMethod = pickPreferredGuardarianMethod(ticker, methodPool, direction);

    if (selectedMethod && methodPool.some((pm) => pm.type === selectedMethod)) {
      return selectedMethod;
    }

    return preferredMethod || methodPool[0]?.type || "";
  }, [pickPreferredGuardarianMethod]);

  // Allow all fiat currencies for sell — the estimate API will validate corridor availability
  const isSellEligibleFiat = useCallback((_currency: GuardarianCurrency | null) => {
    if (!_currency || _currency.currency_type !== "FIAT") return false;
    return true;
  }, []);

  useEffect(() => {
    if (widgetMode !== "buysell") return;
    const fiatCurrency = gTradeDirection === "buy" ? gFromCurrency : gToCurrency;
    if (!fiatCurrency || fiatCurrency.currency_type !== "FIAT") {
      setGPaymentMethods([]);
      setGSelectedPaymentMethod("");
      return;
    }

    let cancelled = false;

    const loadPaymentMethods = async () => {
      // For sell, strictly use withdrawal-enabled methods only
      const withdrawalFilter = (pm: GuardarianPaymentMethod) => pm.withdrawal_enabled;
      const depositFilter = (pm: GuardarianPaymentMethod) => pm.deposit_enabled;
      const directionFilter = gTradeDirection === "sell" ? withdrawalFilter : depositFilter;
      const allMethods = collectGuardarianPaymentMethods(fiatCurrency);
      const filteredMethods = allMethods.filter(directionFilter);
      // For sell: if no withdrawal methods exist, show all methods but mark them — estimate will be sent without payment_method
      const fallbackMethods = filteredMethods.length > 0 ? filteredMethods : [];

      try {
        const liveMethods = await getGuardarianPaymentMethods(fiatCurrency.ticker, fiatCurrency.currency_type);
        const eligibleMethods = (liveMethods.length ? liveMethods : fallbackMethods).filter(directionFilter);

        if (cancelled) return;

        // Inject synthetic preferred methods only for BUY direction (deposit)
        // For SELL, rely solely on API-reported withdrawal_enabled methods
        const syntheticPreferredMethods = gTradeDirection === "buy" ? [
          ...(fiatCurrency.ticker === "BRL" ? [{ type: "PIX", payment_category: "BANK_TRANSFER", deposit_enabled: true, withdrawal_enabled: false }] : []),
          ...(fiatCurrency.ticker === "EUR" ? [{ type: "SEPA", payment_category: "BANK_TRANSFER", deposit_enabled: true, withdrawal_enabled: false }] : []),
          ...(fiatCurrency.ticker === "GBP" ? [{ type: "FASTER_PAYMENTS", payment_category: "BANK_TRANSFER", deposit_enabled: true, withdrawal_enabled: false }] : []),
        ] : [];
        const mergedPreferredMethods = [
          ...syntheticPreferredMethods.filter((pm) => !eligibleMethods.some((existing) => existing.type === pm.type)),
          ...eligibleMethods,
        ];
        const finalMethods = mergedPreferredMethods.length
          ? mergedPreferredMethods
          : fallbackMethods;

        setGPaymentMethods(finalMethods);
        setGSelectedPaymentMethod((current) => {
          return resolveGuardarianPaymentMethod(fiatCurrency.ticker, finalMethods, current, gTradeDirection);
        });
      } catch {
        if (cancelled) return;
        const syntheticFallback = gTradeDirection === "buy" ? [
              ...(!fallbackMethods.some((pm) => pm.type === "PIX") && fiatCurrency.ticker === "BRL" ? [{ type: "PIX", payment_category: "BANK_TRANSFER", deposit_enabled: true, withdrawal_enabled: false }] : []),
              ...(!fallbackMethods.some((pm) => pm.type === "SEPA") && fiatCurrency.ticker === "EUR" ? [{ type: "SEPA", payment_category: "BANK_TRANSFER", deposit_enabled: true, withdrawal_enabled: false }] : []),
              ...(!fallbackMethods.some((pm) => pm.type === "FASTER_PAYMENTS") && fiatCurrency.ticker === "GBP" ? [{ type: "FASTER_PAYMENTS", payment_category: "BANK_TRANSFER", deposit_enabled: true, withdrawal_enabled: false }] : []),
              ...fallbackMethods,
            ] : fallbackMethods;
        const finalMethods = syntheticFallback.length ? syntheticFallback : [];
        setGPaymentMethods(finalMethods);
        setGSelectedPaymentMethod(resolveGuardarianPaymentMethod(fiatCurrency.ticker, finalMethods, "", gTradeDirection));
      }
    };

    loadPaymentMethods();
    return () => { cancelled = true; };
  }, [widgetMode, gFromCurrency, gToCurrency, gTradeDirection, collectGuardarianPaymentMethods, resolveGuardarianPaymentMethod]);

  const hasValidGuardarianEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gPayoutEmail.trim());
  const hasValidGuardarianPayoutDetails = gTradeDirection === "sell"
    ? gBankFieldsValid // Sell: bank details must be valid
    : Boolean(gPayoutAddress.trim()); // Buy: wallet address required
  const canStartGuardarianCheckout = !gCreatingTx
    && Boolean(gEstimatedAmount)
    && gEstimatedAmount !== "—"
    && parseFloat(gEstimatedAmount) > 0
    && parseFloat(gSendAmount) >= gMinAmount
    && parseFloat(gSendAmount) <= gMaxAmount
    && hasValidGuardarianEmail
    && hasValidGuardarianPayoutDetails
    && (gTradeDirection === "buy" ? Boolean(gPayoutAddress.trim()) : true);

  // Deep-link: ?tab=buy|sell&crypto=SOL&fiat=USD activates Buy/Sell tab automatically
  // Deep-link: ?category=stocks|ai|stables pre-filters the token picker and opens it
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab")?.toLowerCase();
    if (tab === "buy" || tab === "buysell") {
      setWidgetMode("buysell");
      setGTradeDirection("buy");
    } else if (tab === "sell") {
      setWidgetMode("buysell");
      setGTradeDirection("buy");
    } else if (tab === "bridge") {
      setWidgetMode("bridge");
    } else if (tab === "request" || tab === "invoice") {
      setWidgetMode("request");
    } else if (tab === "loan") {
      setWidgetMode("loan");
    } else if (tab === "earn") {
      setWidgetMode("earn");
    }

    const category = params.get("category")?.toLowerCase();
    if (category && ["ai", "stocks", "stables"].includes(category)) {
      setPickerCategory(category);
      // Auto-open the To picker so the curated category is immediately visible
      setTimeout(() => setShowToPicker(true), 250);
    }
  }, []);

  // Notify parent of tab changes
  useEffect(() => {
    onTabChange?.(widgetMode);
  }, [widgetMode, onTabChange]);

  // Reset bank fields when fiat currency changes in sell mode
  useEffect(() => {
    if (gTradeDirection === "sell") {
      setGBankFields({});
    }
  }, [gToCurrency?.ticker, gTradeDirection]);

  // Helper: only pass network for crypto currencies, skip for fiat.
  // Sell flow must keep same-ticker networks too, e.g. BTC -> from_network=BTC.
  const getNetworkParam = (currency: GuardarianCurrency | null, options?: { forceTickerFallback?: boolean }): string | undefined => {
    if (!currency || currency.currency_type === "FIAT") return undefined;

    const network = getPreferredGuardarianNetworkCode(currency);
    if (network) return network;
    if (options?.forceTickerFallback) return currency.ticker.toUpperCase();
    return undefined;
  };

  const sanitizeBankFieldValue = useCallback((field: PayoutFieldDef, value: string) => {
    if (field.sanitize) return field.sanitize(value);
    return value.trim().replace(/[\s.-]/g, "");
  }, []);

  const getGuardarianRateText = () => {
    if (!gFullEstimate?.estimated_exchange_rate || !gFromCurrency || !gToCurrency) return "";
    const rate = Number(gFullEstimate.estimated_exchange_rate);
    if (!Number.isFinite(rate) || rate <= 0) return "";
    return `1 ${gFromCurrency.ticker} ≈ ${rate.toLocaleString(undefined, { maximumFractionDigits: 8 })} ${gToCurrency.ticker}`;
  };

  // Guardarian estimate
  const fetchGuardarianEstimate = useCallback(async () => {
    const requestId = ++gEstimateRequestIdRef.current;

    if (!gFromCurrency || !gToCurrency || !gSendAmount || parseFloat(gSendAmount) <= 0) {
      setGEstimatedAmount("");
      setGFullEstimate(null);
      setGEstimateError("");
      return;
    }
    setGEstimating(true);
    setGFullEstimate(null);
    setGEstimateError("");
    try {
      const fromNetwork = getNetworkParam(gFromCurrency, { forceTickerFallback: gTradeDirection === "sell" });
      const toNetwork = getNetworkParam(gToCurrency);
      const baseEstimateParams: Parameters<typeof getGuardarianEstimate>[0] = {
        from_currency: gFromCurrency.ticker,
        to_currency: gToCurrency.ticker,
        from_amount: gSendAmount,
        ...(gTradeDirection === "sell" ? { side: "sell" as const } : {}),
      };
      if (fromNetwork) baseEstimateParams.from_network = fromNetwork;
      if (toNetwork) baseEstimateParams.to_network = toNetwork;

      const effectivePaymentMethod = resolveGuardarianPaymentMethod(
        (gTradeDirection === "buy" ? gFromCurrency : gToCurrency)?.ticker,
        gPaymentMethods,
        gSelectedPaymentMethod,
        gTradeDirection,
      );
      const requestPaymentMethod = effectivePaymentMethod;

      const minMaxParams: Parameters<typeof getGuardarianMinMax>[0] = {
        from_currency: gFromCurrency.ticker,
        to_currency: gToCurrency.ticker,
      };
      if (fromNetwork) minMaxParams.from_network = fromNetwork;
      if (toNetwork) minMaxParams.to_network = toNetwork;

      const primaryEstimateParams = requestPaymentMethod
        ? { ...baseEstimateParams, payment_method: requestPaymentMethod }
        : baseEstimateParams;

      const [primaryEstimate, minMax] = await Promise.all([
        getGuardarianEstimate(primaryEstimateParams),
        getGuardarianMinMax(minMaxParams),
      ]);

      if (requestId !== gEstimateRequestIdRef.current) return;

      setGMinAmount(Number(minMax.min) || 0);
      setGMaxAmount(Number(minMax.max) || 999999);

      let finalEstimate = primaryEstimate;
      if (((primaryEstimate as any)?.fallback || !primaryEstimate?.value) && requestPaymentMethod) {
        const fallbackEstimate = await getGuardarianEstimate(baseEstimateParams);
        if (requestId !== gEstimateRequestIdRef.current) return;
        if (!(fallbackEstimate as any)?.fallback && fallbackEstimate?.value) {
          finalEstimate = fallbackEstimate;
        }
      }

      if ((finalEstimate as any)?.fallback || !finalEstimate?.value) {
        setGEstimatedAmount("");
        setGFullEstimate(null);
        const amt = parseFloat(gSendAmount);
        const rangeMin = Number(minMax.min) || 0;
        const rangeMax = Number(minMax.max) || 999999;
        const isOutOfRange = rangeMin > 0 && rangeMax < 999999 && (amt < rangeMin || amt > rangeMax);
        const providerDetails = String((finalEstimate as any)?.details?.message || "").toLowerCase();

        const rawProviderMessage = (finalEstimate as any)?.details?.message || (finalEstimate as any)?.error || "Estimate unavailable";

        if (isOutOfRange) {
          setGEstimateError("");
        } else {
          setGEstimateError(String(rawProviderMessage));
        }
        return;
      }

      setGEstimatedAmount(finalEstimate.value || "");
      setGFullEstimate(finalEstimate);
    } catch {
      if (requestId !== gEstimateRequestIdRef.current) return;
      setGEstimatedAmount("");
      setGFullEstimate(null);
      setGEstimateError("Service temporarily unavailable. Please refresh and try again.");
    } finally {
      if (requestId === gEstimateRequestIdRef.current) {
        setGEstimating(false);
      }
    }
  }, [gFromCurrency, gToCurrency, gSendAmount, gTradeDirection, gSelectedPaymentMethod, gPaymentMethods, resolveGuardarianPaymentMethod]);

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
      const est = await getBestEstimate(fromCurrency.ticker, toCurrency.ticker, sendAmount, fixedRate);
      setEstimatedAmount(est.estimatedAmount?.toString() || "—");
      if (est.transactionSpeedForecast) {
        setSpeedForecast(est.transactionSpeedForecast);
      }
      // Smart-router: detect provider switch and surface "rate updated" toast on quote change
      if (est.provider !== winningProvider) {
        if (winningProvider !== "cn" || est.provider !== "cn") {
          toast({ title: "Rate updated", description: "We secured the best available rate for this swap." });
        }
        setWinningProvider(est.provider);
      }
      setBestRateActive(!!est.isBestRate);
    } catch {
      setEstimatedAmount("syncing");
      setSpeedForecast(null);
    }
    try {
      const min = await getBestMinAmount(fromCurrency.ticker, toCurrency.ticker, fixedRate);
      setMinAmount(min.minAmount || 0);
    } catch {
      setMinAmount(0);
    } finally {
      setEstimating(false);
    }
  }, [fromCurrency, toCurrency, sendAmount, fixedRate, winningProvider, toast]);

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
          const status = await getStatusByProvider(transaction.id, txProvider);
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

  // 15-minute Fixed-Rate price lock — refreshes whenever a new fixed quote is received
  useEffect(() => {
    if (fixedLockRef.current) clearInterval(fixedLockRef.current);
    if (
      widgetMode === "exchange" &&
      fixedRate &&
      step !== "address" &&
      estimatedAmount &&
      estimatedAmount !== "—" &&
      estimatedAmount !== "syncing" &&
      !estimating
    ) {
      setFixedLockSeconds(FIXED_LOCK_DURATION);
      fixedLockRef.current = setInterval(() => {
        setFixedLockSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(fixedLockRef.current!);
            // Auto-refresh quote when lock expires
            fetchEstimate();
            return FIXED_LOCK_DURATION;
          }
          return prev - 1;
        });
      }, 1000);
      return () => { if (fixedLockRef.current) clearInterval(fixedLockRef.current); };
    }
  }, [fixedRate, estimatedAmount, estimating, step, widgetMode, fetchEstimate, FIXED_LOCK_DURATION]);

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
      const result = await createBestTransaction({
        from: fromCurrency.ticker,
        to: toCurrency.ticker,
        amount: parseFloat(sendAmount),
        address: recipientAddress.trim(),
        ...(extraId && { extraId }),
        ...(refundAddress && { refundAddress: refundAddress.trim() }),
      }, winningProvider);
      setTransaction(result);
      setTxProvider(result.provider);
      saveTransaction(result, recipientAddress, result.provider);
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
      // Send swap confirmation via SMTP (Premium Dark template)
      try {
        const userLang = localStorage.getItem('user-lang') || navigator.language?.slice(0, 2) || 'en';
        await supabase.functions.invoke("smtp-send", {
          body: {
            type: "receipt",
            recipientEmail: notifyEmail.trim(),
            transactionId: transaction.id,
            fromAmount: String(transaction.amount ?? sendAmount),
            fromCurrency: transaction.fromCurrency || fromCurrency?.ticker || "",
            toCurrency: transaction.toCurrency || toCurrency?.ticker || "",
            recipientAddress: recipientAddress.trim(),
            depositAddress: transaction.payinAddress || "",
            lang: userLang,
          },
        });
      } catch (emailErr) {
        console.error("[MRC] SMTP confirmation email failed:", emailErr);
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

    if (gTradeDirection === "buy" && !gPayoutAddress.trim()) {
      toast({ title: "Wallet required", description: `Enter your ${gToCurrency.ticker} wallet address to continue.`, variant: "destructive" });
      return;
    }

    if (gTradeDirection === "sell" && !gBankFieldsValid) {
      toast({ title: "Bank details required", description: "Please fill in all required payout fields correctly.", variant: "destructive" });
      return;
    }

    if (!gPayoutEmail.trim() || !hasValidGuardarianEmail) {
      toast({ title: "Email required", description: "Enter a valid email address to continue.", variant: "destructive" });
      return;
    }

    setGShowReview(true);
  };

  const handleConfirmGuardarianCheckout = async () => {
    setGShowReview(false);
    setGCreatingTx(true);

    try {
      const fromNet = getNetworkParam(gFromCurrency, { forceTickerFallback: gTradeDirection === "sell" });
      const toNet = getNetworkParam(gToCurrency);
      const emailParam = gPayoutEmail.trim() || undefined;
      const fiatCurrency = gTradeDirection === "buy" ? gFromCurrency : gToCurrency;
      const effectivePaymentMethod = resolveGuardarianPaymentMethod(
        fiatCurrency?.ticker,
        gPaymentMethods,
        gSelectedPaymentMethod,
        gTradeDirection,
      );
      const requestPaymentMethod = effectivePaymentMethod;

      // Build bank_details for sell flow
      let bankDetails: GuardarianBankDetails | undefined;
      if (gTradeDirection === "sell" && gPayoutFieldDefs.length > 0) {
        bankDetails = {};
        for (const field of gPayoutFieldDefs) {
          const raw = gBankFields[field.key] || "";
            bankDetails[field.key] = sanitizeBankFieldValue(field, raw);
        }
      }

      const result = await createGuardarianTransaction({
        from_amount: parseFloat(gSendAmount),
        from_currency: gFromCurrency!.ticker,
        to_currency: gToCurrency!.ticker,
        payout_currency: gToCurrency!.ticker,
        ...(fromNet ? { from_network: fromNet } : {}),
        ...(toNet ? { to_network: toNet } : {}),
        ...(gTradeDirection === "buy" ? { payout_address: gPayoutAddress.trim() } : {}),
        ...(bankDetails ? { bank_details: bankDetails } : {}),
        email: emailParam,
        ...(requestPaymentMethod ? { payment_method: requestPaymentMethod } : {}),
        ...(gTradeDirection === "sell" ? { side: "sell" as const } : {}),
        trade_direction: gTradeDirection,
      });

      const checkoutUrl = result?.checkout_url || result?.redirect_url;
      if (checkoutUrl) {
        setGCheckoutUrl(checkoutUrl);
        setGStep("checkout");
        const openedWindow = window.open(checkoutUrl, "_blank", "noopener,noreferrer");
        setGPaymentOpened(Boolean(openedWindow));
        toast({
          title: "Transaction created",
          description: gTradeDirection === "sell"
            ? "Your payout window has been opened in a new tab."
            : "Your payment window has been opened in a new tab.",
        });
        return;
      }

      toast({ title: "Service Temporarily Unavailable", description: "Could not initialize checkout. Please try again.", variant: "destructive" });
    } catch (err: any) {
      const msg = err?.details?.message || err?.message || "Transaction creation failed";
      toast({ title: "Service Temporarily Unavailable", description: msg, variant: "destructive" });
    } finally {
      setGCreatingTx(false);
    }
  };

  const filteredCurrencies = currencies
    .filter((c) => matchesPickerCategory(c, pickerCategory))
    .filter((c) => matchesExchangeCurrencySearch(c, searchQuery));

  const sortedCurrencies = [...filteredCurrencies].sort((a, b) => {
    const aPopular = POPULAR_TICKERS.indexOf(a.ticker);
    const bPopular = POPULAR_TICKERS.indexOf(b.ticker);
    if (aPopular !== -1 && bPopular !== -1) return aPopular - bPopular;
    if (aPopular !== -1) return -1;
    if (bPopular !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  const belowMin = parseFloat(sendAmount) > 0 && minAmount > 0 && parseFloat(sendAmount) < minAmount;
  const canExchangeNow = widgetMode === "exchange" && !loading && !estimating && !creatingTx && Boolean(fromCurrency && toCurrency) && Boolean(estimatedAmount) && estimatedAmount !== "—" && estimatedAmount !== "syncing" && !belowMin;

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
      className="relative scroll-mt-24 rounded-2xl border border-[hsl(220_20%_20%/0.15)] p-3 shadow-elevated sm:p-6 lg:p-8 transform-gpu"
      style={{
        backfaceVisibility: "hidden",
        background: "linear-gradient(145deg, hsl(220 25% 12% / 0.85) 0%, hsl(220 30% 8% / 0.92) 100%)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 24px 80px -12px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <AnimatePresence mode="wait">
        {/* ===== STEP 1: Exchange Form ===== */}
        {step === "exchange" && (
          <motion.div key="exchange" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* ===== MODE TABS: Exchange | Buy/Sell ===== */}
            <div className="mb-5 space-y-2">
              {/* Sticky tab header on mobile — premium HNW fintech aesthetic */}
              <div className="sticky top-0 z-20 -mx-3 px-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 pt-1 pb-2 rounded-t-2xl" style={{ background: "transparent" }}>
                {(() => {
                  const allTabs = [
                    { mode: "exchange" as WidgetMode, icon: Repeat, labelKey: "widget.tabs.exchange", onClick: () => { setWidgetMode("exchange"); setGStep("form"); setGCheckoutUrl(""); } },
                    { mode: "buysell" as WidgetMode, icon: CreditCard, labelKey: "widget.tabs.buy", onClick: () => {
                      setWidgetMode("buysell");
                      setGTradeDirection("buy");
                      setGStep("form");
                      setGCheckoutUrl("");
                      setGShowReview(false);
                      setGEstimateError("");
                      setGSelectedPaymentMethod("");
                      setGPayoutAddress("");
                      setGPayoutEmail("");
                      setGBankFields({});
                      setGSepaIban("");
                      setGSepaBic("");
                      if (guardarianFiat.length || guardarianCrypto.length) {
                        applyGuardarianDefaults("buy");
                      }
                    }},
                    { mode: "private" as WidgetMode, icon: EyeOff, labelKey: "widget.tabs.private", onClick: () => { setWidgetMode("private"); } },
                    { mode: "bridge" as WidgetMode, icon: Link2, labelKey: "widget.tabs.bridge", onClick: () => { setWidgetMode("bridge"); } },
                    { mode: "request" as WidgetMode, icon: FileText, labelKey: "widget.tabs.invoice", onClick: () => { setWidgetMode("request"); } },
                    { mode: "loan" as WidgetMode, icon: Landmark, labelKey: "widget.tabs.loan", badge: "🔥", onClick: () => { setWidgetMode("loan"); } },
                    { mode: "earn" as WidgetMode, icon: TrendingUp, labelKey: "widget.tabs.earn", badge: "NEW", onClick: () => { setWidgetMode("earn"); } },
                  ] as const;

                  const row1 = allTabs.slice(0, 4);
                  const row2 = allTabs.slice(4);

                  const renderTab = (tab: typeof allTabs[number]) => {
                    const isActive = tab.mode === "buysell"
                      ? widgetMode === "buysell" && gTradeDirection === "buy"
                      : widgetMode === tab.mode;
                    const TabIcon = tab.icon;
                    const badge = "badge" in tab ? tab.badge : null;
                    const isFinancial = tab.mode === "loan" || tab.mode === "earn";
                    return (
                      <button
                        key={tab.mode}
                        onClick={tab.onClick}
                        className={`group relative flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 font-display text-xs font-semibold whitespace-nowrap min-h-[44px] transition-all duration-200 ${
                          isActive
                            ? "text-[hsl(160_100%_8%)]"
                            : isFinancial
                              ? "text-[hsl(220_15%_55%)] hover:text-[hsl(220_15%_80%)] hover:bg-[hsl(0_0%_100%/0.06)]"
                              : "text-[hsl(220_15%_55%)] hover:text-[hsl(220_15%_80%)] hover:bg-[hsl(0_0%_100%/0.06)]"
                        }`}
                        style={{
                          ...(isActive ? {
                            background: "linear-gradient(180deg, hsl(160 100% 52%) 0%, hsl(160 100% 38%) 100%)",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 3px rgba(0,0,0,0.5), 0 4px 12px -2px hsl(160 100% 45% / 0.25)",
                          } : isFinancial ? {
                            boxShadow: "inset 0 0 0 1px hsl(160 100% 45% / 0.12)",
                          } : {}),
                        }}
                      >
                        <TabIcon
                          className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                            isActive
                              ? "drop-shadow-[0_0_4px_hsl(160_100%_45%/0.7)]"
                              : "group-hover:drop-shadow-[0_0_3px_hsl(160_100%_45%/0.3)]"
                          }`}
                        />
                        <span className="leading-tight tracking-wide">{t(tab.labelKey)}</span>
                        {badge && (
                          <span
                            className="absolute -top-1.5 -right-1 rounded-full px-1.5 py-px text-[7px] font-bold leading-none"
                            style={{
                              background: "linear-gradient(135deg, hsl(160 100% 50%) 0%, hsl(160 100% 38%) 100%)",
                              color: "hsl(160 100% 8%)",
                              boxShadow: "0 0 6px hsl(160 100% 45% / 0.4)",
                            }}
                          >
                            {badge}
                          </span>
                        )}
                      </button>
                    );
                  };

                  return (
                    <div
                      className="rounded-xl p-1.5"
                      style={{
                        background: "hsl(220 25% 6% / 0.7)",
                        border: "1px solid hsl(220 20% 20% / 0.25)",
                        boxShadow: "inset 0 2px 8px rgba(0,0,0,0.45), inset 0 0 1px rgba(255,255,255,0.03), 0 1px 0 rgba(255,255,255,0.02)",
                      }}
                    >
                      {/* Row 1 — Transactional */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 mb-1">
                        {row1.map(renderTab)}
                      </div>
                      {/* Row 2 — Financial Services */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                        {row2.map((tab, i) => {
                          const isLast = i === row2.length - 1 && row2.length % 2 !== 0;
                          return (
                            <div key={tab.mode} className={isLast ? "col-span-2 sm:col-span-1" : ""}>
                              {renderTab(tab)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="flex justify-end">
                <span className="hidden min-[481px]:flex items-center gap-1.5 rounded-full border border-trust/30 bg-trust/10 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-trust">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-trust opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-trust"></span>
                  </span>
                  {t("widget.online")}
                </span>
              </div>
            </div>

            {/* ===== BUY/SELL MODE (Guardarian) ===== */}
            {widgetMode === "buysell" && (
              <div>
                {guardarianLoading ? (
                  <div className="flex h-60 flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground animate-pulse">
                      {gCurrencyRetryCount > 0 ? `${t("widget.retrying")} (${gCurrencyRetryCount}/3)` : t("widget.loadingCurrencies")}
                    </span>
                  </div>
                ) : gCurrencyError ? (
                  <div className="flex h-60 flex-col items-center justify-center gap-3 text-center">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                    <p className="text-sm text-muted-foreground">{t("widget.couldNotLoad")}</p>
                    <Button variant="outline" size="sm" onClick={() => loadGuardarianCurrencies(0)}>
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> {t("widget.retry")}
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Buy mode — no sell toggle */}

                    {/* You Pay */}
                    <div className="relative">
                      <label className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {gTradeDirection === "buy" ? t("widget.youPayFiat") : t("widget.youPayCrypto")}
                      </label>
                      <div className="flex items-center gap-3 rounded-xl border border-[hsl(220_20%_20%/0.3)] p-4" style={{ background: "hsl(220 25% 8% / 0.6)", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.35), inset 0 0 1px rgba(255,255,255,0.03)" }}>
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
                          <span className="font-display text-sm font-semibold uppercase text-primary">{gFromCurrency?.ticker || t("widget.select")}</span>
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
                          {t("widget.maximum")} {gMaxAmount} {gFromCurrency?.ticker}
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
                                  .filter((c) => matchesGuardarianCurrencySearch(c, gSearchQuery))
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
                              <GuardarianCryptoListView
                                items={guardarianCrypto.filter((c) => matchesGuardarianCurrencySearch(c, gSearchQuery))}
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
                        <CheckCircle2 className="h-3 w-3" /> All-in pricing
                      </span>
                      {getGuardarianRateText() && (
                        <span className="font-body text-[10px] text-muted-foreground sm:text-[11px]">
                          {getGuardarianRateText()}
                        </span>
                      )}
                    </div>
                    {gEstimateError && (
                      <div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-accent px-3 py-2 font-body text-[11px] text-muted-foreground">
                        <RefreshCw className="h-3.5 w-3.5 shrink-0 animate-spin" />
                        <span>Syncing with Global Liquidity Rails…</span>
                      </div>
                    )}

                    {/* You Get (Crypto) */}
                    <div className="relative">
                      <label className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {gTradeDirection === "buy" ? t("widget.youReceiveCrypto") : t("widget.youGetFiat")}
                      </label>
                      <div className="flex items-center gap-3 rounded-xl border border-[hsl(220_20%_20%/0.3)] p-4" style={{ background: "hsl(220 25% 8% / 0.6)", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.35), inset 0 0 1px rgba(255,255,255,0.03)" }}>
                        <span className="flex-1 font-display text-2xl font-bold text-foreground">
                          {gEstimating ? (
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          ) : gEstimateError ? (
                            <span className="text-destructive text-base">{t("widget.checkErrorAbove")}</span>
                          ) : gEstimatedAmount && parseFloat(gEstimatedAmount) <= 0 ? (
                            <span className="text-destructive text-base">{t("widget.minNotMet")}</span>
                          ) : (
                            (() => {
                              if (!gEstimatedAmount) return "≈ —";
                              const raw = parseFloat(gEstimatedAmount);
                              if (!Number.isFinite(raw) || raw <= 0) return `≈ ${gEstimatedAmount}`;
                              // Subtract our 0.5% service fee from displayed receive amount
                              const adjusted = (raw * 0.995).toFixed(raw >= 1 ? 6 : 8);
                              return `≈ ${adjusted}`;
                            })()
                          )}
                        </span>
                        <button onClick={() => setGShowToPicker(true)} className="flex items-center gap-2 rounded-lg bg-trust/10 px-4 py-2.5 transition-colors hover:bg-trust/20">
                          {gToCurrency && (
                            gTradeDirection === "sell" && fiatFlagUrl(gToCurrency.ticker)
                              ? <img src={fiatFlagUrl(gToCurrency.ticker)} alt="" className="h-5 w-5 rounded-full object-cover" />
                              : gTradeDirection === "buy" && <GuardarianAssetIcon currency={gToCurrency} />
                          )}
                          <span className="font-display text-sm font-semibold uppercase text-trust">{gToCurrency?.ticker || t("widget.select")}</span>
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
                                placeholder={gTradeDirection === "buy" ? t("widget.searchCrypto") : t("widget.searchFiat")}
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
                                <GuardarianCryptoListView
                                  items={guardarianCrypto.filter((c) => matchesGuardarianCurrencySearch(c, gSearchQuery))}
                                  onSelect={(c) => { setGToCurrency(c); setGShowToPicker(false); setGSearchQuery(""); }}
                                />
                              </>
                            ) : (
                              <div className="overflow-y-auto p-2" style={{ maxHeight: 400 }}>
                                {guardarianFiat
                                  .filter((c) => isSellEligibleFiat(c) && matchesGuardarianCurrencySearch(c, gSearchQuery))
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
                        {/* Wallet address — only for Buy mode */}
                        {gTradeDirection === "buy" && (
                          <div className="mt-4">
                            <label className="mb-1.5 flex items-center gap-1.5 font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              <Wallet className="h-3 w-3" />
                              {t("widget.yourWallet", { ticker: gToCurrency?.ticker || "crypto" })}
                            </label>
                            <DestinationAddressInput
                              value={gPayoutAddress}
                              onChange={setGPayoutAddress}
                              currencyTicker={gToCurrency?.ticker}
                              expectedNetworkType={gToCurrency ? tickerToAddressType(gToCurrency.ticker?.toLowerCase(), gToCurrency.networks?.[0]?.network?.toLowerCase()) : undefined}
                            />
                          </div>
                        )}

                        {/* Dynamic bank detail fields — only for Sell mode */}
                        {gTradeDirection === "sell" && gPayoutFieldDefs.length > 0 && (
                          <div className="mt-4 space-y-3">
                            <label className="mb-1 flex items-center gap-1.5 font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              <Shield className="h-3 w-3" /> {t("widget.payoutDetails")} ({gToCurrency?.ticker || "Fiat"})
                            </label>
                            {gPayoutFieldDefs.map((field) => {
                              const val = gBankFields[field.key] || "";
                              const isValid = !val || field.validate(val);
                              return (
                                <div key={field.key}>
                                  <label className="mb-1 block font-body text-[11px] font-medium text-muted-foreground">
                                    {field.label}
                                  </label>
                                  <Input
                                    type="text"
                                    inputMode={field.inputMode || "text"}
                                    placeholder={field.placeholder}
                                    value={val}
                                    onChange={(e) => setGBankFields((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                    maxLength={field.maxLength}
                                    className={`min-h-[48px] rounded-xl font-body text-sm placeholder:text-muted-foreground/50 ${
                                      val && !isValid
                                        ? "border-destructive bg-destructive/5"
                                        : val && isValid
                                          ? "border-trust bg-trust/5"
                                          : "border-border bg-accent"
                                    }`}
                                  />
                                  {val && !isValid && (
                                    <p className="mt-0.5 font-body text-[10px] text-destructive">
                                      {t("widget.invalidFormat")}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Contact Email */}
                        <div className="mt-3">
                          <label className="mb-1.5 flex items-center gap-1.5 font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            <Mail className="h-3 w-3" /> {t("widget.contactEmail")}
                          </label>
                          <Input
                            type="email"
                            placeholder="your@email.com — for order confirmation"
                            value={gPayoutEmail}
                            onChange={(e) => setGPayoutEmail(e.target.value)}
                            className="min-h-[48px] rounded-xl border-border bg-accent font-body text-sm placeholder:text-muted-foreground/50"
                            maxLength={255}
                          />
                        </div>

                        {/* Market-specific payment badge */}
                        {(() => {
                          const fiatTicker = (gTradeDirection === "buy" ? gFromCurrency : gToCurrency)?.ticker;
                          const method = gSelectedPaymentMethod?.toLowerCase();
                          if (fiatTicker === "BRL" && method === "pix") {
                            const { Logo } = resolvePaymentMethodDisplay("PIX");
                            return (
                              <div className="mt-2 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                                <Logo className="h-5 w-auto" />
                                <span className="font-body text-[11px] text-muted-foreground">Instant Brazilian payment — no fees</span>
                              </div>
                            );
                          }
                          if (fiatTicker === "EUR" && /sepa|open_banking/.test(method)) {
                            const { Logo } = resolvePaymentMethodDisplay("SEPA");
                            return (
                              <div className="mt-2 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                                <Logo className="h-5 w-auto" />
                                <span className="font-body text-[11px] text-muted-foreground">SEPA bank transfer — EU-wide</span>
                              </div>
                            );
                          }
                          if (fiatTicker === "GBP" && (method === "faster_payments" || method === "fps")) {
                            const { Logo } = resolvePaymentMethodDisplay("FPS");
                            return (
                              <div className="mt-2 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                                <Logo className="h-5 w-auto" />
                                <span className="font-body text-[11px] text-muted-foreground">Faster Payments — UK instant</span>
                              </div>
                            );
                          }
                          return null;
                        })()}

                        {/* Fee breakdown — slim */}
                        {gFullEstimate && (
                          <div className="mt-3 space-y-1.5 rounded-xl border border-border bg-accent/40 px-4 py-3">
                            {gFullEstimate.service_fees?.map((fee, i) => (
                              <div key={i} className="flex items-center justify-between font-body text-[11px]">
                                <span className="text-muted-foreground">{t("widget.providerFee")} ({fee.percentage})</span>
                                <span className="font-medium text-foreground">{fee.amount} {fee.currency}</span>
                              </div>
                            ))}
                            {gFullEstimate.network_fee && (
                              <div className="flex items-center justify-between font-body text-[11px]">
                                <span className="text-muted-foreground">{t("widget.networkFee")}</span>
                                <span className="font-medium text-foreground">{parseFloat(gFullEstimate.network_fee.amount).toFixed(6)} {gFullEstimate.network_fee.currency}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between font-body text-[11px]">
                              <span className="text-muted-foreground">{t("widget.mrcServiceFee")}</span>
                              <span className="font-medium text-foreground">
                                {(parseFloat(gSendAmount) * 0.005).toFixed(2)} {gFromCurrency?.ticker}
                              </span>
                            </div>
                            <div className="flex items-center justify-between border-t border-border pt-1.5 font-body text-[11px] font-semibold">
                              <span className="text-foreground">{t("widget.totalFees")}</span>
                              <span className="text-foreground">
                                {(() => {
                                  const providerFees = (gFullEstimate.service_fees || []).reduce((sum, f) => sum + parseFloat(f.amount || "0"), 0);
                                  const networkFee = parseFloat(gFullEstimate.network_fee?.amount || "0");
                                  const ourFee = parseFloat(gSendAmount) * 0.005;
                                  const feesCurrency = gFullEstimate.service_fees?.[0]?.currency || gFromCurrency?.ticker || "";
                                  const networkCurrency = gFullEstimate.network_fee?.currency || "";
                                  if (networkCurrency && networkCurrency !== feesCurrency) {
                                    return `${(providerFees + ourFee).toFixed(2)} ${feesCurrency} + ${networkFee.toFixed(6)} ${networkCurrency}`;
                                  }
                                  return `${(providerFees + networkFee + ourFee).toFixed(4)} ${feesCurrency}`;
                                })()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between border-t border-border pt-1.5 font-body text-[11px]">
                              <span className="text-muted-foreground">{t("widget.rate")}</span>
                              <span className="font-medium text-foreground">1 {gFromCurrency?.ticker} ≈ {gFullEstimate.estimated_exchange_rate} {gToCurrency?.ticker}</span>
                            </div>
                          </div>
                        )}

                        {/* Dynamic Payment Methods */}
                        {gPaymentMethods.length > 0 && (
                          <div className="mt-3">
                            <label className="mb-1.5 block font-body text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              {gTradeDirection === "sell" ? t("widget.payoutMethod") : t("widget.paymentMethod")}
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                              {gPaymentMethods.map((pm) => {
                                const display = resolvePaymentMethodDisplay(pm.type || pm.payment_category || "");
                                const isSelected = gSelectedPaymentMethod === pm.type;
                                const LogoComponent = display.Logo;
                                return (
                                  <button
                                    key={pm.type}
                                    onClick={() => setGSelectedPaymentMethod(pm.type)}
                                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 font-body text-[11px] font-semibold tracking-wide transition-all ${
                                      isSelected
                                        ? "border-primary/40 bg-white/90 dark:bg-white/10 text-primary shadow-sm ring-1 ring-primary/20"
                                        : "border-border bg-gray-100 dark:bg-white/5 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                                    }`}
                                  >
                                    <span className="rounded bg-white dark:bg-white/15 p-0.5"><LogoComponent className="h-4 w-auto" /></span>
                                    <span>{display.label}</span>
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
                          disabled={!canStartGuardarianCheckout}
                          onClick={handleStartGuardarianCheckout}
                        >
                          {gCreatingTx ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("widget.openingCheckout")}</>
                          ) : gTradeDirection === "sell" ? (
                            <><Wallet className="mr-2 h-4 w-4" />{t("widget.sellCrypto", { ticker: gFromCurrency?.ticker || "Crypto" })}</>
                          ) : (
                            <><CreditCard className="mr-2 h-4 w-4" />{t("widget.buyCrypto", { ticker: gToCurrency?.ticker || "Crypto" })}</>
                          )}
                        </Button>

                        {/* Trust signals */}
                        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                          <span className="flex items-center gap-1 font-body text-[10px] text-muted-foreground"><Shield className="h-3 w-3 text-primary" /> {t("widget.regulatedProvider")}</span>
                          <span className="flex items-center gap-1 font-body text-[10px] text-muted-foreground"><Lock className="h-3 w-3 text-primary" /> {t("widget.secureCheckout")}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                          {gPaymentMethods.length > 0 ? (
                          gPaymentMethods.slice(0, 5).map((pm) => {
                              const display = resolvePaymentMethodDisplay(pm.type || "");
                              const LogoComponent = display.Logo;
                              return (
                                <span key={pm.type} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-body text-[10px] font-semibold tracking-wide ${
                                  gSelectedPaymentMethod === pm.type
                                    ? "border-primary/20 bg-white/90 dark:bg-white/10 text-primary"
                                    : "border-border bg-gray-100 dark:bg-white/5 text-muted-foreground"
                                }`}>
                                  <span className="rounded bg-white dark:bg-white/15 p-0.5"><LogoComponent className="h-3 w-auto" /></span>
                                  {display.label}
                                </span>
                              );
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
                          <ArrowLeft className="h-3.5 w-3.5" /> {t("widget.back")}
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
                                    <span className="text-muted-foreground">{t("widget.serviceFee")} ({fee.percentage})</span>
                                    <span className="font-medium text-foreground">{fee.amount} {fee.currency}</span>
                                  </div>
                                ))}
                                {gFullEstimate.network_fee && (
                                  <div className="flex items-center justify-between gap-3 font-body text-[11px]">
                                    <span className="text-muted-foreground">{t("widget.networkFee")}</span>
                                    <span className="font-medium text-foreground">{parseFloat(gFullEstimate.network_fee.amount).toFixed(8)} {gFullEstimate.network_fee.currency}</span>
                                  </div>
                                )}
                                <div className="flex items-center justify-between gap-3 border-t border-border pt-2 font-body text-[11px]">
                                  <span className="text-muted-foreground">{t("widget.rate")}</span>
                                  <span className="font-medium text-foreground">{getGuardarianRateText()}</span>
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
                        <button
                          onClick={() => { setGCheckoutUrl(""); setGStep("form"); setGPaymentOpened(false); }}
                          className="flex items-center gap-1.5 font-body text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" /> {t("widget.startOver")}
                        </button>

                        {!gPaymentOpened ? (
                          /* ── Transaction Ready — Pre-redirect screen ── */
                          <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-elevated">
                            <div className="border-b border-border bg-accent/40 p-5 text-center">
                              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                                <Shield className="h-7 w-7 text-primary" />
                              </div>
                              <h3 className="font-display text-lg font-bold text-foreground">
                                {gTradeDirection === "sell" ? t("widget.payoutReady") : t("widget.transactionReady")}
                              </h3>
                              <p className="mt-1 font-body text-xs text-muted-foreground">
                                {gTradeDirection === "sell"
                                  ? t("widget.orderCreatedSell")
                                  : t("widget.orderCreatedPay")}
                              </p>
                            </div>

                            {/* Order summary */}
                            <div className="space-y-3 p-5">
                              <div className="rounded-xl border border-border bg-accent/40 p-4 space-y-2">
                                <div className="flex justify-between font-body text-sm">
                                  <span className="text-muted-foreground">{t("widget.youPay")}</span>
                                  <span className="font-semibold text-foreground">{gSendAmount} {gFromCurrency?.ticker}</span>
                                </div>
                                <div className="flex justify-between font-body text-sm">
                                  <span className="text-muted-foreground">{t("widget.youReceive")}</span>
                                  <span className="font-semibold text-primary">{gEstimatedAmount || "—"} {gToCurrency?.ticker}</span>
                                </div>
                                {gTradeDirection === "buy" && gPayoutAddress && (
                                  <div className="flex justify-between font-body text-sm">
                                    <span className="text-muted-foreground">{t("widget.wallet")}</span>
                                    <span className="max-w-[180px] truncate font-mono text-xs text-foreground">{gPayoutAddress}</span>
                                  </div>
                                )}
                                {gTradeDirection === "sell" && gPayoutFieldDefs.length > 0 && (
                                  <div className="flex justify-between font-body text-sm">
                                    <span className="text-muted-foreground">{t("widget.payoutTo")}</span>
                                    <span className="text-xs text-foreground">{gPayoutFieldDefs[0].label}</span>
                                  </div>
                                )}
                                {gPayoutEmail && (
                                  <div className="flex justify-between font-body text-sm">
                                    <span className="text-muted-foreground">{t("widget.email")}</span>
                                    <span className="text-foreground">{gPayoutEmail}</span>
                                  </div>
                                )}
                              </div>

                              {/* Provider badge */}
                              <div className="flex items-center justify-center gap-2 py-2">
                                <ProviderMark letter="G" />
                                <div className="text-left">
                                  <p className="font-display text-sm font-bold text-foreground">Guardarian</p>
                                  <p className="font-body text-[10px] text-muted-foreground">{t("widget.regulatedPaymentGateway")}</p>
                                </div>
                              </div>

                              {/* CTA: Open payment in new tab */}
                              <Button
                                className="w-full min-h-[52px] rounded-2xl text-base font-bold tracking-wide transition-all duration-300 hover:shadow-neon shadow-card"
                                size="lg"
                                style={{
                                  background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--trust)) 100%)",
                                  color: "hsl(var(--primary-foreground))",
                                }}
                                onClick={() => {
                                  if (gCheckoutUrl) {
                                    window.open(gCheckoutUrl, "_blank", "noopener,noreferrer");
                                    setGPaymentOpened(true);
                                  }
                                }}
                              >
                                <Lock className="mr-2 h-4 w-4" />
                                {gTradeDirection === "sell" ? t("widget.proceedPayout") : t("widget.proceedPayment")}
                                <ExternalLink className="ml-2 h-4 w-4" />
                              </Button>

                              {/* Fallback link */}
                              <p className="text-center font-body text-[11px] text-muted-foreground">
                                {t("widget.windowDidntOpen")}{" "}
                                <a
                                  href={gCheckoutUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-primary hover:underline"
                                >
                                  {t("widget.clickOpenManually")}
                                </a>
                              </p>

                              {/* Trust signals */}
                              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-2">
                                <span className="flex items-center gap-1 font-body text-[10px] text-muted-foreground"><Shield className="h-3 w-3 text-primary" /> {t("widget.encryption256")}</span>
                                <span className="flex items-center gap-1 font-body text-[10px] text-muted-foreground"><Lock className="h-3 w-3 text-primary" /> {t("widget.pciCompliant")}</span>
                                <span className="flex items-center gap-1 font-body text-[10px] text-muted-foreground"><CheckCircle2 className="h-3 w-3 text-primary" /> {t("widget.kycVerified")}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* ── Waiting for Payment — Post-redirect screen ── */
                          <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-elevated">
                            <div className="p-6 text-center space-y-4">
                              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              </div>
                              <h3 className="font-display text-lg font-bold text-foreground">
                                {gTradeDirection === "sell" ? t("widget.waitingDeposit") : t("widget.waitingPayment")}
                              </h3>
                              <p className="font-body text-sm text-muted-foreground">
                                {gTradeDirection === "sell"
                                  ? `{t("widget.sendCryptoTab")}`
                                  : `{t("widget.completePayment")} `}
                                {gTradeDirection !== "sell" && <span className="font-semibold text-foreground">{gPayoutEmail || "your email"}</span>}
                                {gTradeDirection !== "sell" && "."}
                              </p>

                              {/* Live updates note */}
                              <div className="mx-auto max-w-xs rounded-xl border border-primary/30 bg-primary/10 p-3 text-left">
                                <div className="flex gap-2">
                                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                  <p className="font-body text-xs text-foreground leading-relaxed">
                                    <span className="font-bold">{t("widget.bookmarkPage")}</span> {t("widget.returnAnytime")} <span className="font-semibold text-primary">{t("widget.trackFeature")}</span> {t("widget.featureBelow")}
                                  </p>
                                </div>
                              </div>

                              {/* Order recap */}
                              <div className="mx-auto max-w-xs rounded-xl border border-border bg-accent/40 p-4 space-y-2 text-left">
                                <div className="flex justify-between font-body text-sm">
                                  <span className="text-muted-foreground">{t("widget.amount")}</span>
                                  <span className="font-semibold text-foreground">{gSendAmount} {gFromCurrency?.ticker}</span>
                                </div>
                                <div className="flex justify-between font-body text-sm">
                                  <span className="text-muted-foreground">{t("widget.youReceive")}</span>
                                  <span className="font-semibold text-primary">{gEstimatedAmount || "—"} {gToCurrency?.ticker}</span>
                                </div>
                              </div>

                              {/* Re-open payment tab */}
                              <Button
                                variant="outline"
                                className="mx-auto"
                                onClick={() => {
                                  if (gCheckoutUrl) window.open(gCheckoutUrl, "_blank", "noopener,noreferrer");
                                }}
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                {t("widget.reopenTab")}
                              </Button>

                              {/* Return to dashboard */}
                              <Button
                                className="w-full min-h-[48px] rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                                size="lg"
                                onClick={() => {
                                  setGStep("form");
                                  setGCheckoutUrl("");
                                  setGPaymentOpened(false);
                                }}
                              >
                                {t("widget.returnDashboard")}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ===== PRIVATE TRANSFER MODE ===== */}
            {widgetMode === "private" && (
              <PrivateTransferTab />
            )}

            {/* ===== PERMANENT BRIDGE MODE ===== */}
            {widgetMode === "bridge" && (
              <PermanentBridgeTab />
            )}


            {/* ===== INVOICE REQUEST MODE ===== */}
            {widgetMode === "request" && (
              <InvoiceRequestTab />
            )}

            {/* ===== INSTANT LOAN MODE ===== */}
            {widgetMode === "loan" && (
              <LoanWidgetPanel />
            )}

            {/* ===== EARN MODE ===== */}
            {widgetMode === "earn" && (
              <EarnWidgetPanel />
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
                    <Lock className="me-1 inline h-3 w-3" /> {t("widget.fixedRate")}
                    <span className="ms-1.5 inline-flex rounded bg-primary/20 px-1.5 py-0.5 font-body text-[9px] font-bold uppercase tracking-wider text-primary">
                      {t("widget.recommended")}
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
                    {t("widget.expectedRate")}
                  </button>
                </div>
                {/* MSB compliance note — applies to both rate modes */}
                <div className="mb-4 -mt-2 flex items-start gap-1.5 rounded-md border border-trust/15 bg-trust/[0.04] px-2.5 py-1.5">
                  <Shield className="mt-0.5 h-3 w-3 shrink-0 text-trust" />
                  <p className="font-body text-[10px] leading-tight text-muted-foreground sm:text-[11px]">
                    {t(
                      "widget.msbRateNote",
                      "As a Registered Canadian MSB, MRC Global Pay provides transparent, non-custodial rate locking for high-value transactions."
                    )}
                  </p>
                </div>

                {/* Popular Assets Quick Select */}
                <div className="mb-4 flex items-center gap-2">
                  <span className="font-body text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{t("widget.popular")}</span>
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

                <div className="relative" id="you-send-box">
                  <label className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("widget.youSend")}</label>
                  <div
                    className={`flex items-center gap-3 rounded-xl border p-4 sm:p-4 transition-all duration-500 ${sendBoxHighlight ? "border-primary ring-2 ring-primary/40 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.5)] bg-primary/5" : "border-[hsl(220_20%_20%/0.3)]"}`}
                    style={!sendBoxHighlight ? {
                      background: "hsl(220 25% 8% / 0.6)",
                      boxShadow: "inset 0 2px 6px rgba(0,0,0,0.35), inset 0 0 1px rgba(255,255,255,0.03)",
                    } : {}}
                  >
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
                      <span className="font-display text-sm font-semibold uppercase text-primary">{fromCurrency ? displayTicker(fromCurrency) : t("widget.select")}</span>
                      {fromCurrency && networkLabel(fromCurrency) && (
                        <span className="rounded bg-primary/20 px-1 py-0.5 font-body text-[9px] uppercase text-primary">{networkLabel(fromCurrency)}</span>
                      )}
                    </button>
                  </div>
                  {belowMin && (
                    <p className="mt-1 font-body text-xs text-destructive">
                      {t("widget.minimumAmount")} {minAmount} {fromCurrency ? displayTicker(fromCurrency) : ""}
                    </p>
                  )}
                  <ExchangeCurrencyPickerView
                    show={showFromPicker}
                    currencies={sortedCurrencies}
                    exclude={toCurrency?.ticker}
                    searchQuery={searchQuery}
                    searchPlaceholder={t("widget.searchCurrency")}
                    onSearchChange={setSearchQuery}
                    activeCategory={pickerCategory}
                    onCategoryChange={setPickerCategory}
                    onSelect={(currency) => {
                      setFromCurrency(currency);
                      setShowFromPicker(false);
                      setSearchQuery("");
                      setPickerCategory("all");
                    }}
                    onClose={() => {
                      setShowFromPicker(false);
                      setSearchQuery("");
                      setPickerCategory("all");
                    }}
                  />
                </div>

                {/* Rate info bar */}
                <div className="my-3 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                    <span className="flex items-center gap-1 rounded-md border border-trust/20 bg-trust/5 px-2 py-1 font-body text-[10px] font-medium text-trust sm:text-[11px]">
                      <CheckCircle2 className="h-3 w-3" /> {t("widget.allFeesIncluded")}
                    </span>
                    <FeeBreakdown sendTicker={fromCurrency ? displayTicker(fromCurrency) : undefined} receiveTicker={toCurrency ? displayTicker(toCurrency) : undefined} />
                    {fromCurrency && toCurrency && estimatedAmount && estimatedAmount !== "—" && estimatedAmount !== "syncing" && parseFloat(sendAmount) > 0 && (
                      <span className="font-body text-[10px] text-muted-foreground sm:text-[11px]">
                        1 {displayTicker(fromCurrency)} ≈ {(parseFloat(estimatedAmount) / parseFloat(sendAmount)).toFixed(6)} {displayTicker(toCurrency)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleSwap}
                    className="hover-lift flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-primary shadow-card hover:border-primary/40 hover:text-primary"
                    aria-label="Swap currencies"
                  >
                    <ArrowDownUp className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
                  </button>
                </div>

                <div className="relative">
                  <label className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t("widget.youGet")} {fixedRate ? <span className="text-trust font-bold">{t("widget.guaranteed")}</span> : t("widget.estimated")}
                  </label>
                  <div
                    className="flex items-center gap-3 rounded-xl border border-[hsl(220_20%_20%/0.3)] p-4 sm:p-4"
                    style={{
                      background: "hsl(220 25% 8% / 0.6)",
                      boxShadow: "inset 0 2px 6px rgba(0,0,0,0.35), inset 0 0 1px rgba(255,255,255,0.03)",
                    }}
                  >
                    <span className="flex-1 font-display text-2xl font-bold text-foreground">
                      {estimating ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : estimatedAmount === "syncing" ? <span className="text-sm font-medium text-muted-foreground animate-pulse">Syncing with Global Liquidity Rails…</span> : `≈ ${estimatedAmount || "—"}`}
                    </span>
                    <button onClick={() => setShowToPicker(true)} className="flex items-center gap-2 rounded-lg bg-trust/10 px-4 py-2.5 transition-colors hover:bg-trust/20 touch-target">
                      {toCurrency?.image && <img src={toCurrency.image} alt="" className="h-5 w-5 rounded-full" />}
                      <span className="font-display text-sm font-semibold uppercase text-trust">{toCurrency ? displayTicker(toCurrency) : t("widget.select")}</span>
                      {toCurrency && networkLabel(toCurrency) && (
                        <span className="rounded bg-trust/20 px-1 py-0.5 font-body text-[9px] uppercase text-trust">{networkLabel(toCurrency)}</span>
                      )}
                    </button>
                  </div>
                  <ExchangeCurrencyPickerView
                    show={showToPicker}
                    currencies={sortedCurrencies}
                    exclude={fromCurrency?.ticker}
                    searchQuery={searchQuery}
                    searchPlaceholder={t("widget.searchCurrency")}
                    onSearchChange={setSearchQuery}
                    activeCategory={pickerCategory}
                    onCategoryChange={setPickerCategory}
                    onSelect={(currency) => {
                      setToCurrency(currency);
                      setShowToPicker(false);
                      setSearchQuery("");
                      setPickerCategory("all");
                    }}
                    onClose={() => {
                      setShowToPicker(false);
                      setSearchQuery("");
                      setPickerCategory("all");
                    }}
                  />
                </div>

                {/* Rate-mode disclaimer / 15-min Fixed-Rate countdown */}
                {fromCurrency && toCurrency && estimatedAmount && estimatedAmount !== "—" && estimatedAmount !== "syncing" && (
                  fixedRate ? (
                    <div className="mt-2 flex items-center gap-2 rounded-md border border-trust/25 bg-trust/[0.06] px-3 py-2">
                      <Lock className="h-3.5 w-3.5 shrink-0 text-trust" />
                      <p className="font-body text-[11px] leading-tight text-trust sm:text-xs">
                        {t("widget.fixedRateLockedFor", "Rate locked for")}{" "}
                        <span style={{ fontFamily: "'Roboto Mono', monospace" }} className="font-bold">
                          {String(Math.floor(fixedLockSeconds / 60)).padStart(2, "0")}:{String(fixedLockSeconds % 60).padStart(2, "0")}
                        </span>{" "}
                        {t("widget.minutes", "minutes")} · {t("widget.guaranteedOutput", "guaranteed output amount")}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-start gap-2 rounded-md border border-border bg-accent/40 px-3 py-2">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <p className="font-body text-[11px] leading-tight text-muted-foreground sm:text-xs">
                        {t(
                          "widget.floatingRateDisclaimer",
                          "Final amount depends on market price at time of confirmation."
                        )}
                      </p>
                    </div>
                  )
                )}

                <Button
                  className="cta-glow group relative mt-5 w-full min-h-[54px] overflow-hidden rounded-xl text-base font-bold tracking-wide transition-all duration-200"
                  size="lg"
                  disabled={!canExchangeNow}
                  onClick={handleExchangeNow}
                  style={{
                    background: "linear-gradient(135deg, hsl(160 100% 45%), hsl(145 90% 50%))",
                    color: "hsl(220 25% 8%)",
                  }}
                >
                  <span className="absolute inset-0 pointer-events-none" style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 3s ease-in-out infinite",
                  }} />
                  <span className="relative z-10 inline-flex items-center gap-2">
                    {t("widget.exchangeNow")}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </Button>
                <p className="mt-1.5 flex items-center justify-center gap-1.5 font-body text-[11px] text-muted-foreground">
                  <Shield className="h-3 w-3 text-primary" />
                  {t("widget.secureSwap")}
                </p>
                <SystemPulse />
              </>
            )}

            {/* Trust signals row */}
            <div className="mt-2 grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-accent/50 p-2.5 text-center">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-body text-[10px] font-medium text-muted-foreground">{t("widget.reliableExchange")}</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-accent/50 p-2.5 text-center">
                <Lock className="h-4 w-4 text-primary" />
                <span className="font-body text-[10px] font-medium text-muted-foreground">{t("widget.highestProtection")}</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-accent/50 p-2.5 text-center">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="font-body text-[10px] font-medium text-muted-foreground">{t("widget.completeAnonymity")}</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-3">
              <p className="font-body text-xs text-muted-foreground">{t("widget.noHiddenFees")}</p>
              {(speedForecast || fromCurrency) && (
                <span className="flex items-center gap-1 font-body text-xs text-primary">
                  <Clock className="h-3 w-3" /> ~{speedForecast || (winningProvider === "le" ? "5–15 min" : "10–30 min")}
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
                {t("widget.trackTransfer")}
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
                        <p className="font-display text-sm font-semibold text-foreground">{t("widget.findTransfer")}</p>
                        <p className="font-body text-[11px] text-muted-foreground">{t("widget.findTransferDesc")}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder={t("widget.walletOrTxId")}
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
                          <span className="flex items-center gap-1.5"><Search className="h-3.5 w-3.5" /> {t("widget.find")}</span>
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
                          {walletResults.length} {walletResults.length} {t("widget.transfersFound")}
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
                          <Clock className="h-3 w-3 text-primary/70" /> {t("widget.recentTransfers")}
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
              <ArrowLeft className="h-4 w-4" /> {t("widget.back")}
            </button>

            <h2 className="mb-2 font-display text-lg font-semibold text-foreground">
              {t("widget.enterRecipientAddress", { ticker: toCurrency?.ticker?.toUpperCase() })}
            </h2>
            <p className="mb-4 font-body text-sm text-muted-foreground">
              {t("widget.sentToAddress", { ticker: toCurrency?.ticker?.toUpperCase() })}
            </p>

            {/* Wallet Connect Buttons */}
            {(() => {
              const chainType = getChainType(toCurrency);
              if (chainType === "other") return null;
              return (
                <div className="mb-4 space-y-2">
                  <label className="block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t("widget.connectWallet")}
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
                      {t("widget.disconnectWallet")}
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Divider when wallet connect is available */}
            {getChainType(toCurrency) !== "other" && (
              <div className="mb-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="font-body text-xs text-muted-foreground">{t("widget.orEnterManually")}</span>
                <div className="h-px flex-1 bg-border" />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t("widget.walletAddress", { ticker: toCurrency?.ticker?.toUpperCase() })}
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
                    {t("widget.memoExtraId")}
                  </label>
                  <Input
                    placeholder={t("widget.memoPlaceholder")}
                    value={extraId}
                    onChange={(e) => setExtraId(e.target.value)}
                    className="font-body text-sm"
                  />
                </div>
              )}

            </div>

            {/* Summary */}
            <div className="mt-6 rounded-xl border border-border bg-accent p-4">
              <h3 className="mb-3 font-display text-sm font-semibold text-foreground">{t("widget.exchangeSummary")}</h3>
              <div className="space-y-2 font-body text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("widget.youSendLabel")}</span>
                  <span className="font-semibold text-foreground">{sendAmount} {fromCurrency?.ticker?.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("widget.youGetEst")}</span>
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
                {t("widget.termsAgree")}{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                  {t("widget.termsOfUse")}
                </a>
                ,{" "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                  {t("widget.privacyPolicy")}
                </a>
                {" "}{t("widget.and")}{" "}
                <a href="/aml" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                  {t("widget.amlPolicy")}
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
                      <>{t("widget.rateExpired")}</>
                    ) : (
                      <>
                        {t("widget.rateLockedFor")}{" "}
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
              {creatingTx ? <><Loader2 className="me-2 h-4 w-4 animate-spin" /> {t("widget.creatingExchange")}</> : t("widget.confirmCreateExchange")}
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
              <h2 className="font-display text-lg font-semibold text-foreground">{t("widget.sendFunds")}</h2>
            </div>

            <div className="space-y-4">
              {/* Amount + Address + QR */}
              <div className="rounded-xl border border-border bg-accent p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <label className="mb-1 block font-body text-xs text-muted-foreground">{t("widget.amount")}</label>
                    <p className="font-display text-xl font-bold text-foreground">
                      {sendAmount} {fromCurrency?.ticker?.toUpperCase()}
                    </p>
                    <label className="mb-1 mt-3 block font-body text-xs text-muted-foreground">{t("widget.toThisAddress")}</label>
                    <div className="flex items-center gap-2">
                      <code id="deposit-address-display" className="break-all font-body text-sm font-semibold text-foreground">
                        {transaction.payinAddress}
                      </code>
                      <CopyButton text={transaction.payinAddress} label="deposit" />
                    </div>
                    {transaction.payinExtraId && (
                      <div className="mt-2">
                        <label className="mb-0.5 block font-body text-xs text-muted-foreground">{t("widget.extraIdMemo")}</label>
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

              {/* FINTRAC Verified Badge */}
              <div className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                  Verified by FINTRAC — MSB C100000015
                </span>
              </div>

              {/* Warning */}
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <p className="font-body text-xs text-amber-600 dark:text-amber-400">
                  ⚠ {t("widget.depositWarning", { ticker: fromCurrency?.ticker?.toUpperCase() })}
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
                    <label className="block font-body text-xs font-medium text-muted-foreground">{t("widget.depositWith")}</label>
                    <button
                      onClick={handleMetaMask}
                      className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-orange-400/50 hover:shadow-card active:scale-[0.99]"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
                        <Wallet className="h-5 w-5 text-orange-500" />
                      </div>
                      <span className="font-display text-sm font-semibold text-foreground">{t("widget.payWithMetaMask")}</span>
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
                      <span className="font-display text-sm font-semibold text-foreground">{t("widget.copyForWallet")}</span>
                    </button>
                  </div>
                );
              })()}

              {/* Transaction ID */}
              <div className="rounded-xl border border-border bg-accent p-4">
                <label className="mb-1 block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("widget.transactionId")}</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 break-all font-body text-sm text-foreground">{transaction.id}</code>
                  <CopyButton text={transaction.id} label="txid" />
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-xl border border-border bg-accent p-4">
                <div className="space-y-2 font-body text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("widget.sending")}</span>
                    <span className="font-semibold text-foreground">{sendAmount} {fromCurrency?.ticker?.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("widget.receivingTo")}</span>
                    <span className="max-w-[200px] truncate font-semibold text-foreground">{transaction.payoutAddress}</span>
                  </div>
                </div>
              </div>

              {/* Useful tips */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-5">
                <h3 className="font-display text-base font-semibold text-foreground">{t("widget.usefulTips")}</h3>

                <div>
                  <p className="font-display text-sm font-semibold text-foreground mb-2">{t("widget.weWillProcess")}</p>
                  <ul className="space-y-2">
                    {[
                      t("widget.tip1"),
                      t("widget.tip2"),
                      t("widget.tip3"),
                      t("widget.tip4"),
                    ].map((tip) => (
                      <li key={tip} className="flex items-start gap-2 font-body text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-trust" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="font-display text-sm font-semibold text-foreground mb-2">{t("widget.weWillNot")}</p>
                  <ul className="space-y-2">
                    {[
                      t("widget.tipBad1"),
                      t("widget.tipBad2"),
                    ].map((tip) => (
                      <li key={tip} className="flex items-start gap-2 font-body text-sm text-muted-foreground">
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 rounded-lg border border-border bg-accent p-3">
                    <p className="font-body text-xs text-muted-foreground">
                      {t("widget.contactSupport")} <a href="mailto:support@globalpayboost.com" className="font-semibold text-trust hover:underline">support team</a>. The exchange can be continued from there, or alternatively, you are free to request a refund.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="font-display text-sm font-semibold text-foreground mb-2">{t("widget.howToCancel")}</p>
                  <ul className="space-y-2">
                    {[
                      t("widget.cancel1"),
                      t("widget.cancel2"),
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
                    {t("widget.wantEmailStatus")}
                  </p>
                  {emailSubmitted ? (
                    <div className="flex items-center gap-2 rounded-lg border border-trust/20 bg-trust/5 p-3">
                      <CheckCircle2 className="h-4 w-4 text-trust" />
                      <span className="font-body text-sm text-trust">{t("widget.subscribed")}</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder={t("widget.enterEmail")}
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
                        {emailSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("widget.confirm")}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg" onClick={handleProceedToStatus}>
              {t("widget.sentDeposit")}
            </Button>
          </motion.div>
        )}

        {/* ===== STEP 4: Transaction Status ===== */}
        {step === "status" && transaction && (
          <motion.div key="status" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="mb-6 font-display text-lg font-semibold text-foreground">{t("widget.transactionStatus")}</h2>

            {/* Status indicator */}
            {txStatus && (
              <div className="mb-6">
                {(() => {
                  const s = { ...(STATUS_ICONS[txStatus.status] || { color: "text-muted-foreground", icon: <Clock className="h-5 w-5" /> }), label: t(STATUS_LABEL_KEYS[txStatus.status] || "widget.statusWaiting") };
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
                        {t(STATUS_LABEL_KEYS[statusKey] || "widget.statusWaiting")}
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
                    <span className="text-muted-foreground">{t("widget.amountSent")}</span>
                    <span className="font-semibold text-foreground">{txStatus.amountSend} {txStatus.fromCurrency.toUpperCase()}</span>
                  </div>
                )}
                {txStatus.amountReceive && (
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">{t("widget.amountReceived")}</span>
                    <span className="font-semibold text-trust">{txStatus.amountReceive} {txStatus.toCurrency.toUpperCase()}</span>
                  </div>
                )}
                {txStatus.payinHash && (
                  <div className="font-body text-sm">
                    <span className="text-muted-foreground">{t("widget.payinHash")}</span>
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
                    <span className="text-muted-foreground">{t("widget.payoutHash")}</span>
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
                <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-primary/30 bg-primary/[0.08] p-5 text-center shadow-sm">
                  <div className="flex items-center gap-1" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <svg key={i} viewBox="0 0 24 24" className="h-4 w-4 fill-[#00b67a]">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-base font-semibold text-foreground">{t("widget.howWasExperience")}</span>
                  <p className="text-xs leading-relaxed text-muted-foreground">{t("widget.feedbackHelps")}</p>
                  <a
                    href="https://www.trustpilot.com/evaluate/mrcglobalpay.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#00b67a] px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#00a36e] hover:shadow-lg active:scale-[0.98] sm:w-auto"
                  >
                    {t("widget.leaveReview")}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <p className="text-[10px] text-muted-foreground/80">{t("widget.reviewFootnote")}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-trust text-trust-foreground hover:bg-trust/90"
                    size="lg"
                    onClick={handleNewExchange}
                  >
                    {t("widget.startNewExchange")}
                  </Button>
                  {typeof navigator !== "undefined" && !!navigator.share && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="shrink-0"
                      onClick={async () => {
                        try {
                          await navigator.share({
                            title: "Crypto Swap Complete — MRC Global Pay",
                            text: `I just swapped ${txStatus.fromCurrency?.toUpperCase()} → ${txStatus.toCurrency?.toUpperCase()}${txStatus.amountReceive ? ` and received ${txStatus.amountReceive} ${txStatus.toCurrency?.toUpperCase()}` : ""} on MRC Global Pay — fast, registration-free, non-custodial!`,
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
                {t("widget.tryAgain")}
              </Button>
            )}
            {!["finished", "failed", "refunded"].includes(txStatus?.status || "") && (
              <p className="mt-4 text-center font-body text-xs text-muted-foreground">
                {t("widget.statusRefreshes")}
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
            <h3 className="font-display text-lg font-bold text-foreground">
              {gTradeDirection === "sell" ? t("widget.reviewPayout") : t("widget.reviewOrder")}
            </h3>
            <p className="mt-1 font-body text-xs text-muted-foreground">
              {gTradeDirection === "sell"
                ? "Please confirm your sell details. Your bank info has been pre-locked for a one-time entry experience."
                : "Please confirm the details before proceeding to checkout."}
            </p>

            <div className="mt-5 space-y-3 rounded-xl border border-border bg-accent/50 p-4">
              <div className="flex items-center justify-between font-body text-sm">
                <span className="text-muted-foreground">{gTradeDirection === "sell" ? t("widget.youSendLabel") : t("widget.youPay")}</span>
                <span className="font-semibold text-foreground">{gSendAmount} {gFromCurrency?.ticker}</span>
              </div>
              <div className="flex items-center justify-between font-body text-sm">
                <span className="text-muted-foreground">{gTradeDirection === "sell" ? t("widget.youGetEst") : t("widget.youGetEst")}</span>
                <span className="font-semibold text-foreground">≈ {(() => {
                  const raw = parseFloat(gEstimatedAmount || "0");
                  if (!Number.isFinite(raw) || raw <= 0) return gEstimatedAmount;
                  return (raw * 0.995).toFixed(raw >= 1 ? 6 : 8);
                })()} {gToCurrency?.ticker}</span>
              </div>
              {gFullEstimate?.estimated_exchange_rate && (
                <div className="flex items-center justify-between font-body text-xs">
                  <span className="text-muted-foreground">{t("widget.exchangeRate")}</span>
                  <span className="text-foreground">{getGuardarianRateText()}</span>
                </div>
              )}
              {gFullEstimate?.network_fee && (
                <div className="flex items-center justify-between font-body text-xs">
                  <span className="text-muted-foreground">{t("widget.networkFee")}</span>
                  <span className="text-foreground">{parseFloat(gFullEstimate.network_fee.amount).toFixed(6)} {gFullEstimate.network_fee.currency}</span>
                </div>
              )}
              {gFullEstimate?.service_fees?.map((fee, i) => (
                <div key={i} className="flex items-center justify-between font-body text-xs">
                  <span className="text-muted-foreground">{t("widget.serviceFee")} ({fee.percentage})</span>
                  <span className="text-foreground">{fee.amount} {fee.currency}</span>
                </div>
              ))}
              {/* MRC service fee in review */}
              <div className="flex items-center justify-between font-body text-xs">
                <span className="text-muted-foreground">{t("widget.mrcServiceFee")}</span>
                <span className="text-foreground">{(parseFloat(gSendAmount) * 0.005).toFixed(2)} {gFromCurrency?.ticker}</span>
              </div>
              {gTradeDirection === "buy" && gPayoutAddress && (
                <div className="border-t border-border pt-2">
                  <div className="flex items-start justify-between font-body text-xs">
                    <span className="text-muted-foreground">{t("widget.wallet")}</span>
                    <span className="max-w-[200px] break-all text-right font-mono text-foreground">{gPayoutAddress}</span>
                  </div>
                </div>
              )}
              {gTradeDirection === "sell" && gPayoutFieldDefs.length > 0 && (
                <div className="border-t border-border pt-2 space-y-1">
                  {gPayoutFieldDefs.map((field) => (
                    <div key={field.key} className="flex items-start justify-between font-body text-xs">
                      <span className="text-muted-foreground">{field.label}</span>
                      <span className="max-w-[200px] break-all text-right font-mono text-foreground">
                        {field.sanitize ? field.sanitize(gBankFields[field.key] || "") : (gBankFields[field.key] || "").trim()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {gSelectedPaymentMethod && (
                <div className="flex items-center justify-between font-body text-xs">
                  <span className="text-muted-foreground">{gTradeDirection === "sell" ? t("widget.payoutMethod") : t("widget.paymentMethod")}</span>
                  <span className="text-foreground">{resolvePaymentMethodDisplay(gSelectedPaymentMethod).label}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <Shield className="h-4 w-4 shrink-0 text-primary" />
              <p className="font-body text-[11px] text-muted-foreground">
                {gTradeDirection === "sell"
                  ? "A secure gateway will open in a new tab. Your bank details are pre-filled — just send your crypto."
                  : "A secure checkout will open in a new tab to complete your purchase."}
              </p>
            </div>

            <div className="mt-5 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setGShowReview(false)}>{t("widget.cancel")}</Button>
              <Button
                className="flex-1 min-h-[44px]"
                disabled={gCreatingTx}
                onClick={handleConfirmGuardarianCheckout}
              >
                {gCreatingTx ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : gTradeDirection === "sell" ? <Lock className="mr-2 h-4 w-4" /> : <CreditCard className="mr-2 h-4 w-4" />}
                {gTradeDirection === "sell" ? t("widget.confirmSell") : t("widget.confirmPay")}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ExchangeWidget;
