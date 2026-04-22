/**
 * Deep comparison profiles for high-priority competitor pages.
 * These power the rich `/compare/mrc-vs-{slug}` pages with a real side-by-side
 * table (with Winner column), balanced pros/cons for both sides, a "Why MRC"
 * block, and a fair conclusion. Falls back to the generic ComparePage for
 * competitors not listed here.
 */

export type Winner = "mrc" | "rival" | "tie";

export interface DeepRow {
  feature: string;
  mrc: string;
  rival: string;
  winner: Winner;
}

export interface DeepProfile {
  slug: string;
  rivalName: string;
  /** SEO title (used as <title> and H1 fallback). */
  title: string;
  /** Hero subtitle. */
  intro: string;
  rows: DeepRow[];
  mrcPros: string[];
  mrcCons: string[];
  rivalPros: string[];
  rivalCons: string[];
  /** Honest "Why choose MRC" bullets (4-6). */
  whyMrc: string[];
  /** Final recommendation paragraph(s). */
  conclusion: string;
}

const COMMON_ROWS = (rivalRegulation: string, rivalMin: string, rivalKyc: string,
                     rivalSpeed: string, rivalNonCust: string, rivalAssets: string,
                     rivalFees: string, rivalSupport: string, rivalAffiliate: string): DeepRow[] => [
  {
    feature: "Regulation",
    mrc: "Canadian MSB · FINTRAC #C100000015 · Bank of Canada PSP-aligned",
    rival: rivalRegulation,
    winner: "mrc",
  },
  { feature: "Minimum swap", mrc: "$0.30", rival: rivalMin, winner: "mrc" },
  { feature: "KYC / registration", mrc: "Not required for swaps", rival: rivalKyc, winner: "tie" },
  { feature: "Average speed", mrc: "< 60 seconds (fixed-rate)", rival: rivalSpeed, winner: "tie" },
  { feature: "Non-custodial", mrc: "Yes — wallet-to-wallet, no balances held", rival: rivalNonCust, winner: "tie" },
  { feature: "Supported coins / pairs", mrc: "6,000+ assets across 80+ networks (aggregated)", rival: rivalAssets, winner: "tie" },
  { feature: "Fees / rates", mrc: "Transparent flat fee, aggregated best-of-N rate", rival: rivalFees, winner: "tie" },
  { feature: "Customer support", mrc: "24/7 in-app chat + email, multilingual", rival: rivalSupport, winner: "tie" },
  { feature: "Affiliate program", mrc: "Lifetime 0.1% – 0.4% paid in BTC, no expiry, $0 minimum payout", rival: rivalAffiliate, winner: "mrc" },
];

export const DEEP_PROFILES: Record<string, DeepProfile> = {
  changenow: {
    slug: "changenow",
    rivalName: "ChangeNOW",
    title: "MRC GlobalPay vs ChangeNOW (2026) — Which Is Better?",
    intro:
      "Both are non-custodial instant swap platforms with no mandatory KYC for retail swaps. The real differences come down to regulation, micro-swap support, and how affiliate commissions are paid.",
    rows: COMMON_ROWS(
      "Registered MSB in Estonia (FIU-Estonia)",
      "$2 – $10 per pair (varies)",
      "Not required for most swaps; risk-based review possible",
      "< 5 minutes for fixed-rate, longer for floating",
      "Yes",
      "1,200+ assets",
      "0.5% – 4% spread depending on pair",
      "24/7 ticket + chat",
      "Standard 0.4% revenue-share, monthly payouts, $50+ minimum",
    ),
    mrcPros: [
      "Canadian FINTRAC MSB regulation (#C100000015) — full Bank of Canada PSP framework alignment",
      "$0.30 minimum unlocks crypto-dust consolidation no other major aggregator handles",
      "Lifetime affiliate commissions paid automatically in BTC, no minimum payout",
      "13-language interface with full RTL support (Hebrew, Urdu, Persian)",
      "Aggregates ChangeNOW + LetsExchange liquidity behind the scenes — you always get the best of both",
    ],
    mrcCons: [
      "Younger brand — less name recognition than ChangeNOW",
      "No native mobile app store listing yet (PWA install instead)",
    ],
    rivalPros: [
      "Established brand since 2017 with strong recognition",
      "Mature API and exchange-partner ecosystem",
      "Wide marketing reach and affiliate community",
    ],
    rivalCons: [
      "EU-based — outside the Canadian/North-American regulatory perimeter many users prefer",
      "Higher minimums ($2 – $10) make small balances and dust impossible to swap",
      "Affiliate program requires $50+ to withdraw and pays monthly, not on every swap",
    ],
    whyMrc: [
      "Full Canadian MSB registration — FINTRAC #C100000015, headquartered in Ottawa",
      "Micro-swaps from $0.30 — purpose-built for crypto-dust cleanup",
      "Lifetime affiliate revenue share, automatic BTC payouts on every confirmed swap",
      "Privacy-first: no email or account required to swap",
      "Multi-provider liquidity aggregation: routes through ChangeNOW + LetsExchange to find the best rate per quote",
    ],
    conclusion:
      "If you need a recognized brand and are swapping $50+ at a time, ChangeNOW is a perfectly safe choice. If you want a Canadian-regulated venue, micro-swap support down to $0.30, and lifetime BTC affiliate commissions paid automatically, MRC GlobalPay is the better fit — and behind the scenes you still benefit from ChangeNOW liquidity through our aggregator.",
  },

  simpleswap: {
    slug: "simpleswap",
    rivalName: "SimpleSwap",
    title: "MRC GlobalPay vs SimpleSwap (2026) — Which Is Better?",
    intro:
      "Both platforms target users who want to swap without registering an account. The differentiators are regulatory standing, minimum swap size, fee transparency, and affiliate economics.",
    rows: COMMON_ROWS(
      "Operates without a public MSB-equivalent registration",
      "$15 typical minimum, varies by pair",
      "Not required for most swaps",
      "5 – 15 minutes typical",
      "Yes",
      "1,500+ assets",
      "Spread-based, often 0.5% – 5% effective",
      "Email + chat",
      "Up to 0.4% revenue share, $50+ minimum payout",
    ),
    mrcPros: [
      "Registered Canadian MSB — verifiable on the FINTRAC public registry",
      "Swaps from $0.30 vs SimpleSwap's typical $15+ floor",
      "Transparent flat fee instead of hidden spread",
      "Lifetime BTC commissions with no minimum payout for affiliates",
      "13 fully-translated languages including RTL",
    ],
    mrcCons: [
      "Smaller asset count on direct UI (focus on top 6,000+ liquid pairs vs SimpleSwap's long-tail listings)",
      "Newer to the market",
    ],
    rivalPros: [
      "Long-tail asset coverage including some illiquid altcoins",
      "Established 2018",
      "Floating-rate option for users who want to ride volatility",
    ],
    rivalCons: [
      "No verifiable major-jurisdiction MSB registration",
      "$15+ minimum makes most dust swaps impossible",
      "Spread-based pricing can be expensive on low-liquidity pairs",
    ],
    whyMrc: [
      "Regulated Canadian MSB (FINTRAC #C100000015) — your swaps run through a venue with verifiable AML/KYC compliance infrastructure",
      "$0.30 minimum — sweep crypto dust SimpleSwap will reject",
      "Flat fee model means no surprise spreads on the rate",
      "Affiliates earn lifetime BTC, paid automatically per swap",
    ],
    conclusion:
      "SimpleSwap is a reasonable choice for swapping mid-cap altcoins with no account. For users who care about regulatory clarity, want to clean small balances, or want lifetime BTC affiliate income, MRC GlobalPay is the better-aligned platform.",
  },

  stealthex: {
    slug: "stealthex",
    rivalName: "StealthEX",
    title: "MRC GlobalPay vs StealthEX (2026) — Which Is Better?",
    intro:
      "StealthEX is a privacy-focused non-custodial swap aggregator. MRC GlobalPay shares the non-custodial design but adds full Canadian MSB regulation, lower minimums, and a richer affiliate program.",
    rows: COMMON_ROWS(
      "Operates outside major MSB frameworks",
      "$15 typical minimum, often higher for privacy coins",
      "Not required",
      "5 – 30 minutes typical",
      "Yes",
      "1,300+ assets",
      "Variable spread, 0.4% – 3%",
      "Email + ticket",
      "0.4% revenue share, payout thresholds apply",
    ),
    mrcPros: [
      "Canadian FINTRAC MSB (#C100000015) — same non-custodial design with regulatory backing",
      "$0.30 minimum vs StealthEX's $15+ floor",
      "Aggregates multiple liquidity providers per quote (best price wins)",
      "Lifetime BTC affiliate payouts with no minimum",
      "13-language UI with full RTL support",
    ],
    mrcCons: [
      "We do not specialize in privacy-coin-only routing",
      "Smaller community than StealthEX in the privacy-coin niche",
    ],
    rivalPros: [
      "Strong reputation in the privacy-coin community",
      "Wide range of obscure altcoin support",
      "Anonymity-first marketing message",
    ],
    rivalCons: [
      "No major-jurisdiction MSB registration to point users at",
      "Higher minimums lock out small-balance users",
      "Pricing can be opaque on low-liquidity pairs",
    ],
    whyMrc: [
      "Same non-custodial wallet-to-wallet model as StealthEX, plus a verifiable Canadian MSB license",
      "Sub-dollar swaps — turn forgotten dust into usable assets",
      "Multi-provider routing finds a better rate than any single provider in many quotes",
      "Affiliate revenue paid in BTC, lifetime, automatic, $0 threshold",
    ],
    conclusion:
      "If your only priority is privacy-coin routing, StealthEX has built strong community trust there. For everyone else — and especially anyone who wants regulated infrastructure plus the ability to swap small balances — MRC GlobalPay is the stronger general-purpose choice.",
  },

  letsexchange: {
    slug: "letsexchange",
    rivalName: "LetsExchange",
    title: "MRC GlobalPay vs LetsExchange (2026) — Which Is Better?",
    intro:
      "MRC GlobalPay actually routes part of its liquidity through LetsExchange. So this is less a head-to-head and more about: do you want raw LetsExchange access, or LetsExchange + ChangeNOW + extra providers in one regulated front-end?",
    rows: COMMON_ROWS(
      "Operates as a non-custodial aggregator without a public major-MSB license",
      "$15 typical minimum, varies by pair",
      "Not required",
      "5 – 15 minutes typical",
      "Yes",
      "3,000+ assets",
      "Variable, often 0.5% – 3%",
      "Ticket-based, slower than tier-1 venues",
      "Standard revenue share",
    ),
    mrcPros: [
      "Aggregates LetsExchange liquidity *plus* ChangeNOW and other providers — better quotes per swap on average",
      "Canadian FINTRAC MSB regulated wrapper (#C100000015) on top of the same liquidity you'd get direct",
      "$0.30 minimum vs $15+ direct on LetsExchange",
      "24/7 in-app chat support (vs LetsExchange ticket queue)",
      "Lifetime BTC affiliate program with $0 minimum payout",
    ],
    mrcCons: [
      "If you have a specific pair only LetsExchange lists in their long-tail, going direct may have one-off advantages",
    ],
    rivalPros: [
      "Direct access to their full asset catalogue including some long-tail listings",
      "Established non-custodial brand",
      "Floating-rate option for traders",
    ],
    rivalCons: [
      "No verifiable major-jurisdiction MSB registration",
      "$15+ minimum effectively excludes dust",
      "Slower customer support response times",
    ],
    whyMrc: [
      "You get LetsExchange liquidity anyway — through a regulated, lower-minimum, better-supported front end",
      "Multi-provider routing means you almost never get a worse rate than going direct",
      "Canadian MSB regulatory wrapper (FINTRAC #C100000015) — verifiable on the public registry",
      "Lifetime BTC affiliate payouts, automatic, no minimum",
      "13-language UI with full RTL support",
    ],
    conclusion:
      "There's almost no scenario where going direct to LetsExchange beats using MRC GlobalPay: same liquidity (and more), lower minimums, regulated venue, faster support, and a stronger affiliate program. Go direct only if you need a pair that exists in LetsExchange's long-tail and not in our aggregated catalogue.",
  },
};

export const getDeepProfile = (slug: string): DeepProfile | undefined =>
  DEEP_PROFILES[slug];
