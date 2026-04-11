import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowRight, Activity, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const barVariants = {
  hidden: { y: -100, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: -100, opacity: 0 },
};

const StickyUtilityBar = () => {
  const [visible, setVisible] = useState(false);
  const [from, setFrom] = useState("BTC");
  const [to, setTo] = useState("USDT");
  const [loading, setLoading] = useState(false);
  const raf = useRef(0);

  useEffect(() => {
    const threshold = 600;
    const onScroll = () => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        setVisible(window.scrollY > threshold);
        raf.current = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const handleGo = useCallback(() => {
    if (loading) return;
    setLoading(true);

    const url = new URL(window.location.href);
    url.searchParams.set("from", from.toLowerCase());
    url.searchParams.set("to", to.toLowerCase());
    url.hash = "exchange";
    window.history.replaceState(null, "", url.toString());

    const el = document.getElementById("exchange");
    if (el) el.scrollIntoView({ behavior: "smooth" });

    window.dispatchEvent(new CustomEvent("sticky-bar-swap", { detail: { from, to } }));
    setTimeout(() => setLoading(false), 800);
  }, [from, to, loading]);

  const pairs = ["BTC", "ETH", "SOL", "USDT", "USDC", "XRP", "BNB", "DOGE"];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="sticky-bar"
          variants={barVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: "spring", damping: 25, stiffness: 120 }}
          className="fixed top-14 sm:top-16 inset-x-0 z-50 pointer-events-auto"
          style={{ willChange: "transform, opacity" }}
        >
          <div className="border-b border-[#D4AF37]/10 bg-background/60 backdrop-blur-xl">
            <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="hidden font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:inline">
                  Quick Swap
                </span>
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="h-8 rounded-lg border border-border/60 bg-background/80 px-2 font-mono text-xs font-semibold text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                >
                  {pairs.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="h-8 rounded-lg border border-border/60 bg-background/80 px-2 font-mono text-xs font-semibold text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                >
                  {pairs.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <button
                  onClick={handleGo}
                  disabled={loading}
                  className="h-8 rounded-lg bg-primary px-3 font-mono text-[11px] font-bold uppercase tracking-wider text-primary-foreground flex items-center gap-1.5 hover:brightness-110 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Go"}
                </button>
              </div>

              <a
                href="/status"
                aria-label="Live network status: operational"
                className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 hover:bg-emerald-500/10"
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
      )}
    </AnimatePresence>
  );
};

export default StickyUtilityBar;
