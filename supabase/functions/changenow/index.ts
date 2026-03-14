import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CHANGENOW_BASE = 'https://api.changenow.io/v1';

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
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    let apiUrl: string;

    switch (action) {
      case 'currencies': {
        apiUrl = `${CHANGENOW_BASE}/currencies?active=true&fixedRate=true`;
        break;
      }
      case 'min-amount': {
        const from = url.searchParams.get('from');
        const to = url.searchParams.get('to');
        if (!from || !to) {
          return new Response(JSON.stringify({ error: 'Missing from/to params' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        apiUrl = `${CHANGENOW_BASE}/min-amount/${from}_${to}?api_key=${apiKey}`;
        break;
      }
      case 'estimate': {
        const from = url.searchParams.get('from');
        const to = url.searchParams.get('to');
        const amount = url.searchParams.get('amount');
        if (!from || !to || !amount) {
          return new Response(JSON.stringify({ error: 'Missing from/to/amount params' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        apiUrl = `${CHANGENOW_BASE}/exchange-amount/${amount}/${from}_${to}?api_key=${apiKey}`;
        break;
      }
      case 'create-transaction': {
        if (req.method !== 'POST') {
          return new Response(JSON.stringify({ error: 'POST required' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const body = await req.json();
        const response = await fetch(`${CHANGENOW_BASE}/transactions/${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        if (!response.ok) {
          return new Response(JSON.stringify({ error: data.message || 'Transaction creation failed', details: data }), {
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
        const id = url.searchParams.get('id');
        if (!id) {
          return new Response(JSON.stringify({ error: 'Missing id param' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        apiUrl = `${CHANGENOW_BASE}/transactions/${id}/${apiKey}`;
        break;
      }
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const response = await fetch(apiUrl!);
    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.message || 'API call failed', details: data }), {
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
