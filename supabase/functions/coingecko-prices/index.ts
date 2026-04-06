import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fallback prices used when CoinGecko is temporarily unavailable
const FALLBACK_PRICES: Record<string, { usd: number }> = {
  bitcoin: { usd: 68000 },
  ethereum: { usd: 2100 },
  solana: { usd: 80 },
  ripple: { usd: 1.30 },
  binancecoin: { usd: 600 },
  dogecoin: { usd: 0.09 },
  litecoin: { usd: 54 },
  tron: { usd: 0.32 },
  "usd-coin": { usd: 1.0 },
  pepe: { usd: 0.0000035 },
  tether: { usd: 1.0 },
};

// Simple in-memory cache (survives within a single isolate lifetime)
let priceCache: { data: Record<string, { usd: number }>; ts: number } | null = null;
const CACHE_TTL_MS = 60_000; // 60 seconds

async function fetchWithRetry(url: string, headers: Record<string, string>, retries = 2): Promise<Response | null> {
  for (let i = 0; i <= retries; i++) {
    try {
      const resp = await fetch(url, { headers });
      if (resp.ok) return resp;
      // Consume body to avoid leak
      await resp.text();
      if (i < retries) await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    } catch (e) {
      console.error(`Fetch attempt ${i + 1} failed:`, e);
      if (i < retries) await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ids } = await req.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({ error: "ids array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeIds = ids.filter((id: string) => /^[a-z0-9-]+$/.test(id)).slice(0, 20);
    if (safeIds.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid token IDs" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Return cached data if fresh
    if (priceCache && Date.now() - priceCache.ts < CACHE_TTL_MS) {
      const cached: Record<string, { usd: number }> = {};
      let allHit = true;
      for (const id of safeIds) {
        if (priceCache.data[id]) {
          cached[id] = priceCache.data[id];
        } else {
          allHit = false;
          break;
        }
      }
      if (allHit) {
        return new Response(JSON.stringify(cached), {
          headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=30" },
        });
      }
    }

    const apiKey = Deno.env.get("COINGECKO_API_KEY") || "";
    const idsParam = safeIds.join(",");
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd`;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (apiKey) headers["x-cg-demo-api-key"] = apiKey;

    const resp = await fetchWithRetry(url, headers);

    if (resp) {
      const data = await resp.json();
      // Update cache
      priceCache = { data: { ...(priceCache?.data || {}), ...data }, ts: Date.now() };
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=30" },
      });
    }

    // All retries failed — use cache (even stale) or fallback
    console.warn("CoinGecko unavailable, using fallback prices");
    const fallback: Record<string, { usd: number }> = {};
    for (const id of safeIds) {
      fallback[id] = priceCache?.data?.[id] || FALLBACK_PRICES[id] || { usd: 0 };
    }
    return new Response(JSON.stringify(fallback), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-Price-Source": "fallback" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
