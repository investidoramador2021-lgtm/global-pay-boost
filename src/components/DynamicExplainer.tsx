import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { CreditCard, Repeat, EyeOff, Link2, ShieldCheck, Zap, Wallet, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisaLogo, MastercardLogo, ApplePayLogo, GooglePayLogo, PixLogo, SepaLogo } from "@/components/PaymentMethodLogos";
import explainerBuy from "@/assets/explainer-buy-masked.png";
import explainerBridge from "@/assets/explainer-bridge-masked.png";
import explainerPrivate from "@/assets/explainer-private-masked.png";

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

/* Signature glow colors per mode */
const glowConfig = {
  buysell: {
    accent: "200 100% 55%", // sky blue
    shadow: "0 0 60px hsl(200 100% 55% / 0.25), 0 0 120px hsl(200 100% 55% / 0.08)",
    borderColor: "hsl(200 100% 55% / 0.3)",
    iconBg: "bg-sky-500/10",
    iconText: "text-sky-400",
    stepBorder: "border-sky-500/20 hover:border-sky-400/40",
    pulseClass: "",
  },
  bridge: {
    accent: "40 100% 55%", // gold
    shadow: "0 0 60px hsl(40 100% 55% / 0.25), 0 0 120px hsl(40 100% 55% / 0.08)",
    borderColor: "hsl(40 100% 55% / 0.3)",
    iconBg: "bg-amber-500/10",
    iconText: "text-amber-400",
    stepBorder: "border-amber-500/20 hover:border-amber-400/40",
    pulseClass: "animate-pulse",
  },
  private: {
    accent: "270 100% 65%", // deep purple
    shadow: "0 0 60px hsl(270 100% 65% / 0.25), 0 0 120px hsl(270 100% 65% / 0.08)",
    borderColor: "hsl(270 100% 65% / 0.3)",
    iconBg: "bg-purple-500/10",
    iconText: "text-purple-400",
    stepBorder: "border-purple-500/20 hover:border-purple-400/40",
    pulseClass: "",
  },
  exchange: {
    accent: "200 100% 55%",
    shadow: "0 0 60px hsl(200 100% 55% / 0.25), 0 0 120px hsl(200 100% 55% / 0.08)",
    borderColor: "hsl(200 100% 55% / 0.3)",
    iconBg: "bg-sky-500/10",
    iconText: "text-sky-400",
    stepBorder: "border-sky-500/20 hover:border-sky-400/40",
    pulseClass: "",
  },
};

/* Logo cloud — uniform height, white filter on dark */
const logoCloud = [
  { Logo: VisaLogo, label: "Visa" },
  { Logo: MastercardLogo, label: "Mastercard" },
  { Logo: ApplePayLogo, label: "Apple Pay" },
  { Logo: GooglePayLogo, label: "Google Pay" },
  { Logo: PixLogo, label: "PIX" },
  { Logo: SepaLogo, label: "SEPA" },
];

const DynamicExplainer = ({ activeTab, onCtaClick }: Props) => {
  const { t } = useTranslation();
  const mode = activeTab === "exchange" ? "buysell" : activeTab;
  const prefix = `explainer.${mode}`;
  const Icons = stepIcons[mode] || stepIcons.buysell;
  const glow = glowConfig[mode] || glowConfig.buysell;

  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-28 lg:py-36">
      {/* Ambient glow background */}
      <motion.div
        key={`glow-${mode}`}
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% 40%, hsl(${glow.accent} / 0.06) 0%, transparent 70%)`,
        }}
      />

      <div className="container relative z-10 mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -28 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* ─── Hero Row: Copy + Masked Visual ─── */}
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
              {/* Copy */}
              <div className="order-2 lg:order-1">
                <motion.h2
                  className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
                  style={{ fontWeight: 800 }}
                >
                  {t(`${prefix}.heading`)}
                </motion.h2>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
                  {t(`${prefix}.subtitle`)}
                </p>

                {/* Logo cloud — Buy mode only */}
                {mode === "buysell" && (
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    {logoCloud.map(({ Logo, label }) => (
                      <div
                        key={label}
                        className="flex h-8 items-center opacity-50 transition-all duration-300 hover:opacity-100 dark:brightness-0 dark:invert dark:hover:brightness-100 dark:hover:invert-0"
                        title={label}
                      >
                        <Logo className="h-6 w-auto" />
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <div className="mt-10">
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

              {/* Masked 3D Visual */}
              <div className="order-1 flex justify-center lg:order-2">
                <motion.div
                  key={`visual-${mode}`}
                  className={`relative ${glow.pulseClass}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                >
                  {/* Glow ring behind image */}
                  <div
                    className="absolute inset-0 -z-10 scale-110 rounded-full blur-3xl"
                    style={{
                      background: `radial-gradient(circle, hsl(${glow.accent} / 0.15) 0%, transparent 70%)`,
                    }}
                  />
                  <img
                    src={images[mode]}
                    alt={t(`${prefix}.heading`)}
                    loading="lazy"
                    width={1024}
                    height={1024}
                    className="w-full max-w-[260px] drop-shadow-2xl sm:max-w-[340px] md:max-w-[400px] lg:max-w-[480px]"
                  />
                </motion.div>
              </div>
            </div>

            {/* ─── 3-Step Professional Flow ─── */}
            <div className="mt-20 grid gap-6 sm:grid-cols-3 lg:gap-8">
              {[0, 1, 2].map((idx) => {
                const Icon = Icons[idx];
                return (
                  <motion.div
                    key={idx}
                    className={`group relative rounded-2xl border bg-card/50 p-8 text-center backdrop-blur-sm transition-all duration-300 sm:p-10 ${glow.stepBorder}`}
                    style={{
                      boxShadow: `0 0 0 0px transparent`,
                    }}
                    whileHover={{
                      boxShadow: glow.shadow,
                    }}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 + idx * 0.1 }}
                  >
                    <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl ${glow.iconBg}`}>
                      <Icon className={`h-6 w-6 ${glow.iconText}`} />
                    </div>
                    <span
                      className="font-mono text-5xl font-black"
                      style={{ color: `hsl(${glow.accent} / 0.12)` }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 text-lg font-bold tracking-tight text-foreground">
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
