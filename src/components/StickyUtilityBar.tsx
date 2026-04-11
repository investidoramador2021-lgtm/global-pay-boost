import { useState, useEffect } from "react";
import { ArrowRight, Activity } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Sticky utility bar that appears when the user scrolls past the hero section.
 * Contains a quick-swap shortcut and live network status indicator.
 */
const StickyUtilityBar = () => {
  const [visible, setVisible] = useState(false);
  const [from, setFrom] = useState("BTC");
  const [to, setTo] = useState("USDT");

  useEffect(() => {
    const threshold = 600;
    const onScroll = () => setVisible(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const swapUrl = `/?from=${from.toLowerCase()}&to=${to.toLowerCase()}#exchange-widget`;

  const pairs = ["BTC", "ETH", "SOL", "USDT", "USDC", "XRP", "BNB", "DOGE"];

  if (!visible) return null;

  return (
    <div className="fixed top-14 sm:top-16 inset-x-0 z-40 border-b border-[#D4AF37]/10 bg-background/60 backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-top-2">
      <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-2">
        {/* Quick Swap */}
        <div className="flex items-center gap-2">
          <span className="hidden font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:inline">
            Quick Swap
          </span>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-8 rounded-lg border border-border/60 bg-background/80 px-2 font-mono text-xs font-semibold text-foreground focus:border-[#D4AF37]/40 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/20"
          >
            {pairs.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <ArrowRight className="h-3.5 w-3.5 text-[#D4AF37]" />
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-8 rounded-lg border border-border/60 bg-background/80 px-2 font-mono text-xs font-semibold text-foreground focus:border-[#D4AF37]/40 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/20"
          >
            {pairs.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <Link
            to={swapUrl}
            className="h-8 rounded-lg bg-[#D4AF37] px-3 font-mono text-[11px] font-bold uppercase tracking-wider text-background flex items-center transition-transform hover:scale-[1.03] active:scale-95"
          >
            Go
          </Link>
        </div>

        {/* Live Status */}
        <Link
          to="/status"
          role="status"
          aria-live="polite"
          aria-label="Live network status: operational"
          className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 transition-colors hover:bg-emerald-500/10"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="hidden font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-400 sm:inline">
            Live
          </span>
          <Activity className="h-3 w-3 text-emerald-500/60" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
};

export default StickyUtilityBar;
