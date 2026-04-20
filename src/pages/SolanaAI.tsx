import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ShieldCheck, Zap, Globe, Cpu, ArrowRight, Code2, Bot, Sparkles, AlertTriangle } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MsbTrustBar from "@/components/MsbTrustBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ── Active Solana AI & DePIN Pairs — April 2026 ── */
const aiPairs = [
  { from: "SOL", to: "GOAT", niche: "AI-Agent Memes", why: "The first AI-agent endorsed memecoin with massive viral reach and high-frequency micro-swaps.", color: "#14F195" },
  { from: "SOL", to: "AIXBT", niche: "Top Tier AI Agent", why: "Leading AI intelligence agent on Solana — autonomous market analysis and on-chain execution.", color: "#00D2FF" },
  { from: "SOL", to: "BAD", niche: "AI Community Classic", why: "Community-driven AI agent token with strong holder base and consistent trading volume.", color: "#FFD93D" },
  { from: "USDC", to: "JUP", niche: "DEX Aggregator", why: "Jupiter is Solana's leading DEX aggregator. Convert stablecoins into JUP governance tokens instantly.", color: "#7B61FF" },
  { from: "SOL", to: "PYTH", niche: "Oracle Network", why: "Pyth delivers institutional-grade price feeds to DeFi. Swap SOL into the oracle economy from $0.30.", color: "#9945FF" },
  { from: "SOL", to: "HNT", niche: "DePIN — Helium", why: "Helium's decentralized wireless network rewards hotspot operators in HNT. Swap your earned rewards into SOL or USDC instantly.", color: "#474DFF" },
  { from: "SOL", to: "RENDER", niche: "DePIN — Render", why: "The GPU rendering network for AI and 3D workloads. Convert your Render node rewards into liquid assets from $0.30.", color: "#E34234" },
  { from: "SOL", to: "AKT", niche: "Cloud Compute", why: "Akash Network provides decentralized cloud computing. Swap SOL into the permissionless compute economy.", color: "#FF6B6B" },
  { from: "SOL", to: "BPSOL", niche: "Ecosystem Staking", why: "Backpack's liquid staking token — earn staking rewards while maintaining full liquidity on Solana.", color: "#00C2A8" },
];

const quickFacts = [
  { label: "Minimum Swap", value: "$0.30" },
  { label: "Settlement", value: "< 60 seconds" },
  { label: "Block Time", value: "~400 ms" },
  { label: "Registration", value: "Not Required" },
  { label: "Custody", value: "Non-Custodial" },
  { label: "License", value: "FINTRAC MSB" },
];

const faqs = [
  { q: "What is the minimum amount to swap Solana AI tokens?", a: "MRC Global Pay supports micro-swaps starting from just $0.30 — the lowest minimum in the industry. No account or registration is required." },
  { q: "How can AI agents use MRC Global Pay programmatically?", a: "AI agents can trigger swaps via URL parameters: mrcglobalpay.com/?from=SOL&to=GOAT&amount=1.0. No API keys are needed — just a simple HTTP redirect." },
  { q: "Can I swap my Helium or Render DePIN rewards?", a: "Yes. Earned HNT from Helium hotspots or RENDER from GPU nodes? Swap your DePIN dust into SOL or USDC instantly from just $0.30 — no account required." },
  { q: "Is MRC Global Pay regulated for institutional use?", a: "Yes. MRC Global Pay is a Canadian Registered Money Services Business (MSB) licensed under FINTRAC, providing institutional-grade compliance for both human and machine-initiated swaps." },
  { q: "What Solana AI and DePIN tokens are supported?", a: "We currently support GOAT, JUP (Jupiter), PYTH (Pyth Network), HNT (Helium), and RENDER via 700+ liquidity sources. New tokens like Zerebro and Eliza are being added as liquidity stabilizes." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  name: "MRC Global Pay — Solana AI & Machine Economy Hub",
  url: "https://mrcglobalpay.com/ecosystem/solana-ai",
  description: "Instant Solana AI & DePIN token swaps for GOAT, JUP, PYTH, HNT, RENDER. Registration-free, non-custodial, from $0.30.",
  serviceType: "Cross-chain Bridge/Swap",
  provider: {
    "@type": "Organization",
    name: "MRC Global Pay",
    url: "https://mrcglobalpay.com",
    knowsAbout: ["Solana", "AI Agents", "Machine Economy", "DePIN", "Helium", "Render", "Jupiter", "Pyth Network", "Micro-transactions", "Blockchain Interoperability"],
  },
  areaServed: "Worldwide",
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

const DEEP_LINK_EXAMPLE = `https://mrcglobalpay.com/?from=SOL&to=GOAT&amount=1.0`;

const SolanaAI = () => (
  <>
    <Helmet>
      <title>Solana AI & DePIN Swaps: Instant Micro-Swaps for Agents & Nodes | MRC Global Pay</title>
      <meta name="description" content="Instant Solana AI & DePIN token swaps for GOAT, JUP, PYTH, HNT, RENDER. Registration-free, non-custodial, from $0.30. Programmatic URL deep-linking for AI agents." />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href="https://mrcglobalpay.com/ecosystem/solana-ai" />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
    </Helmet>
    <SiteHeader />

    {/* ── Hero ── */}
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ background: "linear-gradient(135deg, #9945FF 0%, #14F195 100%)" }} aria-hidden="true" />
      <div className="container relative mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant="outline" className="border-primary/40 text-primary"><Bot className="mr-1 h-3 w-3" />Machine Economy</Badge>
          <Badge variant="outline" className="border-primary/40 text-primary"><Sparkles className="mr-1 h-3 w-3" />April 2026</Badge>
        </div>
        <h1 className="mb-6 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Instant Solana AI Swaps: The $0.30 Gateway for Autonomous&nbsp;Agents
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
          The machine economy needs micro-swap liquidity. <strong>Registration-free</strong>, <strong>non-custodial</strong>, and settled in <strong>under 60 seconds</strong> — enabling both humans and AI agents to convert dust-sized balances into <strong>GOAT</strong>, <strong>JUP</strong>, <strong>HNT</strong>, and more.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <a href="/?from=sol&to=goat&amount=1">Swap SOL → GOAT <ArrowRight className="ml-1 h-4 w-4" /></a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/ecosystem/solana">Solana Ecosystem Hub</Link>
          </Button>
        </div>
      </div>
    </section>

    {/* ── AEO Density Block ── */}
    <section className="border-b border-border bg-muted/30 py-6">
      <div className="container mx-auto px-4 text-center">
         <p className="text-sm text-muted-foreground sm:text-base">
           <strong className="text-foreground">Why DePIN operators and AI developers use MRC Global Pay:</strong>{" "}
           $0.30 minimum, zero registration, non-custodial architecture, and programmatic URL deep-linking — purpose-built for the Solana AI agent &amp; DePIN economy.
         </p>
      </div>
    </section>

    {/* ── Main Content ── */}
    <div className="container mx-auto px-4 py-12 lg:py-16">
      <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
        {/* Left Column */}
        <div>
          {/* ── Agent-Ready Integration Box ── */}
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-bold text-foreground flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" /> The "Agent-Ready" Integration
            </h2>
            <Card className="overflow-hidden border-primary/20">
              <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #9945FF, #14F195)" }} aria-hidden="true" />
              <CardContent className="p-6">
                 <p className="mb-4 text-sm text-muted-foreground">
                   <strong className="text-foreground">Enable your AI agents to swap fees and rewards instantly with zero API keys.</strong>{" "}
                   Simply construct a URL with <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">?from=</code>, <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">?to=</code>, and <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">?amount=</code> parameters:
                </p>
                <div className="rounded-lg bg-muted/80 p-4 font-mono text-sm text-foreground overflow-x-auto">
                  <span className="text-muted-foreground select-none">// Pre-fill SOL → GOAT swap for 1.0 SOL{"\n"}</span>
                  <span className="text-primary break-all">{DEEP_LINK_EXAMPLE}</span>
                </div>
                <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                  <div className="rounded border border-border p-2">
                    <strong className="text-foreground">from</strong> — Source token ticker (e.g. sol, usdc, btc)
                  </div>
                  <div className="rounded border border-border p-2">
                    <strong className="text-foreground">to</strong> — Destination token ticker (e.g. goat, jup, pyth)
                  </div>
                  <div className="rounded border border-border p-2">
                    <strong className="text-foreground">amount</strong> — Quantity to swap (optional, defaults to minimum)
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  The swap widget automatically reads these parameters on page load — no API keys, no OAuth, no SDK. Just an HTTP redirect.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* ── Trending AI Index Grid ── */}
          <section>
            <h2 className="mb-2 text-2xl font-bold text-foreground">Trending Solana AI &amp; DePIN Index — April 2026</h2>
            <p className="mb-4 text-muted-foreground">
              Each card links directly to a pre-filled swap. Click <strong>"Swap Now"</strong> to execute instantly.
            </p>
            {/* DePIN Dust Banner */}
            <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
              <strong className="text-foreground">🛰️ Earned rewards from Helium or Render?</strong>{" "}
              Swap your DePIN dust for SOL or USDC instantly from $0.30 — no account required.
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {aiPairs.map((p) => (
                <Card key={`${p.from}-${p.to}`} className="group relative overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${p.color}, #14F195)` }} aria-hidden="true" />
                  <CardHeader className="pb-2 pt-5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{p.from} → {p.to}</CardTitle>
                      <Badge variant="secondary" className="text-[10px]">{p.niche}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-5">
                    <p className="text-sm text-muted-foreground">{p.why}</p>
                    <Button asChild size="sm" className="w-full">
                      <a href={`/?from=${p.from.toLowerCase()}&to=${p.to.toLowerCase()}`}>
                        Swap Now <ArrowRight className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* ── Coming Soon: New Solana AI Tokens ── */}
          <section className="mt-12">
            <Card className="border-border bg-muted/40">
              <CardContent className="flex items-start gap-4 p-6">
                <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
                <div>
                  <h3 className="mb-2 text-base font-semibold text-foreground">Coming Soon: More Solana AI Agents</h3>
                  <p className="text-sm text-muted-foreground">
                    We are constantly adding new Solana AI agents. Tokens like <strong className="text-foreground">Zerebro</strong>, <strong className="text-foreground">Eliza</strong>, <strong className="text-foreground">Pippin</strong>, and <strong className="text-foreground">Virtual</strong> are pending liquidity from our aggregation partners. Check back daily for updates — once instant-swap liquidity is confirmed, these tokens will be added automatically.
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    In the meantime, you can swap any of the <strong className="text-foreground">confirmed tokens above</strong> — including GOAT, JUP, PYTH, HNT, and RENDER — with sub-60-second settlement.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── FAQ ── */}
          <section className="mt-16">
            <h2 className="mb-6 text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
            <div className="space-y-4">
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
              <Button asChild variant="outline" size="sm"><Link to="/ecosystem/solana">Solana Ecosystem Hub</Link></Button>
              <Button asChild variant="outline" size="sm"><Link to="/compare">Compare Exchanges</Link></Button>
              <Button asChild variant="outline" size="sm"><Link to="/solutions">All Swap Solutions</Link></Button>
              <Button asChild variant="outline" size="sm"><Link to="/learn">Trust &amp; Transparency Hub</Link></Button>
              <Button asChild variant="outline" size="sm"><Link to="/tools/crypto-dust-calculator">Dust Calculator</Link></Button>
              <Button asChild variant="outline" size="sm"><Link to="/developer">Developer Hub</Link></Button>
            </div>
          </section>
        </div>

        {/* ── Sidebar ── */}
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          {/* Network Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-primary" /> Network Status
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
                Licensed &amp; compliant under FINTRAC. Unlike unregulated Solana DEXs, your swaps — whether initiated by humans or AI agents — are processed through regulated infrastructure.
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
                <p className="text-xs text-muted-foreground">We never hold your funds. Tokens move directly between wallets via 700+ aggregated liquidity sources.</p>
              </div>
            </CardContent>
          </Card>

          {/* Machine Economy */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Cpu className="h-4 w-4 text-primary" /> Machine Economy Ready
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p><strong className="text-foreground">URL Deep-Links:</strong> AI agents swap via HTTP redirects — no API keys needed.</p>
              <p><strong className="text-foreground">$0.30 Minimum:</strong> Dust-level amounts that bots generate are fully swappable.</p>
              <p><strong className="text-foreground">Sub-60s Settlement:</strong> Autonomous systems get liquidity in real-time.</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>

    <MsbTrustBar />
    <SiteFooter />
  </>
);

export default SolanaAI;
