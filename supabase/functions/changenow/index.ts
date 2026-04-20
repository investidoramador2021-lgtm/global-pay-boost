import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-mrc-partner-id',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const V2_BASE = 'https://api.changenow.io/v2';

// Fire-and-forget Telegram notification
async function notifyTelegram(type: 'swap' | 'alert' | 'error', message: string) {
  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
    if (!botToken || !chatId) return;
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_notification: type === 'swap',
      }),
    });
  } catch (e) {
    console.error('Telegram notify failed:', e);
  }
}

const TICKER_RE = /^[a-z0-9]{1,20}$/i;
const TX_ID_RE = /^[a-zA-Z0-9_-]{1,64}$/;
const isValidTicker = (v: string) => TICKER_RE.test(v);
const isValidAmount = (v: string) => { const n = Number(v); return isFinite(n) && n > 0; };
const isValidTxId = (v: string) => TX_ID_RE.test(v);

function badRequest(msg: string) {
  return new Response(JSON.stringify({ error: msg }), {
    status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
async function parseJsonResponse(response: Response) {
  const text = await response.text();
  try { return { isJson: true as const, data: JSON.parse(text), text }; }
  catch { return { isJson: false as const, data: null, text }; }
}

// Map legacy MRC ticker (e.g. "usdterc20") → v2 { ticker, network }
// Suffixes mapped to v2 network names (which differ from suffix names)
const SUFFIX_TO_V2_NETWORK: Record<string, string> = {
  erc20: 'eth',         // usdterc20 → usdt + eth
  trc20: 'trx',         // usdttrc20 → usdt + trx
  bsc: 'bsc',
  bep20: 'bsc',
  matic: 'matic',
  polygon: 'matic',
  sol: 'sol',
  arc20: 'avaxc',       // usdtarc20 (AVAX C-CHAIN) → avaxc
  arb: 'arbitrum',      // etharb → eth + arbitrum
  arbitrum: 'arbitrum',
  op: 'op',
  ton: 'ton',
  celo: 'celo',
  apt: 'apt',
  assethub: 'assethub',
  algo: 'algo',
  sui: 'sui',
  mon: 'monad',
  monad: 'monad',
  zksync: 'zksync',
  base: 'base',
  lna: 'lna',
  manta: 'manta',
  avaxc: 'avaxc',
};
const SUFFIXES_SORTED = Object.keys(SUFFIX_TO_V2_NETWORK).sort((a, b) => b.length - a.length);

function splitNetwork(raw: string): { ticker: string; network: string } {
  const lower = raw.toLowerCase();
  for (const suf of SUFFIXES_SORTED) {
    if (lower.endsWith(suf) && lower.length > suf.length) {
      return { ticker: lower.slice(0, -suf.length), network: SUFFIX_TO_V2_NETWORK[suf] };
    }
  }
  return { ticker: lower, network: lower };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const apiKey = Deno.env.get('CHANGENOW_API_KEY');
  const privateKey = Deno.env.get('CHANGENOW_PRIVATE_KEY') || apiKey;
  if (!apiKey) {
    return jsonResponse({ error: 'CHANGENOW_API_KEY not configured' }, 500);
  }

  // Some v2 endpoints (estimate, by-fixed-rate, by-id) require the PRIVATE key,
  // others (currencies, min-amount) accept the PUBLIC key. We default to private when available.
  const primaryKey = privateKey || apiKey;
  const authHeaders = { 'x-changenow-api-key': primaryKey };
  const fallbackHeaders = primaryKey === apiKey ? null : { 'x-changenow-api-key': apiKey };

  // Retry transient network errors (connection resets, DNS hiccups) with exponential backoff.
  async function fetchWithRetry(url: string, init?: RequestInit, attempts = 3): Promise<Response> {
    let lastErr: unknown;
    for (let i = 0; i < attempts; i++) {
      try {
        const resp = await fetch(url, init);
        // Retry on 5xx upstream errors too (except 501 Not Implemented)
        if (resp.status >= 500 && resp.status !== 501 && i < attempts - 1) {
          await new Promise((r) => setTimeout(r, 200 * Math.pow(2, i)));
          continue;
        }
        return resp;
      } catch (err) {
        lastErr = err;
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`fetch attempt ${i + 1}/${attempts} failed for ${url}: ${msg}`);
        if (i < attempts - 1) {
          await new Promise((r) => setTimeout(r, 200 * Math.pow(2, i)));
        }
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error('fetch failed after retries');
  }

  async function fetchWithKeyFallback(url: string, init?: RequestInit) {
    let resp = await fetchWithRetry(url, { ...init, headers: { ...(init?.headers || {}), ...authHeaders } });
    if (resp.status === 401 && fallbackHeaders) {
      resp = await fetchWithRetry(url, { ...init, headers: { ...(init?.headers || {}), ...fallbackHeaders } });
    }
    return resp;
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
        const resp = await fetchWithKeyFallback(`${V2_BASE}/exchange/currencies?active=true&flow=standard`);
        const parsed = await parseJsonResponse(resp);
        if (!resp.ok || !parsed.isJson) {
          console.error('v2 currencies failed:', parsed.text);
          return jsonResponse([], 200);
        }
        // v2 returns same `ticker` (e.g. "usdt") for many networks. Reconstruct the
        // legacy compound MRC ticker (e.g. "usdttrc20") so each network variant is a
        // unique entry across providers and the frontend's POPULAR_TICKERS / display
        // maps continue to work.
        // Reverse map: v2 network → preferred legacy suffix (first match wins).
        const NETWORK_TO_SUFFIX: Record<string, string> = {
          eth: 'erc20',
          trx: 'trc20',
          bsc: 'bsc',
          matic: 'matic',
          sol: 'sol',
          avaxc: 'arc20',
          arbitrum: 'arb',
          op: 'op',
          ton: 'ton',
          celo: 'celo',
          apt: 'apt',
          assethub: 'assethub',
          algo: 'algo',
          sui: 'sui',
          monad: 'mon',
          zksync: 'zksync',
          base: 'base',
          lna: 'lna',
          manta: 'manta',
        };

        // Track first-seen ticker so the "native" entry keeps a clean symbol
        // (btc/btc → "btc", eth/eth → "eth"), and only secondary networks get suffixed.
        const seenNative = new Set<string>();
        const mapped = (parsed.data as any[]).map((c: any) => {
          const baseTicker = String(c.ticker || c.legacyTicker || '').toLowerCase();
          const network = String(c.network || '').toLowerCase();
          let outTicker = baseTicker;
          if (baseTicker && network && baseTicker !== network) {
            const suf = NETWORK_TO_SUFFIX[network];
            if (suf) outTicker = `${baseTicker}${suf}`;
          }
          // Native chain coin keeps the bare ticker; if a duplicate slips through,
          // append the network for uniqueness.
          if (seenNative.has(outTicker)) {
            outTicker = network ? `${outTicker}${network}` : outTicker;
          } else {
            seenNative.add(outTicker);
          }
          return {
            ticker: outTicker,
            name: c.name,
            image: c.image,
            hasExternalId: !!c.hasExternalId,
            isExtraIdSupported: !!c.isExtraIdSupported,
            isFiat: !!c.isFiat,
            featured: !!c.featured,
            isStable: !!c.isStable,
            supportsFixedRate: !!c.supportsFixedRate,
            network,
            tokenContract: c.tokenContract || null,
          };
        });
        return jsonResponse(mapped);
      }

      case 'min-amount': {
        const from = params.from, to = params.to;
        if (!from || !to) return badRequest('Missing from/to params');
        if (!isValidTicker(from) || !isValidTicker(to)) return badRequest('Invalid ticker format');
        const flow = params.fixedRate === 'true' ? 'fixed-rate' : 'standard';
        const f = splitNetwork(from), t = splitNetwork(to);
        const u = `${V2_BASE}/exchange/min-amount?fromCurrency=${f.ticker}&toCurrency=${t.ticker}&fromNetwork=${f.network}&toNetwork=${t.network}&flow=${flow}`;
        const resp = await fetchWithKeyFallback(u);
        const parsed = await parseJsonResponse(resp);
        if (!resp.ok || !parsed.isJson) {
          console.error('v2 min-amount failed:', parsed.text);
          return jsonResponse({ minAmount: 0, warningMessage: 'Minimum amount unavailable right now.' });
        }
        return jsonResponse({ minAmount: parsed.data.minAmount });
      }

      case 'estimate': {
        const from = params.from, to = params.to, amount = params.amount;
        if (!from || !to || !amount) return badRequest('Missing from/to/amount params');
        if (!isValidTicker(from) || !isValidTicker(to)) return badRequest('Invalid ticker format');
        if (!isValidAmount(amount)) return badRequest('Invalid amount');
        const flow = params.fixedRate === 'true' ? 'fixed-rate' : 'standard';
        const rateId = params.fixedRate === 'true' ? '&useRateId=true' : '';
        const f = splitNetwork(from), t = splitNetwork(to);
        const u = `${V2_BASE}/exchange/estimated-amount?fromCurrency=${f.ticker}&toCurrency=${t.ticker}&fromNetwork=${f.network}&toNetwork=${t.network}&fromAmount=${amount}&flow=${flow}${rateId}`;
        const resp = await fetchWithKeyFallback(u);
        const parsed = await parseJsonResponse(resp);
        if (!resp.ok || !parsed.isJson) {
          console.error('v2 estimate failed:', parsed.text);
          return jsonResponse({ estimatedAmount: null, transactionSpeedForecast: null, warningMessage: 'Rate unavailable right now.' });
        }
        return jsonResponse({
          estimatedAmount: parsed.data.toAmount ?? parsed.data.estimatedAmount ?? null,
          transactionSpeedForecast: parsed.data.transactionSpeedForecast ?? null,
          warningMessage: parsed.data.warningMessage ?? null,
          rateId: parsed.data.rateId ?? null,
        });
      }

      case 'create-transaction': {
        if (!postBody) return badRequest('POST body required');
        const { from, to, amount, address, extraId, refundAddress, refundExtraId, flow: bodyFlow, rateId } = postBody as any;
        const flow = bodyFlow || 'standard';
        const endpoint = flow === 'fixed-rate' ? 'by-fixed-rate' : 'by-standard-rate';
        const f = splitNetwork(from), t = splitNetwork(to);
        const v2Body: Record<string, unknown> = {
          fromCurrency: f.ticker,
          toCurrency: t.ticker,
          fromNetwork: f.network,
          toNetwork: t.network,
          fromAmount: String(amount),
          address,
          flow,
        };
        if (extraId) v2Body.extraId = extraId;
        if (refundAddress) v2Body.refundAddress = refundAddress;
        if (refundExtraId) v2Body.refundExtraId = refundExtraId;
        if (rateId) v2Body.rateId = rateId;

        const response = await fetchWithKeyFallback(`${V2_BASE}/exchange/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(v2Body),
        });
        const parsed = await parseJsonResponse(response);
        if (!parsed.isJson) {
          console.error('v2 create-transaction non-JSON:', parsed.text);
          return jsonResponse({ error: 'Exchange service unavailable. Please try again.' }, 502);
        }
        if (!response.ok) {
          console.error('v2 create-transaction error:', JSON.stringify(parsed.data));
          return jsonResponse({ error: parsed.data?.message || 'Exchange service error. Please try again.' }, response.status);
        }
        const txData = parsed.data;
        // Normalize to legacy shape
        const normalized = {
          id: txData.id,
          payinAddress: txData.payinAddress,
          payoutAddress: txData.payoutAddress,
          payinExtraId: txData.payinExtraId,
          payoutExtraId: txData.payoutExtraId,
          fromCurrency: txData.fromCurrency || from,
          toCurrency: txData.toCurrency || to,
          amount: txData.fromAmount ?? txData.amount ?? amount,
        };

        const fromC = String(from).toUpperCase();
        const toC = String(to).toUpperCase();
        const amountNum = Number(amount);
        const isHighValue = amountNum >= 10000;
        const telegramMsg = `[MRC GlobalPay] ✅ New Swap: ${amount} ${fromC} ➔ ${toC}\nStatus: ChangeNOW v2 Verified\nID: ${txData?.id || 'N/A'}`;
        notifyTelegram(isHighValue ? 'alert' : 'swap', isHighValue ? `🚨 HIGH VALUE\n${telegramMsg}` : telegramMsg);

        // ── Partner Attribution Engine ──
        const partnerKeyId = req.headers.get('x-mrc-partner-id');
        if (partnerKeyId) {
          try {
            const svc = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
            const { data: apiKeyRow } = await svc
              .from('partner_api_keys')
              .select('partner_id, is_active')
              .eq('key_id', partnerKeyId)
              .eq('is_active', true)
              .maybeSingle();
            if (apiKeyRow) {
              await svc.from('partner_api_keys').update({ last_used_at: new Date().toISOString() }).eq('key_id', partnerKeyId);
              const commission = amountNum * 0.004;
              const mrcTxId = `MRC-${txData?.id?.slice(0, 12) || crypto.randomUUID().slice(0, 12)}`;
              await svc.from('partner_transactions').insert({
                partner_id: (apiKeyRow as any).partner_id,
                asset: fromC.toLowerCase(),
                volume: amountNum,
                commission_btc: commission,
                completed_at: new Date().toISOString(),
                status: 'awaiting_deposit',
                mrc_transaction_id: mrcTxId,
                changenow_order_id: txData?.id || null,
              } as any);
              const { data: bal } = await svc.from('partner_balances').select('id, pending_btc').eq('partner_id', (apiKeyRow as any).partner_id).maybeSingle();
              if (bal) {
                await svc.from('partner_balances').update({ pending_btc: (bal as any).pending_btc + commission, updated_at: new Date().toISOString() }).eq('id', (bal as any).id);
              } else {
                await svc.from('partner_balances').insert({ partner_id: (apiKeyRow as any).partner_id, pending_btc: commission } as any);
              }
            }
          } catch (e) {
            console.error('Partner attribution error:', e);
          }
        }

        return jsonResponse(normalized);
      }

      case 'tx-status': {
        const id = params.id;
        if (!id) return badRequest('Missing id param');
        if (!isValidTxId(id)) return badRequest('Invalid transaction id format');
        const resp = await fetchWithKeyFallback(`${V2_BASE}/exchange/by-id?id=${id}`);
        const parsed = await parseJsonResponse(resp);
        if (!parsed.isJson) return jsonResponse({ error: 'Service unavailable.' }, 502);
        if (!resp.ok) return jsonResponse({ error: parsed.data?.message || 'Transaction not found.' }, resp.status);
        return jsonResponse(parsed.data);
      }

      case 'list-transactions': {
        const limit = params.limit || '100';
        const offset = params.offset || '0';
        const dateFrom = params.dateFrom || '';
        const dateTo = params.dateTo || '';
        const status = params.status || '';
        let txUrl = `${V2_BASE}/exchanges?limit=${limit}&offset=${offset}`;
        if (dateFrom) txUrl += `&dateFrom=${dateFrom}`;
        if (dateTo) txUrl += `&dateTo=${dateTo}`;
        if (status) txUrl += `&status=${status}`;
        const resp = await fetchWithKeyFallback(txUrl);
        const parsed = await parseJsonResponse(resp);
        if (!parsed.isJson) return jsonResponse({ error: 'Service unavailable.' }, 502);
        if (!resp.ok) return jsonResponse({ error: parsed.data?.message || 'List unavailable.' }, resp.status);
        return jsonResponse(parsed.data);
      }

      case 'fixed-address': {
        if (!postBody) return badRequest('POST body required');
        const { from, to, address } = postBody as Record<string, string>;
        if (!from || !to || !address) return badRequest('Missing from/to/address');
        if (!isValidTicker(from) || !isValidTicker(to)) return badRequest('Invalid ticker');
        const f = splitNetwork(from), t = splitNetwork(to);
        const response = await fetchWithKeyFallback(`${V2_BASE}/exchange/by-fixed-rate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromCurrency: f.ticker, toCurrency: t.ticker,
            fromNetwork: f.network, toNetwork: t.network,
            address, flow: 'fixed-rate',
          }),
        });
        const parsed = await parseJsonResponse(response);
        if (!parsed.isJson) return jsonResponse({ error: 'Service unavailable.' }, 502);
        if (!response.ok) return jsonResponse({ error: parsed.data?.message || 'Service error.' }, response.status);
        return jsonResponse(parsed.data);
      }

      default:
        return badRequest(`Invalid action: ${action}`);
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('ChangeNow API error:', msg);
    notifyTelegram('error', `🚨 [MRC GlobalPay] API Error\n${msg}`);
    return jsonResponse({ error: msg }, 500);
  }
});
