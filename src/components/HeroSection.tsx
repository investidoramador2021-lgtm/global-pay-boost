import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Shield, Lock, Server } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import ExchangeWidget from "@/components/ExchangeWidget";
import DynamicExplainer from "@/components/DynamicExplainer";
import { useIsMobile } from "@/hooks/use-mobile";

const trustIcons = [Shield, Lock, Server];
const trustKeys = ["trustNoAccount", "trustNonCustodial", "trustSettlement"] as const;

type WidgetMode = "exchange" | "buysell" | "private" | "bridge";

/* Stagger container + child variants */
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE as unknown as number[] } },
};

const widgetEntrance = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: EASE as unknown as number[] } },
};

const trustCard = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE as unknown as number[] } },
};

const HeroSection = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<WidgetMode>("exchange");
  const isMobile = useIsMobile();

  /* Scroll-driven 3D tilt for the widget (desktop only) */
  const { scrollY } = useScroll();
  const rotateX = useTransform(scrollY, [0, 600], [0, isMobile ? 0 : -4]);
  const rotateY = useTransform(scrollY, [0, 600], [0, isMobile ? 0 : 3]);

  /* Parallax for gold orbs */
  const orbY1 = useTransform(scrollY, [0, 800], [0, isMobile ? 0 : 120]);
  const orbY2 = useTransform(scrollY, [0, 800], [0, isMobile ? 0 : 80]);

  return (
    <>
      <section id="exchange" className="relative overflow-hidden bg-background py-6 sm:py-12 lg:py-20">
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(hsl(var(--neon)) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Parallax gold orbs */}
        <motion.div
          style={{ y: orbY1 }}
          className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#D4AF37]/[0.04] blur-3xl"
          aria-hidden="true"
        />
        <motion.div
          style={{ y: orbY2 }}
          className="pointer-events-none absolute -right-24 top-64 h-56 w-56 rounded-full bg-[#D4AF37]/[0.03] blur-3xl"
          aria-hidden="true"
        />

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
                className="font-display text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl"
              >
                {t("hero.heading")}{" "}
                <span className="text-gradient-neon">{t("hero.headingAccent")}</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-4 max-w-lg font-body text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg"
              >
                {t("hero.subtitle")}
              </motion.p>

              {/* Trust Bar */}
              <motion.div variants={fadeUp} className="mt-6 grid grid-cols-3 gap-3 sm:mt-8 sm:gap-4">
                {trustKeys.map((key, idx) => {
                  const Icon = trustIcons[idx];
                  return (
                    <motion.div
                      key={key}
                      variants={trustCard}
                      className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 transition-transform duration-300 hover:scale-110 hover:bg-primary/20">
                        <Icon className="h-5 w-5 text-primary" />
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

            {/* Widget with 3D tilt on scroll */}
            <motion.div
              className="order-1 lg:order-2"
              variants={widgetEntrance}
              initial="hidden"
              animate="show"
              style={{
                perspective: 1000,
                rotateX,
                rotateY,
                willChange: "transform",
              }}
            >
              <ExchangeWidget onTabChange={setActiveTab} />
            </motion.div>
          </div>
        </div>
      </section>

      <DynamicExplainer activeTab={activeTab} />
    </>
  );
};

export default HeroSection;
