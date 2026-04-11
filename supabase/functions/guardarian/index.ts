import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const GUARDARIAN_BASE = 'https://api-payments.guardarian.com/v1';
const SUCCESS_URL = 'https://mrcglobalpay.com/success';
const CANCEL_URL = 'https://mrcglobalpay.com/?status=cancelled';
const FAILED_URL = 'https://mrcglobalpay.com/?status=failed';
const CACHE_TTL = 60_000;

let currencyCache: { data: unknown; ts: number } | null = null;

function getCorsHeaders(origin?: string | null) {
  const allowOrigin = origin && (
    origin === 'https://mrcglobalpay.com' ||
    origin === 'https://global-pay-boost.lovable.app' ||
    origin.endsWith('.lovable.app')
  )
    ? origin
    : '*';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
}

function badRequest(msg: string, origin?: string | null) {
  return new Response(JSON.stringify({ error: msg, fallback: false }), {
    status: 400,
    headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
  });
}

function jsonResponse(data: unknown, status = 200, origin?: string | null) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
  });
}

function containedError(error: string, fallback = true, extra: Record<string, unknown> = {}, origin?: string | null) {
  return jsonResponse({ error, fallback, ...extra }, fallback ? 200 : 400, origin);
}

function normalizePaymentMethodsFromCurrency(currency: any) {
  const methods: any[] = [];
  const seen = new Set<string>();

  const addMethod = (pm: any) => {
    const type = String(pm?.type || pm?.payment_method || '').trim();
    if (!type || seen.has(type)) return;
    seen.add(type);
    methods.push({
      type,
      payment_method: pm?.payment_method,
      payment_category: pm?.payment_category || currency?.currency_type || 'FIAT',
      deposit_enabled: Boolean(pm?.deposit_enabled),
      withdrawal_enabled: Boolean(pm?.withdrawal_enabled),
    });
  };

  for (const pm of currency?.payment_methods || []) addMethod(pm);
  for (const network of currency?.networks || []) {
    for (const pm of network?.payment_methods || []) addMethod(pm);
  }

  return methods;
}

async function fetchGuardarianJson(
  path: string,
  headers: Record<string, string>,
  options?: { retryWithoutForwardedFor?: boolean; attempts?: number; retryDelayMs?: number },
) {
  const run = async (requestHeaders: Record<string, string>) => {
    const resp = await fetch(`${GUARDARIAN_BASE}${path}`, { headers: requestHeaders });
    const text = await resp.text();
    const data = text ? JSON.parse(text) : null;
    return { resp, text, data };
  };

  const attempts = Math.max(1, options?.attempts ?? 1);
  const retryDelayMs = Math.max(0, options?.retryDelayMs ?? 250);
  let requestHeaders = { ...headers };
  let lastResult: Awaited<ReturnType<typeof run>> | null = null;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const result = await run(requestHeaders);
    lastResult = result;

    if (result.resp.ok) {
      return result;
    }

    const canRetryWithoutForwardedFor =
      options?.retryWithoutForwardedFor &&
      Boolean(requestHeaders['x-forwarded-for']);

    if (canRetryWithoutForwardedFor) {
      delete requestHeaders['x-forwarded-for'];
    }

    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs * attempt));
    }
  }

  return lastResult!;
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(origin) });
  }

  const apiKey = Deno.env.get('GUARDARIAN_API_KEY');
  if (!apiKey) {
    return containedError('Provider is not configured', true, { crypto_currencies: [], fiat_currencies: [] }, origin);
  }

  try {
    const body = await req.json();
    const action = body.action;

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'x-api-key': apiKey,
    };

    const forwardedFor = req.headers.get('x-forwarded-for');
    if (forwardedFor) headers['x-forwarded-for'] = forwardedFor;

    switch (action) {
      case 'partner-token':
        return badRequest('This endpoint has been disabled for security reasons', origin);

      case 'currencies': {
        if (currencyCache && Date.now() - currencyCache.ts < CACHE_TTL) {
          return jsonResponse(currencyCache.data, 200, origin);
        }

        const { resp, text, data } = await fetchGuardarianJson('/currencies', headers);
        if (!resp.ok) {
          console.error('Guardarian currencies error:', text);
          return containedError('Failed to fetch currencies', true, { crypto_currencies: [], fiat_currencies: [] }, origin);
        }

        currencyCache = { data, ts: Date.now() };
        return jsonResponse(data, 200, origin);
      }

      case 'payment-methods': {
        const currency = String(body.currency || '').trim().toUpperCase();
        const currencyType = String(body.currency_type || 'FIAT').trim().toUpperCase();
        if (!currency) return badRequest('Missing currency', origin);

        const endpoint = currencyType === 'CRYPTO' ? '/currencies/crypto' : '/currencies/fiat';
        const { resp, text, data } = await fetchGuardarianJson(endpoint, headers, { retryWithoutForwardedFor: true });
        if (!resp.ok) {
          console.error('Guardarian payment-methods source error:', text);
          return containedError('Payment methods unavailable', true, { payment_methods: [] }, origin);
        }

        const items = Array.isArray(data) ? data : [];
        const matchedCurrency = items.find((item) => String(item?.ticker || '').toUpperCase() === currency);
        const paymentMethods = matchedCurrency ? normalizePaymentMethodsFromCurrency(matchedCurrency) : [];

        return jsonResponse({ payment_methods: paymentMethods, fallback: false }, 200, origin);
      }

      case 'estimate': {
        const { from_currency, from_network, to_currency, to_network, from_amount, to_amount, payment_method } = body;
        if (!from_currency || !to_currency) return badRequest('Missing from_currency/to_currency', origin);
        if (!from_amount && !to_amount) return badRequest('Missing from_amount or to_amount', origin);

        const params = new URLSearchParams();
        params.set('from_currency', String(from_currency));
        params.set('to_currency', String(to_currency));
        if (from_network) params.set('from_network', String(from_network));
        if (to_network) params.set('to_network', String(to_network));
        if (payment_method) params.set('payment_method', String(payment_method));
        if (from_amount) params.set('from_amount', String(from_amount));
        if (to_amount) {
          params.set('to_amount', String(to_amount));
          params.set('type', 'reverse');
        }

        const { resp, text, data } = await fetchGuardarianJson(`/estimate?${params.toString()}`, headers, {
          retryWithoutForwardedFor: true,
          attempts: 3,
          retryDelayMs: 300,
        });
        if (!resp.ok) {
          console.error('Guardarian estimate error:', text);
          return containedError('Estimate unavailable', true, { value: null, details: data }, origin);
        }

        return jsonResponse(data, 200, origin);
      }

      case 'min-max': {
        const { from_currency, to_currency, from_network, to_network } = body;
        if (!from_currency || !to_currency) return badRequest('Missing from_currency/to_currency', origin);

        let pair = `${String(from_currency).toLowerCase()}`;
        if (from_network && String(from_network).toLowerCase() !== String(from_currency).toLowerCase()) {
          pair += `-${String(from_network).toLowerCase()}`;
        }
        pair += `_${String(to_currency).toLowerCase()}`;
        if (to_network && String(to_network).toLowerCase() !== String(to_currency).toLowerCase()) {
          pair += `-${String(to_network).toLowerCase()}`;
        }

        const { resp, text, data } = await fetchGuardarianJson(`/market-info/min-max-range/${pair}`, headers, { retryWithoutForwardedFor: true });
        if (!resp.ok) {
          console.error('Guardarian min-max error:', text);
          return containedError('Min/max unavailable', true, { min: 0, max: 999999 }, origin);
        }

        return jsonResponse(data, 200, origin);
      }

      case 'create-transaction': {
        const { from_amount, from_currency, to_currency, from_network, to_network, payout_address, bank_details, deposit_address, email, payment_method, trade_direction } = body;
        if (!from_currency || !to_currency) {
          return badRequest('Missing required transaction fields', origin);
        }

        const isSell = trade_direction === 'sell';

        // Lead capture — save to customers table using service_role
        if (email) {
          try {
            const sbUrl = Deno.env.get('SUPABASE_URL')!;
            const sbKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
            const sb = createClient(sbUrl, sbKey);
            await sb.rpc('upsert_customer_capture', {
              p_email: String(email).trim().toLowerCase(),
              p_latest_trade_direction: isSell ? 'sell' : 'buy',
              p_latest_from_currency: from_currency ? String(from_currency) : null,
              p_latest_to_currency: to_currency ? String(to_currency) : null,
              p_latest_payment_method: payment_method ? String(payment_method) : null,
              p_metadata: {
                wallet_address: payout_address ? String(payout_address).trim() : undefined,
                bank_details: bank_details ? JSON.stringify(bank_details) : undefined,
                amount: from_amount != null ? String(from_amount) : undefined,
                timestamp: new Date().toISOString(),
              },
            });
          } catch (captureErr) {
            console.error('[MRC] Customer capture failed in edge fn:', captureErr);
          }
        }

        const txBody: Record<string, unknown> = {
          from_amount: typeof from_amount === 'string' ? parseFloat(from_amount) : Number(from_amount),
          from_currency: String(from_currency).toUpperCase(),
          to_currency: String(to_currency).toUpperCase(),
          payout_currency: String(to_currency).toUpperCase(),
          deposit_currency: String(from_currency).toUpperCase(),
          skip_choose_payout_address: !!(payout_address || (bank_details && Object.keys(bank_details).length > 0)),
          skip_choose_payment_category: false,
          redirects: {
            successful: SUCCESS_URL,
            cancelled: CANCEL_URL,
            failed: FAILED_URL,
          },
        };

        if (from_network) txBody.from_network = from_network;
        if (to_network) txBody.to_network = to_network;
        if (payout_address) txBody.payout_address = payout_address;
        if (bank_details && typeof bank_details === 'object' && Object.keys(bank_details).length > 0) {
          txBody.bank_details = bank_details;
        }
        if (deposit_address) txBody.deposit_address = deposit_address;
        if (email) txBody.email = email;
        if (payment_method) txBody.payment_method = payment_method;

        const resp = await fetch(`${GUARDARIAN_BASE}/transaction`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(txBody),
        });

        const text = await resp.text();
        const data = text ? JSON.parse(text) : null;
        if (!resp.ok) {
          console.error('Guardarian create-transaction error:', text);
          return containedError(data?.message || 'Transaction creation failed', resp.status >= 500, { details: data }, origin);
        }

        if (data && !data.checkout_url && data.redirect_url) data.checkout_url = data.redirect_url;
        return jsonResponse(data, 200, origin);
      }

      // 'create-sell-transaction' is now handled by 'create-transaction' — both use POST /v1/transaction
      case 'create-sell-transaction':

      default:
        return badRequest(`Invalid action: ${action}`, origin);
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Guardarian edge function error:', msg);
    return containedError(msg, true, {}, origin);
  }
});