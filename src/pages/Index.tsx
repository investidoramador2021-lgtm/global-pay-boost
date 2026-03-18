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
import { Helmet } from "react-helmet-async";

const Index = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "MRC GlobalPay",
    url: "https://mrcglobalpay.com",
    description:
      "Automated high-speed swap engine for 2026 high-performance tokens with zero settlement latency.",
    applicationCategory: "FinanceApplication",
    offers: {
      "@type": "Offer",
      category: "Cryptocurrency Exchange",
    },
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "MRC GlobalPay Instant Crypto Swap",
    serviceType: "CurrencyConversionService",
    description: "Automated high-speed swap engine for 2026 high-performance tokens with zero settlement latency. Direct-to-protocol liquidity bridges for HYPE, BERA, TIA, MONAD, and PYUSD.",
    provider: {
      "@type": "Organization",
      name: "MRC GlobalPay",
      url: "https://mrcglobalpay.com",
    },
    areaServed: "Worldwide",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Instant Crypto Swap Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Zero-Delay Settlement",
            description: "Pre-funded liquidity vaults with direct-to-protocol routing eliminate 3–6 confirmation wait times, delivering assets in under 60 seconds.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Instant Rate Aggregation",
            description: "Real-time rate aggregation from multiple top-tier liquidity providers for best market rates across 500+ digital assets.",
          },
        },
      ],
    },
    potentialAction: [
      {
        "@type": "TradeAction",
        name: "Swap HYPE to USDT",
        target: "https://mrcglobalpay.com/swap/hype-usdt",
      },
      {
        "@type": "TradeAction",
        name: "Swap BERA to USDC",
        target: "https://mrcglobalpay.com/swap/bera-usdt",
      },
      {
        "@type": "TradeAction",
        name: "Swap TIA to USDT",
        target: "https://mrcglobalpay.com/swap/tia-usdt",
      },
      {
        "@type": "TradeAction",
        name: "Swap MONAD to ETH",
        target: "https://mrcglobalpay.com/swap/monad-usdt",
      },
      {
        "@type": "TradeAction",
        name: "Swap PYUSD to SOL",
        target: "https://mrcglobalpay.com/swap/pyusd-usdt",
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Why is MRC GlobalPay the fastest way to swap HYPE and BERA?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our 2026 liquidity architecture utilizes pre-funded vaults and direct-to-protocol routing. This eliminates the 3–6 confirmation wait times common on standard exchanges, delivering assets to your wallet in under 60 seconds.",
        },
      },
      {
        "@type": "Question",
        name: "How long does a BTC to USDT swap take on MRC GlobalPay?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our liquidity rails execute BTC to USDT swaps instantly, typically settling in under 1 minute with zero confirmation delays.",
        },
      },
      {
        "@type": "Question",
        name: "Can I swap ETH to SOL without creating an account?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. MRC GlobalPay requires zero registration. Enter your SOL wallet address, send your ETH, and receive SOL within 45-90 seconds.",
        },
      },
      {
        "@type": "Question",
        name: "Is MRC GlobalPay safe to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. All transactions are encrypted end-to-end. We never custody your funds — crypto flows directly between your wallet and our liquidity partners.",
        },
      },
    ],
  };

  const handleRefresh = useCallback(async () => {
    // Force re-fetch of exchange rates by invalidating queries
    await new Promise((resolve) => setTimeout(resolve, 1000));
    window.dispatchEvent(new CustomEvent("pull-refresh"));
  }, []);

  return (
    <>
      <Helmet>
        <title>MRC GlobalPay | Anonymous Crypto Dust Swap | Accountless Trading</title>
        <meta
          name="description"
          content="Swap crypto dust as low as $0.60. No registration or accounts required. 500+ tokens supported. The fastest way to clean your wallet and convert small balances privately."
        />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href="https://mrcglobalpay.com" />
        <meta property="og:title" content="MRC GlobalPay — Instant Crypto Swaps" />
        <meta property="og:description" content="Stop waiting for confirmations. Swap HYPE, SOL, BERA and 500+ coins in under 60 seconds with automated settlement." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mrcglobalpay.com" />
        <meta property="og:site_name" content="MRC GlobalPay" />
        <meta property="og:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MRC GlobalPay — Instant Crypto Swaps | Zero Delays" />
        <meta name="twitter:description" content="Swap HYPE, BERA, TIA, MONAD, PYUSD and 500+ coins instantly. Zero delays. 2026 liquidity rails." />
        <meta name="twitter:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceJsonLd)}</script>
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
      </PullToRefresh>
    </>
  );
};

export default Index;
