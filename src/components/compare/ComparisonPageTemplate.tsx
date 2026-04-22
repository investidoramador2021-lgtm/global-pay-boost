import { Helmet } from "react-helmet-async";
import { ShieldCheck, Zap, ArrowRight, CheckCircle2, XCircle, Trophy, MinusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MsbTrustBar from "@/components/MsbTrustBar";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { usePageUrl } from "@/hooks/use-page-url";
import { getRandomCompetitors } from "@/lib/competitor-data";
import type { DeepProfile } from "@/lib/competitor-deep";
import { getLangFromPath, langPath } from "@/i18n";
import { useLocation } from "react-router-dom";

interface Props { profile: DeepProfile }

const WinnerBadge = ({ winner, mrcLabel, rivalLabel, tieLabel }: { winner: "mrc" | "rival" | "tie"; mrcLabel: string; rivalLabel: string; tieLabel: string }) => {
  if (winner === "tie") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
        <MinusCircle className="h-3 w-3" /> {tieLabel}
      </span>
    );
  }
  if (winner === "mrc") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
        <Trophy className="h-3 w-3" /> {mrcLabel}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-foreground/10 px-2.5 py-1 text-[11px] font-semibold text-foreground">
      <Trophy className="h-3 w-3" /> {rivalLabel}
    </span>
  );
};

const ComparisonPageTemplate = ({ profile }: Props) => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const pageUrl = usePageUrl(`/compare/mrc-vs-${profile.slug}`);
  const others = getRandomCompetitors(profile.slug, 4);

  // Translation helper with fallback to canonical English profile data.
  const base = `compare.profiles.${profile.slug}`;
  const tr = (suffix: string, fallback: string): string => {
    const key = `${base}.${suffix}`;
    const exists = i18n.exists(key);
    if (!exists) return fallback;
    const v = t(key);
    return typeof v === "string" && v.length > 0 ? v : fallback;
  };

  const title = tr("title", profile.title);
  const intro = tr("intro", profile.intro);
  const conclusion = tr("conclusion", profile.conclusion);
  const localizedRows = profile.rows.map((r, idx) => {
    // Stable row IDs (must match ROW_IDS in the inject script).
    const ids = ["regulation", "min", "kyc", "speed", "nonCustodial", "assets", "fees", "support", "affiliate"] as const;
    const id = ids[idx] ?? String(idx);
    return {
      ...r,
      feature: tr(`rows.${id}.feature`, r.feature),
      mrc: tr(`rows.${id}.mrc`, r.mrc),
      rival: tr(`rows.${id}.rival`, r.rival),
    };
  });
  const trList = (suffix: "mrcPros" | "mrcCons" | "rivalPros" | "rivalCons" | "whyMrc", fallback: string[]): string[] => {
    const key = `${base}.${suffix}`;
    if (!i18n.exists(key)) return fallback;
    const v = t(key, { returnObjects: true });
    return Array.isArray(v) && v.length > 0 ? (v as string[]) : fallback;
  };
  const mrcPros = trList("mrcPros", profile.mrcPros);
  const mrcCons = trList("mrcCons", profile.mrcCons);
  const rivalPros = trList("rivalPros", profile.rivalPros);
  const rivalCons = trList("rivalCons", profile.rivalCons);
  const whyMrc = trList("whyMrc", profile.whyMrc);

  // FAQ — translated questions/answers with {rival} interpolation.
  const faqTitle = t("compare.faq.title", { defaultValue: "Frequently Asked Questions" });
  const rawFaq = t("compare.faq.items", { returnObjects: true, defaultValue: [] }) as Array<{ q: string; a: string }>;
  const faqItems = (Array.isArray(rawFaq) ? rawFaq : []).map((item) => ({
    q: (item.q || "").replace(/\{\{rival\}\}/g, profile.rivalName),
    a: (item.a || "").replace(/\{\{rival\}\}/g, profile.rivalName),
  }));

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://mrcglobalpay.com/" },
        { "@type": "ListItem", position: 2, name: "Compare", item: "https://mrcglobalpay.com/compare" },
        { "@type": "ListItem", position: 3, name: `MRC vs ${profile.rivalName}`, item: pageUrl },
      ],
    },
    ...(faqItems.length > 0
      ? [{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }]
      : []),
  ];

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={intro.slice(0, 158)} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={intro.slice(0, 158)} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        {jsonLd.map((ld, i) => (
          <script key={i} type="application/ld+json">{JSON.stringify(ld)}</script>
        ))}
      </Helmet>

      <SiteHeader />

      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <nav className="border-b border-border bg-muted/20 py-3" aria-label="Breadcrumb">
          <div className="container mx-auto max-w-5xl px-4">
            <ol className="flex items-center gap-2 font-body text-xs text-muted-foreground">
              <li><Link to={langPath(lang, "/")} className="hover:text-foreground">{t("compare.breadcrumbHome")}</Link></li>
              <li>/</li>
              <li><Link to={langPath(lang, "/compare")} className="hover:text-foreground">{t("compare.breadcrumbCompare")}</Link></li>
              <li>/</li>
              <li className="text-foreground font-medium">MRC vs {profile.rivalName}</li>
            </ol>
          </div>
        </nav>

        {/* Hero */}
        <section className="border-b border-border bg-muted/30 py-16 sm:py-20">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              {t("compare.updatedTag")}
            </span>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              {title}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-body text-base sm:text-lg leading-relaxed text-muted-foreground">
              {intro}
            </p>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto max-w-5xl px-4">
            <h2 className="mb-6 text-center font-display text-2xl sm:text-3xl font-bold text-foreground">
              {t("compare.tableTitle", { rival: profile.rivalName })}
            </h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-display text-sm font-semibold text-foreground">{t("compare.colFeature")}</TableHead>
                    <TableHead className="font-display text-sm font-semibold text-primary">MRC GlobalPay</TableHead>
                    <TableHead className="font-display text-sm font-semibold text-foreground">{profile.rivalName}</TableHead>
                    <TableHead className="text-center font-display text-sm font-semibold text-foreground">{t("compare.colWinner")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {localizedRows.map((r) => (
                    <TableRow key={r.feature}>
                      <TableCell className="font-body text-sm font-semibold text-foreground align-top">{r.feature}</TableCell>
                      <TableCell className="font-body text-sm text-foreground/90 align-top">{r.mrc}</TableCell>
                      <TableCell className="font-body text-sm text-muted-foreground align-top">{r.rival}</TableCell>
                      <TableCell className="text-center align-top">
                        <WinnerBadge
                          winner={r.winner}
                          mrcLabel={t("compare.winnerMrc")}
                          rivalLabel={profile.rivalName}
                          tieLabel={t("compare.winnerTie")}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="mt-4 text-center font-body text-xs text-muted-foreground">
              {t("compare.tableFootnote", { rival: profile.rivalName })}
            </p>
          </div>
        </section>

        {/* Pros & Cons */}
        <section className="border-t border-border bg-muted/20 py-12 sm:py-16">
          <div className="container mx-auto max-w-5xl px-4">
            <h2 className="mb-8 text-center font-display text-2xl sm:text-3xl font-bold text-foreground">
              {t("compare.prosConsTitle")}
            </h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* MRC */}
              <div className="rounded-2xl border border-primary/30 bg-card p-6">
                <h3 className="font-display text-lg font-bold text-primary">MRC GlobalPay</h3>
                <h4 className="mt-4 font-display text-sm font-semibold text-foreground">{t("compare.prosLabel")}</h4>
                <ul className="mt-2 space-y-2">
                  {mrcPros.map((p) => (
                    <li key={p} className="flex gap-2 font-body text-sm text-foreground/90">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <h4 className="mt-5 font-display text-sm font-semibold text-foreground">{t("compare.consLabel")}</h4>
                <ul className="mt-2 space-y-2">
                  {mrcCons.map((p) => (
                    <li key={p} className="flex gap-2 font-body text-sm text-muted-foreground">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rival */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-display text-lg font-bold text-foreground">{profile.rivalName}</h3>
                <h4 className="mt-4 font-display text-sm font-semibold text-foreground">{t("compare.prosLabel")}</h4>
                <ul className="mt-2 space-y-2">
                  {rivalPros.map((p) => (
                    <li key={p} className="flex gap-2 font-body text-sm text-foreground/90">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <h4 className="mt-5 font-display text-sm font-semibold text-foreground">{t("compare.consLabel")}</h4>
                <ul className="mt-2 space-y-2">
                  {rivalCons.map((p) => (
                    <li key={p} className="flex gap-2 font-body text-sm text-muted-foreground">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Why MRC */}
        <section className="border-t border-border py-12 sm:py-16">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 className="mb-6 font-display text-2xl sm:text-3xl font-bold text-foreground">
              {t("compare.whyMrcTitle")}
            </h2>
            <ul className="space-y-3">
              {whyMrc.map((p, i) => (
                <li key={p} className="flex gap-3 rounded-xl border border-border bg-card p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 font-display text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="font-body text-sm leading-relaxed text-foreground/90">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Conclusion */}
        <section className="border-t border-border bg-muted/20 py-12 sm:py-16">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 className="mb-4 font-display text-2xl sm:text-3xl font-bold text-foreground">
              {t("compare.verdictTitle")}
            </h2>
            <p className="font-body text-base leading-relaxed text-foreground/90">
              {conclusion}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={langPath(lang, "/")}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-display text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Zap className="h-4 w-4" />
                {t("compare.ctaSwap")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={langPath(lang, "/affiliates")}
                className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-6 py-3 font-display text-sm font-bold text-primary transition-colors hover:bg-primary/20"
              >
                <ShieldCheck className="h-4 w-4" />
                {t("compare.ctaAffiliate")}
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        {faqItems.length > 0 && (
          <section className="border-t border-border py-12 sm:py-16">
            <div className="container mx-auto max-w-3xl px-4">
              <h2 className="mb-6 font-display text-2xl sm:text-3xl font-bold text-foreground">
                {faqTitle}
              </h2>
              <div className="space-y-3">
                {faqItems.map((f, i) => (
                  <details
                    key={i}
                    className="group rounded-xl border border-border bg-card p-5 open:border-primary/40"
                  >
                    <summary className="flex cursor-pointer items-start justify-between gap-4 font-display text-base font-semibold text-foreground list-none">
                      <span>{f.q}</span>
                      <span className="mt-1 shrink-0 text-primary transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">
                      {f.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Compare Others */}
        <section className="border-t border-border py-12">
          <div className="container mx-auto max-w-5xl px-4">
            <h2 className="mb-6 text-center font-display text-xl font-bold text-foreground">
              {t("compare.compareOthers")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  to={langPath(lang, `/compare/mrc-vs-${o.slug}`)}
                  className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <h3 className="font-display text-sm font-bold text-foreground">MRC vs {o.name}</h3>
                  <p className="mt-1 font-body text-xs text-muted-foreground">{t("compare.minLabel")}: ${o.min_swap_usd}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <MsbTrustBar />
      <SiteFooter />
    </>
  );
};

export default ComparisonPageTemplate;
