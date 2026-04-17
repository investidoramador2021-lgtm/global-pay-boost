import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
  Shield, Zap, Link2, ArrowRight, Infinity as InfinityIcon,
  Image as ImageIcon, Code2, Globe, Lock, CheckCircle2, Copy, Check,
  Mail, Sparkles, ArrowDownUp, Clock,
} from "lucide-react";
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
    "Join the MRC GlobalPay Affiliate Program. Earn 0.1%–0.4% lifetime revenue share on every crypto swap you refer. Generate your widget and affiliate link instantly with just an email.",
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
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do I need to register?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Registration is optional. You can generate your widget and affiliate link with just an email and start earning immediately. Registering a free Partner Account unlocks the real-time dashboard and faster payouts.",
      },
    },
    {
      "@type": "Question",
      name: "How does tracking work with only my email?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your email is encoded into your unique referral link and widget code. Every swap that comes through your link or embed is automatically attributed to your email address. To request a payout or statement, just contact us with the same email.",
      },
    },
    {
      "@type": "Question",
      name: "Is the commission lifetime?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Once a user swaps through your referral link or embedded widget, you earn commission on every future swap they make — with no expiration date.",
      },
    },
    {
      "@type": "Question",
      name: "How do I receive payouts?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Payouts are sent directly to your BTC wallet (or another supported asset on request). Registered partners can withdraw on demand from the dashboard; email-only promoters receive payouts after manual verification.",
      },
    },
  ],
};

/* ─── Widget Generator ─── */
const slugifyEmail = (email: string) =>
  email.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, "") || "your-email";

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const buildLink = (ref: string) => `https://mrcglobalpay.com/?ref=${encodeURIComponent(ref)}`;

const buildSnippet = (ref: string) =>
  `<iframe
  src="https://mrcglobalpay.com/embed/widget?ref=${encodeURIComponent(ref)}"
  width="100%"
  height="640"
  frameborder="0"
  allow="clipboard-write"
  title="MRC GlobalPay Instant Swap Widget"
  style="border-radius:16px;max-width:480px;">
</iframe>
<p><a href="https://mrcglobalpay.com/?ref=${encodeURIComponent(ref)}">
  Powered by MRC GlobalPay
</a></p>`;

const CopyButton = ({ text, label }: { text: string; label: string }) => {
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };
  return (
    <button
      onClick={onClick}
      className="btn-shimmer inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-display text-sm font-bold text-primary-foreground shadow-neon transition-all duration-100 hover:bg-primary/90 hover:-translate-y-0.5"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied!" : label}
    </button>
  );
};

const WidgetPreview = () => (
  <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
    {/* Browser chrome */}
    <div className="flex items-center gap-1.5 border-b border-border/60 bg-muted/40 px-3 py-2">
      <span className="h-2.5 w-2.5 rounded-full bg-[hsl(0_70%_60%)]/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-[hsl(45_90%_55%)]/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
      <span className="ms-3 font-mono text-[10px] text-muted-foreground truncate">
        mrcglobalpay.com/embed/widget
      </span>
    </div>

    {/* Mock widget */}
    <div className="p-4 sm:p-6 bg-[hsl(230_15%_8%)]">
      <div className="rounded-xl border border-border/60 bg-card/40 p-4 sm:p-5 backdrop-blur">
        <div className="flex items-center justify-between mb-3">
          <span className="font-display text-sm font-bold text-foreground">Instant Swap</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-mono font-semibold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> LIVE RATE
          </span>
        </div>

        {/* You Send */}
        <div className="rounded-lg border border-border/50 bg-background/40 p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display">You Send</p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <input
              readOnly
              value="0.5"
              className="w-full bg-transparent font-display text-2xl font-bold text-foreground outline-none"
            />
            <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-2.5 py-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(28_85%_55%)] text-[9px] font-bold text-primary-foreground">₿</span>
              <span className="font-display text-xs font-semibold text-foreground">BTC</span>
            </div>
          </div>
        </div>

        {/* Swap arrow */}
        <div className="my-2 flex justify-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-card text-primary">
            <ArrowDownUp className="h-4 w-4" />
          </div>
        </div>

        {/* You Get */}
        <div className="rounded-lg border border-border/50 bg-background/40 p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display">You Get</p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <input
              readOnly
              value="14.823"
              className="w-full bg-transparent font-display text-2xl font-bold text-foreground outline-none"
            />
            <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-2.5 py-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(265_75%_60%)] text-[9px] font-bold text-primary-foreground">◎</span>
              <span className="font-display text-xs font-semibold text-foreground">SOL</span>
            </div>
          </div>
        </div>

        <p className="mt-2 text-center text-[10px] text-muted-foreground font-mono">
          1 BTC ≈ 29.646 SOL · No registration required
        </p>

        <button className="mt-3 w-full btn-shimmer rounded-xl bg-primary py-3 font-display text-sm font-bold text-primary-foreground shadow-neon">
          Swap Now
        </button>

        <p className="mt-2 text-center text-[9px] text-muted-foreground">
          Powered by MRC GlobalPay · FINTRAC MSB #C100000015
        </p>
      </div>
    </div>
  </div>
);

const WidgetGenerator = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const ref = useMemo(() => slugifyEmail(submitted ? email : ""), [email, submitted]);
  const link = useMemo(() => buildLink(ref), [ref]);
  const snippet = useMemo(() => buildSnippet(ref), [ref]);

  const valid = isValidEmail(email);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-lg transition-shadow">
      {/* Email input */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
          <input
            type="email"
            inputMode="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (submitted && !isValidEmail(e.target.value)) setSubmitted(false);
            }}
            className="w-full rounded-xl border border-border bg-background ps-10 pe-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
            aria-label="Your email address"
          />
        </div>
        <button
          onClick={() => valid && setSubmitted(true)}
          disabled={!valid}
          className="btn-shimmer inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-display text-sm font-bold text-primary-foreground shadow-neon transition-all duration-100 hover:bg-primary/90 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          <Sparkles className="h-4 w-4" />
          Generate My Widget & Link
        </button>
      </div>

      {!submitted && (
        <p className="mt-2 text-xs text-muted-foreground">
          Your widget and affiliate link update instantly once you generate them.
        </p>
      )}

      {/* Preview + outputs */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Live preview */}
        <div>
          <p className="font-display text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-3">
            Live Widget Preview
          </p>
          <WidgetPreview />
        </div>

        {/* Outputs */}
        <div className="flex flex-col gap-5">
          {/* Affiliate Link */}
          <div className="rounded-xl border border-border bg-background/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="h-4 w-4 text-primary" />
              <span className="font-display text-sm font-semibold text-foreground">Your Affiliate Link</span>
            </div>
            <div className="rounded-lg border border-border/60 bg-[hsl(230_15%_6%)] p-3 font-mono text-[12px] text-foreground/90 break-all">
              {link}
            </div>
            <div className="mt-3">
              <CopyButton text={link} label="Copy Link" />
            </div>
          </div>

          {/* Embed Code */}
          <div className="rounded-xl border border-border bg-background/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="h-4 w-4 text-primary" />
              <span className="font-display text-sm font-semibold text-foreground">Your Embed Code</span>
            </div>
            <pre className="rounded-lg border border-border/60 bg-[hsl(230_15%_6%)] p-3 overflow-x-auto font-mono text-[11px] leading-relaxed text-foreground/90">
              <code>{snippet}</code>
            </pre>
            <div className="mt-3">
              <CopyButton text={snippet} label="Copy Widget Code" />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Paste this code anywhere on your site. Swaps will be tracked automatically using your email.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ─── Static Data ─── */
const STEPS = [
  { n: 1, title: "Enter your email", desc: "Your widget preview and embed code update instantly with your unique tracking." },
  { n: 2, title: "Copy & paste", desc: "Drop the link or code on your website, blog, YouTube, or Telegram channel." },
  { n: 3, title: "Earn automatically", desc: "Earn 0.1%–0.4% commission on every swap referred through your link or widget." },
];

const TOOLS = [
  { icon: ImageIcon, title: "Downloadable Banners", desc: "Multiple sizes and themes — light, dark, animated.", href: "/partners" },
  { icon: Globe, title: "API & Developer Tools", desc: "Build custom flows with our full API documentation.", href: "/developer" },
];

const WHY = [
  { icon: InfinityIcon, label: "Lifetime commissions" },
  { icon: Zap, label: "6,000+ cryptocurrencies & tokenized stocks" },
  { icon: Sparkles, label: "Micro-swaps from just $0.30" },
  { icon: Clock, label: "Fast non-custodial swaps (<60 seconds)" },
  { icon: Shield, label: "Canadian MSB registered (FINTRAC #C100000015)" },
  { icon: Lock, label: "Wallet-to-wallet · no funds held" },
];

const FAQS = [
  {
    q: "Do I need to register?",
    a: "No. Registration is optional. You can generate your widget and affiliate link with just an email and start earning immediately. Registering a free Partner Account unlocks the real-time dashboard and faster payouts.",
  },
  {
    q: "How does tracking work with only my email?",
    a: "Your email is encoded into your unique referral link and widget code. Every swap that comes through your link or embed is automatically attributed to your email address. To request a payout or statement, just contact us with the same email.",
  },
  {
    q: "Is the commission lifetime?",
    a: "Yes. Once a user swaps through your referral link or embedded widget, you earn commission on every future swap they make — with no expiration date.",
  },
  {
    q: "How do I receive payouts?",
    a: "Payouts are sent directly to your BTC wallet (or another supported asset on request). Registered partners can withdraw on demand from the dashboard; email-only promoters receive payouts after manual verification.",
  },
];

/* ─── Page ─── */
const Affiliates = () => (
  <>
    <Helmet>
      <title>Affiliate Program — Earn Lifetime Crypto Commissions | MRC GlobalPay</title>
      <meta
        name="description"
        content="Generate your MRC GlobalPay affiliate widget and link instantly with just an email. Earn 0.1%–0.4% lifetime commissions on every crypto swap you refer. Registered Canadian MSB #C100000015."
      />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      <link rel="canonical" href="https://mrcglobalpay.com/affiliates" />
      <meta property="og:title" content="Affiliate Program — Earn Lifetime Crypto Commissions | MRC GlobalPay" />
      <meta property="og:description" content="Generate your widget and affiliate link instantly with just an email. Earn 0.1%–0.4% on every swap." />
      <meta property="og:url" content="https://mrcglobalpay.com/affiliates" />
      <meta property="og:type" content="website" />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
    </Helmet>

    <SiteHeader />

    <main className="min-h-screen bg-background">
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden border-b border-border bg-[hsl(230_15%_6%)] py-14 sm:py-20">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(hsl(var(--neon)) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden
        />
        <div className="container relative mx-auto max-w-4xl px-4 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-display font-semibold text-primary">
            <Shield className="h-3.5 w-3.5" /> Affiliate Program
          </div>
          <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Earn <span className="text-primary">0.1% – 0.4% Lifetime Commissions</span> Promoting MRC GlobalPay
          </h1>
          <p className="mt-4 font-body text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Share our instant crypto swap widget or affiliate link and earn on every swap.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Registration is optional but recommended for full Partner Dashboard access.
          </p>
        </div>
      </section>

      <MsbTrustBar />

      {/* ═══ WIDGET GENERATOR (centerpiece) ═══ */}
      <section id="generate" className="border-b border-border bg-muted/30 py-16 sm:py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Generate Your Widget or Affiliate Link Instantly
            </h2>
            <p className="mt-3 font-body text-muted-foreground">
              Enter your email below. The preview, affiliate link, and embed code will update
              automatically. Copy and paste — that's all you need to start earning.
            </p>
          </div>

          <div className="mt-10">
            <WidgetGenerator />
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="border-b border-border py-16 sm:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">How It Works</h2>
            <p className="mt-3 font-body text-muted-foreground">Three steps. That's it.</p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
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

      {/* ═══ TRACKING EARNINGS ═══ */}
      <section className="border-b border-border bg-muted/30 py-16 sm:py-20">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Tracking Your Earnings
          </h2>
          <p className="mt-4 font-body text-muted-foreground leading-relaxed">
            Your generated widget and link track commissions using your email. For detailed
            real-time stats and reports, register for free to access your Partner Dashboard.
          </p>
          <div className="mt-7">
            <a
              href="/partners"
              className="btn-shimmer inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3 font-display text-sm font-bold text-primary-foreground shadow-neon transition-all duration-100 hover:bg-primary/90 hover:-translate-y-0.5"
            >
              Go to Partner Dashboard <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ═══ ADDITIONAL TOOLS ═══ */}
      <section className="border-b border-border py-16 sm:py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">Additional Tools</h2>
            <p className="mt-3 font-body text-muted-foreground">More ways to convert your audience.</p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {TOOLS.map((t) => (
              <a
                key={t.title}
                href={t.href}
                className="block rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <t.icon className="h-7 w-7 text-primary" aria-hidden />
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{t.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  Learn more <ArrowRight className="h-3 w-3" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHY MRC GLOBALPAY ═══ */}
      <section className="border-b border-border bg-muted/30 py-16 sm:py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Why MRC GlobalPay
            </h2>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {WHY.map((w) => (
              <div
                key={w.label}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40"
              >
                <w.icon className="h-5 w-5 text-primary shrink-0" aria-hidden />
                <span className="font-body text-sm text-foreground">{w.label}</span>
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
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Ready to start earning?
          </h2>
          <p className="mt-3 font-body text-muted-foreground">
            Generate your widget now — it takes less than 30 seconds.
          </p>
          <div className="mt-7">
            <a
              href="#generate"
              className="btn-shimmer inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-display text-base font-bold text-primary-foreground shadow-neon transition-all duration-100 hover:bg-primary/90 hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4" /> Generate Your Widget Now
            </a>
          </div>
        </div>
      </section>
    </main>

    <SiteFooter />
  </>
);

export default Affiliates;
