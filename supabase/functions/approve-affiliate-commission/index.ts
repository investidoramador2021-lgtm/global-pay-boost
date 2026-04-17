// Admin-only: approve or reject a pending affiliate commission row.
// On approve: marks status='approved' and credits partner_balances (available_btc + total_earned_btc).
// On reject: marks status='rejected' with optional reason. NO balance change.
// Idempotent: re-approving an already-approved row is a no-op.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is admin
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: roleRow } = await admin
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json() as {
      action: "approve" | "reject" | "approve_all";
      commission_id?: string;
      commission_ids?: string[];
      reason?: string;
    };

    // Resolve target IDs
    let ids: string[] = [];
    if (body.action === "approve_all") {
      const { data: pendings } = await admin
        .from("partner_commissions").select("id").eq("status", "pending_review");
      ids = (pendings ?? []).map((r: any) => r.id);
    } else if (body.commission_ids?.length) {
      ids = body.commission_ids;
    } else if (body.commission_id) {
      ids = [body.commission_id];
    } else {
      return new Response(JSON.stringify({ error: "Missing commission_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (ids.length === 0) {
      return new Response(JSON.stringify({ ok: true, processed: 0, message: "nothing to do" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // REJECT path
    if (body.action === "reject") {
      const { error } = await admin.from("partner_commissions").update({
        status: "rejected",
        rejected_at: new Date().toISOString(),
        rejection_reason: body.reason ?? "",
        approved_by: user.id,
      }).in("id", ids).eq("status", "pending_review");
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, processed: ids.length, action: "reject" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // APPROVE path: load pending rows, credit balances, mark approved
    const { data: rows, error: rowsErr } = await admin
      .from("partner_commissions")
      .select("id, partner_id, commission_btc, status")
      .in("id", ids)
      .eq("status", "pending_review");
    if (rowsErr) throw rowsErr;

    if (!rows || rows.length === 0) {
      return new Response(JSON.stringify({ ok: true, processed: 0, message: "no pending rows in selection" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Aggregate per-partner deltas
    const deltas = new Map<string, number>();
    for (const r of rows) {
      deltas.set(r.partner_id, (deltas.get(r.partner_id) ?? 0) + Number(r.commission_btc));
    }

    // Apply balance updates
    for (const [partnerId, delta] of deltas) {
      const { data: bal } = await admin
        .from("partner_balances")
        .select("id, available_btc, total_earned_btc")
        .eq("partner_id", partnerId).maybeSingle();
      if (bal) {
        await admin.from("partner_balances").update({
          available_btc: Number(bal.available_btc) + delta,
          total_earned_btc: Number(bal.total_earned_btc) + delta,
          last_credited_at: new Date().toISOString(),
        }).eq("id", bal.id);
      } else {
        await admin.from("partner_balances").insert({
          partner_id: partnerId,
          available_btc: delta,
          pending_btc: 0,
          total_earned_btc: delta,
          last_credited_at: new Date().toISOString(),
        });
      }
    }

    // Mark rows approved
    const approvedIds = rows.map((r: any) => r.id);
    const { error: updErr } = await admin.from("partner_commissions").update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: user.id,
    }).in("id", approvedIds);
    if (updErr) throw updErr;

    const totalBtc = rows.reduce((s: number, r: any) => s + Number(r.commission_btc), 0);

    return new Response(JSON.stringify({
      ok: true, processed: rows.length, partners_credited: deltas.size, total_btc: totalBtc, action: "approve",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("[approve-affiliate-commission]", e);
    return new Response(JSON.stringify({ error: e.message ?? String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
