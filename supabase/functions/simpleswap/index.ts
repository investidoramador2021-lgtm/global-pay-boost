/**
 * SimpleSwap v3 provider edge function — crypto-to-crypto only.
 *
 * - Auth: x-api-key header (SIMPLESWAP_API_KEY).
 * - v3 mandates separate `ticker` + `network` strings for /estimates and /exchanges.
 * - Range validation (/ranges) is callable via action=ranges; aggregator may use it
 *   as a pre-flight before create-transaction.
 * - 0.5% commission parity with ChangeNOW: SimpleSwap manages affiliate margin via
 *   API-key tier; the displayed estimated_amount is what the user receives net.
 * - Status mapping: waiting/confirming/exchanging/sending/finished/failed/refunded.
 *
 * Brand integrity: provider name never leaks back to the UI; aggregator uses code 'ss'.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const SS_BASE = 'https://api.simpleswap.io/v3';

const TICKER_RE = /^[a-z0-9]{1,40}$/i;
const NETWORK_RE = /^[a-z0-9_-]{1,40}$/i;
const TX_ID_RE = /^[a-zA-Z0-9_-]{1,80}$/;

const isTicker = (v: string) => TICKER_RE.test(v);
const isNetwork = (v: string) => !v || NETWORK_RE.test(v);
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

/** Split user-supplied ticker (e.g. "usdttrc20", "usdt-trc20", "usdt:trc20") into ticker+network.
 *  Falls back to default networks for known assets. */
function splitTickerNetwork(raw: string): { ticker: string; network: string } {
  const t = String(raw || '').toLowerCase().trim();
  // Explicit separator
  const m = t.match(/^([a-z0-9]+)[-_:]([a-z0-9]+)$/);
  if (m) return { ticker: m[1], network: m[2] };
  // Common compound tickers
  const compound: Array<[RegExp, string, string]> = [
    [/^usdttrc20$/, 'usdt', 'trc20'],
    [/^usdterc20$/, 'usdt', 'erc20'],
    [/^usdtbsc$|^usdtbep20$/, 'usdt', 'bep20'],
    [/^usdtsol$/, 'usdt', 'sol'],
    [/^usdtarb$/, 'usdt', 'arb'],
    [/^usdtop$/, 'usdt', 'op'],
    [/^usdcerc20$/, 'usdc', 'erc20'],
    [/^usdcbsc$|^usdcbep20$/, 'usdc', 'bep20'],
    [/^usdcsol$/, 'usdc', 'sol'],
    [/^usdcarb$/, 'usdc', 'arb'],
  ];
  for (const [re, tk, nw] of compound) if (re.test(t)) return { ticker: tk, network: nw };

  // Defaults by ticker
  const defaults: Record<string, string> = {
    btc: 'btc', eth: 'eth', bnb: 'bsc', sol: 'sol', xrp: 'xrp', ada: 'ada',
    doge: 'doge', ltc: 'ltc', trx: 'trx', xmr: 'xmr', dot: 'dot', matic: 'matic',
    avax: 'avaxc', ton: 'ton', near: 'near', atom: 'atom', usdt: 'trc20',
    usdc: 'erc20', dai: 'erc20', shib: 'erc20', link: 'erc20', uni: 'erc20',
    pepe: 'erc20', bonk: 'sol', wif: 'sol', jup: 'sol', pyth: 'sol',
    arb: 'arb', op: 'op', hype: 'eth', tao: 'eth', tia: 'tia', kas: 'kas',
    bera: 'bera', monad: 'monad', bdag: 'bdag', siren: 'eth', pyusd: 'erc20',
  };
  return { ticker: t, network: defaults[t] || t };
}

const ssHeaders = (key: string) => ({ 'x-api-key': key, 'Accept': 'application/json' });

console.log(`[SS] boot rev=1 base=${SS_BASE}`);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  const apiKey = Deno.env.get('SIMPLESWAP_API_KEY');
  if (!apiKey) return json({ error: 'SIMPLESWAP_API_KEY not configured' }, 500);

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
    const headers = ssHeaders(apiKey);

    switch (action) {
      case 'currencies': {
        const r = await fetch(`${SS_BASE}/currencies?fixed=false`, { headers });
        const p = await parseJson(r);
        if (!r.ok || !p.isJson) {
          console.error('SS currencies error:', p.text?.slice(0, 200));
          return json([], 200);
        }
        const list: any[] = Array.isArray(p.data) ? p.data : (p.data?.result || p.data?.data || []);
        const normalized = list
          .filter((c: any) => c && (c.symbol || c.ticker) && c.network !== 'fiat' && !c.is_fiat)
          .map((c: any) => {
            const network = String(c.network || '').toLowerCase();
            const symbol = String(c.symbol || c.ticker || '').toLowerCase();
            const display = symbol;
            return {
              ticker: display,
              name: c.name ? (network ? `${c.name} (${network.toUpperCase()})` : c.name) : symbol.toUpperCase(),
              image: c.image || c.icon_url || c.icon || c.logo || '',
              hasExternalId: !!c.has_extra_id,
              isFiat: false,
              featured: !!c.is_popular,
              isStable: !!c.is_stable,
              supportsFixedRate: false,
              network,
              tokenContract: c.contract_address || null,
            };
          });
        return json(normalized);
      }

      case 'min-amount':
      case 'ranges': {
        const from = params.from, to = params.to;
        if (!from || !to) return bad('Missing from/to');
        if (!isTicker(from) || !isTicker(to)) return bad('Invalid ticker');
        const f = splitTickerNetwork(from);
        const t = splitTickerNetwork(to);
        const qp = new URLSearchParams({
          tickerFrom: f.ticker, networkFrom: f.network,
          tickerTo: t.ticker, networkTo: t.network,
        });
        const r = await fetch(`${SS_BASE}/ranges?${qp.toString()}`, { headers });
        const p = await parseJson(r);
        if (!r.ok || !p.isJson) return json({ minAmount: 0, maxAmount: null, warningMessage: 'Range unavailable.' });
        const min = Number(p.data?.min || p.data?.minAmount || 0);
        const max = p.data?.max ? Number(p.data.max) : null;
        return json({ minAmount: min, maxAmount: max });
      }

      case 'estimate': {
        const from = params.from, to = params.to, amount = params.amount;
        if (!from || !to || !amount) return bad('Missing from/to/amount');
        if (!isTicker(from) || !isTicker(to)) return bad('Invalid ticker');
        if (!isAmount(amount)) return bad('Invalid amount');
        const f = splitTickerNetwork(from);
        const t = splitTickerNetwork(to);
        if (!isNetwork(f.network) || !isNetwork(t.network)) return bad('Invalid network');
        const qp = new URLSearchParams({
          tickerFrom: f.ticker, networkFrom: f.network,
          tickerTo: t.ticker, networkTo: t.network,
          amount: String(amount),
        });
        const r = await fetch(`${SS_BASE}/estimates?${qp.toString()}`, { headers });
        const p = await parseJson(r);
        if (!r.ok || !p.isJson) {
          console.error(`SS estimate [${r.status}] ${from}->${to} resp=${p.text?.slice(0,300)}`);
          return json({ estimatedAmount: null, transactionSpeedForecast: null, warningMessage: 'Rate unavailable.' });
        }
        const est = Number(p.data?.estimatedAmount || p.data?.estimated_amount || p.data?.amount_to || 0);
        return json({
          estimatedAmount: est,
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
        if (!isNetwork(f.network) || !isNetwork(t.network)) return bad('Invalid network');

        // Pre-flight range check
        const rangeQp = new URLSearchParams({
          tickerFrom: f.ticker, networkFrom: f.network,
          tickerTo: t.ticker, networkTo: t.network,
        });
        const rr = await fetch(`${SS_BASE}/ranges?${rangeQp.toString()}`, { headers });
        const rp = await parseJson(rr);
        if (rr.ok && rp.isJson) {
          const min = Number(rp.data?.min || rp.data?.minAmount || 0);
          const max = rp.data?.max ? Number(rp.data.max) : null;
          const amt = Number(amount);
          if (min > 0 && amt < min) return json({ error: `Amount below minimum (${min} ${f.ticker.toUpperCase()})` }, 400);
          if (max && amt > max) return json({ error: `Amount above maximum (${max} ${f.ticker.toUpperCase()})` }, 400);
        }

        const body: Record<string, unknown> = {
          tickerFrom: f.ticker, networkFrom: f.network,
          tickerTo: t.ticker, networkTo: t.network,
          amount: String(amount),
          addressTo: String(address),
          extraIdTo: extraId || '',
          userRefundAddress: refundAddress || '',
          userRefundExtraId: '',
        };

        const r = await fetch(`${SS_BASE}/exchanges`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const p = await parseJson(r);
        if (!p.isJson) {
          console.error('SS create-tx non-JSON:', p.text?.slice(0, 300));
          return json({ error: 'Provider unavailable.' }, 502);
        }
        if (!r.ok) {
          console.error(`SS create-tx [${r.status}] resp=${JSON.stringify(p.data).slice(0,400)}`);
          return json({ error: p.data?.message || p.data?.error || p.data?.description || 'Provider error.' }, r.status);
        }
        const d = p.data?.result || p.data;
        return json({
          id: d.id,
          payinAddress: d.addressFrom || d.address_from || '',
          payoutAddress: d.addressTo || d.address_to || address,
          payinExtraId: d.extraIdFrom || d.extra_id_from || '',
          fromCurrency: f.ticker,
          toCurrency: t.ticker,
          amount: Number(d.amountFrom || d.amount_from || amount),
          payoutExtraId: d.extraIdTo || d.extra_id_to || '',
        });
      }

      case 'tx-status': {
        const id = params.id;
        if (!id) return bad('Missing id');
        if (!isTxId(id)) return bad('Invalid id');
        const r = await fetch(`${SS_BASE}/exchanges/${encodeURIComponent(id)}`, { headers });
        const p = await parseJson(r);
        if (!p.isJson || !r.ok) {
          return json({ id, status: 'waiting', payinAddress: '', payoutAddress: '', fromCurrency: '', toCurrency: '', amountSend: null, amountReceive: null, payinHash: null, payoutHash: null });
        }
        const d = p.data?.result || p.data;
        const ssStatus = String(d.status || '').toLowerCase();
        const statusMap: Record<string, string> = {
          waiting: 'waiting', confirming: 'confirming', exchanging: 'exchanging',
          sending: 'sending', finished: 'finished', expired: 'failed',
          failed: 'failed', refunded: 'refunded', verifying: 'confirming',
        };
        return json({
          id: d.id || id,
          status: statusMap[ssStatus] || ssStatus || 'waiting',
          payinAddress: d.addressFrom || d.address_from || '',
          payoutAddress: d.addressTo || d.address_to || '',
          fromCurrency: String(d.tickerFrom || d.currency_from || '').toLowerCase(),
          toCurrency: String(d.tickerTo || d.currency_to || '').toLowerCase(),
          amountSend: (d.amountFrom || d.amount_from) ? Number(d.amountFrom || d.amount_from) : null,
          amountReceive: (d.amountTo || d.amount_to) ? Number(d.amountTo || d.amount_to) : null,
          payinHash: d.txFrom || d.tx_from || null,
          payoutHash: d.txTo || d.tx_to || null,
        });
      }

      // ===== FIAT (Buy on-ramp) =====
      // SimpleSwap uses the same API key for fiat. Fiat tickers (usd, eur, etc.)
      // are sent without a network; crypto leg keeps ticker+network split.
      case 'fiat-estimate': {
        const fromCurrency = String(params.from || '').toLowerCase();
        const toCurrency = String(params.to || '').toLowerCase();
        const amount = String(params.amount || '');
        if (!fromCurrency || !toCurrency || !amount) return bad('Missing from/to/amount');
        if (!isTicker(fromCurrency) || !isTicker(toCurrency)) return bad('Invalid ticker');
        if (!isAmount(amount)) return bad('Invalid amount');
        const FIAT = new Set(['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy', 'chf', 'nzd', 'sek', 'nok', 'dkk', 'pln', 'brl', 'mxn']);
        const fromIsFiat = FIAT.has(fromCurrency);
        const toIsFiat = FIAT.has(toCurrency);
        const fromSplit = fromIsFiat ? { ticker: fromCurrency, network: '' } : splitTickerNetwork(fromCurrency);
        const toSplit = toIsFiat ? { ticker: toCurrency, network: '' } : splitTickerNetwork(toCurrency);
        const qp = new URLSearchParams({
          tickerFrom: fromSplit.ticker,
          tickerTo: toSplit.ticker,
          amount: String(amount),
          fiat: 'true',
        });
        if (fromSplit.network) qp.set('networkFrom', fromSplit.network);
        if (toSplit.network) qp.set('networkTo', toSplit.network);
        const r = await fetch(`${SS_BASE}/estimates?${qp.toString()}`, { headers });
        const p = await parseJson(r);
        if (!r.ok || !p.isJson) {
          console.error(`SS fiat-estimate [${r.status}] ${fromCurrency}->${toCurrency} resp=${p.text?.slice(0,300)}`);
          return json({ estimatedAmount: null, warningMessage: 'Rate unavailable.' });
        }
        const est = Number(p.data?.estimatedAmount || p.data?.estimated_amount || p.data?.amount_to || 0);
        return json({ estimatedAmount: est, warningMessage: null });
      }

      case 'fiat-create-transaction': {
        if (!postBody) return bad('POST body required');
        const { from, to, amount, address, extraId, refundAddress, email } = postBody as Record<string, any>;
        if (!from || !to || !amount || !address) return bad('Missing required fields');
        const fromCurrency = String(from).toLowerCase();
        const toCurrency = String(to).toLowerCase();
        if (!isTicker(fromCurrency) || !isTicker(toCurrency)) return bad('Invalid ticker');
        const FIAT = new Set(['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy', 'chf', 'nzd', 'sek', 'nok', 'dkk', 'pln', 'brl', 'mxn']);
        const fromIsFiat = FIAT.has(fromCurrency);
        const toIsFiat = FIAT.has(toCurrency);
        const fromSplit = fromIsFiat ? { ticker: fromCurrency, network: '' } : splitTickerNetwork(fromCurrency);
        const toSplit = toIsFiat ? { ticker: toCurrency, network: '' } : splitTickerNetwork(toCurrency);

        const body: Record<string, unknown> = {
          tickerFrom: fromSplit.ticker,
          tickerTo: toSplit.ticker,
          amount: String(amount),
          addressTo: String(address),
          extraIdTo: extraId || '',
          userRefundAddress: refundAddress || '',
          userRefundExtraId: '',
          fiat: true,
        };
        if (fromSplit.network) body.networkFrom = fromSplit.network;
        if (toSplit.network) body.networkTo = toSplit.network;
        if (email) body.userEmail = String(email);

        const r = await fetch(`${SS_BASE}/exchanges`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const p = await parseJson(r);
        if (!p.isJson) {
          console.error('SS fiat create-tx non-JSON:', p.text?.slice(0, 300));
          return json({ error: 'Provider unavailable.' }, 502);
        }
        if (!r.ok) {
          console.error(`SS fiat create-tx [${r.status}] resp=${JSON.stringify(p.data).slice(0,400)}`);
          return json({ error: p.data?.message || p.data?.error || p.data?.description || 'Provider error.' }, r.status);
        }
        const d = p.data?.result || p.data;
        return json({
          id: d.id,
          redirectUrl: d.redirectUrl || d.redirect_url || d.checkoutUrl || d.checkout_url || '',
          status: String(d.status || 'waiting').toLowerCase(),
          fromCurrency: fromSplit.ticker,
          toCurrency: toSplit.ticker,
          fromAmount: String(d.amountFrom || d.amount_from || amount),
          toAmount: d.amountTo || d.amount_to ? String(d.amountTo || d.amount_to) : null,
        });
      }

      default:
        return bad(`Invalid action: ${action}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('SS function error:', msg);
    return json({ error: msg }, 500);
  }
});
