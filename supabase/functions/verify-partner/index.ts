import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { token } = await req.json()
    if (!token || typeof token !== 'string') {
      return new Response(JSON.stringify({ error: 'missing_token' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Find partner with this token
    const { data: profile, error } = await supabase
      .from('partner_profiles')
      .select('id, verification_status, verification_token, verification_expires_at')
      .eq('verification_token', token)
      .maybeSingle()

    if (error || !profile) {
      return new Response(JSON.stringify({ error: 'invalid_token' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (profile.verification_status === 'active') {
      return new Response(JSON.stringify({ success: true, already_verified: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Check expiry
    if (new Date(profile.verification_expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'token_expired' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Activate
    const { error: updateErr } = await supabase
      .from('partner_profiles')
      .update({ verification_status: 'active', verification_token: null, verification_expires_at: null })
      .eq('id', profile.id)

    if (updateErr) throw updateErr

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
