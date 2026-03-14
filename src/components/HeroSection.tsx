import { motion } from "framer-motion";
import { Shield, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const trustSignals = [
  { icon: Shield, text: "No registration required" },
  { icon: Zap, text: "500+ cryptocurrencies" },
  { icon: Clock, text: "2-minute average processing" },
];

const HeroSection = () => {
  return (
    <section id="exchange" className="relative overflow-hidden bg-background py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
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

            <div className="mt-10 flex gap-4">
              <Button size="lg" asChild>
                <a href="#exchange-widget">Exchange Now</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#how-it-works">How It Works</a>
              </Button>
            </div>
          </motion.div>

          {/* Right: Exchange Widget Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            id="exchange-widget"
          >
            <div className="rounded-2xl border border-border bg-card p-8 shadow-elevated">
              <h2 className="mb-6 font-display text-lg font-semibold text-foreground">Quick Exchange</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    You Send
                  </label>
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-accent p-4">
                    <span className="font-display text-2xl font-bold text-foreground">1</span>
                    <span className="ml-auto rounded-lg bg-primary/10 px-3 py-1.5 font-display text-sm font-semibold text-primary">BTC</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-primary">
                    ⇅
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    You Get (estimated)
                  </label>
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-accent p-4">
                    <span className="font-display text-2xl font-bold text-foreground">~36.52</span>
                    <span className="ml-auto rounded-lg bg-trust/10 px-3 py-1.5 font-display text-sm font-semibold text-trust">ETH</span>
                  </div>
                </div>

                <Button className="mt-4 w-full bg-trust text-trust-foreground hover:bg-trust/90" size="lg">
                  Exchange Now
                </Button>

                <p className="text-center font-body text-xs text-muted-foreground">
                  No hidden fees · Fixed & floating rates available
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
