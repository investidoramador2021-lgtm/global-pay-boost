import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
  Shield, Code2, Zap, Link2, Globe, Clock, ExternalLink, Terminal, FileJson,
  Copy, Check, Layers, Paintbrush, DollarSign, Lock, ArrowRight, ChevronRight,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MsbTrustBar from "@/components/MsbTrustBar";

/* ─── Static Data (SEO) ─── */

const SUPPORTED_CHAINS = [
  { name: "Bitcoin (BTC)", network: "Bitcoin", avgConfirm: "~10 min", ticker: "btc" },
  { name: "Ethereum (ETH)", network: "Ethereum", avgConfirm: "~15 sec", ticker: "eth" },
  { name: "Solana (SOL)", network: "Solana", avgConfirm: "~0.4 sec", ticker: "sol" },
  { name: "BNB (BNB)", network: "BNB Smart Chain", avgConfirm: "~3 sec", ticker: "bnb" },
  { name: "XRP (XRP)", network: "Ripple", avgConfirm: "~4 sec", ticker: "xrp" },
  { name: "Tron (TRX)", network: "Tron", avgConfirm: "~3 sec", ticker: "trx" },
  { name: "Litecoin (LTC)", network: "Litecoin", avgConfirm: "~2.5 min", ticker: "ltc" },
  { name: "Dogecoin (DOGE)", network: "Dogecoin", avgConfirm: "~1 min", ticker: "doge" },
  { name: "Cardano (ADA)", network: "Cardano", avgConfirm: "~20 sec", ticker: "ada" },
  { name: "Polkadot (DOT)", network: "Polkadot", avgConfirm: "~6 sec", ticker: "dot" },
  { name: "Avalanche (AVAX)", network: "Avalanche C-Chain", avgConfirm: "~2 sec", ticker: "avax" },
  { name: "Polygon (MATIC)", network: "Polygon", avgConfirm: "~2 sec", ticker: "matic" },
  { name: "Monero (XMR)", network: "Monero", avgConfirm: "~2 min", ticker: "xmr" },
  { name: "Cosmos (ATOM)", network: "Cosmos Hub", avgConfirm: "~6 sec", ticker: "atom" },
  { name: "Celestia (TIA)", network: "Celestia", avgConfirm: "~12 sec", ticker: "tia" },
  { name: "Arbitrum (ARB)", network: "Arbitrum One", avgConfirm: "~0.3 sec", ticker: "arb" },
  { name: "Optimism (OP)", network: "Optimism", avgConfirm: "~2 sec", ticker: "op" },
  { name: "USDT (TRC-20)", network: "Tron", avgConfirm: "~3 sec", ticker: "usdt" },
  { name: "USDC (ERC-20)", network: "Ethereum", avgConfirm: "~15 sec", ticker: "usdc" },
];

const DEEPLINK_EXAMPLES = [
  { url: "https://mrcglobalpay.com/embed/widget?from=btc&to=usdt", desc: "BTC → USDT swap widget" },
  { url: "https://mrcglobalpay.com/embed/widget?from=sol&to=usdt", desc: "SOL → USDT swap widget" },
  { url: "https://mrcglobalpay.com/embed/widget?from=xrp&to=usdc", desc: "XRP → USDC swap widget" },
  { url: "https://mrcglobalpay.com/#exchange", desc: "Main exchange (full page)" },
  { url: "https://mrcglobalpay.com/swap/btc-usdc", desc: "BTC/USDC dedicated pair page" },
  { url: "https://mrcglobalpay.com/solutions/how-to-swap-btc-to-usdc", desc: "BTC→USDC solution guide" },
];

/* ─── JSON-LD ─── */

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Developer Hub — Build Your Own Crypto Exchange | MRC GlobalPay",
  description: "Access institutional-grade liquidity, 500+ assets, and automated settlement rails. Integrate our non-custodial API or Widget in minutes.",
  url: "https://mrcglobalpay.com/developer",
  isPartOf: { "@type": "WebSite", name: "MRC GlobalPay", url: "https://mrcglobalpay.com" },
  publisher: {
    "@type": "Organization", name: "MRC GlobalPay", url: "https://mrcglobalpay.com",
    knowsAbout: ["Non-Custodial Swaps", "FINTRAC Compliance", "Crypto API", "White-Label Exchange"],
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://mrcglobalpay.com" },
      { "@type": "ListItem", position: 2, name: "Developer Hub", item: "https://mrcglobalpay.com/developer" },
    ],
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "How do I embed the MRC GlobalPay swap widget?", acceptedAnswer: { "@type": "Answer", text: "Copy the one-line iframe snippet from the Developer Hub page and paste it into your HTML. The widget supports 500+ tokens with live pricing and requires no API key." } },
    { "@type": "Question", name: "Can I pre-fill the swap pair via URL parameters?", acceptedAnswer: { "@type": "Answer", text: "Yes. Use ?from=BTC&to=USDT query parameters on the widget URL or the main exchange to pre-select trading pairs for your users." } },
    { "@type": "Question", name: "Does MRC GlobalPay require an account?", acceptedAnswer: { "@type": "Answer", text: "MRC GlobalPay is a registration-free platform. You can swap crypto directly from your wallet without creating an account." } },
  ],
};

/* ─── Code Snippets ─── */

const API_SNIPPETS = {
  currencies: `GET /api/v1/currencies

curl -s https://api.mrcglobalpay.com/currencies \\
  -H "Accept: application/json"

// Response
{
  "currencies": [
    {
      "ticker": "btc",
      "name": "Bitcoin",
      "network": "bitcoin",
      "hasExternalId": false,
      "isFiat": false
    },
    {
      "ticker": "eth",
      "name": "Ethereum",
      "network": "ethereum",
      "hasExternalId": false,
      "isFiat": false
    }
    // ... 500+ assets
  ]
}`,
  transaction: `POST /api/v1/create_transaction

curl -X POST https://api.mrcglobalpay.com/create_transaction \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "btc",
    "to": "eth",
    "address": "0xYourEthAddress...",
    "amount": 0.01
  }'

// Response
{
  "id": "txn_abc123...",
  "payinAddress": "bc1q...",
  "payoutAddress": "0xYourEthAddress...",
  "fromCurrency": "btc",
  "toCurrency": "eth",
  "amount": 0.01,
  "status": "waiting"
}`,
  widget: `<!-- One-line embed — no API key required -->
<iframe
  src="https://mrcglobalpay.com/embed/widget?from=btc&to=usdt"
  width="400"
  height="440"
  style="border:none;border-radius:16px;"
  allow="clipboard-write"
  title="MRC GlobalPay Swap Widget"
></iframe>

<!-- Deep-link parameters -->
<!-- ?from=sol&to=usdt   → Pre-select SOL→USDT -->
<!-- ?tab=buysell         → Open Buy/Sell tab  -->`,
};

/* ─── Sub-components ─── */

const CodeBlock = ({ code, lang = "bash" }: { code: string; lang?: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute end-3 top-3 z-10 flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 font-body text-[10px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
        title="Copy to clipboard"
      >
        {copied ? <><Check className="h-3 w-3 text-primary" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
      </button>
      <pre className="overflow-x-auto rounded-xl border border-border bg-[hsl(230_15%_8%)] p-5 pe-16 font-mono text-[13px] leading-relaxed text-[hsl(210_20%_88%)] selection:bg-primary/20">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const EarningsEstimator = () => {
  const [volume, setVolume] = useState([500000]);
  const monthlyRevenue = useMemo(() => volume[0] * 0.004, [volume]);
  const annualRevenue = useMemo(() => monthlyRevenue * 12, [monthlyRevenue]);
  const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${n.toFixed(0)}`;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-col gap-6">
        <div>
          <label className="font-display text-sm font-semibold text-foreground block mb-1">
            Monthly Transaction Volume
          </label>
          <p className="text-xs text-muted-foreground mb-4">Drag the slider to estimate your partner revenue at 0.4% commission.</p>
          <Slider
            min={10000}
            max={5000000}
            step={10000}
            value={volume}
            onValueChange={setVolume}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>$10k</span>
            <span className="font-semibold text-foreground text-sm">{fmt(volume[0])}</span>
            <span>$5M</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-semibold">Monthly Revenue</p>
            <p className="font-display text-2xl font-bold text-primary mt-1">{fmt(monthlyRevenue)}</p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-semibold">Annual Revenue</p>
            <p className="font-display text-2xl font-bold text-primary mt-1">{fmt(annualRevenue)}</p>
          </div>
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

/* ─── Main Page ─── */

const DeveloperHub = () => (
  <>
    <Helmet>
      <title>Developer Hub — Build Your Own Crypto Exchange | MRC GlobalPay</title>
      <meta name="description" content="Access institutional-grade liquidity, 500+ assets, and automated settlement rails. Integrate our non-custodial API or Widget in minutes. Canadian MSB registered." />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href="https://mrcglobalpay.com/developer" />
      <meta property="og:title" content="Developer Hub — Build Your Own Crypto Exchange | MRC GlobalPay" />
      <meta property="og:description" content="Access institutional-grade liquidity, 500+ assets, and automated settlement rails. Integrate in minutes." />
      <meta property="og:url" content="https://mrcglobalpay.com/developer" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="MRC GlobalPay" />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
    </Helmet>

    <SiteHeader />
    <main className="min-h-screen bg-background">
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden border-b border-border bg-[hsl(230_15%_6%)] py-16 sm:py-24">
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(hsl(var(--neon)) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="pointer-events-none absolute -start-40 top-10 h-80 w-80 rounded-full bg-primary/[0.06] blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -end-32 bottom-10 h-64 w-64 rounded-full bg-[hsl(var(--neon-blue))]/[0.05] blur-3xl" aria-hidden />

        <div className="container relative mx-auto max-w-[1200px] px-4">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-xs text-[hsl(210_20%_60%)]">
              <li><a href="/" className="hover:text-[hsl(210_20%_88%)]">Home</a></li>
              <li>/</li>
              <li className="text-[hsl(210_20%_88%)] font-medium">Developer Hub</li>
            </ol>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* Copy */}
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">Infrastructure for Builders</p>
              <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-[hsl(210_20%_95%)] sm:text-4xl lg:text-[2.75rem]">
                Build Your Own Crypto Exchange with{" "}
                <span className="text-gradient-neon">MRC&nbsp;Global&nbsp;Pay.</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-[hsl(210_20%_65%)] sm:text-lg">
                Access institutional-grade liquidity, 500+ assets, and automated settlement rails.
                Integrate our non-custodial API or Widget in minutes.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#quick-start"
                  className="btn-shimmer inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-display text-sm font-bold text-primary-foreground transition-all duration-100 hover:bg-primary/90"
                >
                  View API Docs <ChevronRight className="h-4 w-4" />
                </a>
                <a
                  href="/get-widget"
                  className="inline-flex items-center gap-2 rounded-xl border border-[hsl(210_20%_25%)] bg-[hsl(230_15%_12%)] px-6 py-3 font-display text-sm font-semibold text-[hsl(210_20%_88%)] transition-all duration-100 hover:border-[hsl(210_20%_35%)] hover:bg-[hsl(230_15%_16%)]"
                >
                  Get Widget <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              {/* Stats */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { value: "500+", label: "Assets" },
                  { value: "700+", label: "Liquidity Sources" },
                  { value: "<60s", label: "Settlement" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-display text-xl font-extrabold text-primary sm:text-2xl">{s.value}</p>
                    <p className="text-[10px] uppercase tracking-wider text-[hsl(210_20%_55%)] font-display font-semibold">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Preview */}
            <div className="relative rounded-2xl border border-[hsl(210_20%_18%)] bg-[hsl(230_15%_10%)] p-1">
              <div className="flex items-center gap-1.5 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(0_80%_60%)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(45_90%_55%)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(140_70%_45%)]" />
                <span className="ms-3 font-mono text-[10px] text-[hsl(210_20%_45%)]">create_transaction.sh</span>
              </div>
              <pre className="overflow-x-auto px-4 pb-4 font-mono text-[12px] leading-relaxed text-[hsl(210_20%_75%)]">
                <code>{`curl -X POST https://api.mrcglobalpay.com/create_transaction \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "btc",
    "to": "eth",
    "address": "0xYour...",
    "amount": 0.01
  }'

# → { "id": "txn_abc...", "status": "waiting" }`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRODUCT PILLARS ═══ */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto max-w-[1200px] px-4">
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary text-center mb-2">Solutions</p>
          <h2 className="font-display text-2xl font-bold text-foreground text-center sm:text-3xl mb-4">
            Three ways to integrate
          </h2>
          <p className="mx-auto max-w-xl text-center text-muted-foreground mb-12">
            From full API access to zero-code embeds — choose the integration depth that matches your product.
          </p>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Terminal,
                title: "Exchange API",
                subtitle: "Full control for custom apps",
                desc: "RESTful endpoints for creating transactions, fetching rates, and managing settlements. Build a fully custom exchange experience with your own UI.",
                cta: { label: "View API Docs", href: "#quick-start" },
              },
              {
                icon: Code2,
                title: "Instant Widget",
                subtitle: "No-code solution for websites",
                desc: "One-line iframe embed with live pricing, 500+ tokens, and deep-link parameters. No API key required — works out of the box on any website or blog.",
                cta: { label: "Get Widget", href: "/get-widget" },
              },
              {
                icon: Paintbrush,
                title: "White-Label Solution",
                subtitle: "Fully branded exchange",
                desc: "Launch your own branded crypto exchange powered by MRC GlobalPay's institutional liquidity. Custom domain, your brand, our rails.",
                cta: { label: "Contact Sales", href: "/partners" },
              },
            ].map((p) => (
              <div key={p.title} className="group rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-elevated hover:-translate-y-1">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-4">
                  <p.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">{p.title}</h3>
                <p className="text-xs text-primary font-semibold mb-2">{p.subtitle}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{p.desc}</p>
                <a href={p.cta.href} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                  {p.cta.label} <ChevronRight className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ B2B TRUST SIGNALS ═══ */}
      <section className="border-y border-border bg-muted/30 py-16 sm:py-20">
        <div className="container mx-auto max-w-[1200px] px-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">Compliance</p>
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl mb-4">
                Why partner with a regulated Canadian MSB?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                MRC GlobalPay is a registered Money Services Business under FINTRAC (Canada).
                Our non-custodial architecture means zero custody risk for you and your users — assets never touch our servers.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Shield, title: "FINTRAC Compliant", desc: "MSB Registration C100000015. Full AML/ATF compliance." },
                  { icon: Lock, title: "Non-Custodial", desc: "Zero custody risk. Assets move wallet-to-wallet." },
                  { icon: Globe, title: "Global Fiat Rails", desc: "CAD, USD, BRL, EUR on-ramp via regulated gateway." },
                  { icon: Zap, title: "Instant Settlement", desc: "Automated clearing in under 60 seconds." },
                ].map((t) => (
                  <div key={t.title} className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <t.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-bold text-foreground">{t.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Earnings Estimator */}
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Revenue Calculator</p>
              <h3 className="font-display text-lg font-bold text-foreground mb-4">Estimate your partner earnings</h3>
              <EarningsEstimator />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TECHNICAL QUICK-START ═══ */}
      <section id="quick-start" className="py-16 sm:py-20">
        <div className="container mx-auto max-w-[1200px] px-4">
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary text-center mb-2">Quick Start</p>
          <h2 className="font-display text-2xl font-bold text-foreground text-center sm:text-3xl mb-4">
            Integrate in minutes
          </h2>
          <p className="mx-auto max-w-xl text-center text-muted-foreground mb-10">
            Three endpoints is all you need. No API key required for the widget — full API access available to partners.
          </p>

          <div className="mx-auto max-w-3xl">
            <Tabs defaultValue="currencies">
              <TabsList className="w-full justify-start bg-muted/50 rounded-xl p-1 mb-1">
                <TabsTrigger value="currencies" className="rounded-lg font-mono text-xs">GET /currencies</TabsTrigger>
                <TabsTrigger value="transaction" className="rounded-lg font-mono text-xs">POST /create_transaction</TabsTrigger>
                <TabsTrigger value="widget" className="rounded-lg font-mono text-xs">Widget Embed</TabsTrigger>
              </TabsList>
              <TabsContent value="currencies">
                <CodeBlock code={API_SNIPPETS.currencies} />
              </TabsContent>
              <TabsContent value="transaction">
                <CodeBlock code={API_SNIPPETS.transaction} />
              </TabsContent>
              <TabsContent value="widget">
                <CodeBlock code={API_SNIPPETS.widget} lang="html" />
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-8 text-center">
            <a href="/get-widget" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              Open Widget Generator <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="border-t border-border bg-muted/20 py-16 sm:py-20">
        <div className="container mx-auto max-w-[1200px] px-4">
          <h2 className="font-display text-2xl font-bold text-foreground text-center sm:text-3xl mb-10">Developer FAQ</h2>
          <div className="mx-auto max-w-2xl space-y-3">
            {[
              { q: "How do I embed the MRC GlobalPay swap widget?", a: "Copy the one-line iframe snippet from the Quick Start section and paste it into your HTML. The widget supports 500+ tokens with live pricing and requires no API key." },
              { q: "Can I pre-fill the swap pair via URL parameters?", a: "Yes. Use ?from=BTC&to=USDT query parameters on the widget URL or the main exchange to pre-select trading pairs for your users." },
              { q: "Does MRC GlobalPay require an account?", a: "MRC GlobalPay is a registration-free platform. You can swap crypto directly from your wallet without creating an account. We are a Canadian-registered MSB with FINTRAC." },
              { q: "Is there a rate limit on the widget?", a: "The embedded widget uses the same live pricing engine as our main site. There are no API keys or rate limits — it works out of the box." },
              { q: "How does the partner revenue model work?", a: "Partners earn up to 0.4% commission on all API-driven transaction volume routed through their integration. Revenue is settled in BTC to your designated wallet on a recurring basis." },
            ].map((faq) => (
              <details key={faq.q} className="rounded-xl border border-border bg-card group">
                <summary className="cursor-pointer px-5 py-4 font-display text-sm font-semibold text-foreground flex items-center justify-between">
                  {faq.q}
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DIRECTORY & ECOSYSTEM (SEO preservation) ═══ */}
      <section className="border-t border-border py-16 sm:py-20">
        <div className="container mx-auto max-w-[1200px] px-4">
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary text-center mb-2">Directory & Ecosystem</p>
          <h2 className="font-display text-2xl font-bold text-foreground text-center sm:text-3xl mb-10">
            Supported Networks & Resources
          </h2>

          {/* Supported Chains */}
          <div className="mb-12">
            <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Supported Networks &amp; Confirmation Speeds
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-start font-display font-semibold text-foreground">Asset</th>
                    <th className="px-4 py-3 text-start font-display font-semibold text-foreground">Network</th>
                    <th className="px-4 py-3 text-start font-display font-semibold text-foreground">Ticker</th>
                    <th className="px-4 py-3 text-start font-display font-semibold text-foreground">Avg Confirmation</th>
                  </tr>
                </thead>
                <tbody>
                  {SUPPORTED_CHAINS.map((c) => (
                    <tr key={c.ticker} className="border-b border-border last:border-0">
                      <td className="px-4 py-2.5 font-medium text-foreground">{c.name}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{c.network}</td>
                      <td className="px-4 py-2.5"><code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">{c.ticker}</code></td>
                      <td className="px-4 py-2.5 text-muted-foreground flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary/60" />{c.avgConfirm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">* Representative sample — 500+ tokens supported across all major blockchains.</p>
          </div>

          {/* Deep-links */}
          <div className="mb-12">
            <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              URL Deep-Linking &amp; Swap Pairs
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-start font-display font-semibold text-foreground">URL</th>
                    <th className="px-4 py-3 text-start font-display font-semibold text-foreground">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {DEEPLINK_EXAMPLES.map((ex) => (
                    <tr key={ex.url} className="border-b border-border last:border-0">
                      <td className="px-4 py-2.5"><code className="text-xs font-mono text-primary break-all">{ex.url}</code></td>
                      <td className="px-4 py-2.5 text-muted-foreground">{ex.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Related Resources */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Widget Generator (Visual Builder)", href: "/get-widget" },
              { label: "Compare MRC vs 50+ Exchanges", href: "/compare" },
              { label: "Micro-Swap Solution Guides", href: "/solutions" },
              { label: "Trust & Transparency Hub", href: "/learn" },
              { label: "Why Non-Custodial Is Safer", href: "/learn/why-non-custodial-is-safer" },
              { label: "FINTRAC MSB Registration", href: "/learn/canadian-fintrac-msb" },
              { label: "Bot Manifest (JSON)", href: "/trading-bot-manifest.json" },
              { label: "Full Compliance Documentation", href: "/compliance" },
              { label: "Partner Program", href: "/partners" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
    <MsbTrustBar />
    <SiteFooter />
  </>
);

export default DeveloperHub;
