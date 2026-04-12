export interface SwapSolution {
  from_token: string;
  to_token: string;
  slug: string;
  use_case: string;
  min_amount_usd: string;
  network_advantage: string;
}

export const SWAP_SOLUTIONS: SwapSolution[] = [
  { from_token: "BTC", to_token: "USDC", slug: "btc-to-usdc", use_case: "Macro-Hedging Dust", min_amount_usd: "0.30", network_advantage: "Instant settlement into regulated USDC" },
  { from_token: "BTC", to_token: "USDT", slug: "btc-to-usdt", use_case: "Global Liquidity", min_amount_usd: "0.30", network_advantage: "Deepest liquidity via TRON/ETH rails" },
  { from_token: "BTC", to_token: "SOL", slug: "btc-to-sol", use_case: "Wallet Migration", min_amount_usd: "0.30", network_advantage: "Low-cost entry to Solana ecosystem" },
  { from_token: "ETH", to_token: "USDT", slug: "eth-to-usdt", use_case: "Gas Optimization", min_amount_usd: "0.30", network_advantage: "Save small balances from high ETH fees" },
  { from_token: "ETH", to_token: "SOL", slug: "eth-to-sol", use_case: "Cross-Chain Bridge", min_amount_usd: "0.30", network_advantage: "Fastest path from EVM to Solana" },
  { from_token: "SOL", to_token: "USDC", slug: "sol-to-usdc", use_case: "DePIN Ecosystem", min_amount_usd: "0.30", network_advantage: "Direct bridge to Solana-native stable payments" },
  { from_token: "XRP", to_token: "USDT", slug: "xrp-to-usdt", use_case: "Remittance Remnants", min_amount_usd: "0.30", network_advantage: "Fast micro-offramping for leftover XRP" },
  { from_token: "LTC", to_token: "BTC", slug: "ltc-to-btc", use_case: "Silver to Gold", min_amount_usd: "0.30", network_advantage: "The 'Digital Silver' micro-swap standard" },
  { from_token: "TRX", to_token: "USDT", slug: "trx-to-usdt", use_case: "Stablecoin Native", min_amount_usd: "0.30", network_advantage: "Industry-leading low-fee TRON micro-swaps" },
  { from_token: "HYPE", to_token: "USDT", slug: "hype-to-usdt", use_case: "Trend Capturing", min_amount_usd: "0.30", network_advantage: "Instant liquidity for Hyperliquid assets" },
  { from_token: "BERA", to_token: "USDT", slug: "bera-to-usdt", use_case: "Ecosystem Entry", min_amount_usd: "0.30", network_advantage: "Low-minimum access to Berachain assets" },
  { from_token: "DOGE", to_token: "BTC", slug: "doge-to-btc", use_case: "Profit Taking", min_amount_usd: "0.30", network_advantage: "Convert small meme gains to blue-chip" },
  { from_token: "BONK", to_token: "SOL", slug: "bonk-to-sol", use_case: "Dust Cleaning", min_amount_usd: "0.30", network_advantage: "Convert leftover meme dust back to SOL" },
  { from_token: "PEPE", to_token: "USDC", slug: "pepe-to-usdc", use_case: "De-risking Dust", min_amount_usd: "0.30", network_advantage: "Secure small meme gains instantly" },
  { from_token: "XMR", to_token: "ETH", slug: "xmr-to-eth", use_case: "Privacy Bridge", min_amount_usd: "0.30", network_advantage: "Non-custodial privacy-to-utility swaps" },
  { from_token: "SHIB", to_token: "USDT", slug: "shib-to-usdt", use_case: "Community Swap", min_amount_usd: "0.30", network_advantage: "High-speed SHIB micro-settlements" },
  { from_token: "SOL", to_token: "ONDO", slug: "sol-to-ondo", use_case: "RWA Yield Access", min_amount_usd: "0.30", network_advantage: "Instant access to tokenized US Treasury yields on Solana" },
  { from_token: "SOL", to_token: "NOS", slug: "sol-to-nos", use_case: "AI GPU Compute", min_amount_usd: "0.30", network_advantage: "Swap into decentralized GPU inference on Solana from $0.30" },
  { from_token: "SOL", to_token: "JUPSOL", slug: "sol-to-jupsol", use_case: "Liquid Staking", min_amount_usd: "0.30", network_advantage: "Earn staking yield with full liquidity via Jupiter LST" },
  { from_token: "USDC", to_token: "USDT", slug: "usdc-zksync-to-usdt", use_case: "ZkSync Micro-Swap", min_amount_usd: "0.30", network_advantage: "Near-instant settlement via ZK Rollups with negligible gas" },
  { from_token: "USDS", to_token: "USDC", slug: "usds-to-usdc", use_case: "Stablecoin Bridge", min_amount_usd: "0.30", network_advantage: "Sky ecosystem stable directly bridged to USDC" },
  { from_token: "CAKE", to_token: "USDT", slug: "cake-aptos-to-usdt", use_case: "Aptos Cross-Chain", min_amount_usd: "0.30", network_advantage: "One-click CAKE exit from Aptos to stablecoins" },
  { from_token: "EDGE", to_token: "ETH", slug: "edge-to-eth", use_case: "Trading Liquidity", min_amount_usd: "0.30", network_advantage: "Direct edgeX-to-ETH settlement on Ethereum" },
];

export function getSolutionBySlug(slug: string): SwapSolution | undefined {
  return SWAP_SOLUTIONS.find((s) => s.slug === slug);
}

export function getRandomSolutions(excludeSlug: string, count: number): SwapSolution[] {
  const others = SWAP_SOLUTIONS.filter((s) => s.slug !== excludeSlug);
  const shuffled = [...others].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
