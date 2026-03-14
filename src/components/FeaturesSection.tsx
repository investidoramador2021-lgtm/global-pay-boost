import { motion } from "framer-motion";
import { Shield, Zap, Lock, Globe, ArrowLeftRight, HeadphonesIcon } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning-Fast Swaps",
    description: "Most exchanges complete in under 2 minutes. Our optimized routing finds the fastest path for your transaction.",
  },
  {
    icon: Shield,
    title: "Secure & Transparent",
    description: "All transactions are fully encrypted. No hidden fees — what you see is exactly what you get.",
  },
  {
    icon: Lock,
    title: "No Registration Required",
    description: "Start exchanging immediately. No KYC, no account creation, no personal data stored.",
  },
  {
    icon: ArrowLeftRight,
    title: "500+ Cryptocurrencies",
    description: "Swap Bitcoin, Ethereum, Solana, USDT, and hundreds more coins and tokens across all major blockchains.",
  },
  {
    icon: Globe,
    title: "Available Worldwide",
    description: "Access our exchange from anywhere in the world. No geo-restrictions, no limitations on trading pairs.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "Our dedicated support team is available around the clock to help you with any exchange-related questions.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="bg-accent py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why Choose MRC GlobalPay
          </h2>
          <p className="mt-4 font-body text-lg text-muted-foreground">
            We combine speed, security, and simplicity to deliver the best crypto exchange experience.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-8 shadow-card transition-shadow hover:shadow-elevated"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
