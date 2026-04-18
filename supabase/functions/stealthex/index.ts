import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * StealthEX provider edge function — uses v2 API.
 * - Auth: api_key query param (NOT Bearer).
 * - Affiliate: short STEALTHEX_AFFILIATE_ID only (never a URL).
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const SE_BASE = 'https://api.stealthex.io/api/v2';
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

const seUrl = (path: string, key: string, extra: Record<string, string> = {}) => {
  const qp = new URLSearchParams({ api_key: key, ...extra });
  return `${SE_BASE}${path}?${qp.toString()}`;
};

console.log(`[SE] boot rev=3 base=${SE_BASE} affiliate_active=${SE_AFFILIATE_ID ? 'yes' : 'no'} aff_len=${SE_AFFILIATE_ID.length}`);

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
        const from = params.from, to = params.to;
        if (!from || !to) return bad('Missing from/to');
        if (!isTicker(from) || !isTicker(to)) return bad('Invalid ticker');
        const r = await fetch(seUrl(`/min_amount/${encodeURIComponent(from)}/${encodeURIComponent(to)}`, apiKey));
        const p = await parseJson(r);
        if (!r.ok || !p.isJson) return json({ minAmount: 0, warningMessage: 'Min unavailable.' });
        return json({ minAmount: Number(p.data?.min_amount || p.data || 0) });
      }

      case 'estimate': {
        const from = params.from, to = params.to, amount = params.amount;
        if (!from || !to || !amount) return bad('Missing from/to/amount');
        if (!isTicker(from) || !isTicker(to)) return bad('Invalid ticker');
        if (!isAmount(amount)) return bad('Invalid amount');
        const r = await fetch(seUrl(`/estimate/${encodeURIComponent(from)}/${encodeURIComponent(to)}`, apiKey, { amount }));
        const p = await parseJson(r);
        if (!r.ok || !p.isJson) {
          console.error(`SE estimate [${r.status}] ${from}->${to} resp=${p.text?.slice(0,300)}`);
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

        const body: Record<string, unknown> = {
          currency_from: String(from).toLowerCase(),
          currency_to: String(to).toLowerCase(),
          amount_from: String(amount),
          address_to: String(address),
          extra_id_to: extraId || '',
          refund_address: refundAddress || '',
          refund_extra_id: '',
        };
        if (SE_AFFILIATE_ID) body.affiliate_id = SE_AFFILIATE_ID;

        const r = await fetch(seUrl('/exchange', apiKey), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(body),
        });
        const p = await parseJson(r);
        if (!p.isJson) {
          console.error('SE create-tx non-JSON:', p.text?.slice(0, 300));
          return json({ error: 'Provider unavailable.' }, 502);
        }
        if (!r.ok) {
          console.error(`SE create-tx [${r.status}] resp=${JSON.stringify(p.data).slice(0,400)}`);
          return json({ error: p.data?.err?.details || p.data?.message || p.data?.error || 'Provider error.' }, r.status);
        }
        const d = p.data;
        return json({
          id: d.id,
          payinAddress: d.address_from || '',
          payoutAddress: d.address_to || address,
          payinExtraId: d.extra_id_from || '',
          fromCurrency: (d.currency_from || from).toLowerCase(),
          toCurrency: (d.currency_to || to).toLowerCase(),
          amount: Number(d.amount_from || amount),
          payoutExtraId: d.extra_id_to || '',
        });
      }

      case 'tx-status': {
        const id = params.id;
        if (!id) return bad('Missing id');
        if (!isTxId(id)) return bad('Invalid id');
        const r = await fetch(seUrl(`/exchange/${encodeURIComponent(id)}`, apiKey));
        const p = await parseJson(r);
        if (!p.isJson || !r.ok) {
          return json({ id, status: 'waiting', payinAddress: '', payoutAddress: '', fromCurrency: '', toCurrency: '', amountSend: null, amountReceive: null, payinHash: null, payoutHash: null });
        }
        const d = p.data;
        const seStatus = String(d.status || '').toLowerCase();
        const statusMap: Record<string, string> = {
          waiting: 'waiting', confirming: 'confirming', exchanging: 'exchanging',
          sending: 'sending', finished: 'finished', expired: 'failed',
          failed: 'failed', refunded: 'refunded', verifying: 'confirming',
        };
        return json({
          id: d.id || id,
          status: statusMap[seStatus] || seStatus || 'waiting',
          payinAddress: d.address_from || '',
          payoutAddress: d.address_to || '',
          fromCurrency: (d.currency_from || '').toLowerCase(),
          toCurrency: (d.currency_to || '').toLowerCase(),
          amountSend: d.amount_from ? Number(d.amount_from) : null,
          amountReceive: d.amount_to ? Number(d.amount_to) : null,
          payinHash: d.tx_from || null,
          payoutHash: d.tx_to || null,
        });
      }

      case 'list-transactions': {
        const limit = String(Math.min(Number(params.limit || '100'), 250));
        const offset = String(Number(params.offset || '0'));
        const r = await fetch(seUrl('/exchanges', apiKey, { limit, offset }));
        const p = await parseJson(r);
        if (!r.ok || !p.isJson) {
          console.error(`SE list [${r.status}] resp=${p.text?.slice(0, 300)}`);
          return json([], 200);
        }
        const list: any[] = p.data?.data?.exchanges || p.data?.exchanges || [];
        const normalized = list.map((d: any) => {
          const seStatus = String(d.status || '').toLowerCase();
          const statusMap: Record<string, string> = {
            waiting: 'waiting', confirming: 'confirming', exchanging: 'exchanging',
            sending: 'sending', finished: 'finished', expired: 'failed',
            failed: 'failed', refunded: 'refunded', verifying: 'confirming',
          };
          return {
            id: d.id,
            status: statusMap[seStatus] || seStatus || 'waiting',
            payinAddress: d.address_from || '',
            payoutAddress: d.address_to || '',
            fromCurrency: (d.currency_from || '').toLowerCase(),
            toCurrency: (d.currency_to || '').toLowerCase(),
            amountSend: d.amount_from ? Number(d.amount_from) : null,
            amountReceive: d.amount_to ? Number(d.amount_to) : null,
            payinHash: d.tx_from || null,
            payoutHash: d.tx_to || null,
            createdAt: (() => {
              const t = d.timestamp ?? d.created_at ?? d.createdAt;
              if (!t) return new Date().toISOString();
              try {
                const ms = typeof t === 'number'
                  ? (t < 1e12 ? t * 1000 : t)
                  : (/^\d+$/.test(String(t)) ? (Number(t) < 1e12 ? Number(t) * 1000 : Number(t)) : Date.parse(String(t)));
                const dt = new Date(ms);
                return isNaN(dt.getTime()) ? new Date().toISOString() : dt.toISOString();
              } catch { return new Date().toISOString(); }
            })(),
          };
        });
        return json(normalized, 200);
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
