import { useState, useEffect, useRef } from "react";
import { Infinity, ArrowRight, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";


const NoLimitsSection = () => {
  const { t } = useTranslation();
  const [barWidth, setBarWidth] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const [count700, setCount700] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          // Animate bar expanding
          let progress = 0;
          const barInterval = setInterval(() => {
            progress += 2;
            setBarWidth(Math.min(progress, 100));
            if (progress >= 100) clearInterval(barInterval);
          }, 20);

          // Animate stats after bar
          setTimeout(() => {
            setStatsVisible(true);
            // Count up 700
            let c = 0;
            const countInterval = setInterval(() => {
              c += 14;
              setCount700(Math.min(c, 700));
              if (c >= 700) clearInterval(countInterval);
            }, 20);
          }, 600);
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Pulsing ring animation
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => !p);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={sectionRef} className="bg-background py-14 sm:py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Visual */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <div
                className={`flex h-40 w-40 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/5 transition-all duration-1000 sm:h-56 sm:w-56 ${
                  pulse ? "shadow-[0_0_40px_rgba(var(--primary-rgb),0.15)]" : "shadow-none"
                }`}
              >
                <Infinity
                  className={`h-20 w-20 text-primary transition-transform duration-700 sm:h-28 sm:w-28 ${
                    pulse ? "scale-110 rotate-3" : "scale-100 rotate-0"
                  }`}
                  strokeWidth={1.5}
                />
              </div>
              {/* Floating badges with bounce-in */}
              <div
                className={`absolute -left-4 top-4 rounded-lg border border-border bg-card px-3 py-2 shadow-elevated transition-all duration-500 sm:-left-8 ${
                  hasAnimated.current ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                }`}
              >
                <span className="font-display text-sm font-bold text-foreground">$2</span>
                <span className="ml-1 font-body text-xs text-muted-foreground">min</span>
              </div>
              <div
                className={`absolute -right-4 bottom-4 rounded-lg border border-border bg-card px-3 py-2 shadow-elevated transition-all duration-500 delay-300 sm:-right-8 ${
                  hasAnimated.current ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                }`}
              >
                <Infinity className="inline h-4 w-4 text-primary" />
                <span className="ml-1 font-body text-xs text-muted-foreground">max</span>
              </div>
            </div>
          </div>

          {/* Copy */}
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {t("noLimits.heading")}
            </h2>
            <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("noLimits.description")}
            </p>

            {/* Animated range bar */}
            <div className="mt-6 space-y-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-accent">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-100 ease-out"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <div className="flex items-center justify-between font-body text-sm">
                <span className="flex items-center gap-1 text-foreground">
                  <DollarSign className="h-3.5 w-3.5 text-primary" /> $2
                </span>
                <span
                  className={`flex items-center gap-1 text-muted-foreground transition-opacity duration-500 ${
                    barWidth >= 100 ? "opacity-100" : "opacity-30"
                  }`}
                >
                  <Infinity className="h-3.5 w-3.5 text-primary" /> {t("noLimits.noLimit")}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8">
              <div
                className={`rounded-xl border border-border bg-card p-4 transition-all duration-500 ${
                  statsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                <p className="font-display text-2xl font-bold text-primary">{count700}+</p>
                <p className="mt-1 font-body text-xs text-muted-foreground">Liquidity Sources</p>
              </div>
              <div
                className={`rounded-xl border border-border bg-card p-4 transition-all duration-500 delay-150 ${
                  statsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                <p className="font-display text-2xl font-bold text-primary">0%</p>
                <p className="mt-1 font-body text-xs text-muted-foreground">Hidden Fees</p>
              </div>
            </div>

            <Button
              className="mt-6 shadow-neon transition-transform duration-200 hover:scale-105 active:scale-95 sm:mt-8"
              size="lg"
              asChild
            >
              <a href="#exchange-widget">
                Start Swapping <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NoLimitsSection;
