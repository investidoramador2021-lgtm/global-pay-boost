import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { CreditCard, Repeat, EyeOff, Link2, ShieldCheck, Zap, Wallet, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisaLogo, MastercardLogo, ApplePayLogo, GooglePayLogo, PixLogo, SepaLogo } from "@/components/PaymentMethodLogos";
import explainerBuy from "@/assets/explainer-buy-hd.jpg";
import explainerBridge from "@/assets/explainer-bridge-hd.jpg";
import explainerPrivate from "@/assets/explainer-private-hd.jpg";

type WidgetMode = "exchange" | "buysell" | "private" | "bridge";

interface Props {
  activeTab: WidgetMode;
  onCtaClick?: (tab: WidgetMode) => void;
}

const stepIcons = {
  buysell: [CreditCard, Zap, Wallet],
  bridge: [Link2, Repeat, CheckCircle2],
  private: [ShieldCheck, EyeOff, Wallet],
  exchange: [CreditCard, Zap, Wallet],
};

const images: Record<string, string> = {
  buysell: explainerBuy,
  bridge: explainerBridge,
  private: explainerPrivate,
  exchange: explainerBuy,
};

const logoComponents = [VisaLogo, MastercardLogo, ApplePayLogo, GooglePayLogo, PixLogo, SepaLogo];

const transition = { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] };

const DynamicExplainer = ({ activeTab, onCtaClick }: Props) => {
  const { t } = useTranslation();
  const mode = activeTab === "exchange" ? "buysell" : activeTab;
  const prefix = `explainer.${mode}`;
  const Icons = stepIcons[mode] || stepIcons.buysell;

  return (
    <section className="bg-background py-16 sm:py-24 lg:py-32">
      <div className="container mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={transition}
          >
            {/* Hero row: copy + large visual */}
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
              {/* Copy side */}
              <div className="order-2 lg:order-1">
                <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {t(`${prefix}.heading`)}
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
                  {t(`${prefix}.subtitle`)}
                </p>

                {/* Greyscale logo cloud — Buy mode only */}
                {mode === "buysell" && (
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    {logoComponents.map((Logo, i) => (
                      <div
                        key={i}
                        className="group flex h-11 items-center rounded-lg border border-border/50 bg-card/50 px-4 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card hover:shadow-md"
                      >
                        <Logo className="h-6 w-auto grayscale opacity-60 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100" />
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <div className="mt-8">
                  <Button
                    size="lg"
                    className="gap-2 text-base font-semibold"
                    onClick={() => {
                      onCtaClick?.(activeTab);
                      document.getElementById("exchange")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {t(`${prefix}.cta`)}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Visual side — large 3D render */}
              <div className="order-1 lg:order-2 flex justify-center">
                <motion.img
                  key={`img-${mode}`}
                  src={images[mode]}
                  alt={t(`${prefix}.heading`)}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="w-full max-w-lg rounded-3xl shadow-2xl ring-1 ring-border/10 sm:max-w-xl"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...transition, delay: 0.1 }}
                />
              </div>
            </div>

            {/* 3-step professional flow */}
            <div className="mt-16 grid gap-6 sm:mt-20 sm:grid-cols-3 lg:gap-10">
              {[0, 1, 2].map((idx) => {
                const Icon = Icons[idx];
                return (
                  <motion.div
                    key={idx}
                    className="relative rounded-2xl border border-border bg-card p-8 text-center shadow-card transition-shadow duration-300 hover:shadow-elevated sm:p-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...transition, delay: 0.15 + idx * 0.1 }}
                  >
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <span className="font-display text-4xl font-black text-primary/15">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 font-display text-lg font-bold text-foreground">
                      {t(`${prefix}.step${idx + 1}.title`)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {t(`${prefix}.step${idx + 1}.description`)}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default DynamicExplainer;
