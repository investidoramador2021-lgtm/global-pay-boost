const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const body = {
    status: "operational",
    system: "Online",
    liquidity: "Optimal",
    engine: "Non-Custodial Swap Engine v2",
    uptime: "99.98%",
    provider: {
      name: "MRC Global Pay",
      msb: "C100000015",
      jurisdiction: "Canada (FINTRAC)",
    },
    supported_assets: "500+",
    min_swap_usd: "0.30",
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=30, s-maxage=30",
    },
  });
});
