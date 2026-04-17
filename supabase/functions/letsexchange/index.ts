import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// LetsExchange uses v1 API. v2 returns 404 for /info and /transaction.
const LE_BASE = 'https://api.letsexchange.io/api/v1';
const LE_AFFILIATE_ID = Deno.env.get('LETSEXCHANGE_AFFILIATE_ID') || '';

const TICKER_RE = /^[a-z0-9]{1,40}$/i;
const TX_ID_RE = /^[a-zA-Z0-9_-]{1,80}$/;
const NETWORK_RE = /^[a-z0-9]{1,40}$/i;

const isTicker = (v: string) => TICKER_RE.test(v);
const isAmount = (v: string) => { const n = Number(v); return isFinite(n) && n > 0; };
const isTxId = (v: string) => TX_ID_RE.test(v);

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const bad = (msg: string) => json({ error: msg }, 400);

async function parseJson(r: Response) {
  const text = await r.text();
  try { return { isJson: true as const, data: JSON.parse(text), text }; }
  catch { return { isJson: false as const, data: null, text }; }
}

// LE accepts uppercase tickers and a separate `network` field.
// We strip common network suffixes from CN-style tickers (usdterc20 → usdt + ETH).
function splitTickerNetwork(raw: string, fallbackNetwork?: string): { code: string; network: string } {
  const t = raw.toLowerCase();
  const map: Array<[RegExp, string, string]> = [
    [/^(usdt|usdc)erc20$/, '$1', 'ETH'],
    [/^(usdt|usdc)trc20$/, '$1', 'TRX'],
    [/^(usdt|usdc)bsc$/, '$1', 'BSC'],
    [/^(usdt|usdc)sol$/, '$1', 'SOL'],
    [/^(usdt|usdc)matic$/, '$1', 'MATIC'],
    [/^(usdt|usdc)arb$/, '$1', 'ARBITRUM'],
    [/^(usdt|usdc)op$/, '$1', 'OPTIMISM'],
    [/^(usdt|usdc)base$/, '$1', 'BASE'],
    [/^(usdt|usdc)ton$/, '$1', 'TON'],
    [/^(usdt|usdc)avaxc?$/, '$1', 'AVAXC'],
    [/^(usdt|usdc)arc20$/, '$1', 'AVAXC'],
  ];
  for (const [re, codeRepl, net] of map) {
    const m = t.match(re);
    if (m) return { code: m[1].toUpperCase(), network: net };
  }
  return { code: t.toUpperCase(), network: (fallbackNetwork || '').toUpperCase() };
}

async function leFetch(path: string, apiKey: string, init?: RequestInit) {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey}`,
    'Accept': 'application/json',
    ...((init?.body) ? { 'Content-Type': 'application/json' } : {}),
  };
  return fetch(`${LE_BASE}${path}`, { ...init, headers: { ...headers, ...(init?.headers as any || {}) } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const apiKey = Deno.env.get('LETSEXCHANGE_API_KEY');
  if (!apiKey) {
    return json({ error: 'LETSEXCHANGE_API_KEY not configured' }, 500);
  }

  try {
    let params: Record<string, string> = {};
    let postBody: Record<string, unknown> | null = null;

    const url = new URL(req.url);
    url.searchParams.forEach((v, k) => { params[k] = v; });

    if (req.method === 'POST') {
      const body = await req.json();
      if (body._get) {
        const { _get, ...rest } = body;
        params = { ...params, ...rest };
      } else {
        const { _action, ...rest } = body;
        if (_action) params.action = _action;
        postBody = rest;
      }
    }

    const action = params.action;

    switch (action) {
      case 'currencies': {
        // v1 also exposes /coins with same shape
        const r = await leFetch('/coins', apiKey);
        const p = await parseJson(r);
        if (!r.ok || !p.isJson) {
          console.error('LE currencies error:', p.text?.slice(0, 200));
          return json([], 200);
        }
        const list = Array.isArray(p.data) ? p.data : (p.data?.data || []);
        const normalized = list.map((c: any) => ({
          ticker: (c.code || c.ticker || '').toLowerCase(),
          name: c.name || c.code || '',
          image: c.icon || c.image_url || c.logo || '',
          hasExternalId: !!c.has_extra_id || !!c.has_memo,
          isFiat: false,
          featured: !!c.popular || !!c.rating,
          isStable: !!c.stable,
          supportsFixedRate: true,
          network: c.default_network_code || c.network || c.chain || '',
          tokenContract: c.contract_address || null,
        }));
        return json(normalized);
      }

      case 'min-amount': {
        const from = params.from;
        const to = params.to;
        if (!from || !to) return bad('Missing from/to');
        if (!isTicker(from) || !isTicker(to)) return bad('Invalid ticker');

        const f = splitTickerNetwork(from);
        const t = splitTickerNetwork(to);
        const body = {
          from: f.code,
          to: t.code,
          network_from: f.network || f.code,
          network_to: t.network || t.code,
          amount: '1',
          affiliate_id: LE_AFFILIATE_ID,
          promocode: '',
        };
        const r = await leFetch('/info', apiKey, { method: 'POST', body: JSON.stringify(body) });
        const p = await parseJson(r);
        if (!r.ok || !p.isJson) {
          return json({ minAmount: 0, warningMessage: 'Min unavailable.' });
        }
        return json({ minAmount: Number(p.data?.min_amount || p.data?.deposit_min_amount || 0) });
      }

      case 'estimate': {
        const from = params.from;
        const to = params.to;
        const amount = params.amount;
        if (!from || !to || !amount) return bad('Missing from/to/amount');
        if (!isTicker(from) || !isTicker(to)) return bad('Invalid ticker');
        if (!isAmount(amount)) return bad('Invalid amount');

        const f = splitTickerNetwork(from);
        const t = splitTickerNetwork(to);
        const body = {
          from: f.code,
          to: t.code,
          network_from: f.network || f.code,
          network_to: t.network || t.code,
          amount: String(amount),
          affiliate_id: LE_AFFILIATE_ID,
          promocode: '',
        };
        const r = await leFetch('/info', apiKey, { method: 'POST', body: JSON.stringify(body) });
        const p = await parseJson(r);
        if (!r.ok || !p.isJson) {
          console.error(`LE estimate error [${r.status}] body=${JSON.stringify(body)} resp=${p.text?.slice(0, 400)}`);
          return json({ estimatedAmount: null, transactionSpeedForecast: null, warningMessage: 'Rate unavailable.' });
        }
        return json({
          estimatedAmount: Number(p.data?.amount || 0),
          transactionSpeedForecast: null,
          warningMessage: null,
          // Extra fields surfaced for downstream use (rate-locking + fee disclosure)
          _rateId: p.data?.rate_id || null,
          _withdrawalFee: p.data?.withdrawal_fee ? Number(p.data.withdrawal_fee) : null,
          _minAmount: p.data?.min_amount ? Number(p.data.min_amount) : null,
          _maxAmount: p.data?.max_amount ? Number(p.data.max_amount) : null,
        });
      }

      case 'create-transaction': {
        if (!postBody) return bad('POST body required');
        const { from, to, amount, address, extraId, refundAddress, rateId } = postBody as Record<string, any>;
        if (!from || !to || !amount || !address) return bad('Missing required fields');
        if (!isTicker(from) || !isTicker(to)) return bad('Invalid ticker');

        const f = splitTickerNetwork(String(from));
        const t = splitTickerNetwork(String(to));

        // If no rate_id provided, fetch a fresh one first (LE requires it for transaction).
        let lockedRateId = rateId || '';
        if (!lockedRateId) {
          const infoBody = {
            from: f.code, to: t.code,
            network_from: f.network || f.code,
            network_to: t.network || t.code,
            amount: String(amount),
            affiliate_id: LE_AFFILIATE_ID, promocode: '',
          };
          const ir = await leFetch('/info', apiKey, { method: 'POST', body: JSON.stringify(infoBody) });
          const ip = await parseJson(ir);
          if (ir.ok && ip.isJson) lockedRateId = ip.data?.rate_id || '';
        }

        const body = {
          from: f.code,
          to: t.code,
          network_from: f.network || f.code,
          network_to: t.network || t.code,
          amount: String(amount),
          address_to: String(address),
          extra_id_to: extraId || '',
          return_address: refundAddress || '',
          return_extra_id: '',
          rate_id: lockedRateId,
          affiliate_id: LE_AFFILIATE_ID,
          promocode: '',
          coin_from: f.code,
          coin_to: t.code,
        };

        const r = await leFetch('/transaction', apiKey, { method: 'POST', body: JSON.stringify(body) });
        const p = await parseJson(r);
        if (!p.isJson) {
          console.error('LE create-tx non-JSON:', p.text?.slice(0, 300));
          return json({ error: 'Provider unavailable.' }, 502);
        }
        if (!r.ok) {
          console.error('LE create-tx error:', JSON.stringify(p.data));
          return json({ error: p.data?.error || p.data?.message || 'Provider error.' }, r.status);
        }
        const d = p.data;
        return json({
          id: d.transaction_id || d.id,
          payinAddress: d.deposit || d.deposit_address,
          payoutAddress: d.withdrawal || d.address_to,
          payinExtraId: d.deposit_extra_id || d.deposit_extra || '',
          fromCurrency: (d.coin_from || f.code).toLowerCase(),
          toCurrency: (d.coin_to || t.code).toLowerCase(),
          amount: Number(d.deposit_amount || amount),
          payoutExtraId: d.withdrawal_extra_id || '',
        });
      }

      case 'tx-status': {
        const id = params.id;
        if (!id) return bad('Missing id');
        if (!isTxId(id)) return bad('Invalid id');
        const r = await leFetch(`/transaction/${encodeURIComponent(id)}`, apiKey);
        const p = await parseJson(r);
        if (!r.ok || !p.isJson) {
          return json({ error: 'Status unavailable.' }, r.status || 502);
        }
        const d = p.data;
        const leStatus = String(d.status || '').toLowerCase();
        const statusMap: Record<string, string> = {
          'wait': 'waiting',
          'waiting': 'waiting',
          'confirmation': 'confirming',
          'confirming': 'confirming',
          'exchanging': 'exchanging',
          'sending': 'sending',
          'success': 'finished',
          'finished': 'finished',
          'overdue': 'failed',
          'expired': 'failed',
          'error': 'failed',
          'fail': 'failed',
          'failed': 'failed',
          'refund': 'refunded',
          'refunded': 'refunded',
        };
        return json({
          id: d.transaction_id || d.id || id,
          status: statusMap[leStatus] || leStatus || 'waiting',
          payinAddress: d.deposit || '',
          payoutAddress: d.withdrawal || '',
          fromCurrency: (d.coin_from || '').toLowerCase(),
          toCurrency: (d.coin_to || '').toLowerCase(),
          amountSend: d.deposit_amount ? Number(d.deposit_amount) : null,
          amountReceive: d.withdrawal_amount ? Number(d.withdrawal_amount) : null,
          payinHash: d.hash_in || null,
          payoutHash: d.hash_out || null,
        });
      }

      default:
        return bad(`Invalid action: ${action}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('LE function error:', msg);
    return json({ error: msg }, 500);
  }
});
