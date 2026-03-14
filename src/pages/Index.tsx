import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/HeroSection";
import TrustBanner from "@/components/TrustBanner";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PopularPairsSection from "@/components/PopularPairsSection";
import FAQSection from "@/components/FAQSection";
import SiteFooter from "@/components/SiteFooter";
import { Helmet } from "react-helmet-async";

const Index = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "MRC GlobalPay",
    url: "https://mrcglobalpay.com",
    description:
      "Exchange 500+ cryptocurrencies instantly with the best rates. No registration required. Fast, secure, and anonymous crypto swaps.",
    applicationCategory: "FinanceApplication",
    offers: {
      "@type": "Offer",
      category: "Cryptocurrency Exchange",
    },
  };

  return (
    <>
      <Helmet>
        <title>MRC GlobalPay — Fast & Secure Crypto Exchange | 500+ Coins</title>
        <meta
          name="description"
          content="Exchange 500+ cryptocurrencies instantly with the best rates. No registration required. Swap BTC, ETH, SOL, USDT and more in under 2 minutes."
        />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href="https://mrcglobalpay.com" />
        <meta property="og:title" content="MRC GlobalPay — Fast & Secure Crypto Exchange | 500+ Coins" />
        <meta property="og:description" content="Swap 500+ cryptocurrencies instantly. No registration. Best rates guaranteed." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mrcglobalpay.com" />
        <meta property="og:site_name" content="MRC GlobalPay" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <SiteHeader />
      <main>
        <HeroSection />
        <TrustBanner />
        <FeaturesSection />
        <HowItWorksSection />
        <PopularPairsSection />
        <FAQSection />
      </main>
      <SiteFooter />
    </>
  );
};

export default Index;
