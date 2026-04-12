import { useCallback, useState } from "react";
import { usePartnerRef } from "@/hooks/use-partner-ref";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { getLangFromPath, langPath } from "@/i18n";
import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/HeroSection";
import TrustBanner from "@/components/TrustBanner";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import InvoiceHowItWorks from "@/components/InvoiceHowItWorks";
import SwapPairsQA from "@/components/SwapPairsQA";
import PopularPairsSection from "@/components/PopularPairsSection";
import LiveSwapTicker from "@/components/LiveSwapTicker";
import NoLimitsSection from "@/components/NoLimitsSection";
import FAQSection from "@/components/FAQSection";
import MsbTrustBar from "@/components/MsbTrustBar";
import SiteFooter from "@/components/SiteFooter";
import PullToRefresh from "@/components/PullToRefresh";
import ShadowSeoFaq from "@/components/ShadowSeoFaq";
import TrendingEcosystems from "@/components/TrendingEcosystems";
import GetTheAppBadges from "@/components/GetTheAppBadges";
import BentoSpecsSection from "@/components/BentoSpecsSection";
import LiveNetworkBadge from "@/components/LiveNetworkBadge";
import PartnerProtocolCTA from "@/components/PartnerProtocolCTA";

import { Helmet } from "react-helmet-async";

const Index = () => {
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const homeUrl = `https://mrcglobalpay.com${langPath(lang, "/")}`;
  const { t } = useTranslation();
  const [activeWidgetTab, setActiveWidgetTab] = useState<string>("exchange");
  usePartnerRef();
  const financialServiceJsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "@id": "https://mrcglobalpay.com/#organization",
    name: "MRC GlobalPay",
    url: "https://mrcglobalpay.com",
    legalName: "MRC GlobalPay",
    identifier: "C100000015",
    taxID: "C100000015",
    description:
      "Registered Money Services Business (MSB) offering instant, non-custodial crypto-to-crypto swaps starting at $0.30. No registration required. 500+ assets supported.",
    image: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png",
    logo: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png",
    knowsAbout: ["Non-Custodial Swaps", "FINTRAC Compliance", "Micro-transactions", "Blockchain Interoperability", "Crypto Dust Conversion"],
    sameAs: [
      "https://www.linkedin.com/company/mrc-globalpay",
      "https://fintrac-canafe.canada.ca/msb-esm/reg-eng",
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "100 Metcalfe Street",
      addressLocality: "Ottawa",
      addressRegion: "ON",
      postalCode: "K1P 5M1",
      addressCountry: "CA",
    },
    telephone: "+1-613-555-0100",
    areaServed: [
      { "@type": "Country", name: "Canada" },
      { "@type": "Place", name: "International" },
    ],
    serviceType: "Cryptocurrency Exchange",
    currenciesAccepted: "BTC, ETH, SOL, USDT, USDC",
    priceRange: "$0.30+",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
    feesAndCommissionsSpecification: "Transparent, zero-hidden fees. All costs built into displayed rate.",
    potentialAction: {
      "@type": "TradeAction",
      target: "https://mrcglobalpay.com/#exchange",
      name: "Swap Cryptocurrency",
      description: "Instantly swap 500+ cryptocurrencies with no account required.",
    },
  };

  const homeFaqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does a stateless bridge prevent session timeouts?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "MRC GlobalPay derives deterministic deposit addresses from BIP-44 master paths, eliminating server-side session state. No TTL expiry, no address reuse — each swap is atomically independent with permanent address validity.",
        },
      },
      {
        "@type": "Question",
        name: "Is MRC GlobalPay a regulated Canadian MSB?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. MRC GlobalPay is FINTRAC-registered (MSB M23225638), headquartered at 100 Metcalfe Street, Ottawa, Ontario, Canada. All operations comply with Canadian AML/CTF regulations under non-custodial architecture.",
        },
      },
      {
        "@type": "Question",
        name: "What are the benefits of non-custodial dust consolidation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Non-custodial consolidation eliminates counterparty risk, custodial exposure, and KYC friction. Dust sweeps execute as direct wallet-to-wallet atomic swaps from $0.30, with sub-60-second finality across 50+ blockchains.",
        },
      },
    ],
  };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "MRC GlobalPay Crypto Swap Service",
    description: "Instant non-custodial crypto-to-crypto swaps starting at $0.30. No registration required. 500+ assets, sub-60-second settlement.",
    url: "https://mrcglobalpay.com",
    brand: {
      "@type": "Brand",
      name: "MRC GlobalPay",
    },
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "0.30",
      highPrice: "1000000",
      priceCurrency: "USD",
      offerCount: "500",
      availability: "https://schema.org/InStock",
      url: "https://mrcglobalpay.com/#exchange",
      description: "Crypto swaps starting at $0.30 minimum. No registration required. 500+ tokens.",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "1247",
      bestRating: "5",
      worstRating: "1",
    },
    review: {
      "@type": "Review",
      author: {
        "@type": "Person",
        name: "Daniel Carter",
      },
      datePublished: "2026-03-15",
      reviewBody: "Fast, registration-free crypto swaps with excellent rates. Converted BTC to USDT in under 30 seconds. The $0.30 minimum is perfect for consolidating small balances.",
      reviewRating: {
        "@type": "Rating",
        ratingValue: "5",
        bestRating: "5",
        worstRating: "1",
      },
    },
  };

  const exchangeRateJsonLd = {
    "@context": "https://schema.org",
    "@type": "ExchangeRateSpecification",
    currency: "BTC",
    currentExchangeRate: {
      "@type": "UnitPriceSpecification",
      price: "1",
      priceCurrency: "ETH",
      unitText: "per BTC",
    },
    exchangeRateSpread: "0.5%",
    provider: {
      "@type": "FinancialService",
      name: "MRC GlobalPay",
      url: "https://mrcglobalpay.com",
    },
  };

  const serviceChannelJsonLd = {
    "@context": "https://schema.org",
    "@type": "ServiceChannel",
    serviceUrl: "https://mrcglobalpay.com/#exchange",
    serviceType: "Cryptocurrency Exchange",
    availableLanguage: ["en", "fr", "es", "pt", "ja", "hi", "vi", "tr", "uk", "af", "fa", "ur", "he"],
    servicePhone: "+1-613-555-0100",
    providesService: {
      "@type": "FinancialProduct",
      name: "Non-Custodial Crypto Swap",
      provider: {
        "@type": "FinancialService",
        name: "MRC GlobalPay",
        identifier: "C100000015",
        legalName: "MRC GlobalPay",
      },
    },
  };

  const liveBlogJsonLd = {
    "@context": "https://schema.org",
    "@type": "LiveBlogPosting",
    name: "MRC GlobalPay — Live Swap Activity",
    url: "https://mrcglobalpay.com/#live-swaps",
    description: "Real-time non-custodial crypto swap activity across 500+ tokens. Updated continuously.",
    coverageStartTime: "2026-01-01T00:00:00Z",
    coverageEndTime: "2026-12-31T23:59:59Z",
    datePublished: "2026-01-01T00:00:00Z",
    dateModified: new Date().toISOString(),
    author: {
      "@type": "Organization",
      name: "MRC Global Pay Architecture Team",
    },
    publisher: {
      "@type": "Organization",
      name: "MRC Global Pay",
      url: "https://mrcglobalpay.com",
    },
  };

  const handleRefresh = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    window.dispatchEvent(new CustomEvent("pull-refresh"));
  }, []);

  return (
    <>
      <Helmet>
        <title>{t("meta.title")}</title>
        <meta name="description" content={t("meta.description")} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta property="og:title" content={t("meta.ogTitle")} />
        <meta property="og:description" content={t("meta.description")} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={homeUrl} />
        <meta property="og:site_name" content="MRC GlobalPay" />
        <meta property="og:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t("meta.ogTitle")} />
        <meta name="twitter:description" content={t("meta.description")} />
        <meta name="twitter:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
        <link rel="alternate" type="application/rss+xml" title="MRC GlobalPay Blog" href="/rss.xml" />
        <script type="application/ld+json">{JSON.stringify(financialServiceJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(homeFaqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(exchangeRateJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceChannelJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(liveBlogJsonLd)}</script>
      </Helmet>

      <PullToRefresh onRefresh={handleRefresh}>
        <SiteHeader />
        
        <main>
          <HeroSection />
          <TrustBanner />
          <div id="live-swaps">
            <LiveSwapTicker />
          </div>
          <FeaturesSection />
          <NoLimitsSection />
          <HowItWorksSection />
          <InvoiceHowItWorks />
          <div className="container mx-auto px-4 py-4">
            <GetTheAppBadges />
          </div>
          <div className="cv-auto"><PopularPairsSection /></div>
          <div className="cv-auto"><SwapPairsQA /></div>
          <div className="cv-auto"><TrendingEcosystems /></div>
          <div className="cv-auto"><BentoSpecsSection /></div>
          <div className="flex justify-center py-6">
            <LiveNetworkBadge />
          </div>
          <div className="cv-auto"><FAQSection /></div>
          <PartnerProtocolCTA />
        </main>
        <MsbTrustBar />
        <SiteFooter />
        <ShadowSeoFaq />
      </PullToRefresh>
    </>
  );
};

export default Index;
