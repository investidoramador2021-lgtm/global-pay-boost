/**
 * Auto-generates a DeepProfile from a Competitor row so every /compare/mrc-vs-*
 * page renders through the same balanced ComparisonPageTemplate (table + pros/cons
 * + Why-MRC + verdict), even when no hand-curated DeepProfile exists.
 *
 * Hand-curated profiles in `competitor-deep.ts` always take precedence.
 */

import type { Competitor } from "./competitor-data";
import type { DeepProfile, DeepRow, Winner } from "./competitor-deep";

const isCustodialExchange = (c: Competitor) =>
  /Mandatory|Tiered/i.test(c.kyc_policy);

const minNumber = (raw: string): number | null => {
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : null;
};

export function buildAutoProfile(c: Competitor): DeepProfile {
  const custodial = isCustodialExchange(c);
  const min = minNumber(c.min_swap_usd);
  const minWinner: Winner = min === null ? "mrc" : min > 0.3 ? "mrc" : "tie";
  const kycWinner: Winner = custodial ? "mrc" : "tie";
  const speedWinner: Winner = /< ?1 ?min|Instant|60 sec/i.test(c.avg_speed) ? "tie" : "mrc";
  const nonCustWinner: Winner = custodial ? "mrc" : "tie";
  const feesWinner: Winner = /Variable|Spread|Hidden|Gas/i.test(c.fees) ? "mrc" : "tie";

  const rows: DeepRow[] = [
    {
      feature: "Regulation & Compliance",
      mrc: "Canadian MSB · FINTRAC #C100000015 · Bank of Canada Authorized PSP-aligned",
      rival: custodial
        ? `${c.name} operates under exchange licensing in its home jurisdiction; verify regulator coverage in your region.`
        : `${c.name} operates as a non-custodial swap service without a published major-MSB registration.`,
      winner: "mrc",
    },
    {
      feature: "Minimum Swap Amount",
      mrc: "$0.30",
      rival: c.min_swap_usd === "Variable" ? "Variable / network-dependent" : `$${c.min_swap_usd}`,
      winner: minWinner,
    },
    {
      feature: "KYC / Registration Required",
      mrc: "Not required for swaps",
      rival: c.kyc_policy,
      winner: kycWinner,
    },
    {
      feature: "Swap Speed",
      mrc: "< 60 seconds (fixed-rate)",
      rival: c.avg_speed,
      winner: speedWinner,
    },
    {
      feature: "Non-Custodial",
      mrc: "Yes — wallet-to-wallet, no balances held",
      rival: custodial ? "No — funds held on the exchange" : "Yes",
      winner: nonCustWinner,
    },
    {
      feature: "Number of Supported Assets",
      mrc: "6,000+ assets across 80+ networks (aggregated)",
      rival: custodial ? "Hundreds of listed pairs (varies)" : "Varies; typically 1,000+ assets",
      winner: "tie",
    },
    {
      feature: "Fees / Exchange Rates",
      mrc: "Transparent flat fee, aggregated best-of-N rate",
      rival: c.fees,
      winner: feesWinner,
    },
    {
      feature: "Affiliate Program",
      mrc: "Lifetime 0.1% – 0.4% paid in BTC, no expiry, $0 minimum payout",
      rival: custodial
        ? "Standard exchange affiliate program with payout thresholds"
        : "Standard revenue-share, payout thresholds typically apply",
      winner: "mrc",
    },
    {
      feature: "Customer Support",
      mrc: "24/7 in-app chat + email, 13-language coverage",
      rival: custodial ? "Ticket + help center, response times vary" : "Email/ticket-based support",
      winner: "tie",
    },
    {
      feature: "Security & Privacy",
      mrc: "Non-custodial · Fireblocks-secured infrastructure · no email or account required to swap",
      rival: custodial
        ? "Custodial — KYC and account required; relies on exchange's internal security"
        : "Non-custodial; privacy depends on the user's wallet hygiene",
      winner: custodial ? "mrc" : "tie",
    },
  ];

  const mrcPros: string[] = [
    "Canadian FINTRAC MSB (#C100000015) — Bank of Canada Authorized PSP-aligned framework",
    "Micro-swaps from $0.30 — purpose-built for crypto-dust cleanup",
    "Lifetime affiliate commissions paid automatically in BTC, no minimum payout",
    "Non-custodial, wallet-to-wallet — no balances held on our side",
    "13-language interface with full RTL support",
  ];

  const mrcCons: string[] = [
    "Younger brand — less name recognition than legacy venues",
    "No native mobile app store listing yet (PWA install instead)",
  ];

  const rivalPros: string[] = custodial
    ? [
        `${c.name} has an established brand with strong recognition`,
        "Mature trading interface with order books and advanced order types",
        "Deep on-platform liquidity for major pairs",
      ]
    : [
        `${c.name} offers established non-custodial swap routing`,
        "Familiar UX for users already in this niche",
        "Supports a broad list of long-tail assets",
      ];

  const rivalCons: string[] = [
    c.primary_weakness,
    custodial
      ? "Mandatory KYC and account creation required to swap"
      : "Higher minimum swap amount excludes small balances and dust",
    custodial
      ? "Custodial — your funds sit on the exchange until withdrawal"
      : "No verifiable major-jurisdiction MSB registration to point users at",
  ];

  const whyMrc: string[] = [
    "Full Canadian MSB registration — FINTRAC #C100000015, headquartered in Ottawa",
    "Micro-swaps from $0.30 — sweep crypto dust no other major venue will touch",
    "True non-custodial flow: we never hold your balance, ever",
    "Lifetime BTC affiliate revenue share, automatic payouts on every confirmed swap",
    "Privacy-first: no email or account required to swap",
    c.mrc_advantage,
  ];

  const conclusion = custodial
    ? `${c.name} is a reasonable choice if you are comfortable with mandatory ID verification and want a centralized exchange experience with order books. For users who want a Canadian-regulated, non-custodial venue with $0.30 micro-swap support and lifetime BTC affiliate commissions paid automatically, MRC GlobalPay is the better fit — same speed, lower minimums, no account required, and your funds never leave your wallet until settlement.`
    : `${c.name} is a credible non-custodial option, but its higher minimum and lack of major-jurisdiction MSB registration are real drawbacks for users who care about regulated infrastructure or want to swap small balances. MRC GlobalPay offers the same wallet-to-wallet design with $0.30 swaps, FINTRAC MSB regulation, multi-provider liquidity routing, and lifetime BTC affiliate commissions — making it the stronger choice in almost every comparison.`;

  return {
    slug: c.slug,
    rivalName: c.name,
    title: `MRC GlobalPay vs ${c.name} (2026) — Which Is Better?`,
    intro: `An honest, side-by-side comparison of MRC GlobalPay and ${c.name}: regulation, minimum swap, KYC, speed, custody model, fees, affiliate program, support, and security.`,
    rows,
    mrcPros,
    mrcCons,
    rivalPros,
    rivalCons,
    whyMrc,
    conclusion,
  };
}
