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
  { from: "BTC", to: "ETH", cnFrom: "btc", cnTo: "eth" },
  { from: "BTC", to: "USDT", cnFrom: "btc", cnTo: "usdterc20" },
  { from: "BTC", to: "USDC", cnFrom: "btc", cnTo: "usdcerc20" },
  { from: "BTC", to: "SOL", cnFrom: "btc", cnTo: "sol" },
  { from: "ETH", to: "SOL", cnFrom: "eth", cnTo: "sol" },
  { from: "ETH", to: "USDT", cnFrom: "eth", cnTo: "usdterc20" },
  { from: "ETH", to: "BTC", cnFrom: "eth", cnTo: "btc" },
  { from: "SOL", to: "USDT", cnFrom: "sol", cnTo: "usdtsol" },
  { from: "SOL", to: "USDC", cnFrom: "sol", cnTo: "usdcsol" },
  { from: "SOL", to: "ETH", cnFrom: "sol", cnTo: "eth" },
  { from: "XRP", to: "BTC", cnFrom: "xrp", cnTo: "btc" },
  { from: "XRP", to: "USDT", cnFrom: "xrp", cnTo: "usdterc20" },
  { from: "DOGE", to: "BTC", cnFrom: "doge", cnTo: "btc" },
  { from: "LTC", to: "BTC", cnFrom: "ltc", cnTo: "btc" },
  { from: "TRX", to: "USDT", cnFrom: "trx", cnTo: "usdterc20" },
  { from: "BNB", to: "USDC", cnFrom: "bnb", cnTo: "usdcerc20" },
  { from: "XMR", to: "BTC", cnFrom: "xmr", cnTo: "btc" },
  { from: "XMR", to: "ETH", cnFrom: "xmr", cnTo: "eth" },
  { from: "USDT", to: "SOL", cnFrom: "usdterc20", cnTo: "sol" },
  { from: "USDT", to: "BTC", cnFrom: "usdterc20", cnTo: "btc" },
];

async function fetchRate(apiKey: string, p: PairConfig) {
  const [rateResp, minResp] = await Promise.all([
    fetch(`${CHANGENOW_BASE}/exchange-amount/1/${p.cnFrom}_${p.cnTo}?api_key=${apiKey}`),
    fetch(`${CHANGENOW_BASE}/min-amount/${p.cnFrom}_${p.cnTo}?api_key=${apiKey}`),
  ]);

  const rate = rateResp.ok ? (await rateResp.json()).estimatedAmount ?? null : null;
  const min = minResp.ok ? (await minResp.json()).minAmount ?? null : null;

  // Compute the $0.30 equivalent minimum in the "from" asset
  // If we have a rate for 1 unit of `from` → `to`, we can derive the from-asset price
  // For simplicity, use the min-amount from ChangeNOW (which already reflects network minimums)
  // and format it with the asset ticker for bot readability
  const minAmountRaw = min !== null ? String(min) : null;
  const minAmountFormatted = minAmountRaw !== null ? `${minAmountRaw} ${p.from}` : null;

  return {
    pair: `${p.from}/${p.to}`,
    from: p.from,
    to: p.to,
    rate: rate !== null ? String(rate) : null,
    min_amount: minAmountRaw,
    minAmount: minAmountFormatted,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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
      return { pair: `${PAIRS[i].from}/${PAIRS[i].to}`, from: PAIRS[i].from, to: PAIRS[i].to, rate: null, min_amount: null };
    });

    const output = {
      status: "success",
      version: "1.0",
      timestamp: new Date().toISOString(),
      provider: "MRC Global Pay",
      license: "FINTRAC MSB M23225638",
      documentation: "https://mrcglobalpay.com/developers",
      website: "https://mrcglobalpay.com",
      total_pairs: rates.length,
      base_minimum_usd: "0.30",
      settlement: "non-custodial, sub-60s",
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
