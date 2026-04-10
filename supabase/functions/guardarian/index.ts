import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const GUARDARIAN_BASE = 'https://api-payments.guardarian.com/v1';

function badRequest(msg: string) {
  return new Response(JSON.stringify({ error: msg, fallback: false }), {
    status: 400,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function containedError(error: string, fallback = true, extra: Record<string, unknown> = {}) {
  return jsonResponse({ error, fallback, ...extra }, fallback ? 200 : 400);
}

let currencyCache: { data: unknown; ts: number } | null = null;
const CACHE_TTL = 60_000;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get('GUARDARIAN_API_KEY');
  if (!apiKey) {
    return containedError('Provider is not configured', true, { crypto_currencies: [], fiat_currencies: [] });
  }

  try {
    const body = await req.json();
    const action = body.action;

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'x-api-key': apiKey,
    };

    switch (action) {
      case 'partner-token':
        return jsonResponse({ token: apiKey, fallback: false });

      case 'currencies': {
        if (currencyCache && Date.now() - currencyCache.ts < CACHE_TTL) {
          return jsonResponse(currencyCache.data);
        }

        const resp = await fetch(`${GUARDARIAN_BASE}/currencies`, { headers });
        if (!resp.ok) {
          const text = await resp.text();
          console.error('Guardarian currencies error:', text);
          return containedError('Failed to fetch currencies', true, { crypto_currencies: [], fiat_currencies: [] });
        }

        const data = await resp.json();
        currencyCache = { data, ts: Date.now() };
        return jsonResponse(data);
      }

      case 'payment-methods': {
        const { currency, currency_type } = body;
        if (!currency) return badRequest('Missing currency');

        const params = new URLSearchParams();
        params.set('currency', currency);
        if (currency_type) params.set('currency_type', currency_type);

        const resp = await fetch(`${GUARDARIAN_BASE}/payment-methods?${params.toString()}`, { headers });
        if (!resp.ok) {
          const text = await resp.text();
          console.error('Guardarian payment-methods error:', text);
          return containedError('Payment methods unavailable', true, { payment_methods: [] });
        }

        return jsonResponse(await resp.json());
      }

      case 'estimate': {
        const { from_currency, from_network, to_currency, to_network, from_amount, to_amount } = body;
        if (!from_currency || !to_currency) return badRequest('Missing from_currency/to_currency');
        if (!from_amount && !to_amount) return badRequest('Missing from_amount or to_amount');

        const params = new URLSearchParams();
        params.set('from_currency', from_currency);
        params.set('to_currency', to_currency);
        if (from_network) params.set('from_network', from_network);
        if (to_network) params.set('to_network', to_network);
        if (from_amount) params.set('from_amount', String(from_amount));
        if (to_amount) {
          params.set('to_amount', String(to_amount));
          params.set('type', 'reverse');
        }

        const resp = await fetch(`${GUARDARIAN_BASE}/estimate?${params.toString()}`, { headers });
        if (!resp.ok) {
          const text = await resp.text();
          console.error('Guardarian estimate error:', text);
          return containedError('Estimate unavailable', true, { value: null });
        }

        return jsonResponse(await resp.json());
      }

      case 'min-max': {
        const { from_currency, to_currency, from_network, to_network } = body;
        if (!from_currency || !to_currency) return badRequest('Missing from_currency/to_currency');

        let pair = `${from_currency.toLowerCase()}`;
        if (from_network && from_network.toLowerCase() !== from_currency.toLowerCase()) {
          pair += `-${from_network.toLowerCase()}`;
        }
        pair += `_${to_currency.toLowerCase()}`;
        if (to_network && to_network.toLowerCase() !== to_currency.toLowerCase()) {
          pair += `-${to_network.toLowerCase()}`;
        }

        const resp = await fetch(`${GUARDARIAN_BASE}/market-info/min-max-range/${pair}`, { headers });
        if (!resp.ok) {
          const text = await resp.text();
          console.error('Guardarian min-max error:', text);
          return containedError('Min/max unavailable', true, { min: 0, max: 999999 });
        }

        return jsonResponse(await resp.json());
      }

      case 'create-transaction': {
        const { from_amount, from_currency, to_currency, from_network, to_network, payout_address, email, deposit_address, payment_method } = body;
        if (!from_currency || !to_currency || !payout_address) {
          return badRequest('Missing required transaction fields');
        }

        const txBody: Record<string, unknown> = {
          from_amount,
          from_currency,
          to_currency,
          payout_address,
          skip_choose_payout_address: true,
          skip_choose_payment_category: false,
          redirects: {
            successful: 'https://mrcglobalpay.com/?status=success',
            cancelled: 'https://mrcglobalpay.com/?status=cancelled',
            failed: 'https://mrcglobalpay.com/?status=failed',
          },
        };

        if (from_network) txBody.from_network = from_network;
        if (to_network) txBody.to_network = to_network;
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
          return containedError(data?.message || 'Transaction creation failed', resp.status >= 500, { details: data });
        }

        return jsonResponse(data);
      }

      case 'create-sell-transaction': {
        const { from_amount, from_currency, to_currency, from_network, to_network, deposit_address, payout_address, email, payment_method } = body;
        if (!from_currency || !to_currency) {
          return badRequest('Missing required sell transaction fields');
        }

        const txBody: Record<string, unknown> = {
          from_amount,
          from_currency,
          to_currency,
          skip_choose_payout_address: !!payout_address,
          skip_choose_payment_category: false,
          redirects: {
            successful: 'https://mrcglobalpay.com/?status=success',
            cancelled: 'https://mrcglobalpay.com/?status=cancelled',
            failed: 'https://mrcglobalpay.com/?status=failed',
          },
        };

        if (from_network) txBody.from_network = from_network;
        if (to_network) txBody.to_network = to_network;
        if (payout_address) txBody.payout_address = payout_address;
        if (deposit_address) txBody.deposit_address = deposit_address;
        if (email) txBody.email = email;
        if (payment_method) txBody.payment_method = payment_method;

        // Use the sell endpoint
        const resp = await fetch(`${GUARDARIAN_BASE}/transaction/sell`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(txBody),
        });

        const text = await resp.text();
        const data = text ? JSON.parse(text) : null;
        if (!resp.ok) {
          console.error('Guardarian create-sell-transaction error:', text);
          return containedError(data?.message || 'Sell transaction creation failed', resp.status >= 500, { details: data });
        }

        return jsonResponse(data);
      }

      default:
        return badRequest(`Invalid action: ${action}`);
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Guardarian edge function error:', msg);
    return containedError(msg, true);
  }
});
