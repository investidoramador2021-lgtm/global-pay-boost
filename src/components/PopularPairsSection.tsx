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
  { from: "btc", to: "eth", fromName: "Bitcoin", toName: "Ethereum", href: "/swap/btc-usdc", fromTicker: "BTC", toTicker: "ETH", amount: "1" },
  { from: "eth", to: "btc", fromName: "Ethereum", toName: "Bitcoin", href: "/swap/eth-sol", fromTicker: "ETH", toTicker: "BTC", amount: "1" },
  { from: "btc", to: "usdterc20", fromName: "Bitcoin", toName: "Tether", href: "/swap/btc-usdc", fromTicker: "BTC", toTicker: "USDT", amount: "1" },
  { from: "eth", to: "usdterc20", fromName: "Ethereum", toName: "Tether", href: "/swap/eth-sol", fromTicker: "ETH", toTicker: "USDT", amount: "1" },
  { from: "xrp", to: "btc", fromName: "XRP", toName: "Bitcoin", href: "/swap/xrp-usdt", fromTicker: "XRP", toTicker: "BTC", amount: "500" },
  { from: "ltc", to: "btc", fromName: "Litecoin", toName: "Bitcoin", href: "/swap/btc-usdc", fromTicker: "LTC", toTicker: "BTC", amount: "1" },
  { from: "doge", to: "btc", fromName: "Dogecoin", toName: "Bitcoin", href: "/swap/btc-usdc", fromTicker: "DOGE", toTicker: "BTC", amount: "100" },
  { from: "trx", to: "usdterc20", fromName: "TRON", toName: "Tether", href: "/swap/btc-usdc", fromTicker: "TRX", toTicker: "USDT", amount: "500" },
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
                className="group flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-3 transition-all hover:border-primary/30 hover:shadow-elevated active:scale-[0.99] sm:gap-3 sm:p-4"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1 rounded-lg bg-accent px-2 py-1 sm:gap-1.5 sm:px-3 sm:py-1.5">
                    <span className="font-display text-xs font-bold text-foreground sm:text-sm">{pair.from}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-display text-xs font-bold text-foreground sm:text-sm">{pair.to}</span>
                  </div>
                  <span className="hidden font-body text-xs text-muted-foreground sm:inline">
                    {pair.fromName} → {pair.toName}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {pair.loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : pair.rate ? (
                    <span className="text-right font-display text-[11px] font-semibold text-foreground sm:text-sm">
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
                    className="hidden text-primary text-xs sm:flex opacity-0 transition-opacity group-hover:opacity-100"
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
