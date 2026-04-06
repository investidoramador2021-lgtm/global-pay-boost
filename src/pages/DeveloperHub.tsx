import { Helmet } from "react-helmet-async";
import { Shield, Code2, Zap, Link2, Globe, Clock } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MsbTrustBar from "@/components/MsbTrustBar";

const SUPPORTED_CHAINS = [
  { name: "Bitcoin (BTC)", network: "Bitcoin", avgConfirm: "~10 min (1 conf)", ticker: "btc" },
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

const WIDGET_SNIPPET = `<iframe
  src="https://mrcglobalpay.com/embed/widget?from=btc&to=usdt"
  width="400"
  height="440"
  style="border:none;border-radius:16px;"
  allow="clipboard-write"
  title="MRC GlobalPay Crypto Swap Widget"
></iframe>`;

const DEEPLINK_EXAMPLES = [
  { url: "https://mrcglobalpay.com/embed/widget?from=btc&to=eth", desc: "BTC → ETH swap widget" },
  { url: "https://mrcglobalpay.com/embed/widget?from=sol&to=usdt", desc: "SOL → USDT swap widget" },
  { url: "https://mrcglobalpay.com/embed/widget?from=xrp&to=usdc", desc: "XRP → USDC swap widget" },
  { url: "https://mrcglobalpay.com/#exchange", desc: "Main exchange (full page)" },
  { url: "https://mrcglobalpay.com/swap/btc-usdc", desc: "BTC/USDC dedicated pair page" },
  { url: "https://mrcglobalpay.com/solutions/how-to-swap-btc-to-usdc", desc: "BTC→USDC solution guide" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Developer Hub — MRC GlobalPay API & Widget Documentation",
  description: "Integration docs for MRC GlobalPay's embeddable crypto swap widget, URL deep-linking, and supported blockchain networks.",
  url: "https://mrcglobalpay.com/developer",
  isPartOf: {
    "@type": "WebSite",
    name: "MRC GlobalPay",
    url: "https://mrcglobalpay.com",
  },
  publisher: {
    "@type": "Organization",
    name: "MRC GlobalPay",
    url: "https://mrcglobalpay.com",
    knowsAbout: ["Non-Custodial Swaps", "FINTRAC Compliance", "Micro-transactions", "Blockchain Interoperability"],
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
    {
      "@type": "Question",
      name: "How do I embed the MRC GlobalPay swap widget?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Copy the one-line iframe snippet from the Developer Hub page and paste it into your HTML. The widget supports 500+ tokens with live pricing and requires no API key.",
      },
    },
    {
      "@type": "Question",
      name: "Can I pre-fill the swap pair via URL parameters?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Use ?from=BTC&to=USDT query parameters on the widget URL or the main exchange to pre-select trading pairs for your users.",
      },
    },
    {
      "@type": "Question",
      name: "Does MRC GlobalPay require an account?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "MRC GlobalPay is a registration-free platform. You can swap crypto directly from your wallet without creating an account. We are a Canadian-registered MSB with FINTRAC.",
      },
    },
  ],
};

const CodeBlock = ({ code, lang = "html" }: { code: string; lang?: string }) => (
  <div className="relative">
    <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 font-mono text-sm leading-relaxed text-foreground">
      <code>{code}</code>
    </pre>
  </div>
);

const QuickFacts = () => (
  <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mb-10">
    <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-primary mb-3">Quick Facts — MRC GlobalPay</h3>
    <ul className="grid gap-2 text-sm text-foreground sm:grid-cols-2">
      <li><strong>Minimum Swap:</strong> $0.30</li>
      <li><strong>License:</strong> FINTRAC MSB (Canada)</li>
      <li><strong>Custody:</strong> Non-Custodial</li>
      <li><strong>Registration:</strong> Not Required</li>
      <li><strong>Assets:</strong> 500+ Tokens</li>
      <li><strong>Speed:</strong> Under 60 Seconds</li>
      <li><strong>Infrastructure:</strong> ChangeNOW + Fireblocks</li>
      <li><strong>Liquidity Sources:</strong> 700+</li>
    </ul>
  </div>
);

const DeveloperHub = () => (
  <>
    <Helmet>
      <title>Developer Hub — Widget & API Docs | MRC GlobalPay</title>
      <meta name="description" content="Integrate MRC GlobalPay's crypto swap widget into your site. One-line iframe, URL deep-linking docs, and supported chain table. Registration-free, non-custodial." />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href="https://mrcglobalpay.com/developer" />
      <meta property="og:title" content="Developer Hub — MRC GlobalPay" />
      <meta property="og:description" content="Embed a free crypto swap widget with one line of code. 500+ tokens, live pricing, no API key needed." />
      <meta property="og:url" content="https://mrcglobalpay.com/developer" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="MRC GlobalPay" />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
    </Helmet>

    <SiteHeader />
    <main className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="container mx-auto px-4 pt-6">
        <ol className="flex items-center gap-2 text-xs text-muted-foreground">
          <li><a href="/" className="hover:text-foreground">Home</a></li>
          <li>/</li>
          <li className="text-foreground font-medium">Developer Hub</li>
        </ol>
      </nav>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl mb-4">
          Developer Hub: Integrate MRC GlobalPay
        </h1>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          Embed our registration-free, non-custodial crypto swap widget into any website with a single line of code.
          Pre-fill pairs via URL parameters, and reference our supported chain table for integration planning.
        </p>

        <QuickFacts />

        {/* Section 1: Widget Integration */}
        <section className="mb-14">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            Widget Integration — One-Line Embed
          </h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Copy the iframe snippet below and paste it into your HTML. No API key, no registration, no dependencies.
            The widget connects to 700+ liquidity sources and supports 500+ tokens with live pricing.
          </p>
          <CodeBlock code={WIDGET_SNIPPET} />
          <p className="mt-3 text-sm text-muted-foreground">
            Need more sizes?{" "}
            <a href="/get-widget" className="text-primary hover:underline">Use the Widget Generator →</a>
          </p>
        </section>

        {/* Section 2: URL Deep-Linking */}
        <section className="mb-14">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Link2 className="h-6 w-6 text-primary" />
            URL Deep-Linking — Pre-Fill Swap Pairs
          </h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Use query parameters to pre-select the <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground">from</code> and{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground">to</code> tokens.
            Tickers are lowercase (e.g., <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground">btc</code>,{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground">usdt</code>,{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground">sol</code>).
          </p>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-display font-semibold text-foreground">URL</th>
                  <th className="px-4 py-3 text-left font-display font-semibold text-foreground">Description</th>
                </tr>
              </thead>
              <tbody>
                {DEEPLINK_EXAMPLES.map((ex) => (
                  <tr key={ex.url} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono text-primary break-all">{ex.url}</code>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{ex.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-sm font-semibold text-foreground mb-2">Parameter Reference</h3>
            <CodeBlock code={`?from=<ticker>&to=<ticker>

Examples:
  ?from=btc&to=usdt    → Bitcoin to Tether
  ?from=eth&to=sol     → Ethereum to Solana
  ?from=xrp&to=usdc    → Ripple to USD Coin

Tickers use lowercase standard symbols.
Full list: 500+ tokens available.`} lang="text" />
          </div>
        </section>

        {/* Section 3: Supported Networks Table */}
        <section className="mb-14">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            Supported Networks & Confirmation Speeds
          </h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            MRC GlobalPay aggregates liquidity across the following networks. Actual swap speed includes routing optimization
            and typically completes in under 60 seconds regardless of the underlying chain confirmation time.
          </p>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-display font-semibold text-foreground">Asset</th>
                  <th className="px-4 py-3 text-left font-display font-semibold text-foreground">Network</th>
                  <th className="px-4 py-3 text-left font-display font-semibold text-foreground">Ticker</th>
                  <th className="px-4 py-3 text-left font-display font-semibold text-foreground">Avg Confirmation</th>
                </tr>
              </thead>
              <tbody>
                {SUPPORTED_CHAINS.map((chain) => (
                  <tr key={chain.ticker} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{chain.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{chain.network}</td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">{chain.ticker}</code>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary/60" />
                      {chain.avgConfirm}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            * This is a representative sample. MRC GlobalPay supports 500+ tokens across all major blockchains.
          </p>
        </section>

        {/* Section 4: Security Architecture */}
        <section className="mb-14">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Security Architecture — Non-Custodial
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            MRC GlobalPay is <strong className="text-foreground">non-custodial</strong> — we never hold user funds.
            Assets move directly via our partner <strong className="text-foreground">ChangeNOW's</strong> institutional-grade
            infrastructure, secured by <strong className="text-foreground">Fireblocks</strong> MPC technology.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Shield, title: "FINTRAC Registered MSB", desc: "Canadian Money Services Business — fully regulated." },
              { icon: Zap, title: "Non-Custodial Architecture", desc: "Zero custody risk. Assets never touch our servers." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-lg border border-border bg-card p-4">
                <Icon className="h-5 w-5 text-primary mb-2" />
                <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">Developer FAQ</h2>
          <div className="space-y-4">
            {[
              { q: "How do I embed the MRC GlobalPay swap widget?", a: "Copy the one-line iframe snippet from this page and paste it into your HTML. The widget supports 500+ tokens with live pricing and requires no API key." },
              { q: "Can I pre-fill the swap pair via URL parameters?", a: "Yes. Use ?from=BTC&to=USDT query parameters on the widget URL or the main exchange to pre-select trading pairs for your users." },
              { q: "Does MRC GlobalPay require an account?", a: "MRC GlobalPay is a registration-free platform. You can swap crypto directly from your wallet without creating an account. We are a Canadian-registered MSB with FINTRAC." },
              { q: "Is there a rate limit on the widget?", a: "The embedded widget uses the same live pricing engine as our main site. There are no API keys or rate limits — it works out of the box." },
            ].map((faq) => (
              <details key={faq.q} className="rounded-lg border border-border bg-card">
                <summary className="cursor-pointer px-4 py-3 font-display text-sm font-semibold text-foreground">{faq.q}</summary>
                <p className="px-4 pb-4 text-sm text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Internal Links */}
        <nav className="rounded-xl border border-border bg-muted/30 p-5">
          <h3 className="font-display text-sm font-semibold text-foreground mb-3">Related Resources</h3>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            <li><a href="/get-widget" className="text-primary hover:underline">Widget Generator (Visual Builder) →</a></li>
            <li><a href="/compare" className="text-primary hover:underline">Compare MRC vs 50+ Exchanges →</a></li>
            <li><a href="/solutions" className="text-primary hover:underline">Micro-Swap Solution Guides →</a></li>
            <li><a href="/learn" className="text-primary hover:underline">Trust & Transparency Hub →</a></li>
            <li><a href="/learn/why-non-custodial-is-safer" className="text-primary hover:underline">Why Non-Custodial Is Safer →</a></li>
            <li><a href="/learn/canadian-fintrac-msb" className="text-primary hover:underline">FINTRAC MSB Registration →</a></li>
          </ul>
        </nav>
      </div>
    </main>
    <MsbTrustBar />
    <SiteFooter />
  </>
);

export default DeveloperHub;
