/**
 * Curated, hand-written enrichment for the highest-potential pair pages.
 *
 * Goal: eliminate "thin content" on the top 200–500 pair pages without
 * touching the other 30,000+ pages. Each entry produces:
 *
 *  - intro       : unique 2–3 sentence paragraph on why this specific swap matters
 *  - steps       : pair-specific step-by-step (overrides the generic 4-step block)
 *  - notes       : { fees, speed, minimum } — pair-specific operational facts
 *  - peopleAlso  : 8–10 internal links to related pair pages
 *
 * Render path:
 *   DynamicExchange.tsx → if PAIR_ENRICHMENT[`${from}-${to}`] exists,
 *   the <PairEnrichmentBlock /> renders between the widget and the
 *   existing "How it works" section. Other pages are untouched.
 *
 * Languages: English first. Non-English visitors see the same enriched
 * English block until per-language copy is added; the rest of the page
 * (hero, FAQs, schema) remains fully translated by existing i18n.
 */

export interface PairStep {
  title: string;
  description: string;
}

export interface PairNotes {
  fees: string;
  speed: string;
  minimum: string;
}

export interface PairLink {
  from: string;
  to: string;
  label: string;
}

export interface PairEnrichment {
  intro: string;
  steps: PairStep[];
  notes: PairNotes;
  peopleAlso: PairLink[];
}

/** Helper to keep "people also swap" lists short to type. */
const link = (from: string, to: string, label?: string): PairLink => ({
  from: from.toLowerCase(),
  to: to.toLowerCase(),
  label: label || `${from.toUpperCase()} → ${to.toUpperCase()}`,
});

/** Re-usable boilerplate (kept short — most copy is unique per pair). */
const MRC_ADV =
  "MRC GlobalPay is a non-custodial swap aggregator regulated as a Canadian MSB (FINTRAC #C100000015) and registered as a Bank of Canada PSP. Settlements complete in under 60 seconds and the minimum swap is just $0.30.";

export const PAIR_ENRICHMENT: Record<string, PairEnrichment> = {
  /* ───────────────────────── BTC → USDT ───────────────────────── */
  "btc-usdt": {
    intro:
      "Swapping BTC to USDT is the most-used route in crypto: it lets Bitcoin holders lock in USD value during volatility, settle into a stable asset before paying invoices, or rotate into a trading-ready balance without touching a centralized exchange. " +
      MRC_ADV,
    steps: [
      { title: "Enter the BTC amount you want to convert", description: "Minimums start at the equivalent of $0.30 in BTC. There is no upper limit beyond network liquidity." },
      { title: "Choose the USDT network you want to receive on", description: "TRC-20 (TRON) has the lowest fees and fastest settlement. ERC-20 (Ethereum) is best for DeFi or hardware wallets." },
      { title: "Paste your USDT receiving address", description: "Double-check the network matches the address. Sending TRC-20 USDT to an ERC-20 address (or vice versa) results in lost funds." },
      { title: "Send BTC to the deposit address", description: "Bitcoin requires 2 network confirmations (typically 10–30 minutes). Once confirmed, USDT is dispatched within seconds." },
    ],
    notes: {
      fees: "Network fee + a thin aggregator spread sourced from 700+ liquidity venues. The quoted rate is the rate you receive — no hidden markup.",
      speed: "BTC → USDT TRC-20 settles in roughly 10–35 minutes end-to-end (Bitcoin confirmations dominate). USDT ERC-20 takes a similar time.",
      minimum: "Approximately $0.30 USD equivalent in BTC (~0.000004 BTC at current rates). No maximum below liquidity limits.",
    },
    peopleAlso: [
      link("btc", "eth"), link("btc", "usdc"), link("btc", "ltc"), link("btc", "sol"),
      link("usdt", "btc"), link("eth", "usdt"), link("sol", "usdt"), link("xrp", "usdt"),
      link("btc", "xmr", "BTC → XMR"), link("btc", "trx"),
    ],
  },

  /* ───────────────────────── ETH → USDT ───────────────────────── */
  "eth-usdt": {
    intro:
      "ETH → USDT is the standard exit route for DeFi yield, NFT sale proceeds, and gas-balance management. Converting Ether into a USD-pegged stable asset lets you preserve value between trades without leaving self-custody. " +
      MRC_ADV,
    steps: [
      { title: "Enter the amount of ETH to swap", description: "The aggregator quotes a guaranteed receive amount before you deposit. Minimum is roughly $0.30 in ETH." },
      { title: "Pick the USDT network", description: "ERC-20 keeps your USDT on Ethereum (best for DeFi). TRC-20 is cheapest if you plan to send USDT onward." },
      { title: "Paste your USDT address", description: "Verify it matches the chosen network. Address format on TRON (starts with T) and Ethereum (starts with 0x) are not interchangeable." },
      { title: "Deposit ETH and wait for confirmations", description: "Ethereum requires ~12 confirmations (about 2–5 minutes). USDT is sent the moment the deposit clears." },
    ],
    notes: {
      fees: "Network fee + aggregator spread. ERC-20 USDT carries higher gas; TRC-20 is typically a flat ~$1 equivalent.",
      speed: "End-to-end usually 3–6 minutes. ETH confirmations are the rate-limiting step.",
      minimum: "About $0.30 USD equivalent in ETH (~0.0001 ETH).",
    },
    peopleAlso: [
      link("eth", "btc"), link("eth", "usdc"), link("eth", "sol"), link("eth", "dai"),
      link("usdt", "eth"), link("btc", "usdt"), link("sol", "usdt"), link("xrp", "usdt"),
      link("eth", "matic", "ETH → MATIC"), link("eth", "arb", "ETH → ARB"),
    ],
  },

  /* ───────────────────────── SOL → USDT ───────────────────────── */
  "sol-usdt": {
    intro:
      "SOL → USDT is the fastest-growing exit pair in 2026: Solana NFT and memecoin traders rotate into USDT to lock gains, while liquidity providers use it to rebalance positions in seconds rather than minutes. " +
      MRC_ADV,
    steps: [
      { title: "Enter your SOL amount", description: "Minimum ~$0.30. SOL deposits confirm in under 30 seconds." },
      { title: "Choose USDT network (TRC-20, ERC-20, or SPL)", description: "Solana SPL USDT keeps everything on-chain on Solana — the cheapest and fastest route." },
      { title: "Paste destination address and verify network", description: "SPL addresses start without a prefix; do not paste an Ethereum address into a Solana field." },
      { title: "Send SOL", description: "Solana needs 1 confirmation. End-to-end completion often under 60 seconds." },
    ],
    notes: {
      fees: "Solana network fee is fractions of a cent; aggregator routes to the cheapest USDT venue automatically.",
      speed: "SOL → SPL USDT routinely under 30 seconds end-to-end.",
      minimum: "Approximately $0.30 USD equivalent in SOL.",
    },
    peopleAlso: [
      link("sol", "btc"), link("sol", "eth"), link("sol", "usdc"), link("sol", "bonk"),
      link("usdt", "sol"), link("btc", "sol"), link("eth", "sol"), link("bonk", "usdt"),
      link("jup", "usdt", "JUP → USDT"), link("ray", "usdt", "RAY → USDT"),
    ],
  },

  /* ───────────────────────── XRP → USDT ───────────────────────── */
  "xrp-usdt": {
    intro:
      "XRP → USDT is widely used for cross-border settlement and post-payout stable-coin conversion. XRP Ledger transactions finalize in 3–5 seconds and are nearly free, making this one of the cheapest fiat-stable exit routes in crypto. " +
      MRC_ADV,
    steps: [
      { title: "Enter the XRP amount", description: "Minimum ~$0.30. XRP transfers cost a fraction of a cent." },
      { title: "Provide a Destination Tag if your exchange requires one", description: "MRC GlobalPay supports XRP Destination Tag input — required for some exchange-hosted wallets." },
      { title: "Choose USDT network (TRC-20 recommended)", description: "TRC-20 keeps fees minimal and matches XRP's low-cost ethos." },
      { title: "Send XRP and receive USDT", description: "XRP Ledger confirms in seconds. End-to-end typically under one minute." },
    ],
    notes: {
      fees: "XRP Ledger fee is ~$0.0002. USDT side carries only the destination network fee.",
      speed: "Usually under 60 seconds end-to-end.",
      minimum: "About $0.30 USD equivalent in XRP.",
    },
    peopleAlso: [
      link("xrp", "btc"), link("xrp", "usdc"), link("xrp", "eth"), link("xrp", "xlm", "XRP → XLM"),
      link("usdt", "xrp"), link("btc", "xrp"), link("xlm", "usdt", "XLM → USDT"), link("ada", "usdt"),
      link("hbar", "usdt", "HBAR → USDT"), link("algo", "usdt", "ALGO → USDT"),
    ],
  },

  /* ───────────────────────── PEPE → USDT ───────────────────────── */
  "pepe-usdt": {
    intro:
      "PEPE → USDT is the dominant profit-taking route for memecoin traders. Because PEPE liquidity now exists on Ethereum, Base, and Arbitrum, exiting into USDT lets you crystallize gains without paying L1 gas if you hold on an L2. " +
      MRC_ADV,
    steps: [
      { title: "Enter PEPE amount", description: "PEPE is denominated in trillions of tokens — paste the full amount or use the percentage selectors." },
      { title: "Pick USDT network (TRC-20 cheapest, ERC-20 for DeFi)", description: "If you plan to swap back into another memecoin shortly, ERC-20 USDT keeps you in the same gas environment." },
      { title: "Paste USDT address", description: "Verify the network. PEPE is ERC-20 by default; the destination network is independent." },
      { title: "Deposit PEPE", description: "Ethereum confirms in 2–5 minutes; USDT dispatches immediately after." },
    ],
    notes: {
      fees: "Ethereum gas dominates the cost. Use a low-gas window or deposit from a Base/Arbitrum PEPE balance to save 70%+.",
      speed: "Typically 3–6 minutes end-to-end on mainnet, faster from L2.",
      minimum: "About $0.30 USD equivalent in PEPE.",
    },
    peopleAlso: [
      link("pepe", "btc"), link("pepe", "eth"), link("pepe", "sol"), link("pepe", "usdc"),
      link("doge", "usdt"), link("shib", "usdt"), link("bonk", "usdt"), link("wif", "usdt", "WIF → USDT"),
      link("floki", "usdt", "FLOKI → USDT"), link("usdt", "pepe"),
    ],
  },

  /* ───────────────────────── BONK → USDT ───────────────────────── */
  "bonk-usdt": {
    intro:
      "BONK → USDT is the fastest memecoin exit on the market. BONK runs natively on Solana, so the round-trip from token sale to stable-coin balance often completes in under 30 seconds at sub-cent fees. " +
      MRC_ADV,
    steps: [
      { title: "Enter BONK amount", description: "BONK trades in millions of tokens; the widget formats the input automatically." },
      { title: "Choose USDT network — SPL (Solana) is fastest", description: "Staying on Solana keeps the entire round-trip near-instant and near-free." },
      { title: "Paste USDT address (SPL, TRC-20, or ERC-20)", description: "Confirm the address format matches the chosen network." },
      { title: "Send BONK", description: "Solana confirms in ~1 second. USDT arrives moments later." },
    ],
    notes: {
      fees: "Sub-cent on Solana. Cross-chain to TRC-20 USDT adds a small bridge cost.",
      speed: "Under 30 seconds for SPL USDT; ~60 seconds for TRC-20.",
      minimum: "About $0.30 USD equivalent in BONK.",
    },
    peopleAlso: [
      link("bonk", "sol"), link("bonk", "btc"), link("bonk", "eth"), link("bonk", "usdc"),
      link("wif", "usdt", "WIF → USDT"), link("pepe", "usdt"), link("doge", "usdt"), link("shib", "usdt"),
      link("jup", "usdt", "JUP → USDT"), link("usdt", "bonk"),
    ],
  },

  /* ───────────────────────── DOGE → USDT ───────────────────────── */
  "doge-usdt": {
    intro:
      "DOGE → USDT is one of the longest-standing exit routes in crypto. With Dogecoin's 1-minute block times and fractional-cent fees, holders can rotate into stable-coin value cheaply at any size. " +
      MRC_ADV,
    steps: [
      { title: "Enter DOGE amount", description: "Minimum ~$0.30. DOGE network fees are fractions of a cent." },
      { title: "Choose USDT network", description: "TRC-20 USDT pairs naturally with DOGE for low total fees." },
      { title: "Paste USDT address", description: "Verify network format matches; DOGE wallet addresses are not compatible with USDT addresses." },
      { title: "Send DOGE and wait ~40 confirmations", description: "DOGE finality typically 5–20 minutes; USDT dispatches the moment the deposit clears." },
    ],
    notes: {
      fees: "DOGE network fee ~$0.01; USDT side fee ~$1 (TRC-20).",
      speed: "5–20 minutes end-to-end depending on DOGE confirmation timing.",
      minimum: "About $0.30 USD equivalent in DOGE.",
    },
    peopleAlso: [
      link("doge", "btc"), link("doge", "eth"), link("doge", "ltc"), link("doge", "usdc"),
      link("shib", "usdt"), link("pepe", "usdt"), link("bonk", "usdt"), link("usdt", "doge"),
      link("ltc", "usdt"), link("btc", "doge"),
    ],
  },

  /* ───────────────────────── SHIB → USDT ───────────────────────── */
  "shib-usdt": {
    intro:
      "SHIB → USDT lets Shiba Inu holders take profit or rebalance into stable-coin value while staying inside crypto. SHIB liquidity is deepest on Ethereum mainnet, with growing volume on Shibarium L2. " +
      MRC_ADV,
    steps: [
      { title: "Enter SHIB amount", description: "SHIB trades in millions; the widget handles the formatting." },
      { title: "Choose USDT network (TRC-20 or ERC-20)", description: "TRC-20 saves on cross-chain fees; ERC-20 keeps you in the same gas environment." },
      { title: "Paste USDT address", description: "Confirm the address matches the network." },
      { title: "Send SHIB", description: "Ethereum confirmations take 2–5 minutes." },
    ],
    notes: {
      fees: "Ethereum gas + thin aggregator spread. Deposit during low-gas windows for best total cost.",
      speed: "3–6 minutes end-to-end.",
      minimum: "About $0.30 USD equivalent in SHIB.",
    },
    peopleAlso: [
      link("shib", "btc"), link("shib", "eth"), link("shib", "usdc"), link("shib", "doge"),
      link("doge", "usdt"), link("pepe", "usdt"), link("bonk", "usdt"), link("floki", "usdt", "FLOKI → USDT"),
      link("usdt", "shib"), link("eth", "usdt"),
    ],
  },

  /* ───────────────────────── USDC → USDT ───────────────────────── */
  "usdc-usdt": {
    intro:
      "USDC → USDT is the workhorse stable-to-stable swap: traders use it to move between exchanges that prefer one stablecoin over the other, and to reduce single-issuer exposure. The conversion rate sits within a tight 1:1 band because both assets are USD-pegged. " +
      MRC_ADV,
    steps: [
      { title: "Enter USDC amount", description: "Stable-to-stable rate is near 1:1, minus the network and aggregator fee." },
      { title: "Choose source and destination networks", description: "Cross-chain stable swaps (e.g. USDC ERC-20 → USDT TRC-20) are common and supported." },
      { title: "Paste USDT receiving address", description: "Match the network exactly — sending across mismatched chains will lose funds." },
      { title: "Send USDC and receive USDT", description: "ERC-20 USDC confirms in 2–5 minutes; USDT arrives immediately after." },
    ],
    notes: {
      fees: "Network fees on both legs + a very thin spread. For ERC-20 → TRC-20 cross-chain, total cost is typically a few dollars regardless of size.",
      speed: "3–6 minutes end-to-end on Ethereum-rooted swaps; under a minute when both sides are on TRON or Solana.",
      minimum: "About $0.30 USD equivalent.",
    },
    peopleAlso: [
      link("usdt", "usdc"), link("usdc", "btc"), link("usdc", "eth"), link("usdc", "sol"),
      link("dai", "usdt", "DAI → USDT"), link("dai", "usdc", "DAI → USDC"), link("usdc", "xrp"), link("usdc", "trx"),
      link("usdt", "dai", "USDT → DAI"), link("eth", "usdc"),
    ],
  },

  /* ───────────────────────── TON → USDT ───────────────────────── */
  "ton-usdt": {
    intro:
      "TON → USDT has surged with Telegram-native commerce and TON-based mini-apps. Telegram users earning TON in-app routinely convert to USDT for stable payouts and merchant settlement. " +
      MRC_ADV,
    steps: [
      { title: "Enter TON amount", description: "TON Blockchain confirms in seconds at near-zero fees." },
      { title: "Provide a Memo if your destination wallet requires one", description: "Some custodial TON wallets require a memo — enter it in the widget when prompted." },
      { title: "Choose USDT network — TON-native USDT is fastest", description: "USDT-TON keeps the entire flow on a single chain in under a minute." },
      { title: "Send TON", description: "Confirmation under 15 seconds. USDT dispatches immediately." },
    ],
    notes: {
      fees: "TON network fee fractions of a cent; USDT-TON dispatch fee similar.",
      speed: "Under 60 seconds end-to-end for USDT-TON.",
      minimum: "About $0.30 USD equivalent in TON.",
    },
    peopleAlso: [
      link("ton", "btc"), link("ton", "eth"), link("ton", "usdc"), link("ton", "sol"),
      link("usdt", "ton"), link("btc", "ton"), link("eth", "ton"), link("not", "usdt", "NOT → USDT"),
      link("dogs", "usdt", "DOGS → USDT"), link("hmstr", "usdt", "HMSTR → USDT"),
    ],
  },
};

/** Lookup helper — returns null if the pair isn't in the curated set. */
export function getPairEnrichment(from: string, to: string): PairEnrichment | null {
  const key = `${from.toLowerCase()}-${to.toLowerCase()}`;
  return PAIR_ENRICHMENT[key] || null;
}

/** Total count for reporting — useful for sitemap/SEO dashboards. */
export const ENRICHED_PAIR_COUNT = Object.keys(PAIR_ENRICHMENT).length;
