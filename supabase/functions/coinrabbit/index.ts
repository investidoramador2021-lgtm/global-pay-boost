const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// CoinRabbit Partner API v2
const COINRABBIT_BASE = 'https://api.coinrabbit.io/api/v2'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const apiKey = Deno.env.get('COINRABBIT_API_KEY')
  if (!apiKey) {
    return json({ error: 'COINRABBIT_API_KEY not configured' }, 500)
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'x-api-key': apiKey,
  }

  try {
    const payload = await req.json()
    const { action } = payload

    /* ── Partner auth session ─────────────────────────────── */
    if (action === 'auth-partner') {
      const res = await fetch(`${COINRABBIT_BASE}/auth/partner`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ api_key: apiKey }),
      })
      return json(await res.json(), res.ok ? 200 : res.status)
    }

    /* ── Currencies list ─────────────────────────────────── */
    if (action === 'currencies') {
      const { type = 'all' } = payload
      const endpoint = type === 'earn'
        ? '/currencies/earn'
        : type === 'loan'
        ? '/currencies/loan'
        : '/currencies'
      const res = await fetch(`${COINRABBIT_BASE}${endpoint}`, {
        method: 'GET',
        headers: authHeaders,
      })
      return json(await res.json(), res.ok ? 200 : res.status)
    }

    /* ── Loan estimate (GET /v2/loans/estimate) ──────────── */
    if (action === 'loan-estimate') {
      const { collateral_currency, collateral_amount, ltv, loan_currency = 'usdt' } = payload
      if (!collateral_currency || !collateral_amount) {
        return json({ error: 'Missing collateral_currency or collateral_amount' }, 400)
      }
      const params = new URLSearchParams({
        collateral_currency: String(collateral_currency),
        collateral_amount: String(collateral_amount),
        loan_currency: String(loan_currency),
      })
      if (ltv) params.set('ltv', String(ltv))
      const res = await fetch(`${COINRABBIT_BASE}/loans/estimate?${params}`, {
        method: 'GET',
        headers: authHeaders,
      })
      return json(await res.json(), res.ok ? 200 : res.status)
    }

    /* ── Earn estimate (GET /v2/earns/estimate) ──────────── */
    if (action === 'earn-estimate') {
      const { currency, amount } = payload
      if (!currency || !amount) {
        return json({ error: 'Missing currency or amount' }, 400)
      }
      const params = new URLSearchParams({
        currency: String(currency),
        amount: String(amount),
      })
      const res = await fetch(`${COINRABBIT_BASE}/earns/estimate?${params}`, {
        method: 'GET',
        headers: authHeaders,
      })
      return json(await res.json(), res.ok ? 200 : res.status)
    }

    /* ── Create loan ─────────────────────────────────────── */
    if (action === 'create-loan') {
      const { collateral_currency, collateral_amount, ltv, loan_currency = 'usdt' } = payload
      if (!collateral_currency || !collateral_amount || !ltv) {
        return json({ error: 'Missing required fields' }, 400)
      }
      const res = await fetch(`${COINRABBIT_BASE}/loans`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          collateral_currency,
          collateral_amount: Number(collateral_amount),
          ltv: Number(ltv),
          loan_currency,
        }),
      })
      return json(await res.json(), res.ok ? 200 : res.status)
    }

    /* ── Create earn deposit ─────────────────────────────── */
    if (action === 'create-earn') {
      const { currency, amount } = payload
      if (!currency || !amount) {
        return json({ error: 'Missing required fields' }, 400)
      }
      const res = await fetch(`${COINRABBIT_BASE}/earn`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ currency, amount: Number(amount) }),
      })
      return json(await res.json(), res.ok ? 200 : res.status)
    }

    /* ── Check loan status ───────────────────────────────── */
    if (action === 'loan-status') {
      const { id } = payload
      if (!id) return json({ error: 'Missing loan id' }, 400)
      const res = await fetch(`${COINRABBIT_BASE}/loans/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: authHeaders,
      })
      return json(await res.json(), res.ok ? 200 : res.status)
    }

    /* ── Check earn status ───────────────────────────────── */
    if (action === 'earn-status') {
      const { id } = payload
      if (!id) return json({ error: 'Missing earn id' }, 400)
      const res = await fetch(`${COINRABBIT_BASE}/earn/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: authHeaders,
      })
      return json(await res.json(), res.ok ? 200 : res.status)
    }

    /* ── Generic proxy (backward compat) ─────────────────── */
    const { endpoint, method = 'GET', body } = payload
    if (endpoint && typeof endpoint === 'string') {
      const allowedPrefixes = ['/loans', '/earn', '/earns', '/quotes', '/currencies', '/auth']
      const isAllowed = allowedPrefixes.some((p) => endpoint.startsWith(p))
      if (!isAllowed) return json({ error: 'Endpoint not allowed' }, 403)
      const fetchOpts: RequestInit = { method, headers: authHeaders }
      if (method !== 'GET' && body) fetchOpts.body = JSON.stringify(body)
      const res = await fetch(`${COINRABBIT_BASE}${endpoint}`, fetchOpts)
      return json(await res.json(), res.ok ? 200 : res.status)
    }

    return json({ error: 'Missing action or endpoint parameter' }, 400)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('CoinRabbit proxy error:', msg)
    return json({ error: msg }, 500)
  }
})
