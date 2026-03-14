import { motion } from "framer-motion";
import { Shield, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExchangeWidget from "@/components/ExchangeWidget";

const trustSignals = [
  { icon: Shield, text: "No registration required" },
  { icon: Zap, text: "500+ cryptocurrencies" },
  { icon: Clock, text: "2-minute average processing" },
];

const HeroSection = () => {
  return (
    <section id="exchange" className="relative overflow-hidden bg-background py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="pt-8"
          >
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              The Fastest Way to{" "}
              <span className="text-gradient-primary">Exchange Crypto</span>
            </h1>
            <p className="mt-6 max-w-lg font-body text-lg leading-relaxed text-muted-foreground">
              Swap 500+ cryptocurrencies instantly with the best rates. No account needed — just pick your pair, send your funds, and receive your crypto in minutes.
            </p>

            <div className="mt-8 flex flex-wrap gap-6">
              {trustSignals.map((signal) => (
                <div key={signal.text} className="flex items-center gap-2">
                  <signal.icon className="h-5 w-5 text-trust" />
                  <span className="font-body text-sm font-medium text-foreground">{signal.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Button size="lg" variant="outline" asChild>
                <a href="#how-it-works">Learn How It Works</a>
              </Button>
            </div>
          </motion.div>

          <ExchangeWidget />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
