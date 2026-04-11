import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowRight, Activity, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Sticky utility bar — pops in from top when scrolled past hero.
 * "Go" button scrolls to the main widget and pre-fills the pair via URL hash.
 */
const StickyUtilityBar = () => {
  const [visible, setVisible] = useState(false);
  const [from, setFrom] = useState("BTC");
  const [to, setTo] = useState("USDT");
  const [loading, setLoading] = useState(false);
  const lastScroll = useRef(0);

  /* Throttled scroll listener (~16ms via rAF) */
  useEffect(() => {
    let raf = 0;
    const threshold = 600;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if ((y > threshold) !== (lastScroll.current > threshold)) {
          setVisible(y > threshold);
        }
        lastScroll.current = y;
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const handleGo = useCallback(() => {
    if (loading) return;
    setLoading(true);

    /* Update URL params so the main widget picks them up */
    const url = new URL(window.location.href);
    url.searchParams.set("from", from.toLowerCase());
    url.searchParams.set("to", to.toLowerCase());
    url.hash = "exchange";
    window.history.replaceState(null, "", url.toString());

    /* Scroll to the exchange widget */
    const el = document.getElementById("exchange");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }

    /* Dispatch event so the widget re-reads URL params */
    window.dispatchEvent(new CustomEvent("sticky-bar-swap", { detail: { from, to } }));

    setTimeout(() => setLoading(false), 800);
  }, [from, to, loading]);

  const pairs = ["BTC", "ETH", "SOL", "USDT", "USDC", "XRP", "BNB", "DOGE"];

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={visible ? { y: 0, opacity: 1 } : { y: -80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="pointer-events-none fixed top-14 sm:top-16 inset-x-0 z-40"
      style={{ willChange: "transform, opacity" }}
    >
      <div className="pointer-events-auto border-b border-[#D4AF37]/10 bg-background/60 backdrop-blur-xl">
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
            <button
              onClick={handleGo}
              disabled={loading}
              className="h-8 rounded-lg bg-[#D4AF37] px-3 font-mono text-[11px] font-bold uppercase tracking-wider text-background flex items-center gap-1.5 transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Go"}
            </button>
          </div>

          {/* Live Status */}
          <a
            href="/status"
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
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default StickyUtilityBar;
