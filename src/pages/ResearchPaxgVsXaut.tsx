import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HreflangTags from "@/components/HreflangTags";
import { getLangFromPath, langPath, type SupportedLanguage } from "@/i18n";
import {
  researchMeta,
  comparisonTable,
  faqs,
  statsCards,
} from "@/lib/research/paxg-vs-xaut-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const BASE_URL = "https://mrcglobalpay.com";

/* ── tiny helpers ── */
const WinBadge = ({ side }: { side: "paxg" | "xaut" }) => (
  <span
    className="ml-1.5 inline-block rounded px-1 py-px text-[10px] font-bold uppercase tracking-widest"
    style={{
      background:
        side === "paxg"
          ? "hsl(45 100% 55% / 0.15)"
          : "hsl(200 90% 55% / 0.15)",
      color: side === "paxg" ? "hsl(45 100% 55%)" : "hsl(200 90% 60%)",
    }}
  >
    stronger
  </span>
);

const TokenCard = ({
  ticker,
  name,
  issuer,
  tags,
  children,
  accentHue,
}: {
  ticker: string;
  name: string;
  issuer: string;
  tags: string[];
  children: React.ReactNode;
  accentHue: number;
}) => (
  <div
    className="rounded-2xl border border-border/60 p-6 sm:p-8"
    style={{
      background: `linear-gradient(160deg, hsl(${accentHue} 30% 8%) 0%, hsl(220 20% 6%) 100%)`,
      boxShadow: `inset 0 1px 0 hsl(${accentHue} 40% 30% / 0.15), 0 8px 32px hsl(0 0% 0% / 0.3)`,
    }}
  >
    <div className="flex items-center gap-3 mb-4">
      <span
        className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-black tracking-tight"
        style={{
          background: `hsl(${accentHue} 50% 50% / 0.15)`,
          color: `hsl(${accentHue} 60% 65%)`,
        }}
      >
        {ticker}
      </span>
      <div>
        <h3 className="text-lg font-bold text-foreground">{name}</h3>
        <p className="text-xs text-muted-foreground">{issuer}</p>
      </div>
    </div>
    <div className="flex flex-wrap gap-1.5 mb-4">
      {tags.map((t) => (
        <span
          key={t}
          className="rounded-full border border-border/40 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
        >
          {t}
        </span>
      ))}
    </div>
    <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
  </div>
);

/* ── page ── */
const ResearchPaxgVsXaut = () => {
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname) as SupportedLanguage;
  const meta = researchMeta[lang] ?? researchMeta.en;

  const canonicalPath = "/research/paxg-vs-xaut-2026";
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.metaDescription,
    inLanguage: lang,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
      isPartOf: { "@type": "WebSite", name: "MRC GlobalPay", url: BASE_URL },
    },
    author: { "@type": "Organization", name: "MRC GlobalPay Research" },
    publisher: {
      "@type": "Organization",
      name: "MRC GlobalPay",
      url: BASE_URL,
    },
    datePublished: "2026-04-15",
    dateModified: "2026-04-15",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const swapLink = langPath(lang, "/");

  return (
    <>
      <Helmet>
        <title>{meta.metaTitle}</title>
        <meta name="description" content={meta.metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={meta.metaTitle} />
        <meta property="og:description" content={meta.metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1"
        />
        <script type="application/ld+json">
          {JSON.stringify([articleSchema, faqSchema])}
        </script>
      </Helmet>
      <HreflangTags />
      <SiteHeader />

      <main className="min-h-screen bg-background">
        {/* ── Hero ── */}
        <header className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-background via-background to-card">
          <div className="container mx-auto max-w-4xl px-4 pt-20 pb-14 sm:pt-28 sm:pb-20 text-center">
            <p
              className="mb-3 text-xs font-semibold uppercase tracking-[0.25em]"
              style={{ color: "hsl(45 100% 55%)" }}
            >
              {meta.author}
            </p>
            <h1 className="mx-auto max-w-3xl font-display text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {meta.title}
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Updated {meta.updated} · {meta.readTime}
            </p>
          </div>
        </header>

        {/* ── Stats strip ── */}
        <section className="border-b border-border/30">
          <div className="container mx-auto max-w-5xl px-4 py-10">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {statsCards.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-border/40 p-5 text-center"
                  style={{
                    background:
                      "linear-gradient(160deg, hsl(220 20% 8%) 0%, hsl(220 15% 5%) 100%)",
                    boxShadow:
                      "inset 0 1px 0 hsl(0 0% 100% / 0.04), 0 4px 20px hsl(0 0% 0% / 0.25)",
                  }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {s.label}
                  </p>
                  <p
                    className="mt-1 font-mono text-2xl font-black tabular-nums sm:text-3xl"
                    style={{ color: "hsl(45 100% 55%)" }}
                  >
                    {s.value}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Body content ── */}
        <div className="container mx-auto max-w-3xl px-4 py-14 sm:py-20">
          {/* Intro */}
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            The tokenized gold sector crossed $6B in circulating supply this
            year — but not all gold tokens are created equal. PAXG and XAUt
            share the same 1 troy oz peg, but differ radically in jurisdiction,
            fee structure, DeFi reach, and redemption mechanics. Here's the
            unsanitized breakdown.
          </p>

          {/* Two contenders */}
          <h2 className="mt-14 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            The two contenders at a glance
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Before diving into the mechanics, understand what you're actually
            comparing: two different institutional philosophies wrapped in the
            same commodity.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <TokenCard
              ticker="PX"
              name="PAX Gold (PAXG)"
              issuer="Paxos Trust Company · NYDFS regulated"
              tags={[
                "US Jurisdiction",
                "Monthly audits",
                "Bankruptcy remote",
                "ERC-20 primary",
              ]}
              accentHue={45}
            >
              Issued under a New York Trust charter. Each token maps to a
              specific serialized LBMA bar in Brink's London vaults —
              verifiable on-chain down to the bar's serial number.
            </TokenCard>
            <TokenCard
              ticker="XT"
              name="Tether Gold (XAUt)"
              issuer="TG Commodities (Tether) · CNAD El Salvador"
              tags={[
                "Offshore structure",
                "Zero transfer fee",
                "Multi-chain",
                "DeFi-native",
              ]}
              accentHue={200}
            >
              Issued by TG Commodities, regulated under El Salvador's CNAD
              framework. Available natively on Ethereum, BNB Chain, and TON —
              the broadest addressable liquidity of any tokenized precious metal
              in 2026.
            </TokenCard>
          </div>

          {/* Comparison Table */}
          <h2 className="mt-16 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Head-to-head: the metrics that actually matter
          </h2>

          <div
            className="mt-8 overflow-x-auto rounded-xl border border-border/40"
            style={{
              background: "hsl(220 20% 6% / 0.6)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            <table className="w-full min-w-[580px] text-sm">
              <thead>
                <tr className="border-b border-border/30 text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    Feature
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em]"
                    style={{ color: "hsl(45 100% 55%)" }}
                  >
                    PAXG
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em]"
                    style={{ color: "hsl(200 90% 60%)" }}
                  >
                    XAUt
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonTable.map((row, i) => (
                  <tr
                    key={row.feature}
                    className="border-b border-border/20 last:border-0"
                    style={{
                      background:
                        i % 2 === 0 ? "transparent" : "hsl(0 0% 100% / 0.02)",
                    }}
                  >
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                      {row.feature}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.paxg}
                      {row.winner === "paxg" && <WinBadge side="paxg" />}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.xaut}
                      {row.winner === "xaut" && <WinBadge side="xaut" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Jurisdiction */}
          <h2 className="mt-16 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            The jurisdiction question — and why it's not black-and-white
          </h2>
          <div className="mt-6 space-y-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <div>
              <h3 className="mb-2 text-lg font-bold text-foreground">
                PAXG's "regulatory moat" is real — with caveats
              </h3>
              <p>
                NYDFS oversight means Paxos is subject to capital requirements,
                regular examinations, and reserve segregation rules that
                genuinely protect token holders in a bankruptcy scenario. New
                York Trust law provides statutory ring-fencing that offshore
                structures cannot replicate contractually.
              </p>
              <p className="mt-3">
                The caveat: US jurisdiction cuts both ways. Paxos can be
                compelled to freeze or seize tokens by US court order. For
                investors whose use case involves capital mobility outside US
                reach, PAXG's regulatory clarity is also a vector of
                vulnerability.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-bold text-foreground">
                XAUt's offshore structure is a feature, not just a risk flag
              </h3>
              <p>
                El Salvador's CNAD is a nascent but functioning regulator.
                Tether's Swiss custody arrangement is credible. The real edge of
                XAUt in 2026 is operational: zero transfer fees and native
                multi-chain deployment mean it functions as genuine DeFi
                collateral.
              </p>
              <p
                className="mt-4 rounded-lg border border-border/40 p-4 font-medium"
                style={{
                  background: "hsl(45 100% 55% / 0.06)",
                  color: "hsl(45 90% 70%)",
                }}
              >
                Key insight: A DeFi desk running $10M notional in
                gold-collateralized lending, recycling positions 3× per week,
                saves approximately $31,200/year in on-chain fees by using XAUt
                over PAXG.
              </p>
            </div>
          </div>

          {/* Redemption */}
          <h2 className="mt-16 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            The redemption reality
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Both tokens advertise "1:1 physical gold backing." Neither token is
            realistically redeemable for physical gold unless you're operating
            at institutional scale. The 400 oz LBMA Good Delivery bar minimum
            (~430 tokens, ~$1.3–1.5M) is designed for bullion banks and
            commodity traders.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            For everyone else, the exit is the secondary market. On that metric,
            XAUt's multi-chain footprint wins for fast swaps while PAXG's
            Coinbase listing wins for large block trades where price impact
            matters more.
          </p>

          {/* DeFi yield */}
          <h2 className="mt-16 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            2026 DeFi use cases: where these tokens generate yield
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div
              className="rounded-xl border border-border/40 p-5"
              style={{
                background:
                  "linear-gradient(160deg, hsl(45 20% 8%) 0%, hsl(220 15% 5%) 100%)",
              }}
            >
              <h3
                className="text-sm font-bold uppercase tracking-[0.15em]"
                style={{ color: "hsl(45 100% 55%)" }}
              >
                PAXG Yield Strategies
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Aave v3 collateral (40–60% LTV), Curve periphery pools,
                institutional lending desks. Net yield: 2–4% annualized in flat
                rate environments.
              </p>
            </div>
            <div
              className="rounded-xl border border-border/40 p-5"
              style={{
                background:
                  "linear-gradient(160deg, hsl(200 20% 8%) 0%, hsl(220 15% 5%) 100%)",
              }}
            >
              <h3
                className="text-sm font-bold uppercase tracking-[0.15em]"
                style={{ color: "hsl(200 90% 60%)" }}
              >
                XAUt Yield Strategies
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                BNB Chain LP provision (Venus, PancakeSwap v3), TON ecosystem
                integrations attracting Telegram-native flows. DEX volumes
                exceed PAXG by 3–5× on those chains.
              </p>
            </div>
          </div>

          {/* Choose section */}
          <h2 className="mt-16 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Which should you hold?
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-border/40 p-5">
              <h3
                className="mb-3 text-sm font-bold uppercase tracking-[0.15em]"
                style={{ color: "hsl(45 100% 55%)" }}
              >
                Choose PAXG if you…
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  "Are a regulated entity or institutional investor",
                  "Need monthly-audited, bar-traceable transparency",
                  "Want US-law bankruptcy protection",
                  "Plan to hold without frequent trading",
                  "Operate in jurisdictions requiring US-grade custody",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span style={{ color: "hsl(45 100% 55%)" }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border/40 p-5">
              <h3
                className="mb-3 text-sm font-bold uppercase tracking-[0.15em]"
                style={{ color: "hsl(200 90% 60%)" }}
              >
                Choose XAUt if you…
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  "Trade actively or recycle collateral frequently",
                  "Need cross-chain DeFi liquidity (BNB, TON)",
                  "Want to avoid US jurisdictional exposure",
                  "Run arbitrage or high-frequency gold strategies",
                  "Need deepest DEX liquidity for $1M+ swaps",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span style={{ color: "hsl(200 90% 60%)" }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Neither token is universally superior. Most sophisticated holders in
            2026 split their allocation: PAXG for the institutional-grade "cold
            storage" layer, XAUt for the active DeFi liquidity layer.
          </p>

          {/* CTA */}
          <div
            className="mt-14 rounded-2xl border border-border/40 p-8 text-center sm:p-10"
            style={{
              background:
                "linear-gradient(160deg, hsl(160 30% 8%) 0%, hsl(220 20% 5%) 100%)",
              boxShadow:
                "inset 0 1px 0 hsl(160 60% 40% / 0.1), 0 8px 32px hsl(0 0% 0% / 0.35)",
            }}
          >
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              How to swap PAXG or XAUt without registration
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              6,000+ pairs · No registration · Under 60 seconds · Canadian MSB
              registered
            </p>
            <a
              href={swapLink}
              className="group relative mt-6 inline-flex items-center gap-2 overflow-hidden rounded-full px-8 py-3 text-sm font-bold text-background transition-all duration-100"
              style={{
                background:
                  "linear-gradient(135deg, hsl(160 100% 45%), hsl(145 90% 50%))",
              }}
            >
              <span
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 3s ease-in-out infinite",
                }}
              />
              <span className="relative z-10">
                {meta.swapNowCta} ↗
              </span>
            </a>
          </div>

          {/* FAQ */}
          <h2 className="mt-16 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="mt-6">
            <Accordion
              type="single"
              collapsible
              className="space-y-2"
            >
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-xl border border-border/40 px-4 sm:px-6"
                  style={{ background: "hsl(220 20% 6% / 0.5)" }}
                >
                  <AccordionTrigger className="font-display text-sm font-semibold text-foreground hover:no-underline sm:text-base">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
};

export default ResearchPaxgVsXaut;
