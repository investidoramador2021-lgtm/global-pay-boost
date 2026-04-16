import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/* ── HMAC-SHA256 signing ── */
async function hmacSign(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", enc.encode(payload), key);
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

/* ── MRC status mapping ── */
const CN_TO_MRC: Record<string, string> = {
  waiting: "waiting",
  confirming: "confirming",
  exchanging: "exchanging",
  sending: "sending",
  finished: "finished",
  failed: "failed",
  refunded: "refunded",
  expired: "expired",
};

/* ── Deliver webhook to a partner URL with retry ── */
async function deliverWebhook(
  svc: ReturnType<typeof createClient>,
  deliveryId: string,
  url: string,
  payload: Record<string, unknown>,
  apiSecretHash: string,
  attempt: number,
  maxAttempts: number,
) {
  const body = JSON.stringify(payload);
  const signature = await hmacSign(body, apiSecretHash);

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-MRC-Signature": signature,
        "X-MRC-Event": "transaction.updated",
      },
      body,
      signal: AbortSignal.timeout(10_000),
    });

    const statusCode = resp.status;
    await resp.text(); // consume body

    if (statusCode >= 200 && statusCode < 300) {
      await svc.from("webhook_deliveries").update({
        status: "delivered",
        attempts: attempt,
        last_attempt_at: new Date().toISOString(),
        response_code: statusCode,
        updated_at: new Date().toISOString(),
      } as any).eq("id", deliveryId);
      return true;
    }

    // Non-success response
    const nextRetry = attempt < maxAttempts
      ? new Date(Date.now() + attempt * 5 * 60 * 1000).toISOString() // 5m, 10m, 15m
      : null;

    await svc.from("webhook_deliveries").update({
      status: attempt >= maxAttempts ? "failed" : "pending",
      attempts: attempt,
      last_attempt_at: new Date().toISOString(),
      next_retry_at: nextRetry,
      response_code: statusCode,
      error_message: `HTTP ${statusCode}`,
      updated_at: new Date().toISOString(),
    } as any).eq("id", deliveryId);
    return false;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error";
    const nextRetry = attempt < maxAttempts
      ? new Date(Date.now() + attempt * 5 * 60 * 1000).toISOString()
      : null;

    await svc.from("webhook_deliveries").update({
      status: attempt >= maxAttempts ? "failed" : "pending",
      attempts: attempt,
      last_attempt_at: new Date().toISOString(),
      next_retry_at: nextRetry,
      error_message: msg,
      updated_at: new Date().toISOString(),
    } as any).eq("id", deliveryId);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const masterKey = Deno.env.get("CHANGENOW_API_KEY");
  const svc = createClient(supabaseUrl, serviceKey);

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    switch (action) {
      /* ═══════════════════════════════════════════════
       * INBOUND: ChangeNOW status callback
       * Called by ChangeNOW when order status changes
       * ═══════════════════════════════════════════════ */
      case "cn-callback": {
        if (req.method !== "POST") return json({ error: "POST required" }, 405);
        const body = await req.json();
        const cnOrderId = body.id;
        const cnStatus = body.status;

        if (!cnOrderId || !cnStatus) return json({ error: "Missing id or status" }, 400);

        // Find our internal transaction by changenow_order_id
        const { data: tx } = await svc
          .from("partner_transactions")
          .select("*")
          .eq("changenow_order_id", cnOrderId)
          .maybeSingle();

        if (!tx) return json({ ok: true, message: "No matching transaction" });

        const txAny = tx as any;
        const mrcStatus = CN_TO_MRC[cnStatus] || cnStatus;

        // Update internal status
        await svc.from("partner_transactions")
          .update({ status: mrcStatus } as any)
          .eq("id", txAny.id);

        // If finished, credit commission
        if (cnStatus === "finished" && txAny.status !== "finished" && txAny.status !== "success") {
          const { data: bal } = await svc
            .from("partner_balances")
            .select("*")
            .eq("partner_id", txAny.partner_id)
            .maybeSingle();

          if (bal) {
            const balAny = bal as any;
            await svc.from("partner_balances").update({
              available_btc: balAny.available_btc + txAny.commission_btc,
              pending_btc: Math.max(0, balAny.pending_btc - txAny.commission_btc),
              total_earned_btc: (balAny.total_earned_btc || 0) + txAny.commission_btc,
              last_credited_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as any).eq("id", balAny.id);
          }

          await svc.from("partner_transactions").update({
            is_paid: true, paid_at: new Date().toISOString(), status: "success",
          } as any).eq("id", txAny.id);
        }

        // Dispatch webhook to partner
        const { data: apiKey } = await svc
          .from("partner_api_keys")
          .select("webhook_url, api_secret_hash")
          .eq("partner_id", txAny.partner_id)
          .eq("is_active", true)
          .not("webhook_url", "is", null)
          .limit(1)
          .maybeSingle();

        if (apiKey && (apiKey as any).webhook_url) {
          const webhookPayload = {
            event: "transaction.updated",
            mrc_transaction_id: txAny.mrc_transaction_id,
            status: mrcStatus === "success" ? "finished" : mrcStatus,
            amount_out: body.amountReceive || null,
            partner_commission: txAny.commission_btc,
            asset: txAny.asset,
            volume: txAny.volume,
            timestamp: new Date().toISOString(),
          };

          // Create delivery record
          const { data: delivery } = await svc.from("webhook_deliveries").insert({
            partner_id: txAny.partner_id,
            mrc_transaction_id: txAny.mrc_transaction_id,
            webhook_url: (apiKey as any).webhook_url,
            payload: webhookPayload,
            status: "pending",
          } as any).select("id").single();

          if (delivery) {
            await deliverWebhook(
              svc,
              (delivery as any).id,
              (apiKey as any).webhook_url,
              webhookPayload,
              (apiKey as any).api_secret_hash,
              1,
              3,
            );
          }
        }

        return json({ ok: true });
      }

      /* ═══════════════════════════════════════════════
       * RETRY: Process pending webhook retries
       * Called by cron or manually
       * ═══════════════════════════════════════════════ */
      case "retry-pending": {
        const now = new Date().toISOString();
        const { data: pending } = await svc
          .from("webhook_deliveries")
          .select("*")
          .eq("status", "pending")
          .lt("next_retry_at", now)
          .lt("attempts", 3)
          .limit(20);

        if (!pending || pending.length === 0) return json({ retried: 0 });

        let retried = 0;
        for (const d of pending) {
          const dAny = d as any;
          // Get api secret hash for signing
          const { data: apiKey } = await svc
            .from("partner_api_keys")
            .select("api_secret_hash")
            .eq("partner_id", dAny.partner_id)
            .eq("is_active", true)
            .limit(1)
            .maybeSingle();

          if (apiKey) {
            await deliverWebhook(
              svc, dAny.id, dAny.webhook_url, dAny.payload,
              (apiKey as any).api_secret_hash, dAny.attempts + 1, dAny.max_attempts,
            );
            retried++;
          }
        }

        return json({ retried });
      }

      /* ═══════════════════════════════════════════════
       * TEST: Send a dummy webhook to partner's URL
       * Requires auth (partner must be logged in)
       * ═══════════════════════════════════════════════ */
      case "test-webhook": {
        if (req.method !== "POST") return json({ error: "POST required" }, 405);

        const authHeader = req.headers.get("Authorization");
        if (!authHeader) return json({ error: "Unauthorized" }, 401);

        const { data: { user } } = await svc.auth.getUser(authHeader.replace("Bearer ", ""));
        if (!user) return json({ error: "Unauthorized" }, 401);

        const { data: profile } = await svc
          .from("partner_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (!profile) return json({ error: "Partner not found" }, 404);

        const { data: apiKey } = await svc
          .from("partner_api_keys")
          .select("webhook_url, api_secret_hash, key_id")
          .eq("partner_id", (profile as any).id)
          .eq("is_active", true)
          .not("webhook_url", "is", null)
          .limit(1)
          .maybeSingle();

        if (!apiKey || !(apiKey as any).webhook_url) {
          return json({ error: "No webhook URL configured. Set one in API Keys settings." }, 400);
        }

        const testPayload = {
          event: "transaction.updated",
          mrc_transaction_id: `MRC-TEST-${crypto.randomUUID().slice(0, 8)}`,
          status: "finished",
          amount_out: 0.05,
          partner_commission: 0.0002,
          asset: "btc",
          volume: 50,
          timestamp: new Date().toISOString(),
          _test: true,
        };

        const body = JSON.stringify(testPayload);
        const signature = await hmacSign(body, (apiKey as any).api_secret_hash);

        try {
          const resp = await fetch((apiKey as any).webhook_url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-MRC-Signature": signature,
              "X-MRC-Event": "transaction.updated",
            },
            body,
            signal: AbortSignal.timeout(10_000),
          });
          const status = resp.status;
          await resp.text();

          return json({
            success: status >= 200 && status < 300,
            status_code: status,
            webhook_url: (apiKey as any).webhook_url,
          });
        } catch (err: unknown) {
          return json({
            success: false,
            error: err instanceof Error ? err.message : "Connection failed",
            webhook_url: (apiKey as any).webhook_url,
          });
        }
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook dispatcher error:", msg);
    return json({ error: "Internal error" }, 500);
  }
});
