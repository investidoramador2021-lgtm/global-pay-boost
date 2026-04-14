const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const BASE = 'https://api.coinrabbit.io/api/v2'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const apiKey = Deno.env.get('COINRABBIT_API_KEY')
  if (!apiKey) return json({ error: 'COINRABBIT_API_KEY not configured' }, 500)

  const h = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'x-api-key': apiKey,
  }

  try {
    let p: Record<string, unknown> = {}
    if (req.method === 'GET') {
      const url = new URL(req.url)
      for (const [k, v] of url.searchParams.entries()) p[k] = v
    } else {
      p = await req.json()
    }

    const action = String(p.action || '')

    if (action === 'auth-partner') {
      const r = await fetch(`${BASE}/auth/partner`, { method: 'POST', headers: h, body: JSON.stringify({ api_key: apiKey }) })
      return json(await r.json(), r.ok ? 200 : r.status)
    }

    if (action === 'currencies') {
      const t = String(p.type || 'all')
      const ep = t === 'earn' ? '/currencies/earn' : t === 'loan' ? '/currencies/loan' : '/currencies'
      const r = await fetch(`${BASE}${ep}`, { method: 'GET', headers: h })
      return json(await r.json(), r.ok ? 200 : r.status)
    }

    if (action === 'loan-estimate') {
      if (!p.collateral_currency || !p.collateral_amount) return json({ error: 'Missing params' }, 400)
      const q = new URLSearchParams({
        collateral_currency: String(p.collateral_currency),
        collateral_amount: String(p.collateral_amount),
        loan_currency: String(p.loan_currency || 'usdt'),
      })
      if (p.ltv) q.set('ltv', String(p.ltv))
      const r = await fetch(`${BASE}/loans/estimate?${q}`, { method: 'GET', headers: h })
      return json(await r.json(), r.ok ? 200 : r.status)
    }

    if (action === 'earn-estimate') {
      if (!p.currency || !p.amount) return json({ error: 'Missing params' }, 400)
      const q = new URLSearchParams({ currency: String(p.currency), amount: String(p.amount) })
      const r = await fetch(`${BASE}/earns/estimate?${q}`, { method: 'GET', headers: h })
      return json(await r.json(), r.ok ? 200 : r.status)
    }

    if (action === 'create-loan') {
      if (!p.collateral_currency || !p.collateral_amount || !p.ltv) return json({ error: 'Missing fields' }, 400)
      const r = await fetch(`${BASE}/loans`, {
        method: 'POST', headers: h,
        body: JSON.stringify({ collateral_currency: p.collateral_currency, collateral_amount: Number(p.collateral_amount), ltv: Number(p.ltv), loan_currency: p.loan_currency || 'usdt' }),
      })
      return json(await r.json(), r.ok ? 200 : r.status)
    }

    if (action === 'create-earn') {
      if (!p.currency || !p.amount) return json({ error: 'Missing fields' }, 400)
      const r = await fetch(`${BASE}/earn`, { method: 'POST', headers: h, body: JSON.stringify({ currency: p.currency, amount: Number(p.amount) }) })
      return json(await r.json(), r.ok ? 200 : r.status)
    }

    if (action === 'loan-status') {
      if (!p.id) return json({ error: 'Missing id' }, 400)
      const r = await fetch(`${BASE}/loans/${encodeURIComponent(String(p.id))}`, { method: 'GET', headers: h })
      return json(await r.json(), r.ok ? 200 : r.status)
    }

    if (action === 'earn-status') {
      if (!p.id) return json({ error: 'Missing id' }, 400)
      const r = await fetch(`${BASE}/earn/${encodeURIComponent(String(p.id))}`, { method: 'GET', headers: h })
      return json(await r.json(), r.ok ? 200 : r.status)
    }

    // Generic proxy
    const ep = p.endpoint
    if (ep && typeof ep === 'string') {
      const ok = ['/loans', '/earn', '/earns', '/quotes', '/currencies', '/auth']
      if (!ok.some((x) => ep.startsWith(x))) return json({ error: 'Not allowed' }, 403)
      const opts: RequestInit = { method: String(p.method || 'GET'), headers: h }
      if (opts.method !== 'GET' && p.body) opts.body = JSON.stringify(p.body)
      const r = await fetch(`${BASE}${ep}`, opts)
      return json(await r.json(), r.ok ? 200 : r.status)
    }

    return json({ error: 'Missing action or endpoint' }, 400)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('CoinRabbit proxy error:', msg)
    return json({ error: msg }, 500)
  }
})
