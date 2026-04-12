import { useTranslation } from "react-i18next";
import { FileText, Mail, Shield } from "lucide-react";
import invoiceHeroImg from "@/assets/invoice-3d-hero.png";

const icons = [FileText, Mail, Shield];
const stepKeys = ["step1", "step2", "step3"] as const;
const numbers = ["01", "02", "03"];

const InvoiceHowItWorks = () => {
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className="bg-background py-14 sm:py-20 lg:py-28">
      <div className="container mx-auto px-4">
        {/* Hero visual + heading */}
        <div className="mx-auto max-w-2xl text-center">
          <img
            src={invoiceHeroImg}
            alt={t("invoice.howItWorks.heading")}
            loading="lazy"
            className="mx-auto mb-6 h-28 w-28 object-contain sm:h-36 sm:w-36 drop-shadow-[0_12px_40px_rgba(234,179,8,0.25)]"
          />
          <span className="mb-3 inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-display text-[10px] font-bold uppercase tracking-widest text-primary">
            {t("invoice.howItWorks.badge")}
          </span>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {t("invoice.howItWorks.heading")}
          </h2>
          <p className="mt-3 font-body text-base text-muted-foreground sm:mt-4 sm:text-lg">
            {t("invoice.howItWorks.subtitle")}
          </p>
        </div>

        {/* Step cards — matching HowItWorksSection glassmorphism */}
        <div className="mt-10 grid gap-6 sm:mt-16 sm:grid-cols-3 lg:gap-10">
          {stepKeys.map((key, idx) => {
            const Icon = icons[idx];
            return (
              <div
                key={key}
                className="relative text-center rounded-xl border border-border bg-card p-6 shadow-card sm:p-8"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="font-display text-3xl font-extrabold text-primary/20 sm:text-4xl">
                  {numbers[idx]}
                </span>
                <h3 className="mt-1 font-display text-base font-semibold text-foreground sm:mt-2 sm:text-lg">
                  {t(`invoice.howItWorks.${key}Title`)}
                </h3>
                <p className="mt-1.5 font-body text-sm leading-relaxed text-muted-foreground sm:mt-2">
                  {t(`invoice.howItWorks.${key}Desc`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default InvoiceHowItWorks;
