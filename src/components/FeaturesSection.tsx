import { useTranslation } from "react-i18next";
import { Shield, Zap, Lock, Globe, ArrowLeftRight, HeadphonesIcon } from "lucide-react";
import { motion } from "framer-motion";

const featureKeys = ["speed", "fees", "noAccount", "assets", "global", "support"] as const;
const featureIcons = [Zap, Shield, Lock, ArrowLeftRight, Globe, HeadphonesIcon];
const featureAlts = [
  "Sub-60-second crypto settlement icon",
  "Zero hidden fees guarantee badge",
  "No-account-required crypto swap shield",
  "6,000+ supported crypto assets icon",
  "Global always-on exchange indicator",
  "24/7 customer support headset icon",
];

const SPRING = { type: "spring" as const, stiffness: 100, damping: 20 };

const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { ...SPRING } },
};

const FeaturesSection = () => {
  const { t } = useTranslation();

  return (
    <section id="features" className="bg-accent py-14 sm:py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={SPRING}
        >
          <h2 className="font-display font-bold tracking-tight text-foreground">
            {t("features.heading")}
          </h2>
          <p className="mt-3 font-body text-base text-muted-foreground sm:mt-4 sm:text-lg">
            {t("features.subtitle")}
          </p>
        </motion.div>

        <motion.div
          className="mt-10 grid gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8"
          variants={gridContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {featureKeys.map((key, idx) => {
            const Icon = featureIcons[idx];
            return (
              <motion.div
                key={key}
                variants={cardVariant}
                className="rounded-xl border border-border bg-card p-5 shadow-card transform-gpu will-change-transform hover:shadow-elevated hover:-translate-y-1 sm:rounded-2xl sm:p-8"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 hover:scale-110 hover:bg-primary/20 sm:h-12 sm:w-12 sm:rounded-xl" role="img" aria-label={featureAlts[idx]}>
                  <Icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-foreground sm:mt-5 sm:text-lg">
                  {t(`features.${key}.title`)}
                </h3>
                <p className="mt-1.5 font-body text-sm leading-relaxed text-muted-foreground sm:mt-2">
                  {t(`features.${key}.description`)}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
