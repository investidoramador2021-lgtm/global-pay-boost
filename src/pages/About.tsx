import { Helmet } from "react-helmet-async";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Shield, Globe, Building2, Scale, AlertTriangle } from "lucide-react";

const About = () => (
  <>
    <Helmet>
      <title>About — MSB Compliance & Business Information | MRC GlobalPay</title>
      <meta name="description" content="MRC GlobalPay is a registered Canadian Money Services Business (MSB) under FINTRAC (M23225638). Non-custodial cryptocurrency exchange serving global markets." />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      <link rel="canonical" href="https://mrcglobalpay.com/about" />
      <meta property="og:title" content="About — MSB Compliance & Business | MRC GlobalPay" />
      <meta property="og:description" content="Registered Canadian MSB (FINTRAC M23225638). Non-custodial crypto exchange serving global markets." />
      <meta property="og:url" content="https://mrcglobalpay.com/about" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "MRC GlobalPay",
        url: "https://mrcglobalpay.com",
        description: "Registered Canadian Money Services Business providing non-custodial cryptocurrency exchange services.",
        address: { "@type": "PostalAddress", addressLocality: "Ottawa", addressCountry: "CA" },
        knowsAbout: ["Cryptocurrency Exchange", "Non-Custodial Trading", "Blockchain", "FINTRAC Compliance"],
        hasCredential: {
          "@type": "EducationalOccupationalCredential",
          credentialCategory: "Money Services Business License",
          recognizedBy: { "@type": "Organization", name: "FINTRAC — Financial Transactions and Reports Analysis Centre of Canada" },
        },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://mrcglobalpay.com/" },
            { "@type": "ListItem", position: 2, name: "About", item: "https://mrcglobalpay.com/about" },
          ],
        },
      })}</script>
    </Helmet>
    <SiteHeader />
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            About <span className="text-primary">MRC GlobalPay</span>
          </h1>
          <p className="mt-6 font-body text-lg leading-relaxed text-muted-foreground">
            MRC GlobalPay is a <strong>registered Canadian Money Services Business (MSB)</strong> providing non-custodial cryptocurrency exchange services to global markets. We are committed to regulatory compliance, user privacy, and institutional-grade security.
          </p>

          {/* MSB Registration */}
          <div className="mt-12 rounded-xl border border-primary/20 bg-primary/5 p-8">
            <div className="flex items-start gap-4">
              <Shield className="mt-1 h-8 w-8 shrink-0 text-primary" />
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Regulatory Registration</h2>
                <div className="mt-4 space-y-3 font-body text-sm text-muted-foreground">
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="font-semibold text-foreground">Entity Name</span>
                    <span>MRC GlobalPay</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="font-semibold text-foreground">Registration Type</span>
                    <span>Money Services Business (MSB)</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="font-semibold text-foreground">Regulator</span>
                    <span>FINTRAC — Canada</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="font-semibold text-foreground">MSB Registration Number</span>
                    <span className="font-mono text-primary">M23225638</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Headquarters</span>
                    <span>Ottawa, Ontario, Canada</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Model */}
          <div className="mt-10">
            <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" /> Business Model
            </h2>
            <div className="mt-4 space-y-3 font-body text-sm leading-relaxed text-muted-foreground">
              <p><strong>Architecture:</strong> Non-custodial. MRC GlobalPay never holds, stores, or has access to user funds. All swaps settle wallet-to-wallet through institutional-grade liquidity infrastructure (ChangeNOW / Fireblocks).</p>
              <p><strong>Minimum Swap:</strong> $0.30 USD equivalent — the lowest in the industry, designed for micro-balance ("crypto dust") conversion.</p>
              <p><strong>Supported Assets:</strong> 500+ cryptocurrencies across 50+ blockchain networks.</p>
              <p><strong>Settlement Speed:</strong> Average 2–15 minutes depending on network confirmation times.</p>
            </div>
          </div>

          {/* Accepted Countries */}
          <div className="mt-10">
            <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" /> Accepted Countries Policy
            </h2>
            <div className="mt-4 font-body text-sm leading-relaxed text-muted-foreground space-y-3">
              <p>MRC GlobalPay serves <strong>global markets</strong>. Our non-custodial exchange service is available to users worldwide, with the following exclusions mandated by international compliance obligations:</p>
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <h3 className="flex items-center gap-2 font-semibold text-foreground">
                  <AlertTriangle className="h-4 w-4 text-destructive" /> Restricted Jurisdictions
                </h3>
                <p className="mt-2 text-xs">
                  In accordance with OFAC (Office of Foreign Assets Control) sanctions and Canadian AML regulations, MRC GlobalPay does <strong>not</strong> provide services to users in the following regions:
                </p>
                <ul className="mt-2 grid grid-cols-2 gap-1 text-xs sm:grid-cols-3">
                  {["North Korea (DPRK)", "Iran", "Syria", "Cuba", "Crimea Region", "Donetsk / Luhansk", "Russia", "Myanmar", "South Sudan"].map((c) => (
                    <li key={c} className="flex items-center gap-1"><span className="text-destructive">✕</span> {c}</li>
                  ))}
                </ul>
              </div>
              <p>All other jurisdictions are accepted. Users are responsible for ensuring compliance with their local regulations.</p>
            </div>
          </div>

          {/* Compliance Framework */}
          <div className="mt-10">
            <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" /> Compliance Framework
            </h2>
            <ul className="mt-4 space-y-2 font-body text-sm text-muted-foreground">
              <li>✓ <strong>AML/CTF:</strong> Full Anti-Money Laundering and Counter-Terrorism Financing compliance per FINTRAC requirements.</li>
              <li>✓ <strong>Transaction Monitoring:</strong> Automated risk-scoring and suspicious activity reporting.</li>
              <li>✓ <strong>Zero Data Retention:</strong> No personal data stored. Non-custodial architecture means no user wallets or funds are held.</li>
              <li>✓ <strong>Privacy-First:</strong> Registration-free swaps for standard transactions. Enhanced verification triggered only by risk thresholds.</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="mt-12 rounded-xl border border-border bg-card p-6 text-center">
            <h2 className="font-display text-xl font-bold text-foreground">Contact & Business Inquiries</h2>
            <p className="mt-3 font-body text-sm text-muted-foreground">
              For partnership, compliance, or business inquiries:{" "}
              <a href="mailto:compliance@mrcglobalpay.com" className="text-primary hover:underline">compliance@mrcglobalpay.com</a>
            </p>
            <p className="mt-1 font-body text-xs text-muted-foreground">
              Regulatory verification: <a href="https://www10.fintrac-canafe.gc.ca/msb-esm/public/detailed-information/msb-details/7b226d73624f72674e756d626572223a3136393636322c227072696d617279536561726368223a7b226f72674e616d65223a226d7263222c2273656172636854797065223a317d7d/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">FINTRAC Public Registry</a>
            </p>
          </div>
        </div>
      </section>
    </main>
    <SiteFooter />
  </>
);

export default About;
