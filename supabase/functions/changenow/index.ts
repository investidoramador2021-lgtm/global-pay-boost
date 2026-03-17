import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CHANGENOW_BASE = 'https://api.changenow.io/v1';

// Validation helpers
const TICKER_RE = /^[a-z0-9]{1,20}$/i;
const TX_ID_RE = /^[a-zA-Z0-9_-]{1,64}$/;

function isValidTicker(v: string): boolean {
  return TICKER_RE.test(v);
}
function isValidAmount(v: string): boolean {
  const n = Number(v);
  return isFinite(n) && n > 0;
}
function isValidTxId(v: string): boolean {
  return TX_ID_RE.test(v);
}

function badRequest(msg: string) {
  return new Response(JSON.stringify({ error: msg }), {
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

async function parseJsonResponse(response: Response) {
  const text = await response.text();
  try {
    return { isJson: true as const, data: JSON.parse(text), text };
  } catch {
    return { isJson: false as const, data: null, text };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get('CHANGENOW_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'CHANGENOW_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    let params: Record<string, string> = {};
    let postBody: Record<string, unknown> | null = null;

    const url = new URL(req.url);
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });

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
    let apiUrl: string;

    switch (action) {
      case 'currencies': {
        apiUrl = `${CHANGENOW_BASE}/currencies?active=true&fixedRate=true`;
        break;
      }
      case 'min-amount': {
        const from = params.from;
        const to = params.to;
        if (!from || !to) return badRequest('Missing from/to params');
        if (!isValidTicker(from) || !isValidTicker(to)) return badRequest('Invalid ticker format');
        const fixedMin = params.fixedRate === 'true';

        if (fixedMin) {
          const fixedResponse = await fetch(`${CHANGENOW_BASE}/min-amount-fixed/${from}_${to}?api_key=${apiKey}`);
          const fixedParsed = await parseJsonResponse(fixedResponse);

          if (fixedResponse.ok && fixedParsed.isJson) {
            return jsonResponse(fixedParsed.data);
          }

          console.error('ChangeNow fixed min-amount fallback triggered:', fixedParsed.isJson ? JSON.stringify(fixedParsed.data) : fixedParsed.text);
        }

        apiUrl = `${CHANGENOW_BASE}/min-amount/${from}_${to}?api_key=${apiKey}`;
        break;
      }
      case 'estimate': {
        const from = params.from;
        const to = params.to;
        const amount = params.amount;
        if (!from || !to || !amount) return badRequest('Missing from/to/amount params');
        if (!isValidTicker(from) || !isValidTicker(to)) return badRequest('Invalid ticker format');
        if (!isValidAmount(amount)) return badRequest('Invalid amount');
        const fixedEst = params.fixedRate === 'true';
        apiUrl = fixedEst
          ? `${CHANGENOW_BASE}/exchange-amount/fixed-rate/${amount}/${from}_${to}?api_key=${apiKey}`
          : `${CHANGENOW_BASE}/exchange-amount/${amount}/${from}_${to}?api_key=${apiKey}`;
        break;
      }
      case 'create-transaction': {
        if (!postBody) return badRequest('POST body required');
        const response = await fetch(`${CHANGENOW_BASE}/transactions/${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postBody),
        });
        const data = await response.json();
        if (!response.ok) {
          console.error('ChangeNow transaction error:', JSON.stringify(data));
          return new Response(JSON.stringify({ error: 'Exchange service error. Please try again.' }), {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      case 'tx-status': {
        const id = params.id;
        if (!id) return badRequest('Missing id param');
        if (!isValidTxId(id)) return badRequest('Invalid transaction id format');
        apiUrl = `${CHANGENOW_BASE}/transactions/${id}/${apiKey}`;
        break;
      }
      default:
        return badRequest(`Invalid action: ${action}`);
    }

    const response = await fetch(apiUrl!);
    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('ChangeNow API non-JSON response:', text);
      return new Response(JSON.stringify({ error: 'Exchange service unavailable. Please try again.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!response.ok) {
      console.error('ChangeNow API error:', JSON.stringify(data));
      return new Response(JSON.stringify({ error: 'Exchange service error. Please try again.' }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('ChangeNow API error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
