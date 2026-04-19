import { useLocation } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLangFromPath, langPath } from "@/i18n";

/**
 * Bidirectional cross-link block rendered inside trending /blog/how-to-buy-{token}-2026
 * articles. Each entry maps a blog slug to its canonical /swap/{pair} pages,
 * completing the loop with the /swap/* `relatedBlog` reference defined in
 * src/lib/swap-pair-rich-content.ts.
 *
 * Keeping the map here (not in the markdown body) preserves the dark theme,
 * green accents, hreflang, and i18n routing — and avoids forcing translators
 * to re-author HTML for every locale.
 */
interface PairLink {
  slug: string;
  label: string;
  description: string;
}

export const BLOG_TO_SWAP_LINKS: Record<string, { primary: PairLink; secondary: PairLink[] }> = {
  "how-to-buy-pepe-2026": {
    primary: { slug: "pepe-usdt", label: "Swap PEPE → USDT", description: "Lock memecoin gains into a stablecoin in under 60 seconds." },
    secondary: [
      { slug: "pepe-btc", label: "Swap PEPE → BTC", description: "Bank PEPE profits directly into native Bitcoin — one quote, no CEX." },
      { slug: "doge-usdt", label: "Swap DOGE → USDT", description: "Convert the original memecoin to USDT with native chain settlement." },
      { slug: "bonk-usdt", label: "Swap BONK → USDT", description: "Solana memecoin liquidity meets sub-second SPL routing." },
    ],
  },
  "how-to-buy-doge-2026": {
    primary: { slug: "doge-usdt", label: "Swap DOGE → USDT", description: "Native Dogecoin chain settlement to USDT in under a minute." },
    secondary: [
      { slug: "doge-btc", label: "Swap DOGE → BTC", description: "Rotate Dogecoin into native Bitcoin without an exchange account." },
      { slug: "pepe-usdt", label: "Swap PEPE → USDT", description: "Cash out memecoin volatility on the deepest ERC-20 PEPE liquidity." },
      { slug: "xrp-usdt", label: "Swap XRP → USDT", description: "XRPL's 3-5 second finality routed straight into stablecoin liquidity." },
    ],
  },
  "how-to-buy-xrp-2026": {
    primary: { slug: "xrp-usdt", label: "Swap XRP → USDT", description: "XRPL's deterministic 3-5s finality settled to USDT instantly." },
    secondary: [
      { slug: "xrp-btc", label: "Swap XRP → BTC", description: "Convert XRP directly into native Bitcoin in minutes — single locked quote." },
      { slug: "doge-usdt", label: "Swap DOGE → USDT", description: "High-liquidity DOGE/USDT routing with native chain settlement." },
      { slug: "tao-usdt", label: "Swap TAO → USDT", description: "Bittensor (TAO) routed via Substrate-native deposit to USDT." },
    ],
  },
  "how-to-buy-hype-hyperliquid-2026": {
    primary: { slug: "hype-usdt", label: "Swap HYPE → USDT", description: "Hyperliquid's near-instant L1 finality settled to USDT in under 40s." },
    secondary: [
      { slug: "hype-btc", label: "Swap HYPE → BTC", description: "Bank perp DEX gains directly into native Bitcoin — no CEX hop." },
      { slug: "tao-usdt", label: "Swap TAO → USDT", description: "Decentralized AI exposure cashed out to stablecoin liquidity." },
      { slug: "sol-usdt", label: "Swap SOL → USDT", description: "Solana's sub-second finality routed into pre-funded USDT vaults." },
    ],
  },
  "how-to-buy-tao-bittensor-2026": {
    primary: { slug: "tao-usdt", label: "Swap TAO → USDT", description: "Substrate-native TAO routed to USDT in under 90 seconds." },
    secondary: [
      { slug: "tao-btc", label: "Swap TAO → BTC", description: "Convert Bittensor (TAO) directly to native Bitcoin without KYC." },
      { slug: "hype-usdt", label: "Swap HYPE → USDT", description: "Hyperliquid (HYPE) routed via HyperEVM finality to stablecoin." },
      { slug: "sol-usdt", label: "Swap SOL → USDT", description: "Solana liquidity routed to USDT with pre-funded vaults." },
    ],
  },
  "how-to-buy-siren-2026": {
    primary: { slug: "siren-usdt", label: "Swap SIREN → USDT", description: "Verified BEP-20 SIREN routing to USDT with locked quote before funding." },
    secondary: [
      { slug: "bnb-usdc", label: "Swap BNB → USDC", description: "Native BNB Chain liquidity routed into pre-funded USDC vaults." },
      { slug: "bdag-usdt", label: "Swap BDAG → USDT", description: "Aggregated BlockDAG liquidity settled to USDT in under 90s." },
      { slug: "doge-usdt", label: "Swap DOGE → USDT", description: "Liquid memecoin alternative — DOGE to USDT with deep multi-venue routing." },
    ],
  },
  "how-to-buy-blockdag-bdag-2026": {
    primary: { slug: "bdag-usdt", label: "Swap BDAG → USDT", description: "Aggregated BlockDAG (BDAG) routing to USDT with multi-network delivery." },
    secondary: [
      { slug: "siren-usdt", label: "Swap SIREN → USDT", description: "Verified BEP-20 SIREN routed via deep BNB Chain liquidity." },
      { slug: "tao-usdt", label: "Swap TAO → USDT", description: "Bittensor (TAO) routed to USDT via Substrate-native deposit." },
      { slug: "hype-usdt", label: "Swap HYPE → USDT", description: "Hyperliquid token settled to USDT with sub-minute execution." },
    ],
  },
  "how-to-buy-bonk-2026": {
    primary: { slug: "bonk-usdt", label: "Swap BONK → USDT", description: "Solana SPL BONK routed to USDT in under 30 seconds with pre-funded vaults." },
    secondary: [
      { slug: "bonk-btc", label: "Swap BONK → BTC", description: "Convert Solana memecoin gains directly into native Bitcoin — one locked quote." },
      { slug: "pepe-usdt", label: "Swap PEPE → USDT", description: "Ethereum-side memecoin alternative with the deepest ERC-20 PEPE liquidity." },
      { slug: "sol-usdt", label: "Swap SOL → USDT", description: "Underlying Solana liquidity routed straight to pre-funded USDT vaults." },
    ],
  },
};

interface BlogSwapCrossLinksProps {
  slug: string;
}

const BlogSwapCrossLinks = ({ slug }: BlogSwapCrossLinksProps) => {
  const links = BLOG_TO_SWAP_LINKS[slug];
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const lp = (path: string) => langPath(lang, path);

  if (!links) return null;

  return (
    <aside
      aria-label="Swap this token instantly"
      className="my-10 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card p-6 shadow-card sm:p-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-wider text-primary">
            Ready to act on this guide?
          </p>
          <h3 className="mt-1 font-display text-lg font-bold text-foreground sm:text-xl">
            {links.primary.label} on MRC GlobalPay
          </h3>
          <p className="mt-1.5 font-body text-sm text-muted-foreground">
            {links.primary.description}
          </p>
        </div>
        <Button size="lg" className="shadow-neon shrink-0" asChild>
          <a href={lp(`/swap/${links.primary.slug}`)}>
            <Zap className="mr-2 h-5 w-5" />
            Open swap page
          </a>
        </Button>
      </div>

      <div className="mt-6 grid gap-3 border-t border-border pt-5 sm:grid-cols-3">
        {links.secondary.map((s) => (
          <a
            key={s.slug}
            href={lp(`/swap/${s.slug}`)}
            className="group flex h-full flex-col gap-2 rounded-xl border border-border bg-background/40 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <span className="flex items-center justify-between font-display text-sm font-semibold text-foreground group-hover:text-primary">
              {s.label}
              <ArrowRight className="h-4 w-4 text-primary opacity-70 transition-transform group-hover:translate-x-0.5" />
            </span>
            <span className="font-body text-xs leading-relaxed text-muted-foreground">
              {s.description}
            </span>
          </a>
        ))}
      </div>
    </aside>
  );
};

export default BlogSwapCrossLinks;
