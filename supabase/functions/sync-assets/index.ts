import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIER1_TICKERS = new Set([
  "btc", "eth", "sol", "usdt", "usdc", "xrp", "bnb", "doge", "ada", "trx",
  "dot", "matic", "avax", "link", "ltc", "xaut", "paxg", "dai", "shib", "ton",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Auth: cron secret, service_role key, or admin JWT
  const cronSecret = Deno.env.get("CRON_SECRET");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const authHeader = req.headers.get("authorization") || "";
  const apikeyHeader = req.headers.get("apikey") || "";
  const bearerToken = authHeader.replace("Bearer ", "");
  const isCron = cronSecret && bearerToken === cronSecret;
  const isServiceRole = bearerToken === serviceKey || apikeyHeader === serviceKey;

  if (!isCron && !isServiceRole) {
    // Check admin role via JWT
    const svc = createClient(
      Deno.env.get("SUPABASE_URL")!,
      anonKey,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await svc.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const adminClient = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);
    const { data: isAdmin } = await adminClient.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  try {
    const apiKey = Deno.env.get("CHANGENOW_API_KEY");
    if (!apiKey) throw new Error("CHANGENOW_API_KEY not configured");

    // Fetch all active currencies from ChangeNOW v2 (includes network + tokenContract)
    const resp = await fetch(`https://api.changenow.io/v2/exchange/currencies?active=true&fixedRate=true`);
    if (!resp.ok) throw new Error(`ChangeNOW API error: ${resp.status}`);
    const currencies: Array<{
      ticker: string;
      name: string;
      image: string;
      hasExternalId: boolean;
      isFiat: boolean;
      featured: boolean;
      isStable: boolean;
      supportsFixedRate: boolean;
      network: string;
      tokenContract: string | null;
    }> = await resp.json();

    // Filter out fiat
    const cryptos = currencies.filter((c) => !c.isFiat);

    const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Get existing assets
    const { data: existing } = await svc
      .from("exchange_assets")
      .select("ticker, network");
    const existingSet = new Set((existing || []).map((e: any) => `${e.ticker}__${e.network}`));

    // Track which tickers are still active from API
    const apiActiveSet = new Set(cryptos.map((c) => `${c.ticker}__${c.network}`));

    // Insert new assets
    const newAssets = cryptos
      .filter((c) => !existingSet.has(`${c.ticker}__${c.network}`))
      .map((c) => ({
        ticker: c.ticker,
        name: c.name,
        network: c.network || "",
        image_url: c.image || "",
        token_contract: c.tokenContract || null,
        has_external_id: c.hasExternalId || false,
        is_stable: c.isStable || false,
        is_featured: c.featured || false,
        supports_fixed_rate: c.supportsFixedRate || false,
        is_active: true,
        tier: TIER1_TICKERS.has(c.ticker.toLowerCase()) ? 1 : 3,
      }));

    let inserted = 0;
    if (newAssets.length > 0) {
      // Batch insert in chunks of 500
      for (let i = 0; i < newAssets.length; i += 500) {
        const chunk = newAssets.slice(i, i + 500);
        const { error } = await svc.from("exchange_assets").insert(chunk);
        if (error) console.error("Insert batch error:", error);
        else inserted += chunk.length;
      }
    }

    // Mark deprecated assets as inactive
    const { data: allDb } = await svc.from("exchange_assets").select("id, ticker, network, is_active");
    let deactivated = 0;
    const toDeactivate = (allDb || []).filter(
      (a: any) => a.is_active && !apiActiveSet.has(`${a.ticker}__${a.network}`)
    );
    if (toDeactivate.length > 0) {
      const ids = toDeactivate.map((a: any) => a.id);
      const { error } = await svc.from("exchange_assets").update({ is_active: false, updated_at: new Date().toISOString() }).in("id", ids);
      if (!error) deactivated = ids.length;
    }

    // Reactivate assets that came back
    const toReactivate = (allDb || []).filter(
      (a: any) => !a.is_active && apiActiveSet.has(`${a.ticker}__${a.network}`)
    );
    let reactivated = 0;
    if (toReactivate.length > 0) {
      const ids = toReactivate.map((a: any) => a.id);
      const { error } = await svc.from("exchange_assets").update({ is_active: true, updated_at: new Date().toISOString() }).in("id", ids);
      if (!error) reactivated = ids.length;
    }

    // Notify Telegram
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
    if (botToken && chatId && (inserted > 0 || deactivated > 0)) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `📊 [Asset Sync] +${inserted} new, -${deactivated} deprecated, ↻${reactivated} reactivated\nTotal API: ${cryptos.length}`,
          parse_mode: "HTML",
          disable_notification: true,
        }),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_api: cryptos.length,
        inserted,
        deactivated,
        reactivated,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("sync-assets error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
