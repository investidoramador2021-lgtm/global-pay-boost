import { useTranslation } from "react-i18next";
import { FileText, Mail, Shield } from "lucide-react";

const icons = [FileText, Mail, Shield];
const nums = ["01", "02", "03"];

const InvoiceHowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    { num: nums[0], icon: icons[0], title: t("invoice.howItWorks.step1Title"), desc: t("invoice.howItWorks.step1Desc") },
    { num: nums[1], icon: icons[1], title: t("invoice.howItWorks.step2Title"), desc: t("invoice.howItWorks.step2Desc") },
    { num: nums[2], icon: icons[2], title: t("invoice.howItWorks.step3Title"), desc: t("invoice.howItWorks.step3Desc") },
  ];

  return (
    <section className="mt-16 mb-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-display text-[10px] font-bold uppercase tracking-widest text-primary mb-3">
            {t("invoice.howItWorks.badge")}
          </span>
          <h2 className="font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {t("invoice.howItWorks.heading")}
          </h2>
          <p className="mx-auto mt-2 max-w-lg font-body text-sm text-muted-foreground">
            {t("invoice.howItWorks.subtitle")}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.num}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-card"
            >
              <span className="absolute -right-2 -top-3 font-display text-[64px] font-black leading-none text-primary/[0.06] select-none">
                {s.num}
              </span>

              <div className="relative z-10">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-card">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-display text-base font-bold text-foreground">
                  <span className="mr-2 text-primary">{s.num}.</span>{s.title}
                </h3>
                <p className="font-body text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InvoiceHowItWorks;
