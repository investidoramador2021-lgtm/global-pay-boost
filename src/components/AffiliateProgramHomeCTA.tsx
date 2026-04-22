import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bitcoin, Code2, Infinity as InfinityIcon, ShieldCheck, Sparkles, Smartphone, Layers, BarChart3, Rocket } from "lucide-react";
import { getLangFromPath, langPath } from "@/i18n";

const AffiliateProgramHomeCTA = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);

  const benefits = [
    { icon: InfinityIcon, label: t("affiliateHomeCta.benefits.lifetime") },
    { icon: Code2, label: t("affiliateHomeCta.benefits.widget") },
    { icon: Bitcoin, label: t("affiliateHomeCta.benefits.payouts") },
    { icon: ShieldCheck, label: t("affiliateHomeCta.benefits.regulated") },
  ];

  return (
    <section className="py-16 sm:py-20 px-4" aria-labelledby="affiliate-home-cta-title">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-card/60 backdrop-blur-xl shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.35)]">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />

          <div className="relative grid gap-10 lg:grid-cols-[1.3fr_1fr] p-6 sm:p-10 lg:p-14">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                {t("affiliateHomeCta.badge")}
              </div>

              <h2
                id="affiliate-home-cta-title"
                className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]"
              >
                {t("affiliateHomeCta.headlineLead")}{" "}
                <span className="bg-gradient-to-r from-primary to-[hsl(var(--primary)/0.7)] bg-clip-text text-transparent">
                  {t("affiliateHomeCta.headlineAccent")}
                </span>
              </h2>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                {t("affiliateHomeCta.subheadline")}
              </p>

              <ul className="grid sm:grid-cols-2 gap-3">
                {benefits.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-2.5"
                  >
                    <Icon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span className="text-sm text-foreground/90 leading-snug">{label}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
                <Button asChild size="lg" className="px-6 py-6 text-base font-semibold rounded-xl gap-2">
                  <Link to={langPath(lang, "/affiliates")}>
                    {t("affiliateHomeCta.ctaPrimary")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="px-6 py-6 text-base font-semibold rounded-xl gap-2 bg-primary/15 text-primary hover:bg-primary/25 border border-primary/30"
                >
                  <Link to={langPath(lang, "/affiliates#generate")}>
                    <Rocket className="w-4 h-4" />
                    {t("affiliateHomeCta.tryWidget.tryButton")}
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="px-6 py-6 text-base font-semibold rounded-xl gap-2 border-primary/40 hover:bg-primary/10"
                >
                  <Link to={langPath(lang, "/partners")}>
                    {t("affiliateHomeCta.ctaSecondary")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                {t("affiliateHomeCta.referralPrefix")}{" "}
                <Link
                  to={langPath(lang, "/referral")}
                  className="text-primary font-semibold underline-offset-4 hover:underline"
                >
                  {t("affiliateHomeCta.referralLink")}
                </Link>
                .
              </p>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl border border-border/60 bg-background/60 backdrop-blur-md p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                    <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-primary/70" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    affiliate-widget.html
                  </span>
                </div>

                <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{t("affiliateHomeCta.widget.youSend")}</span>
                    <span className="text-xs text-primary font-semibold">BTC</span>
                  </div>
                  <div className="rounded-lg bg-background/80 border border-border/40 px-3 py-2.5 font-mono text-lg text-foreground">
                    0.05000000
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{t("affiliateHomeCta.widget.youGet")}</span>
                    <span className="text-xs text-primary font-semibold">USDT</span>
                  </div>
                  <div className="rounded-lg bg-background/80 border border-border/40 px-3 py-2.5 font-mono text-lg text-foreground">
                    3,247.18
                  </div>
                  <div className="rounded-lg bg-primary/15 border border-primary/30 px-3 py-2 text-center text-sm font-semibold text-primary">
                    {t("affiliateHomeCta.widget.swapNow")}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                    <span>{t("affiliateHomeCta.widget.poweredBy")}</span>
                    <span className="font-mono">ref=YOU</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Bitcoin className="w-3.5 h-3.5 text-primary" />
                  {t("affiliateHomeCta.widget.tagline")}
                </div>
              </div>

              <div className="absolute -top-3 -right-3 rounded-full border border-primary/40 bg-primary/15 backdrop-blur px-3 py-1 text-[11px] font-semibold text-primary shadow-lg">
                {t("affiliateHomeCta.badgeFloat")}
              </div>
            </div>
          </div>
        </div>

        {/* PROMOTE WITH OUR WIDGET — benefit box */}
        <div className="mt-6 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8 shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.3)]">
          <div className="max-w-2xl">
            <h3 className="font-display text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {t("affiliateHomeCta.tryWidget.boxTitle")}
            </h3>
            <p className="mt-2 font-body text-sm sm:text-base text-muted-foreground">
              {t("affiliateHomeCta.tryWidget.boxSubtitle")}
            </p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Smartphone, label: t("affiliateHomeCta.tryWidget.f1") },
              { icon: Layers, label: t("affiliateHomeCta.tryWidget.f2") },
              { icon: BarChart3, label: t("affiliateHomeCta.tryWidget.f3") },
              { icon: Code2, label: t("affiliateHomeCta.tryWidget.f4") },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 rounded-xl border border-border bg-background/60 p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm leading-snug text-foreground/90">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AffiliateProgramHomeCTA;
