/**
 * SEO QA scanner — replicates the title/description logic used in
 * KeywordLanding.tsx and audits known static pages for missing or
 * out-of-range SEO metadata. Pure data, no React imports.
 */

import { seoKeywords, type SeoKeyword } from "@/lib/seo-keywords";

export type Severity = "error" | "warning" | "ok";

export interface SeoIssue {
  severity: Severity;
  field: "title" | "description" | "h1";
  message: string;
}

export interface SeoAuditRow {
  url: string;
  source: string; // e.g. "KeywordLanding", "Static page"
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  hasH1: boolean;
  h1Sample?: string;
  fixHint: string;
  issues: SeoIssue[];
}

// Bing/Google snippet thresholds
export const TITLE_MIN = 30;
export const TITLE_MAX = 60;
export const DESC_MIN = 120;
export const DESC_MAX = 160;

// ------- KeywordLanding logic mirror (must match component) -------

function buildKeywordTitle(kw: SeoKeyword): string {
  if (kw.customTitle) return kw.customTitle;
  if (kw.targetUrl === "/buy/monero-no-kyc") {
    return "Buy Monero – Registration-Free XMR Swap | MRC Global Pay";
  }
  const base = kw.keyword.length > 30 ? kw.keyword.slice(0, 30).trim() : kw.keyword;
  return `${base} | MRC Global Pay`;
}

function buildFallbackDescription(hook: string, kw: string): string {
  const base = `${hook} Swap ${kw} from $0.30 with no account, no KYC, and lifetime BTC rebates. Non-custodial settlement across 6,000+ tokens — Canadian MSB.`;
  if (base.length >= 140 && base.length <= 165) return base;
  if (base.length > 165) {
    return `${hook} Swap ${kw} from $0.30 — no account, no KYC. Non-custodial across 6,000+ tokens. Canadian MSB-registered.`.slice(0, 160);
  }
  return `${base} Settles in under 60 seconds with fixed-rate protection.`.slice(0, 160);
}

function buildKeywordDescription(kw: SeoKeyword): string {
  if (kw.customDescription) return kw.customDescription;
  if (kw.targetUrl === "/buy/monero-no-kyc") {
    return "Buy Monero (XMR) with no registration required. Non-custodial swap from $0.30 with a 0.5% flat fee — the most private way to acquire XMR in 2026 with lifetime BTC rebates.";
  }
  return buildFallbackDescription(kw.benefitHook, kw.keyword);
}

// ------- Static-page registry (manually curated) -------

interface StaticPageMeta {
  url: string;
  title: string;
  description: string;
  hasH1: boolean;
  h1Sample?: string;
  source?: string;
}

const STATIC_PAGES: StaticPageMeta[] = [
  { url: "/", title: "MRC Global Pay — Instant Crypto Swap From $0.30", description: "Non-custodial crypto swap with no account, no KYC and $0.30 minimums. 6,000+ assets, fixed-rate protection, Canadian MSB-registered.", hasH1: true, h1Sample: "Hero (motion.h1)" },
  { url: "/blog", title: "MRC Global Pay Blog — Crypto Swap & Industry Insights", description: "Expert articles on crypto swapping, on-ramping, stablecoins, dust conversion and AEO. Updated regularly with whitepapers and research.", hasH1: true },
  { url: "/about", title: "About MRC Global Pay — Canadian MSB Crypto Exchange", description: "MRC Pay International Corp operates a non-custodial crypto exchange registered with FINTRAC (MSB C100000015) in Ottawa, Canada.", hasH1: true },
  { url: "/affiliates", title: "Affiliate Program — Earn BTC on Every Swap | MRC Global Pay", description: "Join the MRC Global Pay affiliate program. Earn lifetime Bitcoin commissions on every referred swap with real-time dashboards.", hasH1: true },
  { url: "/partners", title: "Partner Program — White-Label Crypto Swap | MRC Global Pay", description: "Embed MRC Global Pay's swap engine into your product. Webhooks, API keys, and revenue share for institutional partners.", hasH1: true },
  { url: "/lend", title: "Lend & Earn — Crypto Loans and Yield | MRC Global Pay", description: "Borrow against crypto collateral or earn yield on stablecoins. Source-back payouts, institutional-grade custody, no rehypothecation.", hasH1: true },
  { url: "/private-transfer", title: "Private Crypto Transfer — Shielded Wallet-to-Wallet | MRC Global Pay", description: "Privacy-preserving crypto transfer between wallets. Non-custodial, accountless, with Monero-grade shielding.", hasH1: true },
  { url: "/permanent-bridge", title: "Permanent Crypto Bridge — Reusable Fixed Address | MRC Global Pay", description: "Create reusable, fixed-address crypto bridges for recurring conversions. Stateless, with downloadable PDF receipts.", hasH1: true },
  { url: "/transparency-security", title: "Transparency & Security — MRC Global Pay", description: "Security architecture, RLS policies, MSB compliance and transparency disclosures for MRC Global Pay's non-custodial platform.", hasH1: true },
  { url: "/compliance", title: "Compliance — Canadian MSB & FINTRAC Registration | MRC Global Pay", description: "Compliance disclosures for MRC Global Pay (FINTRAC MSB C100000015): AML, CTF, sanctions screening, and reporting.", hasH1: true },
  { url: "/aml", title: "AML Policy — MRC Global Pay", description: "Anti-Money Laundering policy for MRC Global Pay's crypto swap services in accordance with FINTRAC and Canadian MSB regulations.", hasH1: true },
  { url: "/privacy", title: "Privacy Policy — MRC Global Pay", description: "How MRC Global Pay handles user data on its non-custodial, accountless crypto swap platform — GDPR-aligned and minimal-collection.", hasH1: true },
  { url: "/terms", title: "Terms of Service — MRC Global Pay", description: "Terms of service governing the use of MRC Global Pay's non-custodial crypto swap, on-ramp, and lending services.", hasH1: true },
  { url: "/status", title: "Network Status — Live Swap Provider Health | MRC Global Pay", description: "Real-time uptime and latency for MRC Global Pay's swap providers, on-ramps and supported blockchain networks.", hasH1: true },
  { url: "/developer", title: "Developer Hub — MRC Global Pay APIs & Webhooks", description: "Documentation, code samples and webhook references for integrating MRC Global Pay's non-custodial swap engine.", hasH1: true },
  { url: "/developers", title: "Developers API — Crypto Swap Integration | MRC Global Pay", description: "REST API and webhooks for integrating MRC Global Pay's swap and on-ramp into your wallet, exchange or fintech app.", hasH1: true },
  { url: "/directory", title: "Crypto Exchange Directory — All Pairs & Assets | MRC Global Pay", description: "Browse every supported crypto pair, asset and on-ramp route on MRC Global Pay. 6,000+ assets, 50+ blockchains.", hasH1: true },
  { url: "/compare", title: "Compare Crypto Exchanges — MRC Global Pay vs Competitors", description: "Side-by-side comparisons of MRC Global Pay vs ChangeNOW, SimpleSwap, StealthEX and more. Fees, minimums, KYC.", hasH1: true },
  { url: "/solutions", title: "Crypto Swap Solutions — Use Cases | MRC Global Pay", description: "Crypto swap solutions for traders, businesses, dust holders, treasury managers and developers — no account required.", hasH1: true },
  { url: "/learn", title: "Learn Crypto Swapping — Guides & Tutorials | MRC Global Pay", description: "Beginner-to-advanced guides on crypto swapping, on-ramping, dust conversion, stablecoins and self-custody.", hasH1: true },
  { url: "/get-widget", title: "Get the Crypto Swap Widget — Embed | MRC Global Pay", description: "Free embeddable crypto swap widget. Add a non-custodial swap to your site in minutes with revenue share.", hasH1: true },
  { url: "/embed/widget", title: "Crypto Swap Widget — Embed Instant Crypto Exchange | MRC Global Pay", description: "Embeddable crypto swap widget by MRC Global Pay. Non-custodial, $0.30 minimum, 6,000+ assets, with revenue share.", hasH1: true, h1Sample: "sr-only" },
  { url: "/referral", title: "Referral Program — Earn BTC on Every Swap | MRC Global Pay", description: "Refer friends and earn lifetime Bitcoin commissions on every swap they make through MRC Global Pay.", hasH1: true },
  { url: "/dust-swap-comparison", title: "Crypto Dust Swap Comparison — MRC Global Pay vs Others", description: "How MRC Global Pay's $0.30 minimum compares to ChangeNOW, SimpleSwap and others for converting crypto dust.", hasH1: true },
  { url: "/crypto-dust-solutions", title: "Crypto Dust Solutions — Convert Tiny Balances | MRC Global Pay", description: "Convert crypto dust into usable assets from $0.30. The only swap engine optimized for sub-$1 balances.", hasH1: true },
  { url: "/guide/crypto-dust", title: "Crypto Dust Manifesto — Why Dust Matters | MRC Global Pay", description: "The crypto dust manifesto: why micro-balances matter and how MRC Global Pay solves the $0.30+ swap minimum problem.", hasH1: true },
  { url: "/liquidity-expansion", title: "Liquidity Expansion Whitepaper — MRC Global Pay", description: "Whitepaper detailing MRC Global Pay's multi-provider liquidity aggregator: smart routing, failover, and best-rate guarantees.", hasH1: true },
  { url: "/sovereign-settlement", title: "Sovereign Settlement Whitepaper — MRC Global Pay", description: "Whitepaper on sovereign, non-custodial settlement architecture for cross-chain crypto swaps.", hasH1: true },
  { url: "/permanent-bridge/whitepaper", title: "Permanent Bridge Whitepaper — MRC Global Pay", description: "Technical whitepaper for the Permanent Bridge: stateless, fixed-address, recurring crypto conversions.", hasH1: true },
  { url: "/private-transfer/whitepaper", title: "Shielded Transfer Whitepaper — MRC Global Pay", description: "Technical whitepaper for shielded private crypto transfers using Monero-grade privacy guarantees.", hasH1: true },
  { url: "/blog/whitepapers/crypto-loans", title: "Crypto Loans Whitepaper — MRC Global Pay", description: "Whitepaper on MRC Global Pay's crypto-collateralized lending model: source-back payouts, institutional custody.", hasH1: true },
  { url: "/blog/whitepapers/digital-yield", title: "Digital Yield Whitepaper — MRC Global Pay", description: "Whitepaper on MRC Global Pay's digital yield architecture: APYs, custody model and risk disclosures.", hasH1: true },
  { url: "/whitepapers/nicehash-mining-payout-strategy", title: "NiceHash Mining Payout Strategy Whitepaper | MRC Global Pay", description: "Strategy whitepaper for NiceHash miners: optimize payout routing through MRC Global Pay's $0.30-min swap engine.", hasH1: true },
  { url: "/research/paxg-vs-xaut-2026", title: "PAXG vs XAUt 2026 — Tokenized Gold Research | MRC Global Pay", description: "Detailed 2026 research comparing PAX Gold (PAXG) and Tether Gold (XAUt) on liquidity, custody, and redemption.", hasH1: true },
  { url: "/research/ravedao-rave-token-analysis-2026", title: "RaveDAO RAVE Token Analysis 2026 | MRC Global Pay", description: "2026 research on RaveDAO and the RAVE token: tokenomics, ecosystem, liquidity and swap routes.", hasH1: true },
  { url: "/ecosystem/solana", title: "Solana Ecosystem — Tokens, dApps & Swaps | MRC Global Pay", description: "Explore the Solana ecosystem: top SPL tokens, dApps and instant SOL swaps from $0.30 with no account.", hasH1: true },
  { url: "/ecosystem/solana-ai", title: "Solana AI Tokens — Top AI Coins on Solana | MRC Global Pay", description: "Top AI tokens on Solana for 2026 with instant swaps from $0.30. Non-custodial, no account, MSB-registered.", hasH1: true },
  { url: "/tools/crypto-dust-calculator", title: "Crypto Dust Calculator — Estimate Sub-$1 Swap Value | MRC Global Pay", description: "Free crypto dust calculator. Estimate the USD value of tiny token balances and swap them from $0.30.", hasH1: true },
  { url: "/resources/crypto-dust-guide", title: "Crypto Dust Guide — Convert Tiny Balances | MRC Global Pay", description: "Complete guide to crypto dust: what it is, why it accumulates, and how to convert it from $0.30.", hasH1: true },
  { url: "/resources/fractal-bitcoin-swap", title: "Fractal Bitcoin Swap Guide — FB Asset Conversion | MRC Global Pay", description: "How to swap Fractal Bitcoin (FB) instantly. Non-custodial, $0.30 minimum, MSB-registered.", hasH1: true },
];

// ------- Auditor -------

function evaluate(row: Omit<SeoAuditRow, "issues" | "fixHint"> & { fixHint: string }): SeoAuditRow {
  const issues: SeoIssue[] = [];

  if (!row.title || row.title.trim().length === 0) {
    issues.push({ severity: "error", field: "title", message: "Missing <title>." });
  } else if (row.titleLength < TITLE_MIN) {
    issues.push({ severity: "warning", field: "title", message: `Title too short (${row.titleLength} chars; aim for ${TITLE_MIN}–${TITLE_MAX}).` });
  } else if (row.titleLength > TITLE_MAX) {
    issues.push({ severity: "warning", field: "title", message: `Title too long (${row.titleLength} chars; max ${TITLE_MAX}).` });
  }

  if (!row.description || row.description.trim().length === 0) {
    issues.push({ severity: "error", field: "description", message: "Missing meta description." });
  } else if (row.descriptionLength < DESC_MIN) {
    issues.push({ severity: "warning", field: "description", message: `Description too short (${row.descriptionLength} chars; aim for ${DESC_MIN}–${DESC_MAX}).` });
  } else if (row.descriptionLength > DESC_MAX) {
    issues.push({ severity: "warning", field: "description", message: `Description too long (${row.descriptionLength} chars; max ${DESC_MAX}).` });
  }

  if (!row.hasH1) {
    issues.push({ severity: "error", field: "h1", message: "Missing <h1>." });
  }

  return { ...row, issues };
}

export function auditAllPages(): SeoAuditRow[] {
  const rows: SeoAuditRow[] = [];

  // 1. Keyword landing pages (generated via KeywordLanding component)
  for (const kw of seoKeywords) {
    const title = buildKeywordTitle(kw);
    const description = buildKeywordDescription(kw);
    const fixHint = kw.customTitle && kw.customDescription
      ? `src/lib/seo-keywords.ts → keyword "${kw.keyword}" (customTitle/customDescription)`
      : `src/lib/seo-keywords.ts → keyword "${kw.keyword}" (add customTitle / customDescription)`;
    rows.push(
      evaluate({
        url: kw.targetUrl,
        source: "KeywordLanding",
        title,
        titleLength: title.length,
        description,
        descriptionLength: description.length,
        hasH1: !!kw.primaryH1,
        h1Sample: kw.primaryH1,
        fixHint,
      }),
    );
  }

  // 2. Manually-registered static pages
  for (const p of STATIC_PAGES) {
    rows.push(
      evaluate({
        url: p.url,
        source: p.source ?? "Static page",
        title: p.title,
        titleLength: p.title.length,
        description: p.description,
        descriptionLength: p.description.length,
        hasH1: p.hasH1,
        h1Sample: p.h1Sample,
        fixHint: `Edit page file for ${p.url} → update <Helmet> title/description and verify <h1>.`,
      }),
    );
  }

  return rows;
}

export function summarize(rows: SeoAuditRow[]) {
  let errors = 0;
  let warnings = 0;
  let ok = 0;
  for (const r of rows) {
    if (r.issues.some((i) => i.severity === "error")) errors++;
    else if (r.issues.some((i) => i.severity === "warning")) warnings++;
    else ok++;
  }
  return { total: rows.length, errors, warnings, ok };
}
