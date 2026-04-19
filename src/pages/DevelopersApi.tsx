import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Code2, Download, Globe, Shield, Zap, Clock, ArrowRight, Copy, Check, Search } from "lucide-react";
import { useState, useMemo } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MsbTrustBar from "@/components/MsbTrustBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
  isPartOf: { "@type": "WebSite", name: "MRC GlobalPay", url: "https://mrcglobalpay.com" },
  publisher: {
    "@type": "Organization",
    name: "MRC GlobalPay",
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
    name: "MRC GlobalPay",
    url: "https://mrcglobalpay.com",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What is the architecture of MRC Global Pay?", acceptedAnswer: { "@type": "Answer", text: "MRC Global Pay operates as a high-performance, non-custodial liquidity gateway. We utilize a proprietary aggregation layer that routes trades through top-tier liquidity providers with sub-60-second settlement times and a strict Zero Data Retention policy." } },
    { "@type": "Question", name: "Is there a Public API available for third-party developers?", acceptedAnswer: { "@type": "Answer", text: "Our full-service API is in Partner-Only mode. We provide a Public Read-Only Rates API for real-time market transparency. Developers requiring full automated swap capabilities can request a Partner Key via contact@mrcglobalpay.com." } },
    { "@type": "Question", name: "How do you handle high-volume institutional swaps?", acceptedAnswer: { "@type": "Answer", text: "Our liquidity engine aggregates from over 700 sources globally. For large-scale transactions, the system routes through deep-liquidity institutional pools for minimal slippage and immediate on-chain settlement." } },
    { "@type": "Question", name: "How is the System Status monitored?", acceptedAnswer: { "@type": "Answer", text: "We monitor Solana, Bitcoin, and Ethereum mainnets in real-time via high-availability RPC nodes. Our /status page serves as a live heartbeat with proactive congestion alerts." } },
    { "@type": "Question", name: "What is the minimum swap amount?", acceptedAnswer: { "@type": "Answer", text: "$0.30 equivalent — the lowest in the industry. This enables micro-swaps for dust conversion, arbitrage, and automated trading strategies." } },
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
        <title>Solana Swap API Docs — 50+ Tokens | MRC Global Pay</title>
        <meta name="description" content="Programmatic non-custodial Solana swap API. $0.30 minimum, registration-free liquidity for NOS, ONDO and 50+ assets. Built for arbitrage bots and AI agents." />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href="https://mrcglobalpay.com/developers" />
        <meta property="og:title" content="Solana Swap API Documentation — MRC Global Pay" />
        <meta property="og:description" content="50+ Solana tokens with contract addresses, URL deep-linking docs, and downloadable JSON token list. $0.30 minimum, registration-free." />
        <meta property="og:url" content="https://mrcglobalpay.com/developers" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="MRC GlobalPay" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Solana Swap API Docs — MRC Global Pay" />
        <meta name="twitter:description" content="Non-custodial Solana swap API with 50+ tokens. $0.30 minimum, FINTRAC MSB registered." />
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

          {/* ── Section 1: Endpoint Documentation ── */}
          <section className="mb-16">
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
          <section className="mb-16">
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
          <section className="mb-16">
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

          {/* ── Section 4: Response DOM Identifiers ── */}
          <section className="mb-16">
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
          <section className="mb-16">
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
