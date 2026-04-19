import { useState } from "react";
import { ArrowRight, Cpu, Radio, Landmark, Coins, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TokenCard {
  from: string;
  to: string;
  label: string;
  niche: string;
  desc: string;
}

const aiCompute: TokenCard[] = [
  { from: "SOL", to: "NOS", label: "Nosana (NOS)", niche: "GPU Compute", desc: "Decentralized GPU network powering AI inference on Solana." },
  { from: "SOL", to: "AIXBT", label: "AIXBT", niche: "AI Agent", desc: "Leading autonomous market-analysis agent on Solana." },
  { from: "SOL", to: "RENDER", label: "Render", niche: "GPU Rendering", desc: "Distributed GPU rendering for AI and 3D workloads." },
  { from: "SOL", to: "IO", label: "io.net (IO)", niche: "Compute Layer", desc: "Aggregated GPU compute marketplace for ML training." },
  { from: "SOL", to: "AKT", label: "Akash (AKT)", niche: "Cloud Compute", desc: "Permissionless cloud — decentralized CPU and GPU." },
];

const depinInfra: TokenCard[] = [
  { from: "HNT", to: "SOL", label: "Helium (HNT)", niche: "Wireless", desc: "Swap hotspot rewards into SOL instantly from $0.30." },
  { from: "SOL", to: "MOBILE", label: "Helium Mobile", niche: "5G Network", desc: "Helium's 5G sub-network token for mobile coverage." },
  { from: "SOL", to: "HONEY", label: "Hivemapper (HONEY)", niche: "Mapping", desc: "Earn-and-swap dashcam mapping rewards on Solana." },
  { from: "SOL", to: "PYTH", label: "Pyth Network", niche: "Oracle", desc: "Institutional-grade price feeds powering Solana DeFi." },
];

const institutional: TokenCard[] = [
  { from: "SOL", to: "ONDO", label: "Ondo Finance", niche: "RWA / Tokenized Treasuries", desc: "US Treasury-backed yield tokens — institutional DeFi." },
  { from: "SOL", to: "JUP", label: "Jupiter (JUP)", niche: "DEX Aggregator", desc: "Solana's #1 DEX aggregator — swap dust into governance." },
  { from: "ETH", to: "LINK", label: "Chainlink", niche: "Oracle / CCIP", desc: "Cross-chain interoperability and the standard oracle layer." },
  { from: "SOL", to: "ENA", label: "Ethena (ENA)", niche: "Synthetic Dollar", desc: "Delta-neutral stablecoin protocol with yield generation." },
  { from: "ETH", to: "EIGEN", label: "EigenLayer", niche: "Restaking", desc: "Shared security and restaking infrastructure for Ethereum." },
];

const solanaStaking: TokenCard[] = [
  { from: "SOL", to: "JUPSOL", label: "jupSOL", niche: "LST (Jupiter)", desc: "Jupiter's liquid staking token — earn yield with full liquidity." },
  { from: "SOL", to: "JTO", label: "Jito (JTO)", niche: "MEV Staking", desc: "MEV-boosted liquid staking for maximum Solana yield." },
  { from: "SOL", to: "INF", label: "Infinity (INF)", niche: "LST (Sanctum)", desc: "Sanctum's unified LST — instant Solana staking access." },
  { from: "SOL", to: "BPSOL", label: "Backpack (BPSOL)", niche: "Ecosystem Staking", desc: "Liquid staking via Backpack wallet — full liquidity." },
];

const tabs = [
  { value: "ai", label: "AI & Compute", icon: Cpu, tokens: aiCompute },
  { value: "depin", label: "DePIN", icon: Radio, tokens: depinInfra },
  { value: "rwa", label: "Institutional & RWA", icon: Landmark, tokens: institutional },
  { value: "staking", label: "Solana Staking", icon: Coins, tokens: solanaStaking },
] as const;

const TokenCardRow = ({ t }: { t: TokenCard }) => (
  <Card
    className="group overflow-hidden transition-shadow hover:shadow-md"
    aria-label={`${t.from} to ${t.label} non-custodial swap card — ${t.niche}`}
  >
    <CardContent className="flex items-center gap-4 p-4">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="font-semibold text-foreground">{t.from} → {t.label}</span>
          <Badge variant="secondary" className="text-[10px]">{t.niche}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{t.desc}</p>
      </div>
      <Button asChild size="sm" className="shrink-0">
        <a
          href={`/?from=${t.from.toLowerCase()}&to=${t.to.toLowerCase()}`}
          aria-label={`Open swap widget pre-filled with ${t.from} to ${t.label}`}
        >
          Swap <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
        </a>
      </Button>
    </CardContent>
  </Card>
);

const TrendingEcosystems = () => {
  const [active, setActive] = useState<string>("ai");

  return (
    <section className="border-t border-border bg-background py-16" aria-labelledby="trending-hubs-heading">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-widest text-primary">
            <Cpu className="h-3.5 w-3.5" aria-hidden="true" />
            2026 Trending Hubs
          </span>
          <h2 id="trending-hubs-heading" className="mt-4 mb-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Top Crypto Ecosystems This Year
          </h2>
          <p className="mx-auto max-w-2xl font-body text-base text-muted-foreground sm:text-lg">
            Verified, high-liquidity tokens across AI, DePIN, RWA, and Solana staking. Swap with{" "}
            <strong className="text-foreground">no account required</strong> from a{" "}
            <strong className="text-foreground">$0.30 minimum</strong>, settled directly to your wallet.
          </p>
        </div>

        {/* Tab buttons */}
        <div role="tablist" aria-label="Token categories" className="mb-6 flex w-full flex-wrap gap-1 rounded-md bg-muted/50 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={active === tab.value}
              aria-controls={`panel-${tab.value}`}
              onClick={() => setActive(tab.value)}
              className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-sm px-3 py-1.5 text-xs font-medium ring-offset-background transition-all sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                active === tab.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* All panels rendered in DOM for SEO — hidden visually via CSS */}
        {tabs.map((tab) => (
          <div
            key={tab.value}
            id={`panel-${tab.value}`}
            role="tabpanel"
            aria-labelledby={tab.value}
            className={active === tab.value ? "" : "sr-only"}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {tab.tokens.map((t) => (
                <TokenCardRow key={t.to} t={t} />
              ))}
            </div>
          </div>
        ))}

        {/* Supported Wallets */}
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
};

export default TrendingEcosystems;
