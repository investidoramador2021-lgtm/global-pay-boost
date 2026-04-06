import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Validate input - only allow alphanumeric and hyphens
    const safeIds = ids.filter((id: string) => /^[a-z0-9-]+$/.test(id)).slice(0, 20);
    if (safeIds.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid token IDs" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("COINGECKO_API_KEY") || "";
    const idsParam = safeIds.join(",");

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd`;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (apiKey) {
      headers["x-cg-demo-api-key"] = apiKey;
    }

    const resp = await fetch(url, { headers });
    if (!resp.ok) {
      const text = await resp.text();
      console.error("CoinGecko error:", resp.status, text);
      return new Response(JSON.stringify({ error: "Price feed unavailable" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=30" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
