import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Helmet } from "react-helmet-async";
import { usePageUrl } from "@/hooks/use-page-url";

const AMLPolicy = () => {
  const pageUrl = usePageUrl("/aml");
  return (
  <>
    <Helmet>
      <title>AML Policy — MRC Global Pay</title>
      <meta name="description" content="MRC Global Pay anti-money laundering (AML) policy for cryptocurrency exchange services. Learn about our FINTRAC compliance and transaction monitoring procedures." />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={pageUrl} />
      <meta property="og:title" content="AML Policy — MRC Global Pay" />
      <meta property="og:description" content="MRC Global Pay anti-money laundering (AML) policy for cryptocurrency exchange services. FINTRAC compliance and transaction monitoring." />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="MRC Global Pay" />
      <meta property="og:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="AML Policy — MRC Global Pay" />
        <meta name="twitter:description" content="MRC Global Pay anti-money laundering (AML) policy. FINTRAC compliance and transaction monitoring." />
        <meta name="twitter:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
    </Helmet>
    <SiteHeader />
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">Anti-Money Laundering (AML) Policy</h1>
      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <p><strong>Last updated:</strong> March 14, 2026</p>

        <h2 className="text-xl font-semibold text-foreground">1. Purpose</h2>
        <p>MRC Global Pay is committed to preventing money laundering, terrorist financing, and other financial crimes. This policy outlines our compliance measures.</p>

        <h2 className="text-xl font-semibold text-foreground">2. Regulatory Status</h2>
        <p>
          MRC Global Pay is a <strong>FINTRAC-registered Money Services Business (MSB: C100000015)</strong> and an{" "}
          <a
            href="https://www.bankofcanada.ca/core-functions/retail-payments-supervision/psp-registry/psp-registry-details/?account_id=408b884a-1aa1-ef11-a72d-0022483bf164"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
          >
            authorized Payment Service Provider (PSP) supervised by the Bank of Canada
          </a>{" "}
          under the Retail Payment Activities Act (RPAA). We operate under both the PCMLTFA and RPAA frameworks.
        </p>

        <h2 className="text-xl font-semibold text-foreground">2. Identity Verification Procedures</h2>
        <p>For transactions exceeding certain thresholds or flagged by our automated risk-prevention system, we may request standard identity verification. This may include government-issued ID and proof of address.</p>

        <h2 className="text-xl font-semibold text-foreground">3. Transaction Monitoring</h2>
        <p>All transactions are monitored for suspicious activity using automated systems. Transactions flagged as suspicious may be delayed or cancelled.</p>

        <h2 className="text-xl font-semibold text-foreground">4. Sanctions Compliance</h2>
        <p>We screen all transactions against international sanctions lists including OFAC, EU, and UN sanctions. Services are not available to residents of sanctioned jurisdictions.</p>

        <h2 className="text-xl font-semibold text-foreground">5. Reporting</h2>
        <p>We report suspicious activities to the relevant authorities as required by law. We cooperate fully with law enforcement investigations.</p>

        <h2 className="text-xl font-semibold text-foreground">6. Record Keeping</h2>
        <p>Transaction records are maintained for the period required by applicable regulations to support any future investigations.</p>
      </div>
    </main>
    <SiteFooter />
  </>
);
};

export default AMLPolicy;
