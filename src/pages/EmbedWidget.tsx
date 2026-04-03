import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

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
];

const EmbedWidget = () => {
  const [searchParams] = useSearchParams();
  const refId = searchParams.get("ref") || "";
  const [fromToken, setFromToken] = useState("BTC");
  const [toToken, setToToken] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.body.style.margin = "0";
    document.body.style.background = "transparent";
  }, []);

  const handleSwap = () => {
    const base = "https://mrcglobalpay.com";
    const url = `${base}/?from=${fromToken.toLowerCase()}&to=${toToken.toLowerCase()}&amount=${amount}`;
    window.open(url, "_blank", "noopener");
  };

  const TokenSelector = ({
    value,
    onChange,
    open,
    setOpen,
    exclude,
  }: {
    value: string;
    onChange: (t: string) => void;
    open: boolean;
    setOpen: (v: boolean) => void;
    exclude: string;
  }) => {
    const selected = POPULAR_TOKENS.find((t) => t.ticker === value);
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-lg bg-white/[0.06] px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/[0.1] transition-colors border border-white/[0.08]"
        >
          <span className="text-base">{selected?.icon}</span>
          <span>{value}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-50">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        {open && (
          <div className="absolute top-full mt-1 left-0 z-50 w-44 rounded-lg border border-white/[0.1] bg-[#1a1d2e]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
            {POPULAR_TOKENS.filter((t) => t.ticker !== exclude).map((token) => (
              <button
                key={token.ticker}
                onClick={() => { onChange(token.ticker); setOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/[0.08] transition-colors"
              >
                <span>{token.icon}</span>
                <span className="font-medium">{token.ticker}</span>
                <span className="text-white/40 text-xs ml-auto">{token.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

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
        className="w-full max-w-[360px] rounded-2xl border border-white/[0.12] p-5"
        style={{
          background: "linear-gradient(135deg, rgba(20,22,36,0.92) 0%, rgba(14,16,28,0.96) 100%)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Crypto Swap</span>
          </div>
          <span className="text-[10px] text-white/30">Dust-friendly • From $0.30</span>
        </div>

        {/* From */}
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 mb-2">
          <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5 block">You Send</label>
          <div className="flex items-center gap-2">
            <TokenSelector value={fromToken} onChange={setFromToken} open={fromOpen} setOpen={(v) => { setFromOpen(v); setToOpen(false); }} exclude={toToken} />
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent text-right text-lg font-semibold text-white outline-none placeholder:text-white/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Swap arrow */}
        <div className="flex justify-center -my-1 relative z-10">
          <button
            onClick={() => { setFromToken(toToken); setToToken(fromToken); }}
            className="rounded-full bg-white/[0.06] border border-white/[0.1] p-1.5 hover:bg-white/[0.1] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M5 10l3 3 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* To */}
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 mt-2 mb-4">
          <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5 block">You Get</label>
          <div className="flex items-center gap-2">
            <TokenSelector value={toToken} onChange={setToToken} open={toOpen} setOpen={(v) => { setToOpen(v); setFromOpen(false); }} exclude={fromToken} />
            <span className="flex-1 text-right text-lg font-semibold text-white/30">—</span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleSwap}
          disabled={!amount || parseFloat(amount) <= 0}
          className="w-full rounded-xl py-3 text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, hsl(160 100% 45%) 0%, hsl(200 100% 45%) 100%)",
            color: "#0a0c14",
            boxShadow: "0 4px 16px rgba(0,200,150,0.3)",
          }}
        >
          Swap Now →
        </button>

        {/* Powered by */}
        <div className="mt-3 text-center">
          <a
            href={`https://mrcglobalpay.com${refId ? `?ref=${refId}` : ""}`}
            target="_blank"
            rel="noopener"
            className="text-[10px] text-white/30 hover:text-white/50 transition-colors"
          >
            Powered by <span className="font-semibold">MRC GlobalPay</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default EmbedWidget;
