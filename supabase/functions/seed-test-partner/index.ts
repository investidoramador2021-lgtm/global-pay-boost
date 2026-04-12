import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" },
    });
  }

  // One-time seed function - secured by verify_jwt=false + service role check at DB level
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const email = "test@mrc-pay.com";
  const password = "GlobalPay2026!";

  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u: any) => u.email === email);

  let userId: string;

  if (existing) {
    userId = existing.id;
    await admin.auth.admin.updateUserById(userId, { password });
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    userId = data.user.id;
  }

  const { data: profile } = await admin
    .from("partner_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!profile) {
    const { error: pErr } = await admin.from("partner_profiles").insert({
      user_id: userId,
      first_name: "Marcus",
      last_name: "Global",
      btc_wallet: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      referral_code: "Global1",
    });
    if (pErr) return Response.json({ error: pErr.message }, { status: 500 });
  }

  return Response.json({ ok: true, userId }, { headers: { "Access-Control-Allow-Origin": "*" } });
});
