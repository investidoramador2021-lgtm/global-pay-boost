import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ShieldCheck, Zap, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MsbTrustBar from "@/components/MsbTrustBar";
import { getCompetitorBySlug, getRandomCompetitors, type Competitor } from "@/lib/competitor-data";
import { getDeepProfile } from "@/lib/competitor-deep";
import ComparisonPageTemplate from "@/components/compare/ComparisonPageTemplate";
import { usePageUrl } from "@/hooks/use-page-url";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";

const MRC = {
  name: "MRC Global Pay",
  min_swap_usd: "$0.30",
  kyc_policy: "Registration-Free",
  avg_speed: "< 60 seconds",
  fees: "Flat low fee",
  fractal_btc: true,
  dust_conversion: true,
  non_custodial: true,
  assets_500: true,
  fiat_onramp: true,
  msb_registered: true,
};

type Row = { label: string; mrc: string | boolean; rival: string | boolean };

const buildRows = (c: Competitor): Row[] => [
  { label: "Minimum Swap", mrc: MRC.min_swap_usd, rival: `$${c.min_swap_usd}` },
  { label: "Identity Verification", mrc: MRC.kyc_policy, rival: c.kyc_policy },
  { label: "Average Speed", mrc: MRC.avg_speed, rival: c.avg_speed },
  { label: "Fee Structure", mrc: MRC.fees, rival: c.fees },
  { label: "Fractal BTC Support", mrc: true, rival: false },
  { label: "Crypto Dust Conversion", mrc: true, rival: false },
  { label: "Non-Custodial", mrc: true, rival: c.kyc_policy === "None" || c.kyc_policy === "No Account" || c.kyc_policy === "Privacy Focus" },
  { label: "6,000+ Assets", mrc: true, rival: !c.min_swap_usd.includes("Variable") },
  { label: "Canadian MSB Registered", mrc: true, rival: false },
];

const CellValue = ({ value }: { value: string | boolean }) => {
  if (typeof value === "string") return <span className="font-body text-sm font-semibold text-foreground">{value}</span>;
  return value
    ? <CheckCircle className="mx-auto h-5 w-5 text-green-500" aria-label="Yes" />
    : <XCircle className="mx-auto h-5 w-5 text-muted-foreground/40" aria-label="No" />;
};

const ComparePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const rivalSlug = slug?.replace("mrc-vs-", "") ?? "";
  const competitor = getCompetitorBySlug(rivalSlug);
  const pageUrl = usePageUrl(`/compare/${slug}`);

  // Rich, hand-curated comparison for priority competitors
  const deep = getDeepProfile(rivalSlug);
  if (deep) return <ComparisonPageTemplate profile={deep} />;

  if (!competitor) {
    return (
      <>
        <SiteHeader />
        <main className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">Comparison Not Found</h1>
            <p className="mt-2 font-body text-muted-foreground">This exchange is not in our database.</p>
            <Link to="/compare" className="mt-4 inline-block text-primary hover:underline">Browse all comparisons →</Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const rows = buildRows(competitor);
  const others = getRandomCompetitors(rivalSlug, 4);

  const faqItems = [
    {
      q: `What is the minimum swap for ${competitor.name}?`,
      a: `${competitor.name} requires a minimum of $${competitor.min_swap_usd} per swap. MRC Global Pay processes swaps from just $0.30, making it ${competitor.min_swap_usd !== "Variable" ? `${Math.round(parseFloat(competitor.min_swap_usd) / 0.3)}x` : "significantly"} more accessible for small balances and crypto dust.`,
    },
    {
      q: `Is MRC Global Pay better than ${competitor.name}?`,
      a: `MRC Global Pay offers a $0.30 minimum swap (vs $${competitor.min_swap_usd}), registration-free access, Fractal Bitcoin support, and specialized crypto dust conversion. ${competitor.name}'s main limitation: ${competitor.primary_weakness}. MRC's advantage: ${competitor.mrc_advantage}.`,
    },
    {
      q: "How do I clean crypto dust with MRC Global Pay?",
      a: "Visit mrcglobalpay.com, select your dust token, enter any amount above $0.30, paste your destination wallet, and confirm. Settlement takes under 60 seconds with no account creation required.",
    },
    {
      q: `Does ${competitor.name} require account registration?`,
      a: `${competitor.name}'s verification policy is: ${competitor.kyc_policy}. MRC Global Pay is fully registration-free — no email, no ID, no account needed to swap.`,
    },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "MRC Global Pay Crypto Exchange",
      description: `Compare MRC Global Pay vs ${competitor.name}. MRC offers $0.30 minimum swaps, registration-free access, and 6,000+ assets.`,
      image: "https://mrcglobalpay.com/icon-512x512.png",
      url: pageUrl,
      brand: { "@type": "Brand", name: "MRC Global Pay" },
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "0.30",
        highPrice: "1000000",
        priceCurrency: "USD",
        offerCount: "500",
        availability: "https://schema.org/InStock",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "1247",
        bestRating: "5",
        worstRating: "1",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://mrcglobalpay.com/" },
        { "@type": "ListItem", position: 2, name: "Compare", item: "https://mrcglobalpay.com/compare" },
        { "@type": "ListItem", position: 3, name: `MRC vs ${competitor.name}`, item: pageUrl },
      ],
    },
  ];

  return (
    <>
      <Helmet>
        <title>{`MRC Global Pay vs ${competitor.name} (2026) | Best Alternative`}</title>
        <meta name="description" content={`MRC Global Pay vs ${competitor.name}: $0.30 minimum swap vs $${competitor.min_swap_usd}. ${competitor.mrc_advantage}. Registration-free, non-custodial, FINTRAC-registered Canadian MSB with lifetime BTC rebates.`.slice(0, 160)} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={`MRC Global Pay vs ${competitor.name} — 2026 Comparison`} />
        <meta property="og:description" content={`$0.30 minimum vs $${competitor.min_swap_usd}. ${competitor.mrc_advantage}.`} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
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
              <li><a href="/" className="hover:text-foreground">Home</a></li>
              <li>/</li>
              <li><a href="/compare" className="hover:text-foreground">Compare</a></li>
              <li>/</li>
              <li className="text-foreground font-medium">MRC vs {competitor.name}</li>
            </ol>
          </div>
        </nav>

        {/* Hero */}
        <section className="border-b border-border bg-muted/30 py-16 sm:py-24">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              2026 Updated
            </span>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Better than {competitor.name}: Why MRC Global Pay is the #1 {competitor.name} Alternative (2026 Updated)
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
              {competitor.primary_weakness}? MRC Global Pay solves it. {competitor.mrc_advantage}.
            </p>
          </div>
        </section>

        {/* Section 1: Comparison Table */}
        <section className="py-12 sm:py-20">
          <div className="container mx-auto max-w-5xl px-4">
            <h2 className="mb-8 text-center font-display text-2xl font-bold text-foreground">
              Direct Comparison: MRC Global Pay vs {competitor.name}
            </h2>
            <div className="overflow-hidden rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-display text-sm font-semibold text-foreground">Feature</TableHead>
                    <TableHead className="text-center font-display text-sm font-semibold text-primary">MRC Global Pay</TableHead>
                    <TableHead className="text-center font-display text-sm font-semibold text-foreground">{competitor.name}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.label}>
                      <TableCell className="font-body text-sm font-medium text-foreground">{r.label}</TableCell>
                      <TableCell className="text-center"><CellValue value={r.mrc} /></TableCell>
                      <TableCell className="text-center"><CellValue value={r.rival} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="mt-4 text-center font-body text-xs text-muted-foreground">
              Data verified April 2026. {competitor.name} minimums may vary by asset pair.
            </p>
          </div>
        </section>

        {/* Section 2: The Problem */}
        <section className="border-t border-border bg-muted/20 py-12 sm:py-20">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 className="mb-6 font-display text-2xl font-bold text-foreground sm:text-3xl">
              The {competitor.name} Minimum Swap Problem
            </h2>
            <div className="space-y-4 font-body leading-relaxed text-muted-foreground">
              <p>
                <strong className="text-foreground">{competitor.name}</strong> enforces a minimum swap of{" "}
                <strong className="text-foreground">${competitor.min_swap_usd}</strong> per transaction.
                For users with small leftover balances — commonly known as <em>crypto dust</em> — this means
                their funds are effectively locked and inaccessible.
              </p>
              <p>
                The core issue: <strong className="text-foreground">{competitor.primary_weakness}</strong>.
                This leaves millions of wallets with stranded micro-balances that cannot be consolidated or converted.
              </p>
              <p>
                MRC Global Pay was purpose-built to solve this. With a <strong className="text-primary">$0.30 minimum</strong>,
                we process swaps that no other platform will touch. Our edge: <strong className="text-foreground">{competitor.mrc_advantage}</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: How To */}
        <section className="border-t border-border py-12 sm:py-20">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 className="mb-8 font-display text-2xl font-bold text-foreground sm:text-3xl">
              How to Swap Your Dust in 60 Seconds
            </h2>
            <div className="space-y-6">
              {[
                { step: "1", title: "Select Your Token Pair", desc: "Choose the token you want to send (e.g., leftover SHIB) and the token you want to receive (e.g., USDT). We support 6,000+ assets across all major chains." },
                { step: "2", title: "Enter Any Amount Above $0.30", desc: "Type the amount you want to swap. There's no upper limit and no minimum above $0.30. Our engine finds the best rate across aggregated liquidity pools." },
                { step: "3", title: "Paste Your Wallet & Confirm", desc: "Enter your destination wallet address and confirm. Settlement completes in under 60 seconds. No account, no email, no registration." },
              ].map((s) => (
                <div key={s.step} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary">
                    {s.step}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">{s.title}</h3>
                    <p className="mt-1 font-body text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-display text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Zap className="h-4 w-4" />
                Swap Now — From $0.30
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Section 4: FAQ */}
        <section className="border-t border-border bg-muted/20 py-12 sm:py-20">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 className="mb-8 font-display text-2xl font-bold text-foreground sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqItems.map((f, i) => (
                <details key={i} className="group rounded-xl border border-border bg-card p-5">
                  <summary className="cursor-pointer font-display text-sm font-bold text-foreground group-open:mb-3">
                    {f.q}
                  </summary>
                  <p className="font-body text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="border-t border-border py-8">
          <div className="container mx-auto flex flex-wrap items-center justify-center gap-4 px-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" /> Canadian Registered MSB
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
              Fireblocks Secured
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
              6,000+ Assets
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
              Non-Custodial
            </span>
          </div>
        </section>

        {/* Compare Others */}
        <section className="border-t border-border bg-muted/20 py-12">
          <div className="container mx-auto max-w-5xl px-4">
            <h2 className="mb-6 text-center font-display text-xl font-bold text-foreground">
              Compare Others
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {others.map((o) => (
                <a
                  key={o.slug}
                  href={`/compare/mrc-vs-${o.slug}`}
                  title={`Compare MRC Global Pay vs ${o.name}`}
                  className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <h3 className="font-display text-sm font-bold text-foreground">MRC vs {o.name}</h3>
                  <p className="mt-1 font-body text-xs text-muted-foreground">Min: ${o.min_swap_usd} · {o.fees}</p>
                </a>
              ))}
            </div>
            <p className="mt-6 text-center">
              <a href="/compare" className="font-body text-sm text-primary hover:underline">
                View all 50+ comparisons →
              </a>
            </p>
          </div>
        </section>

        {/* Sticky Mobile CTA */}
        <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur-sm lg:hidden">
          <a
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-display text-sm font-bold text-primary-foreground"
          >
            <Zap className="h-4 w-4" />
            Swap Now — From $0.30
          </a>
        </div>
      </main>

      <MsbTrustBar />
      <SiteFooter />
    </>
  );
};

export default ComparePage;
