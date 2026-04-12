const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID')
    if (!botToken || !chatId) {
      console.error('Telegram credentials not configured')
      return new Response(JSON.stringify({ error: 'Telegram not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { type, message } = await req.json() as {
      type: 'swap' | 'alert' | 'error'
      message: string
    }

    if (!message) {
      return new Response(JSON.stringify({ error: 'Missing message' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Silent for normal swaps, audible for alerts/errors
    const disableNotification = type === 'swap'

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`
    const resp = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_notification: disableNotification,
      }),
    })

    const result = await resp.json()
    if (!resp.ok) {
      console.error('Telegram API error:', JSON.stringify(result))
      return new Response(JSON.stringify({ error: 'Telegram send failed' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    console.error('telegram-notify error:', e.message)
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
