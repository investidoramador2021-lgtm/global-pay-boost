import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const BASE_URL = "https://mrcglobalpay.com";
const BATCH_SIZE = 5000;
const LANGS = ["", "es", "pt", "fr", "ja", "fa", "ur", "he", "af", "hi", "vi", "tr", "uk"];

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/dynamic-sitemap/, "") || "/";

  const svc = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Sitemap index
  if (path === "/" || path === "/index.xml") {
    const { count } = await svc
      .from("exchange_assets")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);
    const assetCount = count || 0;
    // Estimate pair count (n*(n-1) capped at reasonable number)
    const estimatedPairs = Math.min(assetCount * (assetCount - 1), 100000);
    const batchCount = Math.ceil(estimatedPairs / BATCH_SIZE);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/functions/v1/dynamic-sitemap/popular.xml</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </sitemap>`;

    for (let i = 1; i < batchCount; i++) {
      xml += `
  <sitemap>
    <loc>${BASE_URL}/functions/v1/dynamic-sitemap/batch-${i}.xml</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </sitemap>`;
    }

    xml += `\n</sitemapindex>`;
    return new Response(xml, {
      headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
    });
  }

  // Popular sitemap (Tier 1 assets)
  if (path === "/popular.xml") {
    const { data: tier1 } = await svc
      .from("exchange_assets")
      .select("ticker")
      .eq("is_active", true)
      .eq("tier", 1)
      .order("ticker");

    const tickers = [...new Set((tier1 || []).map((a: any) => a.ticker.toLowerCase()))];
    const pairs: string[] = [];
    for (const from of tickers) {
      for (const to of tickers) {
        if (from !== to) pairs.push(`${from}-to-${to}`);
      }
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

    for (const pair of pairs.slice(0, BATCH_SIZE)) {
      // English canonical
      xml += `
  <url>
    <loc>${BASE_URL}/exchange/${pair}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>`;
      for (const lang of LANGS) {
        const hreflang = lang || "en";
        const prefix = lang ? `/${lang}` : "";
        xml += `
    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${BASE_URL}${prefix}/exchange/${pair}" />`;
      }
      xml += `
  </url>`;
    }

    xml += `\n</urlset>`;
    return new Response(xml, {
      headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
    });
  }

  // Batch sitemaps
  const batchMatch = path.match(/^\/batch-(\d+)\.xml$/);
  if (batchMatch) {
    const batchIndex = parseInt(batchMatch[1]);
    const { data: assets } = await svc
      .from("exchange_assets")
      .select("ticker")
      .eq("is_active", true)
      .neq("tier", 1)
      .order("ticker");

    const tickers = [...new Set((assets || []).map((a: any) => a.ticker.toLowerCase()))];
    
    // Get tier1 for cross-pairs
    const { data: tier1 } = await svc
      .from("exchange_assets")
      .select("ticker")
      .eq("is_active", true)
      .eq("tier", 1);
    const tier1Tickers = [...new Set((tier1 || []).map((a: any) => a.ticker.toLowerCase()))];

    // Generate pairs: non-tier1 × tier1
    const pairs: string[] = [];
    for (const from of tickers) {
      for (const to of tier1Tickers) {
        if (from !== to) pairs.push(`${from}-to-${to}`);
      }
    }

    const start = batchIndex * BATCH_SIZE;
    const slice = pairs.slice(start, start + BATCH_SIZE);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    for (const pair of slice) {
      xml += `
  <url>
    <loc>${BASE_URL}/exchange/${pair}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`;
    }
    xml += `\n</urlset>`;
    return new Response(xml, {
      headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=7200" },
    });
  }

  return new Response("Not Found", { status: 404 });
});
