import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Shield, Code2, Zap, Link2, Globe, Clock, ExternalLink, Terminal, FileJson, Copy, Check } from "lucide-react";
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

const FETCH_SNIPPET = `// Fetch the MRC GlobalPay Bot Manifest
fetch('https://mrcglobalpay.com/trading-bot-manifest.json')
  .then(res => res.json())
  .then(data => {
    console.log('Min swap:', data.min_swap_usd);
    console.log('Pairs:', data.pairs);
  });`;

const CURL_SNIPPET = `curl -s https://mrcglobalpay.com/trading-bot-manifest.json | jq .`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Developer Hub — MRC GlobalPay API & Widget Documentation",
  description: "Official Developer Hub for MRC GlobalPay. Access our crypto swap API, bot manifest, and $0.30 liquidity rails for automated trading and dust cleaning.",
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

const softwareSourceCodeJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  name: "MRC GlobalPay Trading Bot Manifest",
  codeRepository: "https://mrcglobalpay.com/trading-bot-manifest.json",
  programmingLanguage: "JSON",
  runtimePlatform: "Any",
  description: "Machine-readable manifest for automated trading bots. Includes top swap pairs, minimum thresholds, and live API endpoints for the MRC GlobalPay $0.30 settlement engine.",
  author: {
    "@type": "Organization",
    name: "MRC GlobalPay",
    identifier: "C100000015",
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

const CodeBlock = ({ code, lang = "html" }: { code: string; lang?: string }) => {
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
        className="absolute right-2 top-2 flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 font-body text-[10px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground hover:bg-accent"
        title="Copy to clipboard"
      >
        {copied ? <><Check className="h-3 w-3 text-primary" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
      </button>
      <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 pr-20 font-mono text-sm leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
};

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
      <title>Developer Hub — API & Bot Access | MRC GlobalPay</title>
      <meta name="description" content="Official Developer Hub for MRC GlobalPay. Access our crypto swap API, bot manifest, and $0.30 liquidity rails for automated trading and dust cleaning." />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href="https://mrcglobalpay.com/developer" />
      <meta property="og:title" content="Developer Hub — API & Bot Access | MRC GlobalPay" />
      <meta property="og:description" content="Access our crypto swap API, bot manifest, and $0.30 liquidity rails for automated trading and dust recovery." />
      <meta property="og:url" content="https://mrcglobalpay.com/developer" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="MRC GlobalPay" />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(softwareSourceCodeJsonLd)}</script>
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

        {/* Section 0: Programmatic Liquidity & Bot Access */}
        <section className="mb-14">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Terminal className="h-6 w-6 text-primary" />
            Programmatic Liquidity &amp; Bot Access
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Integrate the MRC GlobalPay <strong className="text-foreground">$0.30 settlement engine</strong> into your trading bot or application.
            Access our live rates, supported pairs, and regulatory verification via our machine-readable manifest.
          </p>

          {/* Manifest Link */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <FileJson className="h-5 w-5 text-primary" />
              <h3 className="font-display text-sm font-semibold text-foreground">Bot Manifest (JSON)</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              A static, machine-readable file listing the top 10 dust-swap pairs, minimum thresholds, and live API endpoints.
              No authentication required.
            </p>
            <a
              href="/trading-bot-manifest.json"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ExternalLink className="h-4 w-4" />
              View Bot Manifest (JSON)
            </a>
          </div>

          {/* Code Blocks */}
          <div className="space-y-4">
            <div>
              <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">JavaScript / Fetch</h4>
              <CodeBlock code={FETCH_SNIPPET} lang="javascript" />
            </div>
            <div>
              <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">cURL</h4>
              <CodeBlock code={CURL_SNIPPET} lang="bash" />
            </div>
          </div>
        </section>

        {/* Section 0b: Institutional Compliance */}
        <section className="mb-14">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Institutional Compliance
          </h2>
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-muted-foreground leading-relaxed mb-4">
              All programmatic swaps are settled under{" "}
              <strong className="text-foreground">FINTRAC MSB Registration C100000015</strong>.
              Our API is designed for non-custodial, high-velocity micro-asset recovery.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Registration", value: "C100000015" },
                { label: "Jurisdiction", value: "Canada (FINTRAC)" },
                { label: "Architecture", value: "Non-Custodial" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                  <p className="font-display text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className="font-display text-sm font-bold text-foreground mt-1">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              <a href="/compliance" className="text-primary hover:underline">View full compliance documentation →</a>
            </p>
          </div>
        </section>

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
