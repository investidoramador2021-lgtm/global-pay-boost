import { Zap, Timer, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExchangeWidget from "@/components/ExchangeWidget";

const HeroSection = () => {
  return (
    <section id="exchange" className="relative overflow-hidden bg-background py-10 sm:py-16 lg:py-24">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(hsl(var(--neon)) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="container relative mx-auto px-4">
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Copy — on mobile, show below widget via order */}
          <div className="order-2 lg:order-1 pt-0 sm:pt-4 lg:pt-8">
            <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl">
              Instant Crypto Swaps.{" "}
              <span className="text-gradient-neon">Zero Delays.</span>{" "}
              Best Market Rates.
            </h1>
            <p className="mt-4 max-w-lg font-body text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
              Swap BTC, ETH, SOL, and Stablecoins in under 60 seconds with 100% automated settlement. No registration. No KYC. Just speed.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-6">
              <Button size="lg" className="shadow-neon w-full sm:w-auto" asChild>
                <a href="#exchange-widget">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Swap
                </a>
              </Button>

              <div className="flex items-center gap-2 rounded-lg border border-neon bg-muted/50 px-3 py-2 sm:px-4">
                <Timer className="h-4 w-4 text-primary" />
                <span className="font-display text-sm font-bold text-primary">Avg. Swap: 45s</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 sm:mt-8 sm:gap-6">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                <span className="font-body text-xs font-medium text-foreground sm:text-sm">No registration required</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                <span className="font-body text-xs font-medium text-foreground sm:text-sm">500+ cryptocurrencies</span>
              </div>
            </div>
          </div>

          {/* Widget — on mobile, show first */}
          <div className="order-1 lg:order-2">
            <ExchangeWidget />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
