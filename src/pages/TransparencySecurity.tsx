import { Helmet } from "react-helmet-async";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ShadowSeoFaq from "@/components/ShadowSeoFaq";
import { Link } from "react-router-dom";
import { Shield, Lock, Globe, CheckCircle, ExternalLink } from "lucide-react";
import { usePageUrl } from "@/hooks/use-page-url";

const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Transparency & Security | MRC GlobalPay",
  description:
    "Canadian MSB-compliant, non-custodial crypto swap platform. Learn about our security practices, liquidity partnerships, and audit status.",
  url: "https://mrcglobalpay.com/transparency-security",
  publisher: {
    "@type": "Organization",
    name: "MRC GlobalPay",
    url: "https://mrcglobalpay.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ottawa",
      addressCountry: "CA",
    },
  },
  datePublished: "2026-03-01",
  dateModified: "2026-03-20",
};

const financialServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  name: "MRC GlobalPay",
  url: "https://mrcglobalpay.com",
  parentOrganization: {
    "@type": "Organization",
    name: "MRC Pay International Corp",
  },
  areaServed: "Global",
  description:
    "Registered Canadian Money Services Business (MSB) specializing in non-custodial crypto settlement and foreign exchange.",
  identifier: "C100000015",
  knowsAbout: [
    "Cryptocurrency Exchange",
    "Foreign Exchange",
    "Stablecoin Settlement",
    "Registration-Free Crypto Swaps",
  ],
};

const auditItems = [
  { label: "Non-Custodial Architecture Verified", status: "pass" },
  { label: "API Endpoint Penetration Test", status: "pass" },
  { label: "Rate Limiting & DDoS Mitigation", status: "pass" },
  { label: "Data Encryption at Rest (AES-256)", status: "pass" },
  { label: "TLS 1.3 Transport Security", status: "pass" },
  { label: "Third-Party Smart Contract Audit (ChangeNOW)", status: "pass" },
];

const TransparencySecurity = () => {
  const pageUrl = usePageUrl("/transparency-security");
  return (
    <>
      <Helmet>
        <title>Transparency & Security | MRC GlobalPay</title>
        <meta
          name="description"
          content="MRC GlobalPay operates as a Canadian MSB-compliant, non-custodial crypto exchange. Learn about our security audits, liquidity partners, and data practices."
        />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content="Transparency & Security | MRC GlobalPay" />
        <meta
          property="og:description"
          content="Canadian MSB-compliant, non-custodial crypto swap platform with institutional-grade security."
        />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="MRC GlobalPay" />
        <meta property="og:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Transparency & Security | MRC GlobalPay" />
        <meta name="twitter:description" content="Canadian MSB-compliant, non-custodial crypto swap platform with institutional-grade security." />
        <meta name="twitter:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
        <script type="application/ld+json">{JSON.stringify(pageJsonLd)}</script>
      </Helmet>

      <SiteHeader />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="border-b border-border bg-muted/30 py-16 sm:py-24">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              <Shield className="h-3.5 w-3.5" /> Canadian MSB Compliant
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Transparency & Security
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
              MRC GlobalPay is built on the principles of non-custodial architecture, regulatory
              compliance, and institutional-grade security. Here's how we protect your swaps.
            </p>
          </div>
        </section>

        {/* Canadian MSB Compliance */}
        <section className="py-12 sm:py-20">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <Globe className="h-6 w-6 text-primary" />
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Canadian MSB Registration
                  </h2>
                </div>
                <p className="font-body leading-relaxed text-muted-foreground">
                  MRC GlobalPay operates under Canadian Money Services Business (MSB) regulations,
                  registered with FINTRAC. This ensures full compliance with anti-money laundering
                  (AML) and counter-terrorism financing (CTF) requirements while maintaining the
                  privacy-first, no-registration swap experience our users trust.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "FINTRAC-registered Money Services Business",
                    "AML/CTF policies reviewed annually",
                    "Transaction monitoring for suspicious activity",
                    "Headquartered in Ottawa, Canada",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 font-body text-sm text-muted-foreground">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/aml"
                  className="mt-6 inline-flex items-center gap-1.5 font-body text-sm font-medium text-primary hover:underline"
                >
                  Read our AML Policy <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div>
                <div className="mb-4 flex items-center gap-3">
                  <Lock className="h-6 w-6 text-primary" />
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Non-Custodial Architecture
                  </h2>
                </div>
                <p className="font-body leading-relaxed text-muted-foreground">
                  We never hold, store, or have access to your private keys or funds. Every swap is
                  executed through a non-custodial protocol—your assets move directly from your
                  wallet to the destination address through our liquidity partners. There is no
                  intermediary wallet under our control.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Zero custody of user funds at any point",
                    "No private key storage or access",
                    "Direct wallet-to-wallet settlement",
                    "Users retain full control throughout the swap",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 font-body text-sm text-muted-foreground">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Liquidity Partners */}
        <section className="border-y border-border bg-muted/20 py-12 sm:py-20">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="mb-8 text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
              Liquidity & Technology Partners
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  name: "ChangeNOW",
                  role: "Primary Liquidity Aggregator",
                  desc: "Institutional-grade swap engine aggregating 300+ liquidity sources across centralized and decentralized markets.",
                },
                {
                  name: "Fireblocks",
                  role: "Custody & Settlement Infrastructure",
                  desc: "Enterprise-grade MPC wallet infrastructure ensuring secure transaction signing and settlement.",
                },
              ].map((partner) => (
                <div
                  key={partner.name}
                  className="rounded-xl border border-border bg-card p-6 text-center"
                >
                  <span className="mb-2 inline-block rounded-md border border-border bg-muted px-3 py-1 font-display text-sm font-semibold text-foreground">
                    {partner.name}
                  </span>
                  <p className="mt-2 font-body text-xs font-medium uppercase tracking-wider text-primary">
                    {partner.role}
                  </p>
                  <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">
                    {partner.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Audit Status */}
        <section className="py-12 sm:py-20">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="mb-2 text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
              Security Audit Status
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-center font-body text-muted-foreground">
              Our infrastructure undergoes continuous security review. Below is the current status of
              key audit checkpoints.
            </p>
            <div className="mx-auto max-w-lg space-y-3">
              {auditItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-5 py-3.5"
                >
                  <span className="font-body text-sm text-foreground">{item.label}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-500">
                    <CheckCircle className="h-3.5 w-3.5" /> Passed
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center font-body text-xs text-muted-foreground">
              Last reviewed: March 2026 · Next scheduled review: June 2026
            </p>
          </div>
        </section>

        {/* About — Protocol Mission */}
        <section className="border-t border-border bg-muted/20 py-12 sm:py-20">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="mb-2 text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
              About MRC GlobalPay
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-center font-body text-muted-foreground">
              Our mission is to make crypto accessible to everyone — regardless of balance size.
            </p>
            <div className="mx-auto max-w-2xl space-y-4 font-body leading-relaxed text-muted-foreground">
              <p>
                MRC GlobalPay is a <strong className="text-foreground">registered Money Services Business (MSB)</strong> headquartered
                in Ottawa, Canada, operating under FINTRAC regulations. We provide non-custodial, instant crypto-to-crypto
                swaps with industry-leading low minimums starting at $0.30.
              </p>
              <p>
                Our protocol aggregates liquidity from top-tier providers including ChangeNOW and institutional-grade
                infrastructure partners, enabling micro-swaps that traditional exchanges cannot economically support.
                We are purpose-built for the underserved segment of crypto users holding small, fragmented balances
                across multiple wallets.
              </p>
              <p>
                Every swap is non-custodial — we never hold, store, or access user funds or private keys.
                Our architecture prioritizes direct settlement, permissionless trading, and transparent fee structures.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <ShadowSeoFaq />
    </>
  );
};

export default TransparencySecurity;
