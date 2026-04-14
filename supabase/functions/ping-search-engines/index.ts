import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE = "https://mrcglobalpay.com";
const INDEXNOW_KEY = "5b41e59fca3649f389b22450cd5cb8dc";

const STATIC_URLS = [
  `${SITE}/`,
  `${SITE}/blog`,
  `${SITE}/lend`,
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

  // Auth check — mirror auto-publish-blog pattern
  const cronSecret = Deno.env.get("CRON_SECRET");
  const authHeader = req.headers.get("Authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Dynamically fetch all published blog post slugs
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("is_published", true);

  const blogUrls = (posts || []).map((p: any) => `${SITE}/blog/${p.slug}`);
  const ALL_URLS = [...STATIC_URLS, ...blogUrls];

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

  // ── 3. IndexNow (Bing, Yandex, Seznam, Naver) ──
  const indexNowPayload = JSON.stringify({
    host: "mrcglobalpay.com",
    key: INDEXNOW_KEY,
    keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
    urlList: ALL_URLS,
  });

  results.indexnow = await safeFetch(
    "indexnow",
    "https://api.indexnow.org/indexnow",
    {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: indexNowPayload,
    }
  );

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

  results.pingomatic = await safeFetch(
    "pingomatic",
    "https://rpc.pingomatic.com/",
    {
      method: "POST",
      headers: { "Content-Type": "text/xml" },
      body: pingomaticBody,
    }
  );

  // ── 6. Weblogs.com (XML-RPC) ──
  results.weblogs = await safeFetch(
    "weblogs",
    "http://rpc.weblogs.com/RPC2",
    {
      method: "POST",
      headers: { "Content-Type": "text/xml" },
      body: pingomaticBody,
    }
  );

  // ── 7. Google Blog Ping ──
  results.google_blog_ping = await safeFetch(
    "google_blog_ping",
    "http://blogsearch.google.com/ping/RPC2",
    {
      method: "POST",
      headers: { "Content-Type": "text/xml" },
      body: pingomaticBody,
    }
  );

  // ── 8. Yandex Sitemap Ping ──
  results.yandex_sitemap = await safeFetch(
    "yandex",
    `https://webmaster.yandex.com/ping?sitemap=${encodeURIComponent(`${SITE}/sitemap.xml`)}`
  );

  // ── 9. IndexNow via Bing directly ──
  results.indexnow_bing = await safeFetch(
    "indexnow_bing",
    "https://www.bing.com/indexnow",
    {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: indexNowPayload,
    }
  );

  // ── 10. IndexNow via Yandex directly ──
  results.indexnow_yandex = await safeFetch(
    "indexnow_yandex",
    "https://yandex.com/indexnow",
    {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: indexNowPayload,
    }
  );

  // ── 11. IndexNow via Naver ──
  results.indexnow_naver = await safeFetch(
    "indexnow_naver",
    "https://searchadvisor.naver.com/indexnow",
    {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: indexNowPayload,
    }
  );

  // ── 12. IndexNow via Seznam ──
  results.indexnow_seznam = await safeFetch(
    "indexnow_seznam",
    "https://search.seznam.cz/indexnow",
    {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: indexNowPayload,
    }
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
