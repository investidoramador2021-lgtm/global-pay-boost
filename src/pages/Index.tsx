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
      "@type": "SearchAction",
      target: "https://mrcglobalpay.com/#exchange",
      name: "Swap Cryptocurrency",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Can I swap under $1 of crypto?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. MRC GlobalPay supports micro-swaps starting as low as $0.30, depending on the coin pair. We are the leading no-minimum crypto exchange for converting wallet dust.",
        },
      },
      {
        "@type": "Question",
        name: "Is there a minimum for Fractal Bitcoin swaps?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No enforced minimum. MRC GlobalPay is one of the first non-custodial platforms to support Fractal Bitcoin swaps to Solana, Ethereum, and 500+ tokens.",
        },
      },
      {
        "@type": "Question",
        name: "How do I clean crypto dust from my wallet?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use MRC GlobalPay to convert small, unspendable balances (crypto dust) into usable tokens. No account creation required — just select your dust token, enter any amount from $0.30, and swap instantly.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to create an account or provide ID?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. We offer a completely accountless, permissionless trading experience. Swap wallet-to-wallet instantly without any onboarding or registration.",
        },
      },
      {
        "@type": "Question",
        name: "Is the exchange rate guaranteed?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. When you select our Fixed Rate option, the amount you see is exactly what you get. We protect you from price volatility during the transaction.",
        },
      },
      {
        "@type": "Question",
        name: "Which tokens are supported for dust swaps?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We support over 500+ assets, including BTC, ETH, SOL, Fractal Bitcoin, and dozens of low-cap tokens. If it's in your wallet, you can likely swap it here.",
        },
      },
    ],
  };

  const handleRefresh = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    window.dispatchEvent(new CustomEvent("pull-refresh"));
  }, []);

  return (
    <>
      <Helmet>
        <title>MRC GlobalPay | No Minimum Crypto Exchange</title>
        <meta
          name="description"
          content="Instant, accountless crypto swaps with no minimums. Support for Fractal Bitcoin, Solana, and 500+ assets. Convert wallet dust under $1 securely."
        />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href="https://mrcglobalpay.com/" />
        <meta property="og:title" content="MRC GlobalPay | No Minimum Crypto Exchange | Swap Dust from $0.30" />
        <meta property="og:description" content="Instant, accountless crypto swaps with no minimums. Support for Fractal Bitcoin, Solana, and 500+ assets. Convert wallet dust under $1 securely." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mrcglobalpay.com" />
        <meta property="og:site_name" content="MRC GlobalPay" />
        <meta property="og:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MRC GlobalPay | No Minimum Crypto Exchange | Swap Dust from $0.30" />
        <meta name="twitter:description" content="Instant, accountless crypto swaps with no minimums. Support for Fractal Bitcoin, Solana, and 500+ assets. Convert wallet dust under $1 securely." />
        <meta name="twitter:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
        <script type="application/ld+json">{JSON.stringify(financialServiceJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
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
