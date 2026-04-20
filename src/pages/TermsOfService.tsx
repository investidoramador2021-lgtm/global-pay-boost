import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Helmet } from "react-helmet-async";
import { usePageUrl } from "@/hooks/use-page-url";

const TermsOfService = () => {
  const pageUrl = usePageUrl("/terms");
  return (
  <>
    <Helmet>
      <title>Terms of Service — MRC Global Pay</title>
      <meta name="description" content="MRC Global Pay terms of service for non-custodial cryptocurrency exchange. Read about user responsibilities, swap policies, and service limitations." />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={pageUrl} />
      <meta property="og:title" content="Terms of Service — MRC Global Pay" />
      <meta property="og:description" content="MRC Global Pay terms of service for non-custodial cryptocurrency exchange. Read about user responsibilities, swap policies, and service limitations." />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="MRC Global Pay" />
      <meta property="og:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Terms of Service — MRC Global Pay" />
        <meta name="twitter:description" content="MRC Global Pay terms of service for non-custodial cryptocurrency exchange." />
        <meta name="twitter:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
    </Helmet>
    <SiteHeader />
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">Terms of Service</h1>
      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <p><strong>Last updated:</strong> March 14, 2026</p>

        <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
        <p>By using MRC Global Pay, you agree to these Terms of Service. If you do not agree, please do not use our services.</p>

        <h2 className="text-xl font-semibold text-foreground">2. Services</h2>
        <p>MRC Global Pay provides a non-custodial cryptocurrency exchange service powered by ChangeNow. We facilitate the exchange of digital assets but do not hold or store your funds.</p>

        <h2 className="text-xl font-semibold text-foreground">3. Eligibility</h2>
        <p>You must be at least 18 years old and comply with the laws of your jurisdiction to use our services. Users from sanctioned countries are prohibited from using MRC Global Pay.</p>

        <h2 className="text-xl font-semibold text-foreground">4. User Responsibilities</h2>
        <p>You are responsible for providing correct wallet addresses and verifying transaction details before confirming an exchange. We are not liable for losses caused by incorrect addresses.</p>

        <h2 className="text-xl font-semibold text-foreground">5. Fees & Rates</h2>
        <p>Exchange rates are provided in real-time and may fluctuate. The final rate is determined at the time of the exchange. Network fees are not controlled by MRC Global Pay.</p>

        <h2 className="text-xl font-semibold text-foreground">6. Limitation of Liability</h2>
        <p>MRC Global Pay is provided "as is." We are not liable for losses arising from market volatility, network delays, or third-party service disruptions.</p>

        <h2 className="text-xl font-semibold text-foreground">7. Modifications</h2>
        <p>We reserve the right to update these terms at any time. Continued use of the service constitutes acceptance of updated terms.</p>
      </div>
    </main>
    <SiteFooter />
  </>
);
};

export default TermsOfService;
