import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Helmet } from "react-helmet-async";

const AMLPolicy = () => (
  <>
    <Helmet>
      <title>AML Policy — MRC GlobalPay</title>
      <meta name="description" content="MRC GlobalPay anti-money laundering policy for cryptocurrency exchange services." />
    </Helmet>
    <SiteHeader />
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">Anti-Money Laundering (AML) Policy</h1>
      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <p><strong>Last updated:</strong> March 14, 2026</p>

        <h2 className="text-xl font-semibold text-foreground">1. Purpose</h2>
        <p>MRC GlobalPay is committed to preventing money laundering, terrorist financing, and other financial crimes. This policy outlines our compliance measures.</p>

        <h2 className="text-xl font-semibold text-foreground">2. KYC Procedures</h2>
        <p>For transactions exceeding certain thresholds, we may require identity verification. This may include government-issued ID and proof of address.</p>

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

export default AMLPolicy;
