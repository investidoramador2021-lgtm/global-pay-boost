// Affiliate commissions scanner (review-first).
// Scans completed swap_transactions, joins ref_code → partner (via partner_profiles.referral_code OR affiliate_leads.ref_token),
// computes commission in BTC (0.3% on ChangeNOW, 0.1% on LetsExchange), and writes rows to partner_commissions
// with status='pending_review'. Balances are NOT credited here — admin must approve each row in the Admin Portal,
// which triggers the credit via approve-affiliate-commission.
// Idempotent: partner_commissions has UNIQUE(swap_transaction_id), so re-runs are safe.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_CN = 0.003; // 0.3% — ChangeNOW
const RATE_LE = 0.001; // 0.1% — LetsExchange

const STABLES = new Set(["usdt", "usdc", "dai", "busd", "tusd", "usdp", "pyusd", "fdusd"]);
const COINGECKO_IDS: Record<string, string> = {
  btc: "bitcoin", eth: "ethereum", sol: "solana", bnb: "binancecoin", xrp: "ripple",
  ada: "cardano", doge: "dogecoin", trx: "tron", matic: "matic-network", pol: "matic-network",
  avax: "avalanche-2", ltc: "litecoin", link: "chainlink", xlm: "stellar", ton: "the-open-network",
  near: "near", atom: "cosmos", hbar: "hedera-hashgraph", arb: "arbitrum", op: "optimism",
  apt: "aptos", sui: "sui", fil: "filecoin", bch: "bitcoin-cash", etc: "ethereum-classic",
  algo: "algorand", vet: "vechain", ftm: "fantom", hype: "hyperliquid", tia: "celestia",
  sei: "sei-network", inj: "injective-protocol", bera: "berachain-bera", monad: "monad",
  paxg: "pax-gold", xaut: "tether-gold", pepe: "pepe", shib: "shiba-inu",
};

interface PriceCache { [ticker: string]: number }

async function fetchPrices(tickers: string[]): Promise<PriceCache> {
  const cache: PriceCache = { btc: 0 };
  const ids = new Set<string>(["bitcoin"]);
  for (const t of tickers) {
    const lc = t.toLowerCase();
    if (STABLES.has(lc)) { cache[lc] = 1; continue; }
    const id = COINGECKO_IDS[lc];
    if (id) ids.add(id);
  }
  try {
    const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${[...ids].join(",")}&vs_currencies=usd`);
    if (r.ok) {
      const j = await r.json();
      for (const [tk, id] of Object.entries(COINGECKO_IDS)) {
        if (j[id]?.usd) cache[tk] = j[id].usd;
      }
      if (j.bitcoin?.usd) cache.btc = j.bitcoin.usd;
    }
  } catch (e) {
    console.warn("[credit-affiliate-commissions] price fetch failed", e);
  }
  return cache;
}

function priceUsd(ticker: string, prices: PriceCache): number {
  const lc = ticker.toLowerCase();
  if (STABLES.has(lc)) return 1;
  return prices[lc] || 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const result = {
    scanned: 0,
    pending_created: 0,
    skipped_no_partner: 0,
    skipped_already_logged: 0,
    skipped_no_price: 0,
    errors: 0,
    total_btc_pending: 0,
  };

  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: swaps, error: swapErr } = await supabase
      .from("swap_transactions")
      .select("id, transaction_id, from_currency, to_currency, amount, provider, ref_code, created_at")
      .not("ref_code", "is", null)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(500);

    if (swapErr) throw swapErr;
    result.scanned = swaps?.length ?? 0;
    if (!swaps || swaps.length === 0) {
      await notifyTelegram(supabase, result, "ok");
      return new Response(JSON.stringify({ ok: true, ...result, message: "no swaps to scan" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const swapIds = swaps.map(s => s.id);
    const { data: existing } = await supabase
      .from("partner_commissions")
      .select("swap_transaction_id")
      .in("swap_transaction_id", swapIds);
    const logged = new Set((existing ?? []).map(e => e.swap_transaction_id));
    const fresh = swaps.filter(s => !logged.has(s.id));
    result.skipped_already_logged = swaps.length - fresh.length;

    if (fresh.length === 0) {
      await notifyTelegram(supabase, result, "ok");
      return new Response(JSON.stringify({ ok: true, ...result, message: "all already logged" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const refCodes = [...new Set(fresh.map(s => s.ref_code as string))];
    const [{ data: profilesByRef }, { data: leadsByRef }] = await Promise.all([
      supabase.from("partner_profiles").select("id, referral_code").in("referral_code", refCodes),
      supabase.from("affiliate_leads").select("partner_id, ref_token").in("ref_token", refCodes).not("partner_id", "is", null),
    ]);

    const refToPartner = new Map<string, string>();
    for (const p of profilesByRef ?? []) refToPartner.set(p.referral_code, p.id);
    for (const l of leadsByRef ?? []) {
      if (l.partner_id && !refToPartner.has(l.ref_token)) refToPartner.set(l.ref_token, l.partner_id);
    }

    const refSource = new Map<string, string>();
    for (const p of profilesByRef ?? []) refSource.set(p.referral_code, "referral_link");
    for (const l of leadsByRef ?? []) {
      if (l.partner_id && !refSource.has(l.ref_token)) refSource.set(l.ref_token, "affiliate_widget");
    }

    const tickers = [...new Set(fresh.map(s => s.from_currency))];
    const prices = await fetchPrices(tickers);
    const btcUsd = prices.btc || 0;
    if (btcUsd <= 0) {
      await notifyTelegram(supabase, result, "error", "BTC price unavailable");
      return new Response(JSON.stringify({ ok: false, ...result, error: "BTC price unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Write each row as pending_review. NO balance crediting — admin must approve in /admin.
    for (const s of fresh) {
      const refCode = s.ref_code as string;
      const partnerId = refToPartner.get(refCode);
      if (!partnerId) { result.skipped_no_partner++; continue; }

      const fromUsd = priceUsd(s.from_currency, prices);
      if (fromUsd <= 0) { result.skipped_no_price++; continue; }

      const volumeUsd = Number(s.amount) * fromUsd;
      const provider = (s.provider === "le" ? "le" : "cn");
      const rate = provider === "le" ? RATE_LE : RATE_CN;
      const commissionUsd = volumeUsd * rate;
      const commissionBtc = commissionUsd / btcUsd;

      const { error: insErr } = await supabase.from("partner_commissions").insert({
        partner_id: partnerId,
        swap_transaction_id: s.id,
        ref_code: refCode,
        source: refSource.get(refCode) ?? "referral_link",
        provider,
        from_currency: s.from_currency,
        to_currency: s.to_currency,
        swap_amount: s.amount,
        volume_usd: volumeUsd,
        commission_rate: rate,
        commission_btc: commissionBtc,
        btc_usd_rate: btcUsd,
        status: "pending_review",
      });

      if (insErr) {
        if ((insErr as any).code === "23505") { result.skipped_already_logged++; continue; }
        console.error("[credit-affiliate-commissions] insert failed", insErr);
        result.errors++;
        continue;
      }

      result.pending_created++;
      result.total_btc_pending += commissionBtc;
    }

    await notifyTelegram(supabase, result, "ok");
    return new Response(JSON.stringify({ ok: true, ...result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("[credit-affiliate-commissions] fatal", err);
    await notifyTelegram(supabase, result, "error", String(err));
    return new Response(JSON.stringify({ ok: false, error: String(err), ...result }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

async function notifyTelegram(
  supabase: ReturnType<typeof createClient>,
  result: {
    scanned: number;
    pending_created: number;
    skipped_no_partner: number;
    skipped_already_logged: number;
    skipped_no_price: number;
    errors: number;
    total_btc_pending: number;
  },
  status: "ok" | "error",
  errorMsg?: string,
) {
  try {
    const emoji = status === "ok" ? "🟡" : "🚨";
    const title = status === "ok"
      ? "Affiliate Commissions — Pending Review"
      : "Affiliate Commissions Cron — FAILED";
    const lines = [
      `${emoji} <b>${title}</b>`,
      `🕒 ${new Date().toISOString()}`,
      ``,
      `🔍 Scanned: <b>${result.scanned}</b>`,
      `📝 New pending rows: <b>${result.pending_created}</b>`,
      `₿ Total BTC pending approval: <b>${result.total_btc_pending.toFixed(8)}</b>`,
      `↩️ Already logged: ${result.skipped_already_logged}`,
      `⚠️ No partner: ${result.skipped_no_partner}`,
      `❓ No price: ${result.skipped_no_price}`,
      `❌ Errors: ${result.errors}`,
      ``,
      `👉 Review & approve at /admin → Affiliates tab`,
    ];
    if (errorMsg) lines.push(``, `<pre>${errorMsg.slice(0, 500)}</pre>`);

    await supabase.functions.invoke("telegram-notify", {
      body: {
        type: status === "ok" ? "alert" : "error",
        message: lines.join("\n"),
      },
    });
  } catch (e) {
    console.warn("[credit-affiliate-commissions] telegram notify failed", e);
  }
}
