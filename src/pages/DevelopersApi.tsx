import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Code2, Download, Globe, Shield, Zap, Clock, ArrowRight, Copy, Check, Search, Rocket, Link2, Webhook, Gauge, AlertTriangle, BookOpen } from "lucide-react";
import { useState, useMemo } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MsbTrustBar from "@/components/MsbTrustBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import WebhookStatusTryIt from "@/components/dev/WebhookStatusTryIt";

/* ── 50+ Solana Token Registry ── */
const SOLANA_TOKENS = [
  { ticker: "sol", name: "Solana", contract: "Native", category: "L1" },
  { ticker: "goat", name: "GOAT", contract: "CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump", category: "AI Agent" },
  { ticker: "aixbt", name: "AIXBT", contract: "HFtJZoXGWMwqnRe5rVKXsHgs1aqz27mVBpmhFpsPump", category: "AI Agent" },
  { ticker: "bad", name: "BAD", contract: "Bm7LoB8QAz7Kob5JXSt2WVLaR9h3K8zTZfNxCpump", category: "AI Agent" },
  { ticker: "nos", name: "Nosana", contract: "nosXBVoaCTtYdLvKY6Csb4AC8JCdQKKAaWYtx2ZMoo7", category: "AI / GPU Compute" },
  { ticker: "render", name: "Render", contract: "rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof", category: "GPU / DePIN" },
  { ticker: "io", name: "io.net", contract: "BZLbGTNCSFfoth2GYDtwr7e4imWzpR5jqcUuGEwr646K", category: "GPU Compute" },
  { ticker: "akt", name: "Akash Network", contract: "AKTtvwMFWoau1K3J1gZH5jiVpPz1YTsAoX3J9eyRnU4v", category: "Cloud Compute" },
  { ticker: "hnt", name: "Helium", contract: "hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux", category: "DePIN / Wireless" },
  { ticker: "mobile", name: "Helium Mobile", contract: "mb1eu7TzEc71KxDpsmsKoucSSuuoGLv1drys1oP2jh6", category: "DePIN / 5G" },
  { ticker: "honey", name: "Hivemapper", contract: "4vMsoUT2BWatFweudnQM1xedRLfJgJ7hsWhsJv1iGF9p", category: "DePIN / Mapping" },
  { ticker: "pyth", name: "Pyth Network", contract: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3", category: "Oracle" },
  { ticker: "jup", name: "Jupiter", contract: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", category: "DEX Aggregator" },
  { ticker: "ondo", name: "Ondo Finance", contract: "FKMKctiJnbZKL16pCmR7ig6bvjcMJffuUMjB97YeDQPm", category: "RWA / Institutional" },
  { ticker: "ena", name: "Ethena", contract: "2DhAMaaVqbgrqNZ3McR2eTinaVdFzCkk5uerLvSQXK5n", category: "Synthetic Dollar" },
  { ticker: "jto", name: "Jito", contract: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL", category: "MEV / Staking" },
  { ticker: "jupsol", name: "jupSOL", contract: "jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v", category: "LST / Staking" },
  { ticker: "inf", name: "Infinity (Sanctum)", contract: "5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm", category: "LST / Staking" },
  { ticker: "bpsol", name: "Backpack SOL", contract: "BPso1asdfY7JKj1LyL6p4GJpvqK2TbJQaP4eZafeUBnv", category: "LST / Ecosystem" },
  { ticker: "ray", name: "Raydium", contract: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", category: "DEX / AMM" },
  { ticker: "orca", name: "Orca", contract: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE", category: "DEX / AMM" },
  { ticker: "mnde", name: "Marinade", contract: "MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey", category: "LST / Staking" },
  { ticker: "msol", name: "Marinade SOL", contract: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", category: "LST / Staking" },
  { ticker: "bonk", name: "Bonk", contract: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", category: "Meme" },
  { ticker: "wif", name: "dogwifhat", contract: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", category: "Meme" },
  { ticker: "popcat", name: "Popcat", contract: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr", category: "Meme" },
  { ticker: "wen", name: "WEN", contract: "WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p91oHMQ", category: "Meme" },
  { ticker: "w", name: "Wormhole", contract: "85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ", category: "Bridge / Infra" },
  { ticker: "tnsr", name: "Tensor", contract: "TNSRxcUxoT9xBG3de7PiJyTDYu7kskLqcpddxnEJAS6", category: "NFT / Marketplace" },
  { ticker: "drift", name: "Drift Protocol", contract: "DriFtupJYLTosbwoN8koMbEYSx54aFAVLddWsbksjwg7d", category: "Perpetuals" },
  { ticker: "kmno", name: "Kamino", contract: "KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS", category: "DeFi / Lending" },
  { ticker: "me", name: "Magic Eden", contract: "MEFNBXixkEbait3xn9x0tauLmAqYhAj8d56WVeizs9o", category: "NFT / Marketplace" },
  { ticker: "usdc", name: "USD Coin (SPL)", contract: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", category: "Stablecoin" },
  { ticker: "usdt", name: "Tether (SPL)", contract: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", category: "Stablecoin" },
  { ticker: "pyusd", name: "PayPal USD (SPL)", contract: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo", category: "Stablecoin" },
  { ticker: "link", name: "Chainlink (Wormhole)", contract: "2wpTofQ8SkACrkZWrZDjRPy2NbyteE2PB5bLjCVSbw1L", category: "Oracle / Cross-chain" },
  { ticker: "eth", name: "Wrapped ETH (Wormhole)", contract: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs", category: "Bridge / Wrapped" },
  { ticker: "btc", name: "Wrapped BTC (Solana)", contract: "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh", category: "Bridge / Wrapped" },
  { ticker: "avax", name: "Wrapped AVAX (Wormhole)", contract: "KgV1GvrHQmRBY8sHQQeUKwTm2r2h8t4C8qt12Cw1HVE", category: "Bridge / Wrapped" },
  { ticker: "matic", name: "Wrapped MATIC (Wormhole)", contract: "Gz7VkD4MacbEB6yC5XD3HcumEiYx2EtDYYrfikGsvopG", category: "Bridge / Wrapped" },
  { ticker: "samo", name: "Samoyed Coin", contract: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU", category: "Meme" },
  { ticker: "gmt", name: "GMT", contract: "7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx", category: "Move-to-Earn" },
  { ticker: "step", name: "Step Finance", contract: "StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT", category: "DeFi / Dashboard" },
  { ticker: "slnd", name: "Solend", contract: "SLNDpmoWTVADgEdndyvWzroNKDt9nJbMaeJjRiGMPVe7", category: "DeFi / Lending" },
  { ticker: "hxro", name: "Hxro", contract: "HxhWkVpk5NS4Ltg5nij2G671CKXFRKPK8vy271Ub4uEK", category: "Derivatives" },
  { ticker: "shdw", name: "Shadow", contract: "SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y", category: "Storage / DePIN" },
  { ticker: "mplx", name: "Metaplex", contract: "METAewgxyPbgwsseH8T16a39CQ5VyVxZi9zXiDPY18m", category: "NFT Infra" },
  { ticker: "dust", name: "DUST Protocol", contract: "DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ", category: "NFT / Utility" },
  { ticker: "fida", name: "Bonfida", contract: "EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp", category: "Domain / Identity" },
  { ticker: "blze", name: "BlazeStake", contract: "BLZEEuZUBVqFhj8adcCFPJvPVCiCyVmh3hkJMrU8KuJA", category: "LST / Staking" },
  { ticker: "ldo", name: "Lido DAO (Wormhole)", contract: "HZRCwxP2Vq9PCpPXooayhJ2bxTpo5xfpQrwB1svh332p", category: "Staking / Governance" },
];

/* ── URL Parameter Documentation ── */
const URL_PARAMS = [
  { param: "from", type: "string", required: false, desc: "Source token ticker (e.g., sol, btc, eth). Case-insensitive." },
  { param: "to", type: "string", required: false, desc: "Destination token ticker (e.g., nos, jup, goat). Auto-corrected for Solana-specific tickers." },
  { param: "amount", type: "number", required: false, desc: "Quantity of source token to swap. Must be ≥ the pair's minimum amount." },
  { param: "address", type: "string", required: false, desc: "Pre-fill recipient wallet address. Sets the field to read-only when provided." },
];

const EXAMPLES = [
  { url: "https://mrcglobalpay.com/?from=SOL&to=NOS&amount=10", desc: "Swap 10 SOL into NOS (Nosana GPU Compute)" },
  { url: "https://mrcglobalpay.com/?from=SOL&to=GOAT&amount=1", desc: "Swap 1 SOL into GOAT (AI Agent)" },
  { url: "https://mrcglobalpay.com/?from=USDC&to=JUP", desc: "Pre-fill USDC → JUP (minimum amount auto-detected)" },
  { url: "https://mrcglobalpay.com/?from=HNT&to=SOL&amount=5", desc: "Convert 5 HNT DePIN rewards into SOL" },
  { url: "https://mrcglobalpay.com/?from=SOL&to=ONDO", desc: "Access Ondo Finance RWA tokens from SOL" },
  { url: "https://mrcglobalpay.com/?from=SOL&to=RENDER&amount=2", desc: "Swap 2 SOL into RENDER (GPU DePIN)" },
];

const TICKER_AUTOCORRECT = [
  { input: "goat", resolved: "goatsol", note: "Solana-native GOAT memecoin" },
  { input: "aixbt", resolved: "aixbtsol", note: "AIXBT on Solana network" },
  { input: "bad", resolved: "badsol", note: "BAD on Solana network" },
  { input: "hnt", resolved: "hntsol", note: "Helium on Solana" },
  { input: "nos", resolved: "nossol", note: "Nosana on Solana" },
  { input: "pyth", resolved: "pyth", note: "Native Solana ticker (no suffix)" },
  { input: "jup", resolved: "jup", note: "Native Solana ticker (no suffix)" },
  { input: "render", resolved: "render", note: "Render Network" },
  { input: "ondo", resolved: "ondo", note: "Ondo Finance" },
];

const TOKEN_LIST_JSON = SOLANA_TOKENS.map((t) => ({
  ticker: t.ticker,
  name: t.name,
  contract: t.contract,
  category: t.category,
  network: "solana",
  deepLink: `https://mrcglobalpay.com/?from=sol&to=${t.ticker}`,
}));

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Solana Swap API Documentation — MRC Global Pay",
  description: "Programmatic non-custodial Solana swap API. $0.30 minimum, registration-free liquidity for NOS, ONDO, and 50+ assets. Optimized for arbitrage and trading bots.",
  url: "https://mrcglobalpay.com/developers",
  dateModified: "2026-04-07",
  isPartOf: { "@type": "WebSite", name: "MRC Global Pay", url: "https://mrcglobalpay.com" },
  publisher: {
    "@type": "Organization",
    name: "MRC Global Pay",
    url: "https://mrcglobalpay.com",
    description: "Registered Canadian MSB (FINTRAC C100000015) providing non-custodial cryptocurrency exchange services with $0.30 minimums.",
    knowsAbout: ["Solana", "Non-Custodial Swaps", "API", "Trading Bots", "Arbitrage", "DePIN", "FINTRAC MSB"],
    sameAs: ["https://mrcglobalpay.com"],
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://mrcglobalpay.com" },
      { "@type": "ListItem", position: 2, name: "Developer Hub", item: "https://mrcglobalpay.com/developer" },
      { "@type": "ListItem", position: 3, name: "API Documentation", item: "https://mrcglobalpay.com/developers" },
    ],
  },
  author: {
    "@type": "Organization",
    name: "MRC Global Pay",
    url: "https://mrcglobalpay.com",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I embed the MRC Global Pay swap widget on my site?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Drop a single iframe pointing to https://mrcglobalpay.com/embed/widget into any page. The widget is responsive (480×640 desktop, full-width mobile), supports lazy loading, and inherits all 50+ tokens, fiat on-ramp, and live rate locks. No API key, no registration, $0.30 minimum swap.",
      },
    },
    {
      "@type": "Question",
      name: "Which URL parameters does the swap widget support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The widget supports seven URL parameters: from (source ticker, default btc), to (destination ticker, default usdt), amount (number ≥ pair minimum), address (recipient wallet — locks the field when set), ref (affiliate referral code), theme (light or dark, default dark; alias mode), and lang (one of en, es, pt, fr, ja, fa, ur, he, af, hi, vi, tr, uk — default en). All parameters are optional and case-insensitive.",
      },
    },
    {
      "@type": "Question",
      name: "Can trading bots create real swaps without an API key?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The Public Lite API at /functions/v1/lite-swap accepts unauthenticated POST requests up to $1,000 USD per swap, 10 swaps/hour per IP and per destination wallet. It returns a non-custodial deposit address and supports webhook callbacks with HMAC-SHA256 signatures.",
      },
    },
    {
      "@type": "Question",
      name: "Is there an OpenAPI spec for the Public Lite API?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — a machine-readable OpenAPI 3.1 spec is published at https://mrcglobalpay.com/openapi.json with an interactive Swagger UI viewer at https://mrcglobalpay.com/openapi.html. Use it to generate typed SDKs in Python, TypeScript, Go, or Rust via openapi-generator.",
      },
    },
    {
      "@type": "Question",
      name: "What are the rate limits for the Public Lite API?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Hard cap of $1,000 USD equivalent per swap. 10 swaps per hour per IP, 10 swaps per hour per destination wallet, and 30 swaps per wallet per 24 hours. Higher limits available via the Partner Portal.",
      },
    },
    {
      "@type": "Question",
      name: "What is the minimum swap amount?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "$0.30 USD equivalent — the lowest in the industry. This enables micro-swaps for dust conversion, arbitrage, and automated trading strategies.",
      },
    },
    {
      "@type": "Question",
      name: "Is MRC Global Pay non-custodial?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Funds never touch MRC wallets. The same liquidity provider that powers the widget settles every Lite API trade, with on-chain settlement in under 60 seconds and a strict Zero Data Retention policy.",
      },
    },
  ],
};

const CodeBlock = ({ code, lang = "text" }: { code: string; lang?: string }) => {
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
        className="absolute right-2 top-2 z-10 rounded border border-border bg-background p-1.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 font-mono text-sm leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const DevelopersApi = () => {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  const filteredTokens = useMemo(() => {
    if (!search.trim()) return SOLANA_TOKENS;
    const q = search.toLowerCase();
    return SOLANA_TOKENS.filter(
      (t) => t.ticker.includes(q) || t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    );
  }, [search]);

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(TOKEN_LIST_JSON, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mrc-solana-token-list.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Helmet>
        <title>Crypto Swap Widget Embed & Trading Bot API — MRC Global Pay</title>
        <meta
          name="description"
          content="Embed a non-custodial crypto swap widget with one iframe, or build a trading bot via the public Lite API (no key, $1,000/swap). Full URL parameter reference: from, to, amount, address, ref, theme, lang. OpenAPI 3.1 spec included."
        />
        <meta name="keywords" content="crypto swap widget, embed swap widget, trading bot api, non-custodial swap api, openapi crypto, swap iframe, public lite api, solana swap api, bitcoin swap api, no api key crypto" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href="https://mrcglobalpay.com/developers" />
        <meta property="og:title" content="Crypto Swap Widget Embed & Trading Bot API — MRC Global Pay" />
        <meta property="og:description" content="One-iframe embed + public Lite API for trading bots. URL params: from, to, amount, address, ref, theme, lang. OpenAPI 3.1, $0.30 min, FINTRAC MSB." />
        <meta property="og:url" content="https://mrcglobalpay.com/developers" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="MRC Global Pay" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Crypto Swap Widget Embed & Trading Bot API — MRC Global Pay" />
        <meta name="twitter:description" content="Embed in one iframe or automate via Lite API. Full widget URL parameter reference + OpenAPI 3.1 spec." />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <SiteHeader />
      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="container mx-auto px-4 pt-6">
          <ol className="flex items-center gap-2 text-xs text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Home</Link></li>
            <li>/</li>
            <li><Link to="/developer" className="hover:text-foreground">Developer Hub</Link></li>
            <li>/</li>
            <li className="text-foreground font-medium">API Documentation</li>
          </ol>
        </nav>

        <div className="container mx-auto px-4 py-10 max-w-5xl">
          {/* Hero */}
          <div className="mb-10">
            <Badge variant="outline" className="mb-3 border-primary/40 text-primary">
              <Code2 className="mr-1 h-3 w-3" /> API Reference · April 2026
            </Badge>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl mb-4">
              Solana Swap API Documentation
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
              Programmatic, non-custodial Solana token swaps via URL parameters. <strong className="text-foreground">No API keys</strong>, <strong className="text-foreground">no registration</strong>, <strong className="text-foreground">$0.30 minimum</strong>. Purpose-built for trading bots, arbitrage engines, and AI agents.
            </p>
          </div>

          {/* Quick Facts */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Quick Facts</h2>
            <ul className="grid gap-2 text-sm text-foreground sm:grid-cols-2 lg:grid-cols-4">
              <li><strong>Minimum:</strong> $0.30</li>
              <li><strong>Auth:</strong> None Required</li>
              <li><strong>Custody:</strong> Non-Custodial</li>
              <li><strong>License:</strong> FINTRAC MSB</li>
              <li><strong>Tokens:</strong> 50+ Solana SPL</li>
              <li><strong>Settlement:</strong> &lt; 60 seconds</li>
              <li><strong>Rate Limits:</strong> None</li>
              <li><strong>Pricing:</strong> 350ms live quotes</li>
            </ul>
          </div>

          {/* ── Table of Contents ── */}
          <nav aria-label="On this page" className="rounded-xl border border-border bg-card/40 p-5 mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> On this page
            </h2>
            <ol className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2 list-decimal list-inside marker:text-muted-foreground">
              <li><a href="#quick-start" className="text-foreground hover:text-primary">Quick Start for Trading Bots</a></li>
              <li><a href="#embed-quickstart" className="text-foreground hover:text-primary">Embed the Widget (Copy &amp; Paste)</a></li>
              <li><a href="#widget-params" className="text-foreground hover:text-primary">Widget URL Parameters (Full Reference)</a></li>
              <li><a href="#url-params" className="text-foreground hover:text-primary">URL Parameter Reference</a></li>
              <li><a href="#autocorrect" className="text-foreground hover:text-primary">Solana Ticker Auto-Correct</a></li>
              <li><a href="#token-registry" className="text-foreground hover:text-primary">Solana Token Registry (50+)</a></li>
              <li><a href="#lite-api" className="text-foreground hover:text-primary">Public Lite API (No Approval)</a></li>
              <li><a href="#best-practices" className="text-foreground hover:text-primary">Best Practices for Bots</a></li>
              <li><a href="#dom-ids" className="text-foreground hover:text-primary">DOM Identifiers for Bots</a></li>
              <li><a href="#faq" className="text-foreground hover:text-primary">Technical FAQ</a></li>
            </ol>
          </nav>

          {/* ── Quick Start for Trading Bots ── */}
          <section id="quick-start" className="mb-16 scroll-mt-24">
            <Badge variant="outline" className="mb-3 border-primary/40 text-primary">
              <Rocket className="mr-1 h-3 w-3" /> Start in &lt; 60 seconds
            </Badge>
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Rocket className="h-6 w-6 text-primary" />
              Quick Start for Trading Bots
            </h2>
            <p className="text-muted-foreground mb-6 max-w-3xl">
              Three battle-tested integration paths, ranked from zero-code to fully programmatic. Pick the one
              that matches your stack — all three share the same non-custodial liquidity rails, $0.30 minimum,
              and FINTRAC MSB compliance.
            </p>

            <div className="grid gap-5 lg:grid-cols-3">
              <Card className="border-primary/30 bg-card/60 flex flex-col">
                <CardContent className="pt-5 flex-1 flex flex-col">
                  <Badge variant="secondary" className="text-[10px] mb-2 self-start">Method 1 · Easiest</Badge>
                  <Link2 className="h-7 w-7 text-primary mb-2" />
                  <h3 className="font-semibold text-foreground mb-1">URL Parameter Pre-fill</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Open a pre-filled swap page from any chat bot, Telegram link, or Discord post.
                    Zero backend, zero auth.
                  </p>
                  <CodeBlock code={`https://mrcglobalpay.com/?from=sol&to=nos&amount=10`} />
                  <div className="mt-auto pt-3">
                    <a href="#url-params" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                      Full reference <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/40 bg-primary/5 flex flex-col relative">
                <Badge className="absolute -top-2 left-4 text-[10px]">Recommended for bots</Badge>
                <CardContent className="pt-5 flex-1 flex flex-col">
                  <Badge variant="secondary" className="text-[10px] mb-2 self-start">Method 2 · Programmatic</Badge>
                  <Code2 className="h-7 w-7 text-primary mb-2" />
                  <h3 className="font-semibold text-foreground mb-1">Lite API — Create Real Swaps</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Public REST endpoint. Create non-custodial swap orders, get a deposit address back, poll
                    or webhook for status. No API key needed up to $1,000/swap.
                  </p>
                  <CodeBlock lang="bash" code={`curl -X POST $BASE -H 'Content-Type: application/json' \\
  -d '{"action":"create","from":"btc","to":"sol",
       "amount":0.001,"address":"<your-wallet>"}'`} />
                  <div className="mt-auto pt-3">
                    <a href="#lite-api" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                      Lite API docs <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/30 bg-card/60 flex flex-col">
                <CardContent className="pt-5 flex-1 flex flex-col">
                  <Badge variant="secondary" className="text-[10px] mb-2 self-start">Method 3 · UI</Badge>
                  <Globe className="h-7 w-7 text-primary mb-2" />
                  <h3 className="font-semibold text-foreground mb-1">Full Widget Embed</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Drop the responsive iframe widget into any dashboard. Inherits all 50+ tokens, fiat
                    on-ramp, and live rate locks. Backlink-attribution friendly.
                  </p>
                  <CodeBlock lang="html" code={`<iframe src="https://mrcglobalpay.com/embed/widget"
  width="100%" height="640" frameborder="0"
  allow="clipboard-write"></iframe>`} />
                  <div className="mt-auto pt-3">
                    <Link to="/embed/widget" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                      Open widget preview <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
              <strong className="text-foreground">Which should I pick?</strong>{" "}
              Use <strong className="text-foreground">Method 1</strong> for share links and chat bots,{" "}
              <strong className="text-foreground">Method 2</strong> for any automated trader, arbitrage script,
              or AI agent that needs deposit addresses programmatically, and{" "}
              <strong className="text-foreground">Method 3</strong> when you want a fully hosted UI inside your
              own dashboard.
            </div>

            {/* ── Dedicated Embed Quick Start Card ── */}
            <Card id="embed-quickstart" className="mt-8 border-primary/40 bg-card/70 scroll-mt-24">
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    <Globe className="mr-1 h-3 w-3" /> Embed Quick Start
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">Copy &amp; paste</Badge>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">
                  Embed the Full Widget
                </h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-3xl">
                  Drop the responsive swap widget into any page in under 30 seconds. Below are the exact URL,
                  iframe markup, and the most-used configuration parameters — every block has a copy button.
                </p>

                <div className="grid gap-5 lg:grid-cols-2">
                  {/* Full URL */}
                  <div>
                    <div className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                      <Link2 className="h-3.5 w-3.5 text-primary" />
                      Full Widget URL
                    </div>
                    <CodeBlock code={`https://mrcglobalpay.com/embed/widget`} />
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Open in any browser to preview before embedding. CORS &amp; X-Frame friendly.
                    </p>
                  </div>

                  {/* Pre-filled URL */}
                  <div>
                    <div className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                      <Rocket className="h-3.5 w-3.5 text-primary" />
                      Pre-filled URL (most common)
                    </div>
                    <CodeBlock code={`https://mrcglobalpay.com/embed/widget?from=btc&to=sol&amount=0.01`} />
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Locks the source/destination tokens and amount on load.
                    </p>
                  </div>
                </div>

                {/* Sample iframe */}
                <div className="mt-6">
                  <div className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    <Code2 className="h-3.5 w-3.5 text-primary" />
                    Sample &lt;iframe&gt; (responsive, recommended defaults)
                  </div>
                  <CodeBlock
                    lang="html"
                    code={`<iframe
  src="https://mrcglobalpay.com/embed/widget?from=btc&to=sol&amount=0.01"
  title="MRC GlobalPay — Instant Crypto Swap"
  width="100%"
  height="640"
  style="border:0;border-radius:16px;max-width:480px;"
  loading="lazy"
  allow="clipboard-write"
  referrerpolicy="no-referrer-when-downgrade">
</iframe>`}
                  />
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Renders at 480×640 on desktop, full-width on mobile. <code>loading="lazy"</code> keeps your
                    page&apos;s LCP score intact.
                  </p>
                </div>

                {/* Most-used config parameters */}
                <div className="mt-7">
                  <div className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <Gauge className="h-3.5 w-3.5 text-primary" />
                    Most-used configuration parameters — click to copy
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      {
                        label: "Pre-fill source token",
                        snippet: "?from=btc",
                        hint: "Any supported ticker (sol, eth, usdt, …)",
                      },
                      {
                        label: "Pre-fill destination token",
                        snippet: "?to=sol",
                        hint: "Auto-corrects Solana-specific tickers",
                      },
                      {
                        label: "Pre-fill amount",
                        snippet: "?amount=0.01",
                        hint: "Must be ≥ pair minimum ($0.30 USD eq.)",
                      },
                      {
                        label: "Lock recipient address",
                        snippet: "?address=YourWalletHere",
                        hint: "Field becomes read-only when set",
                      },
                      {
                        label: "Combine multiple params",
                        snippet: "?from=usdc&to=jup&amount=50",
                        hint: "Standard query-string format",
                      },
                      {
                        label: "Affiliate ref tag",
                        snippet: "?ref=YOUR_CODE",
                        hint: "Earn commissions on every swap",
                      },
                    ].map((p) => (
                      <div
                        key={p.label}
                        className="rounded-lg border border-border bg-muted/30 p-3"
                      >
                        <div className="text-[11px] font-medium text-foreground mb-1.5">{p.label}</div>
                        <CodeBlock code={p.snippet} />
                        <div className="text-[10px] text-muted-foreground mt-1.5">{p.hint}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/embed/widget">
                    <Button size="sm" variant="default" className="gap-1.5">
                      <Globe className="h-3.5 w-3.5" /> Open Live Widget
                    </Button>
                  </Link>
                  <a href="#url-params">
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" /> Full Parameter Reference
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── Widget URL Parameters: Full Reference ── */}
          <section id="widget-params" className="mb-16 scroll-mt-24">
            <Badge variant="outline" className="mb-3 border-primary/40 text-primary">
              <Link2 className="mr-1 h-3 w-3" /> Deep-link reference
            </Badge>
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              Widget URL Parameters — Full Reference
            </h2>
            <p className="text-muted-foreground mb-6 max-w-3xl">
              Every parameter the embeddable widget (<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">/embed/widget</code>)
              and the homepage swap form (<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">/</code>) accept on page load.
              All parameters are <strong className="text-foreground">optional</strong>, <strong className="text-foreground">case-insensitive</strong>,
              and combine via standard query-string syntax.
            </p>

            <CodeBlock
              code={`https://mrcglobalpay.com/embed/widget?from=btc&to=sol&amount=0.01&address=<wallet>&ref=YOUR_CODE&theme=dark&lang=en`}
            />

            <div className="mt-6 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Parameter</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Default</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Valid values</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Description</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    {
                      param: "from",
                      type: "string",
                      def: "btc",
                      values: "Any supported ticker (sol, eth, usdt, usdc, jup, nos, …)",
                      desc: "Source token. Auto-corrected for Solana-specific tickers.",
                    },
                    {
                      param: "to",
                      type: "string",
                      def: "usdt",
                      values: "Any supported ticker (sol, eth, usdt, usdc, jup, nos, …)",
                      desc: "Destination token. Falls back to default if invalid.",
                    },
                    {
                      param: "amount",
                      type: "number",
                      def: "—",
                      values: "Decimal ≥ pair minimum ($0.30 USD eq.)",
                      desc: "Quantity of the source token. Below minimum, the widget shows a hint and adjusts to min.",
                    },
                    {
                      param: "address",
                      type: "string",
                      def: "—",
                      values: "Valid wallet for the destination chain",
                      desc: "Pre-fills the recipient wallet and locks the field as read-only.",
                    },
                    {
                      param: "ref",
                      type: "string",
                      def: "—",
                      values: "Affiliate referral code (alphanumeric)",
                      desc: "Attributes the swap to a registered affiliate for commission accrual.",
                    },
                    {
                      param: "theme",
                      type: "string",
                      def: "dark",
                      values: "dark · light",
                      desc: (
                        <>
                          Visual theme. Alias: <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">mode</code>.
                        </>
                      ),
                    },
                    {
                      param: "lang",
                      type: "string",
                      def: "en (or browser language if supported)",
                      values: "en, es, pt, fr, ja, fa, ur, he, af, hi, vi, tr, uk",
                      desc: "UI language. RTL is auto-applied for fa, ur, he. Invalid values fall back to en.",
                    },
                  ].map((p) => (
                    <tr key={p.param} className="border-b border-border last:border-0 align-top">
                      <td className="px-4 py-3">
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">{p.param}</code>
                      </td>
                      <td className="px-4 py-3 text-xs">{p.type}</td>
                      <td className="px-4 py-3 text-xs">
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">{p.def}</code>
                      </td>
                      <td className="px-4 py-3 text-xs">{p.values}</td>
                      <td className="px-4 py-3 text-xs">{p.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Live recipes */}
            <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">Common recipes</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                {
                  title: "Light theme, Spanish UI",
                  url: "https://mrcglobalpay.com/embed/widget?theme=light&lang=es",
                },
                {
                  title: "Pre-filled BTC → SOL with affiliate ref",
                  url: "https://mrcglobalpay.com/embed/widget?from=btc&to=sol&amount=0.01&ref=YOUR_CODE",
                },
                {
                  title: "USDC → JUP, locked recipient",
                  url: "https://mrcglobalpay.com/embed/widget?from=usdc&to=jup&amount=50&address=<wallet>",
                },
                {
                  title: "Persian (RTL) UI, dark mode",
                  url: "https://mrcglobalpay.com/embed/widget?lang=fa&theme=dark",
                },
              ].map((r) => (
                <div key={r.title} className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-[11px] font-medium text-foreground mb-1.5">{r.title}</div>
                  <CodeBlock code={r.url} />
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
              <strong className="text-foreground">Note:</strong>{" "}
              The same parameters work on the homepage (<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">https://mrcglobalpay.com/?from=…</code>)
              and on language-prefixed routes (e.g. <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">/pt/?from=…</code>).
              Parameters take precedence over browser detection.
            </div>
          </section>

          {/* ── Section 1: Endpoint Documentation ── */}
          <section id="url-params" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              How to Use URL Parameters (Endpoint)
            </h2>
            <p className="text-muted-foreground mb-6">
              Construct a URL to pre-fill the swap widget. The widget reads <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">from</code>, <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">to</code>, <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">amount</code>, and <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">address</code> on page load.
            </p>

            <CodeBlock code={`GET https://mrcglobalpay.com/?from={ticker}&to={ticker}&amount={number}&address={wallet}`} />

            {/* Param table */}
            <div className="mt-6 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Parameter</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Required</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {URL_PARAMS.map((p) => (
                    <tr key={p.param} className="border-b border-border last:border-0">
                      <td className="px-4 py-3"><code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">{p.param}</code></td>
                      <td className="px-4 py-3 text-muted-foreground">{p.type}</td>
                      <td className="px-4 py-3"><Badge variant={p.required ? "default" : "secondary"} className="text-[10px]">{p.required ? "Yes" : "Optional"}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{p.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Examples */}
            <h3 className="mt-8 mb-4 text-lg font-semibold text-foreground">Request Examples</h3>
            <div className="space-y-3">
              {EXAMPLES.map((ex) => (
                <div key={ex.url} className="rounded-lg border border-border bg-card p-4">
                  <code className="text-xs font-mono text-primary break-all">{ex.url}</code>
                  <p className="mt-1 text-xs text-muted-foreground">{ex.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 2: Ticker Auto-Correct ── */}
          <section id="autocorrect" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Solana Ticker Auto-Correct Layer
            </h2>
            <p className="text-muted-foreground mb-6">
              The widget includes an auto-correct layer that maps "clean" token names to platform-specific tickers. You can use either — the system resolves automatically.
            </p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">You Send</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Widget Receives</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {TICKER_AUTOCORRECT.map((t) => (
                    <tr key={t.input} className="border-b border-border last:border-0">
                      <td className="px-4 py-3"><code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">?to={t.input}</code></td>
                      <td className="px-4 py-3"><code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">{t.resolved}</code></td>
                      <td className="px-4 py-3 text-muted-foreground">{t.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Section 3: Solana Token Registry ── */}
          <section id="token-registry" className="mb-16 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Code2 className="h-6 w-6 text-primary" />
                  Solana Token Registry ({SOLANA_TOKENS.length} Assets)
                </h2>
                <p className="text-muted-foreground mt-1">Verified tokens with contract addresses and deep-link URLs.</p>
              </div>
              <Button onClick={handleDownloadJson} className="shrink-0">
                <Download className="mr-2 h-4 w-4" />
                Download Token List (JSON)
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ticker, name, or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Ticker</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Contract Address</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Category</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Deep Link</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTokens.map((t) => (
                    <tr key={t.ticker} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-bold text-primary">{t.ticker.toUpperCase()}</code>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{t.name}</td>
                      <td className="px-4 py-3">
                        <code className="font-mono text-[10px] text-muted-foreground break-all">{t.contract}</code>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-[10px]">{t.category}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`/?from=sol&to=${t.ticker}`}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          Swap <ArrowRight className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredTokens.length === 0 && (
              <p className="mt-4 text-center text-sm text-muted-foreground">No tokens match your search. The widget defaults to USDC (Solana) for unsupported tickers.</p>
            )}
          </section>

          {/* ── Section 3.5: Public Lite API for Small Swaps ── */}
          <section id="lite-api" className="mb-16 scroll-mt-24">
            <Badge variant="outline" className="mb-3 border-primary/40 text-primary">
              <Zap className="mr-1 h-3 w-3" /> New · No Approval Needed
            </Badge>
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Code2 className="h-6 w-6 text-primary" />
              Public Lite API for Small Swaps (No Approval Needed)
            </h2>
            <p className="text-muted-foreground mb-6 max-w-3xl">
              A public, non-custodial REST API designed for honest small-amount trading bots and arbitrage scripts.
              Create real swap orders programmatically — no API key, no registration, no Partner approval.
              Funds <strong className="text-foreground">never touch MRC wallets</strong>; the same liquidity provider that powers the widget settles the trade.
            </p>

            {/* Limits panel */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mb-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Limits & Safety Rules</h3>
              <ul className="grid gap-2 text-sm text-foreground sm:grid-cols-2">
                <li><strong>Max per swap:</strong> $1,000 USD equivalent</li>
                <li><strong>Per IP:</strong> 10 swaps / hour</li>
                <li><strong>Per destination wallet:</strong> 10 swaps / hour</li>
                <li><strong>Velocity check:</strong> 30 swaps / wallet / 24h</li>
                <li><strong>Custody:</strong> Non-custodial (provider passthrough)</li>
                <li><strong>Sanctioned countries:</strong> Blocked at the edge</li>
                <li><strong>Auth:</strong> None required</li>
                <li><strong>Need higher limits?</strong> <a href="mailto:contact@mrcglobalpay.com" className="text-primary hover:underline">Apply for Partner API</a></li>
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Built for small automated trading. For volume above $1,000/swap or commission tracking, use the existing <Link to="/partner-portal" className="text-primary hover:underline">Partner Portal</Link>.
              </p>
            </div>

            {/* OpenAPI / Swagger / Postman / SDK callout */}
            <div className="rounded-xl border border-primary/30 bg-card/60 p-5 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-foreground">Machine-readable contract — OpenAPI 3.1</div>
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
                      Generate typed SDKs (Python, TS, Go, Rust…), import into Postman/Insomnia, or browse
                      interactively. All artifacts auto-generated from <code>/openapi.json</code>.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:shrink-0">
                  <a href="/openapi.json" target="_blank" rel="noopener">
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Download className="h-3.5 w-3.5" /> openapi.json
                    </Button>
                  </a>
                  <a href="/openapi.html" target="_blank" rel="noopener">
                    <Button size="sm" variant="default" className="gap-1.5">
                      <Globe className="h-3.5 w-3.5" /> Swagger UI
                    </Button>
                  </a>
                  <a href="/mrc-lite-api.postman_collection.json" download>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Download className="h-3.5 w-3.5" /> Postman collection
                    </Button>
                  </a>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-[11px]">
                <a href="#sdk-generation" className="text-primary hover:underline">→ Generate a typed SDK</a>
                <a href="#headers-hmac" className="text-primary hover:underline">→ Headers, HMAC &amp; curl examples</a>
              </div>
            </div>

            {/* ── Headers, HMAC, and curl Reference ── */}
            <section id="headers-hmac" className="scroll-mt-24 mb-8">
              <h3 className="mt-8 mb-2 text-lg font-semibold text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Headers, HMAC &amp; curl reference
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
                Every request to the Lite API uses the same minimal header set. No API key, no bearer token —
                rate limits are scoped per-IP and per-destination-wallet. Webhooks add an HMAC-SHA256 signature
                so your receiver can verify authenticity.
              </p>

              <div className="overflow-x-auto rounded-lg border border-border mb-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Header</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Used on</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Required</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    {[
                      { h: "Content-Type: application/json", on: "POST (estimate, create)", req: "Yes", d: "Body must be JSON." },
                      { h: "Accept: application/json", on: "All requests", req: "Recommended", d: "Forces JSON response shape." },
                      { h: "User-Agent: <bot/version>", on: "All requests", req: "Recommended", d: "Helps us debug rate-limit issues for your bot." },
                      { h: "Authorization", on: "—", req: "No", d: "Public API: no auth header. Reject any docs telling you otherwise." },
                      { h: "X-MRC-Signature: sha256=<hex>", on: "Outgoing webhooks (we send this)", req: "—", d: "HMAC-SHA256 of raw body, hex-encoded, using your webhook_secret." },
                      { h: "X-MRC-Idempotency-Key", on: "Outgoing webhooks (we send this)", req: "—", d: "Format: <order_id>:<event>:<state>. Dedupe replays by this key." },
                      { h: "X-MRC-Event", on: "Outgoing webhooks (we send this)", req: "—", d: "e.g. swap.deposit_detected, swap.confirming, swap.finished, swap.failed." },
                    ].map((r) => (
                      <tr key={r.h} className="border-b border-border last:border-0 align-top">
                        <td className="px-4 py-3"><code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-primary">{r.h}</code></td>
                        <td className="px-4 py-3 text-xs">{r.on}</td>
                        <td className="px-4 py-3 text-xs">{r.req}</td>
                        <td className="px-4 py-3 text-xs">{r.d}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h4 className="text-sm font-semibold text-foreground mb-2">curl — GET <code>action=rates</code> (live quote)</h4>
              <CodeBlock
                lang="bash"
                code={`BASE="https://tjikwxkmsfmyjkssvyoh.supabase.co/functions/v1/lite-swap"

curl -sS "$BASE?action=rates&from=btc&to=usdterc20&amount=0.01" \\
  -H "Accept: application/json" \\
  -H "User-Agent: my-bot/1.0"`}
              />

              <h4 className="text-sm font-semibold text-foreground mt-5 mb-2">curl — GET <code>action=status</code></h4>
              <CodeBlock
                lang="bash"
                code={`curl -sS "$BASE?action=status&id=MRC-1A2B3C4D-XY9Z" \\
  -H "Accept: application/json"`}
              />

              <h4 className="text-sm font-semibold text-foreground mt-5 mb-2">curl — POST <code>action=estimate</code></h4>
              <CodeBlock
                lang="bash"
                code={`curl -sS -X POST "$BASE" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{
    "action": "estimate",
    "from": "btc",
    "to": "usdterc20",
    "amount": 0.001
  }'`}
              />

              <h4 className="text-sm font-semibold text-foreground mt-5 mb-2">curl — POST <code>action=create</code> (with webhook)</h4>
              <CodeBlock
                lang="bash"
                code={`curl -sS -X POST "$BASE" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{
    "action": "create",
    "from": "btc",
    "to": "usdterc20",
    "amount": 0.001,
    "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "refundAddress": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "webhook_url": "https://example.com/mrc-webhook",
    "webhook_secret": "s3cret_at_least_32_chars_long_xxxx"
  }'`}
              />

              {/* HMAC verification */}
              <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Webhook className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">Verifying webhook signatures (HMAC-SHA256)</h4>
                </div>
                <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-1 mb-4">
                  <li>Read the raw request body (do <strong>not</strong> reparse — use the byte stream).</li>
                  <li>Compute <code className="rounded bg-muted px-1 font-mono text-[11px]">HMAC_SHA256(webhook_secret, raw_body)</code> as lowercase hex.</li>
                  <li>Compare with <code className="rounded bg-muted px-1 font-mono text-[11px]">X-MRC-Signature</code> header (strip the <code>sha256=</code> prefix). Use a constant-time compare.</li>
                  <li>Dedupe by <code className="rounded bg-muted px-1 font-mono text-[11px]">X-MRC-Idempotency-Key</code> — we may retry up to 8× over 24h with exponential backoff.</li>
                </ol>

                <p className="text-xs font-medium text-foreground mb-2">Node.js (Express)</p>
                <CodeBlock
                  lang="javascript"
                  code={`import crypto from "node:crypto";
import express from "express";
const app = express();
const SECRET = process.env.MRC_WEBHOOK_SECRET;

app.post("/mrc-webhook", express.raw({ type: "application/json" }), (req, res) => {
  const sig = (req.header("X-MRC-Signature") || "").replace(/^sha256=/, "");
  const expected = crypto.createHmac("sha256", SECRET).update(req.body).digest("hex");
  const ok = sig.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  if (!ok) return res.status(401).send("bad signature");

  const event = JSON.parse(req.body.toString("utf8"));
  // dedupe via req.header("X-MRC-Idempotency-Key")
  res.status(200).send("ok");
});`}
                />

                <p className="text-xs font-medium text-foreground mt-4 mb-2">Python (Flask)</p>
                <CodeBlock
                  lang="python"
                  code={`import hmac, hashlib, os
from flask import Flask, request, abort
app = Flask(__name__)
SECRET = os.environ["MRC_WEBHOOK_SECRET"].encode()

@app.post("/mrc-webhook")
def webhook():
    raw = request.get_data()
    sig = request.headers.get("X-MRC-Signature", "").removeprefix("sha256=")
    expected = hmac.new(SECRET, raw, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(sig, expected):
        abort(401)
    # dedupe via request.headers["X-MRC-Idempotency-Key"]
    return ("ok", 200)`}
                />
              </div>
            </section>

            {/* ── Generate a typed SDK from OpenAPI ── */}
            <section id="sdk-generation" className="scroll-mt-24 mb-8">
              <h3 className="mt-8 mb-2 text-lg font-semibold text-foreground flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                Generate a typed SDK from the OpenAPI spec
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
                The <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">/openapi.json</code> contract is consumable by{" "}
                <a href="https://openapi-generator.tech/" target="_blank" rel="noopener" className="text-primary hover:underline">openapi-generator</a>.
                Two minutes to a fully typed client.
              </p>

              <ol className="list-decimal list-inside text-sm text-foreground space-y-1.5 mb-5 marker:text-primary marker:font-semibold">
                <li>Install the generator (Java 11+ required), or use the Docker image — no local Java needed.</li>
                <li>Point it at the published spec URL.</li>
                <li>Pick a generator (<code>typescript-fetch</code>, <code>python</code>, <code>go</code>, <code>rust</code>, <code>kotlin</code>, …).</li>
                <li>Import the generated client and call typed methods.</li>
              </ol>

              <h4 className="text-sm font-semibold text-foreground mb-2">JavaScript / TypeScript (typescript-fetch)</h4>
              <CodeBlock
                lang="bash"
                code={`# Generate
npx @openapitools/openapi-generator-cli generate \\
  -i https://mrcglobalpay.com/openapi.json \\
  -g typescript-fetch \\
  -o ./mrc-sdk

cd ./mrc-sdk && npm install`}
              />
              <p className="text-xs text-muted-foreground mt-2 mb-2">Use it in your bot:</p>
              <CodeBlock
                lang="typescript"
                code={`import { Configuration, DefaultApi } from "./mrc-sdk";

const api = new DefaultApi(new Configuration({
  basePath: "https://tjikwxkmsfmyjkssvyoh.supabase.co/functions/v1",
}));

// Estimate
const quote = await api.liteSwapPost({
  body: { action: "estimate", from: "btc", to: "usdterc20", amount: 0.001 },
});
console.log("estimated_amount:", quote.estimated_amount);

// Create
const order = await api.liteSwapPost({
  body: {
    action: "create",
    from: "btc", to: "usdterc20", amount: 0.001,
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  },
});
console.log("deposit to:", order.deposit_address);`}
              />

              <h4 className="text-sm font-semibold text-foreground mt-6 mb-2">Python (python generator)</h4>
              <CodeBlock
                lang="bash"
                code={`# Docker — no local Java needed
docker run --rm -v "\${PWD}:/local" openapitools/openapi-generator-cli generate \\
  -i https://mrcglobalpay.com/openapi.json \\
  -g python \\
  -o /local/mrc_sdk \\
  --additional-properties=packageName=mrc_sdk,projectName=mrc-sdk

cd mrc_sdk && pip install -e .`}
              />
              <p className="text-xs text-muted-foreground mt-2 mb-2">Use it in your bot:</p>
              <CodeBlock
                lang="python"
                code={`from mrc_sdk import ApiClient, Configuration, DefaultApi

cfg = Configuration(host="https://tjikwxkmsfmyjkssvyoh.supabase.co/functions/v1")
api = DefaultApi(ApiClient(cfg))

# Estimate
quote = api.lite_swap_post(body={
    "action": "estimate", "from": "btc", "to": "usdterc20", "amount": 0.001
})
print("estimated_amount:", quote["estimated_amount"])

# Create
order = api.lite_swap_post(body={
    "action": "create", "from": "btc", "to": "usdterc20", "amount": 0.001,
    "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
})
print("deposit to:", order["deposit_address"])`}
              />

              <div className="mt-5 rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
                <strong className="text-foreground">Postman / Insomnia:</strong>{" "}
                Import <a href="/mrc-lite-api.postman_collection.json" download className="text-primary hover:underline">mrc-lite-api.postman_collection.json</a>{" "}
                directly, or in Postman use <em>File → Import → Link</em> and paste{" "}
                <code className="rounded bg-muted px-1 font-mono text-[11px]">https://mrcglobalpay.com/openapi.json</code>.
              </div>
            </section>

            {/* Base URL */}
            <h3 className="mt-8 mb-2 text-lg font-semibold text-foreground">Base URL</h3>
            <CodeBlock code={`${import.meta.env.VITE_SUPABASE_URL || 'https://tjikwxkmsfmyjkssvyoh.supabase.co'}/functions/v1/lite-swap`} />

            {/* Endpoints overview */}
            <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">Endpoints</h3>
            <div className="overflow-x-auto rounded-lg border border-border mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Method</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Action</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3"><Badge className="text-[10px]">GET</Badge></td>
                    <td className="px-4 py-3"><code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">?action=rates&from=btc&to=sol&amount=1</code></td>
                    <td className="px-4 py-3 text-muted-foreground">Live rate quote for a pair (no rate-limit)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3"><Badge variant="secondary" className="text-[10px]">POST</Badge></td>
                    <td className="px-4 py-3"><code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">{`{ action: "estimate", from, to, amount }`}</code></td>
                    <td className="px-4 py-3 text-muted-foreground">Estimate output + USD value, validates $1k cap</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3"><Badge variant="secondary" className="text-[10px]">POST</Badge></td>
                    <td className="px-4 py-3"><code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">{`{ action: "create", from, to, amount, address, webhook_url?, webhook_secret? }`}</code></td>
                    <td className="px-4 py-3 text-muted-foreground">Create a real swap. Returns deposit address + order ID. Add <code className="font-mono text-xs">webhook_url</code> + <code className="font-mono text-xs">webhook_secret</code> to receive status callbacks.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3"><Badge className="text-[10px]">GET</Badge></td>
                    <td className="px-4 py-3"><code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">?action=status&id=MRC-XXXX</code></td>
                    <td className="px-4 py-3 text-muted-foreground">Poll order status (waiting, confirming, sending, finished)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Sample response */}
            <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">Successful <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-primary">create</code> Response</h3>
            <CodeBlock lang="json" code={`{
  "status": "success",
  "order_id": "MRC-A1B2C3D4XK9P",
  "provider_order_id": "a1b2c3d4e5f6g7h8",
  "deposit_address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "deposit_extra_id": null,
  "payout_address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  "from": "btc",
  "to": "sol",
  "from_amount": 0.001,
  "estimated_to_amount": 0.421,
  "estimated_usd": 65.40,
  "expires_at": "2026-04-23T20:30:00.000Z",
  "status_url": "https://.../functions/v1/lite-swap?action=status&id=MRC-A1B2C3D4XK9P",
  "custody": "non-custodial"
}`} />

            {/* Python example */}
            <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">Example: Python</h3>
            <CodeBlock lang="python" code={`import requests

BASE = "${import.meta.env.VITE_SUPABASE_URL || 'https://tjikwxkmsfmyjkssvyoh.supabase.co'}/functions/v1/lite-swap"

# 1. Estimate the trade (validates $1,000 cap)
est = requests.post(BASE, json={
    "action": "estimate",
    "from": "btc",
    "to": "sol",
    "amount": 0.001,
}).json()
print("Estimated:", est["estimated_amount"], "SOL  (~$%.2f)" % est["estimated_usd"])

# 2. Create the swap order (non-custodial)
order = requests.post(BASE, json={
    "action": "create",
    "from": "btc",
    "to": "sol",
    "amount": 0.001,
    "address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
}).json()

if order["status"] != "success":
    raise SystemExit(order["error"])

print("Send", order["from_amount"], order["from"].upper(),
      "to", order["deposit_address"])
print("Order ID:", order["order_id"])

# 3. Poll status
import time
while True:
    s = requests.get(BASE, params={"action": "status", "id": order["order_id"]}).json()
    print("State:", s["state"])
    if s["state"] in ("finished", "failed", "refunded", "expired"):
        break
    time.sleep(15)`} />

            {/* JS example */}
            <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">Example: JavaScript / Node.js</h3>
            <CodeBlock lang="javascript" code={`const BASE = "${import.meta.env.VITE_SUPABASE_URL || 'https://tjikwxkmsfmyjkssvyoh.supabase.co'}/functions/v1/lite-swap";

async function call(body) {
  const r = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

// 1. Estimate
const est = await call({
  action: "estimate",
  from: "usdterc20",
  to: "sol",
  amount: 50,
});
console.log("You'll receive ~", est.estimated_amount, "SOL");

// 2. Create the non-custodial order
const order = await call({
  action: "create",
  from: "usdterc20",
  to: "sol",
  amount: 50,
  address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
});

if (order.status !== "success") throw new Error(order.error);

console.log(\`Send \${order.from_amount} USDT (ERC-20) to \${order.deposit_address}\`);
console.log("Order:", order.order_id);

// 3. Poll status
const s = await fetch(\`\${BASE}?action=status&id=\${order.order_id}\`).then(r => r.json());
console.log("State:", s.state);`} />

            {/* Error codes */}
            <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">Error Codes</h3>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">HTTP</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">When</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border"><td className="px-4 py-3"><code className="font-mono text-xs">400</code></td><td className="px-4 py-3 text-muted-foreground">Invalid ticker, address, or amount</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-3"><code className="font-mono text-xs">403</code></td><td className="px-4 py-3 text-muted-foreground">Destination wallet on internal blacklist</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-3"><code className="font-mono text-xs">413</code></td><td className="px-4 py-3 text-muted-foreground">Estimated USD value exceeds $1,000 cap</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-3"><code className="font-mono text-xs">429</code></td><td className="px-4 py-3 text-muted-foreground">Hit IP / wallet / velocity rate limit (response includes <code className="font-mono text-xs">retry_after_seconds</code>)</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-3"><code className="font-mono text-xs">451</code></td><td className="px-4 py-3 text-muted-foreground">Request from a sanctioned jurisdiction</td></tr>
                  <tr><td className="px-4 py-3"><code className="font-mono text-xs">502</code></td><td className="px-4 py-3 text-muted-foreground">Upstream liquidity provider unavailable — retry</td></tr>
                </tbody>
              </table>
            </div>

            {/* ── Webhooks ── */}
            <h3 className="text-xl font-semibold text-foreground mt-10 mb-3">
              Optional: Webhook Callbacks
            </h3>
            <p className="text-muted-foreground mb-4">
              Pass <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">webhook_url</code> and{" "}
              <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">webhook_secret</code> when you call{" "}
              <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">action: "create"</code> and we'll POST status updates to your URL each time the order changes state. The first event (<code className="font-mono text-xs">swap.created</code>) is fired synchronously; subsequent events fire on each <code className="font-mono text-xs">action: "status"</code> poll, so they only require you to keep polling — no inbound port from us is needed beyond your HTTPS endpoint.
            </p>

            <div className="overflow-x-auto rounded-lg border border-border mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Event</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Fires when</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border"><td className="px-4 py-3"><code className="font-mono text-xs">swap.created</code></td><td className="px-4 py-3 text-muted-foreground">Order created, deposit address issued</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-3"><code className="font-mono text-xs">swap.deposit_detected</code></td><td className="px-4 py-3 text-muted-foreground">User's deposit detected on-chain (confirming)</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-3"><code className="font-mono text-xs">swap.processing</code></td><td className="px-4 py-3 text-muted-foreground">Exchanging or sending payout</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-3"><code className="font-mono text-xs">swap.finished</code></td><td className="px-4 py-3 text-muted-foreground">Payout sent — payload includes <code className="font-mono text-xs">payout_hash</code></td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-3"><code className="font-mono text-xs">swap.expired</code></td><td className="px-4 py-3 text-muted-foreground">No deposit received in time</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-3"><code className="font-mono text-xs">swap.failed</code></td><td className="px-4 py-3 text-muted-foreground">Liquidity provider could not complete</td></tr>
                  <tr><td className="px-4 py-3"><code className="font-mono text-xs">swap.refunded</code></td><td className="px-4 py-3 text-muted-foreground">Funds returned to refund address</td></tr>
                </tbody>
              </table>
            </div>

            <p className="text-muted-foreground mb-3">
              Each delivery is a <code className="font-mono text-xs">POST</code> with these headers:
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono mb-4">
{`Content-Type:           application/json
X-MRC-Event:            swap.deposit_detected
X-MRC-Signature:        <hex HMAC-SHA256 of raw body, key = your webhook_secret>
X-MRC-Idempotency-Key:  MRC-1A2B3C4D-XY9Z:swap.deposit_detected:confirming
User-Agent:             MRC-LiteAPI-Webhook/1.0`}
            </pre>

            <p className="text-muted-foreground mb-3">Sample payload:</p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono mb-4">
{`{
  "event": "swap.deposit_detected",
  "idempotency_key": "MRC-1A2B3C4D-XY9Z:swap.deposit_detected:confirming",
  "timestamp": "2026-04-23T15:42:11.118Z",
  "data": {
    "order_id": "MRC-1A2B3C4D-XY9Z",
    "provider_order_id": "abc123def456",
    "state": "confirming",
    "from": "btc",
    "to": "usdterc20",
    "amount_in": "0.005",
    "amount_out": "319.42",
    "deposit_address": "bc1q...",
    "payout_address": "0x742d...",
    "payout_hash": null,
    "updated_at": "2026-04-23T15:42:09Z"
  }
}`}
            </pre>

            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 mb-6 text-sm">
              <p className="text-foreground">
                <strong>Live delivery health:</strong>{" "}
                <a href="/webhook-status" className="text-primary hover:underline font-medium">
                  /webhook-status
                </a>{" "}
                — public anonymized counts of <code className="font-mono text-xs">swap.created</code>,{" "}
                <code className="font-mono text-xs">swap.deposit_detected</code>,{" "}
                <code className="font-mono text-xs">swap.finished</code>, and{" "}
                <code className="font-mono text-xs">swap.expired</code> over the last 24h, plus a copy-paste
                receiver dashboard for your own endpoint.
              </p>
            </div>

            <h4 className="text-base font-semibold text-foreground mt-6 mb-2">
              Public JSON feed: <code className="font-mono text-sm">/webhook-status.json</code>
            </h4>
            <p className="text-muted-foreground mb-3">
              The same aggregates are available as a CORS-enabled JSON feed for embedding in your own dashboards or
              monitoring tools. No auth required, cached for 60 seconds at the edge. Also available at{" "}
              <code className="font-mono text-xs">/api/v1/webhook-status</code>.
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono mb-4">
{`curl https://mrcglobalpay.com/webhook-status.json`}
            </pre>
            <p className="text-sm text-muted-foreground mb-2">Example response:</p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono mb-4">
{`{
  "status": "success",
  "generated_at": "2026-04-23T16:30:00.000Z",
  "window": {
    "hours_24": "2026-04-22T16:30:00.000Z",
    "days_7":   "2026-04-16T16:30:00.000Z"
  },
  "last_successful_delivery_at": "2026-04-23T16:29:48.114Z",
  "counts_24h": {
    "swap.created":          1284,
    "swap.deposit_detected": 1102,
    "swap.finished":          987,
    "swap.expired":            41,
    "total_with_webhook":    1284,
    "success_rate_percent":  99.6
  },
  "counts_7d": {
    "swap.created":          8421,
    "swap.deposit_detected": 7330,
    "swap.finished":         6918,
    "swap.expired":           284
  },
  "provider": "MRC Global Pay Lite API",
  "documentation": "https://mrcglobalpay.com/developers#lite-api"
}`}
            </pre>
            <p className="text-sm text-muted-foreground mb-2">Field reference:</p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-xs border border-border rounded-lg">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="px-3 py-2 font-semibold text-foreground">Field</th>
                    <th className="px-3 py-2 font-semibold text-foreground">Type</th>
                    <th className="px-3 py-2 font-semibold text-foreground">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-3 py-2 font-mono">status</td>
                    <td className="px-3 py-2 text-muted-foreground">string</td>
                    <td className="px-3 py-2 text-muted-foreground">Always <code className="font-mono">"success"</code> on a healthy response.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono">generated_at</td>
                    <td className="px-3 py-2 text-muted-foreground">ISO 8601</td>
                    <td className="px-3 py-2 text-muted-foreground">UTC timestamp the snapshot was computed.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono">window.hours_24</td>
                    <td className="px-3 py-2 text-muted-foreground">ISO 8601</td>
                    <td className="px-3 py-2 text-muted-foreground">Lower bound of the 24-hour aggregation window.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono">window.days_7</td>
                    <td className="px-3 py-2 text-muted-foreground">ISO 8601</td>
                    <td className="px-3 py-2 text-muted-foreground">Lower bound of the 7-day aggregation window.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono">last_successful_delivery_at</td>
                    <td className="px-3 py-2 text-muted-foreground">ISO 8601 | null</td>
                    <td className="px-3 py-2 text-muted-foreground">Most recent webhook delivery the platform recorded. <code className="font-mono">null</code> if none observed.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono">counts_24h["swap.created"]</td>
                    <td className="px-3 py-2 text-muted-foreground">integer</td>
                    <td className="px-3 py-2 text-muted-foreground">Count of <code className="font-mono">swap.created</code> events in the last 24h.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono">counts_24h["swap.deposit_detected"]</td>
                    <td className="px-3 py-2 text-muted-foreground">integer</td>
                    <td className="px-3 py-2 text-muted-foreground">Count of deposit-detected (confirming) events in the last 24h.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono">counts_24h["swap.finished"]</td>
                    <td className="px-3 py-2 text-muted-foreground">integer</td>
                    <td className="px-3 py-2 text-muted-foreground">Count of completed swaps in the last 24h.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono">counts_24h["swap.expired"]</td>
                    <td className="px-3 py-2 text-muted-foreground">integer</td>
                    <td className="px-3 py-2 text-muted-foreground">Count of expired or failed swaps in the last 24h.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono">counts_24h.total_with_webhook</td>
                    <td className="px-3 py-2 text-muted-foreground">integer</td>
                    <td className="px-3 py-2 text-muted-foreground">Swaps in the window that had a <code className="font-mono">webhook_url</code> registered (denominator for success rate).</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono">counts_24h.success_rate_percent</td>
                    <td className="px-3 py-2 text-muted-foreground">number | null</td>
                    <td className="px-3 py-2 text-muted-foreground">Percentage of webhook-enabled swaps that reached a tracked terminal state. <code className="font-mono">null</code> when no swaps had webhooks.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono">counts_7d.*</td>
                    <td className="px-3 py-2 text-muted-foreground">integer</td>
                    <td className="px-3 py-2 text-muted-foreground">Same per-event counts over the last 7 days.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono">provider</td>
                    <td className="px-3 py-2 text-muted-foreground">string</td>
                    <td className="px-3 py-2 text-muted-foreground">Static identifier for the feed source.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono">documentation</td>
                    <td className="px-3 py-2 text-muted-foreground">URL</td>
                    <td className="px-3 py-2 text-muted-foreground">Canonical link back to these developer docs.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Embed example (vanilla JS):</p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono mb-6">
{`const r = await fetch("https://mrcglobalpay.com/webhook-status.json");
const s = await r.json();
document.getElementById("mrc-rate").textContent =
  s.counts_24h.success_rate_percent + "%";
document.getElementById("mrc-last").textContent =
  new Date(s.last_successful_delivery_at).toLocaleString();`}
            </pre>

            <p className="text-sm text-muted-foreground mb-2">TypeScript interfaces:</p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono mb-4">
{`// webhook-status.ts
export type WebhookEvent =
  | "swap.created"
  | "swap.deposit_detected"
  | "swap.finished"
  | "swap.expired";

export type WebhookEventCounts = Record<WebhookEvent, number>;

export interface WebhookStatusCounts24h extends WebhookEventCounts {
  total_with_webhook: number;
  /** Percentage 0–100, or null when no webhook-enabled swaps in window. */
  success_rate_percent: number | null;
}

export interface WebhookStatusWindow {
  /** ISO 8601 lower bound of the 24-hour window. */
  hours_24: string;
  /** ISO 8601 lower bound of the 7-day window. */
  days_7: string;
}

export interface WebhookStatusResponse {
  status: "success";
  /** ISO 8601 UTC timestamp the snapshot was computed. */
  generated_at: string;
  window: WebhookStatusWindow;
  /** Most recent successful delivery, or null if none observed. */
  last_successful_delivery_at: string | null;
  counts_24h: WebhookStatusCounts24h;
  counts_7d: WebhookEventCounts;
  provider: "MRC Global Pay Lite API";
  documentation: string;
}

export interface WebhookStatusError {
  status: "error";
  error: string;
}`}
            </pre>

            <WebhookStatusTryIt />

            <p className="text-sm text-muted-foreground mb-2">
              Zod schema (runtime validation):
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono mb-4">
{`// webhook-status.schema.ts
import { z } from "zod";

export const WebhookEventSchema = z.enum([
  "swap.created",
  "swap.deposit_detected",
  "swap.finished",
  "swap.expired",
]);

const eventCountsShape = {
  "swap.created":          z.number().int().nonnegative(),
  "swap.deposit_detected": z.number().int().nonnegative(),
  "swap.finished":         z.number().int().nonnegative(),
  "swap.expired":          z.number().int().nonnegative(),
};

export const WebhookEventCountsSchema = z.object(eventCountsShape);

export const WebhookStatusCounts24hSchema = z.object({
  ...eventCountsShape,
  total_with_webhook: z.number().int().nonnegative(),
  success_rate_percent: z.number().min(0).max(100).nullable(),
});

export const WebhookStatusWindowSchema = z.object({
  hours_24: z.string().datetime(),
  days_7:   z.string().datetime(),
});

export const WebhookStatusResponseSchema = z.object({
  status: z.literal("success"),
  generated_at: z.string().datetime(),
  window: WebhookStatusWindowSchema,
  last_successful_delivery_at: z.string().datetime().nullable(),
  counts_24h: WebhookStatusCounts24hSchema,
  counts_7d:  WebhookEventCountsSchema,
  provider: z.literal("MRC Global Pay Lite API"),
  documentation: z.string().url(),
});

export const WebhookStatusErrorSchema = z.object({
  status: z.literal("error"),
  error: z.string(),
});

export const WebhookStatusEnvelopeSchema = z.discriminatedUnion("status", [
  WebhookStatusResponseSchema,
  WebhookStatusErrorSchema,
]);

// Inferred types — keep in sync with interfaces above.
export type WebhookStatusResponse = z.infer<typeof WebhookStatusResponseSchema>;
export type WebhookStatusError    = z.infer<typeof WebhookStatusErrorSchema>;`}
            </pre>

            <p className="text-sm text-muted-foreground mb-2">
              Typed fetch helper with Zod parsing &amp; detailed errors:
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono mb-6">
{`import { ZodError } from "zod";
import {
  WebhookStatusEnvelopeSchema,
  type WebhookStatusResponse,
} from "./webhook-status.schema";

const FEED_URL = "https://mrcglobalpay.com/webhook-status.json";

/** Thrown when the feed returns a non-2xx HTTP status. */
export class WebhookStatusHttpError extends Error {
  constructor(public readonly status: number, body: string) {
    super(\`webhook-status: HTTP \${status} — \${body.slice(0, 200)}\`);
    this.name = "WebhookStatusHttpError";
  }
}

/** Thrown when the JSON shape does not match the schema. */
export class WebhookStatusShapeError extends Error {
  constructor(public readonly issues: ZodError["issues"], raw: unknown) {
    const summary = issues
      .map((i) => \`\${i.path.join(".") || "<root>"}: \${i.message}\`)
      .join("; ");
    super(\`webhook-status: invalid payload — \${summary}\`);
    this.name = "WebhookStatusShapeError";
    // Attach raw payload for debugging without spamming the message.
    (this as unknown as { raw: unknown }).raw = raw;
  }
}

/** Thrown when the feed returns { status: "error", error }. */
export class WebhookStatusFeedError extends Error {
  constructor(public readonly upstream: string) {
    super(\`webhook-status: \${upstream}\`);
    this.name = "WebhookStatusFeedError";
  }
}

export async function fetchWebhookStatus(
  signal?: AbortSignal,
): Promise<WebhookStatusResponse> {
  const res = await fetch(FEED_URL, {
    signal,
    headers: { Accept: "application/json" },
  });
  const text = await res.text();
  if (!res.ok) throw new WebhookStatusHttpError(res.status, text);

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new WebhookStatusShapeError(
      [{ path: [], message: "response was not valid JSON", code: "custom" } as never],
      text,
    );
  }

  const parsed = WebhookStatusEnvelopeSchema.safeParse(json);
  if (!parsed.success) {
    throw new WebhookStatusShapeError(parsed.error.issues, json);
  }
  if (parsed.data.status === "error") {
    throw new WebhookStatusFeedError(parsed.data.error);
  }
  return parsed.data;
}

// Usage:
try {
  const status = await fetchWebhookStatus();
  console.log(
    \`Last 24h: \${status.counts_24h["swap.finished"]} finished, \` +
    \`\${status.counts_24h.success_rate_percent ?? "n/a"}% success\`,
  );
} catch (err) {
  if (err instanceof WebhookStatusShapeError) {
    console.error("Schema mismatch:", err.issues);
  } else if (err instanceof WebhookStatusHttpError) {
    console.error("Upstream HTTP", err.status);
  } else {
    throw err;
  }
}`}
            </pre>

            <h4 className="text-base font-semibold text-foreground mt-6 mb-2">Idempotency &amp; de-duplication</h4>
            <p className="text-muted-foreground mb-3">
              Every delivery carries a stable <code className="font-mono text-xs">idempotency_key</code> formatted as{" "}
              <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{`<order_id>:<event>:<state>`}</code>{" "}
              (also exposed as the <code className="font-mono text-xs">X-MRC-Idempotency-Key</code> header). The same key will be sent for any retry of the same state transition, so your handler MUST treat the key as unique and ignore duplicates. Recommended pattern: store the key in a small table (or Redis SET with a 7-day TTL) and short-circuit early if it already exists.
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono mb-4">
{`// Node.js — Postgres-backed de-dup
const key = req.header("X-MRC-Idempotency-Key");
const { rowCount } = await pg.query(
  "INSERT INTO mrc_webhook_seen(idempotency_key) VALUES ($1) ON CONFLICT DO NOTHING",
  [key],
);
if (rowCount === 0) return res.status(200).send("duplicate-ignored");

// schema:
// CREATE TABLE mrc_webhook_seen (
//   idempotency_key text PRIMARY KEY,
//   received_at timestamptz NOT NULL DEFAULT now()
// );`}
            </pre>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono mb-4">
{`# Python — Redis-backed de-dup (7-day TTL)
key = request.headers["X-MRC-Idempotency-Key"]
if not redis.set(f"mrc:wh:{key}", "1", nx=True, ex=7 * 24 * 3600):
    return {"ok": True, "duplicate": True}`}
            </pre>

            <h4 className="text-base font-semibold text-foreground mt-6 mb-2">Computing &amp; verifying <code className="font-mono text-sm">X-MRC-Signature</code></h4>
            <p className="text-muted-foreground mb-3">
              Every webhook is signed with <strong className="text-foreground">HMAC-SHA256</strong> using your{" "}
              <code className="font-mono text-xs">webhook_secret</code> as the key and the{" "}
              <strong className="text-foreground">exact raw request body bytes</strong> as the message. The result is hex-encoded (lowercase) and sent in the <code className="font-mono text-xs">X-MRC-Signature</code> header. Pseudocode:
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono mb-4">
{`signature = HMAC_SHA256(
  key     = webhook_secret,        // the string you sent at create-time
  message = raw_request_body_bytes // BEFORE any JSON parsing or re-serialization
).hex()                            // lowercase hex, 64 chars`}
            </pre>
            <ol className="list-decimal pl-5 text-muted-foreground space-y-1.5 mb-4 text-sm">
              <li>Read the request body as <strong className="text-foreground">raw bytes</strong>. Do not <code className="font-mono text-xs">JSON.parse</code> and re-stringify — even one whitespace difference will break the signature.</li>
              <li>Compute <code className="font-mono text-xs">HMAC-SHA256(webhook_secret, raw_body).hex()</code>.</li>
              <li>Compare to <code className="font-mono text-xs">X-MRC-Signature</code> with a <strong className="text-foreground">constant-time</strong> comparison (<code className="font-mono text-xs">crypto.timingSafeEqual</code> / <code className="font-mono text-xs">hmac.compare_digest</code>) to prevent timing attacks.</li>
              <li>If it doesn't match, respond <code className="font-mono text-xs">401</code> and drop the event. If it matches, parse the JSON and process.</li>
            </ol>

            <h4 className="text-base font-semibold text-foreground mt-6 mb-2">Verifying the signature (Node.js)</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono mb-4">
{`import crypto from "node:crypto";
import express from "express";

const app = express();
const SECRET = process.env.MRC_WEBHOOK_SECRET;

// IMPORTANT: capture the raw body BEFORE JSON-parsing, then verify
app.post("/mrc-webhook", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.header("X-MRC-Signature");
  const expected = crypto.createHmac("sha256", SECRET).update(req.body).digest("hex");
  if (!sig || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return res.status(401).send("bad signature");
  }
  const evt = JSON.parse(req.body.toString("utf8"));
  console.log(evt.event, evt.data.order_id, "→", evt.data.state);
  res.status(200).send("ok"); // ALWAYS 2xx within 8s
});

app.listen(3000);`}
            </pre>

            <h4 className="text-base font-semibold text-foreground mt-6 mb-2">Verifying the signature (Python / FastAPI)</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono mb-4">
{`import os, hmac, hashlib
from fastapi import FastAPI, Request, HTTPException

app = FastAPI()
SECRET = os.environ["MRC_WEBHOOK_SECRET"].encode()

@app.post("/mrc-webhook")
async def mrc_webhook(request: Request):
    raw = await request.body()
    sig = request.headers.get("X-MRC-Signature", "")
    expected = hmac.new(SECRET, raw, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(sig, expected):
        raise HTTPException(status_code=401, detail="bad signature")
    evt = await request.json()
    print(evt["event"], evt["data"]["order_id"], "→", evt["data"]["state"])
    return {"ok": True}  # respond 2xx within 8s`}
            </pre>

            <h4 className="text-base font-semibold text-foreground mt-6 mb-2">Self-test: verify a captured webhook</h4>
            <p className="text-muted-foreground mb-3">
              Drop this script into a file and run it locally to confirm your HMAC implementation matches ours. It uses a real captured raw body and the matching <code className="font-mono text-xs">X-MRC-Signature</code> header. If your output prints <code className="font-mono text-xs">match: true</code>, your verifier is wired correctly.
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono mb-4">
{`// test-mrc-signature.mjs  —  run: node test-mrc-signature.mjs
import crypto from "node:crypto";

// 1) Captured EXACTLY as received (no re-serialization, no trailing newline).
const RAW_BODY =
  '{"event":"swap.deposit_detected","idempotency_key":"MRC-1A2B3C4D-XY9Z:swap.deposit_detected:confirming","timestamp":"2026-04-23T15:42:11.118Z","data":{"order_id":"MRC-1A2B3C4D-XY9Z","state":"confirming","from":"btc","to":"usdterc20","amount_in":"0.001","amount_out":"63.84"}}';

// 2) The webhook_secret you passed at create-time.
const WEBHOOK_SECRET = "s3cret_at_least_32_chars_long_xxxx";

// 3) The X-MRC-Signature header value that arrived with the request above.
const RECEIVED_SIGNATURE =
  "6569dff0a7d32d88f973a942e519f88f3e0a1f437946562bd9fae64cc7787e89";

const expected = crypto
  .createHmac("sha256", WEBHOOK_SECRET)
  .update(RAW_BODY) // raw bytes, NOT JSON.parse(...)
  .digest("hex");

const a = Buffer.from(RECEIVED_SIGNATURE, "hex");
const b = Buffer.from(expected, "hex");
const ok = a.length === b.length && crypto.timingSafeEqual(a, b);

console.log("expected:", expected);
console.log("received:", RECEIVED_SIGNATURE);
console.log("match:   ", ok); // → true`}
            </pre>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono mb-4">
{`# test_mrc_signature.py  —  run: python test_mrc_signature.py
import hmac, hashlib

RAW_BODY = (
    b'{"event":"swap.deposit_detected","idempotency_key":'
    b'"MRC-1A2B3C4D-XY9Z:swap.deposit_detected:confirming",'
    b'"timestamp":"2026-04-23T15:42:11.118Z","data":'
    b'{"order_id":"MRC-1A2B3C4D-XY9Z","state":"confirming",'
    b'"from":"btc","to":"usdterc20","amount_in":"0.001",'
    b'"amount_out":"63.84"}}'
)
WEBHOOK_SECRET = b"s3cret_at_least_32_chars_long_xxxx"
RECEIVED_SIGNATURE = "6569dff0a7d32d88f973a942e519f88f3e0a1f437946562bd9fae64cc7787e89"

expected = hmac.new(WEBHOOK_SECRET, RAW_BODY, hashlib.sha256).hexdigest()
print("expected:", expected)
print("received:", RECEIVED_SIGNATURE)
print("match:   ", hmac.compare_digest(expected, RECEIVED_SIGNATURE))  # -> True`}
            </pre>

            <h4 className="text-base font-semibold text-foreground mt-6 mb-2">Replay a captured event with <code className="font-mono text-sm">curl</code></h4>
            <p className="text-muted-foreground mb-3">
              Use this to replay a real captured payload against your own endpoint while you build the verifier. The signature below is precomputed for the exact body bytes shown — change either and you must regenerate the header.
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono mb-4">
{`# 1) Save the captured raw body to a file (NO trailing newline, NO reformat).
printf '%s' '{"event":"swap.deposit_detected","idempotency_key":"MRC-1A2B3C4D-XY9Z:swap.deposit_detected:confirming","timestamp":"2026-04-23T15:42:11.118Z","data":{"order_id":"MRC-1A2B3C4D-XY9Z","state":"confirming","from":"btc","to":"usdterc20","amount_in":"0.001","amount_out":"63.84"}}' > /tmp/mrc-event.json

# 2) Recompute the signature locally so you know what to expect.
SECRET='s3cret_at_least_32_chars_long_xxxx'
SIG=$(openssl dgst -sha256 -hmac "$SECRET" -hex /tmp/mrc-event.json | awk '{print $2}')
echo "X-MRC-Signature: $SIG"
# → 6569dff0a7d32d88f973a942e519f88f3e0a1f437946562bd9fae64cc7787e89

# 3) POST it to your webhook EXACTLY as MRC GlobalPay would.
curl -i -X POST https://your-app.example.com/mrc-webhook \\
  -H "Content-Type: application/json" \\
  -H "X-MRC-Event: swap.deposit_detected" \\
  -H "X-MRC-Idempotency-Key: MRC-1A2B3C4D-XY9Z:swap.deposit_detected:confirming" \\
  -H "X-MRC-Signature: $SIG" \\
  -H "User-Agent: MRC-LiteAPI-Webhook/1.0" \\
  --data-binary @/tmp/mrc-event.json

# Expected: HTTP/1.1 200 OK   (your handler verified the signature and ack'd)
# 401     → your verifier rejected the signature (good — flip a byte to confirm)
# 5xx/timeout → MRC GlobalPay would retry with the same idempotency_key`}
            </pre>
            <p className="text-xs text-muted-foreground mb-6">
              <strong className="text-foreground">Tip:</strong> tamper with one character of the body and re-run step 3 <em>without</em> recomputing <code className="font-mono">SIG</code> — your endpoint should respond <code className="font-mono">401</code>. That single test proves both the HMAC math and the constant-time comparison are wired correctly.
            </p>

            <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground space-y-2 mb-6">
              <p><strong className="text-foreground">Security:</strong> always verify <code className="font-mono">X-MRC-Signature</code> with constant-time comparison before trusting the payload. Choose a webhook_secret of at least 32 random characters and never log it.</p>
              <p><strong className="text-foreground">Delivery semantics:</strong> the initial <code className="font-mono">swap.created</code> webhook is sent inline (its delivery status is returned in the create response under <code className="font-mono">webhook</code>). Later events are fan-out from your <code className="font-mono">action: "status"</code> polls — each state is delivered at most once, then persisted in <code className="font-mono">last_webhook_state</code> so duplicate polls don't spam your endpoint. Time out your handler in 8 seconds or less.</p>
              <p><strong className="text-foreground">Limits:</strong> webhook URL must be HTTPS and ≤512 chars; secret must be 8–128 chars from <code className="font-mono">[A-Za-z0-9._-]</code>.</p>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              The Lite API is a thin, audited wrapper that routes through the same FINTRAC-registered liquidity rails as the public widget. It does not custody funds, store deposit addresses long-term, or hold balances on behalf of users.
            </p>
          </section>

          {/* ── Best Practices for Bots ── */}
          <section id="best-practices" className="mb-16 scroll-mt-24">
            <Badge variant="outline" className="mb-3 border-primary/40 text-primary">
              <Gauge className="mr-1 h-3 w-3" /> Production Hardening
            </Badge>
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Gauge className="h-6 w-6 text-primary" />
              Best Practices for Bots
            </h2>
            <p className="text-muted-foreground mb-6 max-w-3xl">
              Patterns we&rsquo;ve seen survive 24/7 production traffic from arbitrage desks, Telegram bots, and AI agents.
              Adopt all five and the Lite API will sit quietly in the background of your stack.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Rate limiting */}
              <Card className="border-border bg-card/60">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">1. Respect rate limits</h3>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                    <li>10 swaps/hour per IP and per destination wallet; 30/24h velocity per wallet.</li>
                    <li>Cap concurrent <code className="font-mono">create</code> calls at <strong className="text-foreground">2/sec</strong> from a single host.</li>
                    <li>On <code className="font-mono">429</code>, sleep for the returned <code className="font-mono">retry_after_seconds</code> — never tighter than 1s of jitter.</li>
                    <li>Quotes (<code className="font-mono">action=rates</code>) are unmetered — cache 3-5s in memory instead of re-quoting per tick.</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Polling status */}
              <Card className="border-border bg-card/60">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">2. Poll status with backoff</h3>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                    <li>Poll <code className="font-mono">action=status</code> every <strong className="text-foreground">15s</strong> while <code className="font-mono">waiting</code>/<code className="font-mono">confirming</code>.</li>
                    <li>Slow to <strong className="text-foreground">30s</strong> once the deposit is detected — most providers settle &lt; 60s.</li>
                    <li>Stop polling on terminal states: <code className="font-mono">finished</code>, <code className="font-mono">failed</code>, <code className="font-mono">refunded</code>, <code className="font-mono">expired</code>.</li>
                    <li>If you wired a <code className="font-mono">webhook_url</code>, drop polling entirely and react to <code className="font-mono">swap.finished</code>.</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Error handling */}
              <Card className="border-border bg-card/60">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">3. Handle errors deterministically</h3>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                    <li><code className="font-mono">400</code> &mdash; bad input. <strong className="text-foreground">Do not retry</strong>; fix the request.</li>
                    <li><code className="font-mono">413</code> &mdash; over the $1k cap. Split the swap or upgrade to Partner API.</li>
                    <li><code className="font-mono">429</code>/<code className="font-mono">502</code> &mdash; retry with exponential backoff (1s → 30s, max 5 tries).</li>
                    <li><code className="font-mono">451</code> &mdash; geo-blocked at the edge. Stop, no retry will help.</li>
                    <li>Always check <code className="font-mono">response.status === &quot;success&quot;</code> before trusting fields.</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Webhooks */}
              <Card className="border-border bg-card/60">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Webhook className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">4. Prefer webhooks over polling</h3>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                    <li>Pass <code className="font-mono">webhook_url</code> + <code className="font-mono">webhook_secret</code> at <code className="font-mono">create</code> time — saves your rate-limit budget.</li>
                    <li>Always verify <code className="font-mono">X-MRC-Signature</code> with constant-time HMAC-SHA256 over the raw body.</li>
                    <li>De-duplicate by <code className="font-mono">X-MRC-Idempotency-Key</code>; respond <code className="font-mono">2xx</code> within <strong className="text-foreground">8&nbsp;seconds</strong>.</li>
                    <li>Watch <Link to="/webhook-status" className="text-primary hover:underline">/webhook-status</Link> for live delivery health and your endpoint&rsquo;s success rate.</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Bonus: production checklist */}
            <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" /> 5. Pre-flight production checklist
              </h3>
              <ul className="grid gap-2 text-sm text-foreground sm:grid-cols-2">
                <li>✅ Validate destination address against the target network <em className="text-muted-foreground">before</em> calling <code className="font-mono text-xs">create</code>.</li>
                <li>✅ Persist the <code className="font-mono text-xs">order_id</code> + <code className="font-mono text-xs">deposit_address</code> immediately on success.</li>
                <li>✅ Refresh quotes every &lt; 30s — rates drift on volatile pairs (BTC, SOL, memecoins).</li>
                <li>✅ Use a dedicated, monitored wallet as <code className="font-mono text-xs">address</code>; never reuse hot-wallet keys.</li>
                <li>✅ Log <code className="font-mono text-xs">order_id</code>, <code className="font-mono text-xs">provider_order_id</code>, and webhook idempotency keys for audits.</li>
                <li>✅ Alert on <code className="font-mono text-xs">expired</code> &gt; 2% over 1h — usually a deposit-flow regression.</li>
              </ul>
            </div>
          </section>

          {/* ── Section 4: Response DOM Identifiers ── */}
          <section id="dom-ids" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              DOM Identifiers for Bot Integration
            </h2>
            <p className="text-muted-foreground mb-6">
              The swap widget exposes specific DOM elements for programmatic extraction by AI agents and trading bots.
            </p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Element ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Purpose</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Usage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3"><code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">#execute-swap</code></td>
                    <td className="px-4 py-3 text-muted-foreground">Primary swap execution button</td>
                    <td className="px-4 py-3 text-muted-foreground">Triggers the swap after fields are populated</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3"><code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">#deposit-address-display</code></td>
                    <td className="px-4 py-3 text-muted-foreground">Generated deposit address</td>
                    <td className="px-4 py-3 text-muted-foreground">Extract the pay-in address after swap creation</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <CodeBlock code={`// Bot example: extract deposit address after swap creation
const depositAddr = document.querySelector('#deposit-address-display')?.textContent;
console.log('Send funds to:', depositAddr);`} lang="javascript" />
          </section>

          {/* ── Section 5: Technical FAQ ── */}
          <section id="faq" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Technical FAQ
            </h2>
            <div className="space-y-4">
              {[
                { q: "What is the architecture of MRC Global Pay?", a: "MRC Global Pay operates as a high-performance, non-custodial liquidity gateway. We utilize a proprietary aggregation layer that routes trades through top-tier liquidity providers. Our headless interface ensures sub-60-second settlement times while maintaining a strict 'Zero Data Retention' policy for maximum user security." },
                { q: "Is there a Public API available for third-party developers?", a: "Our full-service API is currently in 'Partner-Only' mode to maintain network integrity and dedicated throughput. However, we provide a Public Read-Only Rates API for real-time market transparency. Developers requiring full automated swap capabilities can request a Partner Key via contact@mrcglobalpay.com." },
                { q: "How do you handle high-volume institutional swaps?", a: "Our liquidity engine aggregates from over 700 sources globally. For large-scale transactions, the system automatically routes through deep-liquidity institutional pools to ensure minimal slippage and immediate on-chain settlement." },
                { q: "How is the 'System Status' monitored?", a: "We monitor the Solana, Bitcoin, and Ethereum mainnets in real-time via high-availability RPC nodes. Our /status page serves as a live heartbeat; if an underlying blockchain experiences congestion, our gateway proactively alerts users to ensure transaction safety." },
                { q: "What is the minimum swap amount?", a: "$0.30 equivalent — the lowest in the industry. This enables micro-swaps for dust conversion, arbitrage, and automated trading strategies." },
                { q: "Where can I find live exchange rates?", a: "We provide a public Live Rates JSON endpoint that returns real-time BTC/SOL, ETH/SOL, SOL/USDC, SOL/USDT, and XMR/SOL rates. Rates refresh on every request to reflect true market volatility." },
              ].map((f) => (
                <details key={f.q} className="rounded-lg border border-border bg-card">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-foreground">{f.q}</summary>
                  <p className="px-4 pb-4 text-sm text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* ── Section 6: Developer Integration Guide ── */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Developer Integration Guide
            </h2>
            <p className="text-muted-foreground mb-6">
              The fastest way to offer <strong className="text-foreground">$NOS</strong>, <strong className="text-foreground">$ONDO</strong>, and <strong className="text-foreground">$SOL</strong> swaps on your platform is via our non-custodial widget.
            </p>

            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              <Card className="border-primary/20">
                <CardContent className="pt-5">
                  <Clock className="h-6 w-6 text-primary mb-2" />
                  <h3 className="font-semibold text-foreground text-sm mb-1">5-Minute Integration</h3>
                  <p className="text-xs text-muted-foreground">Inject our secure script into any div container. Production-ready in minutes.</p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="pt-5">
                  <Shield className="h-6 w-6 text-primary mb-2" />
                  <h3 className="font-semibold text-foreground text-sm mb-1">Non-Custodial Security</h3>
                  <p className="text-xs text-muted-foreground">Users maintain full control of their assets. Privacy-first, registration-free architecture.</p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="pt-5">
                  <Globe className="h-6 w-6 text-primary mb-2" />
                  <h3 className="font-semibold text-foreground text-sm mb-1">Brand-Adaptable</h3>
                  <p className="text-xs text-muted-foreground">Fully responsive and customizable for any Web3 interface.</p>
                </CardContent>
              </Card>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mb-6">
              <h3 className="text-sm font-semibold text-primary mb-2">Partner-Only Full API</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Our full-service API is in <strong className="text-foreground">Partner-Only</strong> mode to maintain network integrity and dedicated throughput. For implementation keys and affiliate tracking, contact our technical team at <strong className="text-foreground">contact@mrcglobalpay.com</strong>.
              </p>
              <h3 className="text-sm font-semibold text-primary mb-2">Public Read-Only Rates API</h3>
              <p className="text-sm text-muted-foreground mb-3">
                For real-time market transparency, we expose a public endpoint with live exchange rates fetched directly from our liquidity provider. Rates refresh on every request.
              </p>
              <CodeBlock code={`GET ${import.meta.env.VITE_SUPABASE_URL || 'https://tjikwxkmsfmyjkssvyoh.supabase.co'}/functions/v1/live-rates

// Response
{
  "provider": "MRC Global Pay",
  "license": "FINTRAC MSB C100000015",
  "generated_at": "2026-04-07T12:00:00.000Z",
  "rates": [
    { "pair": "BTC/SOL", "from": "BTC", "to": "SOL", "rate": 452.31, "amount_sent": 1 },
    { "pair": "ETH/SOL", "from": "ETH", "to": "SOL", "rate": 13.87, "amount_sent": 1 },
    ...
  ]
}`} />
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={`${import.meta.env.VITE_SUPABASE_URL || 'https://tjikwxkmsfmyjkssvyoh.supabase.co'}/functions/v1/live-rates`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  View Live Rates JSON <ArrowRight className="h-3 w-3" />
                </a>
                <Link
                  to="/status"
                  className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <Clock className="h-3 w-3" /> Network Status
                </Link>
              </div>
            </div>

            {/* FINTRAC Trust Badge */}
            <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">FINTRAC Registered MSB — C100000015</p>
                <p className="text-xs text-muted-foreground mt-1">
                  MRC Global Pay is a registered Canadian Money Services Business. Our frictionless, registration-free architecture is designed for high-speed settlement while maintaining full regulatory compliance.
                </p>
              </div>
            </div>
          </section>

          {/* ── Internal Links ── */}
          <nav className="rounded-xl border border-border bg-muted/30 p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Related Resources</h3>
            <ul className="grid gap-2 text-sm sm:grid-cols-2">
              <li><Link to="/status" className="text-primary hover:underline">Network Status (Live) →</Link></li>
              <li><Link to="/developer" className="text-primary hover:underline">Developer Hub (Widget Embed) →</Link></li>
              <li><Link to="/get-widget" className="text-primary hover:underline">Widget Generator →</Link></li>
              <li><Link to="/ecosystem/solana-ai" className="text-primary hover:underline">Solana AI & DePIN Hub →</Link></li>
              <li><Link to="/ecosystem/solana" className="text-primary hover:underline">Solana Ecosystem Hub →</Link></li>
              <li><Link to="/solutions" className="text-primary hover:underline">Micro-Swap Solutions →</Link></li>
              <li><Link to="/compare" className="text-primary hover:underline">Compare 50+ Exchanges →</Link></li>
              <li><Link to="/transparency-security" className="text-primary hover:underline">Trust & Transparency →</Link></li>
            </ul>
          </nav>
        </div>
      </main>
      <MsbTrustBar />
      <SiteFooter />
    </>
  );
};

export default DevelopersApi;
