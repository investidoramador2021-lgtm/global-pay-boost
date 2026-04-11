import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { CreditCard, Repeat, EyeOff, Link2, ShieldCheck, Zap, Wallet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisaLogo, MastercardLogo, ApplePayLogo, GooglePayLogo, PixLogo, SepaLogo } from "@/components/PaymentMethodLogos";
import explainerBuy from "@/assets/explainer-buy.jpg";
import explainerBridge from "@/assets/explainer-bridge.jpg";
import explainerPrivate from "@/assets/explainer-private.jpg";

type WidgetMode = "exchange" | "buysell" | "private" | "bridge";

interface Props {
  activeTab: WidgetMode;
  onCtaClick?: (tab: WidgetMode) => void;
}

const stepIcons = {
  buysell: [CreditCard, Zap, Wallet],
  bridge: [Link2, Repeat, Zap],
  private: [ShieldCheck, EyeOff, Wallet],
  exchange: [CreditCard, Zap, Wallet],
};

const images: Record<string, string> = {
  buysell: explainerBuy,
  bridge: explainerBridge,
  private: explainerPrivate,
  exchange: explainerBuy,
};

const DynamicExplainer = ({ activeTab, onCtaClick }: Props) => {
  const { t } = useTranslation();
  const mode = activeTab === "exchange" ? "buysell" : activeTab;
  const prefix = `explainer.${mode}`;

  const steps = [0, 1, 2];
  const Icons = stepIcons[mode] || stepIcons.buysell;

  return (
    <section className="bg-background py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
          >
            {/* Header + image */}
            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                  {t(`${prefix}.heading`)}
                </h2>
                <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {t(`${prefix}.subtitle`)}
                </p>

                {/* Payment logos row for Buy mode */}
                {mode === "buysell" && (
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {[VisaLogo, MastercardLogo, ApplePayLogo, GooglePayLogo, PixLogo, SepaLogo].map((Logo, i) => (
                      <div key={i} className="flex h-9 items-center rounded-md bg-card px-3 shadow-sm border border-border">
                        <Logo className="h-5 w-auto" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <img
                  src={images[mode]}
                  alt={t(`${prefix}.heading`)}
                  loading="lazy"
                  width={800}
                  height={600}
                  className="w-full max-w-md rounded-2xl shadow-elevated"
                />
              </div>
            </div>

            {/* 3-step grid */}
            <div className="mt-10 grid gap-6 sm:grid-cols-3 lg:gap-8">
              {steps.map((idx) => {
                const Icon = Icons[idx];
                return (
                  <div
                    key={idx}
                    className="relative rounded-xl border border-border bg-card p-6 text-center shadow-card sm:p-8"
                  >
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-display text-3xl font-extrabold text-primary/20">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-1 font-display text-base font-semibold text-foreground sm:text-lg">
                      {t(`${prefix}.step${idx + 1}.title`)}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:mt-2">
                      {t(`${prefix}.step${idx + 1}.description`)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="mt-8 flex justify-center">
              <Button
                size="lg"
                className="gap-2"
                onClick={() => {
                  onCtaClick?.(activeTab);
                  document.getElementById("exchange")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {t(`${prefix}.cta`)}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default DynamicExplainer;
