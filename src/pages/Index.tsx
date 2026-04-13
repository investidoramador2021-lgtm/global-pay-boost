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
import LiveNetworkBadge from "@/components/LiveNetworkBadge";
import PartnerProtocolCTA from "@/components/PartnerProtocolCTA";
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

  const financialServiceJsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "@id": `${homeUrl}#organization`,
    name: "MRC GlobalPay",
    url: homeUrl,
    description: t("meta.description"),
    areaServed: "Worldwide",
    serviceType: "Cryptocurrency Exchange",
    knowsAbout: ["Cryptocurrency Exchange", "Non-Custodial Swap", "Crypto Invoice Settlement"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Crypto Exchange Services",
      itemListElement: [
        {
          "@type": "Offer",
          name: "Instant Crypto Swap",
          description: "Non-custodial crypto-to-crypto swap from $0.30 with 0.5% inclusive service fee",
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
          description: "Issue crypto invoices with 168-hour rate lock guarantee and 0.5% settlement fee",
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
  };

  const currencyConversionJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${homeUrl}#currency-conversion`,
    name: "MRC GlobalPay Currency Conversion",
    provider: { "@type": "FinancialService", name: "MRC GlobalPay", url: homeUrl },
    serviceType: "CurrencyConversionService",
    description: "Instant non-custodial cryptocurrency conversion with 0.5% inclusive fee and 168-hour rate lock on invoices",
    areaServed: "Worldwide",
    termsOfService: "https://mrcglobalpay.com/terms",
    additionalType: "https://schema.org/FinancialProduct",
    "slogan": "Registration-Free Crypto Swap from $0.30"
  };

  const softwareAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${homeUrl}#app`,
    name: "MRC GlobalPay",
    url: homeUrl,
    description: t("meta.description"),
    applicationCategory: "FinanceApplication",
    operatingSystem: "Android, iOS, Windows, macOS",
    offers: {
      "@type": "Offer",
      price: "0.00",
      priceCurrency: "USD"
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("meta.title")}</title>
        <meta name="description" content={t("meta.description")} />
        <meta property="og:title" content={t("meta.ogTitle")} />
        <meta property="og:description" content={t("meta.description")} />
        <link rel="canonical" href={homeUrl} />
        <script type="application/ld+json">{JSON.stringify(financialServiceJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(currencyConversionJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(softwareAppJsonLd)}</script>
      </Helmet>

      <PullToRefresh onRefresh={handleRefresh}>
        <SiteHeader />

        <main>
          <HeroSection onTabChange={setActiveWidgetTab} />
          <TrustBanner />
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
          <div className="cv-auto">
            <SwapPairsQA />
          </div>
          <div className="cv-auto">
            <TrendingEcosystems />
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
