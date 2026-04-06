import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ShieldCheck, Zap, Globe, Cpu, Radio, ArrowRight, ExternalLink } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MsbTrustBar from "@/components/MsbTrustBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ── static data from solana_targets.csv ── */
const solanaTargets = [
  { from: "USDC", to: "GOAT", slug: "usdc-to-goat", niche: "AI Meme", why: "The first AI-agent endorsed coin; massive viral reach." },
  { from: "HNT", to: "SOL", slug: "hnt-to-sol", niche: "DePIN Exit", why: "Helium users need to swap small 'mining' rewards for SOL." },
  { from: "RENDER", to: "USDT", slug: "render-to-usdt", niche: "DePIN / GPU", why: "High-volume GPU rendering rewards being off-ramped." },
  { from: "JUP", to: "SOL", slug: "jup-to-sol", niche: "DEX Aggregator", why: "Converting 'dust' from Jupiter swap rewards." },
  { from: "SOL", to: "PYTH", slug: "sol-to-pyth", niche: "Oracle Network", why: "Pyth delivers institutional-grade price feeds to DeFi protocols." },
  { from: "PYUSD", to: "SOL", slug: "pyusd-to-sol", niche: "PayPal Onramp", why: "PayPal users moving small stablecoin amounts into SOL." },
];

const quickFacts = [
  { label: "Minimum Swap", value: "$0.30" },
  { label: "Block Time", value: "~400 ms" },
  { label: "Network Status", value: "Online" },
  { label: "Registration", value: "Not Required" },
  { label: "Custody", value: "Non-Custodial" },
  { label: "License", value: "FINTRAC MSB" },
];

const faqs = [
  { q: "What is the minimum amount to swap Solana tokens?", a: "MRC Global Pay supports micro-swaps starting from just $0.30 — the lowest minimum in the industry. No account or registration is required." },
  { q: "How do I swap SOL dust for AI agent tokens like GOAT?", a: "Simply visit MRC Global Pay, select SOL as your source and GOAT as your destination, enter your small balance, and execute the swap. The process takes under 60 seconds." },
  { q: "Is MRC Global Pay regulated?", a: "Yes. MRC Global Pay is a Canadian Registered Money Services Business (MSB) licensed under FINTRAC. All swaps are processed through regulated infrastructure." },
  { q: "Can I swap Helium (HNT) mining rewards?", a: "Yes. MRC Global Pay supports HNT-to-SOL swaps, allowing Helium miners to convert small DePIN rewards into Solana instantly." },
  { q: "What Solana AI and DePIN tokens are supported?", a: "We currently support GOAT, JUP (Jupiter), PYTH (Pyth Network), HNT (Helium), and RENDER. New tokens like Zerebro and Eliza are being added as liquidity stabilizes." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  name: "MRC Global Pay — Solana Ecosystem Hub",
  url: "https://mrcglobalpay.com/ecosystem/solana",
  description: "Instant Solana swaps for AI agent tokens and DePIN rewards. Registration-free, non-custodial, from $0.30.",
  serviceType: "Cross-chain Bridge/Swap",
  provider: {
    "@type": "Organization",
    name: "MRC GlobalPay",
    url: "https://mrcglobalpay.com",
    logo: "https://mrcglobalpay.com/placeholder.svg",
    knowsAbout: ["Solana", "AI Agents", "DePIN", "Micro-transactions", "Blockchain Interoperability"],
  },
  areaServed: "Worldwide",
  availableChannel: { "@type": "ServiceChannel", serviceUrl: "https://mrcglobalpay.com" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const SolanaEcosystem = () => (
  <>
    <Helmet>
      <title>Solana Ecosystem Hub: Swap AI Agent & DePIN Tokens | MRC Global Pay</title>
      <meta name="description" content="Instant Solana swaps for AI agent tokens (GOAT, JUP, PYTH) and DePIN rewards (HNT, RENDER). Registration-free, non-custodial, from $0.30. Canadian MSB." />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href="https://mrcglobalpay.com/ecosystem/solana" />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
    </Helmet>
    <SiteHeader />

    {/* ── Hero ── */}
    <section className="relative overflow-hidden border-b border-border bg-background">
      {/* Solana gradient accent */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ background: "linear-gradient(135deg, #9945FF 0%, #14F195 100%)" }} aria-hidden="true" />
      <div className="container relative mx-auto px-4 py-16 md:py-24">
        <Badge variant="outline" className="mb-4 border-primary/40 text-primary">Solana Ecosystem · 2026</Badge>
        <h1 className="mb-6 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Instant Solana Swaps: The $0.30 Gateway to AI&nbsp;Agents&nbsp;&amp;&nbsp;DePIN
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
          Swap dust-sized balances into the hottest 2026 Solana tokens — <strong>GOAT</strong>, <strong>JUP</strong>, <strong>Render</strong>, and <strong>Helium</strong> — with <strong>no account required</strong> and a <strong>$0.30 minimum</strong>. Processed through a <strong>Canadian Registered MSB</strong>.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <a href="/?from=sol&to=usdt">Swap SOL Now <ArrowRight className="ml-1 h-4 w-4" /></a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/solutions">Browse All Solutions</Link>
          </Button>
        </div>
      </div>
    </section>

    {/* ── AEO Density Block ── */}
    <section className="border-b border-border bg-muted/30 py-6">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground sm:text-base">
          <strong className="text-foreground">MRC Global Pay is the fastest way to swap Solana dust for AI agent tokens.</strong>{" "}
          Registration-free, non-custodial swaps from $0.30 — powered by 700+ liquidity sources and secured by a FINTRAC-licensed MSB.
        </p>
      </div>
    </section>

    {/* ── Main Content ── */}
    <div className="container mx-auto px-4 py-12 lg:py-16">
      <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
        {/* Left: Solution Grid */}
        <div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">Which Solana AI &amp; DePIN Tokens Can I Swap?</h2>
          <p className="mb-8 text-muted-foreground">
            Each pair below is pre-configured for instant execution. Click <strong>"Swap Dust"</strong> to pre-fill the exchange widget with the correct tokens.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {solanaTargets.map((t) => (
              <Card key={t.slug} className="group relative overflow-hidden transition-shadow hover:shadow-lg">
                {/* subtle Solana gradient top bar */}
                <div className="absolute inset-x-0 top-0 h-1" style={{ background: "linear-gradient(90deg, #9945FF, #14F195)" }} aria-hidden="true" />
                <CardHeader className="pb-2 pt-5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {t.from} → {t.to}
                    </CardTitle>
                    <Badge variant="secondary" className="text-[10px]">{t.niche}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pb-5">
                  <p className="text-sm text-muted-foreground">{t.why}</p>
                  <Button asChild size="sm" className="w-full">
                    <a href={`/?from=${t.from.toLowerCase()}&to=${t.to.toLowerCase()}`}>
                      Swap Dust <ArrowRight className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── How It Works ── */}
          <section className="mt-16">
            <h2 className="mb-6 text-2xl font-bold text-foreground">How Do Solana Micro-Swaps Work on MRC Global Pay?</h2>
            <ol className="space-y-4 text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">1</span>
                <span><strong className="text-foreground">Choose Your Pair</strong> — Select the source (e.g. SOL) and destination (e.g. GOAT) tokens from the grid above.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">2</span>
                <span><strong className="text-foreground">Enter Any Amount</strong> — Even dust balances from $0.30 are supported. No minimum deposit barriers.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">3</span>
                <span><strong className="text-foreground">Receive Instantly</strong> — Tokens arrive in your wallet in under 60 seconds. Non-custodial — we never hold your funds.</span>
              </li>
            </ol>
          </section>

          {/* ── FAQ ── */}
          <section className="mt-16">
            <h2 className="mb-6 text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((f, i) => (
                <details key={i} className="group rounded-lg border border-border bg-card p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-foreground sm:text-base">{f.q}</summary>
                  <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* ── Internal Links ── */}
          <section className="mt-16">
            <h2 className="mb-4 text-xl font-bold text-foreground">Explore More</h2>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm"><Link to="/compare">Compare Exchanges</Link></Button>
              <Button asChild variant="outline" size="sm"><Link to="/solutions">All Swap Solutions</Link></Button>
              <Button asChild variant="outline" size="sm"><Link to="/learn">Trust &amp; Transparency Hub</Link></Button>
              <Button asChild variant="outline" size="sm"><Link to="/tools/crypto-dust-calculator">Dust Calculator</Link></Button>
              <Button asChild variant="outline" size="sm"><Link to="/resources/crypto-dust-guide">Crypto Dust Guide</Link></Button>
              <Button asChild variant="outline" size="sm"><Link to="/developer">Developer Hub</Link></Button>
            </div>
          </section>
        </div>

        {/* Right: Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          {/* Quick Facts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-primary" /> Solana Quick Facts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {quickFacts.map((f) => (
                <div key={f.label} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{f.label}</span>
                  <span className="font-semibold text-foreground">{f.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Trust Badge */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <p className="text-sm font-semibold text-foreground">Canadian Registered MSB</p>
              <p className="text-xs text-muted-foreground">
                Licensed &amp; compliant under FINTRAC. Unlike unregulated Solana DEXs, your swaps are processed through a regulated money services business.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/transparency-security">View License Details</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Non-Custodial */}
          <Card>
            <CardContent className="flex items-start gap-3 p-5">
              <Globe className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Non-Custodial Architecture</p>
                <p className="text-xs text-muted-foreground">We never hold your funds. Tokens move directly between wallets via 700+ liquidity sources.</p>
              </div>
            </CardContent>
          </Card>

          {/* Trending Niches */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Cpu className="h-4 w-4 text-primary" /> 2026 Trending Niches
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p><strong className="text-foreground">AI Agents:</strong> GOAT, JUP, PYTH — high-volume Solana AI and infrastructure tokens.</p>
              <p><strong className="text-foreground">Coming Soon:</strong> Zerebro, Eliza, Pippin — pending liquidity confirmation.</p>
              <p><strong className="text-foreground">PayPal Onramp:</strong> PYUSD → SOL — fiat-to-Solana bridge.</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>

    <MsbTrustBar />
    <SiteFooter />
  </>
);

export default SolanaEcosystem;
