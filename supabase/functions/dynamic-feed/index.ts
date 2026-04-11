import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE = "https://mrcglobalpay.com";
const LANGS = ["es","pt","fr","ja","fa","ur","he","af","hi","vi","tr","uk"];

/* ── All known swap-pair / guide URLs (auto-expanded) ── */
const SWAP_SLUGS = [
  "sol-usdt","btc-usdc","hype-usdt","eth-sol","xrp-usdt","bera-usdt","tia-usdt",
  "monad-usdt","pyusd-usdt","bnb-usdc","usdt-to-trx","usdt-to-sol","usdt-to-ltc",
  "usdt-to-solana","usdc-sol","usdc-solana","usd-to-xmr","xmr-to-eth","bnb-to-sol",
  "bnb","shiba-to-usdt","vinu","eth-to-sol","btc-to-sol-instant","30-trx-to-usdt",
  "usdt-trx-instant","solana-to-idr",
  /* swap-solutions-data slugs */
  "btc-to-usdc","btc-to-usdt","btc-to-sol","eth-to-usdt","eth-to-sol","sol-to-usdc",
  "xrp-to-usdt","ltc-to-btc","trx-to-usdt","hype-to-usdt","bera-to-usdt","doge-to-btc",
  "bonk-to-sol","pepe-to-usdc","xmr-to-eth","shib-to-usdt","sol-to-ondo","sol-to-nos",
  "sol-to-jupsol",
];

const SOLUTION_SLUGS = [
  "btc-to-usdc","btc-to-usdt","btc-to-sol","eth-to-usdt","eth-to-sol","sol-to-usdc",
  "xrp-to-usdt","ltc-to-btc","trx-to-usdt","hype-to-usdt","bera-to-usdt","doge-to-btc",
  "bonk-to-sol","pepe-to-usdc","xmr-to-eth","shib-to-usdt","sol-to-ondo","sol-to-nos",
  "sol-to-jupsol",
];

const BRIDGE_SLUGS = ["eth-to-sol","solana-to-bnb","pulsechain"];

const STATIC_PAGES = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/blog", changefreq: "hourly", priority: "0.9" },
  { loc: "/compare", changefreq: "weekly", priority: "0.8" },
  { loc: "/solutions", changefreq: "weekly", priority: "0.8" },
  { loc: "/learn", changefreq: "weekly", priority: "0.7" },
  { loc: "/status", changefreq: "always", priority: "0.6" },
  { loc: "/developer", changefreq: "monthly", priority: "0.9" },
  { loc: "/developers", changefreq: "monthly", priority: "0.9" },
  { loc: "/get-widget", changefreq: "monthly", priority: "0.7" },
  { loc: "/referral", changefreq: "monthly", priority: "0.6" },
  { loc: "/about", changefreq: "monthly", priority: "0.5" },
  { loc: "/ecosystem/solana", changefreq: "weekly", priority: "0.8" },
  { loc: "/ecosystem/solana-ai", changefreq: "weekly", priority: "0.7" },
  { loc: "/private-transfer", changefreq: "monthly", priority: "0.7" },
  { loc: "/permanent-bridge", changefreq: "monthly", priority: "0.7" },
  { loc: "/tools/crypto-dust-calculator", changefreq: "monthly", priority: "0.6" },
  { loc: "/privacy", changefreq: "monthly", priority: "0.3" },
  { loc: "/terms", changefreq: "monthly", priority: "0.3" },
  { loc: "/aml", changefreq: "monthly", priority: "0.3" },
];

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function hreflangBlock(path: string): string {
  // Only generate hreflang for base (non-lang-prefixed) paths
  const isLangPrefixed = LANGS.some(l => path === `/${l}` || path.startsWith(`/${l}/`));
  if (isLangPrefixed) return "";
  
  const enUrl = `${SITE}${path}`;
  const links = [
    `    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />`,
    ...LANGS.map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}/${l}${path}" />`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />`,
  ];
  return links.join("\n");
}

function urlEntry(path: string, lastmod: string, changefreq: string, priority: string): string {
  return `  <url>
    <loc>${SITE}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${hreflangBlock(path)}
  </url>`;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const format = url.searchParams.get("format") || "sitemap";

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, published_at, updated_at, author_name, category")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  const blogPosts = posts || [];
  const today = new Date().toISOString().split("T")[0];

  if (format === "rss") {
    const items = blogPosts
      .map((p: any) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${SITE}/blog/${p.slug}</link>
      <guid isPermaLink="true">${SITE}/blog/${p.slug}</guid>
      <description>${escapeXml(p.excerpt)}</description>
      <dc:creator>${escapeXml(p.author_name)}</dc:creator>
      <pubDate>${new Date(p.published_at).toUTCString()}</pubDate>
      <category>${escapeXml(p.category)}</category>
    </item>`)
      .join("\n");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
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

  /* ── Dynamic Sitemap ── */
  const entries: string[] = [];

  // Static pages
  for (const p of STATIC_PAGES) {
    entries.push(urlEntry(p.loc, today, p.changefreq, p.priority));
    // Language variants
    for (const lang of LANGS) {
      entries.push(urlEntry(`/${lang}${p.loc === "/" ? "" : p.loc}`, today, p.changefreq, "0.7"));
    }
  }

  // Swap pairs (changefreq: always — prices update constantly)
  const uniqueSwaps = [...new Set(SWAP_SLUGS)];
  for (const slug of uniqueSwaps) {
    entries.push(urlEntry(`/swap/${slug}`, today, "always", "0.8"));
    for (const lang of LANGS) {
      entries.push(urlEntry(`/${lang}/swap/${slug}`, today, "always", "0.7"));
    }
  }

  // Solutions
  const uniqueSolutions = [...new Set(SOLUTION_SLUGS)];
  for (const slug of uniqueSolutions) {
    entries.push(urlEntry(`/solutions/how-to-swap-${slug}`, today, "weekly", "0.8"));
  }

  // Bridges
  for (const slug of BRIDGE_SLUGS) {
    entries.push(urlEntry(`/bridge/${slug}`, today, "weekly", "0.7"));
  }

  // Blog posts
  for (const p of blogPosts) {
    const lastmod = ((p as any).updated_at || (p as any).published_at).split("T")[0];
    entries.push(urlEntry(`/blog/${(p as any).slug}`, lastmod, "weekly", "0.8"));
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
});
