import { Shield, Zap, Lock, Globe, ArrowLeftRight, HeadphonesIcon } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Sub-60s Settlement",
    description: "Automated liquidity rails execute swaps in under 60 seconds. No manual processing, no queues.",
  },
  {
    icon: Shield,
    title: "Zero Hidden Fees",
    description: "All costs are transparent in the displayed rate. What you see is what you get — guaranteed.",
  },
  {
    icon: Lock,
    title: "No Registration",
    description: "Start swapping immediately. No KYC, no account creation, no personal data stored anywhere.",
  },
  {
    icon: ArrowLeftRight,
    title: "500+ Crypto Assets",
    description: "Swap Bitcoin, Ethereum, Solana, USDT, and hundreds more across all major blockchains.",
  },
  {
    icon: Globe,
    title: "Global, Always-On",
    description: "Available worldwide 24/7/365. No geo-restrictions, no downtime, no maintenance windows.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "Dedicated support around the clock for any exchange-related questions or issues.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="bg-accent py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for Speed. Engineered for Trust.
          </h2>
          <p className="mt-4 font-body text-lg text-muted-foreground">
            Every component is optimized for instant execution and zero friction.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-card p-8 shadow-card transition-shadow hover:shadow-elevated hover:glow-neon"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
