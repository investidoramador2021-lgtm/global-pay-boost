import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE = "https://mrcglobalpay.com";
const LANGS = ["es", "pt", "fr", "ja", "fa", "ur", "he", "af", "hi", "vi", "tr", "uk"];
const ALL_HREFLANGS = ["en", ...LANGS];

/* ─────────────────────────────────────────────────────────────────────────────
 * ROUTE INVENTORY — mirrors src/App.tsx. Anything indexable lives here.
 * Routes flagged `localized: true` get a full hreflang block across 13 langs
 * AND get one <url> per language so search engines surface the translation.
 * ────────────────────────────────────────────────────────────────────────── */

type RouteSpec = {
  loc: string;
  changefreq: string;
  priority: string;
  localized?: boolean;
};

const STATIC_ROUTES: RouteSpec[] = [
  // Core
  { loc: "/", changefreq: "daily", priority: "1.0", localized: true },
  { loc: "/about", changefreq: "monthly", priority: "0.5", localized: true },
  { loc: "/blog", changefreq: "hourly", priority: "0.9", localized: true },

  // Products
  { loc: "/lend", changefreq: "daily", priority: "0.9", localized: true },
  { loc: "/private-transfer", changefreq: "monthly", priority: "0.8", localized: true },
  { loc: "/permanent-bridge", changefreq: "monthly", priority: "0.8", localized: true },
  { loc: "/get-widget", changefreq: "monthly", priority: "0.7", localized: true },
  { loc: "/embed/widget", changefreq: "monthly", priority: "0.6" },

  // Programs / Partners
  { loc: "/affiliates", changefreq: "weekly", priority: "0.9", localized: true },
  { loc: "/partners", changefreq: "monthly", priority: "0.8", localized: true },
  { loc: "/referral", changefreq: "monthly", priority: "0.7", localized: true },

  // Directories (each has child slug pages)
  { loc: "/directory", changefreq: "weekly", priority: "0.7" },
  { loc: "/compare", changefreq: "weekly", priority: "0.8" },
  { loc: "/solutions", changefreq: "weekly", priority: "0.8" },
  { loc: "/learn", changefreq: "weekly", priority: "0.8" },

  // Hand-built swap landing pages (English-only — registered in App.tsx)
  { loc: "/swap/sol-usdt", changefreq: "weekly", priority: "0.8" },
  { loc: "/swap/btc-usdc", changefreq: "weekly", priority: "0.8" },
  { loc: "/swap/hype-usdt", changefreq: "weekly", priority: "0.8" },
  { loc: "/swap/eth-sol", changefreq: "weekly", priority: "0.8" },
  { loc: "/swap/xrp-usdt", changefreq: "weekly", priority: "0.8" },
  { loc: "/swap/bera-usdt", changefreq: "weekly", priority: "0.8" },
  { loc: "/swap/tia-usdt", changefreq: "weekly", priority: "0.8" },
  { loc: "/swap/monad-usdt", changefreq: "weekly", priority: "0.8" },
  { loc: "/swap/pyusd-usdt", changefreq: "weekly", priority: "0.8" },
  { loc: "/swap/bnb-usdc", changefreq: "weekly", priority: "0.8" },

  // Ecosystem hubs
  { loc: "/ecosystem/solana", changefreq: "weekly", priority: "0.8" },
  { loc: "/ecosystem/solana-ai", changefreq: "weekly", priority: "0.7" },
  { loc: "/resources/fractal-bitcoin-swap", changefreq: "monthly", priority: "0.6" },

  // Authority / Research
  { loc: "/research/paxg-vs-xaut-2026", changefreq: "monthly", priority: "0.8" },
  { loc: "/research/ravedao-rave-token-analysis-2026", changefreq: "monthly", priority: "0.8" },

  // Whitepapers
  { loc: "/permanent-bridge/whitepaper", changefreq: "monthly", priority: "0.6" },
  { loc: "/private-transfer/whitepaper", changefreq: "monthly", priority: "0.6" },
  { loc: "/liquidity-expansion", changefreq: "monthly", priority: "0.6" },
  { loc: "/sovereign-settlement", changefreq: "monthly", priority: "0.6" },
  { loc: "/blog/whitepapers/crypto-loans", changefreq: "monthly", priority: "0.6" },
  { loc: "/blog/whitepapers/digital-yield", changefreq: "monthly", priority: "0.6" },

  // Crypto-dust topical cluster
  { loc: "/crypto-dust-solutions", changefreq: "monthly", priority: "0.7" },
  { loc: "/guide/crypto-dust", changefreq: "monthly", priority: "0.6" },
  { loc: "/dust-swap-comparison", changefreq: "monthly", priority: "0.5" },
  { loc: "/resources/crypto-dust-guide", changefreq: "monthly", priority: "0.6" },
  { loc: "/tools/crypto-dust-calculator", changefreq: "monthly", priority: "0.6" },

  // Trust / Legal / Status
  { loc: "/transparency-security", changefreq: "monthly", priority: "0.6" },
  { loc: "/compliance", changefreq: "monthly", priority: "0.5" },
  { loc: "/developers", changefreq: "monthly", priority: "0.7" },
  { loc: "/developer", changefreq: "monthly", priority: "0.6" },
  { loc: "/status", changefreq: "always", priority: "0.6" },
  { loc: "/privacy", changefreq: "monthly", priority: "0.3" },
  { loc: "/terms", changefreq: "monthly", priority: "0.3" },
  { loc: "/aml", changefreq: "monthly", priority: "0.3" },
];

/* Inline data extraction — tiny set, parsed at boot. Avoids importing /src. */

// Keyword-driven landing pages — sourced from src/lib/seo-keywords.ts targets.
// Filtered to deduped, non-canonicalized URLs that actually render via KeywordPage.
const KEYWORD_URLS: string[] = [
  "/swap/usdt-to-trx", "/buy/bitcoin-no-verification", "/swap/usd-to-xmr",
  "/swap/usdt-to-sol", "/local-crypto-exchange", "/guides/is-solana-a-good-investment",
  "/tools/ltc-tracker", "/buy/monero-no-kyc", "/buy/solana-no-kyc",
  "/guides/wrapped-btc-to-bitcoin", "/exchange-iu", "/guides/buy-xmr-orange-fren-alternative",
  "/guides/litecoin-mining", "/swap/solana-to-idr", "/swap/usdt-to-ltc",
  "/trade/bnb-meme-coins", "/buy/solana-paypal", "/guides/how-to-buy-litecoin",
  "/tools/instant-rate-change", "/ecosystem/jambo-solana", "/tools/litecoin-tracker",
  "/swap/usdc-solana", "/guides/best-short-term-crypto", "/swap/bnb-to-sol",
  "/ecosystem/dag-crypto", "/reviews/tangem-wallet", "/alternatives/topper-crypto",
  "/buy/bitcoin-no-kyc", "/price/harmony-one", "/guides/how-to-mine-litecoin",
  "/swap/bnb", "/ecosystem/dag-coins", "/ecosystem/dusd",
  "/guides/how-to-trade-meme-coins", "/swap/shiba-to-usdt", "/ecosystem/vinu",
  "/guides/btc-to-sol-instant", "/swap/30-trx-to-usdt", "/swap/usdt-trx-instant",
  "/buy/crypto-no-kyc", "/buy/eth-no-kyc", "/buy/usdt-no-kyc",
  "/swap/btc-to-eth", "/swap/btc-to-usdt", "/swap/eth-to-usdt",
  "/swap/sol-to-usdc", "/swap/xrp-to-usdt", "/swap/ltc-to-btc",
  "/swap/trx-to-usdt", "/swap/doge-to-btc", "/swap/bonk-to-sol",
  "/swap/pepe-to-usdc", "/swap/xmr-to-eth", "/swap/shib-to-usdt",
  "/guides/non-custodial-swap", "/guides/instant-swap", "/guides/no-kyc-exchange",
  "/alternatives/changenow", "/alternatives/changelly", "/alternatives/simpleswap",
  "/alternatives/stealthex", "/alternatives/exolix", "/alternatives/fixedfloat",
  "/alternatives/houdiniswap", "/reviews/coinrabbit", "/reviews/ledger-wallet",
  "/reviews/trezor-wallet", "/price/solana", "/price/bitcoin",
  "/price/ethereum", "/price/litecoin", "/price/monero",
  "/bridge/eth-to-sol", "/bridge/solana-to-bnb", "/bridge/pulsechain",
];

// Authority/Learn articles — slugs from src/lib/authority-hub-data.ts
const LEARN_SLUGS = [
  "why-non-custodial-is-safer", "canadian-fintrac-msb", "our-liquidity-partners",
  "swap-without-registration", "tracking-your-micro-swap",
];

// Compare slugs — sourced from src/lib/competitor-data.ts (non-exhaustive; keep
// in sync when new competitors are added).
const COMPARE_SLUGS = [
  "changenow", "changelly", "simpleswap", "stealthex", "exolix", "fixedfloat",
  "houdiniswap", "godex", "letsexchange", "swapuz", "swapzone", "majesticbank",
  "kraken", "coinbase", "binance", "kucoin", "okx", "bybit", "bitfinex", "gemini",
  "crypto-com", "uniswap", "1inch", "thorswap", "rango", "rubic", "jumper",
  "bungee", "li-fi", "across-protocol", "stargate", "hop-protocol", "synapse",
  "celer", "wormhole", "axelar", "layerzero", "debridge", "chainflip", "atomic-wallet",
  "trust-wallet", "metamask-swap", "phantom-swap", "exodus", "guarda", "edge-wallet",
  "bestchange", "exchanger24", "switchere", "moonpay", "transak", "ramp",
];

// Solution slugs — high-intent how-to-swap pages from src/lib/swap-solutions-data.ts
const SOLUTION_SLUGS = [
  "btc-to-usdc", "btc-to-usdt", "btc-to-sol", "eth-to-usdt", "eth-to-sol",
  "sol-to-usdc", "xrp-to-usdt", "ltc-to-btc", "trx-to-usdt", "hype-to-usdt",
  "bera-to-usdt", "doge-to-btc", "bonk-to-sol", "pepe-to-usdc", "xmr-to-eth",
  "shib-to-usdt", "sol-to-ondo", "sol-to-nos", "sol-to-jupsol", "ada-to-usdt",
  "dot-to-usdt", "atom-to-usdt", "near-to-usdt", "avax-to-usdt", "matic-to-usdt",
];

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

/**
 * Build hreflang alternates for a localized route.
 * Bidirectional: every variant emits the same set of alternates including
 * a self-reference and x-default → English. Without this, Google reports
 * variants as "Duplicate, Google chose different canonical".
 */
function hreflangBlock(path: string): string {
  const lines: string[] = [];
  for (const lang of ALL_HREFLANGS) {
    const href = lang === "en" ? `${SITE}${path}` : `${SITE}/${lang}${path === "/" ? "" : path}`;
    lines.push(`    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}" />`);
  }
  lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${path}" />`);
  return lines.join("\n");
}

function urlEntry(path: string, lastmod: string, changefreq: string, priority: string, withHreflang: boolean): string {
  return `  <url>
    <loc>${SITE}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${withHreflang ? "\n" + hreflangBlock(path) : ""}
  </url>`;
}

/**
 * Emit one <url> per language for a localized route, plus the canonical
 * English URL. Each entry carries the full hreflang alternate set so any
 * variant can be picked up directly by IndexNow / Google Search Console.
 */
function localizedEntries(path: string, lastmod: string, changefreq: string, priority: string): string[] {
  const out: string[] = [];
  // English (canonical)
  out.push(urlEntry(path, lastmod, changefreq, priority, true));
  // Translated variants — slightly lower priority to signal canonical hierarchy.
  const trPriority = (Math.max(0.1, parseFloat(priority) - 0.2)).toFixed(1);
  for (const lang of LANGS) {
    const trPath = path === "/" ? `/${lang}` : `/${lang}${path}`;
    out.push(urlEntry(trPath, lastmod, changefreq, trPriority, true));
  }
  return out;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const format = url.searchParams.get("format") || "sitemap";

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const today = new Date().toISOString().split("T")[0];

  // ── Blog posts ──
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, published_at, updated_at, author_name, category")
    .eq("is_published", true)
    .order("published_at", { ascending: false });
  const blogPosts = posts || [];

  /* ───── RSS branch ───── */
  if (format === "rss") {
    const items = blogPosts.map((p: any) => {
      const altLinks = LANGS.map(
        (l) => `      <atom:link rel="alternate" hreflang="${l}" href="${SITE}/${l}/blog/${p.slug}" />`
      ).join("\n");
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${SITE}/blog/${p.slug}</link>
      <guid isPermaLink="true">${SITE}/blog/${p.slug}</guid>
      <description>${escapeXml(p.excerpt || "")}</description>
      <dc:creator>${escapeXml(p.author_name || "MRC GlobalPay")}</dc:creator>
      <pubDate>${new Date(p.published_at).toUTCString()}</pubDate>
      <category>${escapeXml(p.category || "")}</category>
      <atom:link rel="alternate" hreflang="en" href="${SITE}/blog/${p.slug}" />
${altLinks}
      <atom:link rel="alternate" hreflang="x-default" href="${SITE}/blog/${p.slug}" />
    </item>`;
    }).join("\n");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <channel>
    <title>MRC GlobalPay Blog</title>
    <link>${SITE}/blog</link>
    <description>Expert guides, market analysis, and security insights for cryptocurrency trading and instant swaps.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
    return new Response(rss, {
      headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
    });
  }

  /* ───── Sitemap branch ───── */

  // ── DB-driven exchange pairs (single-shot RPC, bypasses 1k row cap) ──
  const { data: pairsJson, error: pairsErr } = await supabase.rpc("get_valid_pair_slugs_json");
  if (pairsErr) console.error("[sitemap] pairs rpc error:", pairsErr.message);
  const allPairs = ((pairsJson ?? []) as Array<{ from_ticker: string; to_ticker: string; updated_at: string }>);

  const entries: string[] = [];
  const seen = new Set<string>();
  const push = (e: string, key: string) => {
    if (seen.has(key)) return;
    seen.add(key);
    entries.push(e);
  };

  // Static routes (with localized expansion where flagged)
  for (const r of STATIC_ROUTES) {
    if (r.localized) {
      for (const e of localizedEntries(r.loc, today, r.changefreq, r.priority)) {
        const m = e.match(/<loc>([^<]+)<\/loc>/);
        push(e, m ? m[1] : e);
      }
    } else {
      push(urlEntry(r.loc, today, r.changefreq, r.priority, false), r.loc);
    }
  }

  // Keyword landing pages (English-only routes — KeywordPage doesn't translate)
  for (const k of KEYWORD_URLS) {
    push(urlEntry(k, today, "weekly", "0.7", false), k);
  }

  // Learn / authority articles
  for (const slug of LEARN_SLUGS) {
    push(urlEntry(`/learn/${slug}`, today, "monthly", "0.7", false), `/learn/${slug}`);
  }

  // Compare pages
  for (const slug of COMPARE_SLUGS) {
    push(urlEntry(`/compare/${slug}`, today, "weekly", "0.7", false), `/compare/${slug}`);
  }

  // Solution pages
  for (const slug of SOLUTION_SLUGS) {
    const p = `/solutions/how-to-swap-${slug}`;
    push(urlEntry(p, today, "weekly", "0.7", false), p);
  }

  // Dynamic exchange pairs (each gets full 13-language hreflang block since
  // /exchange/:pair is wrapped in LangLayout)
  for (const p of allPairs) {
    const slug = `${p.from_ticker}-to-${p.to_ticker}`.toLowerCase();
    const lastmod = p.updated_at ? p.updated_at.split("T")[0] : today;
    const path = `/exchange/${slug}`;
    for (const e of localizedEntries(path, lastmod, "weekly", "0.7")) {
      const m = e.match(/<loc>([^<]+)<\/loc>/);
      push(e, m ? m[1] : e);
    }
  }

  // Blog posts (localized — blog post route is inside LangLayout)
  for (const p of blogPosts as any[]) {
    const lastmod = (p.updated_at || p.published_at || "").split("T")[0] || today;
    const path = `/blog/${p.slug}`;
    for (const e of localizedEntries(path, lastmod, "weekly", "0.8")) {
      const m = e.match(/<loc>([^<]+)<\/loc>/);
      push(e, m ? m[1] : e);
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Sitemap-Url-Count": String(entries.length),
    },
  });
});
