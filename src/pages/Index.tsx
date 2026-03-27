import { useCallback } from "react";
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
import SiteFooter from "@/components/SiteFooter";
import PullToRefresh from "@/components/PullToRefresh";
import ShadowSeoFaq from "@/components/ShadowSeoFaq";
import { Helmet } from "react-helmet-async";

const Index = () => {
  const financialServiceJsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "@id": "https://mrcglobalpay.com/#organization",
    name: "MRC GlobalPay",
    url: "https://mrcglobalpay.com",
    legalName: "MRC Global Pay",
    description:
      "Registered Money Services Business (MSB) offering instant, non-custodial crypto-to-crypto swaps with no minimums. 500+ assets supported.",
    image: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png",
    logo: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png",
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

        <script type="application/ld+json">{JSON.stringify(financialServiceJsonLd)}</script>
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
        <SiteFooter />
        <ShadowSeoFaq />
      </PullToRefresh>
    </>
  );
};

export default Index;
