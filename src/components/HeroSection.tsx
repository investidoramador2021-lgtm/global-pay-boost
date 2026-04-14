import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Shield, Lock, Server } from "lucide-react";
import { motion } from "framer-motion";
import ExchangeWidget from "@/components/ExchangeWidget";
import DynamicExplainer from "@/components/DynamicExplainer";

const trustIcons = [Shield, Lock, Server];
const trustKeys = ["trustNoAccount", "trustNonCustodial", "trustSettlement"] as const;

type WidgetMode = "exchange" | "buysell" | "private" | "bridge" | "request";

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const widgetEntrance = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const, delay: 0.1 } },
};

interface HeroSectionProps {
  onTabChange?: (tab: WidgetMode) => void;
}

const HeroSection = ({ onTabChange }: HeroSectionProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<WidgetMode>("exchange");

  const handleTabChange = (tab: WidgetMode) => {
    setActiveTab(tab);
    onTabChange?.(tab);
    window.dispatchEvent(new CustomEvent("mrc-widget-tab-change", { detail: tab }));
  };

  return (
    <>
      <section id="exchange" className="relative overflow-x-clip bg-background py-6 sm:py-12 lg:py-20">
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(hsl(var(--neon)) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Static gold orbs (no parallax) */}
        <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#D4AF37]/[0.04] blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 top-64 h-56 w-56 rounded-full bg-[#D4AF37]/[0.03] blur-3xl" aria-hidden="true" />

        <div className="container relative mx-auto px-4">
          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-16">
            {/* Copy — staggered reveal */}
            <motion.div
              className="order-2 lg:order-1 pt-0 sm:pt-4 lg:pt-8"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              <motion.h1
                variants={fadeUp}
                className="font-display font-extrabold leading-tight tracking-tight text-foreground"
              >
              >
                {t("hero.heading")}{" "}
                <span className="text-gradient-neon">{t("hero.headingAccent")}</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-4 max-w-lg font-body text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg"
              >
                {t("hero.subtitle")}{" "}
                <span className="font-semibold text-primary">{t("hero.subtitleMsb")}</span>{" "}
                {t("hero.subtitleEnd")}
              </motion.p>

              {/* Trust Bar */}
              <motion.div variants={fadeUp} className="mt-6 grid grid-cols-3 gap-3 sm:mt-8 sm:gap-4">
                {trustKeys.map((key, idx) => {
                  const Icon = trustIcons[idx];
                  const altTexts = ["No-account crypto swap icon", "Non-custodial security shield", "Instant settlement indicator"];
                  return (
                    <motion.div
                      key={key}
                      variants={fadeUp}
                      className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center shadow-card hover:shadow-elevated hover:-translate-y-1 transition-transform"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10" role="img" aria-label={altTexts[idx]}>
                        <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                      </div>
                      <span className="font-display text-xs font-semibold text-foreground sm:text-sm">
                        {t(`hero.${key}`)}
                      </span>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Dust Hook */}
              <motion.div variants={fadeUp} className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:mt-8 sm:p-5">
                <h2 className="font-display text-base font-bold text-foreground sm:text-lg">
                  {t("hero.dustTitle")}
                </h2>
                <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
                  {t("hero.dustDescription")}
                </p>
              </motion.div>
            </motion.div>

            {/* Widget — simple fade entrance, no 3D tilt */}
            <motion.div
              className="order-1 lg:order-2"
              variants={widgetEntrance}
              initial="hidden"
              animate="show"
            >
              <ExchangeWidget onTabChange={handleTabChange} />
            </motion.div>
          </div>
        </div>
      </section>

      <DynamicExplainer activeTab={activeTab} />
    </>
  );
};

export default HeroSection;
