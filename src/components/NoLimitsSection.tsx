import { Infinity, ArrowRight, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

const NoLimitsSection = () => {
  return (
    <section className="bg-background py-14 sm:py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Visual */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="flex h-40 w-40 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/5 sm:h-56 sm:w-56">
                <Infinity className="h-20 w-20 text-primary sm:h-28 sm:w-28" strokeWidth={1.5} />
              </div>
              {/* Floating badges */}
              <div className="absolute -left-4 top-4 rounded-lg border border-border bg-card px-3 py-2 shadow-elevated sm:-left-8">
                <span className="font-display text-sm font-bold text-foreground">$2</span>
                <span className="ml-1 font-body text-xs text-muted-foreground">min</span>
              </div>
              <div className="absolute -right-4 bottom-4 rounded-lg border border-border bg-card px-3 py-2 shadow-elevated sm:-right-8">
                <Infinity className="inline h-4 w-4 text-primary" />
                <span className="ml-1 font-body text-xs text-muted-foreground">max</span>
              </div>
            </div>
          </div>

          {/* Copy */}
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Limitless Exchange
            </h2>
            <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
              Start from less than $2 and swap as much crypto as you want — there is no upper limit. 
              Our liquidity aggregation across 700+ sources handles any volume seamlessly.
            </p>

            {/* Range visual */}
            <div className="mt-6 space-y-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-accent">
                <div className="h-full w-full rounded-full bg-gradient-to-r from-primary to-primary/30" />
              </div>
              <div className="flex items-center justify-between font-body text-sm">
                <span className="flex items-center gap-1 text-foreground">
                  <DollarSign className="h-3.5 w-3.5 text-primary" /> $2
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Infinity className="h-3.5 w-3.5 text-primary" /> No limit
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="font-display text-2xl font-bold text-primary">700+</p>
                <p className="mt-1 font-body text-xs text-muted-foreground">Liquidity Sources</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="font-display text-2xl font-bold text-primary">0%</p>
                <p className="mt-1 font-body text-xs text-muted-foreground">Hidden Fees</p>
              </div>
            </div>

            <Button className="mt-6 shadow-neon sm:mt-8" size="lg" asChild>
              <a href="#exchange-widget">
                Start Swapping <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NoLimitsSection;
