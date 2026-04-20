const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const BASE = 'https://api.coinrabbit.io/v2'

const NETWORK_ALIASES: Record<string, string> = {
  'TRC-20': 'TRX', TRX: 'TRX',
  'ERC-20': 'ETH', ETH: 'ETH',
  BSC: 'BSC',
  POLYGON: 'MATIC', MATIC: 'MATIC',
  SOLANA: 'SOL', SOL: 'SOL',
  ARBITRUM: 'ARBITRUM',
  OPTIMISM: 'OP', OP: 'OP',
  BTC: 'BTC',
}

type CoinrabbitCurrency = {
  code?: string; network?: string; name?: string
  is_earn_enabled?: boolean; is_loan_deposit_enabled?: boolean; is_loan_receive_enabled?: boolean
  earn_min_amount?: string | number | null; earn_rate_percent?: string | number | null
}

// ─── In-memory JWT cache ───
let cachedJwt: string | null = null
let jwtExpiresAt = 0

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function readProviderBody(response: Response) {
  const text = await response.text()
  if (!text) return null
  try { return JSON.parse(text) } catch { return { raw: text } }
}

function normalizeNetwork(network: unknown) {
  const value = String(network || '').trim().toUpperCase()
  return NETWORK_ALIASES[value] || value
}

function splitCurrencyId(currencyId: string) {
  const [code = '', network = ''] = currencyId.split('_')
  return { code: code.toUpperCase(), network: normalizeNetwork(network) }
}

function buildCurrencyId(code: unknown, network: unknown) {
  const c = String(code || '').trim().toUpperCase()
  const n = normalizeNetwork(network)
  return c && n ? `${c}_${n}` : ''
}

function logProvider404(method: string, url: string, reqBody: unknown, resBody: unknown) {
  console.error('CoinRabbit provider 404', JSON.stringify({ method, url, reqBody, resBody }))
}

async function callProvider(url: string, init: RequestInit, reqBody?: unknown) {
  const response = await fetch(url, init)
  const responseBody = await readProviderBody(response)
  if (response.status === 404) logProvider404(init.method || 'GET', url, reqBody ?? null, responseBody)
  return { response, responseBody }
}

// ─── JWT Authentication ───
async function getJwt(apiKey: string): Promise<string> {
  // Return cached JWT if still valid (with 60s margin)
  if (cachedJwt && Date.now() < jwtExpiresAt - 60_000) return cachedJwt

  const body = { api_key: apiKey, external_id: 'MRCGlobalPay' }
  const { response, responseBody } = await callProvider(`${BASE}/auth/partner`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'x-api-key': apiKey,
    },
    body: JSON.stringify(body),
  }, body)

  const data = responseBody as Record<string, unknown> | null
  const inner = data && typeof data === 'object' && 'response' in data
    ? (data.response as Record<string, unknown>)
    : data

  const token = inner?.token || inner?.jwt || inner?.access_token
  if (!response.ok || !token) {
    console.error('JWT auth failed', JSON.stringify({ status: response.status, body: responseBody }))
    throw new Error(`JWT auth failed: ${response.status}`)
  }

  cachedJwt = String(token)
  // Default 1h expiry; parse from response if available
  const expiresIn = Number(inner?.expires_in || inner?.ttl || 3600) * 1000
  jwtExpiresAt = Date.now() + expiresIn
  console.log('JWT acquired, expires in', expiresIn / 1000, 's')
  return cachedJwt
}

function authHeaders(apiKey: string, jwt?: string): Record<string, string> {
  if (jwt) {
    // CoinRabbit V2: raw JWT in x-user-token (no "Bearer" prefix)
    return {
      'Content-Type': 'application/json',
      'x-user-token': jwt.trim(),
      'x-api-key': apiKey,
    }
  }
  return {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  }
}

// ─── Fetch CoinRabbit user profile (numeric id) ───
async function getCoinrabbitUserId(apiKey: string, jwt: string): Promise<string | null> {
  try {
    const headers = authHeaders(apiKey, jwt)
    const { response, responseBody } = await callProvider(`${BASE}/users`, { method: 'GET', headers })
    if (!response.ok) {
      console.error('[users] fetch failed', response.status, JSON.stringify(responseBody))
      return null
    }
    const inner = unwrapResponse(responseBody)
    // Try common shapes: { id }, { user: { id } }, [{ id }]
    const candidate =
      (inner && typeof inner === 'object' && 'id' in inner ? (inner as Record<string, unknown>).id : null) ??
      (inner && typeof inner === 'object' && 'user' in inner ? ((inner as Record<string, unknown>).user as Record<string, unknown>)?.id : null) ??
      (Array.isArray(inner) && inner.length > 0 ? (inner[0] as Record<string, unknown>)?.id : null)
    if (candidate == null) {
      console.error('[users] no id field in response', JSON.stringify(inner))
      return null
    }
    return String(candidate)
  } catch (e) {
    console.error('[users] error:', e)
    return null
  }
}

// ─── Currencies catalog ───
async function getCurrenciesCatalog(headers: Record<string, string>) {
  const { responseBody } = await callProvider(`${BASE}/currencies`, { method: 'GET', headers })
  const items = responseBody && typeof responseBody === 'object' && 'response' in responseBody && Array.isArray((responseBody as { response?: unknown }).response)
    ? ((responseBody as { response: CoinrabbitCurrency[] }).response ?? [])
    : []
  return { raw: responseBody, items }
}

// ─── Normalizers ───
function normalizeLoanEstimate(p: Record<string, unknown>) {
  return {
    collateral_currency: String(p.collateral_currency || '').toLowerCase(),
    collateral_amount: Number(p.collateral_amount || 0),
    loan_currency: String(p.loan_currency || 'usdt').toLowerCase(),
    ltv: Number(p.ltv || 0),
  }
}

function normalizeEarnEstimate(p: Record<string, unknown>) {
  const currencyId = String(p.currencyId || '').trim().toUpperCase()
  const idParts = currencyId ? splitCurrencyId(currencyId) : null
  return {
    currency: String(p.currency || idParts?.code || '').trim().toUpperCase(),
    currencyId,
    network: normalizeNetwork(p.network || idParts?.network),
    amount: Number(p.amount || 0),
  }
}

function unwrapResponse(body: unknown): Record<string, unknown> {
  if (body && typeof body === 'object' && 'response' in body) {
    return (body as { response: Record<string, unknown> }).response
  }
  return body as Record<string, unknown>
}

function buildProviderError(url: string, reqBody: unknown, resBody: unknown, message = 'Endpoint not found') {
  return { result: false, message, code: 'COINRABBIT_PROVIDER_ERROR', diagnostics: { requested_url: url, request_body: reqBody, response_body: resBody } }
}

// ─── Main handler ───
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const apiKey = Deno.env.get('COINRABBIT_API_KEY')
  if (!apiKey) return json({ error: 'COINRABBIT_API_KEY not configured' }, 500)

  const h = authHeaders(apiKey)

  try {
    let p: Record<string, unknown> = {}
    if (req.method === 'GET') {
      const url = new URL(req.url)
      for (const [k, v] of url.searchParams.entries()) p[k] = v
    } else {
      p = await req.json()
    }

    const action = String(p.action || '')

    // ─── Auth partner (manual test) ───
    if (action === 'auth-partner') {
      try {
        const jwt = await getJwt(apiKey)
        return json({ result: true, token: jwt, expires_at: jwtExpiresAt })
      } catch (e) {
        return json({ result: false, error: e instanceof Error ? e.message : 'Auth failed' }, 500)
      }
    }

    // ─── Currencies ───
    if (action === 'currencies') {
      const t = String(p.type || 'all')
      const { raw, items } = await getCurrenciesCatalog(h)
      if (t === 'earn') return json({ ...(raw && typeof raw === 'object' ? raw : {}), response: items.filter((i) => i.is_earn_enabled) })
      if (t === 'loan') return json({ ...(raw && typeof raw === 'object' ? raw : {}), response: items.filter((i) => i.is_loan_deposit_enabled || i.is_loan_receive_enabled) })
      return json(raw)
    }

    // ─── Loan estimate ───
    if (action === 'loan-estimate') {
      const body = normalizeLoanEstimate(p)
      if (!body.collateral_currency || !body.collateral_amount) return json({ error: 'Missing params' }, 400)

      const fromCode = body.collateral_currency.toUpperCase()
      const fromNetwork = normalizeNetwork(p.from_network || p.collateral_network || fromCode)
      const toCode = body.loan_currency.toUpperCase()
      const toNetwork = normalizeNetwork(p.to_network || p.loan_network || 'ETH')
      const exchange = String(p.exchange || 'direct')
      const roundedAmount = parseFloat(Number(body.collateral_amount).toFixed(8))

      const qs = new URLSearchParams({
        from_code: fromCode, from_network: fromNetwork,
        to_code: toCode, to_network: toNetwork,
        amount: String(roundedAmount),
        ltv_percent: String(body.ltv || 50),
        exchange,
      })
      const url = `${BASE}/loans/estimate?${qs}`
      const { response, responseBody } = await callProvider(url, { method: 'GET', headers: h })

      if (response.ok) return json(responseBody, 200)

      // Fallback
      const { items } = await getCurrenciesCatalog(h)
      const match = items.find((i) => String(i.code || '').toUpperCase() === fromCode && i.is_loan_deposit_enabled)
      const ltvRates: Record<number, number> = { 50: 8, 70: 10, 80: 12, 90: 14 }
      const interestRate = ltvRates[body.ltv] || 12
      const loanAmount = body.collateral_amount * (body.ltv / 100)
      const liquidationPrice = body.collateral_amount > 0 ? (loanAmount / body.collateral_amount) * 1.1 : 0

      return json({
        result: true, amount_to: loanAmount, loan_amount: loanAmount,
        ltv_percent: body.ltv, ltv: body.ltv,
        interest_percent: interestRate, interest_rate: interestRate,
        liquidation_price: liquidationPrice,
        loan_deposit_min_amount: match ? Number(match.earn_min_amount || 25) : 25,
        collateral_currency: body.collateral_currency, loan_currency: body.loan_currency,
        source: match ? 'currencies_catalog_fallback' : 'static_fallback',
      })
    }

    // ─── Earn estimate ───
    if (action === 'earn-estimate') {
      const body = normalizeEarnEstimate(p)
      if (!body.currency || !body.amount) return json({ error: 'Missing params' }, 400)

      const currencyCode = body.currency.toUpperCase()
      const currencyNetwork = body.network || normalizeNetwork(p.currency_network || currencyCode)

      const qs = new URLSearchParams({ currency_code: currencyCode, currency_network: currencyNetwork })
      const exactUrl = `${BASE}/earns/estimate?${qs}`
      const exactRequest = await callProvider(exactUrl, { method: 'GET', headers: h })

      if (exactRequest.response.ok) {
        const raw = exactRequest.responseBody as Record<string, unknown>
        const inner = (raw?.response && typeof raw.response === 'object' ? raw.response : raw) as Record<string, unknown>
        return json({
          result: true, annual_percent: Number(inner.annual_percent || 0),
          currency: currencyCode, network: currencyNetwork,
          currency_id: buildCurrencyId(currencyCode, currencyNetwork), source: 'live_api',
        }, 200)
      }

      const { items } = await getCurrenciesCatalog(h)
      const match = items.find((i) => {
        const itemId = buildCurrencyId(i.code, i.network)
        const sameCurrencyId = !!body.currencyId && itemId === body.currencyId
        const sameCode = String(i.code || '').toUpperCase() === body.currency.toUpperCase()
        const sameNetwork = !body.network || normalizeNetwork(i.network) === body.network
        return i.is_earn_enabled && (sameCurrencyId || (sameCode && sameNetwork))
      })

      if (!match) return json(buildProviderError(exactUrl, { currency_code: currencyCode, currency_network: currencyNetwork }, exactRequest.responseBody, `No earn product found for ${body.currency}`), 200)

      return json({
        result: true, annual_percent: Number(match.earn_rate_percent || 0),
        earn_min_amount: Number(match.earn_min_amount || 0),
        currency: match.code, network: match.network,
        currency_id: buildCurrencyId(match.code, match.network), source: 'currencies_catalog',
      })
    }

    // ─── Create loan ───
    if (action === 'create-loan') {
      const body = normalizeLoanEstimate(p)
      if (!body.collateral_currency || !body.collateral_amount || !body.ltv) return json({ error: 'Missing fields' }, 400)

      const fromCode = body.collateral_currency.toUpperCase()
      const fromNetwork = normalizeNetwork(p.from_network || p.collateral_network || fromCode)
      const toCode = body.loan_currency.toUpperCase()
      const toNetwork = normalizeNetwork(p.to_network || p.loan_network || 'ETH')

      const requestBody: Record<string, unknown> = {
        deposit: {
          currency_code: fromCode, currency_network: fromNetwork,
          expected_amount: parseFloat(Number(body.collateral_amount).toFixed(8)),
        },
        loan: { currency_code: toCode, currency_network: toNetwork },
        ltv_percent: String(body.ltv / 100),
        external_id: 'MRCGlobalPay',
      }
      if (p.email) requestBody.email = String(p.email)
      if (p.phone) requestBody.phone = String(p.phone)
      if (p.loan_address) requestBody.loan_address = String(p.loan_address)

      console.log('[create-loan] body:', JSON.stringify(requestBody))
      const { response, responseBody } = await callProvider(`${BASE}/loans`, {
        method: 'POST', headers: h, body: JSON.stringify(requestBody),
      }, requestBody)

      if (!response.ok) {
        const msg = typeof responseBody === 'object' && responseBody ? JSON.stringify(responseBody) : String(responseBody)
        if (msg.includes('contact') || msg.includes('validat') || msg.includes('email') || msg.includes('phone')) {
          return json({ error: 'Please check your phone and email format (Include + for country code).', provider_error: responseBody }, 422)
        }
        return json(responseBody, response.status)
      }

      const inner = unwrapResponse(responseBody)
      const loanId = inner?.id || inner?.loan_id

      // Attempt to fetch deposit address separately if not in response
      let depositAddress = inner?.deposit_address || inner?.deposit?.address
      if (!depositAddress && loanId) {
        try {
          const jwt = await getJwt(apiKey)
          const jwtHeaders = authHeaders(apiKey, jwt)
          const statusRes = await callProvider(`${BASE}/loans/${encodeURIComponent(String(loanId))}`, { method: 'GET', headers: jwtHeaders })
          if (statusRes.response.ok) {
            const statusInner = unwrapResponse(statusRes.responseBody)
            depositAddress = statusInner?.deposit_address || statusInner?.deposit?.address || (statusInner?.deposit as Record<string, unknown>)?.wallet_address
          }
        } catch (e) {
          console.error('Deposit address fetch failed:', e)
        }
      }

      return json({ result: true, ...inner, deposit_address: depositAddress || null }, 200)
    }

    // ─── Create earn ───
    if (action === 'create-earn') {
      const body = normalizeEarnEstimate(p)
      if (!body.currency || !body.amount) return json({ error: 'Missing fields' }, 400)

      const currencyCode = body.currency.toUpperCase()
      const currencyNetwork = body.network || normalizeNetwork(p.currency_network || currencyCode)

      // Use JWT auth (x-user-token) for V2 earns endpoint
      const jwt = await getJwt(apiKey)
      const jwtHeaders = authHeaders(apiKey, jwt)

      // Fetch numeric CoinRabbit user id; fallback to legacy string if unavailable
      const cnUserId = await getCoinrabbitUserId(apiKey, jwt)
      const userId = cnUserId || String(p.user_id || p.external_id || `MRCGlobalPay_${Date.now()}`)

      // V2 API flat payload: top-level currency_code/network, deposit.expected_amount as string
      const requestBody: Record<string, unknown> = {
        user_id: userId,
        deposit: {
          expected_amount: String(body.amount),
        },
        currency_code: currencyCode,
        currency_network: currencyNetwork,
      }
      if (p.email) requestBody.email = String(p.email)
      if (p.phone) requestBody.phone = String(p.phone)

      console.log('[create-earn] body:', JSON.stringify(requestBody))
      const url = `${BASE}/earns`
      const { response, responseBody } = await callProvider(url, {
        method: 'POST', headers: jwtHeaders, body: JSON.stringify(requestBody),
      }, requestBody)

      if (response.status === 404) return json(buildProviderError(url, requestBody, responseBody), 200)

      if (!response.ok) {
        const msg = typeof responseBody === 'object' && responseBody ? JSON.stringify(responseBody) : String(responseBody)
        if (msg.includes('contact') || msg.includes('validat') || msg.includes('email') || msg.includes('phone')) {
          return json({ error: 'Please check your phone and email format (Include + for country code).', provider_error: responseBody }, 422)
        }
        return json({ provider_error: responseBody, request_body: requestBody }, response.status)
      }

      const inner = unwrapResponse(responseBody)
      return json({ result: true, ...inner }, 200)
    }

    // ─── Loan status (JWT-authenticated) ───
    if (action === 'loan-status') {
      if (!p.id) return json({ error: 'Missing id' }, 400)
      // Force fresh JWT for status calls
      cachedJwt = null; jwtExpiresAt = 0
      try {
        const jwt = await getJwt(apiKey)
        const jwtHeaders = authHeaders(apiKey, jwt)
        const url = `${BASE}/loans/${encodeURIComponent(String(p.id))}`
        console.log('[loan-status] Fetching with JWT, headers:', JSON.stringify(Object.keys(jwtHeaders)))
        const { response, responseBody } = await callProvider(url, { method: 'GET', headers: jwtHeaders })
        console.log('[loan-status] Response:', response.status, JSON.stringify(responseBody))
        if (response.ok) return json(unwrapResponse(responseBody), 200)
        // Return full diagnostics on failure
        return json({ 
          result: false, error: 'Status fetch failed', status: response.status,
          provider_response: responseBody,
          jwt_preview: jwt.substring(0, 20) + '...',
        }, response.status)
      } catch (e) {
        console.error('loan-status error:', e)
        return json({ result: false, error: e instanceof Error ? e.message : 'Unknown error' }, 500)
      }
    }

    // ─── Earn status (JWT-authenticated) ───
    if (action === 'earn-status') {
      if (!p.id) return json({ error: 'Missing id' }, 400)
      cachedJwt = null; jwtExpiresAt = 0
      try {
        const jwt = await getJwt(apiKey)
        const jwtHeaders = authHeaders(apiKey, jwt)
        const url = `${BASE}/earns/${encodeURIComponent(String(p.id))}`
        const { response, responseBody } = await callProvider(url, { method: 'GET', headers: jwtHeaders })
        if (response.ok) return json(unwrapResponse(responseBody), 200)
        return json({
          result: false, error: 'Status fetch failed', status: response.status,
          provider_response: responseBody,
        }, response.status)
      } catch (e) {
        console.error('earn-status error:', e)
        return json({ result: false, error: e instanceof Error ? e.message : 'Unknown error' }, 500)
      }
    }

    // ─── Generic endpoint proxy ───
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
