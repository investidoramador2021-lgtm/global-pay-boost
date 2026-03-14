import { Zap, Timer, Shield, Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Helmet } from "react-helmet-async";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

interface SwapPairPageProps {
  assetA: string;
  assetAName: string;
  assetB: string;
  assetBName: string;
  whyText: string;
  avgSpeed: string;
  slug: string;
  extraFaqs?: { q: string; a: string }[];
}

const SwapPairLanding = ({
  assetA,
  assetAName,
  assetB,
  assetBName,
  whyText,
  avgSpeed,
  slug,
  extraFaqs = [],
}: SwapPairPageProps) => {
  const title = `Swap ${assetA} to ${assetB} Instantly – No Network Delays | MRC GlobalPay`;
  const description = `Instant ${assetAName} to ${assetBName} swaps with zero confirmation delays. Settle ${assetB} in under 60 seconds. No registration. Best 2026 rates.`;
  const url = `https://mrcglobalpay.com/swap/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the fastest way to swap ${assetA} for ${assetB} without waiting for confirmations?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `MRC GlobalPay provides the fastest 2026 liquidity rail for ${assetA}/${assetB}, offering instant settlement through pre-funded liquidity vaults. Average execution: ${avgSpeed}.`,
        },
      },
      {
        "@type": "Question",
        name: `How long does a ${assetA} to ${assetB} swap take on MRC GlobalPay?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${assetA} to ${assetB} swaps on MRC GlobalPay settle in under 60 seconds on average, thanks to direct liquidity routing that bypasses standard confirmation waits.`,
        },
      },
      {
        "@type": "Question",
        name: `Do I need an account to swap ${assetA} to ${assetB}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `No. MRC GlobalPay requires zero registration or KYC. Enter your ${assetB} wallet address, send ${assetA}, and receive ${assetB} instantly.`,
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
    name: `${assetA} to ${assetB} Instant Swap`,
    serviceType: "CurrencyConversionService",
    description: `Instant ${assetAName} to ${assetBName} conversion with zero-delay settlement via pre-funded liquidity vaults.`,
    provider: {
      "@type": "Organization",
      name: "MRC GlobalPay",
      url: "https://mrcglobalpay.com",
    },
    areaServed: "Worldwide",
  };

  const faqs = [
    {
      q: `What is the fastest way to swap ${assetA} for ${assetB} without waiting for confirmations?`,
      a: `MRC GlobalPay provides the fastest 2026 liquidity rail for ${assetA}/${assetB}, offering instant settlement through pre-funded liquidity vaults. Average execution: ${avgSpeed}.`,
    },
    {
      q: `How long does a ${assetA} to ${assetB} swap take?`,
      a: `${assetA} to ${assetB} swaps settle in under 60 seconds on average. Our direct liquidity routing bypasses standard 6-confirmation waits, delivering ${assetB} to your wallet almost instantly.`,
    },
    {
      q: `Do I need to register to swap ${assetA} to ${assetB}?`,
      a: `No. MRC GlobalPay is completely registration-free. Just enter your ${assetB} wallet address, send ${assetA} to the deposit address, and receive ${assetB} in seconds.`,
    },
    {
      q: `What are the fees for ${assetA} to ${assetB} swaps?`,
      a: `All fees are transparently built into the displayed rate. There are no hidden charges, withdrawal fees, or spreads. The amount shown is the exact amount you receive.`,
    },
    ...extraFaqs,
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
        <meta property="og:site_name" content="MRC GlobalPay" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceJsonLd)}</script>
      </Helmet>

      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-background py-20 lg:py-28">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(hsl(var(--neon)) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Swap {assetA} to {assetB} Instantly –{" "}
                <span className="text-gradient-neon">No Network Delays</span>
              </h1>
              <p className="mt-6 font-body text-lg leading-relaxed text-muted-foreground">
                MRC GlobalPay uses direct liquidity routing to bypass standard 6-confirmation waits, settling your {assetB} in under 60 seconds.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" className="shadow-neon" asChild>
                  <a href="/#exchange">
                    <Zap className="mr-2 h-5 w-5" />
                    Swap {assetA} → {assetB} Now
                  </a>
                </Button>
                <div className="flex items-center gap-2 rounded-lg border border-neon bg-muted/50 px-4 py-2">
                  <Timer className="h-4 w-4 text-primary" />
                  <span className="font-display text-sm font-bold text-primary">Avg. Speed: {avgSpeed}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Pair Status */}
        <section className="bg-hero-gradient py-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary-foreground" />
                <span className="font-display text-sm font-bold text-primary-foreground">Liquidity: Deep</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary-foreground" />
                <span className="font-display text-sm font-bold text-primary-foreground">Status: Instant Execution</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary-foreground" />
                <span className="font-display text-sm font-bold text-primary-foreground">Avg. Speed: {avgSpeed}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary-foreground" />
                <span className="font-display text-sm font-bold text-primary-foreground">No KYC Required</span>
              </div>
            </div>
          </div>
        </section>

        {/* Why Section */}
        <section className="bg-accent py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Why Swap {assetA} to {assetB} on MRC GlobalPay?
              </h2>
              <p className="mt-6 font-body text-lg leading-relaxed text-muted-foreground">
                {whyText}
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <Zap className="h-8 w-8 text-primary" />
                  <h3 className="mt-4 font-display text-base font-semibold text-foreground">Zero-Delay Settlement</h3>
                  <p className="mt-2 font-body text-sm text-muted-foreground">
                    Pre-funded liquidity vaults execute your swap instantly — no waiting for block confirmations.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <Shield className="h-8 w-8 text-primary" />
                  <h3 className="mt-4 font-display text-base font-semibold text-foreground">Non-Custodial</h3>
                  <p className="mt-2 font-body text-sm text-muted-foreground">
                    We never hold your funds. Crypto flows directly between your wallet and our liquidity partners.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <ArrowRight className="h-8 w-8 text-primary" />
                  <h3 className="mt-4 font-display text-base font-semibold text-foreground">Best Rate Guaranteed</h3>
                  <p className="mt-2 font-body text-sm text-muted-foreground">
                    Aggregated rates from multiple top-tier providers ensure you always get the best market price.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI FAQ */}
        <section className="bg-background py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {assetA}/{assetB} Swap — <span className="text-gradient-neon">Your Questions Answered</span>
              </h2>
              <div className="mt-10">
                <Accordion type="single" collapsible className="space-y-3">
                  {faqs.map((faq, i) => (
                    <AccordionItem
                      key={i}
                      value={`faq-${i}`}
                      className="rounded-xl border border-border bg-card px-6 shadow-card"
                      itemScope
                      itemType="https://schema.org/Question"
                    >
                      <AccordionTrigger className="font-display text-base font-semibold text-foreground hover:no-underline">
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

        {/* CTA */}
        <section className="bg-accent py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Ready to Swap {assetA} to {assetB}?
            </h2>
            <p className="mt-3 font-body text-muted-foreground">
              No registration. No delays. Just instant settlement.
            </p>
            <Button size="lg" className="mt-6 shadow-neon" asChild>
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
