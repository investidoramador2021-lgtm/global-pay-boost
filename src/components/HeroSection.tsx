import { useState, useEffect, useRef } from "react";
import { Shield, Lock, Server } from "lucide-react";
import ExchangeWidget from "@/components/ExchangeWidget";

const trustCards = [
  { icon: Shield, label: "No Account Required" },
  { icon: Lock, label: "Non-Custodial" },
  { icon: Server, label: "Direct Settlement" },
];

const HeroSection = () => {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = cardRefs.current.indexOf(entry.target as HTMLDivElement);
          if (entry.isIntersecting && idx !== -1) {
            setTimeout(() => {
              setVisibleCards((prev) => new Set(prev).add(idx));
            }, idx * 150);
          }
        });
      },
      { threshold: 0.15 }
    );
    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="exchange" className="relative overflow-hidden bg-background py-6 sm:py-12 lg:py-20">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(hsl(var(--neon)) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="container relative mx-auto px-4">
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Copy */}
          <div className="order-2 lg:order-1 pt-0 sm:pt-4 lg:pt-8">
            <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl">
              Secure Digital Asset Swaps.{" "}
              <span className="text-gradient-neon">The Professional Way.</span>
            </h1>
            <p className="mt-4 max-w-lg font-body text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
              Fast, secure, and private. Direct wallet-to-wallet swaps from $0.30.
            </p>

            {/* Trust Bar — 3 icons with staggered animation */}
            <div className="mt-6 grid grid-cols-3 gap-3 sm:mt-8 sm:gap-4">
              {trustCards.map((card, idx) => (
                <div
                  key={card.label}
                  ref={(el) => { cardRefs.current[idx] = el; }}
                  className={`flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center shadow-card transition-all duration-500 hover:shadow-elevated hover:-translate-y-1 ${
                    visibleCards.has(idx)
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-6"
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 transition-transform duration-300 hover:scale-110 hover:bg-primary/20">
                    <card.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-display text-xs font-semibold text-foreground sm:text-sm">{card.label}</span>
                </div>
              ))}
            </div>

            {/* Dust Hook */}
            <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:mt-8 sm:p-5">
              <h2 className="font-display text-base font-bold text-foreground sm:text-lg">
                🧹 Clean Your Wallet
              </h2>
              <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
                Tired of "unspendable" dust? Most platforms have high minimums. We support micro-swaps starting at $0.30. Convert leftover balances from 500+ tokens instantly with zero onboarding.
              </p>
            </div>
          </div>

          {/* Widget */}
          <div className="order-1 lg:order-2">
            <ExchangeWidget />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
