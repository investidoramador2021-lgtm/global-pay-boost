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
  inputAmount: string;
}

const PAIRS: PairConfig[] = [
  { from: "BTC", to: "SOL", cnFrom: "btc", cnTo: "sol", inputAmount: "1" },
  { from: "ETH", to: "SOL", cnFrom: "eth", cnTo: "sol", inputAmount: "1" },
  { from: "USDT", to: "SOL", cnFrom: "usdterc20", cnTo: "sol", inputAmount: "1" },
  { from: "XMR", to: "SOL", cnFrom: "xmr", cnTo: "sol", inputAmount: "1" },
  { from: "SOL", to: "USDC", cnFrom: "sol", cnTo: "usdcsol", inputAmount: "1" },
  { from: "SOL", to: "USDT", cnFrom: "sol", cnTo: "usdtsol", inputAmount: "1" },
  { from: "BTC", to: "ETH", cnFrom: "btc", cnTo: "eth", inputAmount: "1" },
  { from: "ETH", to: "USDT", cnFrom: "eth", cnTo: "usdterc20", inputAmount: "1" },
];

async function fetchRate(apiKey: string, p: PairConfig) {
  const [rateResp, minResp] = await Promise.all([
    fetch(`${CHANGENOW_BASE}/exchange-amount/${p.inputAmount}/${p.cnFrom}_${p.cnTo}?api_key=${apiKey}`),
    fetch(`${CHANGENOW_BASE}/min-amount/${p.cnFrom}_${p.cnTo}?api_key=${apiKey}`),
  ]);

  const rate = rateResp.ok ? (await rateResp.json()).estimatedAmount ?? null : null;
  const min = minResp.ok ? (await minResp.json()).minAmount ?? null : null;

  return {
    from: p.from,
    to: p.to,
    inAmount: p.inputAmount,
    out: rate !== null ? String(rate) : "0",
    min: min !== null ? String(min) : "0",
    reserve: "999999",
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get('CHANGENOW_API_KEY');
  if (!apiKey) {
    return new Response('<error>API key not configured</error>', {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }

  try {
    const results = await Promise.allSettled(PAIRS.map((p) => fetchRate(apiKey, p)));

    const items = results.map((r, i) => {
      const data = r.status === 'fulfilled' ? r.value : {
        from: PAIRS[i].from, to: PAIRS[i].to, inAmount: PAIRS[i].inputAmount,
        out: "0", min: "0", reserve: "999999",
      };
      return `  <item>
    <from>${data.from}</from>
    <to>${data.to}</to>
    <in>${data.inAmount}</in>
    <out>${data.out}</out>
    <amount>${data.reserve}</amount>
    <minamount>${data.min}</minamount>
    <maxamount>no_limit</maxamount>
  </item>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rates>
  <timestamp>${new Date().toISOString()}</timestamp>
  <provider>MRC Global Pay</provider>
  <license>FINTRAC MSB C100000015</license>
${items}
</rates>`;

    return new Response(xml, {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/xml; charset=utf-8' },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(`<error>${msg}</error>`, {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }
});
