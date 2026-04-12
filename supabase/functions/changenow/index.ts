import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const CHANGENOW_BASE = 'https://api.changenow.io/v1';

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
  const privateKey = Deno.env.get('CHANGENOW_PRIVATE_KEY') || apiKey;
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

        if (fixedEst) {
          const fixedUrl = `${CHANGENOW_BASE}/exchange-amount/fixed-rate/${amount}/${from}_${to}?api_key=${apiKey}`;
          const fixedResp = await fetch(fixedUrl);
          const fixedParsed = await parseJsonResponse(fixedResp);

          if (fixedResp.ok && fixedParsed.isJson) {
            return jsonResponse(fixedParsed.data);
          }

          // Fixed rate out_of_range or unavailable — fall back to standard rate
          console.error('ChangeNow fixed estimate fallback triggered:', fixedParsed.isJson ? JSON.stringify(fixedParsed.data) : fixedParsed.text);
        }

        // Standard (expected) rate — no upper limit
        apiUrl = `${CHANGENOW_BASE}/exchange-amount/${amount}/${from}_${to}?api_key=${apiKey}`;
        break;
      }
      case 'create-transaction': {
        if (!postBody) return badRequest('POST body required');
        const response = await fetch(`${CHANGENOW_BASE}/transactions/${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postBody),
        });
        const parsed = await parseJsonResponse(response);
        if (!parsed.isJson) {
          console.error('ChangeNow transaction non-JSON response:', parsed.text);
          return jsonResponse({ error: 'Exchange service unavailable. Please try again.' }, 502);
        }
        if (!response.ok) {
          console.error('ChangeNow transaction error:', JSON.stringify(parsed.data));
          return jsonResponse({ error: 'Exchange service error. Please try again.' }, response.status);
        }
        // Notify Telegram
        const txData = parsed.data;
        const amount = postBody?.amount || txData?.amount || '?';
        const fromC = (postBody?.from as string || txData?.fromCurrency || '?').toUpperCase();
        const toC = (postBody?.to as string || txData?.toCurrency || '?').toUpperCase();
        const amountNum = Number(amount);
        const isHighValue = amountNum >= 10000;
        const telegramMsg = `[MRC GlobalPay] ✅ New Swap: ${amount} ${fromC} ➔ ${toC}\nStatus: ChangeNOW Forensic Verified\nID: ${txData?.id || 'N/A'}`;
        notifyTelegram(isHighValue ? 'alert' : 'swap', isHighValue
          ? `🚨 HIGH VALUE\n${telegramMsg}`
          : telegramMsg
        );

        return jsonResponse(parsed.data);
      }
      case 'tx-status': {
        const id = params.id;
        if (!id) return badRequest('Missing id param');
        if (!isValidTxId(id)) return badRequest('Invalid transaction id format');
        apiUrl = `${CHANGENOW_BASE}/transactions/${id}/${apiKey}`;
        break;
      }
      case 'list-transactions': {
        const limit = params.limit || '100';
        const offset = params.offset || '0';
        const dateFrom = params.dateFrom || '';
        const dateTo = params.dateTo || '';
        const status = params.status || '';
        const from = params.from || '';
        const to = params.to || '';

        let txUrl = `https://api.changenow.io/v2/exchanges?limit=${limit}&offset=${offset}`;
        if (dateFrom) txUrl += `&dateFrom=${dateFrom}`;
        if (dateTo) txUrl += `&dateTo=${dateTo}`;
        if (status) txUrl += `&status=${status}`;
        if (from) txUrl += `&fromCurrency=${from}`;
        if (to) txUrl += `&toCurrency=${to}`;

        // Try both keys with v2 header-based auth
        const keysToTry = [privateKey!, apiKey!].filter((k, i, a) => a.indexOf(k) === i);
        let txResp: Response | null = null;
        let txParsed: { isJson: boolean; data: any; text: string } | null = null;

        for (const key of keysToTry) {
          txResp = await fetch(txUrl, {
            headers: { 'x-changenow-api-key': key },
          });
          txParsed = await parseJsonResponse(txResp);
          if (txResp.ok) break;
          console.error(`ChangeNow v2 list-txs key attempt failed:`, txParsed?.isJson ? JSON.stringify(txParsed.data) : txParsed?.text);
        }

        // Fallback to v1
        if (!txResp?.ok) {
          for (const key of keysToTry) {
            let v1Url = `${CHANGENOW_BASE}/transactions/${key}?limit=${limit}&offset=${offset}`;
            if (dateFrom) v1Url += `&dateFrom=${dateFrom}`;
            if (dateTo) v1Url += `&dateTo=${dateTo}`;
            if (status) v1Url += `&status=${status}`;
            txResp = await fetch(v1Url);
            txParsed = await parseJsonResponse(txResp!);
            if (txResp.ok) break;
            console.error(`ChangeNow v1 list-txs key attempt failed:`, txParsed?.isJson ? JSON.stringify(txParsed.data) : txParsed?.text);
          }
        }

        if (!txParsed?.isJson) {
          return jsonResponse({ error: 'Service unavailable.' }, 502);
        }
        if (!txResp?.ok) {
          return jsonResponse({ error: txParsed.data?.message || 'Private API key required. Check your ChangeNOW affiliate dashboard for the correct key.' }, txResp?.status || 401);
        }
        return jsonResponse(txParsed.data);
      }
      case 'fixed-address': {
        if (!postBody) return badRequest('POST body required');
        const { from, to, address } = postBody as Record<string, string>;
        if (!from || !to || !address) return badRequest('Missing from/to/address');
        if (!isValidTicker(from as string) || !isValidTicker(to as string)) return badRequest('Invalid ticker');
        const response = await fetch(`${CHANGENOW_BASE}/transactions/fixed-rate/${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from, to, address }),
        });
        const parsed = await parseJsonResponse(response);
        if (!parsed.isJson) {
          console.error('ChangeNow fixed-address non-JSON:', parsed.text);
          return jsonResponse({ error: 'Service unavailable.' }, 502);
        }
        if (!response.ok) {
          console.error('ChangeNow fixed-address error:', JSON.stringify(parsed.data));
          return jsonResponse({ error: parsed.data?.message || 'Service error.' }, response.status);
        }
        return jsonResponse(parsed.data);
      }
      default:
        return badRequest(`Invalid action: ${action}`);
    }

    const response = await fetch(apiUrl!);
    const parsed = await parseJsonResponse(response);
    const softFallback = action === 'estimate'
      ? { estimatedAmount: null, transactionSpeedForecast: null, warningMessage: 'Rate unavailable right now.' }
      : action === 'min-amount'
        ? { minAmount: 0, warningMessage: 'Minimum amount unavailable right now.' }
        : null;

    if (!parsed.isJson) {
      console.error('ChangeNow API non-JSON response:', parsed.text);
      if (softFallback) return jsonResponse(softFallback);
      return jsonResponse({ error: 'Exchange service unavailable. Please try again.' }, 502);
    }

    if (!response.ok) {
      console.error('ChangeNow API error:', JSON.stringify(parsed.data));
      if (softFallback) return jsonResponse(softFallback);
      return jsonResponse({ error: 'Exchange service error. Please try again.' }, response.status);
    }

    return jsonResponse(parsed.data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('ChangeNow API error:', msg);
    notifyTelegram('error', `🚨 [MRC GlobalPay] API Error\n${msg}`);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
