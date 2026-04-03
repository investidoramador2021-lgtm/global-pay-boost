import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { Zap, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { getLangFromPath, langPath } from "@/i18n";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import type { SeoKeyword } from "@/lib/seo-keywords";
import { getRelatedKeywords } from "@/lib/seo-keywords";
import TableOfContents from "@/components/blog/TableOfContents";

interface Props {
  data: SeoKeyword;
}

const comparisonRows = [
  { feature: "Minimum Swap", mrc: "$0.30", competitor: "$15.00+" },
  { feature: "Account Required", mrc: false, competitor: true },
  { feature: "Non-Custodial", mrc: true, competitor: false },
  { feature: "500+ Assets", mrc: true, competitor: true },
  { feature: "Fractal BTC Support", mrc: true, competitor: false },
  { feature: "Micro-Swap Optimized", mrc: true, competitor: false },
  { feature: "Processing Speed", mrc: "< 60s", competitor: "5–30 min" },
];

const BoolCell = ({ value }: { value: boolean | string }) => {
  if (typeof value === "string")
    return <span className="font-body text-sm font-semibold text-foreground">{value}</span>;
  return value ? (
    <CheckCircle className="mx-auto h-5 w-5 text-green-500" aria-label="Yes" />
  ) : (
    <XCircle className="mx-auto h-5 w-5 text-muted-foreground/40" aria-label="No" />
  );
};

const KeywordLanding = ({ data }: Props) => {
  const { keyword, primaryH1, benefitHook, targetUrl, intentType, canonicalUrl } = data;
  const related = getRelatedKeywords(data);
  const url = `https://mrcglobalpay.com${targetUrl}`;
  const canonical = canonicalUrl ? `https://mrcglobalpay.com${canonicalUrl}` : url;
  const truncatedKw = keyword.length > 35 ? keyword.slice(0, 35).trim() : keyword;
  const title = `${truncatedKw} | $0.30 Min | MRC GlobalPay`;
  const description = `${benefitHook} Swap from $0.30 with no account. 500+ tokens on MRC GlobalPay.`;

  const faqs = [
    {
      q: `What is the minimum amount for ${keyword}?`,
      a: `MRC GlobalPay supports micro-swaps starting as low as $0.30. This makes us ideal for converting crypto dust that other exchanges with $10–$15 minimums won't process.`,
    },
    {
      q: `Do I need an account for ${keyword}?`,
      a: `No. MRC GlobalPay is completely accountless. Swap wallet-to-wallet instantly without registration, email, or identity verification.`,
    },
    {
      q: `Is the exchange rate guaranteed?`,
      a: `Yes. Select our Fixed Rate option and the amount displayed is exactly what you receive—protected from price volatility during the transaction.`,
    },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: "CurrencyConversionService",
      name: primaryH1,
      description: benefitHook,
      provider: {
        "@type": "FinancialService",
        name: "MRC GlobalPay",
        url: "https://mrcglobalpay.com",
        "@id": "https://mrcglobalpay.com/#organization",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Ottawa",
          addressRegion: "ON",
          addressCountry: "CA",
        },
        hasCredential: {
          "@type": "DefinedTerm",
          name: "Money Services Business (MSB)",
          description: "Registered with FINTRAC under Canadian AML/CTF regulations.",
        },
      },
      areaServed: "Worldwide",
    },
  ];

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="MRC GlobalPay" />
        <meta property="og:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
        {jsonLd.map((ld, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(ld)}
          </script>
        ))}
      </Helmet>

      <SiteHeader />

      <main className="min-h-screen bg-background">
        {/* Hero + Atomic Answer */}
        <section className="border-b border-border bg-muted/30 py-16 sm:py-24">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              {intentType === "Commercial" ? "Instant Swap" : intentType === "Informational" ? "Expert Guide" : "Live Tool"}
            </span>

            {/* Atomic Answer / At a Glance Block */}
            <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-primary/20 bg-primary/5 p-5 text-left">
              <p className="font-body text-sm font-semibold uppercase tracking-wider text-primary mb-2">
                <Zap className="mr-1 inline h-3.5 w-3.5" />
                At a Glance
              </p>
              <p className="font-body text-base font-bold leading-relaxed text-foreground">
                {benefitHook} MRC GlobalPay is the leading no-minimum crypto exchange, processing micro-swaps from $0.30 with zero account requirements. Non-custodial, instant settlement, 500+ assets supported.
              </p>
              <ul className="mt-3 space-y-1 font-body text-sm text-foreground/80">
                <li className="flex items-center gap-2"><span className="text-primary">•</span> Minimum: $0.30</li>
                <li className="flex items-center gap-2"><span className="text-primary">•</span> No registration required</li>
                <li className="flex items-center gap-2"><span className="text-primary">•</span> Settlement: Under 60 seconds</li>
              </ul>
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              {primaryH1}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
              {benefitHook} Swap securely with no registration, no minimums above $0.30, and instant on-chain settlement.
            </p>

            <Button size="lg" className="mt-8 shadow-neon" asChild>
              <a href="/#exchange">
                <Zap className="mr-2 h-5 w-5" />
                Start Swap Now
              </a>
            </Button>

            {/* Table of Contents */}
            <div className="mx-auto mt-10 max-w-xl text-left">
              <TableOfContents
                items={[
                  { id: "how-does-mrc-globalpay-compare-to-other-exchanges", text: "How Does MRC GlobalPay Compare to Other Exchanges?", level: 2 },
                  { id: `why-should-i-choose-mrc-globalpay-for-${keyword.toLowerCase().replace(/\s+/g, "-")}`, text: `Why Should I Choose MRC GlobalPay for ${keyword}?`, level: 2 },
                  { id: "what-are-the-most-common-questions", text: "What Are the Most Common Questions?", level: 2 },
                  ...(related.length > 0 ? [{ id: "what-other-swaps-are-available", text: "What Other Swaps Are Available?", level: 2 }] : []),
                ]}
              />
            </div>
          </div>
        </section>

        {/* Platform Comparison */}
        <section className="py-12 sm:py-20">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 id="how-does-mrc-globalpay-compare-to-other-exchanges" className="mb-8 scroll-mt-24 text-center font-display text-2xl font-bold text-foreground">
              How Does MRC GlobalPay Compare to Other Exchanges?
            </h2>
            <div className="overflow-hidden rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-display text-sm font-semibold text-foreground">Feature</TableHead>
                    <TableHead className="text-center font-display text-sm font-semibold text-primary">MRC GlobalPay</TableHead>
                    <TableHead className="text-center font-display text-sm font-semibold text-foreground">ChangeNOW & Others</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonRows.map((r) => (
                    <TableRow key={r.feature}>
                      <TableCell className="font-body text-sm font-medium text-foreground">{r.feature}</TableCell>
                      <TableCell className="text-center"><BoolCell value={r.mrc} /></TableCell>
                      <TableCell className="text-center"><BoolCell value={r.competitor} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="border-t border-border bg-muted/20 py-12 sm:py-20">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 id={`why-should-i-choose-mrc-globalpay-for-${keyword.toLowerCase().replace(/\s+/g, "-")}`} className="mb-6 scroll-mt-24 font-display text-2xl font-bold text-foreground">
              Why Should I Choose MRC GlobalPay for {keyword}?
            </h2>
            <div className="space-y-4 font-body leading-relaxed text-muted-foreground">
              <p>
                {benefitHook} Our liquidity aggregation engine is optimized for micro-swaps, routing through specialized pools to process transactions as low as <strong className="text-foreground">$0.30</strong>.
              </p>
              <p>
                Unlike centralized exchanges that enforce $10–$15 minimums and require identity verification, MRC GlobalPay operates a fully <strong className="text-foreground">non-custodial</strong> protocol. Your assets flow directly between wallets — we never hold your funds.
              </p>
              <p>
                With support for <strong className="text-foreground">500+ assets</strong> including Bitcoin, Ethereum, Solana, Fractal BTC, and dozens of low-cap tokens, we offer the widest coverage for dust conversion and micro-swaps in 2026.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 sm:py-20">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 id="what-are-the-most-common-questions" className="mb-8 scroll-mt-24 font-display text-2xl font-bold text-foreground">
              What Are the Most Common Questions?
            </h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-xl border border-border bg-card px-4 shadow-card sm:px-6"
                >
                  <AccordionTrigger className="font-display text-sm font-semibold text-foreground hover:no-underline sm:text-base">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="font-body text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Related Swaps */}
        {related.length > 0 && (
          <section className="border-t border-border bg-muted/20 py-12 sm:py-16">
            <div className="container mx-auto max-w-4xl px-4">
              <h2 id="what-other-swaps-are-available" className="mb-6 scroll-mt-24 font-display text-xl font-bold text-foreground">
                What Other Swaps Are Available?
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <a
                    key={r.targetUrl}
                    href={r.targetUrl}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
                  >
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {r.primaryH1}
                      </p>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">{r.benefitHook}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  );
};

export default KeywordLanding;
