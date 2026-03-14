import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const pairs = [
  { from: "BTC", to: "ETH", fromName: "Bitcoin", toName: "Ethereum" },
  { from: "BTC", to: "USDT", fromName: "Bitcoin", toName: "Tether" },
  { from: "ETH", to: "BTC", fromName: "Ethereum", toName: "Bitcoin" },
  { from: "SOL", to: "USDC", fromName: "Solana", toName: "USD Coin" },
  { from: "XRP", to: "BTC", fromName: "Ripple", toName: "Bitcoin" },
  { from: "DOGE", to: "ETH", fromName: "Dogecoin", toName: "Ethereum" },
  { from: "BNB", to: "BTC", fromName: "BNB", toName: "Bitcoin" },
  { from: "LTC", to: "USDT", fromName: "Litecoin", toName: "Tether" },
];

const PopularPairsSection = () => {
  return (
    <section id="popular-pairs" className="bg-background py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Popular Trading Pairs
          </h2>
          <p className="mt-4 font-body text-lg text-muted-foreground">
            The most traded pairs — all with instant settlement.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pairs.map((pair) => (
            <a
              key={`${pair.from}-${pair.to}`}
              href="#exchange-widget"
              className="group flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-elevated hover:border-primary/30"
            >
              <div>
                <div className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
                  {pair.from}
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  {pair.to}
                </div>
                <p className="mt-0.5 font-body text-xs text-muted-foreground">
                  {pair.fromName} to {pair.toName}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Swap
              </Button>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularPairsSection;
