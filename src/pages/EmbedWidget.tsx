import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";

const POPULAR_TOKENS = [
  { ticker: "BTC", name: "Bitcoin", icon: "₿" },
  { ticker: "ETH", name: "Ethereum", icon: "Ξ" },
  { ticker: "SOL", name: "Solana", icon: "◎" },
  { ticker: "USDT", name: "Tether", icon: "₮" },
  { ticker: "USDC", name: "USD Coin", icon: "$" },
  { ticker: "XRP", name: "Ripple", icon: "✕" },
  { ticker: "BNB", name: "BNB", icon: "◆" },
  { ticker: "DOGE", name: "Dogecoin", icon: "Ð" },
  { ticker: "ADA", name: "Cardano", icon: "₳" },
  { ticker: "DOT", name: "Polkadot", icon: "●" },
] as const;

const TOKEN_USD_PRICES: Record<string, number> = {
  BTC: 83000,
  ETH: 3200,
  SOL: 185,
  USDT: 1,
  USDC: 1,
  XRP: 0.62,
  BNB: 610,
  DOGE: 0.18,
  ADA: 0.72,
  DOT: 8.5,
};

const sanitizeAmountInput = (value: string) => {
  const normalized = value.replace(/,/g, ".").replace(/[^\d.]/g, "");
  const [whole = "", ...rest] = normalized.split(".");

  if (rest.length === 0) {
    return whole;
  }

  return `${whole}.${rest.join("")}`;
};

const formatEnteredAmount = (value: string) => {
  if (!value) return "";

  const [whole, decimal] = value.split(".");
  const formattedWhole = whole ? new Intl.NumberFormat("en-US").format(Number(whole)) : "0";

  return decimal !== undefined ? `${formattedWhole}.${decimal}` : formattedWhole;
};

const formatQuoteAmount = (value: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: value >= 1 ? 2 : 4,
    maximumFractionDigits: value >= 1 ? 4 : 8,
  }).format(value);

const EmbedWidget = () => {
  const [searchParams] = useSearchParams();
  const refId = searchParams.get("ref") || "";
  const [fromToken, setFromToken] = useState("BTC");
  const [toToken, setToToken] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [activeSelector, setActiveSelector] = useState<"from" | "to" | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.body.style.margin = "0";
    document.body.style.background = "transparent";
  }, []);

  const parsedAmount = useMemo(() => {
    const parsed = Number.parseFloat(amount);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amount]);

  const estimatedOutput = useMemo(() => {
    const fromPrice = TOKEN_USD_PRICES[fromToken];
    const toPrice = TOKEN_USD_PRICES[toToken];

    if (!parsedAmount || !fromPrice || !toPrice) {
      return null;
    }

    return (parsedAmount * fromPrice) / toPrice;
  }, [fromToken, parsedAmount, toToken]);

  const amountDisplayValue = isAmountFocused ? amount : formatEnteredAmount(amount);

  const handleSwap = () => {
    const base = "https://mrcglobalpay.com";
    const url = `${base}/?from=${fromToken.toLowerCase()}&to=${toToken.toLowerCase()}&amount=${amount}`;
    window.open(url, "_blank", "noopener");
  };

  const handleTokenSelect = (ticker: string) => {
    if (activeSelector === "from") {
      setFromToken(ticker);
    }

    if (activeSelector === "to") {
      setToToken(ticker);
    }

    setActiveSelector(null);
  };

  const selectorTokens = POPULAR_TOKENS.filter((token) => {
    if (activeSelector === "from") {
      return token.ticker !== toToken;
    }

    if (activeSelector === "to") {
      return token.ticker !== fromToken;
    }

    return true;
  });

  const fromSelected = POPULAR_TOKENS.find((token) => token.ticker === fromToken);
  const toSelected = POPULAR_TOKENS.find((token) => token.ticker === toToken);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "transparent",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        className="relative w-full max-w-[360px] overflow-hidden rounded-2xl border border-white/[0.12] p-5"
        style={{
          background: "linear-gradient(135deg, rgba(20,22,36,0.92) 0%, rgba(14,16,28,0.96) 100%)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-wider text-white/50">Crypto Swap</span>
          </div>
          <span className="text-right text-[10px] text-white/30">Dust-friendly • From $0.30</span>
        </div>

        <div className="mb-2 rounded-xl border border-white/[0.06] bg-white/[0.04] p-3">
          <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-white/40">You Send</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveSelector("from")}
              className="flex shrink-0 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.06] px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/[0.1]"
            >
              <span className="text-base">{fromSelected?.icon}</span>
              <span>{fromToken}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
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
              setFromToken(toToken);
              setToToken(fromToken);
            }}
            className="rounded-full border border-white/[0.1] bg-white/[0.06] p-1.5 transition-colors hover:bg-white/[0.1]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M5 10l3 3 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="mt-2 mb-4 rounded-xl border border-white/[0.06] bg-white/[0.04] p-3">
          <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-white/40">You Get</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveSelector("to")}
              className="flex shrink-0 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.06] px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/[0.1]"
            >
              <span className="text-base">{toSelected?.icon}</span>
              <span>{toToken}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>

            <div className="min-w-0 flex-1 text-right">
              <div className="truncate text-xl font-semibold text-white/90">
                {estimatedOutput ? formatQuoteAmount(estimatedOutput) : "—"}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-white/35">
                {estimatedOutput ? `Estimated ${toToken}` : "Enter an amount"}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSwap}
          disabled={!parsedAmount || parsedAmount <= 0}
          className="w-full rounded-xl py-3 text-sm font-bold uppercase tracking-wider transition-all disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            background: "linear-gradient(135deg, hsl(160 100% 45%) 0%, hsl(200 100% 45%) 100%)",
            color: "#0a0c14",
            boxShadow: "0 4px 16px rgba(0,200,150,0.3)",
          }}
        >
          Swap Now →
        </button>

        <div className="mt-3 text-center">
          <a
            href={`https://mrcglobalpay.com${refId ? `?ref=${refId}` : ""}`}
            target="_blank"
            rel="noopener"
            className="text-[10px] text-white/30 transition-colors hover:text-white/50"
          >
            Powered by <span className="font-semibold">MRC GlobalPay</span>
          </a>
        </div>

        {activeSelector && (
          <div className="absolute inset-0 z-50 flex flex-col rounded-2xl bg-[#0b0e18]/95 p-3 backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-white/35">Select asset</div>
                <div className="text-sm font-semibold text-white">
                  {activeSelector === "from" ? "Choose what users send" : "Choose what users receive"}
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
              {selectorTokens.map((token) => (
                <button
                  key={token.ticker}
                  type="button"
                  onClick={() => handleTokenSelect(token.ticker)}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-3 text-left transition-colors hover:bg-white/[0.08]"
                >
                  <span className="text-lg text-white/90">{token.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-white">{token.ticker}</div>
                    <div className="truncate text-xs text-white/45">{token.name}</div>
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
