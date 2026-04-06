import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { getLangFromPath, langPath } from "@/i18n";
import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/HeroSection";
import TrustBanner from "@/components/TrustBanner";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
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
import { Helmet } from "react-helmet-async";

const Index = () => {
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const homeUrl = `https://mrcglobalpay.com${langPath(lang, "/")}`;
  const { t } = useTranslation();
  const financialServiceJsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "@id": "https://mrcglobalpay.com/#organization",
    name: "MRC GlobalPay",
    url: "https://mrcglobalpay.com",
    legalName: "MRC Global Pay",
    description:
      "Registered Money Services Business (MSB) offering instant, non-custodial crypto-to-crypto swaps starting at $0.30. No registration required. 500+ assets supported.",
    image: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png",
    logo: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png",
    knowsAbout: ["Non-Custodial Swaps", "FINTRAC Compliance", "Micro-transactions", "Blockchain Interoperability", "Crypto Dust Conversion"],
    address: {
      "@type": "PostalAddress",
      streetAddress: "100 Metcalfe Street",
      addressLocality: "Ottawa",
      addressRegion: "ON",
      postalCode: "K1P 5M1",
      addressCountry: "CA",
    },
    telephone: "+1-613-555-0100",
    areaServed: {
      "@type": "Place",
      name: "Worldwide",
    },
    serviceType: "Cryptocurrency Exchange",
    currenciesAccepted: "BTC, ETH, SOL, USDT, USDC",
    priceRange: "$0.30+",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
    potentialAction: {
      "@type": "TradeAction",
      target: "https://mrcglobalpay.com/#exchange",
      name: "Swap Cryptocurrency",
      description: "Instantly swap 500+ cryptocurrencies with no account required.",
    },
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
        <script type="application/ld+json">{JSON.stringify(financialServiceJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
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
          <PopularPairsSection />
          <SwapPairsQA />
          <FAQSection />
        </main>
        <MsbTrustBar />
        <SiteFooter />
        <ShadowSeoFaq />
      </PullToRefresh>
    </>
  );
};

export default Index;
