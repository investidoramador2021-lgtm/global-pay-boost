import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const BASE_URL = "https://mrcglobalpay.com";
const BATCH_SIZE = 10000; // Max URLs per child sitemap (Google hard cap is 50k)
// "" = English (default, no prefix). Listed langs match the i18n config.
const LANGS = ["", "es", "pt", "fr", "ja", "fa", "ur", "he", "af", "hi", "vi", "tr", "uk"];

// Ecosystem hubs — high-authority topic pages, priority 1.0
const ECOSYSTEM_HUBS = ["/solana-ai", "/solana-ecosystem", "/fractal-bitcoin-swap"];

async function fetchAllValidPairs(svc: ReturnType<typeof createClient>) {
  const all: Array<{ from_ticker: string; to_ticker: string; updated_at: string }> = [];
  const pageSize = 1000;
  let from = 0;
  let pageIndex = 0;
  console.log("[fetchAllValidPairs] start");
  while (from < 50000) {
    const t0 = Date.now();
    const { data, error } = await svc
      .from("pairs")
      .select("from_ticker, to_ticker, updated_at")
      .eq("is_valid", true)
      .range(from, from + pageSize - 1);
    const ms = Date.now() - t0;
    if (error) {
      console.error(`[fetchAllValidPairs] page=${pageIndex} from=${from} ERROR after ${ms}ms:`, error.message, JSON.stringify(error));
      break;
    }
    const rows = data?.length ?? 0;
    console.log(`[fetchAllValidPairs] page=${pageIndex} from=${from} rows=${rows} ms=${ms} total=${all.length + rows}`);
    if (!data || rows === 0) break;
    all.push(...(data as any));
    if (rows < pageSize) break;
    from += pageSize;
    pageIndex++;
  }
  console.log(`[fetchAllValidPairs] done total=${all.length}`);
  return all;
}

/**
 * Build the full hreflang block for a given pair slug.
 * Every URL block (English + each translation) emits the SAME set of
 * <xhtml:link> alternates — including a self-referential one and an
 * x-default pointing to the English version. This is the bidirectional
 * pattern Google requires; without it, language variants get reported as
 * "Duplicate, Google chose different canonical".
 */
function buildAlternates(slug: string): string {
  let block = "";
  for (const lang of LANGS) {
    const hreflang = lang || "en";
    const prefix = lang ? `/${lang}` : "";
    block += `
    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${BASE_URL}${prefix}/exchange/${slug}" />`;
  }
  // x-default → English version
  block += `
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/exchange/${slug}" />`;
  return block;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/dynamic-sitemap/, "") || "/";

  const svc = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Static, high-priority routes that must appear in the sitemap for every
  // supported language (affiliate / partner program landing pages, etc).
  // IndexNow + Google look here, so omitting these = no discovery.
  const STATIC_ROUTES = [
    "/affiliates",
    "/partners",
    "/referral",
    "/lend",
    "/private-transfer",
    "/permanent-bridge",
    "/about",
    "/compliance",
    "/transparency-security",
    "/developers",
    "/get-widget",
    // Swap landing pages — each gets full hreflang block across all 13 languages.
    "/swap/sol-usdt",
    "/swap/btc-usdc",
    "/swap/hype-usdt",
    "/swap/eth-sol",
    "/swap/xrp-usdt",
    "/swap/bera-usdt",
    "/swap/tia-usdt",
    "/swap/monad-usdt",
    "/swap/pyusd-usdt",
    "/swap/bnb-usdc",
  ];

  // Sitemap index — fetch the full pair list (only ~22k rows) so we know the
  // exact batch count. Estimated count via pg_class can be stale on freshly
  // synced tables (returns null/0), so we just paginate the real data.
  if (path === "/" || path === "/index.xml") {
    // Fast head-count — don't paginate 22k rows just to compute batch count.
    const { count, error: countErr } = await svc
      .from("pairs")
      .select("*", { count: "exact", head: true })
      .eq("is_valid", true);
    if (countErr) console.error("[sitemap-index] count error:", countErr.message);
    const pairCount = count ?? 0;
    console.log("[sitemap-index] pairCount =", pairCount);
    const totalUrls = pairCount * LANGS.length;
    const batchCount = Math.max(1, Math.ceil(totalUrls / BATCH_SIZE));
    const today = new Date().toISOString().split("T")[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    // Static routes sitemap first — guarantees affiliate pages get crawled.
    xml += `
  <sitemap>
    <loc>${BASE_URL}/functions/v1/dynamic-sitemap/static.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`;
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

  // Static-routes sitemap — one <url> per (route × language) with full
  // bidirectional hreflang alternates so Google + IndexNow index every locale.
  if (path === "/static.xml") {
    const today = new Date().toISOString().split("T")[0];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

    // Combined: regular static routes + ecosystem hubs (priority 1.0).
    const allRoutes: Array<{ route: string; basePriority: number; changefreq: string }> = [
      ...STATIC_ROUTES.map((route) => ({ route, basePriority: 0.9, changefreq: "weekly" })),
      ...ECOSYSTEM_HUBS.map((route) => ({ route, basePriority: 1.0, changefreq: "daily" })),
    ];

    for (const { route, basePriority, changefreq } of allRoutes) {
      for (const lang of LANGS) {
        const prefix = lang ? `/${lang}` : "";
        const loc = `${BASE_URL}${prefix}${route}`;
        const priority = lang ? (basePriority - 0.2).toFixed(1) : basePriority.toFixed(1);
        let alts = "";
        for (const l of LANGS) {
          const hl = l || "en";
          const p = l ? `/${l}` : "";
          alts += `
    <xhtml:link rel="alternate" hreflang="${hl}" href="${BASE_URL}${p}${route}" />`;
        }
        alts += `
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${route}" />`;

        xml += `
  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${alts}
  </url>`;
      }
    }
    xml += `\n</urlset>`;
    return new Response(xml, {
      headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
    });
  }

  // Batch sitemaps — emit one <url> entry per (pair × language) combination,
  // each with the full bidirectional hreflang alternates set.
  const batchMatch = path.match(/^\/batch-(\d+)\.xml$/);
  if (batchMatch) {
    const batchIndex = parseInt(batchMatch[1]);
    const allPairs = await fetchAllValidPairs(svc);

    // Flatten into one logical entry per (pair, lang) so batching stays even.
    type Entry = { slug: string; lang: string; lastmod: string };
    const entries: Entry[] = [];
    for (const p of allPairs) {
      const from = (p.from_ticker || "").toLowerCase();
      const to = (p.to_ticker || "").toLowerCase();
      if (!from || !to) continue;
      const slug = `${from}-to-${to}`;
      const lastmod = (p.updated_at || new Date().toISOString()).split("T")[0];
      for (const lang of LANGS) {
        entries.push({ slug, lang, lastmod });
      }
    }

    const start = batchIndex * BATCH_SIZE;
    const slice = entries.slice(start, start + BATCH_SIZE);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

    for (const e of slice) {
      const prefix = e.lang ? `/${e.lang}` : "";
      const loc = `${BASE_URL}${prefix}/exchange/${e.slug}`;
      // English version gets higher priority since it's the canonical.
      const priority = e.lang ? "0.6" : "0.8";
      xml += `
  <url>
    <loc>${loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority}</priority>${buildAlternates(e.slug)}
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
