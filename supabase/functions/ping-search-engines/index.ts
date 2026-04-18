import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE = "https://mrcglobalpay.com";
const INDEXNOW_KEY = "5b41e59fca3649f389b22450cd5cb8dc";

// "" = English (no prefix). Must mirror the LANGS list in dynamic-sitemap.
const LANGS = ["", "es", "pt", "fr", "ja", "fa", "ur", "he", "af", "hi", "vi", "tr", "uk"];

// Routes pinged in EVERY language. Affiliate/partner pages were missing —
// IndexNow couldn't discover them.
const LOCALIZED_ROUTES = [
  "/",
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
  "/blog",
];

// English-only routes (whitepapers, swap landings, legal pages).
const ENGLISH_ONLY = [
  `${SITE}/swap/sol-usdt`,
  `${SITE}/swap/btc-usdc`,
  `${SITE}/swap/hype-usdt`,
  `${SITE}/swap/eth-sol`,
  `${SITE}/swap/xrp-usdt`,
  `${SITE}/swap/bera-usdt`,
  `${SITE}/swap/tia-usdt`,
  `${SITE}/swap/monad-usdt`,
  `${SITE}/swap/pyusd-usdt`,
  `${SITE}/liquidity-expansion`,
  `${SITE}/sovereign-settlement`,
  `${SITE}/blog/whitepapers/crypto-loans`,
  `${SITE}/blog/whitepapers/digital-yield`,
  `${SITE}/permanent-bridge/whitepaper`,
  `${SITE}/private-transfer/whitepaper`,
  `${SITE}/privacy`,
  `${SITE}/terms`,
  `${SITE}/aml`,
];

const STATIC_URLS = [
  ...LOCALIZED_ROUTES.flatMap((route) =>
    LANGS.map((lang) => {
      const prefix = lang ? `/${lang}` : "";
      if (route === "/") return `${SITE}${prefix}/`;
      return `${SITE}${prefix}${route}`;
    })
  ),
  ...ENGLISH_ONLY,
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function safeFetch(label: string, url: string, options?: RequestInit): Promise<string> {
  try {
    const res = await fetch(url, options);
    return res.ok || res.status === 202 ? "OK" : `${res.status}`;
  } catch (e) {
    return `error: ${(e as Error).message}`;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth check — accept CRON_SECRET (for scheduled runs) or the project anon/publishable key (for manual triggers).
  // Endpoint only pings public IndexNow/search endpoints with public URLs, so anon-key access is safe.
  const cronSecret = Deno.env.get("CRON_SECRET");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const pubKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const isAuthorized =
    (cronSecret && token === cronSecret) ||
    (anonKey && token === anonKey) ||
    (pubKey && token === pubKey) ||
    // Any non-empty bearer token (Supabase gateway already validates JWT before reaching us when verify_jwt=true)
    (token.length > 20 && token.split(".").length === 3);
  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: "Unauthorized", hint: "Bearer token required" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Use service role to bypass per-row RLS evaluation (faster on large reads).
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: posts, error: postsErr } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("is_published", true);
  if (postsErr) console.error("[ping] blog_posts error:", postsErr.message);

  const blogUrls = (posts || []).map((p: any) => `${SITE}/blog/${p.slug}`);

  // Fetch ALL valid /exchange/[pair] pages via paginated SECURITY DEFINER RPC,
  // firing all page requests concurrently to keep total fetch time ~= slowest single page.
  const pairUrls: string[] = [];
  const pageSize = 1000;
  const MAX_PAGES = 50;
  const { data: pingState } = await supabase
    .from("sync_engine_state")
    .select("pairs_count")
    .eq("id", 1)
    .maybeSingle();
  const totalCount = (pingState as any)?.pairs_count ?? 0;
  const pageCount = Math.min(MAX_PAGES, Math.max(1, Math.ceil(totalCount / pageSize) + 1));
  console.log(`[ping] parallel rpc pageCount=${pageCount} totalCount=${totalCount}`);

  const tFetch = Date.now();
  const pageJobs = Array.from({ length: pageCount }, (_, i) => {
    const offset = i * pageSize;
    const t0 = Date.now();
    return supabase
      .rpc("get_valid_pair_slugs", { p_offset: offset, p_limit: pageSize })
      .then(({ data, error }: any) => {
        const ms = Date.now() - t0;
        if (error) {
          console.error(`[ping] rpc page=${i} offset=${offset} ERR ms=${ms}: ${error.message}`);
          return [] as any[];
        }
        console.log(`[ping] rpc page=${i} offset=${offset} rows=${data?.length ?? 0} ms=${ms}`);
        return (data ?? []) as any[];
      });
  });
  const pages = await Promise.all(pageJobs);
  for (const rows of pages) {
    for (const p of rows) {
      const f = (p.from_ticker || "").toLowerCase();
      const t = (p.to_ticker || "").toLowerCase();
      if (!f || !t) continue;
      const slug = `${f}-to-${t}`;
      for (const lang of LANGS) {
        const prefix = lang ? `/${lang}` : "";
        pairUrls.push(`${SITE}${prefix}/exchange/${slug}`);
      }
    }
  }
  console.log(`[ping] pair URL count = ${pairUrls.length} fetchMs=${Date.now() - tFetch}`);
  const ALL_URLS = [...STATIC_URLS, ...blogUrls, ...pairUrls];

  // IndexNow accepts max 10,000 URLs per request — chunk if needed.
  const CHUNK_SIZE = 10000;
  function chunkUrls(urls: string[]): string[][] {
    const chunks: string[][] = [];
    for (let i = 0; i < urls.length; i += CHUNK_SIZE) {
      chunks.push(urls.slice(i, i + CHUNK_SIZE));
    }
    return chunks;
  }
  const urlChunks = chunkUrls(ALL_URLS);

  const results: Record<string, string> = {};

  // ── 1. Google Sitemap Ping ──
  results.google_sitemap = await safeFetch(
    "google_sitemap",
    `https://www.google.com/ping?sitemap=${encodeURIComponent(`${SITE}/sitemap.xml`)}`
  );

  // ── 2. Bing Sitemap Ping ──
  results.bing_sitemap = await safeFetch(
    "bing_sitemap",
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(`${SITE}/sitemap.xml`)}`
  );

  // ── 3. IndexNow (chunks fired in parallel across all endpoints) ──
  async function pingIndexNowChunk(endpoint: string, chunk: string[]): Promise<string> {
    const payload = JSON.stringify({
      host: "mrcglobalpay.com",
      key: INDEXNOW_KEY,
      keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
      urlList: chunk,
    });
    return safeFetch("indexnow_chunk", endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: payload,
    });
  }

  const indexNowEndpoints: Array<[string, string]> = [
    ["indexnow", "https://api.indexnow.org/indexnow"],
    ["indexnow_bing", "https://www.bing.com/indexnow"],
    ["indexnow_yandex", "https://yandex.com/indexnow"],
    ["indexnow_naver", "https://searchadvisor.naver.com/indexnow"],
    ["indexnow_seznam", "https://search.seznam.cz/indexnow"],
  ];

  // Fan-out: every (endpoint × chunk) pair runs concurrently.
  const indexNowJobs = indexNowEndpoints.flatMap(([name, ep]) =>
    urlChunks.map((chunk, idx) =>
      pingIndexNowChunk(ep, chunk).then((s) => ({ name, idx, size: chunk.length, status: s }))
    )
  );
  const indexNowResults = await Promise.all(indexNowJobs);
  for (const [name] of indexNowEndpoints) {
    const rows = indexNowResults.filter((r) => r.name === name);
    results[name] = rows.map((r) => `${r.size}=${r.status}`).join(" | ");
  }

  // ── 4. Google RSS Ping ──
  results.google_rss = await safeFetch(
    "google_rss",
    `https://www.google.com/ping?sitemap=${encodeURIComponent(`${SITE}/rss.xml`)}`
  );

  // ── 5. Ping-O-Matic (XML-RPC) ──
  const pingomaticBody = `<?xml version="1.0"?>
<methodCall>
  <methodName>weblogUpdates.ping</methodName>
  <params>
    <param><value>MRC GlobalPay Blog</value></param>
    <param><value>${SITE}/blog</value></param>
    <param><value>${SITE}/rss.xml</value></param>
  </params>
</methodCall>`;

  results.pingomatic = await safeFetch("pingomatic", "https://rpc.pingomatic.com/", {
    method: "POST",
    headers: { "Content-Type": "text/xml" },
    body: pingomaticBody,
  });

  // ── 6. Yandex Sitemap Ping ──
  results.yandex_sitemap = await safeFetch(
    "yandex",
    `https://webmaster.yandex.com/ping?sitemap=${encodeURIComponent(`${SITE}/sitemap.xml`)}`
  );

  // ── 13. Bing URL submission for llms.txt ──
  results.bing_llms = await safeFetch(
    "bing_llms",
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(`${SITE}/llms.txt`)}`
  );

  return new Response(JSON.stringify({
    success: true,
    results,
    pinged_urls: ALL_URLS.length,
    services_pinged: Object.keys(results).length,
    timestamp: new Date().toISOString(),
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
