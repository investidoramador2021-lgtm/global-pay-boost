import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
  Shield, Zap, Link2, ArrowRight, Infinity as InfinityIcon,
  Image as ImageIcon, Code2, Lock, Copy, Check,
  Mail, Sparkles, ArrowDownUp, Clock, Wallet, Sun, Moon, Smartphone,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MsbTrustBar from "@/components/MsbTrustBar";
import { supabase } from "@/integrations/supabase/client";

/* ─── JSON-LD ─── */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Affiliate Program — Earn Lifetime Crypto Commissions | MRC GlobalPay",
  description:
    "Generate your MRC GlobalPay affiliate widget in seconds. Enter your email and BTC wallet, choose Light or Dark mode, and earn 0.1%–0.4% lifetime commissions on every swap, paid automatically to your wallet.",
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
        text: "No. Registration is completely optional. With just your email and BTC wallet you can generate your widget, embed it anywhere, and start earning. Registering a free Partner Account unlocks the real-time dashboard with detailed reports.",
      },
    },
    {
      "@type": "Question",
      name: "What do I need to generate the widget?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Just two things: your email address (used to attribute swaps) and a BTC wallet address (where commissions are paid). Then choose Light or Dark mode and copy the generated code.",
      },
    },
    {
      "@type": "Question",
      name: "How do I get paid to my BTC wallet?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Commissions accumulate automatically as users swap through your widget or referral link. Payouts are sent directly to the BTC wallet address you entered when generating the widget.",
      },
    },
    {
      "@type": "Question",
      name: "Is the commission lifetime?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Once a user swaps through your link or embedded widget, you earn 0.1%–0.4% on every future swap they make — with no expiration date.",
      },
    },
    {
      "@type": "Question",
      name: "Can I change between Light and Dark mode later?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Just regenerate the widget with the other mode selected and replace the embed code on your site. Your email and wallet stay the same so your earnings are uninterrupted.",
      },
    },
  ],
};

/* ─── Helpers ─── */
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// Loose BTC validation: legacy / segwit / bech32
const isValidBtc = (addr: string) => {
  const a = addr.trim();
  return /^(bc1[a-z0-9]{25,62}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/.test(a);
};

// Stable, non-PII referral token derived from email + wallet (first 12 hex chars).
// We keep email/wallet PRIVATE on our side and only expose this opaque token publicly.
const buildRefToken = (email: string, btc: string) => {
  const seed = `${email.trim().toLowerCase()}|${btc.trim()}`;
  let h1 = 0x811c9dc5;
  let h2 = 0xdeadbeef;
  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
    h2 = Math.imul(h2 ^ c, 2246822519) >>> 0;
  }
  const hex = (h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0")).slice(0, 12);
  return `mrc_${hex}`;
};

const buildLink = (email: string, btc: string) => {
  const token = email || btc ? buildRefToken(email, btc) : "your-ref";
  return `https://mrcglobalpay.com/?ref=${token}`;
};

const buildSnippet = (email: string, btc: string, mode: "light" | "dark") => {
  const token = email || btc ? buildRefToken(email, btc) : "your-ref";
  return `<iframe
  src="https://mrcglobalpay.com/embed/widget?mode=${mode}&ref=${token}"
  width="100%"
  height="520"
  style="border: none; border-radius: 16px; max-width: 100%;"
  allowfullscreen>
</iframe>`;
};

/* ─── Copy Button ─── */
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
      className="btn-shimmer inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-display text-base font-bold text-primary-foreground shadow-neon transition-all duration-100 hover:bg-primary/90 hover:-translate-y-0.5"
    >
      {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
      {copied ? "Copied!" : label}
    </button>
  );
};

/* ─── Live Widget Preview (themed) ─── */
const WidgetPreview = ({ mode }: { mode: "light" | "dark" }) => {
  const isLight = mode === "light";
  const surface = isLight ? "bg-white" : "bg-[hsl(230_15%_8%)]";
  const card = isLight ? "bg-slate-50 border-slate-200" : "bg-card/40 border-border/60";
  const inner = isLight ? "bg-white border-slate-200" : "bg-background/40 border-border/50";
  const chip = isLight ? "bg-slate-100 border-slate-200" : "bg-card/60 border-border/60";
  const textMain = isLight ? "text-slate-900" : "text-foreground";
  const textMuted = isLight ? "text-slate-500" : "text-muted-foreground";
  const browserBar = isLight ? "bg-slate-100 border-slate-200" : "bg-muted/40 border-border/60";

  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
      {/* Browser chrome */}
      <div className={`flex items-center gap-1.5 border-b ${browserBar} px-3 py-2`}>
        <span className="h-2.5 w-2.5 rounded-full bg-[hsl(0_70%_60%)]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[hsl(45_90%_55%)]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
        <span className={`ms-3 font-mono text-[10px] truncate ${textMuted}`}>
          mrcglobalpay.com/embed/widget
        </span>
      </div>

      {/* Mock widget */}
      <div className={`p-4 sm:p-6 ${surface}`}>
        <div className={`rounded-xl border ${card} p-4 sm:p-5 backdrop-blur`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`font-display text-sm font-bold ${textMain}`}>Instant Swap</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-mono font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> LIVE RATE
            </span>
          </div>

          {/* You Send */}
          <div className={`rounded-lg border ${inner} p-3`}>
            <p className={`text-[10px] uppercase tracking-wider font-display ${textMuted}`}>You Send</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <input
                readOnly
                value="0.5"
                className={`w-full bg-transparent font-display text-2xl font-bold outline-none ${textMain}`}
              />
              <div className={`flex items-center gap-1.5 rounded-lg border ${chip} px-2.5 py-1.5`}>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(28_85%_55%)] text-[9px] font-bold text-white">₿</span>
                <span className={`font-display text-xs font-semibold ${textMain}`}>BTC</span>
              </div>
            </div>
          </div>

          {/* Swap arrow */}
          <div className="my-2 flex justify-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full border ${chip} text-primary`}>
              <ArrowDownUp className="h-4 w-4" />
            </div>
          </div>

          {/* You Get */}
          <div className={`rounded-lg border ${inner} p-3`}>
            <p className={`text-[10px] uppercase tracking-wider font-display ${textMuted}`}>You Get</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <input
                readOnly
                value="14.823"
                className={`w-full bg-transparent font-display text-2xl font-bold outline-none ${textMain}`}
              />
              <div className={`flex items-center gap-1.5 rounded-lg border ${chip} px-2.5 py-1.5`}>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(265_75%_60%)] text-[9px] font-bold text-white">◎</span>
                <span className={`font-display text-xs font-semibold ${textMain}`}>SOL</span>
              </div>
            </div>
          </div>

          <p className={`mt-2 text-center text-[10px] font-mono ${textMuted}`}>
            1 BTC ≈ 29.646 SOL · No registration required
          </p>

          <button className="mt-3 w-full btn-shimmer rounded-xl bg-primary py-3 font-display text-sm font-bold text-primary-foreground shadow-neon">
            Swap Now
          </button>

          <p className={`mt-2 text-center text-[9px] ${textMuted}`}>
            Powered by MRC GlobalPay · FINTRAC MSB #C100000015
          </p>
        </div>
      </div>
    </div>
  );
};

/* ─── Widget Generator ─── */
const WidgetGenerator = () => {
  const [email, setEmail] = useState("");
  const [btc, setBtc] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [btcTouched, setBtcTouched] = useState(false);
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const [submitted, setSubmitted] = useState(false);

  const emailValid = isValidEmail(email);
  const btcValid = isValidBtc(btc);
  const canGenerate = emailValid && btcValid;
  const showEmailError = emailTouched && email.length > 0 && !emailValid;
  const showBtcError = btcTouched && btc.length > 0 && !btcValid;

  const handleGenerate = async () => {
    setEmailTouched(true);
    setBtcTouched(true);
    if (!canGenerate) return;
    setSubmitted(true);

    // Persist the affiliate signup so the admin can map ref tokens → payout wallets.
    // Fire-and-forget: never block the UI on this.
    try {
      const refToken = buildRefToken(email, btc);
      await supabase.from("affiliate_leads" as any).insert({
        email: email.trim().toLowerCase(),
        btc_wallet: btc.trim(),
        ref_token: refToken,
        theme: mode,
        source: "affiliates_page",
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
      });
    } catch (err) {
      // Silent — do not interrupt affiliate flow
      console.warn("[affiliate_leads] insert failed", err);
    }
  };

  // Live updates the moment inputs are valid (no need to click Generate).
  const activeEmail = emailValid ? email.trim() : "";
  const activeBtc = btcValid ? btc.trim() : "";

  const link = useMemo(() => buildLink(activeEmail, activeBtc), [activeEmail, activeBtc]);
  const snippet = useMemo(() => buildSnippet(activeEmail, activeBtc, mode), [activeEmail, activeBtc, mode]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 lg:p-8 shadow-lg">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block font-display text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            Your Email Address
          </label>
          <div className="relative">
            <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setSubmitted(false); }}
              onBlur={() => setEmailTouched(true)}
              aria-invalid={showEmailError}
              className={`w-full rounded-xl border bg-background ps-10 pe-4 py-3 font-body text-sm text-foreground outline-none transition-colors ${
                showEmailError ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
              }`}
              aria-label="Your email address"
            />
          </div>
          {showEmailError ? (
            <p className="mt-1 text-[11px] text-destructive">Please enter a valid email address.</p>
          ) : (
            <p className="mt-1 text-[11px] text-muted-foreground">Used to track referred swaps.</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block font-display text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            Your BTC Wallet Address
          </label>
          <div className="relative">
            <Wallet className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
            <input
              type="text"
              spellCheck={false}
              autoComplete="off"
              placeholder="bc1q… or 1… / 3…"
              value={btc}
              onChange={(e) => { setBtc(e.target.value); setSubmitted(false); }}
              onBlur={() => setBtcTouched(true)}
              aria-invalid={showBtcError}
              className={`w-full rounded-xl border bg-background ps-10 pe-4 py-3 font-mono text-xs text-foreground outline-none transition-colors ${
                showBtcError ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
              }`}
              aria-label="Your BTC wallet address"
            />
          </div>
          {showBtcError ? (
            <p className="mt-1 text-[11px] text-destructive">
              Enter a valid BTC address (starts with bc1, 1, or 3).
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-muted-foreground">Commissions are paid here automatically.</p>
          )}
        </div>
      </div>

      {/* Mode selector + Generate */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Widget theme"
          className="grid grid-cols-2 sm:inline-flex rounded-xl border border-border bg-background p-1 w-full sm:w-auto"
        >
          <button
            role="tab"
            aria-selected={mode === "light"}
            onClick={() => setMode("light")}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 sm:px-4 py-2 font-display text-xs font-semibold transition-colors ${
              mode === "light"
                ? "bg-primary text-primary-foreground shadow-neon"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sun className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">Light Mode</span>
          </button>
          <button
            role="tab"
            aria-selected={mode === "dark"}
            onClick={() => setMode("dark")}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 sm:px-4 py-2 font-display text-xs font-semibold transition-colors ${
              mode === "dark"
                ? "bg-primary text-primary-foreground shadow-neon"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Moon className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">Dark Mode</span>
          </button>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="btn-shimmer inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-display text-sm font-bold text-primary-foreground shadow-neon transition-all duration-100 hover:bg-primary/90 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 min-h-[48px]"
        >
          <Sparkles className="h-4 w-4" />
          <span className="truncate">Generate My Widget &amp; Link</span>
        </button>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Preview, affiliate link and embed code update <span className="text-foreground font-semibold">live</span> as you type.
        Click <span className="text-primary font-semibold">Generate</span> to confirm and copy.
      </p>

      {/* Preview */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            Live Widget Preview · {mode === "light" ? "Light" : "Dark"} · Fully interactive
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Smartphone className="h-3 w-3" /> Fully responsive
          </span>
        </div>

        <div className="relative rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-lg">
          {/* Browser chrome */}
          <div className="mb-2 flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(0_70%_60%)]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(45_90%_55%)]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
            <span className="ms-3 font-mono text-[10px] truncate text-muted-foreground">
              mrcglobalpay.com/embed/widget?mode={mode}
            </span>
          </div>
          <div className="overflow-hidden rounded-xl border border-border/60 bg-background">
            <iframe
              key={`${mode}-${activeEmail}-${activeBtc}`}
              src={`/embed/widget?mode=${mode}&ref=${
                activeEmail || activeBtc ? buildRefToken(activeEmail, activeBtc) : "preview"
              }`}
              title="Live MRC GlobalPay swap widget preview"
              loading="lazy"
              allow="clipboard-write"
              className="block w-full h-[560px] sm:h-[640px] lg:h-[720px]"
              style={{ border: 0, background: "transparent" }}
            />
          </div>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            👆 Try it — change tokens, see live rates. This is the exact widget your visitors will use.
          </p>
        </div>
      </div>

      {/* Outputs */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Affiliate Link */}
        <div className="rounded-xl border border-border bg-background/40 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="h-4 w-4 text-primary" />
            <span className="font-display text-sm font-semibold text-foreground">Your Affiliate Link</span>
          </div>
          <div className="rounded-lg border border-border/60 bg-[hsl(230_15%_6%)] p-3 font-mono text-[12px] text-foreground/90 break-all">
            {link}
          </div>
          <div className="mt-4">
            <CopyButton text={link} label="Copy Affiliate Link" />
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Share this link directly. Every swap is attributed to your private email + BTC wallet on our side.
          </p>
        </div>

        {/* Embed Code */}
        <div className="rounded-xl border-2 border-primary/40 bg-background/40 p-5 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.4)]">
          <div className="flex items-center gap-2 mb-3">
            <Code2 className="h-4 w-4 text-primary" />
            <span className="font-display text-sm font-semibold text-foreground">Your Embed Code</span>
          </div>
          <pre className="rounded-lg border border-border/60 bg-[hsl(230_15%_6%)] p-3 overflow-x-auto font-mono text-[11px] leading-relaxed text-foreground/90 max-h-64">
            <code>{snippet}</code>
          </pre>
          <div className="mt-4">
            <CopyButton text={snippet} label="Copy Widget Code" />
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Paste anywhere — HTML, WordPress, Webflow, Ghost, Notion embeds, blogs.
          </p>
        </div>
      </div>

      {/* Parity note */}
      <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-foreground/90 leading-relaxed">
        This widget uses the same embed code for all affiliates. We identify the source of each swap
        using a secure internal reference. Users can freely change any tokens and complete the full
        swap inside the widget using our exact non-custodial flow. Fully responsive on desktop,
        tablets, and mobile. We handle all tracking and payouts privately on our side.
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        🔒 Privacy: your email and BTC wallet are <span className="font-semibold text-foreground">never exposed</span> in the public embed code.
        We map the <code className="font-mono">ref</code> token to your account internally for tracking and payouts.
      </p>

      {/* Upgrade CTA — link this widget to a full Partner Dashboard */}
      <div className="mt-5 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div className="text-sm text-foreground">
            <p className="font-display font-semibold">Want a real-time dashboard?</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Register a free Partner Account using <span className="font-mono text-foreground">{activeEmail || "this same email"}</span> and
              this widget — plus all swaps it generates — will be automatically linked to your dashboard.
            </p>
          </div>
          <a
            href={`/partners?mode=register${activeEmail ? `&email=${encodeURIComponent(activeEmail)}` : ""}${activeBtc ? `&btc=${encodeURIComponent(activeBtc)}` : ""}`}
            className="btn-shimmer inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-display text-sm font-bold text-primary-foreground shadow-neon shrink-0 hover:bg-primary/90 transition-colors"
          >
            Create Partner Account <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

/* ─── Static Data ─── */
const STEPS = [
  { n: 1, title: "Enter your email + BTC wallet", desc: "Choose Light or Dark mode for the widget — preview updates instantly." },
  { n: 2, title: "Copy the code or link", desc: "Your unique widget code and affiliate link update automatically as you type." },
  { n: 3, title: "Paste & start earning", desc: "Drop it on any site, blog, or channel. Earn 0.1%–0.4% on every swap, lifetime." },
];

const TOOLS = [
  { icon: ImageIcon, title: "Downloadable Banners", desc: "Multiple sizes and themes — light, dark, animated.", href: "/partners" },
  { icon: Code2, title: "Full Developer Tools", desc: "Build custom flows with our complete API documentation.", href: "/developer" },
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
    a: "No. Registration is completely optional. With just your email and BTC wallet you can generate your widget, embed it anywhere, and start earning. Registering a free Partner Account unlocks the real-time dashboard with detailed reports.",
  },
  {
    q: "What do I need to generate the widget?",
    a: "Just two things: your email address (used to attribute swaps) and a BTC wallet address (where commissions are paid). Then choose Light or Dark mode and copy the generated code.",
  },
  {
    q: "How do I get paid to my BTC wallet?",
    a: "Commissions accumulate automatically as users swap through your widget or referral link. Payouts are sent directly to the BTC wallet address you entered when generating the widget.",
  },
  {
    q: "Is the commission lifetime?",
    a: "Yes. Once a user swaps through your link or embedded widget, you earn 0.1%–0.4% on every future swap they make — with no expiration date.",
  },
  {
    q: "Can I change between Light and Dark mode later?",
    a: "Yes. Just regenerate the widget with the other mode selected and replace the embed code on your site. Your email and wallet stay the same so your earnings are uninterrupted.",
  },
];

/* ─── Page ─── */
const Affiliates = () => (
  <>
    <Helmet>
      <title>Affiliate Program — Earn Lifetime Crypto Commissions | MRC GlobalPay</title>
      <meta
        name="description"
        content="Generate your MRC GlobalPay affiliate widget in seconds. Enter your email and BTC wallet, choose Light or Dark mode, and earn 0.1%–0.4% lifetime commissions paid automatically to your wallet. Registered Canadian MSB #C100000015."
      />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      <link rel="canonical" href="https://mrcglobalpay.com/affiliates" />
      <meta property="og:title" content="Affiliate Program — Earn Lifetime Crypto Commissions | MRC GlobalPay" />
      <meta property="og:description" content="Generate your widget in seconds. Earn 0.1%–0.4% on every swap, paid automatically to your BTC wallet." />
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
            <Shield className="h-3.5 w-3.5" /> Affiliate Program · Lifetime Payouts
          </div>
          <h1 className="mt-6 font-display text-[2rem] sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Earn{" "}
            <span className="bg-gradient-to-r from-primary to-[hsl(var(--neon))] bg-clip-text text-transparent">
              0.1% – 0.4%
            </span>
            <br className="hidden sm:block" />
            <span className="text-foreground"> Lifetime Commissions</span>
          </h1>
          <p className="mt-5 font-body text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Promote MRC GlobalPay with our instant swap widget or affiliate link and get paid
            <span className="text-foreground font-semibold"> automatically to your BTC wallet</span>.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-display font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-muted-foreground">
              <Check className="h-3 w-3 text-primary" /> No registration required
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-muted-foreground">
              <Check className="h-3 w-3 text-primary" /> Paid in BTC, automatically
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-muted-foreground">
              <Check className="h-3 w-3 text-primary" /> Lifetime — no expiry
            </span>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#generate"
              className="btn-shimmer inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 font-display text-sm font-bold text-primary-foreground shadow-neon transition-all duration-100 hover:bg-primary/90 hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4" /> Generate Your Widget
            </a>
            <a
              href="/partners"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 font-display text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              Open Partner Dashboard <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Registration is recommended for the full Partner Dashboard, but completely optional.
          </p>
        </div>
      </section>

      <MsbTrustBar />

      {/* ═══ WIDGET GENERATOR (centerpiece) ═══ */}
      <section id="generate" className="relative border-b border-border bg-muted/30 py-16 sm:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-display font-semibold text-primary">
              <Sparkles className="h-3 w-3" /> The Star of the Show
            </div>
            <h2 className="mt-4 font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
              Generate Your Personalized <span className="text-primary">Swap Widget</span> in Seconds
            </h2>
            <p className="mt-4 font-body text-muted-foreground sm:text-lg">
              Enter your email and BTC wallet, choose Light or Dark. Preview, link and embed code
              update <span className="text-foreground font-semibold">live</span> as you type.
            </p>
          </div>

          <div className="mt-10 relative">
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-primary/40 via-[hsl(var(--neon))]/30 to-primary/40 opacity-60 blur-md" aria-hidden />
            <div className="relative">
              <WidgetGenerator />
            </div>
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

      {/* ═══ TRACKING & PAYOUTS ═══ */}
      <section className="border-b border-border bg-muted/30 py-16 sm:py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="rounded-3xl border border-primary/20 bg-card p-8 sm:p-12 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-[hsl(var(--neon))]/5" aria-hidden />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-display font-semibold text-primary">
                <Wallet className="h-3 w-3" /> Tracking &amp; Payouts
              </div>
              <h2 className="mt-4 font-display text-3xl font-extrabold text-foreground sm:text-4xl tracking-tight">
                Track every swap. Get paid automatically.
              </h2>
              <p className="mt-4 font-body text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Your widget tracks swaps using your email. Commissions are paid directly to the BTC
                wallet you provide — no minimums, no manual claims. For detailed real-time stats,
                register for free to unlock your Partner Dashboard.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="/partners"
                  className="btn-shimmer inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-display text-base font-bold text-primary-foreground shadow-neon transition-all duration-100 hover:bg-primary/90 hover:-translate-y-0.5"
                >
                  Go to Partner Dashboard <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#generate"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3.5 font-display text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  Generate Widget Instead
                </a>
              </div>
            </div>
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

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WHY.map((w) => (
              <div
                key={w.label}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <w.icon className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <span className="font-body text-sm font-medium text-foreground leading-snug pt-1.5">
                  {w.label}
                </span>
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
