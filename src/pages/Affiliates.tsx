import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import {
  Shield, Zap, Link2, ArrowRight, Infinity as InfinityIcon,
  Image as ImageIcon, Code2, Lock, Copy, Check, ExternalLink,
  Mail, Sparkles, ArrowDownUp, Clock, Wallet, Sun, Moon, Smartphone,
  Download, FileText, Youtube, Megaphone, BarChart3, TrendingUp, Coins,
  Percent, LineChart, Users,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MsbTrustBar from "@/components/MsbTrustBar";
import EmbedWidget from "@/pages/EmbedWidget";
import { supabase } from "@/integrations/supabase/client";
import { getLangFromPath, langPath } from "@/i18n";
import { useLocation } from "react-router-dom";

/* ─── Helpers ─── */
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const isValidBtc = (addr: string) => {
  const a = addr.trim();
  return /^(bc1[a-z0-9]{25,62}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/.test(a);
};

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

const buildLink = (email: string, btc: string, lang: string) => {
  const token = email || btc ? buildRefToken(email, btc) : "your-ref";
  const langSeg = lang && lang !== "en" ? `/${lang}` : "";
  return `https://mrcglobalpay.com${langSeg}/?ref=${token}`;
};

const buildSnippet = (email: string, btc: string, mode: "light" | "dark", lang: string) => {
  const token = email || btc ? buildRefToken(email, btc) : "your-ref";
  const langParam = lang && lang !== "en" ? `&lang=${lang}` : "";
  return `<iframe
  src="https://mrcglobalpay.com/embed/widget?mode=${mode}&ref=${token}${langParam}"
  title="MRC GlobalPay — Instant Crypto Swap"
  width="100%"
  height="440"
  loading="lazy"
  referrerpolicy="strict-origin-when-cross-origin"
  allow="clipboard-write; popups; popups-to-escape-sandbox"
  style="border: 0; border-radius: 16px; max-width: 380px; width: 100%; display: block; margin: 0 auto; background: transparent;">
</iframe>`;
};

/* ─── Copy Button ─── */
const CopyButton = ({ text, label }: { text: string; label: string }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };
  return (
    <button
      onClick={onClick}
      className="btn-shimmer group inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-b from-[hsl(var(--neon))] to-primary px-6 py-4 font-display text-base font-extrabold uppercase tracking-wide text-primary-foreground shadow-[0_0_36px_-2px_hsl(var(--primary)/0.85)] ring-2 ring-primary/50 transition-all duration-150 hover:shadow-[0_0_52px_0px_hsl(var(--neon)/0.95)] hover:-translate-y-0.5 hover:brightness-125 active:translate-y-0 min-h-[56px] sm:text-lg"
    >
      {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5 transition-transform group-hover:scale-110" />}
      {copied ? t("affiliates.generator.copied") : label}
    </button>
  );
};

/* ─── Widget Generator ─── */
const WidgetGenerator = ({ lang }: { lang: string }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [btc, setBtc] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [btcTouched, setBtcTouched] = useState(false);
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const [, setSubmitted] = useState(false);

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
      console.warn("[affiliate_leads] insert failed", err);
    }
  };

  const activeEmail = emailValid ? email.trim() : "";
  const activeBtc = btcValid ? btc.trim() : "";

  const link = useMemo(() => buildLink(activeEmail, activeBtc, lang), [activeEmail, activeBtc, lang]);
  const snippet = useMemo(() => buildSnippet(activeEmail, activeBtc, mode, lang), [activeEmail, activeBtc, mode, lang]);
  const previewUrl = useMemo(() => {
    const token = activeEmail || activeBtc ? buildRefToken(activeEmail, activeBtc) : "your-ref";
    const langParam = lang && lang !== "en" ? `&lang=${lang}` : "";
    return `https://mrcglobalpay.com/embed/widget?mode=${mode}&ref=${token}${langParam}`;
  }, [activeEmail, activeBtc, mode, lang]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 lg:p-8 shadow-lg">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block font-display text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            {t("affiliates.generator.emailLabel")}
          </label>
          <div className="relative">
            <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={t("affiliates.generator.emailPlaceholder")}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setSubmitted(false); }}
              onBlur={() => setEmailTouched(true)}
              aria-invalid={showEmailError}
              className={`w-full rounded-xl border bg-background ps-10 pe-4 py-3 font-body text-sm text-foreground outline-none transition-colors ${
                showEmailError ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
              }`}
              aria-label={t("affiliates.generator.emailLabel")}
            />
          </div>
          {showEmailError ? (
            <p className="mt-1 text-[11px] text-destructive">{t("affiliates.generator.emailError")}</p>
          ) : (
            <p className="mt-1 text-[11px] text-muted-foreground">{t("affiliates.generator.emailHelp")}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block font-display text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            {t("affiliates.generator.btcLabel")}
          </label>
          <div className="relative">
            <Wallet className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
            <input
              type="text"
              spellCheck={false}
              autoComplete="off"
              placeholder={t("affiliates.generator.btcPlaceholder")}
              value={btc}
              onChange={(e) => { setBtc(e.target.value); setSubmitted(false); }}
              onBlur={() => setBtcTouched(true)}
              aria-invalid={showBtcError}
              className={`w-full rounded-xl border bg-background ps-10 pe-4 py-3 font-mono text-xs text-foreground outline-none transition-colors ${
                showBtcError ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
              }`}
              aria-label={t("affiliates.generator.btcLabel")}
            />
          </div>
          {showBtcError ? (
            <p className="mt-1 text-[11px] text-destructive">{t("affiliates.generator.btcError")}</p>
          ) : (
            <p className="mt-1 text-[11px] text-muted-foreground">{t("affiliates.generator.btcHelp")}</p>
          )}
        </div>
      </div>

      {/* Mode selector + Generate */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Widget theme" className="grid grid-cols-2 sm:inline-flex rounded-xl border border-border bg-background p-1 w-full sm:w-auto">
          <button
            role="tab"
            aria-selected={mode === "light"}
            onClick={() => setMode("light")}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 sm:px-4 py-2 font-display text-xs font-semibold transition-colors ${
              mode === "light" ? "bg-primary text-primary-foreground shadow-neon" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sun className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{t("affiliates.generator.lightMode")}</span>
          </button>
          <button
            role="tab"
            aria-selected={mode === "dark"}
            onClick={() => setMode("dark")}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 sm:px-4 py-2 font-display text-xs font-semibold transition-colors ${
              mode === "dark" ? "bg-primary text-primary-foreground shadow-neon" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Moon className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{t("affiliates.generator.darkMode")}</span>
          </button>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="btn-shimmer inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-display text-sm font-bold text-primary-foreground shadow-neon transition-all duration-100 hover:bg-primary/90 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 min-h-[48px]"
        >
          <Sparkles className="h-4 w-4" />
          <span className="truncate">{t("affiliates.generator.generateBtn")}</span>
        </button>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {t("affiliates.generator.liveHint1")} <span className="text-foreground font-semibold">{t("affiliates.generator.live")}</span>{" "}
        {t("affiliates.generator.liveHint2")} <span className="text-primary font-semibold">{t("affiliates.generator.generate")}</span>{" "}
        {t("affiliates.generator.liveHint3")}
      </p>

      {/* Preview — enlarged & prominent */}
      <div className="mt-12">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="font-display text-sm uppercase tracking-wider font-bold text-foreground">
            <span className="text-primary animate-pulse">●</span> Live Widget Preview
            <span className="ms-2 font-normal normal-case tracking-normal text-muted-foreground text-xs">
              · {mode === "light" ? t("affiliates.generator.previewLight") : t("affiliates.generator.previewDark")} · {t("affiliates.generator.previewInteractive")}
            </span>
          </p>
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            <Smartphone className="h-3 w-3" /> {t("affiliates.generator.responsive")}
          </span>
        </div>

        <div className="relative rounded-3xl border-2 border-primary/40 bg-gradient-to-b from-card to-background p-3 sm:p-6 shadow-[0_0_60px_-12px_hsl(var(--primary)/0.55)]">
          <div className="mb-3 flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(0_70%_60%)]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(45_90%_55%)]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
            <span className="ms-3 font-mono text-[10px] truncate text-muted-foreground">
              mrcglobalpay.com/embed/widget?mode={mode}{lang !== "en" ? `&lang=${lang}` : ""}
            </span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-background mx-auto max-w-[560px] min-h-[640px] md:min-h-[720px] lg:min-h-[760px] flex">
            {/* Inline render of the embed-only widget — Exchange tab only */}
            <div className="w-full">
              <EmbedWidget modeOverride={mode} langOverride={lang} />
            </div>
          </div>
          <p className="mt-5 text-center text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            This widget works exactly like ChangeNOW's. Users can freely change any tokens and complete the full swap using our exact non-custodial flow. Fully responsive on desktop, tablets, and mobile.
          </p>
        </div>
      </div>

      {/* Outputs */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-background/40 p-4 sm:p-5 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="h-4 w-4 text-primary shrink-0" />
            <span className="font-display text-sm font-semibold text-foreground">{t("affiliates.generator.linkTitle")}</span>
          </div>
          <div className="rounded-lg border border-border/60 bg-[hsl(230_15%_6%)] p-3 font-mono text-[11px] sm:text-[12px] text-foreground/90 break-all">
            {link}
          </div>
          <div className="mt-4">
            <CopyButton text={link} label={t("affiliates.generator.copyLink")} />
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">{t("affiliates.generator.linkHelp")}</p>
        </div>

        <div className="rounded-xl border-2 border-primary/40 bg-background/40 p-4 sm:p-5 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.4)] min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <Code2 className="h-4 w-4 text-primary shrink-0" />
            <span className="font-display text-sm font-semibold text-foreground">{t("affiliates.generator.embedTitle")}</span>
          </div>
          <pre className="rounded-lg border border-border/60 bg-[hsl(230_15%_6%)] p-3 overflow-x-auto font-mono text-[10px] sm:text-[11px] leading-relaxed text-foreground/90 max-h-64 whitespace-pre-wrap break-all">
            <code>{snippet}</code>
          </pre>
          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
            <CopyButton text={snippet} label={t("affiliates.generator.copyCode")} />
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary/50 bg-primary/10 px-5 py-4 font-display text-sm font-bold uppercase tracking-wide text-primary transition-all hover:bg-primary/20 hover:border-primary hover:-translate-y-0.5 min-h-[52px] whitespace-nowrap"
              title="Open the embeddable widget in a new tab to test it"
            >
              <ExternalLink className="h-4 w-4" /> Test in New Tab
            </a>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">{t("affiliates.generator.embedHelp")}</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-foreground/90 leading-relaxed">
        {t("affiliates.generator.parityNote")}
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        {t("affiliates.generator.privacyNote1")} <span className="font-semibold text-foreground">{t("affiliates.generator.privacyNote2")}</span> {t("affiliates.generator.privacyNote3")} <code className="font-mono">ref</code> {t("affiliates.generator.privacyNote4")}
      </p>

      <div className="mt-5 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div className="text-sm text-foreground">
            <p className="font-display font-semibold">{t("affiliates.generator.upgradeTitle")}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("affiliates.generator.upgradeBody1")}{" "}
              <span className="font-mono text-foreground">{activeEmail || t("affiliates.generator.upgradeBody2")}</span>{" "}
              {t("affiliates.generator.upgradeBody3")}
            </p>
          </div>
          <a
            href={`${langPath(lang as any, "/partners")}?mode=register${activeEmail ? `&email=${encodeURIComponent(activeEmail)}` : ""}${activeBtc ? `&btc=${encodeURIComponent(activeBtc)}` : ""}`}
            className="btn-shimmer inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-display text-sm font-bold text-primary-foreground shadow-neon shrink-0 hover:bg-primary/90 transition-colors"
          >
            {t("affiliates.generator.upgradeCta")} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

/* ─── Page ─── */
const Affiliates = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);

  const STEPS = [
    { n: 1, title: t("affiliates.howItWorks.step1Title"), desc: t("affiliates.howItWorks.step1Desc") },
    { n: 2, title: t("affiliates.howItWorks.step2Title"), desc: t("affiliates.howItWorks.step2Desc") },
    { n: 3, title: t("affiliates.howItWorks.step3Title"), desc: t("affiliates.howItWorks.step3Desc") },
  ];

  const TOOLS = [
    { icon: ImageIcon, title: t("affiliates.tools.bannersTitle"), desc: t("affiliates.tools.bannersDesc"), href: langPath(lang, "/partners") },
    { icon: Code2, title: t("affiliates.tools.devToolsTitle"), desc: t("affiliates.tools.devToolsDesc"), href: langPath(lang, "/developer") },
  ];

  const WHY = [
    { icon: InfinityIcon, label: t("affiliates.why.lifetime") },
    { icon: Zap, label: t("affiliates.why.assets") },
    { icon: Sparkles, label: t("affiliates.why.micro") },
    { icon: Clock, label: t("affiliates.why.fast") },
    { icon: Shield, label: t("affiliates.why.msb") },
    { icon: Lock, label: t("affiliates.why.wallet") },
  ];

  const FAQS = [
    {
      q: t("affiliates.faq.q1"),
      a: "You earn 0.1% to 0.4% of every swap your referrals make — for life. Tier depends on your monthly referred volume: 0.1% under $50k, 0.2% from $50k–$250k, 0.3% from $250k–$1M, and 0.4% above $1M. Commissions are paid in BTC directly to the wallet you provided when generating your link.",
      tip: "No caps, no expirations, no clawbacks. As long as your referral keeps swapping, you keep earning.",
    },
    {
      q: t("affiliates.faq.q2"),
      a: "No. There is zero signup, zero KYC, and zero approval process for affiliates. You just paste your email and a BTC payout wallet, copy the widget code or referral link, and you're live. Tracking starts on the very first click.",
      tip: "If you want a real-time dashboard, API keys, and webhooks, upgrade to the Partner Program — also free, takes ~2 minutes.",
    },
    {
      q: t("affiliates.faq.q3"),
      a: "Commissions are aggregated and sent automatically to your BTC wallet on a rolling basis once the network-confirmed amount exceeds the minimum payout threshold. There are no manual claims, no invoices, and no waiting periods beyond on-chain confirmation.",
      tip: "Use a wallet you fully control (not an exchange deposit address) so you never miss a payout.",
    },
    {
      q: t("affiliates.faq.q4"),
      a: "Yes — the embedded widget is the exact same engine that powers mrcglobalpay.com. Your visitors get 6,000+ tokens, fixed and floating rates, $0.30 minimum swaps, and the full non-custodial flow. They never need to leave your site.",
      tip: "The widget is fully responsive on mobile, tablet, and desktop, and supports 13 languages out of the box.",
    },
    {
      q: t("affiliates.faq.q5"),
      a: "MRC GlobalPay is operated by MRC Pay International Corp, a FINTRAC-registered Canadian Money Services Business (#C100000015) and a Bank of Canada–registered Payment Service Provider. We are non-custodial: user funds route directly through liquidity providers and never sit on our books. You can promote with full regulatory confidence.",
      tip: "Both registrations are publicly verifiable on the official FINTRAC and Bank of Canada registries (linked in the hero).",
    },
  ];

  const canonicalUrl = `https://mrcglobalpay.com${langPath(lang, "/affiliates")}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("affiliates.meta.title"),
    description: t("affiliates.meta.description"),
    url: canonicalUrl,
    inLanguage: lang,
    isPartOf: { "@type": "WebSite", name: "MRC GlobalPay", url: "https://mrcglobalpay.com" },
    publisher: {
      "@type": "Organization",
      name: "MRC GlobalPay",
      url: "https://mrcglobalpay.com",
      identifier: "C100000015",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: lang,
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: `${f.a}${f.tip ? ` ${f.tip}` : ""}` },
    })),
  };

  return (
    <>
      <Helmet>
        <title>{t("affiliates.meta.title")}</title>
        <meta name="description" content={t("affiliates.meta.description")} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={t("affiliates.meta.ogTitle")} />
        <meta property="og:description" content={t("affiliates.meta.ogDescription")} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <html lang={lang} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <SiteHeader />

      <main className="min-h-screen bg-background overflow-x-hidden">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border bg-[hsl(230_15%_6%)] py-14 sm:py-20">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(hsl(var(--neon)) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
            aria-hidden
          />
          <div className="container relative mx-auto max-w-4xl px-4 text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-display font-semibold text-primary">
              <Shield className="h-3.5 w-3.5" /> {t("affiliates.hero.badge")}
            </div>
            <h1 className="mt-6 font-display text-[2rem] sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.05]">
              Turn Every Crypto Click Into{" "}
              <span className="bg-gradient-to-r from-primary to-[hsl(var(--neon))] bg-clip-text text-transparent">
                Lifetime BTC Income
              </span>
            </h1>
            <p className="mt-5 font-body text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Embed our{" "}
              <span className="text-foreground font-semibold">fully functional non-custodial swap widget</span>{" "}
              in 60 seconds and earn{" "}
              <span className="text-foreground font-semibold">0.1% – 0.4% of every swap, forever</span> — paid automatically in BTC. No signup, no minimums, no caps.
            </p>

            {/* Top cross-links */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
              <a
                href={langPath(lang, "/partners")}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 font-display font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                Also check our Partner Program <ArrowRight className="h-3 w-3" />
              </a>
              <a
                href={langPath(lang, "/referral")}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 font-display font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                Referral Program <ArrowRight className="h-3 w-3" />
              </a>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-display font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-muted-foreground">
                <Check className="h-3 w-3 text-primary" /> {t("affiliates.hero.chipNoReg")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-muted-foreground">
                <Check className="h-3 w-3 text-primary" /> {t("affiliates.hero.chipPaidBtc")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-muted-foreground">
                <Check className="h-3 w-3 text-primary" /> {t("affiliates.hero.chipLifetime")}
              </span>
              <a
                href="https://www10.fintrac-canafe.gc.ca/msb-esm/public/msb-search/search-by-name/?searchTerm=MRC+Pay+International"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-primary transition-colors hover:bg-primary/20"
                title="Verify on the official FINTRAC MSB Registry"
              >
                <Shield className="h-3 w-3" /> FINTRAC MSB
              </a>
              <a
                href="https://www.bankofcanada.ca/core-functions/retail-payments-supervision/psp-registry/psp-registry-details/?account_id=408b884a-1aa1-ef11-a72d-0022483bf164"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-primary transition-colors hover:bg-primary/20"
                title="Verify on the official Bank of Canada PSP Registry"
              >
                <Shield className="h-3 w-3" /> Bank of Canada PSP
              </a>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="#generate"
                className="btn-shimmer inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 font-display text-sm font-bold text-primary-foreground shadow-neon transition-all duration-100 hover:bg-primary/90 hover:-translate-y-0.5"
              >
                <Sparkles className="h-4 w-4" /> {t("affiliates.hero.ctaGenerate")}
              </a>
              <a
                href={langPath(lang, "/partners")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 font-display text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {t("affiliates.hero.ctaDashboard")} <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{t("affiliates.hero.regNote")}</p>
          </div>
        </section>

        <MsbTrustBar />

        {/* WIDGET GENERATOR */}
        <section id="generate" className="relative border-b border-border bg-muted/30 py-16 sm:py-24">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-display font-semibold text-primary">
                <Sparkles className="h-3 w-3" /> {t("affiliates.generator.badge")}
              </div>
              <h2 className="mt-4 font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                {t("affiliates.generator.title1")} <span className="text-primary">{t("affiliates.generator.title2")}</span> {t("affiliates.generator.title3")}
              </h2>
              <p className="mt-4 font-body text-muted-foreground sm:text-lg">
                {t("affiliates.generator.subtitle")}{" "}
                <span className="text-foreground font-semibold">{t("affiliates.generator.live")}</span>{" "}
                {t("affiliates.generator.asYouType")}
              </p>
              <p className="mt-3 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-body text-xs sm:text-sm text-foreground/90">
                ✨ Perfect for <span className="font-semibold text-primary">bloggers, YouTubers, wallet owners, and crypto communities</span> looking to earn passive income.
              </p>
            </div>

            <div className="mt-10 relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/40 via-[hsl(var(--neon))]/30 to-primary/40 opacity-60 blur-md pointer-events-none" aria-hidden />
              <div className="relative">
                <WidgetGenerator lang={lang} />
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="border-b border-border py-16 sm:py-20">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">{t("affiliates.howItWorks.title")}</h2>
              <p className="mt-3 font-body text-muted-foreground">{t("affiliates.howItWorks.subtitle")}</p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.n} className="rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
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

        {/* COMMISSION TIERS — How You Get Paid */}
        <section className="border-b border-border bg-muted/30 py-16 sm:py-20">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-display font-semibold text-primary">
                <Percent className="h-3 w-3" /> How You Get Paid
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
                Transparent Commission Tiers
              </h2>
              <p className="mt-3 font-body text-muted-foreground leading-relaxed">
                Every swap your referrals complete pays you a percentage of the swap volume — for life.
                Your tier scales automatically with the volume your referrals generate each month.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { tier: "Starter", rate: "0.1%", range: "Up to $50k / mo", icon: Coins },
                { tier: "Growth", rate: "0.2%", range: "$50k – $250k / mo", icon: TrendingUp },
                { tier: "Pro", rate: "0.3%", range: "$250k – $1M / mo", icon: BarChart3 },
                { tier: "Elite", rate: "0.4%", range: "$1M+ / mo", icon: Sparkles },
              ].map((c) => (
                <div
                  key={c.tier}
                  className="rounded-2xl border border-border bg-card p-5 text-center transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <c.icon className="h-5 w-5 text-primary" aria-hidden />
                  </div>
                  <p className="mt-3 font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.tier}</p>
                  <p className="mt-1 font-display text-3xl font-extrabold text-foreground">{c.rate}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.range}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground max-w-2xl mx-auto">
              Tiers re-evaluate monthly. Lifetime attribution stays with you — even if a referral pauses and returns months later.
            </p>
          </div>
        </section>

        {/* READY-MADE MARKETING MATERIALS */}
        <section className="border-b border-border py-16 sm:py-20">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-display font-semibold text-primary">
                <Megaphone className="h-3 w-3" /> Done-For-You Assets
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
                Ready-Made Marketing Materials
              </h2>
              <p className="mt-3 font-body text-muted-foreground leading-relaxed">
                Skip the design work. Plug-and-play creative, copy, and scripts — all approved, all on-brand,
                all FINTRAC-compliant.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: ImageIcon,
                  title: "Display Banners",
                  desc: "Animated and static banners in 8 standard ad sizes (728×90, 300×250, 320×50, and more).",
                  cta: "Download .ZIP",
                },
                {
                  icon: Sparkles,
                  title: "Social Templates",
                  desc: "Pre-designed posts for X, Instagram, TikTok, LinkedIn — editable in Canva or Figma.",
                  cta: "Open Templates",
                },
                {
                  icon: Mail,
                  title: "Email Copy Pack",
                  desc: "5 high-converting email sequences for newsletters, drip campaigns, and announcements.",
                  cta: "Copy Email Pack",
                },
                {
                  icon: Youtube,
                  title: "Blog & YouTube Scripts",
                  desc: "Long-form review templates, 60-second short scripts, and SEO-optimized blog outlines.",
                  cta: "Get Scripts",
                },
              ].map((m) => (
                <div
                  key={m.title}
                  className="flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <m.icon className="h-5 w-5 text-primary" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold text-foreground">{m.title}</h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed flex-1">{m.desc}</p>
                  <a
                    href={langPath(lang, "/partners")}
                    className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 font-display text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                  >
                    <Download className="h-3.5 w-3.5" /> {m.cta}
                  </a>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              All assets unlock instantly inside your <a href={langPath(lang, "/partners")} className="font-semibold text-primary hover:underline">Partner Dashboard</a> — free, no approval needed.
            </p>
          </div>
        </section>

        {/* DASHBOARD PREVIEWS */}
        <section className="border-b border-border bg-muted/30 py-16 sm:py-20">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-display font-semibold text-primary">
                <LineChart className="h-3 w-3" /> Real-Time Dashboard
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
                Track Earnings, Volume &amp; Payouts Live
              </h2>
              <p className="mt-3 font-body text-muted-foreground leading-relaxed">
                Upgrade to the Partner Program (free, ~2 minutes) to unlock live tracking — or keep it simple
                with auto-payouts and no dashboard at all.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {/* Earnings card */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Lifetime Earnings
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
                    <Coins className="h-3 w-3" /> BTC
                  </span>
                </div>
                <div className="mt-3 font-mono text-3xl font-extrabold text-foreground">₿ 0.14582910</div>
                <p className="mt-1 text-xs text-muted-foreground">≈ $14,250 USD · updated every 30s</p>
                <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-border/60">
                  <div className="h-full w-3/4 bg-gradient-to-r from-primary to-[hsl(var(--neon))]" />
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">75% to next tier (Pro · 0.3%)</p>
              </div>

              {/* Volume card */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    30-Day Volume
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                    <TrendingUp className="h-3 w-3" /> +18.4%
                  </span>
                </div>
                <div className="mt-3 font-mono text-3xl font-extrabold text-foreground">$182,940</div>
                <p className="mt-1 text-xs text-muted-foreground">347 swaps · 89 unique referrals</p>
                <div className="mt-4 flex items-end gap-1 h-12">
                  {[40, 65, 50, 80, 70, 90, 100, 75, 85, 95, 88, 100].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-gradient-to-t from-primary/40 to-primary/80"
                      style={{ height: `${h}%` }}
                      aria-hidden
                    />
                  ))}
                </div>
              </div>

              {/* Payouts card */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Recent BTC Payouts
                  </span>
                  <Wallet className="h-3.5 w-3.5 text-primary" />
                </div>
                <ul className="mt-3 space-y-2">
                  {[
                    { date: "Apr 18", amount: "0.00428 BTC", status: "Confirmed" },
                    { date: "Apr 11", amount: "0.00391 BTC", status: "Confirmed" },
                    { date: "Apr 04", amount: "0.00512 BTC", status: "Confirmed" },
                  ].map((p) => (
                    <li key={p.date} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs">
                      <span className="font-mono text-muted-foreground">{p.date}</span>
                      <span className="font-mono font-semibold text-foreground">{p.amount}</span>
                      <span className="inline-flex items-center gap-1 font-display text-[10px] font-semibold text-primary">
                        <Check className="h-3 w-3" /> {p.status}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Auto-paid every 7 days once threshold is met.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <a
                href={langPath(lang, "/partners")}
                className="btn-shimmer inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 font-display text-sm font-bold text-primary-foreground shadow-neon transition-all duration-100 hover:bg-primary/90 hover:-translate-y-0.5"
              >
                <Users className="h-4 w-4" /> Unlock the Full Dashboard <ArrowRight className="h-4 w-4" />
              </a>
              <p className="mt-3 text-xs text-muted-foreground">Free upgrade · no KYC · keep your widget &amp; payouts unchanged.</p>
            </div>
          </div>
        </section>

        {/* REGULATORY EDGE */}
        <section className="border-b border-border py-16 sm:py-20">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="rounded-3xl border border-primary/20 bg-card p-8 sm:p-12 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <Shield className="h-7 w-7 text-primary" aria-hidden />
                </div>
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-display font-semibold text-primary">
                    Regulatory Edge
                  </div>
                  <h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    Promote a Platform Regulators Already Trust
                  </h2>
                  <p className="mt-3 font-body text-sm sm:text-base text-muted-foreground leading-relaxed">
                    MRC GlobalPay is operated by <span className="font-semibold text-foreground">MRC Pay International Corp</span>,
                    a Canadian fintech registered as a{" "}
                    <span className="font-semibold text-foreground">FINTRAC Money Services Business (#C100000015)</span>{" "}
                    and an officially registered{" "}
                    <span className="font-semibold text-foreground">Bank of Canada Payment Service Provider (PSP)</span>.
                    That means every swap you refer flows through a fully supervised, AML-compliant, non-custodial pipeline —
                    something the vast majority of swap aggregators simply cannot offer.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <a
                      href="https://www10.fintrac-canafe.gc.ca/msb-esm/public/msb-search/search-by-name/?searchTerm=MRC+Pay+International"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-display font-semibold text-primary transition-colors hover:bg-primary/20"
                    >
                      <ExternalLink className="h-3 w-3" /> Verify FINTRAC MSB
                    </a>
                    <a
                      href="https://www.bankofcanada.ca/core-functions/retail-payments-supervision/psp-registry/psp-registry-details/?account_id=408b884a-1aa1-ef11-a72d-0022483bf164"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-display font-semibold text-primary transition-colors hover:bg-primary/20"
                    >
                      <ExternalLink className="h-3 w-3" /> Verify Bank of Canada PSP
                    </a>
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Use the official badges above in your content to instantly boost trust and conversion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-muted/30 py-16 sm:py-20">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="rounded-3xl border border-primary/20 bg-card p-8 sm:p-12 text-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-[hsl(var(--neon))]/5" aria-hidden />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-display font-semibold text-primary">
                  <Wallet className="h-3 w-3" /> Tracking & Payouts
                </div>
                <h2 className="mt-4 font-display text-3xl font-extrabold text-foreground sm:text-4xl tracking-tight">
                  {t("affiliates.tracking.title")}
                </h2>
                <p className="mt-4 font-body text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  We track referrals privately using a secure reference. Commissions are paid automatically to the BTC wallet you provide — no dashboard required, no manual claims.
                </p>
                <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={langPath(lang, "/partners")}
                    className="btn-shimmer inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-display text-base font-bold text-primary-foreground shadow-neon transition-all duration-100 hover:bg-primary/90 hover:-translate-y-0.5"
                  >
                    {t("affiliates.tracking.ctaDashboard")} <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#generate"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3.5 font-display text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {t("affiliates.tracking.ctaGenerate")}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TOOLS */}
        <section className="border-b border-border py-16 sm:py-20">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">{t("affiliates.tools.title")}</h2>
              <p className="mt-3 font-body text-muted-foreground">{t("affiliates.tools.subtitle")}</p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {TOOLS.map((tl) => (
                <a key={tl.title} href={tl.href} className="block rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                  <tl.icon className="h-7 w-7 text-primary" aria-hidden />
                  <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{tl.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{tl.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    {t("affiliates.tools.learnMore")} <ArrowRight className="h-3 w-3" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* WHY */}
        <section className="border-b border-border bg-muted/30 py-16 sm:py-20">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">{t("affiliates.why.title")}</h2>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {WHY.map((w) => (
                <div key={w.label} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <w.icon className="h-5 w-5 text-primary" aria-hidden />
                  </div>
                  <span className="font-body text-sm font-medium text-foreground leading-snug pt-1.5">{w.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-b border-border py-16 sm:py-20">
          <div className="container mx-auto max-w-3xl px-4">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">{t("affiliates.faq.title")}</h2>
            </div>

            <Accordion type="single" collapsible className="mt-10 space-y-3">
              {FAQS.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="rounded-xl border border-border bg-card px-5 transition-colors hover:border-primary/40">
                  <AccordionTrigger className="font-display text-left text-base font-semibold text-foreground hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="font-body text-sm text-muted-foreground leading-relaxed">
                    <p>{f.a}</p>
                    {f.tip && (
                      <p className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-[13px] text-foreground/85">
                        <span className="font-semibold text-primary">Quick tip · </span>
                        {f.tip}
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto max-w-2xl px-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-display font-semibold text-primary">
              <Sparkles className="h-3 w-3" /> 60 seconds to your first link
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Your BTC Wallet Is About to Get a Lot Busier
            </h2>
            <p className="mt-3 font-body text-muted-foreground leading-relaxed">
              Join thousands of creators, wallet teams and crypto communities already earning lifetime BTC
              with MRC GlobalPay. No signup, no minimums, no risk — just paste, copy, and earn.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="#generate"
                className="btn-shimmer inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-display text-base font-bold text-primary-foreground shadow-neon transition-all duration-100 hover:bg-primary/90 hover:-translate-y-0.5"
              >
                <Sparkles className="h-4 w-4" /> Generate My Widget Now
              </a>
              <a
                href={langPath(lang, "/partners")}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border-2 border-primary/40 bg-background px-7 py-4 font-display text-sm font-bold text-primary transition-all hover:bg-primary/10 hover:border-primary"
              >
                Open Partner Dashboard <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Bottom cross-links */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs">
              <a
                href={langPath(lang, "/partners")}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 font-display font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                Also check our Partner Program <ArrowRight className="h-3 w-3" />
              </a>
              <a
                href={langPath(lang, "/referral")}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 font-display font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                Referral Program <ArrowRight className="h-3 w-3" />
              </a>
            </div>

            <p className="mt-6 text-[11px] text-muted-foreground">
              Promote with confidence — fully regulated in Canada (FINTRAC MSB #C100000015 · Bank of Canada PSP).
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
};

export default Affiliates;
