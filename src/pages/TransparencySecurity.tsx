import { Helmet } from "react-helmet-async";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ShadowSeoFaq from "@/components/ShadowSeoFaq";
import { Link } from "react-router-dom";
import { Shield, Lock, Globe, CheckCircle, ExternalLink } from "lucide-react";

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

const personSchemaTeam = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Daniel Carter",
    jobTitle: "Senior Blockchain Analyst",
    worksFor: { "@type": "Organization", name: "MRC GlobalPay" },
    description:
      "CFA Charterholder with 8 years in digital asset trading. Former Cumberland DRW. Columbia MFE.",
    knowsAbout: ["Cryptocurrency Trading", "DeFi Infrastructure", "Market Microstructure"],
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Sophia Ramirez",
    jobTitle: "DeFi Infrastructure Researcher",
    worksFor: { "@type": "Organization", name: "MRC GlobalPay" },
    description:
      "Former L1 Protocol Engineer. Published in Messari & The Block. MSc Computer Science, ETH Zurich.",
    knowsAbout: ["AMM Design", "Cross-Chain Bridging", "Liquidity Aggregation"],
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Marcus Chen",
    jobTitle: "Cybersecurity Lead & Crypto Security Advisor",
    worksFor: { "@type": "Organization", name: "MRC GlobalPay" },
    description:
      "CISSP & OSCP certified. 15 years in InfoSec. Former Security Lead at top-20 CEX.",
    knowsAbout: ["Cryptocurrency Custody", "Wallet Security", "Exchange Infrastructure"],
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Elena Volkova",
    jobTitle: "Crypto Markets Strategist",
    worksFor: { "@type": "Organization", name: "MRC GlobalPay" },
    description:
      "Former Quant Analyst at Jane Street. CoinDesk & Blockworks contributor. MSc Mathematics, MIT.",
    knowsAbout: ["On-Chain Analytics", "Trading Pair Dynamics", "Macro Crypto Trends"],
  },
];

const auditItems = [
  { label: "Non-Custodial Architecture Verified", status: "pass" },
  { label: "API Endpoint Penetration Test", status: "pass" },
  { label: "Rate Limiting & DDoS Mitigation", status: "pass" },
  { label: "Data Encryption at Rest (AES-256)", status: "pass" },
  { label: "TLS 1.3 Transport Security", status: "pass" },
  { label: "Third-Party Smart Contract Audit (ChangeNOW)", status: "pass" },
];

const TransparencySecurity = () => {
  return (
    <>
      <Helmet>
        <title>Transparency & Security | MRC GlobalPay — Canadian MSB Compliance</title>
        <meta
          name="description"
          content="MRC GlobalPay operates as a Canadian MSB-compliant, non-custodial crypto exchange. Learn about our security audits, liquidity partners, and data practices."
        />
        <link rel="canonical" href="https://mrcglobalpay.com/transparency-security" />
        <meta property="og:title" content="Transparency & Security | MRC GlobalPay" />
        <meta
          property="og:description"
          content="Canadian MSB-compliant, non-custodial crypto swap platform with institutional-grade security."
        />
        <meta property="og:url" content="https://mrcglobalpay.com/transparency-security" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(pageJsonLd)}</script>
        {personSchemaTeam.map((person, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(person)}
          </script>
        ))}
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
                {
                  name: "Vanguard Talent",
                  role: "Security & Compliance Advisor",
                  desc: "Strategic partner providing cybersecurity advisory and regulatory compliance consulting.",
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

        {/* Team E-E-A-T */}
        <section className="border-t border-border bg-muted/20 py-12 sm:py-20">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="mb-2 text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
              Our Expert Team
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-center font-body text-muted-foreground">
              MRC GlobalPay is guided by professionals with deep expertise in blockchain
              infrastructure, cybersecurity, and quantitative finance.
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              {personSchemaTeam.map((person) => (
                <div
                  key={person.name}
                  className="rounded-xl border border-border bg-card p-6"
                >
                  <h3 className="font-display text-lg font-bold text-foreground">{person.name}</h3>
                  <p className="font-body text-sm font-medium text-primary">{person.jobTitle}</p>
                  <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">
                    {person.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {person.knowsAbout.map((topic: string) => (
                      <span
                        key={topic}
                        className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
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
