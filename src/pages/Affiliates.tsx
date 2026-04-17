import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
  Shield, Zap, Link2, DollarSign, Clock, ArrowRight, Infinity as InfinityIcon,
  LayoutDashboard, Wallet, Megaphone, Image as ImageIcon, Code2, FileText,
  Globe, Lock, CheckCircle2, AlertCircle, Copy, Check, BarChart3,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MsbTrustBar from "@/components/MsbTrustBar";

/* ─── JSON-LD ─── */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Affiliate Program — Earn Lifetime Crypto Commissions | MRC GlobalPay",
  description:
    "Join the MRC GlobalPay Affiliate Program. Earn 0.1%–0.4% lifetime revenue share on every crypto swap you refer. No minimum volume, fast crypto/fiat payouts, real-time dashboard.",
  url: "https://mrcglobalpay.com/affiliates",
  isPartOf: { "@type": "WebSite", name: "MRC GlobalPay", url: "https://mrcglobalpay.com" },
  publisher: {
    "@type": "Organization",
    name: "MRC GlobalPay",
    url: "https://mrcglobalpay.com",
    identifier: "C100000015",
    description:
      "MRC GlobalPay is a non-custodial crypto exchange — a Registered Canadian MSB (FINTRAC #C100000015).",
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://mrcglobalpay.com" },
      { "@type": "ListItem", position: 2, name: "Affiliate Program", item: "https://mrcglobalpay.com/affiliates" },
    ],
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much can I earn with the MRC GlobalPay Affiliate Program?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Affiliates earn between 0.1% and 0.4% revenue share on the total swap volume they refer. Higher rates apply based on volume and performance — custom rates are available for top partners.",
      },
    },
    {
      "@type": "Question",
      name: "Are commissions truly lifetime?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Once a user swaps through your unique referral link or embedded widget, you earn commission on every future swap they make — with no expiration date.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a minimum referred volume to qualify?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. There is no minimum volume requirement. You start earning from your very first referred swap.",
      },
    },
    {
      "@type": "Question",
      name: "How and when am I paid?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Payouts are fast and flexible. You can choose to be paid in crypto (BTC, USDT, USDC and more) or fiat. Balances are settled directly from the partner dashboard.",
      },
    },
  ],
};

/* ─── Earnings Calculator ─── */
const fmt = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${n.toFixed(0)}`;

const EarningsCalculator = () => {
  const [volume, setVolume] = useState([500000]);
  const tiers = useMemo(
    () => [
      { rate: 0.001, label: "0.1%", tone: "Entry" },
      { rate: 0.0025, label: "0.25%", tone: "Growth" },
      { rate: 0.004, label: "0.4%", tone: "Top Partner" },
    ],
    [],
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 transition-shadow hover:shadow-lg">
      <div className="flex flex-col gap-6">
        <div>
          <label className="font-display text-sm font-semibold text-foreground block mb-1">
            Monthly Referred Swap Volume
          </label>
          <p className="text-xs text-muted-foreground mb-4">
            Drag the slider to estimate your monthly earnings across each commission tier.
          </p>
          <Slider
            min={10000}
            max={5000000}
            step={10000}
            value={volume}
            onValueChange={setVolume}
            className="mb-2"
            aria-label="Monthly referred swap volume in USD"
          />
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>$10k</span>
            <span className="font-semibold text-foreground text-sm">{fmt(volume[0])}</span>
            <span>$5M</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tiers.map((t) => {
            const monthly = volume[0] * t.rate;
            return (
              <div
                key={t.label}
                className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center transition-all hover:border-primary/40 hover:-translate-y-0.5"
              >
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-semibold">
                  {t.tone} · {t.label}
                </p>
                <p className="font-display text-2xl font-bold text-primary mt-1">{fmt(monthly)}</p>
                <p className="text-[10px] text-muted-foreground mt-1">/month</p>
              </div>
            );
          })}
        </div>

        <a
          href="/partners"
          className="btn-shimmer inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-display text-sm font-bold text-primary-foreground transition-all duration-100 hover:bg-primary/90"
        >
          Apply for Partnership <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
};

/* ─── Data ─── */
const HERO_BENEFITS = [
  { icon: InfinityIcon, title: "Lifetime Commissions", desc: "Earn on every future swap — no expiration." },
  { icon: CheckCircle2, title: "No Minimum Volume", desc: "Start earning from your very first referral." },
  { icon: LayoutDashboard, title: "Real-Time Dashboard", desc: "Track clicks, swaps, and revenue live." },
  { icon: Wallet, title: "Fast Crypto / Fiat Payouts", desc: "Get paid in BTC, USDT, USDC or fiat." },
  { icon: Megaphone, title: "Easy Promotion Tools", desc: "Links, banners, and embeddable widget." },
];

const STEPS = [
  { n: 1, title: "Sign up (optional)", desc: "Registration is optional but recommended — get your personalized tools and instant Partner Dashboard access in under 2 minutes." },
  { n: 2, title: "Get your tools", desc: "Receive your unique referral link, downloadable banners, and an embeddable instant swap widget." },
  { n: 3, title: "Promote anywhere", desc: "Share on your website, blog, YouTube, Telegram, or anywhere your audience hangs out." },
  { n: 4, title: "Earn & track", desc: "Earn commissions on every referred swap — track them in your dashboard or via email/wallet." },
];

const TOOLS = [
  { icon: Link2, title: "Unique Referral Links", desc: "Tracked URLs with full attribution and real-time analytics." },
  { icon: ImageIcon, title: "Downloadable Banners", desc: "Multiple sizes and themes — light, dark, animated." },
  { icon: Code2, title: "Embeddable Swap Widget", desc: "Drop-in iframe widget that converts visitors directly on your site." },
  { icon: Globe, title: "API & Developer Integration", desc: "Build custom flows with our full API.", href: "/developer" },
  { icon: FileText, title: "Promo Text Snippets", desc: "Ready-made copy for social, email, and articles." },
];

const WHY_CHOOSE = [
  { icon: Zap, title: "6,000+ Cryptocurrencies & Tokenized Stocks", desc: "Promote one of the deepest asset catalogs in the industry." },
  { icon: Lock, title: "Non-Custodial by Design", desc: "Wallet-to-wallet settlement — no funds held, no account required for users." },
  { icon: Shield, title: "Registered Canadian MSB #C100000015", desc: "FINTRAC Compliant & Regulated — promote a trusted, regulated brand." },
  { icon: Clock, title: "Instant Swaps from $0.30", desc: "Industry-low minimums convert more clicks into revenue." },
  { icon: DollarSign, title: "Up to 0.4% Revenue Share", desc: "Best-in-class commissions with transparent, on-chain reporting." },
];

const FAQS = [
  {
    q: "Do I need to register to earn commissions?",
    a: "No — registration is optional. The fastest way to track everything in real time is to register a free Partner Account, but you can also earn without an account by providing your email address, BTC wallet, or the widget/API code you used when contacting us. We will manually verify your referrals and settle commissions to your wallet.",
  },
  {
    q: "How do I track my profits?",
    a: "Registered partners get a real-time dashboard showing all referred swaps, volume, and commissions. Without an account, you can request a manual statement at any time by contacting us with your email, BTC wallet, or the widget/API code you used to promote.",
  },
  {
    q: "Can I use the widget without registering?",
    a: "Yes. The embeddable widget works for everyone. To attribute swaps to you, simply share the widget code or referral URL you used when requesting payout, or register a free account for automatic attribution.",
  },
  {
    q: "How are payouts sent?",
    a: "Payouts are sent directly to your BTC wallet (or another supported asset on request). Registered partners can withdraw on demand from the dashboard; non-registered promoters receive payouts after manual verification of referred volume.",
  },
  {
    q: "Is the commission lifetime?",
    a: "Yes. Once a user swaps through your referral link or embedded widget, you earn commission on every future swap they make — with no expiration date.",
  },
];

const WIDGET_SNIPPET = `<iframe
  src="https://mrcglobalpay.com/embed/widget?ref=YOUR_AFFILIATE_ID"
  width="100%"
  height="640"
  frameborder="0"
  allow="clipboard-write"
  title="MRC GlobalPay Instant Swap Widget"
  style="border-radius:16px;max-width:480px;">
</iframe>
<p><a href="https://mrcglobalpay.com/?ref=YOUR_AFFILIATE_ID">
  Powered by MRC GlobalPay
</a></p>`;

const WidgetSnippet = () => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(WIDGET_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };
  return (
    <div className="mt-6 rounded-xl border border-border bg-[hsl(230_15%_6%)] overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          embed-widget.html
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card/40 px-2.5 py-1 font-display text-[11px] font-semibold text-foreground transition-colors hover:bg-card"
          aria-label="Copy widget code"
        >
          {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[11.5px] leading-relaxed text-foreground/90">
        <code>{WIDGET_SNIPPET}</code>
      </pre>
    </div>
  );
};

/* ─── Main Page ─── */
const Affiliates = () => (
  <>
    <Helmet>
      <title>Affiliate Program — Earn Lifetime Crypto Commissions | MRC GlobalPay</title>
      <meta
        name="description"
        content="Join the MRC GlobalPay Affiliate Program. Earn 0.1%–0.4% lifetime revenue share on every crypto swap you refer. No minimum volume, fast crypto/fiat payouts, and a real-time partner dashboard. Registered Canadian MSB #C100000015."
      />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      <link rel="canonical" href="https://mrcglobalpay.com/affiliates" />
      <meta property="og:title" content="Affiliate Program — Earn Lifetime Crypto Commissions | MRC GlobalPay" />
      <meta property="og:description" content="Earn 0.1%–0.4% lifetime revenue share on every swap you refer. Free to join, no minimum volume." />
      <meta property="og:url" content="https://mrcglobalpay.com/affiliates" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="MRC GlobalPay" />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
    </Helmet>

    <SiteHeader />

    <main className="min-h-screen bg-background">
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden border-b border-border bg-[hsl(230_15%_6%)] py-16 sm:py-24">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(hsl(var(--neon)) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden
        />
        <div className="pointer-events-none absolute -start-40 top-10 h-80 w-80 rounded-full bg-primary/[0.06] blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -end-40 bottom-0 h-80 w-80 rounded-full bg-primary/[0.06] blur-3xl" aria-hidden />

        <div className="container relative mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-display font-semibold text-primary">
              <Shield className="h-3.5 w-3.5" /> Affiliate Program · Free to Join
            </div>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Earn <span className="text-primary">Lifetime Commissions</span> Promoting MRC GlobalPay
            </h1>
            <p className="mt-5 font-body text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Join our Affiliate Program and earn passive income on every crypto swap you refer.
            </p>

            <div className="mt-7 inline-flex flex-col items-center gap-1 rounded-2xl border border-primary/30 bg-primary/5 px-6 py-4">
              <p className="text-[11px] uppercase tracking-wider font-display font-semibold text-muted-foreground">
                Commission Highlight
              </p>
              <p className="font-display text-2xl sm:text-3xl font-bold text-primary">
                0.1% – 0.4% revenue share on swap volume
              </p>
            </div>

            <div className="mt-8">
              <a
                href="/partners"
                className="btn-shimmer inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-display text-base font-bold text-primary-foreground shadow-neon transition-all duration-100 hover:bg-primary/90 hover:-translate-y-0.5"
              >
                Join the Affiliate Program — Free <ArrowRight className="h-4 w-4" />
              </a>
              <p className="mt-3 text-xs text-muted-foreground max-w-md mx-auto">
                Registration gives you easy access to your Partner Dashboard for tracking profits.
                No registration needed to start promoting.
              </p>
            </div>

            <p className="mt-5 text-xs text-muted-foreground">
              Registered Canadian FINTRAC MSB · 6,000+ Assets · Non-Custodial · Instant Swaps from $0.30
            </p>
          </div>

          {/* Benefit chips */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {HERO_BENEFITS.map((b) => (
              <div
                key={b.title}
                className="rounded-xl border border-border bg-card/60 backdrop-blur p-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <b.icon className="mx-auto h-6 w-6 text-primary" aria-hidden />
                <p className="mt-3 font-display text-sm font-semibold text-foreground">{b.title}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MsbTrustBar />

      {/* ═══ REGISTRATION REQUIREMENT BANNER ═══ */}
      <section className="border-b border-border bg-background py-10">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="flex flex-col sm:flex-row items-start gap-4 rounded-2xl border border-primary/30 bg-primary/[0.06] p-5 sm:p-6 transition-all hover:border-primary/50">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
              <AlertCircle className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-base sm:text-lg font-bold text-foreground">
                Important: A Free Partner Account is Required
              </h2>
              <p className="mt-1.5 font-body text-sm text-muted-foreground leading-relaxed">
                To track your commissions and access your Partner Dashboard you must register a free
                Partner Account. Once registered you will receive your unique affiliate ID, links,
                and a personalized embeddable widget.
              </p>
              <a
                href="/partners"
                className="mt-3 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-primary hover:underline"
              >
                Register your free Partner Account <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="border-b border-border py-16 sm:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">How It Works</h2>
            <p className="mt-3 font-body text-muted-foreground">
              Get up and running in minutes. Earn for life.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-display text-base font-bold text-primary">
                  {s.n}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMMISSION STRUCTURE ═══ */}
      <section className="border-b border-border bg-muted/30 py-16 sm:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Competitive Commission Rates
            </h2>
            <p className="mt-3 font-body text-lg text-foreground">
              Earn between <span className="font-semibold text-primary">0.1% and 0.4%</span> on the total swap volume you refer.
            </p>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              Higher rates apply based on volume and performance. Custom rates available for top partners.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl">
            <EarningsCalculator />
          </div>
        </div>
      </section>

      {/* ═══ PROMOTION TOOLS ═══ */}
      <section className="border-b border-border py-16 sm:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">Promotion Tools</h2>
            <p className="mt-3 font-body text-muted-foreground">
              Everything you need to convert your audience into lifetime revenue.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => {
              const Inner = (
                <>
                  <t.icon className="h-7 w-7 text-primary" aria-hidden />
                  <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{t.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                  {t.href && (
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      Learn more <ArrowRight className="h-3 w-3" />
                    </span>
                  )}
                </>
              );
              const className =
                "block rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg";
              return t.href ? (
                <a key={t.title} href={t.href} className={className}>
                  {Inner}
                </a>
              ) : (
                <div key={t.title} className={className}>
                  {Inner}
                </div>
              );
            })}
          </div>

          {/* Embeddable widget snippet */}
          <div className="mt-12 mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6 sm:p-8 transition-all hover:border-primary/40 hover:shadow-lg">
            <div className="flex items-start gap-3">
              <Code2 className="h-6 w-6 text-primary shrink-0" aria-hidden />
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Embeddable Instant Swap Widget
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  Drop this iframe into any website, blog, or landing page. Copy and paste this code
                  after registering to get your personalized tracking version with your unique
                  affiliate ID baked in.
                </p>
              </div>
            </div>
            <WidgetSnippet />
          </div>
        </div>
      </section>

      {/* ═══ PARTNER DASHBOARD TEASER ═══ */}
      <section className="border-b border-border bg-muted/30 py-16 sm:py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-display font-semibold text-primary">
                <BarChart3 className="h-3.5 w-3.5" /> Real-Time Analytics
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
                Track Everything in Your Personal Partner Dashboard
              </h2>
              <p className="mt-4 font-body text-muted-foreground leading-relaxed">
                After registration you'll get access to a real-time dashboard where you can see all
                referred swaps, commissions earned, payouts, and performance stats — updated live
                with on-chain attribution.
              </p>
              <ul className="mt-5 space-y-2.5">
                {[
                  "Live click → swap → commission funnel",
                  "Per-link, per-banner, per-widget attribution",
                  "Crypto and fiat payout history",
                  "Conversion stats by region and asset",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <a
                  href="/partners"
                  className="btn-shimmer inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 font-display text-sm font-bold text-primary-foreground shadow-neon transition-all duration-100 hover:bg-primary/90 hover:-translate-y-0.5"
                >
                  Go to Partner Dashboard <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Mock dashboard preview */}
            <div className="rounded-2xl border border-border bg-[hsl(230_15%_6%)] p-5 shadow-lg">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="font-display text-xs font-semibold text-foreground">Partner Dashboard</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> LIVE
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { label: "Referred Volume", value: "$182,430" },
                  { label: "Earnings (30d)", value: "$546.20" },
                  { label: "Active Referrals", value: "1,247" },
                  { label: "Conversion Rate", value: "4.8%" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-border/60 bg-card/40 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display">
                      {s.label}
                    </p>
                    <p className="mt-1 font-display text-lg font-bold text-foreground">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-border/60 bg-card/40 p-3">
                <div className="flex items-end justify-between gap-1.5 h-16">
                  {[40, 65, 50, 80, 55, 90, 75, 95, 70, 85, 100, 88].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-primary/70"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground font-mono text-center">
                  Last 12 days · referred swaps
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/30 py-16 sm:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Why Choose MRC GlobalPay?
            </h2>
            <p className="mt-3 font-body text-muted-foreground">
              Promote a regulated, non-custodial exchange built for high-conversion affiliate traffic.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CHOOSE.map((w) => (
              <div
                key={w.title}
                className="rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <w.icon className="h-7 w-7 text-primary" aria-hidden />
                <h3 className="mt-4 font-display text-base font-semibold text-foreground">{w.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="border-b border-border py-16 sm:py-20">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 font-body text-muted-foreground">
              Everything you need to know about the MRC GlobalPay Affiliate Program.
            </p>
          </div>

          <Accordion type="single" collapsible className="mt-10 space-y-3">
            {FAQS.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-xl border border-border bg-card px-5 transition-colors hover:border-primary/40"
              >
                <AccordionTrigger className="font-display text-left text-base font-semibold text-foreground hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="font-body text-sm text-muted-foreground leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Ready to Start Earning?
          </h2>
          <p className="mt-3 font-body text-muted-foreground">
            Join thousands of partners earning lifetime commissions with MRC GlobalPay.
          </p>
          <div className="mt-7">
            <a
              href="/partners"
              className="btn-shimmer inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-display text-base font-bold text-primary-foreground shadow-neon transition-all duration-100 hover:bg-primary/90 hover:-translate-y-0.5"
            >
              Join the Affiliate Program — Free & Instant <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </main>

    <SiteFooter />
  </>
);

export default Affiliates;
