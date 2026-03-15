import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SITE = "https://mrcglobalpay.com";
const INDEXNOW_KEY = "5b41e59fca3649f389b22450cd5cb8dc";

const ALL_URLS = [
  `${SITE}/`,
  `${SITE}/blog`,
  `${SITE}/blog/how-to-swap-bitcoin-to-ethereum-2026`,
  `${SITE}/blog/understanding-crypto-liquidity-aggregation`,
  `${SITE}/blog/crypto-security-best-practices-2026`,
  `${SITE}/blog/top-crypto-trading-pairs-march-2026`,
  `${SITE}/swap/sol-usdt`,
  `${SITE}/swap/btc-usdc`,
  `${SITE}/swap/hype-usdt`,
  `${SITE}/swap/eth-sol`,
  `${SITE}/swap/xrp-usdt`,
  `${SITE}/swap/bera-usdt`,
  `${SITE}/swap/tia-usdt`,
  `${SITE}/swap/monad-usdt`,
  `${SITE}/swap/pyusd-usdt`,
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
  results.indexnow = await safeFetch(
    "indexnow",
    "https://api.indexnow.org/indexnow",
    {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: "mrcglobalpay.com",
        key: INDEXNOW_KEY,
        keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
        urlList: ALL_URLS,
      }),
    }
  );

  // ── 4. Google RSS Ping ──
  results.google_rss = await safeFetch(
    "google_rss",
    `https://www.google.com/ping?sitemap=${encodeURIComponent(`${SITE}/rss.xml`)}`
  );

  // ── 5. Ping-O-Matic (XML-RPC) ──
  // Pings Technorati, Google Blog Search, Weblogs.com, Moreover, etc.
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
      body: pingomaticBody.replace("weblogUpdates.ping", "weblogUpdates.ping"),
    }
  );

  // ── 7. Feed Burner / Google Blog Ping ──
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
      body: JSON.stringify({
        host: "mrcglobalpay.com",
        key: INDEXNOW_KEY,
        keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
        urlList: ALL_URLS,
      }),
    }
  );

  // ── 10. IndexNow via Yandex directly ──
  results.indexnow_yandex = await safeFetch(
    "indexnow_yandex",
    "https://yandex.com/indexnow",
    {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: "mrcglobalpay.com",
        key: INDEXNOW_KEY,
        keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
        urlList: ALL_URLS,
      }),
    }
  );

  // ── 11. IndexNow via Naver ──
  results.indexnow_naver = await safeFetch(
    "indexnow_naver",
    "https://searchadvisor.naver.com/indexnow",
    {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: "mrcglobalpay.com",
        key: INDEXNOW_KEY,
        keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
        urlList: ALL_URLS,
      }),
    }
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