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

  useEffect(() => {
    let active = true;
    (async () => {
      const [swapRes, invRes, leRes] = await Promise.all([
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
      ]);
      if (!active) return;
      setSwaps((swapRes.data || []) as SwapRow[]);
      setInvoices((invRes.data || []) as InvoiceRow[]);
      setLend((leRes.data || []) as unknown as LendRow[]);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

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

  const formatNum = (n: number, max = 2) =>
    n.toLocaleString("en-US", { maximumFractionDigits: max, minimumFractionDigits: max === 0 ? 0 : 0 });

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

      {/* Per-widget breakdown */}
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
