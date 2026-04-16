import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller is an admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const svc = createClient(supabaseUrl, serviceKey);

    const { data: roleCheck } = await svc.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!roleCheck) return json({ error: "Forbidden" }, 403);

    const body = await req.json();
    const { action } = body;

    if (action === "notify-partner") {
      const { hold_id, partner_id } = body;
      if (!hold_id || !partner_id) return json({ error: "hold_id and partner_id required" }, 400);

      // Get partner email from auth
      const { data: partner } = await svc
        .from("partner_profiles")
        .select("user_id, first_name, last_name")
        .eq("id", partner_id)
        .maybeSingle();

      if (!partner) return json({ error: "Partner not found" }, 404);

      // Get user email
      const { data: { user: partnerUser } } = await svc.auth.admin.getUserById(partner.user_id);
      if (!partnerUser?.email) return json({ error: "Partner email not found" }, 404);

      // Get hold details
      const { data: hold } = await svc
        .from("compliance_holds")
        .select("*")
        .eq("id", hold_id)
        .maybeSingle();

      if (!hold) return json({ error: "Hold not found" }, 404);

      // Send Telegram notification
      const telegramToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
      const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
      if (telegramToken && chatId) {
        const msg = `🛡️ *Compliance Notification Sent*\n\nPartner: ${partner.first_name} ${partner.last_name}\nEmail: ${partnerUser.email}\nHold Type: ${(hold as any).hold_type?.toUpperCase()}\nCase ID: ${(hold as any).provider_case_id || "N/A"}\nStatus: Action Required`;
        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: "Markdown" }),
        });
      }

      // Update hold with notification timestamp
      await svc
        .from("compliance_holds")
        .update({ partner_notified_at: new Date().toISOString() } as any)
        .eq("id", hold_id);

      // Update partner transaction status to action_required
      if ((hold as any).partner_transaction_id) {
        await svc
          .from("partner_transactions")
          .update({ status: "action_required" } as any)
          .eq("id", (hold as any).partner_transaction_id);
      }

      return json({
        success: true,
        notified_email: partnerUser.email,
        partner_name: `${partner.first_name} ${partner.last_name}`,
      });
    }

    if (action === "generate-upload-link") {
      const { hold_id } = body;
      if (!hold_id) return json({ error: "hold_id required" }, 400);

      // Refresh the upload token
      const newToken = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

      await svc
        .from("compliance_holds")
        .update({
          upload_token: newToken,
          upload_token_expires_at: expiresAt,
        } as any)
        .eq("id", hold_id);

      const uploadUrl = `https://mrcglobalpay.com/compliance-upload?token=${newToken}`;

      return json({ success: true, upload_url: uploadUrl, expires_at: expiresAt, token: newToken });
    }

    if (action === "resolve-hold") {
      const { hold_id, resolution_notes } = body;
      if (!hold_id) return json({ error: "hold_id required" }, 400);

      await svc
        .from("compliance_holds")
        .update({
          status: "resolved",
          admin_notes: resolution_notes || "",
          resolved_at: new Date().toISOString(),
        } as any)
        .eq("id", hold_id);

      // Get hold to update the linked transaction
      const { data: hold } = await svc
        .from("compliance_holds")
        .select("partner_transaction_id")
        .eq("id", hold_id)
        .maybeSingle();

      if (hold && (hold as any).partner_transaction_id) {
        await svc
          .from("partner_transactions")
          .update({ status: "success" } as any)
          .eq("id", (hold as any).partner_transaction_id);
      }

      return json({ success: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
});
