import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * StealthEX provider edge function.
 * - Auth: Bearer token via STEALTHEX_API_KEY.
 * - Affiliate tracking: short STEALTHEX_AFFILIATE_ID (NEVER a URL — keeps payloads <422 bytes).
 * - Surfaces same shape as changenow / letsexchange so the LiquidityAggregator can route freely.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const SE_BASE = 'https://api.stealthex.io/api/v4';
const SE_AFFILIATE_ID = (Deno.env.get('STEALTHEX_AFFILIATE_ID') || '').trim();

const TICKER_RE = /^[a-z0-9]{1,40}$/i;
const TX_ID_RE = /^[a-zA-Z0-9_-]{1,80}$/;
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

// StealthEX uses ticker + network parameters similar to LE.
// Map our composite tickers (e.g., usdttrc20) to {symbol, network}.
function splitTickerNetwork(raw: string): { symbol: string; network: string } {
  const t = raw.toLowerCase();
  const map: Array<[RegExp, string, string]> = [
    [/^(usdt|usdc)erc20$/, '$1', 'erc20'],
    [/^(usdt|usdc)trc20$/, '$1', 'trc20'],
    [/^(usdt|usdc)bsc$/, '$1', 'bep20'],
    [/^(usdt|usdc)sol$/, '$1', 'sol'],
    [/^(usdt|usdc)matic$/, '$1', 'matic'],
    [/^(usdt|usdc)arb$/, '$1', 'arbitrum'],
    [/^(usdt|usdc)op$/, '$1', 'optimism'],
    [/^(usdt|usdc)base$/, '$1', 'base'],
    [/^(usdt|usdc)ton$/, '$1', 'ton'],
    [/^(usdt|usdc)avaxc?$/, '$1', 'avaxc'],
  ];
  for (const [re, codeRepl, net] of map) {
    const m = t.match(re);
    if (m) return { symbol: m[1], network: net };
  }
  return { symbol: t, network: t };
}

async function seFetch(path: string, apiKey: string, init?: RequestInit) {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey}`,
    'Accept': 'application/json',
    ...((init?.body) ? { 'Content-Type': 'application/json' } : {}),
  };
  return fetch(`${SE_BASE}${path}`, { ...init, headers: { ...headers, ...(init?.headers as any || {}) } });
}

console.log(`[SE] boot rev=1 base=${SE_BASE} affiliate_active=${SE_AFFILIATE_ID ? 'yes' : 'no'} aff_len=${SE_AFFILIATE_ID.length}`);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const apiKey = Deno.env.get('STEALTHEX_API_KEY');
  if (!apiKey) return json({ error: 'STEALTHEX_API_KEY not configured' }, 500);

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
      case 'min-amount': {
        const from = params.from;
        const to = params.to;
        if (!from || !to) return bad('Missing from/to');
        if (!isTicker(from) || !isTicker(to)) return bad('Invalid ticker');

        const f = splitTickerNetwork(from);
        const t = splitTickerNetwork(to);
        const r = await seFetch(
          `/rates/range?route[from][symbol]=${f.symbol}&route[from][network]=${f.network}&route[to][symbol]=${t.symbol}&route[to][network]=${t.network}&estimation=direct&rate=floating`,
          apiKey,
        );
        const p = await parseJson(r);
        if (!r.ok || !p.isJson) {
          return json({ minAmount: 0, warningMessage: 'Min unavailable.' });
        }
        return json({ minAmount: Number(p.data?.min_amount || 0) });
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
        const r = await seFetch(
          `/rates/estimated-amount?route[from][symbol]=${f.symbol}&route[from][network]=${f.network}&route[to][symbol]=${t.symbol}&route[to][network]=${t.network}&estimation=direct&rate=floating&amount=${encodeURIComponent(amount)}`,
          apiKey,
        );
        const p = await parseJson(r);
        if (!r.ok || !p.isJson) {
          console.error(`SE estimate [${r.status}] ${f.symbol}/${f.network}->${t.symbol}/${t.network} resp=${p.text?.slice(0,300)}`);
          return json({ estimatedAmount: null, transactionSpeedForecast: null, warningMessage: 'Rate unavailable.' });
        }
        return json({
          estimatedAmount: Number(p.data?.estimated_amount || 0),
          transactionSpeedForecast: null,
          warningMessage: null,
        });
      }

      case 'create-transaction': {
        if (!postBody) return bad('POST body required');
        const { from, to, amount, address, extraId, refundAddress } = postBody as Record<string, any>;
        if (!from || !to || !amount || !address) return bad('Missing required fields');
        if (!isTicker(from) || !isTicker(to)) return bad('Invalid ticker');

        const f = splitTickerNetwork(String(from));
        const t = splitTickerNetwork(String(to));

        // CRITICAL: send the short affiliate ID only — never a URL.
        const body: Record<string, unknown> = {
          route: {
            from: { symbol: f.symbol, network: f.network },
            to:   { symbol: t.symbol, network: t.network },
          },
          estimation: 'direct',
          rate: 'floating',
          amount: String(amount),
          address: String(address),
          extra_id: extraId || '',
          refund_address: refundAddress || '',
          refund_extra_id: '',
        };
        if (SE_AFFILIATE_ID) body.affiliate_id = SE_AFFILIATE_ID;

        const r = await seFetch('/exchanges', apiKey, { method: 'POST', body: JSON.stringify(body) });
        const p = await parseJson(r);
        if (!p.isJson) {
          console.error('SE create-tx non-JSON:', p.text?.slice(0, 300));
          return json({ error: 'Provider unavailable.' }, 502);
        }
        if (!r.ok) {
          console.error(`SE create-tx [${r.status}] resp=${JSON.stringify(p.data).slice(0,400)}`);
          return json({ error: p.data?.message || p.data?.error || 'Provider error.' }, r.status);
        }
        const d = p.data;
        return json({
          id: d.id,
          payinAddress: d.deposit?.address || '',
          payoutAddress: d.withdrawal?.address || address,
          payinExtraId: d.deposit?.extra_id || '',
          fromCurrency: (d.route?.from?.symbol || f.symbol).toLowerCase(),
          toCurrency: (d.route?.to?.symbol || t.symbol).toLowerCase(),
          amount: Number(d.deposit?.amount || amount),
          payoutExtraId: d.withdrawal?.extra_id || '',
        });
      }

      case 'tx-status': {
        const id = params.id;
        if (!id) return bad('Missing id');
        if (!isTxId(id)) return bad('Invalid id');
        const r = await seFetch(`/exchanges/${encodeURIComponent(id)}`, apiKey);
        const p = await parseJson(r);
        if (!p.isJson) {
          return json({ id, status: 'waiting', payinAddress: '', payoutAddress: '', fromCurrency: '', toCurrency: '', amountSend: null, amountReceive: null, payinHash: null, payoutHash: null });
        }
        if (!r.ok) {
          return json({ id, status: 'waiting', error: p.data?.message || 'Status unavailable.' });
        }
        const d = p.data;
        const seStatus = String(d.status || '').toLowerCase();
        const statusMap: Record<string, string> = {
          waiting: 'waiting',
          confirming: 'confirming',
          exchanging: 'exchanging',
          sending: 'sending',
          finished: 'finished',
          expired: 'failed',
          failed: 'failed',
          refunded: 'refunded',
          verifying: 'confirming',
        };
        return json({
          id: d.id || id,
          status: statusMap[seStatus] || seStatus || 'waiting',
          payinAddress: d.deposit?.address || '',
          payoutAddress: d.withdrawal?.address || '',
          fromCurrency: (d.route?.from?.symbol || '').toLowerCase(),
          toCurrency: (d.route?.to?.symbol || '').toLowerCase(),
          amountSend: d.deposit?.amount ? Number(d.deposit.amount) : null,
          amountReceive: d.withdrawal?.amount ? Number(d.withdrawal.amount) : null,
          payinHash: d.deposit?.hash || null,
          payoutHash: d.withdrawal?.hash || null,
        });
      }

      case 'list-transactions': {
        const limit = params.limit || '100';
        const r = await seFetch(`/exchanges?limit=${limit}`, apiKey);
        const p = await parseJson(r);
        if (!r.ok || !p.isJson) {
          console.error(`SE list-tx [${r.status}]: ${p.text?.slice(0,200)}`);
          return json([], 200);
        }
        const list = Array.isArray(p.data) ? p.data : (p.data?.data || p.data?.exchanges || []);
        const statusMap: Record<string, string> = {
          waiting: 'waiting', confirming: 'confirming', exchanging: 'exchanging',
          sending: 'sending', finished: 'finished', expired: 'failed',
          failed: 'failed', refunded: 'refunded', verifying: 'confirming',
        };
        const normalized = list.map((d: any) => ({
          id: d.id,
          status: statusMap[String(d.status || '').toLowerCase()] || d.status || 'waiting',
          fromCurrency: (d.route?.from?.symbol || '').toLowerCase(),
          toCurrency: (d.route?.to?.symbol || '').toLowerCase(),
          amountSend: d.deposit?.amount ? Number(d.deposit.amount) : null,
          amountReceive: d.withdrawal?.amount ? Number(d.withdrawal.amount) : null,
          payinAddress: d.deposit?.address || '',
          payoutAddress: d.withdrawal?.address || '',
          payinHash: d.deposit?.hash || null,
          payoutHash: d.withdrawal?.hash || null,
          createdAt: d.timestamps?.created_at || d.created_at || null,
          provider: 'se',
        }));
        return json(normalized);
      }

      default:
        return bad(`Invalid action: ${action}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('SE function error:', msg);
    return json({ error: msg }, 500);
  }
});
