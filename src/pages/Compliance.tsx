import { Helmet } from "react-helmet-async";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Shield, MapPin, ExternalLink, CheckCircle2 } from "lucide-react";

const FINTRAC_URL =
  "https://www10.fintrac-canafe.gc.ca/msb-esm/public/detailed-information/bns-new/7b226d7362526567697374726174696f6e4e756d626572223a224d3233323235363338227d";

const Compliance = () => (
  <>
    <Helmet>
      <title>Compliance — FINTRAC Registered MSB | MRC GlobalPay</title>
      <meta
        name="description"
        content="MRC GlobalPay is a FINTRAC-registered Money Services Business (MSB M23225638) headquartered in Ottawa, Canada. Non-custodial crypto exchange with full AML/CTF compliance."
      />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://mrcglobalpay.com/compliance" />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FinancialService",
          "@id": "https://mrcglobalpay.com/#organization",
          name: "MRC GlobalPay",
          legalName: "MRC Global Pay",
          url: "https://mrcglobalpay.com",
          description:
            "FINTRAC-registered Money Services Business providing non-custodial crypto-to-crypto swaps from $0.30. 500+ assets. No registration required.",
          address: {
            "@type": "PostalAddress",
            streetAddress: "100 Metcalfe Street",
            addressLocality: "Ottawa",
            addressRegion: "ON",
            postalCode: "K1P 5M1",
            addressCountry: "CA",
          },
          areaServed: { "@type": "Place", name: "Worldwide" },
          serviceType: "Cryptocurrency Exchange",
          currenciesAccepted: "BTC, ETH, SOL, USDT, USDC",
          priceRange: "$0.30+",
        })}
      </script>
    </Helmet>

    <SiteHeader />

    <main className="bg-background">
      {/* Hero */}
      <section className="py-14 sm:py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-display text-xs font-bold uppercase tracking-wider text-primary">
                Regulatory Compliance
              </span>
            </div>
            <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              FINTRAC-Registered Canadian MSB
            </h1>
            <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
              MRC GlobalPay operates as a fully registered Money Services Business under
              Canada's Proceeds of Crime (Money Laundering) and Terrorist Financing Act.
            </p>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="bg-accent py-14 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {/* Registration Card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              <h2 className="mt-4 font-display text-xl font-bold text-foreground">
                MSB Registration
              </h2>
              <dl className="mt-4 space-y-3 font-body text-sm text-muted-foreground">
                <div>
                  <dt className="font-semibold text-foreground/80">Registration Number</dt>
                  <dd>M23225638</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground/80">Regulator</dt>
                  <dd>Financial Transactions and Reports Analysis Centre of Canada (FINTRAC)</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground/80">Legal Name</dt>
                  <dd>MRC Global Pay</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground/80">Services</dt>
                  <dd>Dealing in Virtual Currencies, Foreign Exchange</dd>
                </div>
              </dl>
              <a
                href={FINTRAC_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2.5 font-display text-sm font-bold text-primary transition-colors hover:bg-primary/20"
              >
                <ExternalLink className="h-4 w-4" />
                Verify on FINTRAC Registry
              </a>
            </div>

            {/* Address Card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
              <MapPin className="h-8 w-8 text-primary" />
              <h2 className="mt-4 font-display text-xl font-bold text-foreground">
                Headquarters
              </h2>
              <address className="mt-4 font-body text-sm not-italic leading-relaxed text-muted-foreground">
                MRC Global Pay<br />
                100 Metcalfe Street<br />
                Ottawa, Ontario K1P 5M1<br />
                Canada
              </address>
              <div className="mt-6 space-y-2 font-body text-sm text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground/80">Jurisdiction:</span>{" "}
                  Canada (Federal)
                </p>
                <p>
                  <span className="font-semibold text-foreground/80">Architecture:</span>{" "}
                  Non-Custodial — we never hold user funds
                </p>
                <p>
                  <span className="font-semibold text-foreground/80">AML/CTF:</span>{" "}
                  Full compliance with Canadian anti-money laundering regulations
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Framework */}
      <section className="py-14 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              How Does Non-Custodial Compliance Work?
            </h2>
            <div className="mt-6 space-y-4 font-body text-base leading-relaxed text-muted-foreground">
              <p>
                Unlike custodial exchanges that hold user deposits, MRC GlobalPay routes
                swaps directly between the user's wallet and our liquidity partners.
                This eliminates counterparty risk while maintaining full regulatory compliance.
              </p>
              <p>
                All transactions are monitored for AML/CTF compliance in accordance with
                FINTRAC guidelines. Suspicious activity is flagged and reported as required
                by Canadian law.
              </p>
              <p>
                Our non-custodial architecture means your funds are never at risk from
                exchange hacks, insolvency, or mismanagement — the most common causes of
                user losses in cryptocurrency.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <SiteFooter />
  </>
);

export default Compliance;
