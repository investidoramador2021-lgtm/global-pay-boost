import { useState, useEffect } from "react";
import { ArrowRight, ArrowUpRight, ArrowDownRight, Loader2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getEstimate } from "@/lib/changenow";

interface PairData {
  from: string;
  to: string;
  fromName: string;
  toName: string;
  href: string;
  rate: string | null;
  loading: boolean;
}

const PAIRS_CONFIG = [
  { from: "btc", to: "eth", fromName: "Bitcoin", toName: "Ethereum", href: "/exchange/btc-to-eth", fromTicker: "BTC", toTicker: "ETH", amount: "1" },
  { from: "eth", to: "btc", fromName: "Ethereum", toName: "Bitcoin", href: "/exchange/eth-to-btc", fromTicker: "ETH", toTicker: "BTC", amount: "1" },
  { from: "btc", to: "usdterc20", fromName: "Bitcoin", toName: "Tether", href: "/exchange/btc-to-usdt", fromTicker: "BTC", toTicker: "USDT", amount: "1" },
  { from: "eth", to: "usdterc20", fromName: "Ethereum", toName: "Tether", href: "/exchange/eth-to-usdt", fromTicker: "ETH", toTicker: "USDT", amount: "1" },
  { from: "xrp", to: "btc", fromName: "XRP", toName: "Bitcoin", href: "/exchange/xrp-to-btc", fromTicker: "XRP", toTicker: "BTC", amount: "500" },
  { from: "ltc", to: "btc", fromName: "Litecoin", toName: "Bitcoin", href: "/exchange/ltc-to-btc", fromTicker: "LTC", toTicker: "BTC", amount: "1" },
  { from: "doge", to: "btc", fromName: "Dogecoin", toName: "Bitcoin", href: "/exchange/doge-to-btc", fromTicker: "DOGE", toTicker: "BTC", amount: "100" },
  { from: "trx", to: "usdterc20", fromName: "TRON", toName: "Tether", href: "/exchange/trx-to-usdt", fromTicker: "TRX", toTicker: "USDT", amount: "500" },
  { from: "pepe", to: "usdterc20", fromName: "Pepe", toName: "Tether", href: "/exchange/pepe-to-usdt", fromTicker: "PEPE", toTicker: "USDT", amount: "1000000" },
  { from: "hype", to: "usdterc20", fromName: "Hyperliquid", toName: "Tether", href: "/exchange/hype-to-usdt", fromTicker: "HYPE", toTicker: "USDT", amount: "10" },
  { from: "tao", to: "usdterc20", fromName: "Bittensor", toName: "Tether", href: "/exchange/tao-to-usdt", fromTicker: "TAO", toTicker: "USDT", amount: "1" },
  { from: "bonk", to: "usdterc20", fromName: "Bonk", toName: "Tether", href: "/exchange/bonk-to-usdt", fromTicker: "BONK", toTicker: "USDT", amount: "1000000" },
];

const PopularPairsSection = () => {
  const [pairs, setPairs] = useState<PairData[]>(
    PAIRS_CONFIG.map((p) => ({
      from: p.fromTicker,
      to: p.toTicker,
      fromName: p.fromName,
      toName: p.toName,
      href: p.href,
      rate: null,
      loading: true,
    }))
  );

  useEffect(() => {
    PAIRS_CONFIG.forEach((config, idx) => {
      const amt = config.amount;
      getEstimate(config.from, config.to, amt)
        .then((est) => {
          // Normalize rate to "per 1 unit"
          const perUnit = est.estimatedAmount ? est.estimatedAmount / parseFloat(amt) : null;
          setPairs((prev) =>
            prev.map((p, i) =>
              i === idx
                ? { ...p, rate: perUnit?.toString() || null, loading: false }
                : p
            )
          );
        })
        .catch(() => {
          setPairs((prev) =>
            prev.map((p, i) => (i === idx ? { ...p, loading: false } : p))
          );
        });
    });
  }, []);

  return (
    <section id="popular-pairs" className="bg-background py-14 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-widest text-primary">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            Popular Swaps
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Best Rates Crypto Exchange
          </h2>
          <p className="mt-3 font-body text-base text-muted-foreground sm:mt-4 sm:text-lg">
            Live rates aggregated from 700+ liquidity sources. Tap any pair to swap instantly from <span className="font-semibold text-foreground">$0.30</span> — non-custodial, no account.
          </p>
          <p className="mt-2 font-body text-xs text-muted-foreground/80 sm:text-sm">
            Trusted by early adopters and promoters worldwide.
          </p>
        </div>

        {/* Horizontal carousel of top pairs */}
        <div className="relative mx-auto mt-8 sm:mt-12">
          <div
            className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 sm:gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="list"
            aria-label="Popular crypto swap pairs"
          >
            {pairs.map((pair) => (
              <Link
                key={`${pair.from}-${pair.to}`}
                to={pair.href}
                role="listitem"
                className="group relative flex w-[240px] shrink-0 snap-start flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevated sm:w-[260px] sm:p-5"
                aria-label={`Swap ${pair.fromName} to ${pair.toName}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5">
                    <span className="font-display text-xs font-bold text-foreground sm:text-sm">{pair.from}</span>
                    <ArrowRight className="h-3 w-3 text-primary/70 rtl-flip transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                    <span className="font-display text-xs font-bold text-foreground sm:text-sm">{pair.to}</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden="true" />
                </div>

                <div className="font-body text-xs text-muted-foreground">
                  {pair.fromName} → {pair.toName}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
                  {pair.loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
                  ) : pair.rate ? (
                    <span className="rate-tween font-display text-[11px] font-semibold text-foreground sm:text-xs">
                      1 {pair.from} ≈ {parseFloat(pair.rate).toFixed(
                        parseFloat(pair.rate) > 100 ? 2 : parseFloat(pair.rate) > 1 ? 4 : 6
                      )} {pair.to}
                    </span>
                  ) : (
                    <span className="font-body text-xs text-muted-foreground">Live rate</span>
                  )}
                  <span className="font-display text-[10px] font-bold uppercase tracking-wider text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Swap
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Edge fade hints */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" aria-hidden="true" />
        </div>

        <div className="mt-6 text-center">
          <span className="font-body text-xs text-muted-foreground">
            Swipe to explore more pairs · Updated every 30 seconds
          </span>
        </div>
      </div>
    </section>
  );
};

export default PopularPairsSection;
