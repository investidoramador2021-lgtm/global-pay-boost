export interface SeoKeyword {
  keyword: string;
  intentType: "Commercial" | "Informational" | "Utility";
  targetUrl: string;
  primaryH1: string;
  benefitHook: string;
  cluster: string;
}

function getCluster(keyword: string, url: string): string {
  if (/solana|sol/i.test(keyword)) return "solana";
  if (/bitcoin|btc|bsv/i.test(keyword)) return "bitcoin";
  if (/monero|xmr/i.test(keyword)) return "monero";
  if (/litecoin|ltc/i.test(keyword)) return "litecoin";
  if (/ether|eth|erc20/i.test(keyword)) return "ethereum";
  if (/xrp|ripple/i.test(keyword)) return "xrp";
  if (/usdt|usdc|tether|stablecoin/i.test(keyword)) return "stablecoin";
  if (/bnb|binance/i.test(keyword)) return "bnb";
  if (/meme|trump|shiba|vinu|alpaca/i.test(keyword)) return "meme";
  if (/trx|tron/i.test(keyword)) return "tron";
  if (/dag/i.test(keyword)) return "dag";
  if (/bridge|pulsechain/i.test(keyword)) return "bridge";
  if (/wallet|tangem|dgb/i.test(keyword)) return "wallet";
  if (url.includes("/guides/") || url.includes("/tools/")) return "guides";
  return "general";
}

export const seoKeywords = [
  { keyword: "usdt to trx", intentType: "Commercial", targetUrl: "/swap/usdt-to-trx", primaryH1: "Swap USDT to TRX Instantly", benefitHook: "Fastest Tron bridge with $0.30 minimum." },
  { keyword: "buy and send bitcoin no verification reddit", intentType: "Commercial", targetUrl: "/buy/bitcoin-no-verification", primaryH1: "Buy Bitcoin No Verification (Reddit Choice)", benefitHook: "Non-custodial and accountless execution." },
  { keyword: "usd to xmr", intentType: "Commercial", targetUrl: "/swap/usd-to-xmr", primaryH1: "Exchange USD to Monero (XMR)", benefitHook: "High-privacy Monero swaps with no KYC." },
  { keyword: "usdt to sol", intentType: "Commercial", targetUrl: "/swap/usdt-to-sol", primaryH1: "Convert USDT to Solana (SOL)", benefitHook: "Low-fee Solana ecosystem entry." },
  { keyword: "coin exchange near me", intentType: "Commercial", targetUrl: "/local-crypto-exchange", primaryH1: "Best Digital Coin Exchange Near Me", benefitHook: "The global alternative to local kiosks." },
  { keyword: "is solana a good investment", intentType: "Informational", targetUrl: "/guides/is-solana-a-good-investment", primaryH1: "Is Solana a Good Investment in 2026?", benefitHook: "Market analysis plus instant SOL swap tool." },
  { keyword: "ltc transaction tracker", intentType: "Utility", targetUrl: "/tools/ltc-tracker", primaryH1: "Litecoin (LTC) Transaction Tracker", benefitHook: "Track and swap Litecoin in one dashboard." },
  { keyword: "best way to buy monero no kyc", intentType: "Commercial", targetUrl: "/buy/monero-no-kyc", primaryH1: "Best Way to Buy Monero (No KYC)", benefitHook: "Secure and anonymous XMR swapping." },
  { keyword: "eth to sol", intentType: "Commercial", targetUrl: "/swap/eth-to-sol", primaryH1: "Swap ETH to SOL Bridge", benefitHook: "Instant Ethereum to Solana cross-chain bridge." },
  { keyword: "buy solana no kyc", intentType: "Commercial", targetUrl: "/buy/solana-no-kyc", primaryH1: "Buy Solana with No KYC", benefitHook: "Non-custodial SOL swaps starting at $0.30." },
  { keyword: "can i send wrapped bitcoin to a bitcoin wallet", intentType: "Informational", targetUrl: "/guides/wrapped-btc-to-bitcoin", primaryH1: "Can I Send Wrapped BTC to a BTC Wallet?", benefitHook: "Technical guide for cross-chain safety." },
  { keyword: "exchange iu", intentType: "Commercial", targetUrl: "/exchange-iu", primaryH1: "Exchange IU Crypto Portal", benefitHook: "Dedicated entry for IU ecosystem assets." },
  { keyword: "how to buy xmr from orenge fren", intentType: "Commercial", targetUrl: "/guides/buy-xmr-orange-fren-alternative", primaryH1: "How to Buy XMR: The Orange Fren Alternative", benefitHook: "Better rates and lower minimums than Orange Fren." },
  { keyword: "litecoin mining", intentType: "Informational", targetUrl: "/guides/litecoin-mining", primaryH1: "Litecoin Mining Guide 2026", benefitHook: "Mine LTC and swap rewards instantly." },
  { keyword: "solana to idr", intentType: "Commercial", targetUrl: "/swap/solana-to-idr", primaryH1: "Convert Solana to IDR (Rupiah)", benefitHook: "Localized rates for the Indonesian market." },
  { keyword: "usdt to ltc", intentType: "Commercial", targetUrl: "/swap/usdt-to-ltc", primaryH1: "Swap USDT to Litecoin (LTC)", benefitHook: "Instant stablecoin to LTC exit." },
  { keyword: "usdt to solana", intentType: "Commercial", targetUrl: "/swap/usdt-to-solana", primaryH1: "USDT to Solana Swap Portal", benefitHook: "Fastest SPL-token bridge." },
  { keyword: "bnb meme coin trading platform", intentType: "Commercial", targetUrl: "/trade/bnb-meme-coins", primaryH1: "Best BNB Meme Coin Trading Platform", benefitHook: "Trade the latest BSC memes with zero lag." },
  { keyword: "buy solana with paypal", intentType: "Commercial", targetUrl: "/buy/solana-paypal", primaryH1: "Buy Solana (SOL) with PayPal", benefitHook: "Easy checkout for instant Solana swaps." },
  { keyword: "how to buy litecoin", intentType: "Informational", targetUrl: "/guides/how-to-buy-litecoin", primaryH1: "How to Buy Litecoin (LTC) Fast", benefitHook: "Step-by-step onboarding for new traders." },
  { keyword: "instant rate of change", intentType: "Informational", targetUrl: "/tools/instant-rate-change", primaryH1: "Instant Rate of Change Tracker", benefitHook: "Real-time volatility and swap metrics." },
  { keyword: "jambo solana", intentType: "Commercial", targetUrl: "/ecosystem/jambo-solana", primaryH1: "Jambo Solana Bridge", benefitHook: "Specialized support for Jambo ecosystem." },
  { keyword: "litecoin tracker", intentType: "Utility", targetUrl: "/tools/litecoin-tracker", primaryH1: "Litecoin Network & Price Tracker", benefitHook: "Real-time LTC monitoring and exchange." },
  { keyword: "usdc solana", intentType: "Commercial", targetUrl: "/swap/usdc-solana", primaryH1: "Convert USDC to Solana (SOL)", benefitHook: "Stablecoin-to-Solana liquidity portal." },
  { keyword: "which crypto to buy today for short-term", intentType: "Informational", targetUrl: "/guides/best-short-term-crypto", primaryH1: "Which Crypto to Buy Today?", benefitHook: "Top short-term picks with instant swap links." },
  { keyword: "bnb to sol", intentType: "Commercial", targetUrl: "/swap/bnb-to-sol", primaryH1: "Swap BNB to Solana (SOL)", benefitHook: "Cross-chain BSC to Solana bridge." },
  { keyword: "dag crypto", intentType: "Informational", targetUrl: "/ecosystem/dag-crypto", primaryH1: "DAG Crypto Protocol Guide", benefitHook: "Information on Directed Acyclic Graph assets." },
  { keyword: "tangem wallet review", intentType: "Informational", targetUrl: "/reviews/tangem-wallet", primaryH1: "Tangem Wallet Review 2026", benefitHook: "Hardware security paired with instant swaps." },
  { keyword: "topper crypto", intentType: "Commercial", targetUrl: "/alternatives/topper-crypto", primaryH1: "Better Alternative to Topper Crypto", benefitHook: "Lower fees and higher privacy than Topper." },
  { keyword: "buy bitcoin without kyc", intentType: "Commercial", targetUrl: "/buy/bitcoin-no-kyc", primaryH1: "Buy Bitcoin Without KYC", benefitHook: "Guaranteed privacy-first BTC swapping." },
  { keyword: "harmony one price", intentType: "Informational", targetUrl: "/price/harmony-one", primaryH1: "Harmony (ONE) Price & Swap", benefitHook: "Live ONE tracking and instant exchange." },
  { keyword: "how to mine litecoin", intentType: "Informational", targetUrl: "/guides/how-to-mine-litecoin", primaryH1: "How to Mine Litecoin (Step-by-Step)", benefitHook: "Mining resources and profit-swap tools." },
  { keyword: "bnb swap", intentType: "Commercial", targetUrl: "/swap/bnb", primaryH1: "Instant BNB Swap Service", benefitHook: "No-account Binance Chain exchange." },
  { keyword: "dags coins", intentType: "Informational", targetUrl: "/ecosystem/dag-coins", primaryH1: "Investing in DAG Coins", benefitHook: "A list of the top DAG-based assets." },
  { keyword: "dusd portal", intentType: "Commercial", targetUrl: "/ecosystem/dusd", primaryH1: "DUSD Stablecoin Portal", benefitHook: "Gateway for Decentralized USD swaps." },
  { keyword: "how to trade meme coins", intentType: "Informational", targetUrl: "/guides/how-to-trade-meme-coins", primaryH1: "How to Trade Meme Coins Successfully", benefitHook: "Risk management and instant trading tools." },
  { keyword: "usdc sol", intentType: "Commercial", targetUrl: "/swap/usdc-sol", primaryH1: "USDC to SOL Instant Swap", benefitHook: "High-speed stablecoin conversion." },
  { keyword: "pulsechain bridge", intentType: "Commercial", targetUrl: "/bridge/pulsechain", primaryH1: "PulseChain Bridge & Swap", benefitHook: "Instant access to the PulseChain ecosystem." },
  { keyword: "swap bot login", intentType: "Utility", targetUrl: "/tools/swap-bot", primaryH1: "Crypto Swap Bot Login", benefitHook: "Manage your automated trading bot." },
  { keyword: "tether pro", intentType: "Commercial", targetUrl: "/ecosystem/tether-pro", primaryH1: "Tether Pro Advanced Swaps", benefitHook: "High-volume USDT liquidity for pros." },
  { keyword: "where can i purchase ether", intentType: "Commercial", targetUrl: "/buy/ethereum", primaryH1: "Where to Purchase Ether (ETH)", benefitHook: "Direct and fast Ethereum entry points." },
  { keyword: "24. swap nodes in pairs", intentType: "Informational", targetUrl: "/guides/swap-nodes-in-pairs", primaryH1: "24. Swap Nodes in Pairs Explained", benefitHook: "Technical guide for blockchain developers." },
  { keyword: "buy solana without kyc", intentType: "Commercial", targetUrl: "/buy/solana-no-verification", primaryH1: "Buy Solana Without KYC", benefitHook: "Immediate and private SOL access." },
  { keyword: "kraken monero", intentType: "Commercial", targetUrl: "/alternatives/kraken-monero", primaryH1: "Kraken Monero Alternative", benefitHook: "The non-custodial way to swap XMR." },
  { keyword: "usdt erc20 meaning", intentType: "Informational", targetUrl: "/guides/usdt-erc20-meaning", primaryH1: "What is USDT ERC20?", benefitHook: "Educational breakdown of Ethereum USDT." },
  { keyword: "usdt swap trx", intentType: "Commercial", targetUrl: "/swap/usdt-trx-instant", primaryH1: "Instant USDT to TRX Swap", benefitHook: "Fastest Tron network liquidity." },
  { keyword: "where can i buy ether", intentType: "Commercial", targetUrl: "/buy/ether-instant", primaryH1: "Where to Buy Ether Instantly", benefitHook: "Top-rated no-KYC ETH platforms." },
  { keyword: "where can i buy xdc", intentType: "Commercial", targetUrl: "/buy/xdc", primaryH1: "Where to Buy XDC Network", benefitHook: "Instant exchange for XDC assets." },
  { keyword: "binance vinu", intentType: "Commercial", targetUrl: "/swap/vinu", primaryH1: "Binance Vita Inu (VINU) Swap", benefitHook: "Trade VINU with zero account required." },
  { keyword: "bridge eth to solana", intentType: "Commercial", targetUrl: "/bridge/eth-to-sol", primaryH1: "Bridge ETH to Solana (SOL)", benefitHook: "Native cross-chain Ethereum bridging." },
  { keyword: "best ripple wallet", intentType: "Informational", targetUrl: "/reviews/best-ripple-wallet", primaryH1: "Best Ripple (XRP) Wallets 2026", benefitHook: "Secure storage and instant XRP swapping." },
  { keyword: "trump/sol", intentType: "Commercial", targetUrl: "/trade/trump-sol", primaryH1: "Trade Trump (SOL) Meme Coin", benefitHook: "Instant liquidity for Trump-themed SOL tokens." },
  { keyword: "the holo exchange", intentType: "Commercial", targetUrl: "/alternatives/holo-exchange", primaryH1: "Alternative to Holo Exchange", benefitHook: "Higher limits and faster settlements." },
  { keyword: "sol wallet tracker", intentType: "Utility", targetUrl: "/tools/sol-wallet-tracker", primaryH1: "Solana Wallet Portfolio Tracker", benefitHook: "Monitor and swap SOL assets in real-time." },
  { keyword: "shiba inu zero-fee debit", intentType: "Commercial", targetUrl: "/ecosystem/shiba-inu-card", primaryH1: "Shiba Inu Zero-Fee Debit Card", benefitHook: "Integrate your SHIB into daily spending." },
  { keyword: "paypal to ltc", intentType: "Commercial", targetUrl: "/buy/ltc-paypal", primaryH1: "Convert PayPal to Litecoin (LTC)", benefitHook: "The easiest way to get LTC via PayPal." },
  { keyword: "xcoins io", intentType: "Commercial", targetUrl: "/alternatives/xcoins", primaryH1: "Better Alternative to Xcoins", benefitHook: "Non-custodial swaps with lower fees." },
  { keyword: "xmr to eth", intentType: "Commercial", targetUrl: "/swap/xmr-to-eth", primaryH1: "Swap Monero (XMR) to Ethereum (ETH)", benefitHook: "Private-to-Public asset bridge." },
  { keyword: "shiba to usdt", intentType: "Commercial", targetUrl: "/swap/shiba-to-usdt", primaryH1: "Convert Shiba Inu (SHIB) to USDT", benefitHook: "Exit meme coins into stable liquidity." },
  { keyword: "dgb wallet", intentType: "Informational", targetUrl: "/reviews/dgb-wallet", primaryH1: "Best DigiByte (DGB) Wallets", benefitHook: "Store and trade DGB assets securely." },
  { keyword: "bitcoin sv wallet", intentType: "Informational", targetUrl: "/reviews/bsv-wallet", primaryH1: "Best Bitcoin SV (BSV) Wallets", benefitHook: "The top storage options for BSV." },
  { keyword: "best wallet for xrp", intentType: "Informational", targetUrl: "/reviews/best-xrp-wallet", primaryH1: "Which is the Best Wallet for XRP?", benefitHook: "A comprehensive XRP storage guide." },
  { keyword: "ark xrp", intentType: "Informational", targetUrl: "/ecosystem/ark-xrp", primaryH1: "ARK and XRP Interoperability", benefitHook: "Technical guide on ARK and Ripple." },
  { keyword: "buy celo coin", intentType: "Commercial", targetUrl: "/buy/celo", primaryH1: "Buy CELO Coin Instantly", benefitHook: "Fast entry into the Celo network." },
  { keyword: "bridge solana to bnb", intentType: "Commercial", targetUrl: "/bridge/solana-to-bnb", primaryH1: "Bridge Solana (SOL) to BNB Chain", benefitHook: "Cross-chain liquidity between SOL and BSC." },
  { keyword: "best erc20 wallet", intentType: "Informational", targetUrl: "/reviews/best-erc20-wallet", primaryH1: "Best ERC20 Wallets for 2026", benefitHook: "Manage all Ethereum-based assets easily." },
  { keyword: "best place to buy solana", intentType: "Commercial", targetUrl: "/guides/best-place-to-buy-solana", primaryH1: "Best Place to Buy Solana (SOL)", benefitHook: "Why our no-KYC platform ranks #1." },
  { keyword: "alpaca crypto", intentType: "Commercial", targetUrl: "/trade/alpaca", primaryH1: "Alpaca Crypto Swap & Finance", benefitHook: "Trade Alpaca assets with instant speed." },
  { keyword: "adaswap dex", intentType: "Commercial", targetUrl: "/alternatives/adaswap", primaryH1: "Alternative to AdaSwap DEX", benefitHook: "Faster Cardano-based ecosystem swaps." },
  { keyword: "30 trx to usdt", intentType: "Commercial", targetUrl: "/swap/30-trx-to-usdt", primaryH1: "Convert 30 TRX to USDT", benefitHook: "Micro-swaps starting at just $0.30." },
  { keyword: "swap bitcoin for solana", intentType: "Commercial", targetUrl: "/swap/btc-to-sol-instant", primaryH1: "Swap Bitcoin for Solana Instantly", benefitHook: "Direct BTC-to-SOL non-custodial bridge." },
].map((k) => ({ ...k, cluster: getCluster(k.keyword, k.targetUrl) }));

export function getRelatedKeywords(current: SeoKeyword, max = 6): SeoKeyword[] {
  return seoKeywords
    .filter((k) => k.targetUrl !== current.targetUrl && k.cluster === current.cluster)
    .slice(0, max);
}

export function findKeywordByUrl(path: string): SeoKeyword | undefined {
  return seoKeywords.find((k) => k.targetUrl === path);
}
