import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'public, max-age=30, s-maxage=30',
};

const CHANGENOW_BASE = 'https://api.changenow.io/v1';

interface PairConfig {
  from: string;
  to: string;
  cnFrom: string;
  cnTo: string;
}

const PAIRS: PairConfig[] = [
  { from: "BTC", to: "SOL", cnFrom: "btc", cnTo: "sol" },
  { from: "ETH", to: "SOL", cnFrom: "eth", cnTo: "sol" },
  { from: "USDT", to: "SOL", cnFrom: "usdterc20", cnTo: "sol" },
  { from: "XMR", to: "SOL", cnFrom: "xmr", cnTo: "sol" },
  { from: "SOL", to: "USDC", cnFrom: "sol", cnTo: "usdcsol" },
  { from: "SOL", to: "USDT", cnFrom: "sol", cnTo: "usdtsol" },
];

async function fetchRate(apiKey: string, p: PairConfig) {
  const [rateResp, minResp] = await Promise.all([
    fetch(`${CHANGENOW_BASE}/exchange-amount/1/${p.cnFrom}_${p.cnTo}?api_key=${apiKey}`),
    fetch(`${CHANGENOW_BASE}/min-amount/${p.cnFrom}_${p.cnTo}?api_key=${apiKey}`),
  ]);

  const rate = rateResp.ok ? (await rateResp.json()).estimatedAmount ?? null : null;
  const min = minResp.ok ? (await minResp.json()).minAmount ?? null : null;

  return {
    from: p.from,
    to: p.to,
    rate: rate !== null ? String(rate) : null,
    min: min !== null ? String(min) : null,
    max: null as string | null,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get('CHANGENOW_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ status: "error", error: "API key not configured" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const results = await Promise.allSettled(PAIRS.map((p) => fetchRate(apiKey, p)));

    const rates = results.map((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      return { from: PAIRS[i].from, to: PAIRS[i].to, rate: null, min: null, max: null };
    });

    const output = {
      status: "success",
      timestamp: new Date().toISOString(),
      provider: "MRC Global Pay / ChangeNOW",
      license: "FINTRAC MSB C100000015",
      documentation: "https://mrcglobalpay.com/developers",
      rates,
    };

    return new Response(JSON.stringify(output, null, 2), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ status: "error", error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
