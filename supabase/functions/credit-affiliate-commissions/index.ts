// Auto-credit affiliate commissions cron.
// Scans completed swap_transactions, joins ref_code → partner (via partner_profiles.referral_code OR affiliate_leads.ref_token),
// computes commission in BTC (0.3% on ChangeNOW, 0.1% on LetsExchange), and credits partner_balances.
// Idempotent: partner_commissions has UNIQUE(swap_transaction_id), so re-runs are safe.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Commission rates by liquidity provider
const RATE_CN = 0.003; // 0.3% — ChangeNOW
const RATE_LE = 0.001; // 0.1% — LetsExchange

// Tickers we can price (lowercased CoinGecko IDs).
// Stables map to $1; everything else hits CoinGecko.
const STABLES = new Set(["usdt", "usdc", "dai", "busd", "tusd", "usdp", "pyusd", "fdusd"]);
const COINGECKO_IDS: Record<string, string> = {
  btc: "bitcoin",
  eth: "ethereum",
  sol: "solana",
  bnb: "binancecoin",
  xrp: "ripple",
  ada: "cardano",
  doge: "dogecoin",
  trx: "tron",
  matic: "matic-network",
  pol: "matic-network",
  avax: "avalanche-2",
  ltc: "litecoin",
  link: "chainlink",
  xlm: "stellar",
  ton: "the-open-network",
  near: "near",
  atom: "cosmos",
  hbar: "hedera-hashgraph",
  arb: "arbitrum",
  op: "optimism",
  apt: "aptos",
  sui: "sui",
  fil: "filecoin",
  bch: "bitcoin-cash",
  etc: "ethereum-classic",
  algo: "algorand",
  vet: "vechain",
  ftm: "fantom",
  hype: "hyperliquid",
  tia: "celestia",
  sei: "sei-network",
  inj: "injective-protocol",
  bera: "berachain-bera",
  monad: "monad",
  paxg: "pax-gold",
  xaut: "tether-gold",
  pepe: "pepe",
  shib: "shiba-inu",
};

interface PriceCache { [ticker: string]: number }

async function fetchPrices(tickers: string[]): Promise<PriceCache> {
  const cache: PriceCache = { btc: 0 };
  // Always need BTC (denominator)
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
    credited: 0,
    skipped_no_ref: 0,
    skipped_no_partner: 0,
    skipped_already_paid: 0,
    skipped_no_price: 0,
    errors: 0,
    total_btc_credited: 0,
  };

  try {
    // 1) Pull recent swaps with a ref_code (last 30 days, up to 500/run)
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
      return new Response(JSON.stringify({ ok: true, ...result, message: "no swaps to scan" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 2) Filter out already-credited swaps
    const swapIds = swaps.map(s => s.id);
    const { data: existing } = await supabase
      .from("partner_commissions")
      .select("swap_transaction_id")
      .in("swap_transaction_id", swapIds);
    const credited = new Set((existing ?? []).map(e => e.swap_transaction_id));
    const pending = swaps.filter(s => !credited.has(s.id));
    result.skipped_already_paid = swaps.length - pending.length;

    if (pending.length === 0) {
      return new Response(JSON.stringify({ ok: true, ...result, message: "all already credited" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 3) Resolve ref_code → partner_id (via referral_code or claimed affiliate widget)
    const refCodes = [...new Set(pending.map(s => s.ref_code as string))];
    const [{ data: profilesByRef }, { data: leadsByRef }] = await Promise.all([
      supabase.from("partner_profiles").select("id, referral_code").in("referral_code", refCodes),
      supabase.from("affiliate_leads").select("partner_id, ref_token").in("ref_token", refCodes).not("partner_id", "is", null),
    ]);

    const refToPartner = new Map<string, string>();
    for (const p of profilesByRef ?? []) refToPartner.set(p.referral_code, p.id);
    for (const l of leadsByRef ?? []) {
      if (l.partner_id && !refToPartner.has(l.ref_token)) refToPartner.set(l.ref_token, l.partner_id);
    }

    // 4) Resolve source label per ref (referral_link vs affiliate_widget)
    const refSource = new Map<string, string>();
    for (const p of profilesByRef ?? []) refSource.set(p.referral_code, "referral_link");
    for (const l of leadsByRef ?? []) {
      if (l.partner_id && !refSource.has(l.ref_token)) refSource.set(l.ref_token, "affiliate_widget");
    }

    // 5) Pre-fetch USD prices for all from_currencies in pending swaps
    const tickers = [...new Set(pending.map(s => s.from_currency))];
    const prices = await fetchPrices(tickers);
    const btcUsd = prices.btc || 0;
    if (btcUsd <= 0) {
      return new Response(JSON.stringify({ ok: false, ...result, error: "BTC price unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 6) Walk each pending swap, credit
    const balanceDeltas = new Map<string, number>(); // partner_id → +btc

    for (const s of pending) {
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
      });

      if (insErr) {
        // 23505 unique violation = race; treat as already credited
        if ((insErr as any).code === "23505") { result.skipped_already_paid++; continue; }
        console.error("[credit-affiliate-commissions] insert failed", insErr);
        result.errors++;
        continue;
      }

      balanceDeltas.set(partnerId, (balanceDeltas.get(partnerId) ?? 0) + commissionBtc);
      result.credited++;
      result.total_btc_credited += commissionBtc;
    }

    // 7) Apply balance deltas (upsert + add)
    for (const [partnerId, delta] of balanceDeltas) {
      const { data: bal } = await supabase
        .from("partner_balances")
        .select("id, available_btc, total_earned_btc")
        .eq("partner_id", partnerId)
        .maybeSingle();

      if (bal) {
        await supabase.from("partner_balances").update({
          available_btc: Number(bal.available_btc) + delta,
          total_earned_btc: Number(bal.total_earned_btc) + delta,
          last_credited_at: new Date().toISOString(),
        }).eq("id", bal.id);
      } else {
        await supabase.from("partner_balances").insert({
          partner_id: partnerId,
          available_btc: delta,
          pending_btc: 0,
          total_earned_btc: delta,
          last_credited_at: new Date().toISOString(),
        });
      }
    }

    return new Response(JSON.stringify({ ok: true, ...result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("[credit-affiliate-commissions] fatal", err);
    return new Response(JSON.stringify({ ok: false, error: String(err), ...result }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
