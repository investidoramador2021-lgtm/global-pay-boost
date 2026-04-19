import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { ProgramsNav, ProgramsFooterLinks } from "@/components/ProgramsNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bitcoin,
  Share2,
  Wallet,
  Zap,
  ShieldCheck,
  Mail,
  ArrowRight,
  Link2,
  Users,
  Clock,
  Gift,
} from "lucide-react";

const stripLangPrefix = (pathname: string) => {
  const langs = ["en", "es", "fr", "pt", "tr", "uk", "vi", "hi", "ja", "fa", "ur", "he", "af"];
  const seg = pathname.split("/")[1];
  return langs.includes(seg) ? `/${pathname.split("/").slice(2).join("/")}` : pathname;
};

const Referral = () => {
  const { pathname } = useLocation();
  const lang = (() => {
    const seg = pathname.split("/")[1];
    const langs = ["en", "es", "fr", "pt", "tr", "uk", "vi", "hi", "ja", "fa", "ur", "he", "af"];
    return langs.includes(seg) ? `/${seg}` : "";
  })();
  const lp = (p: string) => `${lang}${p}`;

  const benefits = [
    { icon: Bitcoin, title: "Paid in BTC", desc: "Every commission is settled in real Bitcoin — no points, no internal credits." },
    { icon: Zap, title: "Lifetime tracking", desc: "Earn on every swap your referred users make, forever — not just the first transaction." },
    { icon: Wallet, title: "No minimums", desc: "There is no minimum payout threshold and no minimum traffic requirement to start." },
    { icon: Share2, title: "One simple link", desc: "Share a single referral URL — no dashboards, no embeds, no technical setup needed." },
    { icon: Clock, title: "Auto-payouts", desc: "Commissions are credited automatically to your BTC wallet on a recurring schedule." },
    { icon: ShieldCheck, title: "Regulated platform", desc: "Refer to a FINTRAC-registered Canadian MSB — not an offshore exchange." },
  ];

  const steps = [
    { n: 1, title: "Request your referral link", desc: "Email us with your name and BTC payout wallet. We reply with your unique tracking link, usually within one business day." },
    { n: 2, title: "Share it anywhere", desc: "Post it on social media, in chats, on your blog, in your YouTube description, or send it directly to friends and clients." },
    { n: 3, title: "Earn BTC on every swap", desc: "When someone uses your link to swap crypto, you earn a lifetime commission in BTC — paid automatically." },
  ];

  return (
    <>
      <Helmet>
        <title>Referral Program — Earn Lifetime BTC on Every Swap | MRC GlobalPay</title>
        <meta
          name="description"
          content="Share one link, earn lifetime BTC commissions on every crypto swap. No registration, no minimums. Backed by FINTRAC MSB C100000015 and Bank of Canada PSP registration."
        />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <link rel="canonical" href="https://mrcglobalpay.com/referral" />
        <meta property="og:title" content="Referral Program — Earn Lifetime BTC on Every Swap | MRC GlobalPay" />
        <meta
          property="og:description"
          content="Refer users to a regulated Canadian non-custodial swap platform and earn lifetime BTC commissions. Zero setup, paid automatically."
        />
        <meta property="og:url" content="https://mrcglobalpay.com/referral" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Referral Program",
          description: "Earn lifetime BTC commissions by referring users to MRC GlobalPay, a FINTRAC-registered Canadian non-custodial crypto swap platform.",
          url: "https://mrcglobalpay.com/referral",
          publisher: {
            "@type": "Organization",
            name: "MRC GlobalPay",
            description: "Registered Canadian MSB (FINTRAC C100000015) and Bank of Canada PSP — non-custodial cryptocurrency exchange.",
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
      <ProgramsNav active="referral" />

      <main className="min-h-screen bg-background">

        {/* Hero */}
        <section className="container mx-auto px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Gift className="h-3.5 w-3.5" /> Referral Program — no account required
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Share One Link. <span className="text-primary">Earn Lifetime BTC.</span>
            </h1>
            <p className="mt-6 font-body text-lg leading-relaxed text-muted-foreground">
              The simplest way to earn from MRC GlobalPay. Recommend our regulated, non-custodial crypto swap to friends, followers, or clients — and receive automatic Bitcoin commissions on every swap they make, for life.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <a href="mailto:partners@mrcglobalpay.com?subject=Referral%20Link%20Request">
                  <Mail className="h-4 w-4" /> Request my referral link
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to={lp("/affiliates")}>
                  Compare with Affiliate Program <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No signup forms. No minimum volume. Paid in BTC.
            </p>
          </div>
        </section>

        {/* Benefits grid */}
        <section className="container mx-auto px-4 pb-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl text-center">
              Why people refer MRC GlobalPay
            </h2>
            <p className="mt-3 text-center font-body text-sm text-muted-foreground max-w-2xl mx-auto">
              We pay real Bitcoin, on a regulated Canadian platform, with zero friction for you or the person you refer.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((b) => (
                <Card key={b.title} className="border-border/60 bg-card">
                  <CardContent className="p-6">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <b.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-semibold text-foreground">{b.title}</h3>
                    <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl text-center">
                How the Referral Program works
              </h2>
              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {steps.map((s) => (
                  <div key={s.n} className="rounded-xl border border-border bg-card p-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {s.n}
                    </div>
                    <h3 className="mt-4 font-display text-base font-semibold text-foreground">{s.title}</h3>
                    <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-lg border border-border bg-card p-4 text-center">
                <p className="font-body text-sm text-muted-foreground">
                  Your referral link looks like this:{" "}
                  <code className="rounded bg-muted px-2 py-1 text-xs font-mono text-foreground">
                    mrcglobalpay.com/?ref=YOUR_CODE
                  </code>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Commission clarity */}
        <section className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-3xl rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
            <Bitcoin className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 font-display text-2xl font-bold text-foreground">How much you earn</h2>
            <p className="mt-3 font-body text-base leading-relaxed text-muted-foreground">
              Referrers earn a lifetime commission in BTC on every successful swap made through their link. Commission rates align with our published affiliate tiers (<strong>0.1% – 0.4%</strong> of swap volume), with the exact rate depending on your monthly referred volume.
            </p>
            <p className="mt-3 font-body text-sm text-muted-foreground">
              Want full tier transparency, marketing assets, and a real-time dashboard?{" "}
              <Link to={lp("/affiliates")} className="font-medium text-primary hover:underline">
                Switch to the Affiliate Program
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Regulatory edge */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <div className="text-center">
                <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
                <h2 className="mt-4 font-display text-2xl font-bold text-foreground sm:text-3xl">
                  Refer with confidence — not to an offshore exchange
                </h2>
                <p className="mt-3 mx-auto max-w-2xl font-body text-sm leading-relaxed text-muted-foreground">
                  MRC GlobalPay is operated by MRC Pay International Corp from Ottawa, Canada. We are a fully registered Money Services Business and a registered Payment Service Provider — your audience is referred to a compliant, non-custodial platform.
                </p>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <a
                  href="https://www10.fintrac-canafe.gc.ca/msb-esm/public/msb-search/search-by-name/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-border bg-card p-5 transition hover:border-primary/40"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">FINTRAC MSB</p>
                  <p className="mt-2 font-display text-lg font-semibold text-foreground">#C100000015</p>
                  <p className="mt-1 text-xs text-muted-foreground">Verify on the FINTRAC public registry →</p>
                </a>
                <a
                  href="https://www.bankofcanada.ca/core-functions/criminal-code-amendment-act/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-border bg-card p-5 transition hover:border-primary/40"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bank of Canada</p>
                  <p className="mt-2 font-display text-lg font-semibold text-foreground">PSP Registered</p>
                  <p className="mt-1 text-xs text-muted-foreground">Retail Payment Activities Act registrant →</p>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Compare programs */}
        <section className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl text-center">
              Which program is right for you?
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-6">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Link2 className="h-4 w-4" />
                  </div>
                  <h3 className="mt-3 font-display text-base font-semibold text-foreground">Referral (this page)</h3>
                  <p className="mt-2 font-body text-xs text-muted-foreground">
                    One link, no setup. Best for casual sharers, friends, and small communities.
                  </p>
                  <p className="mt-3 text-xs font-semibold text-primary">You are here →</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Share2 className="h-4 w-4" />
                  </div>
                  <h3 className="mt-3 font-display text-base font-semibold text-foreground">Affiliate Program</h3>
                  <p className="mt-2 font-body text-xs text-muted-foreground">
                    Embed our swap widget on your site, plus marketing assets and live dashboard.
                  </p>
                  <Link to={lp("/affiliates")} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                    Visit /affiliates <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Users className="h-4 w-4" />
                  </div>
                  <h3 className="mt-3 font-display text-base font-semibold text-foreground">Partner Program</h3>
                  <p className="mt-2 font-body text-xs text-muted-foreground">
                    Private dashboard, settlement reporting, and negotiated rates for high-volume referrers.
                  </p>
                  <Link to={lp("/partners")} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                    Visit /partners <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 pb-20">
          <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <h2 className="font-display text-2xl font-bold text-foreground">Ready to start earning BTC?</h2>
            <p className="mt-3 font-body text-sm text-muted-foreground">
              Email us with your name and BTC payout wallet — we'll send your unique referral link within one business day. No paperwork, no minimums.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <a href="mailto:partners@mrcglobalpay.com?subject=Referral%20Link%20Request">
                  <Mail className="h-4 w-4" /> partners@mrcglobalpay.com
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to={lp("/partners")}>
                  Explore Partner Program <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <ProgramsFooterLinks active="referral" />
      <SiteFooter />
    </>
  );
};

export default Referral;
