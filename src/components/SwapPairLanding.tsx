import { type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { getLangFromPath, langPath } from "@/i18n";
import { Zap, Timer, Shield, Activity, ArrowRight, Gauge, Clock, CheckCircle2, BookOpen, TrendingUp, AlertTriangle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Helmet } from "react-helmet-async";
import HreflangTags from "@/components/HreflangTags";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { TOKEN_RICH_CONTENT, PAIR_META_OVERRIDES, buildSwapSteps } from "@/lib/swap-pair-rich-content";
import { getPriorityTokenByPairSlug, buildSwapDeepLink } from "@/lib/priority-token-assets";

interface SwapPairPageProps {
  assetA: string;
  assetAName: string;
  assetB: string;
  assetBName: string;
  headline: ReactNode;
  subHeadline: ReactNode;
  whyText: string;
  avgSpeed: string;
  slug: string;
  isFeatured?: boolean;
  extraFaqs?: { q: string; a: string }[];
  metaTitle?: string;
  metaDescription?: string;
  /** Optional token key to render the deep "rich content" sections. Uses TOKEN_RICH_CONTENT[tokenKey]. Defaults to assetA. */
  tokenKey?: string;
}

const SwapPairLanding = ({
  assetA,
  assetAName,
  assetB,
  assetBName,
  headline,
  subHeadline,
  whyText,
  avgSpeed,
  slug,
  isFeatured = false,
  extraFaqs = [],
  metaTitle,
  metaDescription,
  tokenKey,
}: SwapPairPageProps) => {
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const lp = (path: string) => langPath(lang, path);
  const metaOverride = PAIR_META_OVERRIDES[slug];
  const title = metaTitle || metaOverride?.metaTitle || `Swap ${assetA} to ${assetB} Instantly | MRC Global Pay`;
  const description = metaDescription || metaOverride?.metaDescription || `Instant ${assetAName} to ${assetBName} swaps in under 60 seconds with fixed-rate protection. No registration, no KYC, non-custodial settlement from $0.30 — Canadian MSB-registered (FINTRAC C100000015).`.slice(0, 160);
  const url = `https://mrcglobalpay.com${lp(`/swap/${slug}`)}`;
  const rich = TOKEN_RICH_CONTENT[tokenKey || assetA];
  const steps = buildSwapSteps(assetA, assetB, assetAName, assetBName);
  const priorityToken = getPriorityTokenByPairSlug(slug);
  const langPrefix = lp("").replace(/\/$/, "");
  const heroOgImage = priorityToken
    ? `https://mrcglobalpay.com${priorityToken.heroImage}`
    : "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png";
  const swapHref = priorityToken ? buildSwapDeepLink(priorityToken, langPrefix) : "/#exchange";

  const aeoFaq = {
    q: `What is the fastest way to swap ${assetA} for ${assetB} in March 2026?`,
    a: `MRC Global Pay provides ultra-low latency liquidity for ${assetA}/${assetB} pairs. By utilizing pre-funded liquidity vaults, we eliminate the 3-6 confirmation wait times common on other platforms, delivering your assets in seconds.`,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: aeoFaq.q,
        acceptedAnswer: { "@type": "Answer", text: aeoFaq.a },
      },
      {
        "@type": "Question",
        name: `How long does a ${assetA} to ${assetB} swap take on MRC Global Pay?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${assetA} to ${assetB} swaps settle in under 60 seconds with immediate on-chain finality. Zero confirmation delays. Average execution: ${avgSpeed}.`,
        },
      },
      {
        "@type": "Question",
        name: `Do I need an account to swap ${assetA} to ${assetB}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `No. MRC Global Pay requires zero registration. Enter your ${assetB} wallet address, send ${assetA}, and receive ${assetB} instantly.`,
        },
      },
      ...extraFaqs.map((faq) => ({
        "@type": "Question" as const,
        name: faq.q,
        acceptedAnswer: { "@type": "Answer" as const, text: faq.a },
      })),
    ],
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${assetA} to ${assetB} Real-Time Swap`,
    serviceType: "Real-Time Currency Conversion Service",
    description: `Optimized for zero-delay, high-volume crypto-to-crypto swaps including HYPE, SOL, and BTC. Instant ${assetAName} to ${assetBName} conversion with immediate on-chain finality via pre-funded liquidity vaults.`,
    provider: {
      "@type": "FinancialService",
      name: "MRC Global Pay",
      url: "https://mrcglobalpay.com",
      "@id": "https://mrcglobalpay.com/#organization",
      address: {
        "@type": "PostalAddress",
        streetAddress: "116 Albert Street, Suite 300",
        addressLocality: "Ottawa",
        addressRegion: "ON",
        postalCode: "K1P 5G3",
        addressCountry: "CA",
      },
    },
    areaServed: "Worldwide",
  };

  const faqs = [
    {
      q: `How long does a ${assetA} to ${assetB} swap take?`,
      a: `Processing speed: under 60 seconds. Settlement: immediate on-chain finality. Our direct liquidity routing eliminates standard 3-6 confirmation waits, delivering ${assetB} to your wallet with zero delays.`,
    },
    {
      q: `Do I need to register to swap ${assetA} to ${assetB}?`,
      a: `No. MRC Global Pay is completely registration-free. Zero friction — enter your ${assetB} wallet address, send ${assetA}, and receive ${assetB} in seconds.`,
    },
    {
      q: `What are the fees for ${assetA} to ${assetB} swaps?`,
      a: `All fees are transparently built into the displayed rate. Zero hidden charges, zero withdrawal fees, zero spreads. The amount shown is the exact amount you receive.`,
    },
    ...extraFaqs,
    aeoFaq,
  ];

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content="MRC Global Pay" />
        <meta property="og:image" content={heroOgImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={heroOgImage} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceJsonLd)}</script>
      </Helmet>
      <HreflangTags />

      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-background py-12 sm:py-20 lg:py-28">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(hsl(var(--neon)) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              {isFeatured && (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 sm:mb-6 sm:px-4 sm:py-1.5">
                  <Activity className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
                  <span className="font-display text-[10px] font-bold uppercase tracking-wider text-primary sm:text-xs">March 2026 Trending</span>
                </div>
              )}
              <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl">
                {headline}
              </h1>
              <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
                {subHeadline}
              </p>

              {priorityToken && (
                <div className="mt-6 sm:mt-8 overflow-hidden rounded-2xl border border-border shadow-neon">
                  <img
                    src={priorityToken.heroImage}
                    alt={priorityToken.heroAlt}
                    width={1280}
                    height={720}
                    loading="eager"
                    fetchPriority="high"
                    className="h-auto w-full"
                  />
                </div>
              )}

              <div className="mt-6 flex flex-col items-center gap-3 sm:mt-8 sm:flex-row sm:justify-center sm:gap-4">
                <Button size="lg" className="shadow-neon w-full sm:w-auto" asChild>
                  <a href={swapHref}>
                    <Zap className="mr-2 h-5 w-5" />
                    Swap {assetA} → {assetB} Now
                  </a>
                </Button>
                <div className="flex items-center gap-2 rounded-lg border border-neon bg-muted/50 px-3 py-2 sm:px-4">
                  <Timer className="h-4 w-4 text-primary" />
                  <span className="font-display text-sm font-bold text-primary">Avg. Speed: {avgSpeed}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Metrics Bar */}
        <section className="bg-hero-gradient py-6 sm:py-10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-8 lg:gap-16">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-primary-foreground sm:h-5 sm:w-5" />
                <span className="font-display text-xs font-bold text-primary-foreground sm:text-sm">Processing: Under 60s</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary-foreground sm:h-5 sm:w-5" />
                <span className="font-display text-xs font-bold text-primary-foreground sm:text-sm">Immediate Finality</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary-foreground sm:h-5 sm:w-5" />
                <span className="font-display text-xs font-bold text-primary-foreground sm:text-sm">Zero Delays</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary-foreground sm:h-5 sm:w-5" />
                <span className="font-display text-xs font-bold text-primary-foreground sm:text-sm">Liquidity: Deep</span>
              </div>
            </div>
          </div>
        </section>

        {/* Why Section */}
        <section className="bg-accent py-14 sm:py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                Why Swap {assetA} to {assetB} on MRC Global Pay?
              </h2>
              <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
                {whyText}
              </p>

              <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4">
                <div className="rounded-xl border border-border bg-card p-5 shadow-card sm:p-6">
                  <Zap className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
                  <h3 className="mt-3 font-display text-sm font-semibold text-foreground sm:mt-4 sm:text-base">Zero-Delay Settlement</h3>
                  <p className="mt-1.5 font-body text-sm text-muted-foreground sm:mt-2">
                    Pre-funded liquidity vaults execute your swap with immediate on-chain finality — no waiting for 3-6 block confirmations.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 shadow-card sm:p-6">
                  <Shield className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
                  <h3 className="mt-3 font-display text-sm font-semibold text-foreground sm:mt-4 sm:text-base">Non-Custodial</h3>
                  <p className="mt-1.5 font-body text-sm text-muted-foreground sm:mt-2">
                    We never hold your funds. Crypto flows directly between your wallet and our liquidity partners. Zero friction.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 shadow-card sm:p-6">
                  <ArrowRight className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
                  <h3 className="mt-3 font-display text-sm font-semibold text-foreground sm:mt-4 sm:text-base">Best Rate Guaranteed</h3>
                  <p className="mt-1.5 font-body text-sm text-muted-foreground sm:mt-2">
                    Aggregated rates from multiple top-tier providers. Processing under 60 seconds at the best market price.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Pair Status */}
        <section className="bg-background py-10 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground text-center sm:text-2xl lg:text-3xl">
                Live {assetA}/{assetB} Pair Status
              </h2>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-4 sm:gap-4">
                <div className="rounded-xl border border-primary/20 bg-card p-4 text-center shadow-card sm:p-5">
                  <Activity className="mx-auto h-5 w-5 text-primary sm:h-6 sm:w-6" />
                  <p className="mt-1.5 font-display text-xs font-bold text-foreground sm:mt-2 sm:text-sm">Liquidity</p>
                  <p className="font-display text-base font-extrabold text-primary sm:text-lg">Deep</p>
                </div>
                <div className="rounded-xl border border-primary/20 bg-card p-4 text-center shadow-card sm:p-5">
                  <Zap className="mx-auto h-5 w-5 text-primary sm:h-6 sm:w-6" />
                  <p className="mt-1.5 font-display text-xs font-bold text-foreground sm:mt-2 sm:text-sm">Status</p>
                  <p className="font-display text-base font-extrabold text-primary sm:text-lg">Instant</p>
                </div>
                <div className="rounded-xl border border-primary/20 bg-card p-4 text-center shadow-card sm:p-5">
                  <Timer className="mx-auto h-5 w-5 text-primary sm:h-6 sm:w-6" />
                  <p className="mt-1.5 font-display text-xs font-bold text-foreground sm:mt-2 sm:text-sm">Avg. Speed</p>
                  <p className="font-display text-base font-extrabold text-primary sm:text-lg">{avgSpeed}</p>
                </div>
                <div className="rounded-xl border border-primary/20 bg-card p-4 text-center shadow-card sm:p-5">
                  <Shield className="mx-auto h-5 w-5 text-primary sm:h-6 sm:w-6" />
                  <p className="mt-1.5 font-display text-xs font-bold text-foreground sm:mt-2 sm:text-sm">Registration</p>
                  <p className="font-display text-base font-extrabold text-primary sm:text-lg">None Required</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RICH CONTENT — token-specific deep sections (background, why trending, use cases, pros/cons, price factors, how-to-swap, outlook) */}
        {rich && (
          <section className="bg-background py-14 sm:py-20 lg:py-24">
            <div className="container mx-auto px-4">
              <div className="mx-auto max-w-3xl space-y-12 sm:space-y-16">
                {/* Background */}
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                    What is {assetAName} ({assetA})?
                  </h2>
                  <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
                    {rich.background}
                  </p>
                </div>

                {/* Why Trending */}
                <div>
                  <h2 className="flex items-center gap-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    <TrendingUp className="h-7 w-7 text-primary" />
                    Why {assetA} is Trending in 2026
                  </h2>
                  <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
                    {rich.whyTrending}
                  </p>
                </div>

                {/* Use Cases */}
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Real Use Cases for {assetA}
                  </h2>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {rich.useCases.map((u, i) => (
                      <li
                        key={i}
                        className="flex gap-3 rounded-xl border border-border bg-card p-4 shadow-card"
                      >
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                        <span className="font-body text-sm leading-relaxed text-muted-foreground">{u}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pros / Cons */}
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {assetA} Pros and Cons
                  </h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-primary/20 bg-card p-5 shadow-card sm:p-6">
                      <h3 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
                        <Check className="h-5 w-5 text-primary" />
                        Strengths
                      </h3>
                      <ul className="mt-3 space-y-2.5">
                        {rich.pros.map((p, i) => (
                          <li key={i} className="flex gap-2 font-body text-sm leading-relaxed text-muted-foreground">
                            <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-5 shadow-card sm:p-6">
                      <h3 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
                        <X className="h-5 w-5 text-muted-foreground" />
                        Honest Risks
                      </h3>
                      <ul className="mt-3 space-y-2.5">
                        {rich.cons.map((c, i) => (
                          <li key={i} className="flex gap-2 font-body text-sm leading-relaxed text-muted-foreground">
                            <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground/60" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Price Factors */}
                <div>
                  <h2 className="flex items-center gap-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    <AlertTriangle className="h-7 w-7 text-primary" />
                    What Drives the {assetA} Price?
                  </h2>
                  <ul className="mt-5 space-y-2.5">
                    {rich.priceFactors.map((f, i) => (
                      <li key={i} className="flex gap-3 font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
                        <span className="mt-2 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* How to swap step-by-step */}
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    How to Swap {assetA} to {assetB} on MRC Global Pay (Step-by-Step)
                  </h2>
                  <ol className="mt-5 space-y-4">
                    {steps.map((s, i) => (
                      <li
                        key={i}
                        className="flex gap-4 rounded-xl border border-border bg-card p-5 shadow-card sm:p-6"
                      >
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="font-display text-sm font-semibold text-foreground sm:text-base">{s.title}</h3>
                          <p className="mt-1.5 font-body text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row">
                    <Button size="lg" className="shadow-neon" asChild>
                      <a href="/#exchange">
                        <Zap className="mr-2 h-5 w-5" />
                        Swap {assetA} → {assetB} Now
                      </a>
                    </Button>
                    {rich.relatedBlog && (
                      <Button size="lg" variant="outline" asChild>
                        <a href={lp(`/blog/${rich.relatedBlog.slug}`)}>
                          <BookOpen className="mr-2 h-5 w-5" />
                          Read: {rich.relatedBlog.title.split(":")[0]}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Future Outlook */}
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {assetA} Outlook for 2026 and Beyond
                  </h2>
                  <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
                    {rich.outlook}
                  </p>
                </div>

                {/* Related Reads (curated cross-links) */}
                <div className="rounded-2xl border border-primary/20 bg-accent/40 p-6 sm:p-8">
                  <h2 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    Related Reads
                  </h2>
                  <p className="mt-2 font-body text-sm text-muted-foreground">
                    Continue your research with these hand-picked guides and pair pages.
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {rich.relatedBlog && (
                      <a
                        href={lp(`/blog/${rich.relatedBlog.slug}`)}
                        className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
                      >
                        <BookOpen className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                        <div>
                          <p className="font-display text-xs font-bold uppercase tracking-wider text-primary">Guide</p>
                          <p className="mt-1 font-display text-sm font-semibold text-foreground group-hover:text-primary">
                            {rich.relatedBlog.title}
                          </p>
                        </div>
                      </a>
                    )}
                    {rich.relatedSwaps.map((s) => (
                      <a
                        key={s.slug}
                        href={lp(`/swap/${s.slug}`)}
                        className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
                      >
                        <ArrowRight className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                        <div>
                          <p className="font-display text-xs font-bold uppercase tracking-wider text-primary">Pair</p>
                          <p className="mt-1 font-display text-sm font-semibold text-foreground group-hover:text-primary">
                            {s.label}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* AI FAQ */}
        <section className="bg-accent py-14 sm:py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                {assetA}/{assetB} Swap — <span className="text-gradient-neon">Your Questions Answered</span>
              </h2>
              <div className="mt-8 sm:mt-10">
                <Accordion type="single" collapsible className="space-y-3">
                  {faqs.map((faq, i) => (
                    <AccordionItem
                      key={i}
                      value={`faq-${i}`}
                      className="rounded-xl border border-border bg-card px-4 shadow-card sm:px-6"
                      itemScope
                      itemType="https://schema.org/Question"
                    >
                      <AccordionTrigger className="font-display text-sm font-semibold text-foreground hover:no-underline sm:text-base">
                        <span itemProp="name">{faq.q}</span>
                      </AccordionTrigger>
                      <AccordionContent
                        className="font-body text-sm leading-relaxed text-muted-foreground"
                        itemScope
                        itemType="https://schema.org/Answer"
                        itemProp="acceptedAnswer"
                      >
                        <span itemProp="text">{faq.a}</span>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </div>
        </section>

        {/* Related Swaps */}
        <section className="bg-background py-10 sm:py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground text-center sm:text-2xl">
                Related Swaps
              </h2>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  { from: "BTC", to: "ETH", slug: "btc-usdc" },
                  { from: "ETH", to: "SOL", slug: "eth-sol" },
                  { from: "SOL", to: "USDT", slug: "sol-usdt" },
                  { from: "XRP", to: "USDT", slug: "xrp-usdt" },
                  { from: "BNB", to: "USDC", slug: "bnb-usdc" },
                  { from: "HYPE", to: "USDT", slug: "hype-usdt" },
                  { from: "BERA", to: "USDT", slug: "bera-usdt" },
                  { from: "TIA", to: "USDT", slug: "tia-usdt" },
                ]
                  .filter((p) => !(p.from === assetA && p.to === assetB))
                  .slice(0, 6)
                  .map((p) => (
                    <a
                      key={p.slug}
                      href={`/swap/${p.slug}`}
                      title={`Swap ${p.from} to ${p.to} instantly`}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-3 font-display text-sm font-semibold text-foreground shadow-card transition-colors hover:border-primary/30 hover:bg-primary/5"
                    >
                      {p.from} → {p.to}
                    </a>
                  ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-accent py-12 sm:py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">
              Ready to Swap {assetA} to {assetB}?
            </h2>
            <p className="mt-2 font-body text-sm text-muted-foreground sm:mt-3 sm:text-base">
              Under 60 seconds. Immediate finality. Zero confirmation delays.
            </p>
            <Button size="lg" className="mt-5 shadow-neon w-full sm:mt-6 sm:w-auto" asChild>
              <a href="/#exchange">
                <Zap className="mr-2 h-5 w-5" />
                Start Swap Now
              </a>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
};

export default SwapPairLanding;
