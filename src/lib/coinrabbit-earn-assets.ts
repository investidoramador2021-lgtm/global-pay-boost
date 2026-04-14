/**
 * CoinRabbit Earn / Savings supported assets with real APY rates.
 * Sourced from https://coinrabbit.io/earn/ — updated 2026-04-14.
 */

export interface EarnAsset {
  ticker: string;
  currencyId: string;
  name: string;
  network: string;
  icon: string;
  apy: number;       // Annual Percentage Yield
  daily: number;     // daily rate = apy/365
  minUsd: number;    // minimum deposit in USD equivalent
}

function makeAsset(
  ticker: string, name: string, network: string,
  iconSlug: string, apy: number, minUsd = 100,
): EarnAsset {
  const networkMap: Record<string, string> = {
    "TRC-20": "TRX",
    "ERC-20": "ETH",
    "Polygon": "MATIC",
    "Solana": "SOL",
    "Arbitrum": "ARBITRUM",
    "Optimism": "OP",
    "Mainnet": ticker.toUpperCase() === "BTC" ? "BTC" : ticker.toUpperCase() === "ETH" ? "ETH" : network.toUpperCase(),
    "BSC": "BSC",
  };
  const normalizedNetwork = networkMap[network] ?? network.toUpperCase();
  const baseUrl = iconSlug.includes("/")
    ? `https://content-api.changenow.io/uploads/${iconSlug}`
    : `https://changenow.io/images/sprite/currencies/${iconSlug}.svg`;
  return {
    ticker,
    currencyId: `${ticker.toUpperCase()}_${normalizedNetwork}`,
    name,
    network,
    icon: baseUrl,
    apy,
    daily: +(apy / 365).toFixed(4),
    minUsd,
  };
}

export const EARN_ASSETS: EarnAsset[] = [
  // ── Stablecoins (5% APY) ──
  makeAsset("USDT",  "Tether",           "TRC-20",     "usdttrc20",                     5),
  makeAsset("USDT",  "Tether",           "ERC-20",     "usdterc20",                     5),
  makeAsset("USDT",  "Tether",           "BSC",        "usdtbsc",                       5),
  makeAsset("USDT",  "Tether",           "Polygon",    "usdtmatic_fb254b1409.svg",      5),
  makeAsset("USDC",  "USD Coin",         "Solana",     "usdcsol_9415198300.svg",        5),
  makeAsset("USDC",  "USD Coin",         "ERC-20",     "usdc",                          5),
  makeAsset("USDC",  "USD Coin",         "BSC",        "usdcbsc",                       5),
  makeAsset("USDC",  "USD Coin",         "Polygon",    "usdcmatic",                     5),
  makeAsset("USDC",  "USD Coin",         "Arbitrum",   "usdcarb",                       5),
  makeAsset("DAI",   "Dai",              "ERC-20",     "dai",                           5),
  makeAsset("BUSD",  "Binance USD",      "BSC",        "busdbsc",                       5),
  makeAsset("TUSD",  "TrueUSD",          "ERC-20",     "tusd",                          5),
  makeAsset("FRAX",  "Frax",             "ERC-20",     "frax",                          5),
  makeAsset("PYUSD", "PayPal USD",       "ERC-20",     "pyusd",                         5),

  // ── ETH & variants (1.2% APY) ──
  makeAsset("ETH",   "Ethereum",         "Mainnet",    "eth",                           1.2, 50),
  makeAsset("WETH",  "Wrapped Ether",    "Arbitrum",   "wetharb",                       1.2, 50),
  makeAsset("WETH",  "Wrapped Ether",    "Polygon",    "wethmatic",                     1.2, 50),
  makeAsset("WETH",  "Wrapped Ether",    "Optimism",   "wethop",                        1.2, 50),
  makeAsset("stETH", "Lido Staked ETH",  "ERC-20",     "steth",                         1.2, 50),

  // ── BTC & variants (0.3% APY) ──
  makeAsset("BTC",   "Bitcoin",          "Mainnet",    "btc",                           0.3, 50),
  makeAsset("WBTC",  "Wrapped Bitcoin",  "ERC-20",     "wbtceth_a6a2d856fa.svg",        0.3, 50),
  makeAsset("WBTC",  "Wrapped Bitcoin",  "Arbitrum",   "wbtcarb_9556c96313.svg",        0.3, 50),
  makeAsset("WBTC",  "Wrapped Bitcoin",  "Solana",     "wbtcsol_5ebdc07b24.svg",        0.3, 50),
  makeAsset("WBTC",  "Wrapped Bitcoin",  "Polygon",    "wbtcmatic_bf6e49dea5.svg",      0.3, 50),
  makeAsset("WBTC",  "Wrapped Bitcoin",  "Optimism",   "wbtcop_238ac4cab9.svg",         0.3, 50),

  // ── Other mid-cap (estimated rates based on CoinRabbit tiers) ──
  makeAsset("SOL",   "Solana",           "Mainnet",    "sol",                           1.5, 25),
  makeAsset("BNB",   "BNB",              "BSC",        "bnb",                           1.0, 50),
  makeAsset("XRP",   "XRP",              "Mainnet",    "xrp",                           1.0, 50),
  makeAsset("ADA",   "Cardano",          "Mainnet",    "ada",                           1.0, 50),
  makeAsset("DOT",   "Polkadot",         "Mainnet",    "dot",                           1.5, 50),
  makeAsset("AVAX",  "Avalanche",        "C-Chain",    "avax",                          1.5, 50),
  makeAsset("LINK",  "Chainlink",        "ERC-20",     "link",                          1.0, 50),
  makeAsset("MATIC", "Polygon",          "Mainnet",    "matic",                         1.5, 50),
  makeAsset("ATOM",  "Cosmos",           "Mainnet",    "atom",                          1.5, 50),
  makeAsset("LTC",   "Litecoin",         "Mainnet",    "ltc",                           0.5, 50),
  makeAsset("TRX",   "TRON",             "Mainnet",    "trx",                           2.0, 25),
  makeAsset("TON",   "Toncoin",          "Mainnet",    "ton",                           1.5, 25),
  makeAsset("DOGE",  "Dogecoin",         "Mainnet",    "doge",                          0.5, 25),
  makeAsset("SHIB",  "Shiba Inu",        "ERC-20",     "shib",                          0.5, 25),
  makeAsset("UNI",   "Uniswap",          "ERC-20",     "uni",                           1.0, 50),
  makeAsset("AAVE",  "Aave",             "ERC-20",     "aave",                          1.0, 50),
  makeAsset("NEAR",  "NEAR Protocol",    "Mainnet",    "near",                          1.5, 25),
  makeAsset("SUI",   "Sui",              "Mainnet",    "sui",                           1.5, 25),
  makeAsset("APT",   "Aptos",            "Mainnet",    "apt",                           1.5, 25),
  makeAsset("ARB",   "Arbitrum",         "Mainnet",    "arb",                           1.0, 25),
  makeAsset("OP",    "Optimism",         "Mainnet",    "op",                            1.0, 25),
  makeAsset("FIL",   "Filecoin",         "Mainnet",    "fil",                           1.0, 50),
  makeAsset("INJ",   "Injective",        "Mainnet",    "inj",                           1.5, 25),
  makeAsset("TIA",   "Celestia",         "Mainnet",    "tia",                           1.5, 25),
  makeAsset("RENDER","Render Token",     "ERC-20",     "render",                        1.0, 25),
  makeAsset("FET",   "Fetch.ai",         "ERC-20",     "fet",                           1.0, 25),
  makeAsset("PEPE",  "Pepe",             "ERC-20",     "pepe",                          0.5, 25),
];

/** Deduplicated by unique ticker+network key */
export const EARN_ASSETS_UNIQUE_KEY = (a: EarnAsset) => `${a.ticker}-${a.network}`;

/** Top assets sorted by APY descending */
export const TOP_EARN_ASSETS = [...EARN_ASSETS]
  .sort((a, b) => b.apy - a.apy);
