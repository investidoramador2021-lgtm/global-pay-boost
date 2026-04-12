import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const email = "adriano.maciel@mrc-pay.com";
  const password = "Olhaquecoisamaislinda2121$";

  // Check if user exists
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  let user = users?.find((u) => u.email === email);

  if (!user) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
    user = data.user;
  }

  // Assign admin role
  const { error: roleError } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: user!.id, role: "admin" }, { onConflict: "user_id,role" });

  if (roleError) return new Response(JSON.stringify({ error: roleError.message }), { status: 400, headers: corsHeaders });

  return new Response(JSON.stringify({ ok: true, user_id: user!.id }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
