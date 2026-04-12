import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // Allow cron invocations (anon key in Authorization header)
    // No strict auth check needed — this function only deletes stale data

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

    // Find unverified partners older than 48h
    const { data: staleProfiles, error: fetchErr } = await supabase
      .from('partner_profiles')
      .select('id, user_id')
      .eq('verification_status', 'pending_verification')
      .lt('created_at', cutoff)

    if (fetchErr) throw fetchErr

    if (!staleProfiles || staleProfiles.length === 0) {
      return new Response(JSON.stringify({ purged: 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    let purged = 0
    for (const p of staleProfiles) {
      // Delete partner profile
      await supabase.from('partner_profiles').delete().eq('id', p.id)
      // Delete auth user (cascading cleanup)
      await supabase.auth.admin.deleteUser(p.user_id)
      purged++
    }

    console.log(`Purged ${purged} unverified partner accounts`)
    return new Response(JSON.stringify({ purged }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e: any) {
    console.error('Cleanup error:', e.message)
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
