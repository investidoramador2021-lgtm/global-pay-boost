import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRightLeft, ShoppingCart, Banknote, ShieldCheck, Link2,
  FileText, Landmark, PiggyBank, TrendingUp, Activity, DollarSign, Coins,
} from "lucide-react";

/**
 * Estimated revenue per product line (as a % of notional volume).
 * These mirror the public fee schedule + partner commission deals:
 *   - Swap / Private / Bridge: 0.5% spread captured in the quote
 *   - Buy (fiat on-ramp):      1.0% margin from Guardarian/SimpleSwap
 *   - Sell (off-ramp):         1.0% margin
 *   - Invoice:                 0.5% receiver fee (already explicit)
 *   - Loan origination:        1.5% partner commission on principal
 *   - Earn deposits:           0.75% annualized partner share
 * Tunable in one place if the deals change.
 */
const REVENUE_RATE: Record<string, number> = {
  swap: 0.005,
  buy: 0.010,
  sell: 0.010,
  private: 0.005,
  bridge: 0.005,
  invoice: 0.005,
  loan: 0.015,
  earn: 0.0075,
};

/**
 * Aggregated KPI summary across every widget tab:
 *   Exchange (swap) · Buy · Sell · Private · Bridge · Invoice · Loan · Earn
 *
 * Pulls counts + volume from `swap_transactions` (segmented via the new `kind`
 * column) plus `invoices` and `lend_earn_transactions` for the financial
 * products. Values are computed client-side; no extra RPC required.
 */

interface SwapRow {
  kind: string | null;
  amount: number | null;
  from_currency: string | null;
  to_currency: string | null;
  created_at: string;
}

interface InvoiceRow {
  fiat_amount: number | null;
  status: string | null;
  created_at: string;
}

interface LendRow {
  tx_type: string;
  amount: number | null;
  loan_amount: number | null;
  currency: string | null;
  created_at: string;
}

interface KindStats {
  count: number;
  volume: number;
  last7d: number;
}

const ZERO: KindStats = { count: 0, volume: 0, last7d: 0 };

function within(iso: string, days: number): boolean {
  const t = new Date(iso).getTime();
  return Date.now() - t < days * 24 * 60 * 60 * 1000;
}
function withinToday(iso: string): boolean {
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}
const within7d = (iso: string) => within(iso, 7);

const TILE_DEFS: Array<{
  key: "swap" | "buy" | "sell" | "private" | "bridge" | "invoice" | "loan" | "earn";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  description: string;
}> = [
  { key: "swap",    label: "Exchange",  icon: ArrowRightLeft, accent: "text-primary",        description: "Crypto-to-crypto swaps" },
  { key: "buy",     label: "Buy",       icon: ShoppingCart,   accent: "text-emerald-400",    description: "Fiat on-ramp purchases" },
  { key: "sell",    label: "Sell",      icon: Banknote,       accent: "text-amber-400",      description: "Crypto-to-fiat off-ramp" },
  { key: "private", label: "Private",   icon: ShieldCheck,    accent: "text-violet-400",     description: "Shielded private transfers" },
  { key: "bridge",  label: "Bridge",    icon: Link2,          accent: "text-cyan-400",       description: "Permanent fixed-rate addresses" },
  { key: "invoice", label: "Invoices",  icon: FileText,       accent: "text-blue-400",       description: "Invoice payment requests" },
  { key: "loan",    label: "Loans",     icon: Landmark,       accent: "text-orange-400",     description: "Collateralized borrowing" },
  { key: "earn",    label: "Earn",      icon: PiggyBank,      accent: "text-pink-400",       description: "Yield-bearing deposits" },
];

const DashboardSummary = () => {
  const [loading, setLoading] = useState(true);
  const [swaps, setSwaps] = useState<SwapRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [lend, setLend] = useState<LendRow[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    let active = true;
    (async () => {
      const [swapRes, invRes, leRes, pxRes] = await Promise.all([
        supabase
          .from("swap_transactions")
          .select("kind, amount, from_currency, to_currency, created_at")
          .order("created_at", { ascending: false })
          .limit(5000),
        supabase
          .from("invoices")
          .select("fiat_amount, status, created_at")
          .order("created_at", { ascending: false })
          .limit(2000),
        supabase
          .from("lend_earn_transactions" as any)
          .select("tx_type, amount, loan_amount, currency, created_at")
          .order("created_at", { ascending: false })
          .limit(2000),
        supabase.functions.invoke("coingecko-prices", {
          body: { tickers: ["btc","eth","sol","usdt","usdc","xrp","doge","bnb","trx","ada","ltc","matic","dot","avax","link"] },
        }).catch(() => ({ data: null })),
      ]);
      if (!active) return;
      setSwaps((swapRes.data || []) as SwapRow[]);
      setInvoices((invRes.data || []) as InvoiceRow[]);
      setLend((leRes.data || []) as unknown as LendRow[]);
      const px = (pxRes as any)?.data?.prices || (pxRes as any)?.data || {};
      const norm: Record<string, number> = {};
      for (const k of Object.keys(px || {})) norm[k.toUpperCase()] = Number(px[k]) || 0;
      // sane fallbacks for stables
      norm.USDT = norm.USDT || 1; norm.USDC = norm.USDC || 1; norm.DAI = norm.DAI || 1; norm.PYUSD = norm.PYUSD || 1;
      setPrices(norm);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const btcUsd = prices.BTC || 0;
  const usdOf = (ticker: string | null | undefined, amount: number): number => {
    if (!amount) return 0;
    const t = (ticker || "").toUpperCase();
    if (!t) return 0;
    const px = prices[t];
    if (px && Number.isFinite(px)) return amount * px;
    // unknown asset → ignore (avoids garbage inflation)
    return 0;
  };

  const stats = useMemo<Record<string, KindStats>>(() => {
    const map: Record<string, KindStats> = {
      swap: { ...ZERO }, buy: { ...ZERO }, sell: { ...ZERO },
      private: { ...ZERO }, bridge: { ...ZERO },
      invoice: { ...ZERO }, loan: { ...ZERO }, earn: { ...ZERO },
    };

    // swap_transactions grouped by `kind`
    for (const row of swaps) {
      const k = (row.kind || "swap").toLowerCase();
      const target = map[k] ?? map.swap;
      target.count += 1;
      target.volume += Number(row.amount) || 0;
      if (within7d(row.created_at)) target.last7d += 1;
    }

    // Invoices
    for (const row of invoices) {
      map.invoice.count += 1;
      map.invoice.volume += Number(row.fiat_amount) || 0;
      if (within7d(row.created_at)) map.invoice.last7d += 1;
    }

    // Lend / Earn
    for (const row of lend) {
      const isLoan = row.tx_type === "loan";
      const target = isLoan ? map.loan : map.earn;
      target.count += 1;
      target.volume += Number(isLoan ? row.loan_amount : row.amount) || 0;
      if (within7d(row.created_at)) target.last7d += 1;
    }
    return map;
  }, [swaps, invoices, lend]);

  // Headline aggregates (combine all 8 product lines)
  const totalTxs = useMemo(
    () => Object.values(stats).reduce((s, v) => s + v.count, 0),
    [stats],
  );
  const totalLast7d = useMemo(
    () => Object.values(stats).reduce((s, v) => s + v.last7d, 0),
    [stats],
  );
  const cryptoVolume = useMemo(
    () => stats.swap.volume + stats.private.volume + stats.bridge.volume,
    [stats],
  );
  const fiatVolume = useMemo(
    () => stats.buy.volume + stats.sell.volume + stats.invoice.volume + stats.loan.volume + stats.earn.volume,
    [stats],
  );

  // ============== REVENUE TRACKING ==============
  // Convert each transaction's notional volume into USD using live prices,
  // then apply the per-product fee rate. Bucket into today / 7d / 30d / all-time.
  type RevenueBucket = { today: number; d7: number; d30: number; all: number };
  const emptyBucket = (): RevenueBucket => ({ today: 0, d7: 0, d30: 0, all: 0 });

  const revenue = useMemo(() => {
    const r: Record<string, RevenueBucket> = {
      swap: emptyBucket(), buy: emptyBucket(), sell: emptyBucket(),
      private: emptyBucket(), bridge: emptyBucket(),
      invoice: emptyBucket(), loan: emptyBucket(), earn: emptyBucket(),
    };
    const add = (key: string, usd: number, iso: string) => {
      const fee = usd * (REVENUE_RATE[key] || 0);
      if (!fee) return;
      r[key].all += fee;
      if (within(iso, 30)) r[key].d30 += fee;
      if (within(iso, 7))  r[key].d7  += fee;
      if (withinToday(iso)) r[key].today += fee;
    };
    for (const row of swaps) {
      const k = (row.kind || "swap").toLowerCase();
      if (!r[k]) continue;
      // For fiat on/off-ramp the `amount` is already in fiat units
      const usd = (k === "buy" || k === "sell")
        ? Number(row.amount) || 0
        : usdOf(row.from_currency, Number(row.amount) || 0);
      add(k, usd, row.created_at);
    }
    for (const row of invoices) {
      add("invoice", Number(row.fiat_amount) || 0, row.created_at);
    }
    for (const row of lend) {
      const isLoan = row.tx_type === "loan";
      const notional = Number(isLoan ? row.loan_amount : row.amount) || 0;
      const usd = usdOf(row.currency, notional) || notional; // assume USD if unknown stable
      add(isLoan ? "loan" : "earn", usd, row.created_at);
    }
    return r;
  }, [swaps, invoices, lend, prices]);

  const revenueTotals = useMemo<RevenueBucket>(() => {
    const totals = emptyBucket();
    for (const v of Object.values(revenue)) {
      totals.today += v.today; totals.d7 += v.d7; totals.d30 += v.d30; totals.all += v.all;
    }
    return totals;
  }, [revenue]);

  const formatNum = (n: number, max = 2) =>
    n.toLocaleString("en-US", { maximumFractionDigits: max, minimumFractionDigits: max === 0 ? 0 : 0 });
  const fmtUsd = (n: number) => `$${formatNum(n, 2)}`;
  const fmtBtc = (n: number) => btcUsd > 0 ? `${formatNum(n / btcUsd, 6)} BTC` : "— BTC";

  return (
    <div className="space-y-6">
      {/* Headline KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center gap-3">
            <Activity className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Total transactions</p>
              <p className="text-2xl font-bold text-foreground">{loading ? "…" : formatNum(totalTxs, 0)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
              <p className="text-2xl font-bold text-foreground">{loading ? "…" : formatNum(totalLast7d, 0)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center gap-3">
            <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-xs text-muted-foreground">Crypto volume (units)</p>
              <p className="text-xl font-bold text-foreground">{loading ? "…" : formatNum(cryptoVolume, 4)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center gap-3">
            <Banknote className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-xs text-muted-foreground">Fiat-linked volume</p>
              <p className="text-xl font-bold text-foreground">${loading ? "…" : formatNum(fiatVolume, 2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estimated Revenue */}
      <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" /> Estimated Revenue
            <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground font-normal">
              fees + spread · live BTC ${btcUsd ? formatNum(btcUsd, 0) : "—"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Headline buckets */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {([
              { label: "Today",     value: revenueTotals.today, icon: TrendingUp },
              { label: "Last 7d",   value: revenueTotals.d7,    icon: Activity },
              { label: "Last 30d",  value: revenueTotals.d30,   icon: DollarSign },
              { label: "All-time",  value: revenueTotals.all,   icon: Coins },
            ] as const).map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-lg border border-border/40 bg-background/40 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {loading ? "…" : fmtUsd(value)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 tabular-nums">
                  ≈ {loading ? "…" : fmtBtc(value)}
                </p>
              </div>
            ))}
          </div>

          {/* Per-product revenue table */}
          <div className="overflow-x-auto rounded-lg border border-border/40">
            <table className="w-full text-sm">
              <thead className="bg-background/40">
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 px-3">Product</th>
                  <th className="py-2 px-3 text-right">Today</th>
                  <th className="py-2 px-3 text-right">7d</th>
                  <th className="py-2 px-3 text-right">30d</th>
                  <th className="py-2 px-3 text-right">All-time</th>
                  <th className="py-2 px-3 text-right">All (BTC)</th>
                </tr>
              </thead>
              <tbody>
                {TILE_DEFS.map((def) => {
                  const r = revenue[def.key] || emptyBucket();
                  const Icon = def.icon;
                  return (
                    <tr key={def.key} className="border-t border-border/30 hover:bg-background/30">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${def.accent}`} />
                          <span className="font-medium text-foreground">{def.label}</span>
                          <span className="text-[10px] text-muted-foreground">
                            ({(REVENUE_RATE[def.key] * 100).toFixed(2)}%)
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums text-foreground">{loading ? "…" : fmtUsd(r.today)}</td>
                      <td className="py-2 px-3 text-right tabular-nums text-foreground">{loading ? "…" : fmtUsd(r.d7)}</td>
                      <td className="py-2 px-3 text-right tabular-nums text-foreground">{loading ? "…" : fmtUsd(r.d30)}</td>
                      <td className="py-2 px-3 text-right tabular-nums font-semibold text-foreground">{loading ? "…" : fmtUsd(r.all)}</td>
                      <td className="py-2 px-3 text-right tabular-nums text-muted-foreground">{loading ? "…" : fmtBtc(r.all)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-muted-foreground/70">
            Estimated using public fee schedule × notional volume × live spot prices. Actual settlements may vary.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" /> Widget Activity Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TILE_DEFS.map((def) => {
              const s = stats[def.key] || ZERO;
              const Icon = def.icon;
              const isFiat = def.key === "buy" || def.key === "sell" || def.key === "invoice" || def.key === "loan" || def.key === "earn";
              return (
                <div
                  key={def.key}
                  className="rounded-lg border border-border/40 bg-background/40 p-4 hover:bg-background/60 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${def.accent}`} />
                      <span className="text-sm font-medium text-foreground">{def.label}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {s.last7d}/7d
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    {loading ? "…" : formatNum(s.count, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 tabular-nums">
                    Vol: {isFiat ? "$" : ""}{loading ? "…" : formatNum(s.volume, isFiat ? 2 : 4)}
                  </p>
                  <p className="text-[11px] text-muted-foreground/70 mt-2 leading-snug">
                    {def.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSummary;
