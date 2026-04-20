/**
 * Priority-token enhancement registry.
 *
 * Maps the 7 high-impact tokens (PEPE, DOGE, XRP, HYPE, TAO, SIREN, BDAG) to:
 *  - hero image (used as og:image + in-page hero on blog post + pair pages)
 *  - blog slug (canonical /blog/how-to-buy-{token}-2026)
 *  - default swap pair (drives the deep-link CTA: /?from=…&to=…&tab=exchange#exchange)
 *  - improved meta titles + descriptions (CTR-optimized, keyword-rich)
 *
 * Consumed by:
 *   - src/pages/BlogPost.tsx          → hero, schema, meta, CTAs, sticky share rail
 *   - src/components/SwapPairLanding  → hero, og:image, deep-link CTA
 *   - src/components/blog/BlogSwapCrossLinks → already wired bidirectional links
 */

import heroPepe from "@/assets/blog/hero-pepe-2026.jpg";
import heroDoge from "@/assets/blog/hero-doge-2026.jpg";
import heroXrp from "@/assets/blog/hero-xrp-2026.jpg";
import heroHype from "@/assets/blog/hero-hype-2026.jpg";
import heroTao from "@/assets/blog/hero-tao-2026.jpg";
import heroSiren from "@/assets/blog/hero-siren-2026.jpg";
import heroBdag from "@/assets/blog/hero-bdag-2026.jpg";

export interface PriorityTokenAsset {
  /** Display ticker (uppercase). */
  symbol: string;
  /** Token full name. */
  name: string;
  /** Imported hero image URL (used for og:image + in-page hero). */
  heroImage: string;
  /** Imported alt text for the hero image. */
  heroAlt: string;
  /** Canonical blog slug (English). */
  blogSlug: string;
  /** Canonical pair slug used for the primary CTA. */
  pairSlug: string;
  /** Widget deep-link source ticker (lowercase, matches widget TICKER_MAP). */
  widgetFrom: string;
  /** Widget deep-link target ticker (lowercase, matches widget TICKER_MAP). */
  widgetTo: string;
  /** Improved CTR-optimized meta title (~55 chars). */
  metaTitle: string;
  /** Improved CTR-optimized meta description (140-160 chars). */
  metaDescription: string;
}

export const PRIORITY_TOKEN_ASSETS: Record<string, PriorityTokenAsset> = {
  PEPE: {
    symbol: "PEPE",
    name: "Pepe",
    heroImage: heroPepe,
    heroAlt: "PEPE memecoin token coin emblem with green liquidity flow over candlestick chart — MRC Global Pay 2026 swap guide",
    blogSlug: "how-to-buy-pepe-2026",
    pairSlug: "pepe-usdt",
    widgetFrom: "usdt",
    widgetTo: "pepe",
    metaTitle: "How to Buy PEPE in 2026: Step-by-Step Swap Guide",
    metaDescription:
      "Buy PEPE in 2026 in under a minute — no account, $0.30 minimum, locked rate. Wallet setup, network choice, fee math & realistic price outlook from a markets analyst.",
  },
  DOGE: {
    symbol: "DOGE",
    name: "Dogecoin",
    heroImage: heroDoge,
    heroAlt: "Dogecoin (DOGE) gold coin emblem with green chart wave — MRC Global Pay 2026 buying guide",
    blogSlug: "how-to-buy-doge-2026",
    pairSlug: "doge-usdt",
    widgetFrom: "usdt",
    widgetTo: "doge",
    metaTitle: "How to Buy Dogecoin (DOGE) in 2026 | Instant Swap Guide",
    metaDescription:
      "Buy DOGE in 2026 with native chain settlement in under a minute. ETF outlook, wallet setup, fee math, and a no-nonsense risk-aware price view. No registration required.",
  },
  XRP: {
    symbol: "XRP",
    name: "XRP",
    heroImage: heroXrp,
    heroAlt: "XRP Ripple silver coin emblem with green cross-border payment arcs — MRC Global Pay 2026 XRP buying guide",
    blogSlug: "how-to-buy-xrp-2026",
    pairSlug: "xrp-usdt",
    widgetFrom: "usdt",
    widgetTo: "xrp",
    metaTitle: "How to Buy XRP in 2026: Post-ETF Settlement & Wallet Guide",
    metaDescription:
      "Buy XRP in 2026 with XRPL's 3-5s finality and the post-ETF landscape demystified. Wallet setup, destination tags explained, fee math, realistic price outlook.",
  },
  HYPE: {
    symbol: "HYPE",
    name: "Hyperliquid",
    heroImage: heroHype,
    heroAlt: "Hyperliquid HYPE token coin with motion-blur racing lines and green order-book depth — MRC Global Pay 2026 perp DEX guide",
    blogSlug: "how-to-buy-hype-hyperliquid-2026",
    pairSlug: "hype-usdt",
    widgetFrom: "usdt",
    widgetTo: "hype",
    metaTitle: "How to Buy HYPE (Hyperliquid) in 2026 | Perp DEX Guide",
    metaDescription:
      "Buy Hyperliquid (HYPE) in 2026 with HyperEVM's near-instant finality. Buybacks explained, unlock schedule, wallet setup, and 2026 outlook for the perp DEX leader.",
  },
  TAO: {
    symbol: "TAO",
    name: "Bittensor",
    heroImage: heroTao,
    heroAlt: "Bittensor TAO neural-mesh coin emblem with orbiting AI subnets and green data filaments — MRC Global Pay 2026 decentralized AI guide",
    blogSlug: "how-to-buy-tao-bittensor-2026",
    pairSlug: "tao-usdt",
    widgetFrom: "usdt",
    widgetTo: "tao",
    metaTitle: "How to Buy TAO (Bittensor) in 2026 | Decentralized AI",
    metaDescription:
      "Buy Bittensor (TAO) in 2026 — Substrate wallet setup, halving cycle, subnet revenue, and a realistic price outlook. Settles to your wallet in under 90 seconds.",
  },
  SIREN: {
    symbol: "SIREN",
    name: "SIREN",
    heroImage: heroSiren,
    heroAlt: "SIREN BEP-20 token coin emblem with green sonar pulse and contract-verification glyphs — MRC Global Pay 2026 SIREN guide",
    blogSlug: "how-to-buy-siren-2026",
    pairSlug: "siren-usdt",
    widgetFrom: "usdt",
    widgetTo: "siren",
    metaTitle: "How to Buy SIREN in 2026: Verified BEP-20 Routing Guide",
    metaDescription:
      "Buy SIREN safely in 2026 — verified BEP-20 contract, locked rate before funding, BNB Chain wallet setup, fake-token avoidance checklist, and realistic price view.",
  },
  BDAG: {
    symbol: "BDAG",
    name: "BlockDAG",
    heroImage: heroBdag,
    heroAlt: "BlockDAG BDAG coin emblem connected to a green DAG block-network mesh — MRC Global Pay 2026 BDAG buying guide",
    blogSlug: "how-to-buy-blockdag-bdag-2026",
    pairSlug: "bdag-usdt",
    widgetFrom: "usdt",
    widgetTo: "bdag",
    metaTitle: "How to Buy BlockDAG (BDAG) in 2026: Step-by-Step",
    metaDescription:
      "Buy BlockDAG (BDAG) in 2026 with aggregated DAG liquidity. Wallet setup, network selection, fee math, presale-vs-spot risks, and a realistic 2026 outlook.",
  },
};

/** Look up a priority token by either symbol (PEPE) or blog slug. */
export function getPriorityTokenByBlogSlug(slug: string): PriorityTokenAsset | undefined {
  return Object.values(PRIORITY_TOKEN_ASSETS).find((t) => t.blogSlug === slug);
}

/** Look up a priority token by pair slug (e.g. "pepe-usdt", "tao-btc"). */
export function getPriorityTokenByPairSlug(pairSlug: string): PriorityTokenAsset | undefined {
  const symbol = pairSlug.split("-")[0]?.toUpperCase();
  return symbol ? PRIORITY_TOKEN_ASSETS[symbol] : undefined;
}

/**
 * Build the homepage deep-link that pre-fills the swap widget.
 * Example: /?from=usdt&to=pepe&tab=exchange#exchange
 */
export function buildSwapDeepLink(token: PriorityTokenAsset, langPrefix: string = ""): string {
  const params = new URLSearchParams({
    from: token.widgetFrom,
    to: token.widgetTo,
    tab: "exchange",
  });
  return `${langPrefix}/?${params.toString()}#exchange`;
}
