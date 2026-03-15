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
  { from: "btc", to: "usdc", fromName: "Bitcoin", toName: "USD Coin", href: "/swap/btc-usdc", fromTicker: "BTC", toTicker: "USDC" },
  { from: "eth", to: "sol", fromName: "Ethereum", toName: "Solana", href: "/swap/eth-sol", fromTicker: "ETH", toTicker: "SOL" },
  { from: "sol", to: "usdt", fromName: "Solana", toName: "Tether", href: "/swap/sol-usdt", fromTicker: "SOL", toTicker: "USDT" },
  { from: "xrp", to: "usdt", fromName: "XRP", toName: "Tether", href: "/swap/xrp-usdt", fromTicker: "XRP", toTicker: "USDT" },
  { from: "hype", to: "usdt", fromName: "Hyperliquid", toName: "Tether", href: "/swap/hype-usdt", fromTicker: "HYPE", toTicker: "USDT" },
  { from: "bera", to: "usdt", fromName: "Berachain", toName: "Tether", href: "/swap/bera-usdt", fromTicker: "BERA", toTicker: "USDT" },
  { from: "tia", to: "usdt", fromName: "Celestia", toName: "Tether", href: "/swap/tia-usdt", fromTicker: "TIA", toTicker: "USDT" },
  { from: "pyusd", to: "usdt", fromName: "PayPal USD", toName: "Tether", href: "/swap/pyusd-usdt", fromTicker: "PYUSD", toTicker: "USDT" },
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
      getEstimate(config.from, config.to, "1")
        .then((est) => {
          setPairs((prev) =>
            prev.map((p, i) =>
              i === idx
                ? { ...p, rate: est.estimatedAmount?.toString() || null, loading: false }
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
    <section id="popular-pairs" className="bg-background py-14 sm:py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Best Rates Crypto Exchange
          </h2>
          <p className="mt-3 font-body text-base text-muted-foreground sm:mt-4 sm:text-lg">
            Live rates aggregated from 700+ liquidity sources. Updated in real time.
          </p>
        </div>

        {/* Table-style layout inspired by ChangeNow */}
        <div className="mx-auto mt-8 max-w-3xl sm:mt-12">
          <div className="mb-3 flex items-center justify-between px-4 font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>Popular Pair</span>
            <span>Rate</span>
          </div>
          <div className="space-y-2">
            {pairs.map((pair) => (
              <Link
                key={`${pair.from}-${pair.to}`}
                to={pair.href}
                className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-elevated active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5">
                    <span className="font-display text-sm font-bold text-foreground">{pair.from}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-display text-sm font-bold text-foreground">{pair.to}</span>
                  </div>
                  <span className="hidden font-body text-xs text-muted-foreground sm:inline">
                    {pair.fromName} → {pair.toName}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {pair.loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : pair.rate ? (
                    <span className="font-display text-sm font-semibold text-foreground">
                      1 {pair.from} ≈ {parseFloat(pair.rate).toFixed(
                        parseFloat(pair.rate) > 100 ? 2 : parseFloat(pair.rate) > 1 ? 4 : 6
                      )}{" "}
                      {pair.to}
                    </span>
                  ) : (
                    <span className="font-body text-sm text-muted-foreground">—</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary text-xs opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    Swap <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularPairsSection;
