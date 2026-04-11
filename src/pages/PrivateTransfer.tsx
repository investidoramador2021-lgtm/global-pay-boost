import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { getLangFromPath, langPath } from "@/i18n";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MsbTrustBar from "@/components/MsbTrustBar";
import PrivateTransferTab from "@/components/PrivateTransferTab";
import { Helmet } from "react-helmet-async";
import { Shield, Lock, CheckCircle2, Eye, ArrowRight } from "lucide-react";

const PrivateTransfer = () => {
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const pageUrl = `https://mrcglobalpay.com${langPath(lang, "/private-transfer")}`;
  const { t } = useTranslation();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["FinancialService", "Service"],
    name: "MRC GlobalPay Private Transfer",
    url: pageUrl,
    description: "Send crypto privately with shielded routing. Fixed-rate guaranteed transfers through liquidity pools that mask the sender's wallet address. No registration required.",
    provider: {
      "@type": "Organization",
      "@id": "https://mrcglobalpay.com/#organization",
      name: "MRC GlobalPay",
      url: "https://mrcglobalpay.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "100 Metcalfe Street",
        addressLocality: "Ottawa",
        addressRegion: "ON",
        postalCode: "K1P 5M1",
        addressCountry: "CA",
      },
    },
    serviceType: "Private Cryptocurrency Transfer",
    areaServed: { "@type": "Place", name: "Worldwide" },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: pageUrl,
      availableLanguage: ["en", "es", "pt", "fr", "ja", "fa", "ur", "he", "af", "hi", "vi", "tr", "uk"],
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "No additional fees for private routing. Standard exchange rates apply.",
    },
  };

  return (
    <>
      <Helmet>
        <title>Private Crypto Transfer — Shielded Routing | MRC GlobalPay</title>
        <meta name="description" content="Send crypto without exposing your wallet. MRC GlobalPay's Private Transfer uses shielded routing through liquidity pools. Fixed-rate, no registration, 500+ tokens." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://mrcglobalpay.com/private-transfer" />
        <meta property="og:title" content="Private Crypto Transfer — Shielded Routing | MRC GlobalPay" />
        <meta property="og:description" content="Send crypto without exposing your wallet. Shielded routing through liquidity pools. Fixed-rate, no registration." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:site_name" content="MRC GlobalPay" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Private Crypto Transfer — Shielded Routing | MRC GlobalPay" />
        <meta name="twitter:description" content="Send crypto without exposing your wallet. Shielded routing through liquidity pools." />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <SiteHeader />
      <main className="container mx-auto px-4 py-8 sm:py-12">
        {/* Hero */}
        <div className="mx-auto max-w-2xl text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 mb-4">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-body text-xs font-semibold uppercase tracking-wider text-primary">Private Transfer</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Send Crypto <span className="text-primary">Privately</span>
          </h1>
          <p className="mt-4 font-body text-base text-muted-foreground sm:text-lg max-w-xl mx-auto">
            Professional, shielded routing for every transfer. Your wallet address is never exposed to the recipient.
          </p>
        </div>

        {/* How it works */}
        <div className="mx-auto max-w-3xl mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Eye className="h-5 w-5 text-primary" />, title: "Select & Amount", desc: "Choose your currencies and enter the amount. Fixed-rate locks your price." },
            { icon: <Shield className="h-5 w-5 text-primary" />, title: "Shielded Deposit", desc: "Send to a unique deposit address. Funds route through a liquidity pool." },
            { icon: <CheckCircle2 className="h-5 w-5 text-primary" />, title: "Private Delivery", desc: "Recipient gets exact amount. Your wallet is never visible in their history." },
          ].map((step, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">{step.icon}</div>
              <h3 className="font-display text-sm font-bold text-foreground">{step.title}</h3>
              <p className="mt-1 font-body text-xs text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Widget */}
        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-elevated sm:p-8">
            <PrivateTransferTab />
          </div>
        </div>

        {/* Trust section */}
        <div className="mx-auto max-w-3xl mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> How Shielded Routing Works</h3>
            <p className="mt-2 font-body text-sm text-muted-foreground leading-relaxed">
              When you initiate a private transfer, your deposit is sent to a one-time address managed by our liquidity partner. The funds are then routed through an aggregated pool before being sent to the recipient from a completely different address. The recipient sees no connection to your original wallet.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2"><Lock className="h-5 w-5 text-primary" /> Fixed-Rate Guarantee</h3>
            <p className="mt-2 font-body text-sm text-muted-foreground leading-relaxed">
              Every private transfer uses a fixed exchange rate, locked at the moment you confirm. The recipient receives exactly the amount shown — no slippage, no surprises. Rates are locked for 60 seconds and can be refreshed.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto max-w-2xl mt-12">
          <h2 className="font-display text-xl font-bold text-foreground text-center mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Is my wallet address truly hidden from the recipient?", a: "Yes. Your deposit goes to a one-time generated address. Funds are pooled and routed through aggregated liquidity before delivery. The recipient's on-chain history shows no connection to your wallet." },
              { q: "What currencies support private transfers?", a: "All 500+ cryptocurrencies available on MRC GlobalPay support private transfers. This includes Bitcoin, Ethereum, Solana, USDT, USDC, and many more across all major blockchains." },
              { q: "Are private transfers more expensive?", a: "No. Private transfers use the same competitive exchange rates as standard swaps. There are no additional fees for shielded routing." },
              { q: "Do I need to create an account?", a: "No. MRC GlobalPay is fully permissionless. No registration, no KYC for standard transfers, no personal data required." },
            ].map((faq, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-display text-sm font-bold text-foreground">{faq.q}</h3>
                <p className="mt-1.5 font-body text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <MsbTrustBar />
      <SiteFooter />
    </>
  );
};

export default PrivateTransfer;
