import { useEffect, useRef, useState } from "react";
import { ArrowRight, Activity, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useExchangeSync } from "@/hooks/use-exchange-sync";

const barVariants = {
  hidden: { y: -100, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: -100, opacity: 0 },
};

const StickyUtilityBar = () => {
  const {
    fromTicker,
    toTicker,
    options,
    isReady,
    canSubmit,
    isSubmitting,
    setFromTicker,
    setToTicker,
    requestSubmit,
  } = useExchangeSync();
  const [visible, setVisible] = useState(false);
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

  if (!isReady || options.length === 0) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="sticky-bar"
          variants={barVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          layout
          className="fixed top-14 sm:top-16 inset-x-0 z-[9999] pointer-events-auto transform-gpu"
          style={{ willChange: "transform, opacity" }}
        >
          <div className="border-b border-primary/10 bg-background/60 backdrop-blur-xl">
            <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="hidden font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:inline">
                  Quick Swap
                </span>
                <select
                  value={(fromTicker || "BTC").toUpperCase()}
                  onChange={(e) => setFromTicker(e.target.value)}
                  className="h-8 rounded-lg border border-border/60 bg-background/80 px-2 font-mono text-xs font-semibold text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                >
                  {options.map((option) => (
                    <option key={option.ticker} value={option.ticker.toUpperCase()}>{option.label}</option>
                  ))}
                </select>
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
                <select
                  value={(toTicker || "USDT").toUpperCase()}
                  onChange={(e) => setToTicker(e.target.value)}
                  className="h-8 rounded-lg border border-border/60 bg-background/80 px-2 font-mono text-xs font-semibold text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                >
                  {options.map((option) => (
                    <option key={option.ticker} value={option.ticker.toUpperCase()}>{option.label}</option>
                  ))}
                </select>
                <button
                  onClick={requestSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="h-8 rounded-lg bg-primary px-3 font-mono text-[11px] font-bold uppercase tracking-wider text-primary-foreground flex items-center gap-1.5 hover:brightness-110 disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Go"}
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


