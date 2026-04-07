import { Helmet } from "react-helmet-async";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Shield, DollarSign, Users, Zap, Mail } from "lucide-react";

const Referral = () => (
  <>
    <Helmet>
      <title>Referral Partner Program — Earn 15% | MRC GlobalPay</title>
      <meta name="description" content="Earn 15% of every exchange fee with MRC GlobalPay's referral program. Weekly USDT/SOL payouts. No registration required for partners. Contact us for your unique tracking ID." />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      <link rel="canonical" href="https://mrcglobalpay.com/referral" />
      <meta property="og:title" content="Referral Partner Program — Earn 15% | MRC GlobalPay" />
      <meta property="og:description" content="Earn 15% of every exchange fee. Weekly USDT/SOL payouts. No registration required." />
      <meta property="og:url" content="https://mrcglobalpay.com/referral" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Referral Partner Program",
        description: "Earn 15% of every exchange fee with MRC GlobalPay's referral program.",
        url: "https://mrcglobalpay.com/referral",
        publisher: {
          "@type": "Organization",
          name: "MRC GlobalPay",
          description: "Registered Canadian MSB (FINTRAC M23225638) — non-custodial cryptocurrency exchange.",
        },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://mrcglobalpay.com/" },
            { "@type": "ListItem", position: 2, name: "Referral Program", item: "https://mrcglobalpay.com/referral" },
          ],
        },
      })}</script>
    </Helmet>
    <SiteHeader />
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Referral <span className="text-primary">Partner Program</span>
          </h1>
          <p className="mt-6 font-body text-lg leading-relaxed text-muted-foreground">
            Earn passive income by referring users to MRC GlobalPay. Our partner program rewards you with <strong>15% of the exchange fee</strong> for every successful referral swap.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-2">
          {[
            { icon: DollarSign, title: "15% Revenue Share", desc: "Earn 15% of the exchange fee on every successful swap made through your unique referral link." },
            { icon: Zap, title: "Weekly Payouts", desc: "Referral commissions are settled weekly in USDT or SOL — directly to your wallet." },
            { icon: Users, title: "No Registration Required", desc: "Partners don't need to create an account. Contact us for a unique tracking ID and start earning immediately." },
            { icon: Shield, title: "Transparent Tracking", desc: "Real-time dashboard showing clicks, conversions, and earned commissions. Full transparency guaranteed." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <item.icon className="h-8 w-8 text-primary" />
              <h2 className="mt-4 font-display text-lg font-semibold text-foreground">{item.title}</h2>
              <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-2xl rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-foreground">How It Works</h2>
          <ol className="mt-6 space-y-4 text-left font-body text-sm text-muted-foreground">
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span> Contact us at <a href="mailto:partners@mrcglobalpay.com" className="text-primary hover:underline">partners@mrcglobalpay.com</a> to receive your unique tracking ID.</li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span> Share your referral link: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">mrcglobalpay.com/?ref=YOUR_ID</code></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span> Earn 15% of the exchange fee for every completed swap. Payouts every week in USDT or SOL.</li>
          </ol>
        </div>

        <div className="mx-auto mt-12 max-w-xl text-center">
          <h2 className="font-display text-xl font-semibold text-foreground">Ready to Partner?</h2>
          <p className="mt-3 font-body text-sm text-muted-foreground">
            Email us at{" "}
            <a href="mailto:partners@mrcglobalpay.com" className="inline-flex items-center gap-1 text-primary hover:underline">
              <Mail className="h-4 w-4" /> partners@mrcglobalpay.com
            </a>{" "}
            to get started. No minimum volume requirements.
          </p>
        </div>
      </section>
    </main>
    <SiteFooter />
  </>
);

export default Referral;
