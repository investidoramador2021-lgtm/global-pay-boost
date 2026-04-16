import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function hashSecret(secret: string): Promise<string> {
  const enc = new TextEncoder().encode(secret);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function generateApiSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return "sk_live_" + Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    // Verify TOTP is set up
    const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: totp } = await svc.from("partner_totp_secrets").select("is_verified").eq("user_id", user.id).maybeSingle();
    if (!totp?.is_verified) {
      return new Response(JSON.stringify({ error: "2FA required" }), { status: 403, headers: corsHeaders });
    }

    // Get partner profile
    const { data: profile } = await supabase.from("partner_profiles").select("id").eq("user_id", user.id).maybeSingle();
    if (!profile) return new Response(JSON.stringify({ error: "Partner profile not found" }), { status: 404, headers: corsHeaders });

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "generate" && req.method === "POST") {
      // Limit to 5 active keys
      const { count } = await supabase.from("partner_api_keys").select("id", { count: "exact", head: true }).eq("partner_id", profile.id).eq("is_active", true);
      if ((count || 0) >= 5) {
        return new Response(JSON.stringify({ error: "Maximum 5 active API keys allowed" }), { status: 400, headers: corsHeaders });
      }

      const apiSecret = generateApiSecret();
      const secretHash = await hashSecret(apiSecret);

      const { data: newKey, error: insertErr } = await supabase.from("partner_api_keys").insert({
        partner_id: profile.id,
        api_secret_hash: secretHash,
      }).select("key_id, created_at").single();

      if (insertErr) throw insertErr;

      // Return secret ONE TIME ONLY
      return new Response(JSON.stringify({
        key_id: newKey.key_id,
        api_secret: apiSecret,
        created_at: newKey.created_at,
        warning: "Store this secret securely. It will not be shown again.",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "list" && req.method === "GET") {
      const { data: keys } = await supabase
        .from("partner_api_keys")
        .select("id, key_id, webhook_url, ip_whitelist, is_active, last_used_at, created_at")
        .eq("partner_id", profile.id)
        .order("created_at", { ascending: false });

      return new Response(JSON.stringify({ keys: keys || [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "update" && req.method === "POST") {
      const { key_id, webhook_url, ip_whitelist } = await req.json();
      if (!key_id) return new Response(JSON.stringify({ error: "key_id required" }), { status: 400, headers: corsHeaders });

      const updateData: Record<string, unknown> = {};
      if (typeof webhook_url === "string") updateData.webhook_url = webhook_url;
      if (Array.isArray(ip_whitelist)) updateData.ip_whitelist = ip_whitelist;

      const { error: updateErr } = await supabase
        .from("partner_api_keys")
        .update(updateData)
        .eq("key_id", key_id)
        .eq("partner_id", profile.id);

      if (updateErr) throw updateErr;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "revoke" && req.method === "POST") {
      const { key_id } = await req.json();
      if (!key_id) return new Response(JSON.stringify({ error: "key_id required" }), { status: 400, headers: corsHeaders });

      const { error: revokeErr } = await supabase
        .from("partner_api_keys")
        .update({ is_active: false })
        .eq("key_id", key_id)
        .eq("partner_id", profile.id);

      if (revokeErr) throw revokeErr;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: corsHeaders });
  }
});
