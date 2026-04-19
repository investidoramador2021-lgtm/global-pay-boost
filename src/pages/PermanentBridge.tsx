import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { usePageUrl } from "@/hooks/use-page-url";
import HreflangTags from "@/components/HreflangTags";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ExchangeWidget from "@/components/ExchangeWidget";

const PermanentBridge = () => {
  const { t } = useTranslation();
  const canonicalUrl = usePageUrl("/permanent-bridge");

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Permanent Crypto Bridge — Reusable Deposit Address | MRC GlobalPay</title>
        <meta name="description" content="Generate a reusable permanent deposit address for recurring crypto conversions across 6,000+ tokens. No registration, no data stored, downloadable PDF receipts. FINTRAC MSB-registered." />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "MRC GlobalPay Permanent Bridge",
            "url": canonicalUrl,
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "All",
            "description": "Generate permanent deposit addresses for recurring crypto-to-crypto conversions with zero data storage.",
            "provider": {
              "@type": "FinancialService",
              "name": "MRC GlobalPay",
              "url": "https://mrcglobalpay.com",
              "sameAs": [
                "https://www.linkedin.com/company/mrc-globalpay",
                "https://www10.fintrac-canafe.gc.ca/msb-esm/public/detailed-information/bns-new/7b226d7362526567697374726174696f6e4e756d626572223a224d3233323235363338227d"
              ]
            },
            "offers": {
              "@type": "Offer",
              "name": "Permanent Crypto Bridge",
              "description": "Reusable deposit address with 0.5% inclusive service fee and zero session timeouts",
              "priceSpecification": {
                "@type": "UnitPriceSpecification",
                "price": "0.5",
                "priceCurrency": "USD",
                "unitCode": "P1",
                "description": "0.5% inclusive service fee"
              }
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How does a stateless bridge prevent session timeouts?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "MRC GlobalPay derives deterministic deposit addresses from BIP-44 master paths, eliminating server-side session state. No TTL expiry, no address reuse — each bridge operation is atomically independent."
                }
              },
              {
                "@type": "Question",
                "name": "Is MRC GlobalPay a regulated Canadian MSB?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. MRC GlobalPay is FINTRAC-registered (MSB C100000015), headquartered at 100 Metcalfe Street, Ottawa, Ontario. All bridge operations comply with Canadian AML/CTF regulations under non-custodial architecture."
                }
              }
            ]
          })}
        </script>
      </Helmet>
      <HreflangTags />
      <SiteHeader />
      <main className="container mx-auto max-w-2xl px-4 py-12">
        <h1 className="mb-2 text-center font-display text-3xl font-black text-foreground md:text-4xl">
          Permanent Crypto Bridge
        </h1>
        <p className="mb-8 text-center font-body text-muted-foreground">
          Generate a reusable deposit address for recurring crypto conversions. No registration, no data stored.
        </p>
        <ExchangeWidget />

        <div className="mt-10 rounded-xl border border-amber-500/20 bg-card p-5 text-center">
          <p className="font-body text-sm text-muted-foreground">
            Learn how Stateless Address Persistence powers institutional settlement rails.
          </p>
          <a
            href="/permanent-bridge/whitepaper"
            className="mt-3 inline-flex items-center gap-2 font-display text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Read the Whitepaper <span aria-hidden>→</span>
          </a>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default PermanentBridge;
