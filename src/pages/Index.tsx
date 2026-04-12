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
...
          <FeaturesSection />
          <NoLimitsSection />
          {activeWidgetTab !== "request" && <HowItWorksSection />}
          {activeWidgetTab === "request" && <InvoiceHowItWorks />}
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
