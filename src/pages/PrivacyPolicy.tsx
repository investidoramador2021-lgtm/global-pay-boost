import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Helmet } from "react-helmet-async";

const PrivacyPolicy = () => (
  <>
    <Helmet>
      <title>Privacy Policy — MRC GlobalPay</title>
      <meta name="description" content="MRC GlobalPay privacy policy. Learn how we handle your data during cryptocurrency exchanges." />
    </Helmet>
    <SiteHeader />
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>
      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <p><strong>Last updated:</strong> March 14, 2026</p>

        <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
        <p>MRC GlobalPay does not require account registration. We may collect minimal data necessary to process your exchange, including wallet addresses, transaction amounts, and IP addresses for security purposes.</p>

        <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
        <p>We use collected information solely to facilitate cryptocurrency exchanges, prevent fraud, comply with applicable laws, and improve our services.</p>

        <h2 className="text-xl font-semibold text-foreground">3. Data Sharing</h2>
        <p>We do not sell your personal data. We may share transaction data with our exchange partner (ChangeNow) to process your swap. We may disclose information if required by law.</p>

        <h2 className="text-xl font-semibold text-foreground">4. Cookies</h2>
        <p>We use essential cookies to ensure the website functions properly. No tracking or advertising cookies are used.</p>

        <h2 className="text-xl font-semibold text-foreground">5. Data Retention</h2>
        <p>Transaction data is retained for the minimum period required by applicable regulations. Non-essential data is deleted after 30 days.</p>

        <h2 className="text-xl font-semibold text-foreground">6. Your Rights</h2>
        <p>You may request access to, correction of, or deletion of your personal data by contacting us.</p>

        <h2 className="text-xl font-semibold text-foreground">7. Contact</h2>
        <p>For privacy-related inquiries, please contact us at privacy@mrcglobalpay.com.</p>
      </div>
    </main>
    <SiteFooter />
  </>
);

export default PrivacyPolicy;
