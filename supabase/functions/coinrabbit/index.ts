const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const BASE = 'https://api.coinrabbit.io/v2'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function readProviderBody(response: Response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

function normalizeLoanEstimate(payload: Record<string, unknown>) {
  return {
    collateral_currency: String(payload.collateral_currency || ''),
    collateral_amount: Number(payload.collateral_amount || 0),
    loan_currency: String(payload.loan_currency || 'usdt'),
    ltv: Number(payload.ltv || 0),
  }
}

function normalizeEarnEstimate(payload: Record<string, unknown>) {
  return {
    currency: String(payload.currency || ''),
    amount: Number(payload.amount || 0),
  }
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
      return json(await readProviderBody(r), r.ok ? 200 : r.status)
    }

    if (action === 'currencies') {
      const t = String(p.type || 'all')
      const ep = t === 'earn' ? '/currencies/earn' : t === 'loan' ? '/currencies/loan' : '/currencies'
      const r = await fetch(`${BASE}${ep}`, { method: 'GET', headers: h })
      return json(await readProviderBody(r), r.ok ? 200 : r.status)
    }

    if (action === 'loan-estimate') {
      const body = normalizeLoanEstimate(p)
      if (!body.collateral_currency || !body.collateral_amount) return json({ error: 'Missing params' }, 400)
      const r = await fetch(`${BASE}/loans/estimate`, {
        method: 'POST',
        headers: h,
        body: JSON.stringify(body),
      })
      return json(await readProviderBody(r), r.ok ? 200 : r.status)
    }

    if (action === 'earn-estimate') {
      const body = normalizeEarnEstimate(p)
      if (!body.currency || !body.amount) return json({ error: 'Missing params' }, 400)
      const r = await fetch(`${BASE}/earns/estimate`, {
        method: 'POST',
        headers: h,
        body: JSON.stringify(body),
      })
      return json(await readProviderBody(r), r.ok ? 200 : r.status)
    }

    if (action === 'create-loan') {
      const body = normalizeLoanEstimate(p)
      if (!body.collateral_currency || !body.collateral_amount || !body.ltv) return json({ error: 'Missing fields' }, 400)
      const r = await fetch(`${BASE}/loans`, {
        method: 'POST',
        headers: h,
        body: JSON.stringify(body),
      })
      return json(await readProviderBody(r), r.ok ? 200 : r.status)
    }

    if (action === 'create-earn') {
      const body = normalizeEarnEstimate(p)
      if (!body.currency || !body.amount) return json({ error: 'Missing fields' }, 400)
      const r = await fetch(`${BASE}/earns`, {
        method: 'POST',
        headers: h,
        body: JSON.stringify(body),
      })
      return json(await readProviderBody(r), r.ok ? 200 : r.status)
    }

    if (action === 'loan-status') {
      if (!p.id) return json({ error: 'Missing id' }, 400)
      const r = await fetch(`${BASE}/loans/${encodeURIComponent(String(p.id))}`, { method: 'GET', headers: h })
      return json(await readProviderBody(r), r.ok ? 200 : r.status)
    }

    if (action === 'earn-status') {
      if (!p.id) return json({ error: 'Missing id' }, 400)
      const r = await fetch(`${BASE}/earns/${encodeURIComponent(String(p.id))}`, { method: 'GET', headers: h })
      return json(await readProviderBody(r), r.ok ? 200 : r.status)
    }

    const ep = p.endpoint
    if (ep && typeof ep === 'string') {
      const ok = ['/loans', '/earn', '/earns', '/quotes', '/currencies', '/auth']
      if (!ok.some((x) => ep.startsWith(x))) return json({ error: 'Not allowed' }, 403)
      const method = String(p.method || 'GET').toUpperCase()
      const opts: RequestInit = { method, headers: h }
      if (method !== 'GET' && p.body) opts.body = JSON.stringify(p.body)
      const r = await fetch(`${BASE}${ep}`, opts)
      return json(await readProviderBody(r), r.ok ? 200 : r.status)
    }

    return json({ error: 'Missing action or endpoint' }, 400)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('CoinRabbit proxy error:', msg)
    return json({ error: msg }, 500)
  }
})
