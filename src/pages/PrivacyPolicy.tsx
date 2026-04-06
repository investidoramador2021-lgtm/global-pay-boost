import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, Shield, Lock, Eye, Cookie, Server, Users } from "lucide-react";
import { usePageUrl } from "@/hooks/use-page-url";

const PrivacyPolicy = () => {
  const pageUrl = usePageUrl("/privacy");
  return (
  <>
    <Helmet>
      <title>Privacy Policy — MRC GlobalPay</title>
      <meta name="description" content="MRC GlobalPay privacy policy. Learn how we handle your data during cryptocurrency exchanges. Non-custodial, no private keys stored." />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={pageUrl} />
      <meta property="og:title" content="Privacy Policy — MRC GlobalPay" />
      <meta property="og:description" content="MRC GlobalPay privacy policy. Learn how we handle your data during cryptocurrency exchanges. Non-custodial, no private keys stored." />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="MRC GlobalPay" />
      <meta property="og:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Privacy Policy — MRC GlobalPay" />
        <meta name="twitter:description" content="MRC GlobalPay privacy policy. Learn how we handle your data during cryptocurrency exchanges." />
        <meta name="twitter:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
    </Helmet>
    <SiteHeader />
    <main className="relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(hsl(var(--neon)) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="container relative mx-auto max-w-3xl px-4 py-10 sm:py-16">
        {/* Back to Swap button */}
        <Button variant="outline" size="sm" className="mb-8 shadow-neon border-primary/30" asChild>
          <a href="/#exchange">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Swap
          </a>
        </Button>

        {/* Page Header */}
        <div className="mb-10 sm:mb-14">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-display text-xs font-bold uppercase tracking-widest text-primary">Legal</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 font-body text-base text-muted-foreground sm:text-lg">
            How MRC GlobalPay protects your data during cryptocurrency exchanges.
          </p>
          <p className="mt-2 font-body text-sm text-muted-foreground">
            <strong className="text-foreground">Last updated:</strong> March 15, 2026
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 sm:space-y-14">

          {/* 1. Overview */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-bold text-primary sm:text-2xl">1. Overview</h2>
            </div>
            <div className="space-y-3 font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>
                MRC GlobalPay ("we", "our", "us") is a <strong className="text-foreground">non-custodial</strong> cryptocurrency swap platform. This Privacy Policy describes how we collect, use, and protect information when you use our services at mrcglobalpay.com (the "Service").
              </p>
              <p>
                By using the Service, you consent to the practices described in this policy. If you do not agree, please discontinue use of the Service.
              </p>
            </div>
          </section>

          {/* 2. Data Collection */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-bold text-primary sm:text-2xl">2. Data Collection</h2>
            </div>
            <div className="space-y-4 font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
                <p className="font-semibold text-foreground">🔐 We do NOT store private keys or custodial funds.</p>
                <p className="mt-1">
                  MRC GlobalPay is fully non-custodial. At no point do we have access to, store, or manage your private keys, seed phrases, or wallet passwords. All funds flow directly between your wallet and our liquidity partners.
                </p>
              </div>
              <p>We collect <strong className="text-foreground">only the minimum data</strong> required to facilitate your swap:</p>
              <ul className="ml-4 list-disc space-y-2">
                <li><strong className="text-foreground">Public wallet addresses</strong> — The recipient and refund addresses you provide to process the exchange.</li>
                <li><strong className="text-foreground">Transaction hashes</strong> — On-chain transaction IDs used to track the status of your swap and resolve any issues.</li>
                <li><strong className="text-foreground">Exchange amounts</strong> — The token pair and amounts selected for the swap.</li>
                <li><strong className="text-foreground">IP address</strong> — Collected for fraud prevention and compliance purposes. Not linked to wallet addresses or personal identity.</li>
              </ul>
              <p>
                We do <strong className="text-foreground">not</strong> require registration, email addresses, phone numbers, or any form of personal identification to use the Service.
              </p>
            </div>
          </section>

          {/* 3. Third-Party Services */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-bold text-primary sm:text-2xl">3. Third-Party Services</h2>
            </div>
            <div className="space-y-4 font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>Our exchange services are powered by the <strong className="text-foreground">ChangeNOW API</strong>. When you initiate a swap, the following data is shared with ChangeNOW to process the conversion:</p>
              <ul className="ml-4 list-disc space-y-2">
                <li>Source and destination cryptocurrency pair</li>
                <li>Exchange amount</li>
                <li>Recipient wallet address</li>
                <li>Refund address (if provided)</li>
              </ul>
              <p>
                ChangeNOW's own privacy policy governs how they handle data during the actual conversion process. We recommend reviewing their policy at{" "}
                <a href="https://changenow.io/privacy-policy" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80">
                  changenow.io/privacy-policy
                </a>.
              </p>
              <p>We may also use the following third-party services:</p>
              <ul className="ml-4 list-disc space-y-2">
                <li><strong className="text-foreground">Trustpilot</strong> — For displaying customer reviews. Trustpilot's privacy policy applies to review submissions.</li>
                <li><strong className="text-foreground">Analytics providers</strong> — For basic performance monitoring (see Section 5).</li>
              </ul>
            </div>
          </section>

          {/* 4. Personal & Sensitive Information (Google Play) */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-bold text-primary sm:text-2xl">4. Personal & Sensitive Information</h2>
            </div>
            <div className="space-y-4 font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>In compliance with Google Play and app store data safety requirements:</p>
              <ul className="ml-4 list-disc space-y-2">
                <li><strong className="text-foreground">We do NOT sell, rent, or trade user data</strong> to any third party for advertising, profiling, or any other purpose.</li>
                <li><strong className="text-foreground">All API communications</strong> between the app and our servers use <strong className="text-foreground">industry-standard TLS/SSL encryption</strong> (HTTPS) to protect data in transit.</li>
                <li><strong className="text-foreground">No personal data is stored</strong> on our servers beyond what is required to complete the active exchange session.</li>
                <li>We do not collect financial information such as credit card numbers, bank account details, or payment credentials.</li>
                <li>We do not access device contacts, camera, microphone, or location data.</li>
              </ul>
            </div>
          </section>

          {/* 5. Cookies & Analytics */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-bold text-primary sm:text-2xl">5. Cookies & Local Storage</h2>
            </div>
            <div className="space-y-4 font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>MRC GlobalPay uses minimal client-side storage:</p>
              <ul className="ml-4 list-disc space-y-2">
                <li><strong className="text-foreground">Local Storage</strong> — Used to store your theme preference (light/dark mode) and recent swap history for your convenience. This data remains on your device and is never transmitted to our servers.</li>
                <li><strong className="text-foreground">Service Worker Cache</strong> — Core application assets are cached locally for faster loading and offline access. No personal data is stored in the cache.</li>
                <li><strong className="text-foreground">Performance Analytics</strong> — We collect aggregated, non-identifiable usage data (page views, session duration, device type) to improve the Service. This data cannot identify individual users.</li>
              </ul>
              <p>
                We do <strong className="text-foreground">not</strong> use tracking cookies, advertising cookies, or cross-site tracking of any kind.
              </p>
            </div>
          </section>

          {/* 6. Data Retention */}
          <section>
            <h2 className="mb-4 font-display text-xl font-bold text-primary sm:text-2xl">6. Data Retention</h2>
            <div className="space-y-3 font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>
                Transaction data (wallet addresses, transaction hashes, amounts) is retained for a maximum of <strong className="text-foreground">30 days</strong> to facilitate support inquiries and dispute resolution. After this period, data is permanently deleted from our systems.
              </p>
              <p>
                IP addresses collected for fraud prevention are retained for a maximum of <strong className="text-foreground">90 days</strong> and then permanently purged.
              </p>
            </div>
          </section>

          {/* 7. Data Security */}
          <section>
            <h2 className="mb-4 font-display text-xl font-bold text-primary sm:text-2xl">7. Data Security</h2>
            <div className="space-y-3 font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>We implement appropriate technical and organizational measures to protect the data we process, including:</p>
              <ul className="ml-4 list-disc space-y-2">
                <li>End-to-end TLS/SSL encryption for all API communications</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Strict access controls limiting data access to authorized personnel only</li>
                <li>No storage of private keys or custodial funds at any point</li>
              </ul>
            </div>
          </section>

          {/* 8. Your Rights */}
          <section>
            <h2 className="mb-4 font-display text-xl font-bold text-primary sm:text-2xl">8. Your Rights</h2>
            <div className="space-y-3 font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul className="ml-4 list-disc space-y-2">
                <li><strong className="text-foreground">Access</strong> — Request a copy of any data we hold about your transactions.</li>
                <li><strong className="text-foreground">Deletion</strong> — Request the deletion of your transaction data before the standard retention period.</li>
                <li><strong className="text-foreground">Correction</strong> — Request correction of any inaccurate data.</li>
                <li><strong className="text-foreground">Portability</strong> — Request your data in a machine-readable format.</li>
              </ul>
              <p>
                To exercise any of these rights, contact us at{" "}
                <a href="mailto:privacy@mrcglobalpay.com" className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80">
                  privacy@mrcglobalpay.com
                </a>.
              </p>
            </div>
          </section>

          {/* 9. Children's Privacy */}
          <section>
            <h2 className="mb-4 font-display text-xl font-bold text-primary sm:text-2xl">9. Children's Privacy</h2>
            <div className="space-y-3 font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>
                The Service is not intended for individuals under the age of 18. We do not knowingly collect data from minors. If you believe a minor has used the Service, please contact us to request deletion of any related data.
              </p>
            </div>
          </section>

          {/* 10. Changes to This Policy */}
          <section>
            <h2 className="mb-4 font-display text-xl font-bold text-primary sm:text-2xl">10. Changes to This Policy</h2>
            <div className="space-y-3 font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>
                We may update this Privacy Policy from time to time. Material changes will be reflected by updating the "Last updated" date at the top of this page. Continued use of the Service after changes constitutes acceptance of the updated policy.
              </p>
            </div>
          </section>

          {/* 11. Contact */}
          <section>
            <h2 className="mb-4 font-display text-xl font-bold text-primary sm:text-2xl">11. Contact Us</h2>
            <div className="space-y-3 font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>For privacy-related inquiries, data requests, or concerns, please contact:</p>
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
                <p className="font-semibold text-foreground">MRC GlobalPay — Privacy Team</p>
                <p>
                  Email:{" "}
                  <a href="mailto:privacy@mrcglobalpay.com" className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80">
                    privacy@mrcglobalpay.com
                  </a>
                </p>
                <p>Website: mrcglobalpay.com</p>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 flex flex-col items-center gap-4 border-t border-border pt-8 sm:mt-16 sm:flex-row sm:justify-between">
          <Button variant="outline" size="sm" className="shadow-neon border-primary/30" asChild>
            <a href="/#exchange">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Swap
            </a>
          </Button>
          <Button size="sm" className="shadow-neon" asChild>
            <a href="/#exchange">
              <Zap className="mr-2 h-4 w-4" />
              Start Swapping
            </a>
          </Button>
        </div>
      </div>
    </main>
    <SiteFooter />
  </>
);
};

export default PrivacyPolicy;
