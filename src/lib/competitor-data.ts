export interface Competitor {
  id: string;
  slug: string;
  name: string;
  min_swap_usd: string;
  kyc_policy: string;
  avg_speed: string;
  fees: string;
  primary_weakness: string;
  mrc_advantage: string;
}

// Static fallback for SSR/crawler visibility — kept in sync with DB
export const COMPETITORS: Competitor[] = [
  { id: "1", slug: "changenow", name: "ChangeNOW", min_swap_usd: "10.00", kyc_policy: "Risk-based/Tiered", avg_speed: "< 1 min", fees: "0.5% - 4%", primary_weakness: "High minimums for dust", mrc_advantage: "MRC swaps from $0.30 (33x lower)" },
  { id: "2", slug: "changelly", name: "Changelly", min_swap_usd: "20.00", kyc_policy: "Tiered/Email", avg_speed: "2 - 30 min", fees: "0.25% - 5%", primary_weakness: "Hidden fees on small amounts", mrc_advantage: "Lower minimums and flat fees" },
  { id: "3", slug: "simpleswap", name: "SimpleSwap", min_swap_usd: "15.00", kyc_policy: "No Account", avg_speed: "5 - 15 min", fees: "Variable", primary_weakness: "No micro-swap support", mrc_advantage: "Specialized in wallet dust cleaning" },
  { id: "4", slug: "stealthex", name: "StealthEX", min_swap_usd: "15.00", kyc_policy: "No Account", avg_speed: "5 - 30 min", fees: "Variable", primary_weakness: "Limited support for micro-caps", mrc_advantage: "Instant settlement for all sizes" },
  { id: "5", slug: "exolix", name: "Exolix", min_swap_usd: "20.00", kyc_policy: "No Account", avg_speed: "10 - 60 min", fees: "Fixed", primary_weakness: "Slow confirmation times", mrc_advantage: "60-second settlement cycles" },
  { id: "6", slug: "fixedfloat", name: "FixedFloat", min_swap_usd: "5.00", kyc_policy: "No Account", avg_speed: "1 - 10 min", fees: "0.5% - 1%", primary_weakness: "Limited network support", mrc_advantage: "Broader multi-chain liquidity" },
  { id: "7", slug: "houdiniswap", name: "HoudiniSwap", min_swap_usd: "20.00", kyc_policy: "Privacy Focus", avg_speed: "20 min", fees: "Variable", primary_weakness: "High privacy premiums", mrc_advantage: "Cost-effective non-custodial swaps" },
  { id: "8", slug: "sideshift", name: "SideShift.ai", min_swap_usd: "10.00", kyc_policy: "No Account", avg_speed: "2 - 10 min", fees: "Variable", primary_weakness: "Restricted in certain regions", mrc_advantage: "Global access with no geo-blocks" },
  { id: "9", slug: "trocador", name: "Trocador", min_swap_usd: "15.00", kyc_policy: "No Account", avg_speed: "5 - 20 min", fees: "Variable", primary_weakness: "Complex interface for novices", mrc_advantage: "Simple 3-step swap process" },
  { id: "10", slug: "binance", name: "Binance", min_swap_usd: "10.00", kyc_policy: "Mandatory ID Verification", avg_speed: "Instant", fees: "0.1%", primary_weakness: "Mandatory identity verification and complexity", mrc_advantage: "No account required / Permissionless" },
  { id: "11", slug: "coinbase", name: "Coinbase", min_swap_usd: "10.00", kyc_policy: "Mandatory ID Verification", avg_speed: "Instant", fees: "0.6% - 4%", primary_weakness: "Confusing fee structure", mrc_advantage: "Transparent all-in-one pricing" },
  { id: "12", slug: "kraken", name: "Kraken", min_swap_usd: "10.00", kyc_policy: "Mandatory ID Verification", avg_speed: "Instant", fees: "0.1% - 1.5%", primary_weakness: "Strict withdrawal limits", mrc_advantage: "Direct wallet-to-wallet settlement" },
  { id: "13", slug: "kucoin", name: "KuCoin", min_swap_usd: "10.00", kyc_policy: "Mandatory ID Verification", avg_speed: "Instant", fees: "0.1%", primary_weakness: "Complex UI for simple swaps", mrc_advantage: "Focus on speed and utility" },
  { id: "14", slug: "mexc", name: "MEXC", min_swap_usd: "10.00", kyc_policy: "Mandatory ID Verification", avg_speed: "Instant", fees: "0.0% - 0.1%", primary_weakness: "High withdrawal fees", mrc_advantage: "No hidden withdrawal costs" },
  { id: "15", slug: "bybit", name: "Bybit", min_swap_usd: "10.00", kyc_policy: "Mandatory ID Verification", avg_speed: "Instant", fees: "0.1%", primary_weakness: "Derivative focus is confusing", mrc_advantage: "Clean spot-swap experience" },
  { id: "16", slug: "gate-io", name: "Gate.io", min_swap_usd: "10.00", kyc_policy: "Mandatory ID Verification", avg_speed: "Instant", fees: "0.2%", primary_weakness: "Excessive asset list is noisy", mrc_advantage: "Curated high-liquidity assets" },
  { id: "17", slug: "okx", name: "OKX", min_swap_usd: "10.00", kyc_policy: "Mandatory ID Verification", avg_speed: "Instant", fees: "0.1%", primary_weakness: "Web3 wallet is often buggy", mrc_advantage: "Reliable API-driven infrastructure" },
  { id: "18", slug: "uphold", name: "Uphold", min_swap_usd: "1.00", kyc_policy: "Mandatory ID Verification", avg_speed: "Instant", fees: "1.4% - 5%", primary_weakness: "High spreads on assets", mrc_advantage: "Lower spreads on micro-trades" },
  { id: "19", slug: "gemini", name: "Gemini", min_swap_usd: "10.00", kyc_policy: "Mandatory ID Verification", avg_speed: "Instant", fees: "0.4% - 1.5%", primary_weakness: "Very high fees for small buys", mrc_advantage: "Micro-swap specialist" },
  { id: "20", slug: "bitget", name: "Bitget", min_swap_usd: "10.00", kyc_policy: "Mandatory ID Verification", avg_speed: "Instant", fees: "0.1%", primary_weakness: "Focus on copy-trading", mrc_advantage: "Focus on instant utility" },
  { id: "21", slug: "htx", name: "HTX", min_swap_usd: "10.00", kyc_policy: "Mandatory ID Verification", avg_speed: "Instant", fees: "0.2%", primary_weakness: "History of security concerns", mrc_advantage: "Canadian MSB Regulated & Secure" },
  { id: "22", slug: "phemex", name: "Phemex", min_swap_usd: "10.00", kyc_policy: "Mandatory ID Verification", avg_speed: "Instant", fees: "0.1%", primary_weakness: "Limited fiat support", mrc_advantage: "Deep crypto-to-crypto liquidity" },
  { id: "23", slug: "uniswap", name: "Uniswap", min_swap_usd: "Variable", kyc_policy: "No Account Required", avg_speed: "Block Time", fees: "Gas + 0.3%", primary_weakness: "Extreme gas fees on ETH", mrc_advantage: "Fixed fees with no gas surprises" },
  { id: "24", slug: "pancakeswap", name: "PancakeSwap", min_swap_usd: "Variable", kyc_policy: "No Account Required", avg_speed: "3s - 15s", fees: "0.25%", primary_weakness: "Limited to BSC/ETH/ARB", mrc_advantage: "Cross-chain native swaps" },
  { id: "25", slug: "jupiter", name: "Jupiter", min_swap_usd: "Variable", kyc_policy: "No Account Required", avg_speed: "Instant", fees: "Variable", primary_weakness: "Solana-ecosystem only", mrc_advantage: "Multi-chain (BTC/ETH/SOL/LTC)" },
  { id: "26", slug: "1inch", name: "1inch", min_swap_usd: "Variable", kyc_policy: "No Account Required", avg_speed: "Variable", fees: "Variable", primary_weakness: "Complex aggregator interface", mrc_advantage: "Unified liquidity for best rates" },
  { id: "27", slug: "thorchain", name: "THORChain", min_swap_usd: "50.00", kyc_policy: "No Account Required", avg_speed: "10 - 20 min", fees: "Network Fees", primary_weakness: "High native swap minimums", mrc_advantage: "Lowest native BTC/ETH minimums" },
  { id: "28", slug: "stargate", name: "Stargate Finance", min_swap_usd: "10.00", kyc_policy: "No Account Required", avg_speed: "2 - 5 min", fees: "0.06%", primary_weakness: "Stablecoin focus only", mrc_advantage: "6,000+ volatile & stable assets" },
  { id: "29", slug: "across", name: "Across Protocol", min_swap_usd: "20.00", kyc_policy: "No Account Required", avg_speed: "1 - 3 min", fees: "Variable", primary_weakness: "Bridge-only limitations", mrc_advantage: "Full swap functionality" },
  { id: "30", slug: "orbiter", name: "Orbiter Finance", min_swap_usd: "10.00", kyc_policy: "No Account Required", avg_speed: "1 min", fees: "Variable", primary_weakness: "L2-to-L1 focus only", mrc_advantage: "Universal chain support" },
  { id: "31", slug: "layerswap", name: "Layerswap", min_swap_usd: "20.00", kyc_policy: "No Account Required", avg_speed: "2 - 5 min", fees: "Variable", primary_weakness: "CEX-to-Wallet focus", mrc_advantage: "Wallet-to-Wallet focus" },
  { id: "32", slug: "shakepay", name: "Shakepay", min_swap_usd: "10.00", kyc_policy: "Mandatory ID Verification", avg_speed: "Instant", fees: "Spread-based", primary_weakness: "Only BTC/ETH supported", mrc_advantage: "6,000+ token support" },
  { id: "33", slug: "ndax", name: "NDAX.io", min_swap_usd: "10.00", kyc_policy: "Mandatory ID Verification", avg_speed: "Instant", fees: "0.2%", primary_weakness: "Limited trading pairs", mrc_advantage: "Massive asset variety" },
  { id: "34", slug: "bitbuy", name: "Bitbuy", min_swap_usd: "10.00", kyc_policy: "Mandatory ID Verification", avg_speed: "Instant", fees: "0.5%", primary_weakness: "High fee for small trades", mrc_advantage: "Optimized for micro-swaps" },
  { id: "35", slug: "wealthsimple", name: "Wealthsimple", min_swap_usd: "1.00", kyc_policy: "Mandatory ID Verification", avg_speed: "Instant", fees: "1.5% - 2%", primary_weakness: "Custodial (can't withdraw easily)", mrc_advantage: "Non-custodial (your keys)" },
  { id: "36", slug: "newton", name: "Newton.co", min_swap_usd: "10.00", kyc_policy: "Mandatory ID Verification", avg_speed: "Instant", fees: "1.0% - 2%", primary_weakness: "High spreads on micro-caps", mrc_advantage: "Competitive real-time rates" },
  { id: "37", slug: "coinsquare", name: "Coinsquare", min_swap_usd: "10.00", kyc_policy: "Mandatory ID Verification", avg_speed: "Instant", fees: "Spread-based", primary_weakness: "Outdated mobile experience", mrc_advantage: "Mobile-first optimized UI" },
  { id: "38", slug: "virgocx", name: "VirgoCX", min_swap_usd: "10.00", kyc_policy: "Mandatory ID Verification", avg_speed: "Instant", fees: "0.95%", primary_weakness: "Limited liquidity for swaps", mrc_advantage: "Aggregated global liquidity" },
  { id: "39", slug: "netcoins", name: "Netcoins", min_swap_usd: "10.00", kyc_policy: "Mandatory ID Verification", avg_speed: "Instant", fees: "0.5%", primary_weakness: "Corporate focus lacks agility", mrc_advantage: "Retail-friendly micro-tools" },
  { id: "40", slug: "paytrie", name: "Paytrie", min_swap_usd: "5.00", kyc_policy: "Mandatory ID Verification", avg_speed: "5 - 10 min", fees: "0.6%", primary_weakness: "Stablecoin only", mrc_advantage: "Swap any asset instantly" },
  { id: "41", slug: "letsexchange", name: "LetsExchange", min_swap_usd: "15.00", kyc_policy: "No Account Required", avg_speed: "5 - 15 min", fees: "Variable", primary_weakness: "Slow customer support", mrc_advantage: "24/7 dedicated assistance" },
  { id: "42", slug: "godex", name: "Godex.io", min_swap_usd: "20.00", kyc_policy: "No Account Required", avg_speed: "5 - 30 min", fees: "Fixed", primary_weakness: "Limited coin selection", mrc_advantage: "6,000+ assets available" },
  { id: "43", slug: "swapsystems", name: "SwapSystems", min_swap_usd: "15.00", kyc_policy: "No Account Required", avg_speed: "10 min", fees: "Variable", primary_weakness: "Unclear fee structure", mrc_advantage: "100% Transparent pricing" },
  { id: "44", slug: "changenow-pro", name: "ChangeNOW Pro", min_swap_usd: "50.00", kyc_policy: "Business Verification", avg_speed: "Instant", fees: "API Fees", primary_weakness: "Not for individual retail", mrc_advantage: "Built for retail and pro users" },
  { id: "45", slug: "rocketexchange", name: "RocketExchange", min_swap_usd: "10.00", kyc_policy: "No Account Required", avg_speed: "5 min", fees: "Variable", primary_weakness: "Frequent downtime", mrc_advantage: "99.9% Uptime guarantee" },
  { id: "46", slug: "majesticbank", name: "MajesticBank", min_swap_usd: "20.00", kyc_policy: "No Account Required", avg_speed: "20 min", fees: "Variable", primary_weakness: "High privacy tax", mrc_advantage: "Private but affordable" },
  { id: "47", slug: "tradeogre", name: "TradeOgre", min_swap_usd: "5.00", kyc_policy: "No Account Required", avg_speed: "Variable", fees: "0.2%", primary_weakness: "Outdated '90s UI", mrc_advantage: "Modern 2026 FinTech UI" },
  { id: "48", slug: "orangefren", name: "OrangeFren", min_swap_usd: "10.00", kyc_policy: "No Account Required", avg_speed: "Variable", fees: "Variable", primary_weakness: "Aggregator only", mrc_advantage: "Direct liquidity provider" },
  { id: "49", slug: "xchange-me", name: "XChange.me", min_swap_usd: "15.00", kyc_policy: "No Account Required", avg_speed: "10 - 20 min", fees: "Variable", primary_weakness: "Low liquidity for big pairs", mrc_advantage: "Institutional grade liquidity" },
  { id: "50", slug: "elude", name: "Elude.in", min_swap_usd: "20.00", kyc_policy: "No Account Required", avg_speed: "30 min", fees: "Variable", primary_weakness: "Very slow processing", mrc_advantage: "Sub-60s settlement" },
];

export const getCompetitorBySlug = (slug: string): Competitor | undefined =>
  COMPETITORS.find((c) => c.slug === slug);

export const getRandomCompetitors = (excludeSlug: string, count = 4): Competitor[] => {
  const others = COMPETITORS.filter((c) => c.slug !== excludeSlug);
  const shuffled = [...others].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
