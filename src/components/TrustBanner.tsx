import { useEffect, useRef, useState } from "react";

const stats = [
  { target: 500, suffix: "+", label: "Cryptocurrencies" },
  { target: 60, prefix: "<", suffix: "s", label: "Avg. Settlement" },
  { target: 0, label: "Hidden Fees" },
  { target: 24, suffix: "/7", label: "Uptime" },
];

function useCountUp(target: number, duration = 1600) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

const TrustBanner = () => {
  return (
    <section className="bg-hero-gradient py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-4">
          {stats.map((stat) => {
            const { value, ref } = useCountUp(stat.target);
            return (
              <div key={stat.label} className="text-center" ref={ref}>
                <div className="font-display text-2xl font-extrabold text-primary-foreground sm:text-3xl lg:text-4xl">
                  {stat.prefix || ""}{value}{stat.suffix || ""}
                </div>
                <div className="mt-0.5 font-body text-xs text-primary-foreground/70 sm:mt-1 sm:text-sm">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBanner;
