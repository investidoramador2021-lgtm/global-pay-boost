const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const BASE = 'https://api.coinrabbit.io/api/v2'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const apiKey = Deno.env.get('COINRABBIT_API_KEY') || ''
  const headers = { ...corsHeaders, 'Content-Type': 'application/json' }

  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action') || ''

    if (action === 'loan-estimate') {
      const q = new URLSearchParams()
      q.set('collateral_currency', url.searchParams.get('collateral_currency') || 'btc')
      q.set('collateral_amount', url.searchParams.get('collateral_amount') || '1000')
      q.set('loan_currency', url.searchParams.get('loan_currency') || 'usdt')
      const ltv = url.searchParams.get('ltv')
      if (ltv) q.set('ltv', ltv)

      const r = await fetch(`${BASE}/loans/estimate?${q}`, {
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      })
      const data = await r.json()
      return new Response(JSON.stringify(data), { status: 200, headers })
    }

    return new Response(JSON.stringify({ ok: true, action }), { status: 200, headers })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers })
  }
})
