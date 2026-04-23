/**
 * Public webhook health/status endpoint for the Lite API.
 *
 * GET /functions/v1/lite-webhook-status
 *
 * Returns anonymized 24h + 7d aggregates of outbound webhook deliveries:
 *   - total deliveries by state (created / deposit_detected / finished / expired)
 *   - last successful delivery timestamp
 *   - success rate
 *
 * No auth required, no per-partner data, safe to render on a public page.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    const since24h = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const since7d = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

    const [{ data: rows24h }, { data: rows7d }, { data: lastDelivered }] =
      await Promise.all([
        sb
          .from("lite_api_swaps")
          .select("last_webhook_state, outcome, created_at, webhook_url")
          .gte("created_at", since24h)
          .limit(5000),
        sb
          .from("lite_api_swaps")
          .select("last_webhook_state")
          .gte("created_at", since7d)
          .not("webhook_url", "is", null)
          .limit(20000),
        sb
          .from("lite_api_swaps")
          .select("created_at")
          .not("last_webhook_state", "is", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

    const STATES = [
      "swap.created",
      "swap.deposit_detected",
      "swap.finished",
      "swap.expired",
    ];
    const stateMap: Record<string, string> = {
      waiting: "swap.created",
      confirming: "swap.deposit_detected",
      finished: "swap.finished",
      expired: "swap.expired",
      failed: "swap.expired",
    };

    const counts24h = Object.fromEntries(STATES.map((s) => [s, 0]));
    let webhookEnabled24h = 0;
    for (const r of rows24h ?? []) {
      if (r.webhook_url) webhookEnabled24h++;
      const evt = r.last_webhook_state ? stateMap[r.last_webhook_state] : null;
      if (evt && evt in counts24h) counts24h[evt]++;
    }

    const counts7d = Object.fromEntries(STATES.map((s) => [s, 0]));
    for (const r of rows7d ?? []) {
      const evt = r.last_webhook_state ? stateMap[r.last_webhook_state] : null;
      if (evt && evt in counts7d) counts7d[evt]++;
    }

    const totalDelivered24h = Object.values(counts24h).reduce(
      (a, b) => a + b,
      0,
    );
    const successRate24h =
      webhookEnabled24h > 0
        ? Math.round((totalDelivered24h / webhookEnabled24h) * 1000) / 10
        : null;

    const body = {
      status: "success",
      generated_at: new Date().toISOString(),
      window: { hours_24: since24h, days_7: since7d },
      last_successful_delivery_at: lastDelivered?.created_at ?? null,
      counts_24h: {
        ...counts24h,
        total_with_webhook: webhookEnabled24h,
        success_rate_percent: successRate24h,
      },
      counts_7d: counts7d,
      provider: "MRC Global Pay Lite API",
      documentation: "https://mrcglobalpay.com/developers#lite-api",
    };

    return new Response(JSON.stringify(body, null, 2), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (err) {
    console.error("lite-webhook-status error", err);
    return new Response(
      JSON.stringify({
        status: "error",
        error: err instanceof Error ? err.message : "internal",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
