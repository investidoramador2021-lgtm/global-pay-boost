/**
 * Public Lite Swap API — for honest small-amount trading bots.
 *
 * Non-custodial. Funds never touch MRC wallets. We just create the order
 * with the underlying liquidity provider and return the deposit address
 * back to the caller.
 *
 * Hard limits:
 *   - Max $1,000 USD per swap (estimated)
 *   - Max 10 swaps / IP / hour
 *   - Max 10 swaps / destination wallet / hour
 *   - Max 30 swaps / destination wallet / 24h
 *   - Sanctioned countries blocked (CF-IPCountry header)
 *   - Destination wallet blacklist
 *
 * Endpoints (single function, action-routed):
 *   GET  ?action=rates                      — public live rates passthrough
 *   POST { action: "estimate", from, to, amount }
 *   POST { action: "create",   from, to, amount, address, [refundAddress] }
 *   GET  ?action=status&id=<order_id>       — order status passthrough
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { LITE_API_OPENAPI } from "./openapi.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const bad = (msg: string, status = 400, extra: Record<string, unknown> = {}) =>
  json({ status: "error", error: msg, ...extra }, status);

// ─── Configuration ─────────────────────────────────────────────────────────
const MAX_USD_PER_SWAP = 1000;
const MAX_SWAPS_PER_IP_PER_HOUR = 10;
const MAX_SWAPS_PER_WALLET_PER_HOUR = 10;
const MAX_SWAPS_PER_WALLET_PER_24H = 30;

// FATF / OFAC high-risk jurisdictions. Two-letter ISO codes.
const BLOCKED_COUNTRIES = new Set([
  "KP", // North Korea
  "IR", // Iran
  "SY", // Syria
  "CU", // Cuba
  "RU", // Russia (sanctions)
  "BY", // Belarus
  "MM", // Myanmar
]);

const TICKER_RE = /^[a-z0-9]{1,20}$/i;
const ADDRESS_RE = /^[a-zA-Z0-9_:.-]{8,128}$/;
const ORDER_ID_RE = /^[a-zA-Z0-9_-]{1,64}$/;
const WEBHOOK_URL_RE = /^https:\/\/[a-zA-Z0-9.\-_/:?=&%]{6,512}$/;
const WEBHOOK_SECRET_RE = /^[a-zA-Z0-9._\-]{8,128}$/;

// ─── Webhook helpers ───────────────────────────────────────────────────────
async function hmacSign(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", enc.encode(payload), key);
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Map an upstream provider state to one of our public webhook event names.
 * Returns null if the state should not trigger a webhook (e.g. duplicate).
 */
function eventNameForState(state: string): string | null {
  const s = (state || "").toLowerCase();
  switch (s) {
    case "waiting": return "swap.created";
    case "confirming": return "swap.deposit_detected";
    case "exchanging":
    case "sending": return "swap.processing";
    case "finished": return "swap.finished";
    case "failed": return "swap.failed";
    case "refunded": return "swap.refunded";
    case "expired": return "swap.expired";
    case "verifying": return "swap.verifying";
    default: return null;
  }
}

async function dispatchWebhook(
  url: string,
  secret: string,
  event: string,
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; status: number; error?: string }> {
  try {
    const body = JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    });
    const signature = await hmacSign(body, secret);
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-MRC-Event": event,
        "X-MRC-Signature": signature,
        "User-Agent": "MRC-LiteAPI-Webhook/1.0",
      },
      body,
      signal: AbortSignal.timeout(8_000),
    });
    await resp.text();
    return { ok: resp.ok, status: resp.status };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: err instanceof Error ? err.message : "delivery failed",
    };
  }
}


// ─── Helpers ───────────────────────────────────────────────────────────────
async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getClientIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}

function getCountry(req: Request): string {
  return (
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-vercel-ip-country") ||
    ""
  ).toUpperCase();
}

// ─── ChangeNOW passthrough (same provider as the main widget) ──────────────
const CN_BASE = "https://api.changenow.io/v2";

const SUFFIX_TO_NETWORK: Record<string, string> = {
  erc20: "eth", trc20: "trx", bsc: "bsc", bep20: "bsc",
  matic: "matic", polygon: "matic", sol: "sol",
  arc20: "avaxc", arb: "arbitrum", arbitrum: "arbitrum",
  op: "op", ton: "ton", base: "base", avaxc: "avaxc",
};
const SUFFIXES = Object.keys(SUFFIX_TO_NETWORK).sort(
  (a, b) => b.length - a.length,
);
function splitNet(raw: string): { ticker: string; network: string } {
  const lower = raw.toLowerCase();
  for (const s of SUFFIXES) {
    if (lower.endsWith(s) && lower.length > s.length) {
      return { ticker: lower.slice(0, -s.length), network: SUFFIX_TO_NETWORK[s] };
    }
  }
  return { ticker: lower, network: lower };
}

async function cnFetch(path: string, init?: RequestInit) {
  const apiKey = Deno.env.get("CHANGENOW_PRIVATE_KEY") ||
    Deno.env.get("CHANGENOW_API_KEY")!;
  const resp = await fetch(`${CN_BASE}${path}`, {
    ...init,
    headers: {
      "x-changenow-api-key": apiKey,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const text = await resp.text();
  let data: unknown = null;
  try { data = JSON.parse(text); } catch { /* ignore */ }
  return { ok: resp.ok, status: resp.status, data, text };
}

async function estimateUsd(
  fromTicker: string,
  amount: number,
): Promise<number | null> {
  // Cheap approximation: convert from→USDT (ERC-20) for a USD value.
  if (fromTicker.toLowerCase() === "usdterc20" || fromTicker.toLowerCase() === "usdc") {
    return amount;
  }
  try {
    const f = splitNet(fromTicker);
    const t = splitNet("usdterc20");
    const u = `/exchange/estimated-amount?fromCurrency=${f.ticker}&toCurrency=${t.ticker}&fromNetwork=${f.network}&toNetwork=${t.network}&fromAmount=${amount}&flow=standard`;
    const r = await cnFetch(u);
    if (!r.ok || typeof r.data !== "object" || !r.data) return null;
    const v = (r.data as { toAmount?: number; estimatedAmount?: number }).toAmount
      ?? (r.data as { estimatedAmount?: number }).estimatedAmount ?? null;
    return typeof v === "number" && isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

// ─── Main handler ──────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  let action = url.searchParams.get("action") || "";
  let body: Record<string, unknown> = {};
  if (req.method === "POST") {
    try { body = await req.json(); } catch { /* empty */ }
    action = (body.action as string) || action;
  }

  // ── Country gate (applies to every endpoint that mutates) ────────────────
  const country = getCountry(req);
  if (country && BLOCKED_COUNTRIES.has(country) && action !== "rates" && action !== "status") {
    return bad(
      `Service not available in your jurisdiction (${country}).`,
      451,
    );
  }

  try {
    switch (action) {
      // ─── 0. OpenAPI contract (public, cacheable) ────────────────────────
      case "openapi":
        return new Response(JSON.stringify(LITE_API_OPENAPI, null, 2), {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=3600",
          },
        });

      // ─── 1. Public rates passthrough ────────────────────────────────────
      case "rates": {
        const from = (url.searchParams.get("from") || "").toLowerCase();
        const to = (url.searchParams.get("to") || "").toLowerCase();
        const amount = url.searchParams.get("amount") || "1";
        if (!TICKER_RE.test(from) || !TICKER_RE.test(to)) {
          return bad("Invalid from/to ticker format.");
        }
        if (!isFinite(Number(amount)) || Number(amount) <= 0) {
          return bad("Invalid amount.");
        }
        const f = splitNet(from), t = splitNet(to);
        const r = await cnFetch(
          `/exchange/estimated-amount?fromCurrency=${f.ticker}&toCurrency=${t.ticker}&fromNetwork=${f.network}&toNetwork=${t.network}&fromAmount=${amount}&flow=standard`,
        );
        if (!r.ok) return json({ status: "error", error: "Rate unavailable." }, 502);
        const d = (r.data || {}) as Record<string, unknown>;
        return json({
          status: "success",
          from, to, amount: Number(amount),
          estimated_amount: d.toAmount ?? d.estimatedAmount ?? null,
          rate: typeof d.toAmount === "number"
            ? Number(d.toAmount) / Number(amount)
            : null,
          warning: d.warningMessage ?? null,
          provider: "MRC Global Pay Lite API",
          documentation: "https://mrcglobalpay.com/developers#lite-api",
        });
      }

      // ─── 2. Estimate (no DB writes, no rate-limit) ──────────────────────
      case "estimate": {
        const from = String(body.from || "").toLowerCase();
        const to = String(body.to || "").toLowerCase();
        const amount = Number(body.amount);
        if (!TICKER_RE.test(from) || !TICKER_RE.test(to)) return bad("Invalid ticker.");
        if (!isFinite(amount) || amount <= 0) return bad("Invalid amount.");
        const usd = await estimateUsd(from, amount);
        if (usd !== null && usd > MAX_USD_PER_SWAP) {
          return bad(
            `Estimated $${usd.toFixed(2)} exceeds Lite API maximum of $${MAX_USD_PER_SWAP}. Use the Partner API for larger swaps.`,
            413,
            { max_usd: MAX_USD_PER_SWAP, estimated_usd: usd },
          );
        }
        const f = splitNet(from), t = splitNet(to);
        const r = await cnFetch(
          `/exchange/estimated-amount?fromCurrency=${f.ticker}&toCurrency=${t.ticker}&fromNetwork=${f.network}&toNetwork=${t.network}&fromAmount=${amount}&flow=standard`,
        );
        if (!r.ok) return json({ status: "error", error: "Rate unavailable." }, 502);
        const d = (r.data || {}) as Record<string, unknown>;
        return json({
          status: "success",
          from, to, amount,
          estimated_amount: d.toAmount ?? d.estimatedAmount ?? null,
          estimated_usd: usd,
          warning: d.warningMessage ?? null,
        });
      }

      // ─── 3. Create swap (rate-limited, blacklist-checked) ───────────────
      case "create": {
        const from = String(body.from || "").toLowerCase();
        const to = String(body.to || "").toLowerCase();
        const amount = Number(body.amount);
        const address = String(body.address || "").trim();
        const refundAddress = body.refundAddress
          ? String(body.refundAddress).trim()
          : undefined;
        const webhookUrl = body.webhook_url
          ? String(body.webhook_url).trim()
          : undefined;
        const webhookSecret = body.webhook_secret
          ? String(body.webhook_secret).trim()
          : undefined;

        if (!TICKER_RE.test(from) || !TICKER_RE.test(to)) return bad("Invalid ticker format.");
        if (!isFinite(amount) || amount <= 0) return bad("Invalid amount.");
        if (!ADDRESS_RE.test(address)) return bad("Invalid destination address.");
        if (refundAddress && !ADDRESS_RE.test(refundAddress)) {
          return bad("Invalid refund address.");
        }
        if (webhookUrl !== undefined) {
          if (!WEBHOOK_URL_RE.test(webhookUrl)) {
            return bad("Invalid webhook_url. Must be HTTPS, max 512 chars.");
          }
          if (!webhookSecret || !WEBHOOK_SECRET_RE.test(webhookSecret)) {
            return bad(
              "webhook_secret is required when webhook_url is set. Use 8-128 chars [A-Za-z0-9._-].",
            );
          }
        }


        // Estimate USD value & enforce $1,000 cap
        const usd = await estimateUsd(from, amount);
        if (usd !== null && usd > MAX_USD_PER_SWAP) {
          return bad(
            `Estimated $${usd.toFixed(2)} exceeds Lite API maximum of $${MAX_USD_PER_SWAP}. Use the Partner API for larger swaps.`,
            413,
            { max_usd: MAX_USD_PER_SWAP, estimated_usd: usd },
          );
        }

        const svc = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );

        // Blacklist check
        const { data: bl } = await svc
          .from("lite_api_blacklist")
          .select("wallet_address")
          .eq("wallet_address", address)
          .maybeSingle();
        if (bl) {
          return bad("Destination address is blocked.", 403);
        }

        const ipHash = await sha256Hex(getClientIp(req));
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        // Rate-limit checks (in parallel)
        const [{ count: ipCount }, { count: walletHourCount }, { count: walletDayCount }] =
          await Promise.all([
            svc.from("lite_api_swaps").select("id", { count: "exact", head: true })
              .eq("ip_hash", ipHash).gte("created_at", oneHourAgo),
            svc.from("lite_api_swaps").select("id", { count: "exact", head: true })
              .eq("destination_wallet", address).gte("created_at", oneHourAgo),
            svc.from("lite_api_swaps").select("id", { count: "exact", head: true })
              .eq("destination_wallet", address).gte("created_at", oneDayAgo),
          ]);

        if ((ipCount ?? 0) >= MAX_SWAPS_PER_IP_PER_HOUR) {
          return bad(
            `Rate limit: max ${MAX_SWAPS_PER_IP_PER_HOUR} swaps per IP per hour.`,
            429,
            { retry_after_seconds: 3600 },
          );
        }
        if ((walletHourCount ?? 0) >= MAX_SWAPS_PER_WALLET_PER_HOUR) {
          return bad(
            `Rate limit: max ${MAX_SWAPS_PER_WALLET_PER_HOUR} swaps per destination wallet per hour.`,
            429,
            { retry_after_seconds: 3600 },
          );
        }
        if ((walletDayCount ?? 0) >= MAX_SWAPS_PER_WALLET_PER_24H) {
          return bad(
            `Velocity limit: max ${MAX_SWAPS_PER_WALLET_PER_24H} swaps per destination wallet per 24h.`,
            429,
            { retry_after_seconds: 86400 },
          );
        }

        // Create the order with ChangeNOW v2 (same path the widget uses)
        const f = splitNet(from), t = splitNet(to);
        const cnBody: Record<string, unknown> = {
          fromCurrency: f.ticker, toCurrency: t.ticker,
          fromNetwork: f.network, toNetwork: t.network,
          fromAmount: String(amount),
          address,
          flow: "standard",
        };
        if (refundAddress) cnBody.refundAddress = refundAddress;

        const cn = await cnFetch("/exchange/by-standard-rate", {
          method: "POST",
          body: JSON.stringify(cnBody),
        });
        if (!cn.ok || !cn.data) {
          const errMsg = (cn.data as { message?: string } | null)?.message
            || "Liquidity provider error.";
          return json({ status: "error", error: errMsg }, cn.status || 502);
        }
        const tx = cn.data as Record<string, unknown>;
        const orderId = String(tx.id || "");
        const mrcTxId = `MRC-${orderId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8)}${
          Math.random().toString(36).slice(2, 6).toUpperCase()
        }`;

        // Audit log (rate-limit accounting + webhook config)
        await svc.from("lite_api_swaps").insert({
          ip_hash: ipHash,
          destination_wallet: address,
          from_ticker: from,
          to_ticker: to,
          amount_usd: usd ?? 0,
          country_code: country || null,
          outcome: "created",
          provider_tx_id: orderId,
          mrc_tx_id: mrcTxId,
          webhook_url: webhookUrl ?? null,
          webhook_secret: webhookSecret ?? null,
          last_webhook_state: webhookUrl ? "waiting" : null,
        });

        // Estimated expiry — standard flow doesn't carry one; provider commonly waits ~20m for deposit.
        const expiresAt = new Date(Date.now() + 20 * 60 * 1000).toISOString();

        // Fire the initial swap.created webhook (best-effort, non-blocking)
        let webhookDelivery: Record<string, unknown> | undefined;
        if (webhookUrl && webhookSecret) {
          const result = await dispatchWebhook(
            webhookUrl,
            webhookSecret,
            "swap.created",
            {
              order_id: mrcTxId,
              provider_order_id: orderId,
              state: "waiting",
              from, to,
              from_amount: tx.fromAmount ?? amount,
              estimated_to_amount: tx.toAmount ?? null,
              deposit_address: tx.payinAddress,
              deposit_extra_id: tx.payinExtraId ?? null,
              payout_address: tx.payoutAddress ?? address,
              expires_at: expiresAt,
            },
          );
          webhookDelivery = {
            url: webhookUrl,
            initial_event: "swap.created",
            delivered: result.ok,
            response_status: result.status,
            ...(result.error ? { error: result.error } : {}),
          };
        }

        return json({
          status: "success",
          order_id: mrcTxId,
          provider_order_id: orderId,
          deposit_address: tx.payinAddress,
          deposit_extra_id: tx.payinExtraId ?? null,
          payout_address: tx.payoutAddress ?? address,
          payout_extra_id: tx.payoutExtraId ?? null,
          from, to,
          from_amount: tx.fromAmount ?? amount,
          estimated_to_amount: tx.toAmount ?? null,
          estimated_usd: usd,
          expires_at: expiresAt,
          status_url: `https://${
            new URL(req.url).host
          }/functions/v1/lite-swap?action=status&id=${encodeURIComponent(mrcTxId)}`,
          custody: "non-custodial",
          ...(webhookDelivery ? { webhook: webhookDelivery } : {}),
          documentation: "https://mrcglobalpay.com/developers#lite-api",
        });
      }

      // ─── 4. Status passthrough (with webhook fan-out on state change) ──
      case "status": {
        const id = url.searchParams.get("id") || "";
        if (!ORDER_ID_RE.test(id)) return bad("Invalid order id.");

        const svc = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );

        // Resolve MRC id → provider id and pull webhook config (single round-trip)
        let providerId = id;
        let webhookUrl: string | null = null;
        let webhookSecret: string | null = null;
        let lastWebhookState: string | null = null;
        if (id.startsWith("MRC-")) {
          const { data: row } = await svc
            .from("lite_api_swaps")
            .select("provider_tx_id, webhook_url, webhook_secret, last_webhook_state")
            .eq("mrc_tx_id", id)
            .maybeSingle();
          if (!row?.provider_tx_id) return bad("Order not found.", 404);
          providerId = row.provider_tx_id as string;
          webhookUrl = (row.webhook_url as string) ?? null;
          webhookSecret = (row.webhook_secret as string) ?? null;
          lastWebhookState = (row.last_webhook_state as string) ?? null;
        }

        const r = await cnFetch(`/exchange/by-id?id=${encodeURIComponent(providerId)}`);
        if (!r.ok) return json({ status: "error", error: "Order not found." }, 404);
        const d = (r.data || {}) as Record<string, unknown>;
        const currentState = String(d.status ?? "unknown").toLowerCase();

        // Webhook fan-out: only fire on state change
        let webhookFired: Record<string, unknown> | undefined;
        if (
          webhookUrl && webhookSecret && id.startsWith("MRC-") &&
          currentState !== "unknown" && currentState !== lastWebhookState
        ) {
          const eventName = eventNameForState(currentState);
          if (eventName) {
            const result = await dispatchWebhook(
              webhookUrl,
              webhookSecret,
              eventName,
              {
                order_id: id,
                provider_order_id: providerId,
                state: currentState,
                from: d.fromCurrency,
                to: d.toCurrency,
                amount_in: d.expectedAmountFrom ?? d.fromAmount,
                amount_out: d.amountTo ?? d.toAmount,
                deposit_address: d.payinAddress,
                payout_address: d.payoutAddress,
                payout_hash: d.payoutHash ?? null,
                updated_at: d.updatedAt ?? null,
              },
            );
            // Persist new state regardless of delivery success (avoid retry storms)
            await svc.from("lite_api_swaps")
              .update({ last_webhook_state: currentState })
              .eq("mrc_tx_id", id);
            webhookFired = {
              event: eventName,
              delivered: result.ok,
              response_status: result.status,
              ...(result.error ? { error: result.error } : {}),
            };
          }
        }

        return json({
          status: "success",
          order_id: id,
          state: d.status ?? "unknown",
          from: d.fromCurrency, to: d.toCurrency,
          amount_in: d.expectedAmountFrom ?? d.fromAmount,
          amount_out: d.amountTo ?? d.toAmount,
          deposit_address: d.payinAddress,
          payout_address: d.payoutAddress,
          payout_hash: d.payoutHash ?? null,
          updated_at: d.updatedAt ?? null,
          ...(webhookFired ? { webhook: webhookFired } : {}),
        });
      }

      default:
        return bad(
          'Unknown action. Use "rates", "estimate", "create", "status", or "openapi".',
        );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[lite-swap] error:", msg);
    return json({ status: "error", error: msg }, 500);
  }
});
