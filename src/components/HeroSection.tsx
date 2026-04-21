import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Shield, Lock, Server, ArrowRight, Landmark, BadgeCheck, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import ExchangeWidget from "@/components/ExchangeWidget";
import DynamicExplainer from "@/components/DynamicExplainer";

const trustIcons = [Shield, Lock, Server];
const trustKeys = ["trustNoAccount", "trustNonCustodial", "trustSettlement"] as const;

const FINTRAC_REGISTRY_URL =
  "https://www10.fintrac-canafe.gc.ca/msb-esm/public/msb-search/search-by-name/?searchTerm=MRC+Pay+International";
const BOC_PSP_REGISTRY_URL =
  "https://www.bankofcanada.ca/core-functions/retail-payments-supervision/psp-registry/psp-registry-details/?account_id=408b884a-1aa1-ef11-a72d-0022483bf164";

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
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-16">
            {/* Copy — staggered reveal */}
            <motion.div
              className="order-2 lg:order-1 pt-0 sm:pt-4 lg:pt-8"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              <motion.h1
                variants={fadeUp}
                className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl"
              >
                {t("hero.h1Lead")}{" "}
                <span className="text-gradient-neon">{t("hero.h1Accent")}</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-5 max-w-xl font-body text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg"
              >
                {t("hero.subheadline")}
              </motion.p>

              {/* Primary CTA — large, prominent */}
              <motion.div variants={fadeUp} className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <a
                  href="#exchange"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("exchange")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="btn-shimmer group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-primary to-[hsl(var(--neon))] px-8 py-4 font-display text-base font-extrabold uppercase tracking-wide text-primary-foreground shadow-[0_0_32px_-4px_hsl(var(--primary)/0.7)] ring-1 ring-primary/40 transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_0_44px_-2px_hsl(var(--primary)/0.9)] active:translate-y-0 sm:text-lg min-h-[56px]"
                  aria-label={t("hero.startSwapCta")}
                >
                  {t("hero.startSwapCta")}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </a>
                <span className="font-body text-xs text-muted-foreground sm:text-sm">
                  {t("hero.liveRatesLabel")}
                </span>
              </motion.div>

              {/* Regulatory trust badge row — directly under hero text */}
              <motion.div
                variants={fadeUp}
                className="mt-6 flex flex-wrap items-center gap-2 sm:gap-2.5"
                aria-label="Regulatory trust signals"
              >
                <a
                  href={FINTRAC_REGISTRY_URL}
                  target="_blank"
                  rel="noopener noreferrer external"
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 font-display text-[11px] font-semibold text-foreground transition-colors hover:bg-primary/10 sm:text-xs"
                  title="Verify on the official FINTRAC MSB Registry"
                >
                  <Shield className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  Registered Canadian MSB
                  <ExternalLink className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                </a>
                <span className="hidden text-muted-foreground sm:inline" aria-hidden="true">•</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-display text-[11px] font-semibold text-foreground sm:text-xs">
                  <BadgeCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  FINTRAC Compliant &amp; Regulated
                </span>
                <span className="hidden text-muted-foreground sm:inline" aria-hidden="true">•</span>
                <a
                  href={BOC_PSP_REGISTRY_URL}
                  target="_blank"
                  rel="noopener noreferrer external"
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 font-display text-[11px] font-semibold text-foreground transition-colors hover:bg-primary/10 sm:text-xs"
                  title="Verify on the official Bank of Canada PSP Registry"
                >
                  <Landmark className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  Bank of Canada — Authorized PSP
                  <ExternalLink className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                </a>
              </motion.div>

              {/* Trust Bar (3 steps) */}
              <motion.div variants={fadeUp} className="mt-6 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-4">
                {trustKeys.map((key, idx) => {
                  const Icon = trustIcons[idx];
                  const altTexts = ["No-account crypto swap icon", "Non-custodial security shield", "Instant settlement indicator"];
                  return (
                    <motion.div
                      key={key}
                      variants={fadeUp}
                      className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-2.5 sm:p-4 text-center shadow-card hover:shadow-elevated hover:-translate-y-1 transition-transform"
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
