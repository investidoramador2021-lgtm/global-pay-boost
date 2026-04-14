const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const BASE = 'https://api.coinrabbit.io/v2'

const NETWORK_ALIASES: Record<string, string> = {
  'TRC-20': 'TRX',
  TRX: 'TRX',
  'ERC-20': 'ETH',
  ETH: 'ETH',
  BSC: 'BSC',
  POLYGON: 'MATIC',
  MATIC: 'MATIC',
  SOLANA: 'SOL',
  SOL: 'SOL',
  ARBITRUM: 'ARBITRUM',
  OPTIMISM: 'OP',
  OP: 'OP',
  MAINNET: 'BTC',
  BTC: 'BTC',
}

type CoinrabbitCurrency = {
  code?: string
  network?: string
  name?: string
  is_earn_enabled?: boolean
  is_loan_deposit_enabled?: boolean
  is_loan_receive_enabled?: boolean
  earn_min_amount?: string | number | null
  earn_rate_percent?: string | number | null
}

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

function normalizeNetwork(network: unknown) {
  const value = String(network || '').trim().toUpperCase()
  return NETWORK_ALIASES[value] || value
}

function logProvider404(method: string, url: string, requestBody: unknown, responseBody: unknown) {
  console.error('CoinRabbit provider 404', JSON.stringify({ method, url, requestBody, responseBody }))
}

async function callProvider(url: string, init: RequestInit, requestBody?: unknown) {
  const response = await fetch(url, init)
  const responseBody = await readProviderBody(response)

  if (response.status === 404) {
    logProvider404(init.method || 'GET', url, requestBody ?? null, responseBody)
  }

  return { response, responseBody }
}

async function getCurrenciesCatalog(headers: Record<string, string>) {
  const { responseBody } = await callProvider(`${BASE}/currencies`, { method: 'GET', headers })
  const items = responseBody && typeof responseBody === 'object' && 'response' in responseBody && Array.isArray((responseBody as { response?: unknown }).response)
    ? ((responseBody as { response: CoinrabbitCurrency[] }).response ?? [])
    : []

  return {
    raw: responseBody,
    items,
  }
}

function normalizeLoanEstimate(payload: Record<string, unknown>) {
  return {
    collateral_currency: String(payload.collateral_currency || '').toLowerCase(),
    collateral_amount: Number(payload.collateral_amount || 0),
    loan_currency: String(payload.loan_currency || 'usdt').toLowerCase(),
    ltv: Number(payload.ltv || 0),
  }
}

function normalizeEarnEstimate(payload: Record<string, unknown>) {
  return {
    currency: String(payload.currency || '').toLowerCase(),
    network: normalizeNetwork(payload.network),
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
      const body = { api_key: apiKey }
      const { response, responseBody } = await callProvider(`${BASE}/auth/partner`, { method: 'POST', headers: h, body: JSON.stringify(body) }, body)
      return json(responseBody, response.ok ? 200 : response.status)
    }

    if (action === 'currencies') {
      const t = String(p.type || 'all')
      const { raw, items } = await getCurrenciesCatalog(h)

      if (t === 'earn') {
        return json({ ...(raw && typeof raw === 'object' ? raw : {}), response: items.filter((item) => item.is_earn_enabled) })
      }

      if (t === 'loan') {
        return json({ ...(raw && typeof raw === 'object' ? raw : {}), response: items.filter((item) => item.is_loan_deposit_enabled || item.is_loan_receive_enabled) })
      }

      return json(raw)
    }

    if (action === 'loan-estimate') {
      const body = normalizeLoanEstimate(p)
      if (!body.collateral_currency || !body.collateral_amount) return json({ error: 'Missing params' }, 400)
      const { response, responseBody } = await callProvider(`${BASE}/loans/estimate`, {
        method: 'POST',
        headers: h,
        body: JSON.stringify(body),
      }, body)
      return json(responseBody, response.ok ? 200 : response.status)
    }

    if (action === 'earn-estimate') {
      const body = normalizeEarnEstimate(p)
      if (!body.currency || !body.amount) return json({ error: 'Missing params' }, 400)

      const { items } = await getCurrenciesCatalog(h)
      const match = items.find((item) => {
        const sameCode = String(item.code || '').toUpperCase() === body.currency.toUpperCase()
        const sameNetwork = !body.network || normalizeNetwork(item.network) === body.network
        return sameCode && sameNetwork && item.is_earn_enabled
      })

      if (!match) {
        return json({
          result: false,
          message: `No earn product found for ${body.currency.toUpperCase()}${body.network ? ` on ${body.network}` : ''}`,
          code: 'EARN_ASSET_UNAVAILABLE',
          diagnostics: {
            requested_url: `${BASE}/currencies`,
            request_body: body,
          },
        })
      }

      return json({
        result: true,
        annual_percent: Number(match.earn_rate_percent || 0),
        earn_min_amount: Number(match.earn_min_amount || 0),
        currency: match.code,
        network: match.network,
        source: 'currencies_catalog',
      })
    }

    if (action === 'create-loan') {
      const body = normalizeLoanEstimate(p)
      if (!body.collateral_currency || !body.collateral_amount || !body.ltv) return json({ error: 'Missing fields' }, 400)
      const { response, responseBody } = await callProvider(`${BASE}/loans`, {
        method: 'POST',
        headers: h,
        body: JSON.stringify(body),
      }, body)
      return json(responseBody, response.ok ? 200 : response.status)
    }

    if (action === 'create-earn') {
      const body = normalizeEarnEstimate(p)
      if (!body.currency || !body.amount) return json({ error: 'Missing fields' }, 400)
      const { response, responseBody } = await callProvider(`${BASE}/earns`, {
        method: 'POST',
        headers: h,
        body: JSON.stringify(body),
      }, body)
      return json(responseBody, response.ok ? 200 : response.status)
    }

    if (action === 'loan-status') {
      if (!p.id) return json({ error: 'Missing id' }, 400)
      const url = `${BASE}/loans/${encodeURIComponent(String(p.id))}`
      const { response, responseBody } = await callProvider(url, { method: 'GET', headers: h })
      return json(responseBody, response.ok ? 200 : response.status)
    }

    if (action === 'earn-status') {
      if (!p.id) return json({ error: 'Missing id' }, 400)
      const url = `${BASE}/earns/${encodeURIComponent(String(p.id))}`
      const { response, responseBody } = await callProvider(url, { method: 'GET', headers: h })
      return json(responseBody, response.ok ? 200 : response.status)
    }

    const ep = p.endpoint
    if (ep && typeof ep === 'string') {
      const ok = ['/loans', '/earn', '/earns', '/quotes', '/currencies', '/auth']
      if (!ok.some((x) => ep.startsWith(x))) return json({ error: 'Not allowed' }, 403)
      const method = String(p.method || 'GET').toUpperCase()
      const opts: RequestInit = { method, headers: h }
      if (method !== 'GET' && p.body) opts.body = JSON.stringify(p.body)
      const url = `${BASE}${ep}`
      const { response, responseBody } = await callProvider(url, opts, p.body)
      return json(responseBody, response.ok ? 200 : response.status)
    }

    return json({ error: 'Missing action or endpoint' }, 400)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('CoinRabbit proxy error:', msg)
    return json({ error: msg }, 500)
  }
})
