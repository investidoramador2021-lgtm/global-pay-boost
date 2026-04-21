import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import {
  Code2, Zap, Globe, Terminal, FileJson, Copy, Check, Layers,
  ArrowRight, Wallet, Monitor, Server, Sparkles, Shield, BookOpen,
  ExternalLink, Webhook, KeyRound, GitBranch,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MsbTrustBar from "@/components/MsbTrustBar";
import { getLangFromPath, langPath } from "@/i18n";

/* ─── Code Snippets ─── */
const SNIPPETS = {
  iframe: `<iframe
  src="https://mrcglobalpay.com/embed/widget?mode=dark&ref=YOUR_REF"
  title="MRC Global Pay — Instant Crypto Swap"
  width="100%"
  height="640"
  loading="lazy"
  referrerpolicy="strict-origin-when-cross-origin"
  allow="clipboard-write"
  style="border:0; border-radius:16px; max-width:520px; display:block; margin:0 auto;">
</iframe>`,

  react: `import { useEffect } from "react";

export function MRCSwapWidget({ refCode = "YOUR_REF", mode = "dark" }) {
  return (
    <iframe
      src={\`https://mrcglobalpay.com/embed/widget?mode=\${mode}&ref=\${refCode}\`}
      title="MRC Global Pay Swap"
      width="100%"
      height="640"
      loading="lazy"
      style={{ border: 0, borderRadius: 16, maxWidth: 520 }}
    />
  );
}`,

  estimate: `// GET /api/v1/estimate
// Get a real-time quote across 6,000+ assets

curl -X GET "https://api.mrcglobalpay.com/v1/estimate?from=btc&to=eth&amount=0.1" \\
  -H "Authorization: Bearer YOUR_API_KEY"

// Response
{
  "from": "btc",
  "to": "eth",
  "fromAmount": 0.1,
  "toAmount": 1.8324,
  "rate": 18.324,
  "fee": 0.0005,
  "estimatedTime": "~3 min",
  "provider": "smart-route"
}`,

  createTx: `// POST /api/v1/transactions
// Create a non-custodial swap transaction

curl -X POST "https://api.mrcglobalpay.com/v1/transactions" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "btc",
    "to": "eth",
    "amount": 0.1,
    "address": "0xRecipientWallet...",
    "ref": "YOUR_REF"
  }'

// Response
{
  "id": "tx_a1b2c3d4",
  "payinAddress": "bc1q...",
  "expectedAmount": 0.1,
  "status": "waiting",
  "trackUrl": "https://mrcglobalpay.com/exchange/tx_a1b2c3d4"
}`,

  webhook: `// POST {your-webhook-url}
// Real-time transaction status updates

{
  "event": "transaction.completed",
  "id": "tx_a1b2c3d4",
  "from": "btc",
  "to": "eth",
  "amountSent": 0.1,
  "amountReceived": 1.8324,
  "ref": "YOUR_REF",
  "commission_btc": 0.00012,
  "timestamp": "2026-04-19T14:32:11Z"
}`,
};

/* ─── Copy Button ─── */
const CopyBtn = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch { /* noop */ }
      }}
      className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/80 px-2.5 py-1.5 font-mono text-[11px] font-semibold text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:text-primary"
      aria-label="Copy code"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

const CodeBlock = ({ code }: { code: string }) => (
  <div className="relative">
    <CopyBtn text={code} />
    <pre className="overflow-x-auto rounded-xl border border-border/60 bg-[hsl(230_15%_6%)] p-4 sm:p-5 pr-20 font-mono text-[11px] sm:text-[12px] leading-relaxed text-foreground/90">
      <code>{code}</code>
    </pre>
  </div>
);

/* ─── Page ─── */
const DeveloperHub = () => {
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const canonicalUrl = `https://mrcglobalpay.com${langPath(lang, "/developer")}`;

  const STEPS = [
    { n: 1, title: "Pick Your Path", desc: "Embed the widget for zero-code integration, or call the REST API for full control." },
    { n: 2, title: "Get Your Ref Code", desc: "Generate a free affiliate ref token on /affiliates — no signup or KYC required." },
    { n: 3, title: "Drop In & Earn", desc: "Paste the iframe or API key, go live, and earn 0.1%–0.4% lifetime BTC commissions." },
  ];

  const BENEFITS = [
    {
      icon: Wallet,
      title: "For Wallets",
      desc: "Add in-wallet swaps across 6,000+ assets. Users never leave your app — funds move wallet-to-wallet, fully non-custodial.",
      tag: "SDK + Widget",
    },
    {
      icon: Monitor,
      title: "For Websites & Blogs",
      desc: "Embed a branded swap widget in 30 seconds. Earn passive BTC commissions on every visitor trade.",
      tag: "Iframe",
    },
    {
      icon: Server,
      title: "For Platforms & Exchanges",
      desc: "REST API with real-time webhooks for transaction status, automated payouts, and institutional volume routing.",
      tag: "REST + Webhooks",
    },
  ];

  const API_ENDPOINTS = [
    { method: "GET", path: "/v1/estimate", desc: "Get a real-time quote for any pair" },
    { method: "GET", path: "/v1/currencies", desc: "List all 6,000+ supported assets and networks" },
    { method: "POST", path: "/v1/transactions", desc: "Create a non-custodial swap" },
    { method: "GET", path: "/v1/transactions/{id}", desc: "Fetch transaction metadata and status" },
    { method: "GET", path: "/v1/transactions/list", desc: "Ledger of all your trades — audit-ready" },
    { method: "POST", path: "/v1/webhooks", desc: "Subscribe to real-time status updates" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Developer & Integration Hub — MRC Global Pay",
    description: "Embed the MRC Global Pay swap widget or integrate via REST API. 6,000+ assets, non-custodial, lifetime BTC revenue share.",
    url: canonicalUrl,
    inLanguage: lang,
  };

  return (
    <>
      <Helmet>
        <title>Developer & Integration Hub — MRC Global Pay</title>
        <meta name="description" content="Embed the MRC Global Pay swap widget or integrate via REST API. 6,000+ assets, non-custodial, lifetime BTC revenue share, FINTRAC-registered." />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="Developer & Integration Hub — MRC Global Pay" />
        <meta property="og:description" content="Widget, REST API, webhooks, and SDKs for crypto swap integration. Lifetime BTC commissions." />
        <meta property="og:url" content={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <SiteHeader />

      <main className="min-h-screen bg-background">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border bg-[hsl(230_15%_6%)] py-16 sm:py-24">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(hsl(var(--neon)) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
            aria-hidden
          />
          <div className="container relative mx-auto max-w-4xl px-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest text-primary">
              <Code2 className="h-3.5 w-3.5" /> Developers
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Developer &{" "}
              <span className="bg-gradient-to-r from-primary to-[hsl(var(--neon))] bg-clip-text text-transparent">
                Integration Hub
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
              Embed our swap widget in 30 seconds or build directly on the REST API.{" "}
              <span className="font-semibold text-foreground">6,000+ assets</span>, fully{" "}
              <span className="font-semibold text-foreground">non-custodial</span>, with{" "}
              <span className="font-semibold text-primary">lifetime BTC revenue share</span> on every referred trade.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#widget"
                className="btn-shimmer inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 font-display text-sm font-bold text-primary-foreground shadow-neon transition-all hover:-translate-y-0.5 hover:bg-primary/90"
              >
                <Sparkles className="h-4 w-4" /> Embed Widget
              </a>
              <a
                href="#api"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 font-display text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Terminal className="h-4 w-4" /> View API Docs
              </a>
            </div>
            <p className="mt-4 font-body text-xs text-muted-foreground">
              Not a developer?{" "}
              <Link to={langPath(lang, "/affiliates")} className="font-semibold text-primary hover:underline">
                Generate a no-code widget on /affiliates →
              </Link>
            </p>
          </div>
        </section>

        <MsbTrustBar />

        {/* GET STARTED */}
        <section className="border-b border-border py-16 sm:py-20">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Get started in 3 steps</h2>
              <p className="mt-3 font-body text-base text-muted-foreground">From zero to live integration in under 5 minutes.</p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {STEPS.map((s) => (
                <div
                  key={s.n}
                  className="rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevated"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-display text-base font-bold text-primary ring-1 ring-primary/20">
                    {s.n}
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="border-b border-border bg-muted/30 py-16 sm:py-20">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest text-primary">
                <Layers className="h-3 w-3" /> Built for every stack
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                One integration, three audiences
              </h2>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {BENEFITS.map(({ icon: Icon, title, desc, tag }) => (
                <div
                  key={title}
                  className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevated"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                      <Icon className="h-5 w-5 text-primary" aria-hidden />
                    </div>
                    <span className="rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                      {tag}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
                  <p className="font-body text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WIDGET INTEGRATION */}
        <section id="widget" className="border-b border-border py-16 sm:py-20">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest text-primary">
                <Globe className="h-3 w-3" /> Widget Integration
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Embed in 30 seconds
              </h2>
              <p className="mt-3 font-body text-base text-muted-foreground">
                Drop a single iframe (or React component) onto your site. Fully responsive, theme-aware, and revenue-tracked.
              </p>
            </div>

            <Tabs defaultValue="html" className="mt-10">
              <TabsList className="mx-auto grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="html" className="font-display font-semibold">HTML / iframe</TabsTrigger>
                <TabsTrigger value="react" className="font-display font-semibold">React Component</TabsTrigger>
              </TabsList>
              <TabsContent value="html" className="mt-5">
                <CodeBlock code={SNIPPETS.iframe} />
              </TabsContent>
              <TabsContent value="react" className="mt-5">
                <CodeBlock code={SNIPPETS.react} />
              </TabsContent>
            </Tabs>

            <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm leading-relaxed text-foreground/90">
              <span className="font-semibold text-primary">Tip · </span>
              Generate a personalized widget with your <code className="font-mono text-xs">ref</code> code on{" "}
              <Link to={langPath(lang, "/affiliates")} className="font-semibold text-primary hover:underline">/affiliates</Link>{" "}
              — no signup, no KYC. Earn lifetime BTC commissions automatically.
            </div>
          </div>
        </section>

        {/* API DOCS */}
        <section id="api" className="border-b border-border bg-muted/30 py-16 sm:py-20">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest text-primary">
                <Terminal className="h-3 w-3" /> REST API
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                API Documentation
              </h2>
              <p className="mt-3 font-body text-base text-muted-foreground">
                Quote, create, and track non-custodial swaps. Authenticated via Bearer key, JSON in/out.
              </p>
            </div>

            {/* Endpoint table */}
            <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
              <div className="grid grid-cols-12 gap-2 border-b border-border bg-muted/40 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <div className="col-span-2">Method</div>
                <div className="col-span-5">Endpoint</div>
                <div className="col-span-5">Description</div>
              </div>
              {API_ENDPOINTS.map((ep) => (
                <div key={ep.path} className="grid grid-cols-12 gap-2 border-b border-border/40 px-4 py-3 text-sm last:border-0 hover:bg-muted/20">
                  <div className="col-span-2">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ${
                      ep.method === "GET"
                        ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                        : "bg-[hsl(45_90%_55%)]/10 text-[hsl(45_90%_55%)] ring-1 ring-[hsl(45_90%_55%)]/20"
                    }`}>
                      {ep.method}
                    </span>
                  </div>
                  <div className="col-span-5 font-mono text-xs text-foreground">{ep.path}</div>
                  <div className="col-span-5 font-body text-xs text-muted-foreground">{ep.desc}</div>
                </div>
              ))}
            </div>

            {/* Code samples */}
            <Tabs defaultValue="estimate" className="mt-10">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="estimate" className="font-display text-xs font-semibold sm:text-sm">
                  <FileJson className="mr-1.5 h-3.5 w-3.5" /> Estimate
                </TabsTrigger>
                <TabsTrigger value="create" className="font-display text-xs font-semibold sm:text-sm">
                  <Zap className="mr-1.5 h-3.5 w-3.5" /> Create Tx
                </TabsTrigger>
                <TabsTrigger value="webhook" className="font-display text-xs font-semibold sm:text-sm">
                  <Webhook className="mr-1.5 h-3.5 w-3.5" /> Webhook
                </TabsTrigger>
              </TabsList>
              <TabsContent value="estimate" className="mt-5">
                <CodeBlock code={SNIPPETS.estimate} />
              </TabsContent>
              <TabsContent value="create" className="mt-5">
                <CodeBlock code={SNIPPETS.createTx} />
              </TabsContent>
              <TabsContent value="webhook" className="mt-5">
                <CodeBlock code={SNIPPETS.webhook} />
              </TabsContent>
            </Tabs>

            {/* API key callout */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-primary" />
                  <h3 className="font-display text-sm font-bold text-foreground">Get an API Key</h3>
                </div>
                <p className="mt-2 font-body text-xs leading-relaxed text-muted-foreground">
                  API keys are issued through the Partner Portal with TOTP 2FA, IP whitelisting, and webhook URL configuration.
                </p>
                <Link
                  to={langPath(lang, "/partners")}
                  className="mt-3 inline-flex items-center gap-1 font-display text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                >
                  Open Partner Portal <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <h3 className="font-display text-sm font-bold text-foreground">Auth & Security</h3>
                </div>
                <p className="mt-2 font-body text-xs leading-relaxed text-muted-foreground">
                  Bearer token authentication. All requests over TLS 1.3. Webhook payloads signed with HMAC-SHA256.
                </p>
                <a
                  href="/api-docs"
                  className="mt-3 inline-flex items-center gap-1 font-display text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                >
                  Full reference <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* AFFILIATES BRIDGE */}
        <section className="border-b border-border py-16 sm:py-20">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-card p-8 sm:p-12 shadow-elevated">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-[hsl(var(--neon))]/10" aria-hidden />
              <div className="relative grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest text-primary">
                    <BookOpen className="h-3 w-3" /> No-code path
                  </span>
                  <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Not a developer? Use the no-code generator.
                  </h2>
                  <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Bloggers, YouTubers, wallet owners, and crypto communities can generate a personalized widget in 30 seconds — no code, no signup, lifetime BTC payouts.
                  </p>
                </div>
                <Link
                  to={langPath(lang, "/affiliates")}
                  className="btn-shimmer inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-display text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-neon transition-all hover:-translate-y-0.5 hover:bg-primary/90 sm:px-7"
                >
                  Go to Affiliates <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* RESOURCES */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">More resources</h2>
              <p className="mt-3 font-body text-base text-muted-foreground">Everything you need to ship.</p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: GitBranch,
                  title: "GitHub Examples",
                  desc: "Reference implementations and sample code for integrating our swap widget in Next.js, React, Vue, and vanilla JavaScript. More examples coming soon.",
                  href: "https://github.com/mrcglobal",
                  cta: "Explore on GitHub",
                  external: true,
                },
                {
                  icon: Webhook,
                  title: "Webhook Cookbook",
                  desc: "Practical guides and code examples for handling swap status events, confirmations, and error handling safely. Expanding regularly.",
                  href: "https://github.com/mrcglobal",
                  cta: "View Cookbook",
                  external: true,
                },
                {
                  icon: BookOpen,
                  title: "Technical Documentation & Whitepapers",
                  desc: "Deep dives into our stateless routing architecture, institutional compliance rails, zero-knowledge settlement, and multi-chain liquidity mesh.",
                  href: "https://github.com/mrcglobal",
                  cta: "Read Documentation",
                  external: true,
                },
              ].map(({ icon: Icon, title, desc, href, cta, external }) => (
                <a
                  key={title}
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevated"
                >
                  <Icon className="h-6 w-6 text-primary" aria-hidden />
                  <h3 className="font-display text-base font-bold text-foreground">{title}</h3>
                  <p className="font-body text-sm leading-relaxed text-muted-foreground">{desc}</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-2 font-display text-xs font-bold uppercase tracking-wider text-primary">
                    {cta} <ArrowRight className="h-3 w-3" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
};

export default DeveloperHub;
