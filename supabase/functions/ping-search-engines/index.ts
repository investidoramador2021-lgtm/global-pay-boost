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
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const results: Record<string, string> = {};

  // 1. Ping Google Sitemap
  try {
    const gRes = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(`${SITE}/sitemap.xml`)}`);
    results.google_sitemap = gRes.ok ? "OK" : `${gRes.status}`;
  } catch (e) {
    results.google_sitemap = `error: ${e.message}`;
  }

  // 2. Ping Bing Sitemap
  try {
    const bRes = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(`${SITE}/sitemap.xml`)}`);
    results.bing_sitemap = bRes.ok ? "OK" : `${bRes.status}`;
  } catch (e) {
    results.bing_sitemap = `error: ${e.message}`;
  }

  // 3. IndexNow (Bing, Yandex, Seznam, Naver)
  try {
    const indexNowPayload = {
      host: "mrcglobalpay.com",
      key: INDEXNOW_KEY,
      keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
      urlList: ALL_URLS,
    };

    const inRes = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(indexNowPayload),
    });
    results.indexnow = inRes.ok || inRes.status === 202 ? "OK" : `${inRes.status}`;
  } catch (e) {
    results.indexnow = `error: ${e.message}`;
  }

  // 4. Google Indexing API ping via search console (public sitemap re-fetch trigger)
  try {
    const gPing = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(`${SITE}/rss.xml`)}`);
    results.google_rss = gPing.ok ? "OK" : `${gPing.status}`;
  } catch (e) {
    results.google_rss = `error: ${e.message}`;
  }

  return new Response(JSON.stringify({ success: true, results, pinged_urls: ALL_URLS.length }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
