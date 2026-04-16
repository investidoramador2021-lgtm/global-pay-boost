import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-mrc-partner-id, x-mrc-api-secret",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const CHANGENOW_BASE = "https://api.changenow.io/v1";
const COMMISSION_RATE = 0.004; // 0.4% cap
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(partnerId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(partnerId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(partnerId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function mrcError(code: string, message: string, status = 400) {
  return json({ error: { code, message, provider: "MRC Global Pay" } }, status);
}

/** Validate partner API key + secret, return partner_id or null */
async function authenticatePartner(
  svc: ReturnType<typeof createClient>,
  keyId: string | null,
  secretHash: string | null
): Promise<{ partnerId: string } | null> {
  if (!keyId || !secretHash) return null;

  const { data } = await svc
    .from("partner_api_keys")
    .select("partner_id, api_secret_hash, is_active")
    .eq("key_id", keyId)
    .eq("is_active", true)
    .maybeSingle();

  if (!data) return null;

  // Verify secret hash matches (partner sends raw secret, we compare hash)
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(secretHash));
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (hashHex !== data.api_secret_hash) return null;

  // Check developer profile exists (2FA required)
  const { data: dev } = await svc
    .from("developer_profiles")
    .select("id, totp_configured")
    .eq("partner_id", data.partner_id)
    .maybeSingle();

  if (!dev || !dev.totp_configured) return null;

  // Update last_used_at
  await svc.from("partner_api_keys").update({ last_used_at: new Date().toISOString() }).eq("key_id", keyId);

  return { partnerId: data.partner_id };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const masterKey = Deno.env.get("CHANGENOW_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!masterKey) return mrcError("MRC_CONFIG_ERROR", "Service temporarily unavailable", 503);

  const svc = createClient(supabaseUrl, serviceKey);

  // Authenticate partner
  const partnerId = req.headers.get("x-mrc-partner-id");
  const apiSecret = req.headers.get("x-mrc-api-secret");
  const auth = await authenticatePartner(svc, partnerId, apiSecret);

  if (!auth) {
    return mrcError("MRC_AUTH_FAILED", "Invalid credentials or 2FA not configured", 401);
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    switch (action) {
      /* ── Get available currencies ── */
      case "currencies": {
        const resp = await fetch(`${CHANGENOW_BASE}/currencies?active=true&fixedRate=true`);
        const data = await resp.json();
        return json(data);
      }

      /* ── Estimate exchange amount ── */
      case "estimate": {
        const from = url.searchParams.get("from");
        const to = url.searchParams.get("to");
        const amount = url.searchParams.get("amount");
        if (!from || !to || !amount) return mrcError("MRC_INVALID_PARAMS", "Missing from, to, or amount");

        const resp = await fetch(
          `${CHANGENOW_BASE}/exchange-amount/${amount}/${from}_${to}?api_key=${masterKey}`
        );
        const data = await resp.json();
        if (!resp.ok) return mrcError("MRC_ESTIMATE_FAILED", "Unable to estimate at this time", 502);

        // Strip any provider-specific identifiers
        return json({
          estimatedAmount: data.estimatedAmount,
          transactionSpeedForecast: data.transactionSpeedForecast,
          warningMessage: data.warningMessage || null,
        });
      }

      /* ── Create exchange order (the core proxy) ── */
      case "create-order": {
        if (req.method !== "POST") return mrcError("MRC_METHOD_NOT_ALLOWED", "POST required", 405);
        const body = await req.json();
        const { from, to, amount, address, refundAddress, extraId } = body;

        if (!from || !to || !amount || !address) {
          return mrcError("MRC_INVALID_PARAMS", "Missing required fields: from, to, amount, address");
        }

        // 1. Log with 'pending' status
        const mrcTxId = `MRC-${crypto.randomUUID().slice(0, 12)}`;
        const commission = Number(amount) * COMMISSION_RATE;

        const { data: txRecord, error: txErr } = await svc
          .from("partner_transactions")
          .insert({
            partner_id: auth.partnerId,
            asset: from.toLowerCase(),
            volume: Number(amount),
            commission_btc: commission,
            status: "pending",
            mrc_transaction_id: mrcTxId,
            completed_at: new Date().toISOString(),
          } as any)
          .select("id")
          .single();

        if (txErr) {
          console.error("Failed to log partner tx:", txErr);
          return mrcError("MRC_INTERNAL_ERROR", "Failed to process order", 500);
        }

        // 2. Relay to ChangeNOW — NO partner data sent
        const cnPayload: Record<string, unknown> = { from, to, amount, address };
        if (refundAddress) cnPayload.refundAddress = refundAddress;
        if (extraId) cnPayload.extraId = extraId;

        const cnResp = await fetch(`${CHANGENOW_BASE}/transactions/${masterKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cnPayload),
        });

        const cnData = await cnResp.json();

        if (!cnResp.ok) {
          // Update status to failed
          await svc
            .from("partner_transactions")
            .update({ status: "failed" } as any)
            .eq("id", txRecord.id);
          return mrcError("MRC_ORDER_FAILED", cnData?.message || "Order placement failed", 502);
        }

        // 3. Map ChangeNOW order_id internally (hidden from partner)
        await svc
          .from("partner_transactions")
          .update({
            changenow_order_id: cnData.id,
            status: "awaiting_deposit",
          } as any)
          .eq("id", txRecord.id);

        // 4. Create/update partner balance (pending)
        const { data: existingBalance } = await svc
          .from("partner_balances")
          .select("id, pending_btc")
          .eq("partner_id", auth.partnerId)
          .maybeSingle();

        if (existingBalance) {
          await svc
            .from("partner_balances")
            .update({
              pending_btc: (existingBalance as any).pending_btc + commission,
              updated_at: new Date().toISOString(),
            } as any)
            .eq("id", (existingBalance as any).id);
        } else {
          await svc.from("partner_balances").insert({
            partner_id: auth.partnerId,
            pending_btc: commission,
          } as any);
        }

        // 5. Return MRC-branded response (no ChangeNOW ID)
        return json({
          mrc_transaction_id: mrcTxId,
          status: "awaiting_deposit",
          payin_address: cnData.payinAddress,
          payin_extra_id: cnData.payinExtraId || null,
          from_currency: from,
          to_currency: to,
          amount: Number(amount),
          expected_receive: cnData.amount,
          created_at: new Date().toISOString(),
        });
      }

      /* ── Check order status ── */
      case "order-status": {
        const mrcId = url.searchParams.get("mrc_transaction_id");
        if (!mrcId) return mrcError("MRC_INVALID_PARAMS", "Missing mrc_transaction_id");

        const { data: tx } = await svc
          .from("partner_transactions")
          .select("*")
          .eq("partner_id", auth.partnerId)
          .eq("mrc_transaction_id", mrcId)
          .maybeSingle();

        if (!tx) return mrcError("MRC_NOT_FOUND", "Transaction not found", 404);

        const txAny = tx as any;

        // If we have a ChangeNOW ID, fetch live status
        let liveStatus = txAny.status;
        let amountReceive = null;

        if (txAny.changenow_order_id) {
          try {
            const cnResp = await fetch(
              `${CHANGENOW_BASE}/transactions/${txAny.changenow_order_id}/${masterKey}`
            );
            const cnData = await cnResp.json();

            if (cnResp.ok) {
              // Map CN status to MRC status
              const statusMap: Record<string, string> = {
                waiting: "awaiting_deposit",
                confirming: "confirming_deposit",
                exchanging: "exchanging",
                sending: "sending_payout",
                finished: "success",
                failed: "failed",
                refunded: "refunded",
                expired: "expired",
              };
              liveStatus = statusMap[cnData.status] || cnData.status;
              amountReceive = cnData.amountReceive;

              // Update local status
              await svc
                .from("partner_transactions")
                .update({ status: liveStatus } as any)
                .eq("id", txAny.id);

              // If finished, credit commission to available balance
              if (cnData.status === "finished" && txAny.status !== "success") {
                const { data: bal } = await svc
                  .from("partner_balances")
                  .select("id, available_btc, pending_btc")
                  .eq("partner_id", auth.partnerId)
                  .maybeSingle();

                if (bal) {
                  const balAny = bal as any;
                  await svc
                    .from("partner_balances")
                    .update({
                      available_btc: balAny.available_btc + txAny.commission_btc,
                      pending_btc: Math.max(0, balAny.pending_btc - txAny.commission_btc),
                      total_earned_btc: (balAny.total_earned_btc || 0) + txAny.commission_btc,
                      last_credited_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    } as any)
                    .eq("id", balAny.id);
                }

                // Mark transaction as paid
                await svc
                  .from("partner_transactions")
                  .update({ is_paid: true, paid_at: new Date().toISOString(), status: "success" } as any)
                  .eq("id", txAny.id);
              }
            }
          } catch (e) {
            console.error("Status check failed:", e);
          }
        }

        return json({
          mrc_transaction_id: mrcId,
          status: liveStatus,
          asset: txAny.asset,
          volume: txAny.volume,
          commission: txAny.commission_btc,
          amount_received: amountReceive,
          created_at: txAny.completed_at,
        });
      }

      /* ── List partner transactions ── */
      case "list-orders": {
        const limit = Math.min(Number(url.searchParams.get("limit") || "50"), 200);
        const offset = Number(url.searchParams.get("offset") || "0");

        const { data: txs } = await svc
          .from("partner_transactions")
          .select("mrc_transaction_id, asset, volume, commission_btc, status, completed_at, is_paid")
          .eq("partner_id", auth.partnerId)
          .order("completed_at", { ascending: false })
          .range(offset, offset + limit - 1);

        return json({
          orders: (txs || []).map((t: any) => ({
            mrc_transaction_id: t.mrc_transaction_id,
            asset: t.asset,
            volume: t.volume,
            commission: t.commission_btc,
            status: t.status,
            is_paid: t.is_paid,
            created_at: t.completed_at,
          })),
          count: (txs || []).length,
        });
      }

      /* ── Get balance ── */
      case "balance": {
        const { data: bal } = await svc
          .from("partner_balances")
          .select("available_btc, pending_btc, total_earned_btc, last_credited_at")
          .eq("partner_id", auth.partnerId)
          .maybeSingle();

        return json(
          bal || { available_btc: 0, pending_btc: 0, total_earned_btc: 0, last_credited_at: null }
        );
      }

      default:
        return mrcError("MRC_INVALID_ACTION", `Unknown action: ${action}`);
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Partner proxy error:", msg);
    return mrcError("MRC_INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
});
