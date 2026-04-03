import { useTranslation } from "react-i18next";
import { ClipboardList, Send, Wallet } from "lucide-react";

const icons = [ClipboardList, Send, Wallet];
const stepKeys = ["step1", "step2", "step3"] as const;
const numbers = ["01", "02", "03"];

const HowItWorksSection = () => {
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className="bg-background py-14 sm:py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {t("howItWorks.heading")}
          </h2>
          <p className="mt-3 font-body text-base text-muted-foreground sm:mt-4 sm:text-lg">
            {t("howItWorks.subtitle")}
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:mt-16 sm:grid-cols-3 lg:gap-10">
          {stepKeys.map((key, idx) => {
            const Icon = icons[idx];
            return (
              <div key={key} className="relative text-center rounded-xl border border-border bg-card p-6 shadow-card sm:p-8">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="font-display text-3xl font-extrabold text-primary/20 sm:text-4xl">{numbers[idx]}</span>
                <h3 className="mt-1 font-display text-base font-semibold text-foreground sm:mt-2 sm:text-lg">
                  {t(`howItWorks.${key}.title`)}
                </h3>
                <p className="mt-1.5 font-body text-sm leading-relaxed text-muted-foreground sm:mt-2">
                  {t(`howItWorks.${key}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
