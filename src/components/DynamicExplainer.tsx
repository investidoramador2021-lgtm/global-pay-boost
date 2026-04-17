import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import explainerExchange from "@/assets/explainer-exchange-masked.png";
import explainerBuy from "@/assets/explainer-buy-masked-v2.png";
import explainerBridge from "@/assets/explainer-bridge-masked.png";
import explainerPrivate from "@/assets/explainer-private-masked.png";
import explainerInvoice from "@/assets/invoice-3d-hero.png";
import explainerLoan from "@/assets/explainer-loan-masked.png";
import explainerEarn from "@/assets/explainer-earn-masked.png";
import visaLogo from "@/assets/logo-visa.png";
import mastercardLogo from "@/assets/logo-mastercard.png";
import applePayLogo from "@/assets/logo-applepay.png";
import googlePayLogo from "@/assets/logo-googlepay.png";
import pixLogo from "@/assets/logo-pix.png";
import sepaLogo from "@/assets/logo-sepa.png";

type WidgetMode = "exchange" | "buysell" | "private" | "bridge" | "request" | "loan" | "earn";

interface Props {
  activeTab: WidgetMode;
  onCtaClick?: (tab: WidgetMode) => void;
}

type DisplayMode = "exchange" | "buysell" | "private" | "bridge" | "invoice" | "loan" | "earn";

const logos = [
  { src: visaLogo, alt: "Visa" },
  { src: mastercardLogo, alt: "Mastercard" },
  { src: applePayLogo, alt: "Apple Pay" },
  { src: googlePayLogo, alt: "Google Pay" },
  { src: pixLogo, alt: "PIX" },
  { src: sepaLogo, alt: "SEPA" },
];

const modeConfig: Record<DisplayMode, { accent: string; label: string; image: string; glow: string }> = {
  exchange: {
    accent: "142 76% 46%",
    label: "EXCHANGE",
    image: explainerExchange,
    glow: "0 0 70px hsl(142 76% 46% / 0.28), 0 0 140px hsl(142 76% 46% / 0.12)",
  },
  buysell: {
    accent: "200 100% 62%",
    label: "BUY FLOW",
    image: explainerBuy,
    glow: "0 0 70px hsl(200 100% 62% / 0.28), 0 0 140px hsl(200 100% 62% / 0.12)",
  },
  bridge: {
    accent: "42 100% 58%",
    label: "PERMANENT BRIDGE",
    image: explainerBridge,
    glow: "0 0 70px hsl(42 100% 58% / 0.26), 0 0 140px hsl(42 100% 58% / 0.1)",
  },
  private: {
    accent: "272 100% 68%",
    label: "PRIVATE ROUTING",
    image: explainerPrivate,
    glow: "0 0 70px hsl(272 100% 68% / 0.28), 0 0 140px hsl(272 100% 68% / 0.12)",
  },
  invoice: {
    accent: "38 92% 50%",
    label: "INVOICE",
    image: explainerInvoice,
    glow: "0 0 70px hsl(38 92% 50% / 0.28), 0 0 140px hsl(38 92% 50% / 0.12)",
  },
  loan: {
    accent: "25 95% 53%",
    label: "BORROW",
    image: explainerLoan,
    glow: "0 0 70px hsl(25 95% 53% / 0.28), 0 0 140px hsl(25 95% 53% / 0.12)",
  },
  earn: {
    accent: "168 80% 48%",
    label: "EARN",
    image: explainerEarn,
    glow: "0 0 70px hsl(168 80% 48% / 0.28), 0 0 140px hsl(168 80% 48% / 0.12)",
  },
};

const labelPositions = [
  "left-0 top-3 w-[46%] sm:left-2 sm:top-5 sm:w-44 lg:-left-10 lg:top-14 lg:w-56",
  "right-0 top-16 w-[46%] sm:right-2 sm:top-20 sm:w-44 lg:-right-8 lg:top-10 lg:w-56",
  "left-1/2 bottom-0 w-[60%] -translate-x-1/2 sm:bottom-3 sm:w-52 lg:bottom-10 lg:left-8 lg:w-56 lg:translate-x-0",
] as const;

const hotspotPositions = [
  "left-[33%] top-[29%]",
  "left-[69%] top-[34%]",
  "left-[50%] top-[73%]",
] as const;

const lineStyles = [
  { left: "17%", top: "34%", width: "18%", rotate: "-10deg" },
  { left: "63%", top: "36%", width: "16%", rotate: "12deg" },
  { left: "38%", top: "67%", width: "17%", rotate: "88deg" },
] as const;

const DynamicExplainer = ({ activeTab, onCtaClick }: Props) => {
  const { t } = useTranslation();
  const mode: DisplayMode = activeTab === "request" ? "invoice" : (activeTab as DisplayMode);
  const [activeStep, setActiveStep] = useState(0);

  const config = modeConfig[mode] ?? modeConfig.exchange;
  const prefix = `explainer.${mode}`;

  const steps = useMemo(
    () =>
      [0, 1, 2].map((idx) => ({
        number: String(idx + 1).padStart(2, "0"),
        title: t(`${prefix}.step${idx + 1}.title`),
        description: t(`${prefix}.step${idx + 1}.description`),
      })),
    [prefix, t]
  );

  return (
    <section className="relative overflow-hidden bg-background pb-16 pt-4 sm:pb-24 sm:pt-8 lg:pb-28">
      <div className="container mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card/50 px-5 py-6 shadow-card backdrop-blur-sm sm:px-7 sm:py-8 lg:px-12 lg:py-12"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-100"
              style={{
                background: `radial-gradient(circle at 70% 42%, hsl(${config.accent} / 0.14), transparent 30%), radial-gradient(circle at 25% 10%, hsl(${config.accent} / 0.08), transparent 28%)`,
              }}
            />

            <div className="relative lg:min-h-[620px]">
              <div className="relative z-10 max-w-xl lg:max-w-[32rem]">
                <div
                  className="inline-flex items-center rounded-full border px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.28em]"
                  style={{
                    color: `hsl(${config.accent})`,
                    borderColor: `hsl(${config.accent} / 0.28)`,
                    backgroundColor: `hsl(${config.accent} / 0.08)`,
                  }}
                >
                  {config.label}
                </div>
                <h2 className="mt-4 max-w-[12ch] font-display text-4xl font-black leading-[0.92] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  {t(`${prefix}.heading`)}
                </h2>
                <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                  {t(`${prefix}.subtitle`)}
                </p>

                {mode === "buysell" && (
                  <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 sm:gap-x-6">
                    {logos.map((logo) => (
                      <div key={logo.alt} className="flex h-6 items-center justify-center">
                        <img
                          src={logo.src}
                          alt={logo.alt}
                          loading="lazy"
                          className="h-6 w-auto opacity-80 transition-opacity duration-300 hover:opacity-100"
                          style={{ filter: "brightness(0) invert(1)" }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-7 flex flex-wrap items-center gap-4">
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
                  <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    Create • Route • Receive
                  </div>
                </div>
              </div>

              <div className="relative mt-8 lg:mt-0 lg:absolute lg:inset-y-0 lg:right-0 lg:w-[58%]">
                <div className="relative mx-auto aspect-square w-full max-w-[44rem] lg:h-full lg:max-w-none">
                  {lineStyles.map((line, index) => (
                    <div
                      key={index}
                      className="pointer-events-none absolute hidden lg:block h-px"
                      style={{
                        left: line.left,
                        top: line.top,
                        width: line.width,
                        transform: `rotate(${line.rotate})`,
                        background: `linear-gradient(90deg, hsl(${config.accent} / 0.55), hsl(${config.accent} / 0))`,
                      }}
                    />
                  ))}

                  <motion.div
                    className="absolute inset-[10%] rounded-full blur-3xl"
                    animate={{ scale: activeStep === 1 ? 1.06 : 1, opacity: activeStep === 2 ? 0.95 : 0.72 }}
                    transition={{ duration: 0.3 }}
                    style={{ background: `radial-gradient(circle, hsl(${config.accent} / 0.24), transparent 68%)` }}
                  />

                  <motion.img
                    key={config.image}
                    src={config.image}
                    alt={t(`${prefix}.heading`)}
                    loading="lazy"
                    width={1024}
                    height={1024}
                    className="absolute inset-0 m-auto w-[96%] max-w-[40rem] object-contain sm:w-[92%] lg:w-[104%]"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    style={{ filter: "drop-shadow(0 28px 80px rgba(0,0,0,0.28))" }}
                  />

                  {hotspotPositions.map((position, idx) => (
                    <motion.div
                      key={idx}
                      className={`pointer-events-none absolute ${position} h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full`}
                      animate={{ scale: activeStep === idx ? 1.5 : 1, opacity: activeStep === idx ? 1 : 0.45 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        backgroundColor: `hsl(${config.accent})`,
                        boxShadow: activeStep === idx ? config.glow : `0 0 0 1px hsl(${config.accent} / 0.2)`,
                      }}
                    />
                  ))}

                  {steps.map((step, idx) => (
                    <motion.button
                      key={step.number}
                      type="button"
                      onMouseEnter={() => setActiveStep(idx)}
                      onFocus={() => setActiveStep(idx)}
                      className={`absolute rounded-[1.35rem] border px-3 py-3 text-left backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 sm:px-4 ${labelPositions[idx]}`}
                      style={{
                        borderColor: `hsl(${config.accent} / ${activeStep === idx ? 0.42 : 0.24})`,
                        backgroundColor: `hsl(${activeStep === idx ? config.accent : "230 15% 8%"} / ${activeStep === idx ? 0.12 : 0.62})`,
                        boxShadow: activeStep === idx ? config.glow : "none",
                      }}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.12 + idx * 0.08 }}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="font-mono text-xs font-bold tracking-[0.22em]"
                          style={{ color: `hsl(${config.accent})` }}
                        >
                          {step.number}
                        </span>
                        <div>
                          <div className="text-[13px] font-extrabold leading-4 text-foreground sm:text-sm">
                            {step.title}
                          </div>
                          <p className="mt-1 line-clamp-3 text-[11px] leading-4 text-muted-foreground sm:text-xs sm:leading-5">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default DynamicExplainer;
