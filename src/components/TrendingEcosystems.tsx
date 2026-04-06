import { ArrowRight, Bot, Radio, Sparkles, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const aiAgents = [
  { from: "SOL", to: "GOAT", label: "GOAT", niche: "AI Meme", desc: "The first AI-agent endorsed memecoin with massive viral reach." },
  { from: "SOL", to: "AIXBT", label: "AIXBT", niche: "Top Tier AI Agent", desc: "Leading AI intelligence agent — autonomous market analysis on Solana." },
  { from: "SOL", to: "BAD", label: "BAD", niche: "AI Community Classic", desc: "Community-driven AI agent token with strong holder base." },
  { from: "SOL", to: "JUP", label: "Jupiter", niche: "DEX Aggregator", desc: "Solana's leading DEX aggregator — swap dust into governance tokens." },
  { from: "SOL", to: "PYTH", label: "Pyth Network", niche: "Oracle", desc: "Institutional-grade price feeds powering Solana DeFi." },
];

const depinTokens = [
  { from: "HNT", to: "SOL", label: "Helium (HNT)", niche: "Wireless", desc: "Swap Helium hotspot rewards into SOL instantly from $0.30." },
  { from: "SOL", to: "RENDER", label: "Render", niche: "GPU Network", desc: "Convert GPU rendering node rewards into liquid assets." },
  { from: "SOL", to: "AKT", label: "Akash (AKT)", niche: "Cloud Compute", desc: "Decentralized cloud computing — permissionless GPU and CPU." },
  { from: "SOL", to: "BPSOL", label: "Backpack (BPSOL)", niche: "Ecosystem Staking", desc: "Liquid staking via Backpack — earn rewards with full liquidity." },
];

const walletCleaning = [
  { from: "BANANA", to: "SOL", label: "BANANA → SOL" },
  { from: "BABYDOGE", to: "SOL", label: "BABYDOGE → SOL" },
  { from: "BERA", to: "USDC", label: "BERA → USDC" },
];

const TrendingEcosystems = () => (
  <section className="border-t border-border bg-background py-16">
    <div className="container mx-auto px-4">
      <div className="mb-10 text-center">
        <h2 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">Trending Ecosystems</h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Swap the hottest 2026 Solana tokens — AI agents, DePIN rewards, and micro-balances — with <strong className="text-foreground">no account required</strong> and a <strong className="text-foreground">$0.30 minimum</strong>.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* AI Agents */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Solana AI Agents</h3>
          </div>
          <div className="grid gap-3">
            {aiAgents.map((t) => (
              <Card key={t.to} className="group overflow-hidden transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{t.from} → {t.label}</span>
                      <Badge variant="secondary" className="text-[10px]">{t.niche}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                  <Button asChild size="sm" className="shrink-0">
                    <a href={`/?from=${t.from.toLowerCase()}&to=${t.to.toLowerCase()}`}>
                      Swap <ArrowRight className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* DePIN & Infra */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">DePIN &amp; Infrastructure</h3>
          </div>
          <div className="grid gap-3">
            {depinTokens.map((t) => (
              <Card key={t.label} className="group overflow-hidden transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{t.from} → {t.label}</span>
                      <Badge variant="secondary" className="text-[10px]">{t.niche}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                  <Button asChild size="sm" className="shrink-0">
                    <a href={`/?from=${t.from.toLowerCase()}&to=${t.to.toLowerCase()}`}>
                      Swap <ArrowRight className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Wallet Cleaning */}
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Wallet Cleaning</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {walletCleaning.map((t) => (
                <Button key={t.label} asChild variant="outline" size="sm">
                  <a href={`/?from=${t.from.toLowerCase()}&to=${t.to.toLowerCase()}`}>
                    {t.label} <ArrowRight className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Wallets */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
        <Wallet className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Supported Wallets &amp; Staking:</span>
        <Badge variant="outline" className="text-xs">Phantom</Badge>
        <Badge variant="outline" className="text-xs">Backpack (BPSOL)</Badge>
        <Badge variant="outline" className="text-xs">MetaMask</Badge>
        <Badge variant="outline" className="text-xs">Ledger</Badge>
      </div>

      <div className="mt-8 text-center">
        <Button asChild variant="outline">
          <Link to="/ecosystem/solana-ai">Explore Full Solana AI Hub <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  </section>
);

export default TrendingEcosystems;
