import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const BASE_URL = "https://mrcglobalpay.com";
const BATCH_SIZE = 5000;
const LANGS = ["", "es", "pt", "fr", "ja", "fa", "ur", "he", "af", "hi", "vi", "tr", "uk"];

// Pull ALL valid pairs from the live `pairs` table, paginating past Postgres' 1000-row default.
async function fetchAllValidPairs(svc: ReturnType<typeof createClient>) {
  const all: Array<{ from_ticker: string; to_ticker: string; updated_at: string }> = [];
  const pageSize = 1000;
  let from = 0;
  // Hard ceiling at 50k rows for safety.
  while (from < 50000) {
    const { data, error } = await svc
      .from("pairs")
      .select("from_ticker, to_ticker, updated_at")
      .eq("is_valid", true)
      .order("updated_at", { ascending: false })
      .range(from, from + pageSize - 1);
    if (error || !data || data.length === 0) break;
    all.push(...(data as any));
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/dynamic-sitemap/, "") || "/";

  const svc = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Sitemap index
  if (path === "/" || path === "/index.xml") {
    const allPairs = await fetchAllValidPairs(svc);
    const batchCount = Math.max(1, Math.ceil(allPairs.length / BATCH_SIZE));
    const today = new Date().toISOString().split("T")[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    for (let i = 0; i < batchCount; i++) {
      xml += `
  <sitemap>
    <loc>${BASE_URL}/functions/v1/dynamic-sitemap/batch-${i}.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`;
    }
    xml += `\n</sitemapindex>`;
    return new Response(xml, {
      headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
    });
  }

  // Batch sitemaps — sourced directly from the live `pairs` table
  const batchMatch = path.match(/^\/batch-(\d+)\.xml$/);
  if (batchMatch) {
    const batchIndex = parseInt(batchMatch[1]);
    const allPairs = await fetchAllValidPairs(svc);
    const start = batchIndex * BATCH_SIZE;
    const slice = allPairs.slice(start, start + BATCH_SIZE);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

    for (const p of slice) {
      const from = (p.from_ticker || "").toLowerCase();
      const to = (p.to_ticker || "").toLowerCase();
      if (!from || !to) continue;
      const slug = `${from}-to-${to}`;
      const lastmod = (p.updated_at || new Date().toISOString()).split("T")[0];

      xml += `
  <url>
    <loc>${BASE_URL}/exchange/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>`;
      for (const lang of LANGS) {
        const hreflang = lang || "en";
        const prefix = lang ? `/${lang}` : "";
        xml += `
    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${BASE_URL}${prefix}/exchange/${slug}" />`;
      }
      xml += `
  </url>`;
    }
    xml += `\n</urlset>`;
    return new Response(xml, {
      headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
    });
  }

  // Legacy /popular.xml — keep for backwards compatibility, redirect to batch-0
  if (path === "/popular.xml") {
    return Response.redirect(`${BASE_URL}/functions/v1/dynamic-sitemap/batch-0.xml`, 301);
  }

  return new Response("Not Found", { status: 404 });
});
