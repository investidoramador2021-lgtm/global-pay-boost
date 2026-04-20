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
import HomeResourceCards from "@/components/HomeResourceCards";
import WhyChooseSection from "@/components/WhyChooseSection";
import LiveNetworkBadge from "@/components/LiveNetworkBadge";
import PartnerProtocolCTA from "@/components/PartnerProtocolCTA";
import AffiliatePartnerCTA from "@/components/AffiliatePartnerCTA";
import { Helmet } from "react-helmet-async";

type WidgetMode = "exchange" | "buysell" | "private" | "bridge" | "request";

const Index = () => {
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const homeUrl = `https://mrcglobalpay.com${langPath(lang, "/")}`;
  const { t } = useTranslation();
  const [activeWidgetTab, setActiveWidgetTab] = useState<WidgetMode>("exchange");

  usePartnerRef();

  const handleRefresh = useCallback(async () => {
    window.location.reload();
  }, []);

  const graphJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${homeUrl}#legalentity`,
        name: "MRC Global Pay",
        url: homeUrl,
        logo: "https://mrcglobalpay.com/icon-512.png",
        description: "MRC Global Pay is a non-custodial crypto exchange — a Registered Canadian MSB (FINTRAC #C100000015) operated by MRC Pay International Corp.",
        sameAs: ["https://twitter.com/mrcglobalpay"],
        identifier: "C100000015"
      },
      {
        "@type": "FinancialService",
        "@id": `${homeUrl}#organization`,
        name: "MRC Global Pay",
        url: homeUrl,
        description: t("meta.description"),
        priceRange: "$0.30 - $$$",
        image: "https://mrcglobalpay.com/og-image.jpg",
        address: {
          "@type": "PostalAddress",
          streetAddress: "116 Albert Street, Suite 300",
          addressLocality: "Ottawa",
          addressRegion: "ON",
          postalCode: "K1P 5G3",
          addressCountry: "CA"
        },
        parentOrganization: {
          "@type": "Organization",
          name: "MRC Pay International Corp"
        },
        areaServed: "Worldwide",
        serviceType: "Cryptocurrency Exchange",
        identifier: "C100000015",
        knowsAbout: ["Cryptocurrency Exchange", "Non-Custodial Swap", "6,000+ Crypto Assets", "Trending AI Tokens", "Tokenized Stocks (xStocks)", "Crypto Invoice Settlement", "Foreign Exchange", "Stablecoin Settlement"],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Crypto Exchange Services",
          itemListElement: [
            {
              "@type": "Offer",
              name: "Instant Crypto Swap — 6,000+ Assets",
              description: "Non-custodial swap across 6,000+ cryptocurrencies, Trending AI tokens, and Tokenized Stocks (xStocks) from $0.30 with 0.5% inclusive service fee",
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: "0.5",
                priceCurrency: "USD",
                unitCode: "P1",
                description: "0.5% inclusive service fee — no hidden charges"
              }
            },
            {
              "@type": "Offer",
              name: "Professional Crypto Invoice",
              description: "Issue crypto invoices payable in 6,000+ assets including Trending AI tokens and Tokenized Stocks, with 168-hour rate lock guarantee and 0.5% settlement fee",
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: "0.5",
                priceCurrency: "USD",
                unitCode: "P1",
                description: "0.5% service fee deducted from final settlement"
              }
            }
          ]
        }
      },
      {
        "@type": "Service",
        "@id": `${homeUrl}#currency-conversion`,
        name: "MRC Global Pay Currency Conversion",
        provider: { "@id": `${homeUrl}#organization` },
        serviceType: "CurrencyConversionService",
        description: "Instant non-custodial conversion across 6,000+ cryptocurrencies, Trending AI tokens, and Tokenized Stocks (xStocks) with 0.5% inclusive fee and 168-hour rate lock on invoices",
        areaServed: "Worldwide",
        termsOfService: "https://mrcglobalpay.com/terms",
        additionalType: "https://schema.org/FinancialProduct",
        slogan: "Registration-Free Swap Across 6,000+ Crypto Assets & Tokenized Stocks from $0.30"
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${homeUrl}#app`,
        name: "MRC Global Pay",
        url: homeUrl,
        description: t("meta.description"),
        applicationCategory: "FinanceApplication",
        operatingSystem: "Android, iOS, Windows, macOS",
        offers: {
          "@type": "Offer",
          price: "0.00",
          priceCurrency: "USD"
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          reviewCount: "1250"
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{t("meta.title")}</title>
        <meta name="description" content={t("meta.description")} />
        <meta property="og:title" content={t("meta.ogTitle")} />
        <meta property="og:description" content={t("meta.description")} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={homeUrl} />
        <meta property="og:image" content="https://mrcglobalpay.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t("meta.ogTitle")} />
        <meta name="twitter:description" content={t("meta.description")} />
        <meta name="twitter:image" content="https://mrcglobalpay.com/og-image.jpg" />
        <link rel="canonical" href={homeUrl} />
        <script type="application/ld+json">{JSON.stringify(graphJsonLd)}</script>
      </Helmet>

      <PullToRefresh onRefresh={handleRefresh}>
        <SiteHeader />

        <main className="pb-20 lg:pb-0">
          <HeroSection onTabChange={setActiveWidgetTab} />
          <TrustBanner />
          <WhyChooseSection />
          <div id="live-swaps">
            <LiveSwapTicker />
          </div>
          <FeaturesSection />
          <NoLimitsSection />
          <HowItWorksSection />
          <div className="container mx-auto px-4 py-4">
            <GetTheAppBadges />
          </div>
          <div className="cv-auto">
            <PopularPairsSection />
          </div>
          <AffiliatePartnerCTA />
          <div className="cv-auto">
            <SwapPairsQA />
          </div>
          <div className="cv-auto">
            <TrendingEcosystems />
          </div>
          <div className="cv-auto">
            <HomeResourceCards />
          </div>
          <div className="cv-auto">
            <BentoSpecsSection />
          </div>
          <div className="flex justify-center py-6">
            <LiveNetworkBadge />
          </div>
          <div className="cv-auto">
            <FAQSection />
          </div>
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
