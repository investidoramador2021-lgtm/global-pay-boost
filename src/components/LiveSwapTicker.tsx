import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ArrowRight } from "lucide-react";

interface SwapEvent {
  id: number;
  from: string;
  to: string;
  fromAmount: string;
  toAmount: string;
  time: string;
}

const SWAP_TEMPLATES = [
  { from: "BTC", to: "ETH", fromRange: [0.01, 2], toMultiplier: 33.5 },
  { from: "ETH", to: "USDT", fromRange: [0.1, 10], toMultiplier: 3480 },
  { from: "SOL", to: "USDT", fromRange: [1, 200], toMultiplier: 187 },
  { from: "BTC", to: "USDC", fromRange: [0.005, 1], toMultiplier: 97200 },
  { from: "XRP", to: "USDT", fromRange: [50, 5000], toMultiplier: 2.45 },
  { from: "HYPE", to: "USDT", fromRange: [10, 500], toMultiplier: 28.5 },
  { from: "ETH", to: "SOL", fromRange: [0.5, 15], toMultiplier: 18.6 },
  { from: "DOGE", to: "BTC", fromRange: [100, 10000], toMultiplier: 0.0000025 },
  { from: "BERA", to: "USDT", fromRange: [5, 300], toMultiplier: 7.8 },
  { from: "TIA", to: "USDT", fromRange: [10, 1000], toMultiplier: 4.2 },
  { from: "BNB", to: "ETH", fromRange: [0.5, 20], toMultiplier: 0.19 },
  { from: "LTC", to: "BTC", fromRange: [1, 50], toMultiplier: 0.0011 },
];

function generateSwap(id: number): SwapEvent {
  const template = SWAP_TEMPLATES[Math.floor(Math.random() * SWAP_TEMPLATES.length)];
  const fromAmount = (
    template.fromRange[0] +
    Math.random() * (template.fromRange[1] - template.fromRange[0])
  ).toFixed(template.fromRange[1] > 100 ? 1 : template.fromRange[1] > 10 ? 2 : 4);
  const toAmount = (parseFloat(fromAmount) * template.toMultiplier).toFixed(
    template.toMultiplier > 100 ? 2 : template.toMultiplier > 1 ? 4 : 6
  );
  const secsAgo = Math.floor(Math.random() * 45) + 5;
  return {
    id,
    from: template.from,
    to: template.to,
    fromAmount,
    toAmount,
    time: `${secsAgo}s ago`,
  };
}

const LiveSwapTicker = () => {
  const [swaps, setSwaps] = useState<SwapEvent[]>(() =>
    Array.from({ length: 5 }, (_, i) => generateSwap(i))
  );
  const idRef = useRef(5);

  useEffect(() => {
    const interval = setInterval(() => {
      idRef.current += 1;
      const newSwap = generateSwap(idRef.current);
      newSwap.time = "just now";
      setSwaps((prev) => [newSwap, ...prev.slice(0, 4)]);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="border-y border-border bg-accent/50 py-10 sm:py-14">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-center gap-2 sm:mb-8">
          <Globe className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Live Swaps Happening Now
          </h3>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-trust opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-trust" />
          </span>
        </div>

        <div className="mx-auto max-w-2xl space-y-2">
          <AnimatePresence initial={false}>
            {swaps.map((swap) => (
                <motion.div
                  key={swap.id}
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2.5 sm:px-4 sm:py-3"
                >
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-trust/10 px-1.5 py-0.5 font-display text-[10px] font-bold text-trust sm:px-2 sm:text-xs">
                    Sent {swap.fromAmount} {swap.from}
                  </span>
                  <ArrowRight className="hidden h-3 w-3 text-muted-foreground sm:block" />
                  <span className="font-body text-[10px] text-foreground sm:text-xs">
                    → <span className="font-semibold">{swap.toAmount} {swap.to}</span>
                  </span>
                </div>
                <span className="shrink-0 font-body text-[10px] text-muted-foreground sm:text-[11px]">{swap.time}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default LiveSwapTicker;
