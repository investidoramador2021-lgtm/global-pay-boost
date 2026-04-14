const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const COINRABBIT_BASE = 'https://api.coinrabbit.io/v2'

async function coinrabbitFetch(path: string, apiKey: string, method = 'GET', body?: unknown, userToken?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  }
  if (userToken) headers['x-user-token'] = userToken

  const opts: RequestInit = { method, headers }
  if (method !== 'GET' && body) opts.body = JSON.stringify(body)

  const res = await fetch(`${COINRABBIT_BASE}${path}`, opts)
  return res.json()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const apiKey = Deno.env.get('COINRABBIT_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'COINRABBIT_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { action, endpoint, method = 'GET', body, ...params } = await req.json()

    // ──────────────────────────────────────────────
    // ACTION-BASED ROUTES (white-label flows)
    // ──────────────────────────────────────────────

    if (action === 'partner-auth') {
      // Get a user token for headless partner flow
      const externalId = params.external_id || `mrc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      const data = await coinrabbitFetch('/auth/partner', apiKey, 'POST', { external_id: externalId })
      return json({ ...data, external_id: externalId })
    }

    if (action === 'create-loan') {
      // Step 1: Auth
      const externalId = `mrc_loan_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      const auth = await coinrabbitFetch('/auth/partner', apiKey, 'POST', { external_id: externalId })
      if (!auth.result) return json({ error: 'Auth failed', details: auth }, 400)
      const userToken = auth.response.token

      // Step 2: Create loan
      const loanData = await coinrabbitFetch('/loans', apiKey, 'POST', {
        deposit: {
          currency_code: params.collateral_code,
          currency_network: params.collateral_network,
          expected_amount: String(params.collateral_amount),
        },
        loan: {
          currency_code: params.loan_code || 'USDT',
          currency_network: params.loan_network || 'TRX',
        },
      }, userToken)
      if (!loanData.result) return json({ error: 'Loan creation failed', details: loanData }, 400)

      const loanId = loanData.response.loan_id

      // Step 3: Confirm (provides receive address for loan payout + returns deposit address)
      const confirmData = await coinrabbitFetch(`/loans/${loanId}/confirm`, apiKey, 'POST', {
        loan: { receive_address: params.receive_address },
        agreed_to_tos: true,
      }, userToken)

      return json({
        result: true,
        loan_id: loanId,
        deposit_address: confirmData.response?.address || null,
        deposit_extra_id: confirmData.response?.extraId || null,
        loan_details: loanData.response,
        external_id: externalId,
        user_token: userToken,
      })
    }

    if (action === 'create-earn') {
      // Step 1: Auth
      const externalId = `mrc_earn_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      const auth = await coinrabbitFetch('/auth/partner', apiKey, 'POST', { external_id: externalId })
      if (!auth.result) return json({ error: 'Auth failed', details: auth }, 400)
      const userToken = auth.response.token

      // Step 2: Create earn
      const earnData = await coinrabbitFetch('/earns', apiKey, 'POST', {
        currency_code: params.currency_code,
        currency_network: params.currency_network,
        deposit: { expected_amount: String(params.amount) },
      }, userToken)
      if (!earnData.result) return json({ error: 'Earn creation failed', details: earnData }, 400)

      const earnId = earnData.response.earn_id

      // Step 3: Confirm
      const confirmData = await coinrabbitFetch(`/earns/${earnId}/confirm`, apiKey, 'POST', {
        agreed_to_tos: true,
      }, userToken)

      // Step 4: Get updated earn to retrieve deposit address
      const earnStatus = await coinrabbitFetch(`/earns/${earnId}`, apiKey, 'GET', undefined, userToken)

      return json({
        result: true,
        earn_id: earnId,
        deposit_address: earnStatus.response?.deposit?.send_address || confirmData.response?.address || null,
        deposit_extra_id: earnStatus.response?.deposit?.send_extra_id || confirmData.response?.extraId || null,
        earn_details: earnStatus.response || earnData.response,
        external_id: externalId,
        user_token: userToken,
      })
    }

    if (action === 'loan-status') {
      const auth = await coinrabbitFetch('/auth/partner', apiKey, 'POST', { external_id: params.external_id })
      if (!auth.result) return json({ error: 'Auth failed' }, 400)
      const data = await coinrabbitFetch(`/loans/${params.loan_id}`, apiKey, 'GET', undefined, auth.response.token)
      return json(data)
    }

    if (action === 'earn-status') {
      const auth = await coinrabbitFetch('/auth/partner', apiKey, 'POST', { external_id: params.external_id })
      if (!auth.result) return json({ error: 'Auth failed' }, 400)
      const data = await coinrabbitFetch(`/earns/${params.earn_id}`, apiKey, 'GET', undefined, auth.response.token)
      return json(data)
    }

    // ──────────────────────────────────────────────
    // GENERIC PROXY (for currencies, estimates, etc.)
    // ──────────────────────────────────────────────

    if (!endpoint || typeof endpoint !== 'string') {
      return json({ error: 'Missing endpoint or action' }, 400)
    }

    const allowedPrefixes = ['/loans', '/earns', '/currencies']
    const isAllowed = allowedPrefixes.some((p) => endpoint.startsWith(p))
    if (!isAllowed) {
      return json({ error: 'Endpoint not allowed' }, 403)
    }

    const data = await coinrabbitFetch(endpoint, apiKey, method, body)
    return json(data)

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('CoinRabbit proxy error:', msg)
    return json({ error: msg }, 500)
  }
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
