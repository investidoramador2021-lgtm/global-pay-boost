import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE = "https://mrcglobalpay.com";

const STATIC_URLS = [
  { loc: `${SITE}/`, changefreq: "daily", priority: "1.0" },
  { loc: `${SITE}/blog`, changefreq: "hourly", priority: "0.9" },
  { loc: `${SITE}/swap/sol-usdt`, changefreq: "daily", priority: "0.9" },
  { loc: `${SITE}/swap/btc-usdc`, changefreq: "daily", priority: "0.9" },
  { loc: `${SITE}/swap/hype-usdt`, changefreq: "daily", priority: "0.9" },
  { loc: `${SITE}/swap/eth-sol`, changefreq: "daily", priority: "0.9" },
  { loc: `${SITE}/swap/xrp-usdt`, changefreq: "daily", priority: "0.9" },
  { loc: `${SITE}/swap/bera-usdt`, changefreq: "daily", priority: "0.9" },
  { loc: `${SITE}/swap/tia-usdt`, changefreq: "daily", priority: "0.9" },
  { loc: `${SITE}/swap/monad-usdt`, changefreq: "daily", priority: "0.9" },
  { loc: `${SITE}/swap/pyusd-usdt`, changefreq: "daily", priority: "0.9" },
  { loc: `${SITE}/privacy`, changefreq: "monthly", priority: "0.3" },
  { loc: `${SITE}/terms`, changefreq: "monthly", priority: "0.3" },
  { loc: `${SITE}/aml`, changefreq: "monthly", priority: "0.3" },
];

serve(async (req) => {
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
      .map(
        (p: any) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${SITE}/blog/${p.slug}</link>
      <guid isPermaLink="true">${SITE}/blog/${p.slug}</guid>
      <description>${escapeXml(p.excerpt)}</description>
      <dc:creator>${escapeXml(p.author_name)}</dc:creator>
      <pubDate>${new Date(p.published_at).toUTCString()}</pubDate>
      <category>${escapeXml(p.category)}</category>
    </item>`
      )
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

  // Default: sitemap
  const blogEntries = blogPosts
    .map(
      (p: any) => `  <url>
    <loc>${SITE}/blog/${p.slug}</loc>
    <lastmod>${(p.updated_at || p.published_at).split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("\n");

  const staticEntries = STATIC_URLS.map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  ).join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${blogEntries}
</urlset>`;

  return new Response(sitemap, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
});

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
