import { Zap, Timer, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExchangeWidget from "@/components/ExchangeWidget";

const HeroSection = () => {
  return (
    <section id="exchange" className="relative overflow-hidden bg-background py-16 lg:py-24">
      {/* Subtle grid bg */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(hsl(var(--neon)) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="container relative mx-auto px-4">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="pt-8">
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Instant Crypto Swaps.{" "}
              <span className="text-gradient-neon">Zero Delays.</span>{" "}
              Best Market Rates.
            </h1>
            <p className="mt-6 max-w-lg font-body text-lg leading-relaxed text-muted-foreground">
              Swap BTC, ETH, SOL, and Stablecoins in under 60 seconds with 100% automated settlement. No registration. No KYC. Just speed.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Button size="lg" className="shadow-neon" asChild>
                <a href="#exchange-widget">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Swap
                </a>
              </Button>

              <div className="flex items-center gap-2 rounded-lg border border-neon bg-muted/50 px-4 py-2">
                <Timer className="h-4 w-4 text-primary" />
                <span className="font-display text-sm font-bold text-primary">Avg. Swap: 45s</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-body text-sm font-medium text-foreground">No registration required</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span className="font-body text-sm font-medium text-foreground">500+ cryptocurrencies</span>
              </div>
            </div>
          </div>

          <ExchangeWidget />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
