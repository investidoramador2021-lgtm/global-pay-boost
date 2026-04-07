import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'public, max-age=30, s-maxage=30',
};

const CHANGENOW_BASE = 'https://api.changenow.io/v1';

interface RatePair {
  pair: string;
  from: string;
  to: string;
}

const PAIRS: RatePair[] = [
  { pair: "BTC/SOL", from: "btc", to: "sol" },
  { pair: "ETH/SOL", from: "eth", to: "sol" },
  { pair: "SOL/USDC", from: "sol", to: "usdcsol" },
  { pair: "SOL/USDT", from: "sol", to: "usdtsol" },
  { pair: "XMR/SOL", from: "xmr", to: "sol" },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get('CHANGENOW_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const results = await Promise.allSettled(
      PAIRS.map(async (p) => {
        const url = `${CHANGENOW_BASE}/exchange-amount/1/${p.from}_${p.to}?api_key=${apiKey}`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        return {
          pair: p.pair,
          from: p.from.toUpperCase(),
          to: p.to.toUpperCase(),
          rate: data.estimatedAmount ?? null,
          amount_sent: 1,
        };
      })
    );

    const rates = results.map((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      return {
        pair: PAIRS[i].pair,
        from: PAIRS[i].from.toUpperCase(),
        to: PAIRS[i].to.toUpperCase(),
        rate: null,
        amount_sent: 1,
        error: "Rate temporarily unavailable",
      };
    });

    const output = {
      provider: "MRC Global Pay",
      license: "FINTRAC MSB M23225638",
      generated_at: new Date().toISOString(),
      base_url: "https://mrcglobalpay.com",
      documentation: "https://mrcglobalpay.com/developers",
      note: "Rates refresh on every request. 1-unit reference amounts.",
      rates,
    };

    return new Response(JSON.stringify(output, null, 2), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
