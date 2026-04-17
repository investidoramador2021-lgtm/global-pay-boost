import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { getLangFromPath, langPath } from "@/i18n";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Zap, Shield, Clock, ArrowRight, Download, CheckCircle2, AlertTriangle, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

const FINTRAC_URL =
  "https://www10.fintrac-canafe.gc.ca/msb-esm/public/detailed-information/bns-new/7b226d7362526567697374726174696f6e4e756d626572223a224d3233323235363338227d";

const CryptoDustManifesto = () => {
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const lp = (path: string) => langPath(lang, path);
  const canonical = `https://mrcglobalpay.com${lp("/guide/crypto-dust")}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "The 2026 Liquidity Manifesto: Architectures for Micro-Asset Recovery",
    description:
      "A strategic framework for non-custodial dust conversion and cross-chain settlement by MRC Global Pay, a registered Canadian MSB.",
    url: canonical,
    datePublished: "2026-04-01T00:00:00Z",
    dateModified: "2026-04-11T00:00:00Z",
    author: {
      "@type": "Organization",
      name: "MRC Global Pay",
      url: "https://mrcglobalpay.com",
    },
    publisher: {
      "@type": "Organization",
      name: "MRC Global Pay",
      url: "https://mrcglobalpay.com",
    },
    mainEntityOfPage: canonical,
    keywords: [
      "crypto dust",
      "micro-asset recovery",
      "non-custodial swap",
      "cross-chain settlement",
      "dust conversion",
      "registered MSB",
    ],
  };

  return (
    <>
      <Helmet>
        <title>The Master Guide to Crypto Dust Recovery | MRC GlobalPay</title>
        <meta
          name="description"
          content="Strategic framework for non-custodial crypto dust conversion and cross-chain settlement. Convert assets from $0.30. 6,000+ tokens. No registration. FINTRAC-registered MSB."
        />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="The Master Guide to Crypto Dust Recovery | MRC GlobalPay" />
        <meta property="og:description" content="Convert crypto dust from $0.30 — no registration, 6,000+ assets, under 60 seconds." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonical} />
        <meta property="og:site_name" content="MRC GlobalPay" />
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
      </Helmet>

      <SiteHeader />

      <main className="bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(hsl(var(--neon)) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
                <Layers className="h-4 w-4 text-primary" />
                <span className="font-display text-xs font-bold uppercase tracking-wider text-primary">
                  Whitepaper — April 2026
                </span>
              </div>

              <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                The 2026 Liquidity Manifesto
              </h1>
              <p className="mt-2 font-display text-lg font-semibold text-primary sm:text-xl">
                Architectures for Micro-Asset Recovery
              </p>
              <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
                A Strategic Framework for Non-Custodial Dust Conversion and Cross-Chain Settlement
              </p>
              <p className="mt-2 font-body text-sm text-muted-foreground">
                MRC Global Pay — Registered Canadian MSB (M23225638)
              </p>

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button size="lg" className="shadow-neon w-full sm:w-auto" asChild>
                  <a href="/#exchange">
                    <Zap className="mr-2 h-5 w-5" />
                    Start Dust Recovery
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" disabled>
                  <Download className="mr-2 h-5 w-5" />
                  Download PDF (Coming Soon)
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="border-y border-border bg-accent py-8">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl">
              <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-foreground/60">
                Table of Contents
              </h2>
              <nav className="space-y-2">
                {[
                  { id: "executive-summary", label: "1. Executive Summary" },
                  { id: "the-problem", label: "2. The Problem: The Micro-Asset Liquidity Gap" },
                  { id: "the-solution", label: "3. The Solution: MRC Global Pay Architecture" },
                  { id: "technical-specifications", label: "4. Technical Specifications & Compliance" },
                  { id: "operational-flow", label: "5. Operational Flow: Three-Step Settlement" },
                  { id: "conclusion", label: "6. Conclusion" },
                ].map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block font-body text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="container mx-auto px-4 py-14 sm:py-20">
          <article className="mx-auto max-w-3xl space-y-16">

            {/* 1. Executive Summary */}
            <section id="executive-summary">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                1. Executive Summary
              </h2>
              <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
                In the decentralized economy, "Crypto Dust" — assets below the minimum transaction
                threshold of major exchanges — represents a multi-billion dollar liquidity trap.
                This whitepaper outlines the technical and economic barriers to micro-asset recovery
                and introduces the <strong className="text-foreground">MRC Global Pay Settlement Rail</strong>,
                a non-custodial framework allowing for the frictionless conversion of assets starting
                at <strong className="text-foreground">$0.30 USD</strong>.
              </p>
            </section>

            {/* 2. The Problem */}
            <section id="the-problem">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                2. The Problem: The Micro-Asset Liquidity Gap
              </h2>
              <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
                Traditional CEXs (Centralized Exchanges) and many DEXs enforce "Minimum Order Quantities"
                that effectively confiscate small balances. Three critical barriers prevent recovery:
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                  <h3 className="mt-3 font-display text-sm font-semibold text-foreground">
                    The Threshold Barrier
                  </h3>
                  <p className="mt-1.5 font-body text-sm text-muted-foreground">
                    Most platforms require $10–$20 minimums, locking out micro-balances entirely.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                  <Shield className="h-6 w-6 text-destructive" />
                  <h3 className="mt-3 font-display text-sm font-semibold text-foreground">
                    Onboarding Friction
                  </h3>
                  <p className="mt-1.5 font-body text-sm text-muted-foreground">
                    Forced KYC and registration for small swaps discourages "wallet cleaning."
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                  <Layers className="h-6 w-6 text-destructive" />
                  <h3 className="mt-3 font-display text-sm font-semibold text-foreground">
                    Network Congestion
                  </h3>
                  <p className="mt-1.5 font-body text-sm text-muted-foreground">
                    High gas fees on Layer 1 chains often exceed the value of the dust itself.
                  </p>
                </div>
              </div>
            </section>

            {/* 3. The Solution */}
            <section id="the-solution">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                3. The Solution: MRC Global Pay Architecture
              </h2>
              <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
                Our platform utilizes a <strong className="text-foreground">Multi-Source Liquidity Aggregator</strong>{" "}
                designed specifically for high-velocity, low-volume settlement.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  {
                    icon: <Shield className="h-6 w-6 text-primary" />,
                    title: "Non-Custodial Protocol",
                    text: "Users maintain 100% control of their private keys; MRC Global Pay never holds user funds.",
                  },
                  {
                    icon: <Zap className="h-6 w-6 text-primary" />,
                    title: "The $0.30 Floor",
                    text: "By aggregating over 700 liquidity sources, we provide the lowest settlement floor in the industry.",
                  },
                  {
                    icon: <ArrowRight className="h-6 w-6 text-primary" />,
                    title: "Cross-Chain Interoperability",
                    text: "Support for 6,000+ assets across Bitcoin, Solana, EVM, and emerging chains like Fractal Bitcoin.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 rounded-xl border border-border bg-card p-5 shadow-card">
                    <div className="shrink-0">{item.icon}</div>
                    <div>
                      <h3 className="font-display text-sm font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-1 font-body text-sm text-muted-foreground">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA after Section 3 */}
              <div className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center sm:p-8">
                <h3 className="font-display text-lg font-bold text-foreground sm:text-xl">
                  Ready to Recover Your Dust?
                </h3>
                <p className="mt-2 font-body text-sm text-muted-foreground">
                  Convert micro-balances from $0.30. No registration. Under 60 seconds.
                </p>
                <Button size="lg" className="mt-5 shadow-neon" asChild>
                  <a href="/#exchange">
                    <Zap className="mr-2 h-5 w-5" />
                    Start Dust Recovery Now
                  </a>
                </Button>
              </div>

              {/* Comparison Table */}
              <div className="mt-10">
                <h3 className="mb-4 font-display text-lg font-bold text-foreground sm:text-xl">
                  How Does MRC Global Pay Compare?
                </h3>
                <div className="overflow-x-auto rounded-xl border border-border shadow-card">
                  <table className="w-full font-body text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted">
                        <th className="px-4 py-3 text-left font-display font-semibold text-foreground">Feature</th>
                        <th className="px-4 py-3 text-left font-display font-semibold text-primary">MRC GlobalPay</th>
                        <th className="px-4 py-3 text-left font-display font-semibold text-muted-foreground">Typical Exchange</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[
                        ["Minimum Swap", "$0.30", "$10.00 – $20.00"],
                        ["Registration Required", "None", "Full KYC"],
                        ["Custody Model", "Non-Custodial", "Custodial"],
                        ["Settlement Speed", "< 60 seconds", "5 – 30 minutes"],
                        ["Supported Assets", "500+", "50 – 200"],
                        ["Cross-Chain Support", "50+ blockchains", "Limited"],
                        ["Regulatory Status", "FINTRAC MSB (Canada)", "Varies"],
                      ].map(([feature, mrc, typical]) => (
                        <tr key={feature} className="bg-card">
                          <td className="px-4 py-3 font-medium text-foreground">{feature}</td>
                          <td className="px-4 py-3 text-primary font-semibold">{mrc}</td>
                          <td className="px-4 py-3 text-muted-foreground">{typical}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 4. Technical Specifications */}
            <section id="technical-specifications">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                4. Technical Specifications & Compliance
              </h2>
              <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
                As a{" "}
                <a
                  href={lp("/compliance")}
                  className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary/70"
                >
                  Registered Canadian Money Services Business (MSB)
                </a>
                , MRC Global Pay operates under the regulatory oversight of FINTRAC.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <h3 className="mt-3 font-display text-sm font-semibold text-foreground">Security</h3>
                  <p className="mt-1.5 font-body text-sm text-muted-foreground">
                    Integration with Fireblocks and ChangeNOW ensures institutional-grade security for every swap.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                  <Shield className="h-6 w-6 text-primary" />
                  <h3 className="mt-3 font-display text-sm font-semibold text-foreground">Compliance</h3>
                  <p className="mt-1.5 font-body text-sm text-muted-foreground">
                    Fully compliant with the Proceeds of Crime (Money Laundering) and Terrorist Financing Act (PCMLTFA).
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-card">
                <h3 className="font-display text-sm font-semibold text-foreground">API for Automated Recovery</h3>
                <p className="mt-1.5 font-body text-sm text-muted-foreground">
                  Our{" "}
                  <a href={lp("/developers")} className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary/70">
                    REST API
                  </a>{" "}
                  allows for the programmatic "sweeping" of dormant wallet balances for institutional and retail users.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={lp("/compliance")}
                  className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2 font-display text-sm font-bold text-primary transition-colors hover:bg-primary/20"
                >
                  <Shield className="h-4 w-4" />
                  View MSB Registration
                </a>
                <a
                  href={FINTRAC_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2 font-display text-sm font-bold text-foreground transition-colors hover:bg-accent"
                >
                  Verify on FINTRAC →
                </a>
              </div>
            </section>

            {/* 5. Operational Flow */}
            <section id="operational-flow">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                5. Operational Flow: Three-Step Settlement
              </h2>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  {
                    step: "01",
                    title: "Pair Selection",
                    text: 'Select your "Dust Asset" and target "Settlement Asset" (e.g., PEPE → SOL).',
                    icon: <ArrowRight className="h-6 w-6" />,
                  },
                  {
                    step: "02",
                    title: "Instant Quote",
                    text: "Real-time rate calculation with zero hidden fees. The amount shown is what you receive.",
                    icon: <Clock className="h-6 w-6" />,
                  },
                  {
                    step: "03",
                    title: "Automated Execution",
                    text: "Transaction completes in under 60 seconds with immediate on-chain finality.",
                    icon: <Zap className="h-6 w-6" />,
                  },
                ].map((s) => (
                  <div key={s.step} className="rounded-xl border border-primary/20 bg-card p-5 text-center shadow-card">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
                      {s.step}
                    </div>
                    <h3 className="mt-3 font-display text-sm font-semibold text-foreground">{s.title}</h3>
                    <p className="mt-1.5 font-body text-sm text-muted-foreground">{s.text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. Conclusion */}
            <section id="conclusion">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                6. Conclusion
              </h2>
              <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
                MRC Global Pay is not merely a swap tool; it is a vital utility for the Web3 ecosystem.
                By lowering the barrier to entry to $0.30, we return trapped value to users and provide
                a cleaner, more efficient digital asset landscape.
              </p>

              <div className="mt-8 rounded-2xl bg-hero-gradient p-6 text-center text-primary-foreground sm:p-10">
                <h3 className="font-display text-xl font-bold sm:text-2xl">
                  Recover Your Crypto Dust Today
                </h3>
                <p className="mt-2 font-body text-sm text-primary-foreground/80">
                  No registration. No minimums above $0.30. Under 60 seconds.
                </p>
                <Button size="lg" variant="secondary" className="mt-5" asChild>
                  <a href="/#exchange">
                    <Zap className="mr-2 h-5 w-5" />
                    Launch Swap Widget
                  </a>
                </Button>
              </div>
            </section>
          </article>
        </div>
      </main>

      <SiteFooter />
    </>
  );
};

export default CryptoDustManifesto;
