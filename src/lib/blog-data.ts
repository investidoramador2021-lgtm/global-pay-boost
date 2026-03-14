import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  author: BlogAuthor;
  publishedAt: string;
  updatedAt: string;
  readTime: string;
  category: string;
  tags: string[];
  content: string;
}

export interface BlogAuthor {
  name: string;
  role: string;
  bio: string;
  credentials: string;
}

// Static seed posts (fallback + always available)
const seedAuthors = {
  danielCarter: {
    name: "Daniel Carter",
    role: "Senior Blockchain Analyst",
    bio: "Daniel has spent eight years working across crypto trading desks, first at Cumberland DRW and later at a mid-cap digital asset fund. He now writes about market microstructure, swap execution, and DeFi infrastructure. He holds a CFA charter and a Master's in Financial Engineering from Columbia University.",
    credentials: "CFA Charterholder · Columbia MFE · 8 years in digital asset trading",
  },
  sophiaRamirez: {
    name: "Sophia Ramirez",
    role: "DeFi Infrastructure Researcher",
    bio: "Sophia spent four years as a protocol engineer at a Layer 1 blockchain before transitioning to research and education. She specializes in AMM design, cross-chain bridging, and liquidity aggregation architecture. Her work has been cited by Messari, The Block, and Delphi Digital.",
    credentials: "Former L1 Protocol Engineer · Published in Messari & The Block · MSc Computer Science, ETH Zurich",
  },
  marcusChen: {
    name: "Marcus Chen",
    role: "Cybersecurity Lead & Crypto Security Advisor",
    bio: "Marcus has fifteen years in information security, including six years focused on cryptocurrency custody, wallet security, and exchange infrastructure. He previously led the security team at a top-20 centralized exchange and now advises DeFi protocols on threat modeling.",
    credentials: "CISSP · OSCP · Former Security Lead at top-20 CEX · 15 years in InfoSec",
  },
  elenaVolkova: {
    name: "Elena Volkova",
    role: "Crypto Markets Strategist",
    bio: "Elena worked as a quantitative analyst at Jane Street before moving into crypto full-time in 2021. She covers macro trends, on-chain analytics, and trading pair dynamics for institutional and retail audiences. She contributes market commentary to CoinDesk and Blockworks.",
    credentials: "Former Quant Analyst, Jane Street · CoinDesk & Blockworks contributor · MSc Mathematics, MIT",
  },
};

// Convert DB row to BlogPost
function dbRowToPost(row: any): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    excerpt: row.excerpt,
    author: {
      name: row.author_name,
      role: row.author_role,
      bio: row.author_bio,
      credentials: row.author_credentials || "",
    },
    publishedAt: row.published_at?.split("T")[0] || row.published_at,
    updatedAt: row.updated_at?.split("T")[0] || row.updated_at,
    readTime: row.read_time,
    category: row.category,
    tags: row.tags || [],
    content: row.content,
  };
}

// Fetch all published posts from database
export async function fetchAllPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching blog posts:", error);
    return SEED_POSTS;
  }

  const dbPosts = (data || []).map(dbRowToPost);

  // Merge: DB posts first, then seed posts that aren't in DB
  const dbSlugs = new Set(dbPosts.map((p) => p.slug));
  const uniqueSeedPosts = SEED_POSTS.filter((p) => !dbSlugs.has(p.slug));

  return [...dbPosts, ...uniqueSeedPosts];
}

// Fetch single post by slug
export async function fetchPostBySlug(slug: string): Promise<BlogPost | undefined> {
  // Try DB first
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (data) return dbRowToPost(data);

  // Fallback to seed posts
  return SEED_POSTS.find((p) => p.slug === slug);
}

// Get related posts
export async function fetchRelatedPosts(currentSlug: string, count = 3): Promise<BlogPost[]> {
  const allPosts = await fetchAllPosts();
  return allPosts.filter((p) => p.slug !== currentSlug).slice(0, count);
}

// ── SEED POSTS (kept as static fallback) ──────────────────────────

export const SEED_POSTS: BlogPost[] = [
  {
    slug: "how-to-swap-bitcoin-to-ethereum-2026",
    title: "How to Swap Bitcoin to Ethereum in 2026: The Complete Guide for Every Experience Level",
    metaTitle: "How to Swap BTC to ETH in 2026 — Fast, Safe & No Account",
    metaDescription: "Learn how to swap Bitcoin to Ethereum in under 60 seconds without registration. Step-by-step guide covering best rates, security, and zero-delay settlement.",
    excerpt: "A detailed walkthrough covering why traders convert BTC to ETH, how instant swap technology works under the hood, step-by-step execution, fee structures, and critical security practices.",
    author: seedAuthors.danielCarter,
    publishedAt: "2026-03-10",
    updatedAt: "2026-03-14",
    readTime: "14 min read",
    category: "Guides",
    tags: ["Bitcoin", "Ethereum", "Swap", "Tutorial"],
    content: `I've been doing BTC-to-ETH swaps since 2019 — back when the process involved depositing Bitcoin on a centralized exchange, waiting for six confirmations, placing a limit order, and then withdrawing ETH while paying whatever fee the exchange felt like charging.

The process in 2026 looks nothing like that. This guide walks through exactly how to do it, why you'd want to, and the things that can go wrong.

## Why Traders Swap Bitcoin to Ethereum

**Bitcoin is digital gold.** You hold it. **Ethereum is a platform.** It runs applications — DeFi, NFTs, DAOs. To participate, you need ETH.

### 1. Accessing DeFi Yield

Ethereum's DeFi ecosystem has roughly $185 billion in TVL. Lido's stETH generates approximately 4.2% APY.

### 2. Portfolio Rebalancing

The BTC/ETH ratio has been volatile in early 2026. Traders maintaining target allocations periodically rebalance.

### 3. Gas for On-Chain Activity

If you want to do anything on Ethereum, you need ETH for gas.

## Step-by-Step: Swapping BTC to ETH

### Step 1: Open the Exchange Widget

Navigate to [MRC GlobalPay's instant swap tool](/#exchange) — no account needed.

### Step 2: Configure Your Pair

Select **BTC** → **ETH**. Our [rate aggregation engine](/blog/understanding-crypto-liquidity-aggregation) pulls live quotes from 10+ providers.

### Step 3: Enter Amount and Wallet Address

Triple-check your ETH receiving address. Clipboard hijacking malware is real.

### Step 4: Send & Track

Settlement typically completes in **30–90 seconds**.

## Security Practices

Read our full [crypto security guide](/blog/crypto-security-best-practices-2026) for detailed best practices. Key points: bookmark the URL, verify addresses, start with small test swaps.

Read our [AML Policy](/aml) and [Privacy Policy](/privacy) for details on data handling.

## Related Swap Pairs

- [Swap SOL to USDT](/swap/sol-usdt)
- [Swap ETH to SOL](/swap/eth-sol)
- [Swap BTC to USDC](/swap/btc-usdc)
- [Swap HYPE to USDT](/swap/hype-usdt)
- [Swap XRP to USDT](/swap/xrp-usdt)`,
  },
  {
    slug: "understanding-crypto-liquidity-aggregation",
    title: "How Crypto Liquidity Aggregation Actually Works: A Technical Deep Dive",
    metaTitle: "Crypto Liquidity Aggregation Explained — Best Swap Rates 2026",
    metaDescription: "Learn how liquidity aggregation technology finds the best crypto swap rates across 10+ providers. Understand slippage, rate optimization, and instant settlement.",
    excerpt: "A technical explanation of how aggregation engines source prices, route trades, manage counterparty risk, and deliver optimal execution.",
    author: seedAuthors.sophiaRamirez,
    publishedAt: "2026-03-08",
    updatedAt: "2026-03-14",
    readTime: "16 min read",
    category: "Education",
    tags: ["Liquidity", "DeFi", "Trading", "Technology"],
    content: `Liquidity aggregation sources prices from multiple exchanges simultaneously, routing your trade through whichever offers the best rate.

This is the technology powering [MRC GlobalPay's instant swap engine](/#exchange).

## How It Works

1. **Parallel Queries** — simultaneous requests to 10+ providers
2. **Fee Normalization** — adjusting for fees, spreads, gas
3. **Optimal Routing** — best net rate selected
4. **Rate Locking** — protection against volatility

Read the [BTC to ETH guide](/blog/how-to-swap-bitcoin-to-ethereum-2026) for a practical walkthrough.

## Popular Pairs

- [SOL to USDT](/swap/sol-usdt)
- [BTC to USDC](/swap/btc-usdc)
- [HYPE to USDT](/swap/hype-usdt)
- [BERA to USDC](/swap/bera-usdt)

[Start your first swap now](/#exchange).`,
  },
  {
    slug: "crypto-security-best-practices-2026",
    title: "Practical Crypto Security in 2026: What Actually Works and What's Theater",
    metaTitle: "Crypto Security Guide 2026 — Protect Your Wallet & Swaps",
    metaDescription: "Essential cryptocurrency security practices for 2026. Learn wallet safety, swap security, phishing prevention, and how non-custodial exchanges protect your funds.",
    excerpt: "A no-nonsense security guide from a veteran cybersecurity professional — covering the threats that actually cause losses and the defenses that actually prevent them.",
    author: seedAuthors.marcusChen,
    publishedAt: "2026-03-05",
    updatedAt: "2026-03-14",
    readTime: "18 min read",
    category: "Security",
    tags: ["Security", "Wallet", "Best Practices", "Safety"],
    content: `The overwhelming majority of crypto losses are caused by preventable mistakes. Here's what actually works.

## Seed Phrase Protection

Write it on steel. Store it in a safe. Never type it on any website.

## Three-Wallet Strategy

- **Hot wallet**: Daily swaps ($200-500 max)
- **Hardware wallet**: Main holdings
- **Burner wallet**: Untested protocols

## Swap Security

When using [MRC GlobalPay](/#exchange): bookmark the URL, verify addresses, use hardware wallet for receiving.

Read our [Privacy Policy](/privacy) and [AML Policy](/aml).

## Further Reading

- [How to Swap BTC to ETH Safely](/blog/how-to-swap-bitcoin-to-ethereum-2026)
- [How Liquidity Aggregation Works](/blog/understanding-crypto-liquidity-aggregation)
- [Top Trading Pairs](/blog/top-crypto-trading-pairs-march-2026)`,
  },
  {
    slug: "top-crypto-trading-pairs-march-2026",
    title: "March 2026 Crypto Trading Pairs: Volume Analysis and Swap Opportunities",
    metaTitle: "Top Crypto Trading Pairs March 2026 — Volume & Trend Analysis",
    metaDescription: "Deep analysis of the most-traded crypto pairs in March 2026. BTC, ETH, SOL, HYPE, BERA volume trends and swap opportunities.",
    excerpt: "Data-driven monthly analysis covering what's moving, why institutional money is flowing where it is, and which pairs offer the best swap opportunities.",
    author: seedAuthors.elenaVolkova,
    publishedAt: "2026-03-01",
    updatedAt: "2026-03-14",
    readTime: "15 min read",
    category: "Market Analysis",
    tags: ["Trading", "Market Analysis", "Trends", "2026"],
    content: `March 2026 has brought structural shifts in crypto trading patterns.

## Top Pairs

1. **BTC/USDT** — $847B 30-day volume. [Swap BTC to USDC](/swap/btc-usdc)
2. **SOL/USDT** — Volume up 40% MoM. [Swap SOL to USDT](/swap/sol-usdt)
3. **ETH/SOL** — Ecosystem rotation trade. [Swap ETH to SOL](/swap/eth-sol)
4. **HYPE/USDT** — +112% YTD. [Swap HYPE to USDT](/swap/hype-usdt)
5. **BERA/USDC** — Proof-of-Liquidity innovation. [Swap BERA to USDC](/swap/bera-usdt)

Also watch: [TIA/USDT](/swap/tia-usdt), [MONAD/ETH](/swap/monad-usdt), [PYUSD/SOL](/swap/pyusd-usdt), [XRP/USDT](/swap/xrp-usdt).

For security tips, read our [security guide](/blog/crypto-security-best-practices-2026). For rate optimization, see [liquidity aggregation](/blog/understanding-crypto-liquidity-aggregation).

All pairs available for [instant swapping on MRC GlobalPay](/#exchange).`,
  },
];

// Legacy exports for backward compat
export const blogPosts = SEED_POSTS;
export const getPostBySlug = (slug: string) => SEED_POSTS.find((p) => p.slug === slug);
export const getRelatedPosts = (currentSlug: string, count = 3) =>
  SEED_POSTS.filter((p) => p.slug !== currentSlug).slice(0, count);
