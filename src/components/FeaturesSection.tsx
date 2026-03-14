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
    <section id="features" className="bg-accent py-14 sm:py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Built for Speed. Engineered for Trust.
          </h2>
          <p className="mt-3 font-body text-base text-muted-foreground sm:mt-4 sm:text-lg">
            Every component is optimized for instant execution and zero friction.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-elevated sm:rounded-2xl sm:p-8"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 sm:h-12 sm:w-12 sm:rounded-xl">
                <feature.icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-foreground sm:mt-5 sm:text-lg">{feature.title}</h3>
              <p className="mt-1.5 font-body text-sm leading-relaxed text-muted-foreground sm:mt-2">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
