import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Shield, Zap, Lock, Globe, ArrowLeftRight, HeadphonesIcon } from "lucide-react";

const featureKeys = ["speed", "fees", "noAccount", "assets", "global", "support"] as const;
const featureIcons = [Zap, Shield, Lock, ArrowLeftRight, Globe, HeadphonesIcon];

const FeaturesSection = () => {
  const { t } = useTranslation();
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
            }, idx * 120);
          }
        });
      },
      { threshold: 0.15 }
    );
    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="bg-accent py-14 sm:py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {t("features.heading")}
          </h2>
          <p className="mt-3 font-body text-base text-muted-foreground sm:mt-4 sm:text-lg">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {featureKeys.map((key, idx) => {
            const Icon = featureIcons[idx];
            return (
              <div
                key={key}
                ref={(el) => { cardRefs.current[idx] = el; }}
                className={`rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-500 hover:shadow-elevated hover:-translate-y-1 sm:rounded-2xl sm:p-8 ${
                  visibleCards.has(idx)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-transform duration-300 hover:scale-110 hover:bg-primary/20 sm:h-12 sm:w-12 sm:rounded-xl">
                  <Icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-foreground sm:mt-5 sm:text-lg">
                  {t(`features.${key}.title`)}
                </h3>
                <p className="mt-1.5 font-body text-sm leading-relaxed text-muted-foreground sm:mt-2">
                  {t(`features.${key}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
