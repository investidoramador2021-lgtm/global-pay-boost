const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// CoinRabbit Partner API v2 base
// Docs: provided to partners directly — requires active partner API key
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

    /* ── Currencies list (for dynamic selectors) ─────────── */
    if (action === 'currencies') {
      const { type = 'all' } = payload // 'loan', 'earn', or 'all'
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

    /* ── Create loan ─────────────────────────────────────── */
    if (action === 'create-loan') {
      const { collateral_currency, collateral_amount, ltv, loan_currency = 'usdt' } = payload
      if (!collateral_currency || !collateral_amount || !ltv) {
        return json({ error: 'Missing required fields: collateral_currency, collateral_amount, ltv' }, 400)
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
      const data = await res.json()
      // Return the deposit address (send_address) + amount for white-label modal
      return json(data, res.ok ? 200 : res.status)
    }

    /* ── Create earn deposit ─────────────────────────────── */
    if (action === 'create-earn') {
      const { currency, amount } = payload
      if (!currency || !amount) {
        return json({ error: 'Missing required fields: currency, amount' }, 400)
      }
      const res = await fetch(`${COINRABBIT_BASE}/earn`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          currency,
          amount: Number(amount),
        }),
      })
      const data = await res.json()
      return json(data, res.ok ? 200 : res.status)
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
      const allowedPrefixes = ['/loans', '/earn', '/quotes', '/currencies', '/auth']
      const isAllowed = allowedPrefixes.some((p) => endpoint.startsWith(p))
      if (!isAllowed) {
        return json({ error: 'Endpoint not allowed' }, 403)
      }
      const fetchOpts: RequestInit = {
        method,
        headers: authHeaders,
      }
      if (method !== 'GET' && body) {
        fetchOpts.body = JSON.stringify(body)
      }
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
