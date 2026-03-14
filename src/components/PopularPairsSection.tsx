import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const pairs = [
  { from: "HYPE", to: "USDT", fromName: "Hyperliquid", toName: "Tether", href: "/swap/hype-usdt" },
  { from: "BERA", to: "USDC", fromName: "Berachain", toName: "USD Coin", href: "/swap/bera-usdt" },
  { from: "TIA", to: "USDT", fromName: "Celestia", toName: "Tether", href: "/swap/tia-usdt" },
  { from: "MONAD", to: "ETH", fromName: "Monad", toName: "Ethereum", href: "/swap/monad-usdt" },
  { from: "PYUSD", to: "SOL", fromName: "PayPal USD", toName: "Solana", href: "/swap/pyusd-usdt" },
  { from: "SOL", to: "USDT", fromName: "Solana", toName: "Tether", href: "/swap/sol-usdt" },
  { from: "BTC", to: "USDC", fromName: "Bitcoin", toName: "USD Coin", href: "/swap/btc-usdc" },
  { from: "ETH", to: "SOL", fromName: "Ethereum", toName: "Solana", href: "/swap/eth-sol" },
];

const PopularPairsSection = () => {
  return (
    <section id="popular-pairs" className="bg-background py-14 sm:py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Popular Trading Pairs
          </h2>
          <p className="mt-3 font-body text-base text-muted-foreground sm:mt-4 sm:text-lg">
            High-performance 2026 assets — all with instant settlement and zero delays.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {pairs.map((pair) => (
            <Link
              key={`${pair.from}-${pair.to}`}
              to={pair.href}
              className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-card transition-all active:scale-[0.98] hover:shadow-elevated hover:border-primary/30 sm:p-5"
            >
              <div>
                <div className="flex items-center gap-2 font-display text-sm font-semibold text-foreground sm:text-base">
                  {pair.from}
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
                  {pair.to}
                </div>
                <p className="mt-0.5 font-body text-xs text-muted-foreground">
                  {pair.fromName} to {pair.toName}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-primary text-xs opacity-0 transition-opacity group-hover:opacity-100 sm:text-sm">
                Swap
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularPairsSection;
