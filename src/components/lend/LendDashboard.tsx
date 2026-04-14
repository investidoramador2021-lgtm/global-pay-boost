import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Shield, TrendingUp, Wallet, Clock, AlertTriangle, Loader2,
  RefreshCw, LogOut, DollarSign, Percent, Activity, Lock,
} from "lucide-react";
import PostTransactionAuth from "./PostTransactionAuth";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface LoanPosition {
  id: string;
  status: string;
  collateral_currency: string;
  collateral_amount: number;
  loan_currency: string;
  loan_amount: number;
  ltv_percent: number;
  interest_rate: number;
  liquidation_price?: number;
  collateral_value_usd?: number;
  created_at?: string;
}

interface EarnPosition {
  id: string;
  status: string;
  currency: string;
  amount: number;
  annual_percent: number;
  earned_interest?: number;
  total_balance?: number;
  created_at?: string;
}

/* ------------------------------------------------------------------ */
/*  API Helper                                                         */
/* ------------------------------------------------------------------ */
async function coinrabbitApi(action: string, payload: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke("coinrabbit", {
    body: { action, ...payload },
  });
  if (error) throw new Error(error.message);
  return data;
}

/* ------------------------------------------------------------------ */
/*  Locale-aware number formatter                                      */
/* ------------------------------------------------------------------ */
function useLocaleFormat() {
  const { i18n } = useTranslation();
  const locale = i18n.language === "fa" ? "fa-IR" : i18n.language === "ur" ? "ur-PK" : i18n.language === "he" ? "he-IL" : i18n.language;
  return useMemo(() => ({
    usd: (v: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(v),
    num: (v: number, digits = 0) => new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(v),
    pct: (v: number, digits = 2) => new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: digits }).format(v / 100),
  }), [locale]);
}

/* ------------------------------------------------------------------ */
/*  Live Indicator                                                     */
/* ------------------------------------------------------------------ */
function LiveIndicator({ lastRefresh }: { lastRefresh: Date | null }) {
  const { t } = useTranslation();
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    if (!lastRefresh) return;
    const tick = () => setSecondsAgo(Math.floor((Date.now() - lastRefresh.getTime()) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastRefresh]);

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </span>
      <span className="text-emerald-400 font-mono">
        {t("lendDash.live", "LIVE")}
      </span>
      {lastRefresh && (
        <span className="text-muted-foreground">
          {secondsAgo < 5
            ? t("lendDash.justNow", "just now")
            : t("lendDash.secsAgo", "{{secs}}s ago", { secs: secondsAgo })}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard Component                                           */
/* ------------------------------------------------------------------ */
export default function LendDashboard() {
  const { t } = useTranslation();
  const fmt = useLocaleFormat();

  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [loans, setLoans] = useState<LoanPosition[]>([]);
  const [earns, setEarns] = useState<EarnPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Track IDs entered by guest for lookup
  const [loanIds, setLoanIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("mrc_loan_ids") || "[]"); } catch { return []; }
  });
  const [earnIds, setEarnIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("mrc_earn_ids") || "[]"); } catch { return []; }
  });
  const [newTxId, setNewTxId] = useState("");

  // ── Auth check ──
  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || "" });
      }
      setAuthChecked(true);
    };
    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || "" });
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Fetch live data ──
  const fetchPositions = useCallback(async () => {
    if (loanIds.length === 0 && earnIds.length === 0) return;
    setLoading(true);
    try {
      const loanResults = await Promise.allSettled(
        loanIds.map((id) => coinrabbitApi("loan-status", { id }))
      );
      const earnResults = await Promise.allSettled(
        earnIds.map((id) => coinrabbitApi("earn-status", { id }))
      );

      const newLoans: LoanPosition[] = [];
      loanResults.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value) {
          const d = r.value;
          newLoans.push({
            id: loanIds[i],
            status: String(d.status || "unknown"),
            collateral_currency: String(d.collateral_currency || d.deposit?.currency_code || ""),
            collateral_amount: Number(d.collateral_amount || d.deposit?.amount || 0),
            loan_currency: String(d.loan_currency || d.loan?.currency_code || "USDT"),
            loan_amount: Number(d.loan_amount || d.loan?.amount || 0),
            ltv_percent: Number(d.ltv_percent || d.ltv || 0),
            interest_rate: Number(d.interest_rate || d.interest_percent || 0),
            liquidation_price: d.liquidation_price ? Number(d.liquidation_price) : undefined,
            collateral_value_usd: d.collateral_value_usd ? Number(d.collateral_value_usd) : undefined,
            created_at: d.created_at,
          });
        }
      });

      const newEarns: EarnPosition[] = [];
      earnResults.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value) {
          const d = r.value;
          newEarns.push({
            id: earnIds[i],
            status: String(d.status || "unknown"),
            currency: String(d.currency || d.currency_code || ""),
            amount: Number(d.amount || d.deposit_amount || 0),
            annual_percent: Number(d.annual_percent || d.apy || 0),
            earned_interest: d.earned_interest ? Number(d.earned_interest) : undefined,
            total_balance: d.total_balance ? Number(d.total_balance) : undefined,
            created_at: d.created_at,
          });
        }
      });

      setLoans(newLoans);
      setEarns(newEarns);
      setLastRefresh(new Date());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [loanIds, earnIds]);

  // Fetch on mount, but only if stale (>24h since last refresh)
  useEffect(() => {
    const lastKey = "mrc_dash_last_refresh";
    const last = parseInt(localStorage.getItem(lastKey) || "0", 10);
    const ONE_DAY = 24 * 60 * 60 * 1000;
    if (Date.now() - last > ONE_DAY || last === 0) {
      fetchPositions().then(() => localStorage.setItem(lastKey, String(Date.now())));
    } else {
      // Still load cached positions on mount (single fetch, no interval)
      fetchPositions();
    }
    // No auto-refresh interval — data refreshes on user actions or once per day
  }, [fetchPositions]);

  // Save IDs to localStorage
  useEffect(() => {
    localStorage.setItem("mrc_loan_ids", JSON.stringify(loanIds));
  }, [loanIds]);
  useEffect(() => {
    localStorage.setItem("mrc_earn_ids", JSON.stringify(earnIds));
  }, [earnIds]);

  const addTxId = (type: "loan" | "earn") => {
    const id = newTxId.trim();
    if (!id) return;
    if (type === "loan" && !loanIds.includes(id)) {
      setLoanIds((prev) => [...prev, id]);
    } else if (type === "earn" && !earnIds.includes(id)) {
      setEarnIds((prev) => [...prev, id]);
    }
    setNewTxId("");
    setTimeout(fetchPositions, 300);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success(t("lendDash.loggedOut", "Signed out"));
  };

  const requireAuth = (action: string) => {
    if (!user) {
      setAuthModalOpen(true);
      toast.info(t("lendDash.loginRequired", "Sign in required to {{action}}", { action }));
      return false;
    }
    return true;
  };

  const getLtvColor = (ltv: number) =>
    ltv >= 85 ? "text-red-400" : ltv >= 75 ? "text-yellow-400" : "text-emerald-400";

  const getLtvBadge = (ltv: number) =>
    ltv >= 85
      ? { label: t("lendDash.redZone", "Red Zone"), variant: "destructive" as const }
      : ltv >= 75
        ? { label: t("lendDash.yellowZone", "Yellow Zone"), variant: "outline" as const }
        : { label: t("lendDash.safeZone", "Safe"), variant: "outline" as const };

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <LiveIndicator lastRefresh={lastRefresh} />
          <Button
            size="sm"
            variant="outline"
            onClick={fetchPositions}
            disabled={loading}
            className="border-[#D4AF37]/30 text-xs"
          >
            <RefreshCw className={`h-3 w-3 me-1 ${loading ? "animate-spin" : ""}`} />
            {t("lendDash.refresh", "Refresh")}
          </Button>
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{user.email}</span>
            <Button size="sm" variant="ghost" onClick={handleLogout} className="text-xs">
              <LogOut className="h-3 w-3 me-1" /> {t("lendDash.logout", "Sign Out")}
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={() => setAuthModalOpen(true)}
            className="bg-[#D4AF37] text-background hover:bg-[#D4AF37]/90 text-xs"
          >
            <Lock className="h-3 w-3 me-1" /> {t("lendDash.signIn", "Sign In to Manage")}
          </Button>
        )}
      </div>

      {/* Add Position ID */}
      <Card className="border-[#D4AF37]/20 bg-card/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground mb-3">
            {t("lendDash.addPosition", "Add a loan or earn position ID to track:")}
          </p>
          <div className="flex gap-2 flex-wrap">
            <Input
              value={newTxId}
              onChange={(e) => setNewTxId(e.target.value)}
              placeholder={t("lendDash.txIdPlaceholder", "Transaction ID")}
              className="border-[#D4AF37]/30 font-mono flex-1 min-w-[200px]"
            />
            <Button onClick={() => addTxId("loan")} variant="outline" className="border-[#D4AF37]/30 text-xs">
              <DollarSign className="h-3 w-3 me-1" /> {t("lendDash.addLoan", "Add Loan")}
            </Button>
            <Button onClick={() => addTxId("earn")} variant="outline" className="border-[#D4AF37]/30 text-xs">
              <Percent className="h-3 w-3 me-1" /> {t("lendDash.addEarn", "Add Earn")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {loans.length === 0 && earns.length === 0 && (
        <div className="text-center py-12">
          <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{t("lendDash.noPositions", "No active positions. Start a loan or earn above, then track it here.")}</p>
        </div>
      )}

      {/* Active Loans */}
      {loans.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#D4AF37]" />
            {t("lendDash.activeLoans", "Active Loans")}
          </h3>
          {loans.map((loan) => {
            const ltvBadge = getLtvBadge(loan.ltv_percent);
            return (
              <Card key={loan.id} className="border-[#D4AF37]/20 bg-card/50">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-[#D4AF37]/40 text-[#D4AF37] text-[10px]">
                        {loan.status.toUpperCase()}
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">ID: {loan.id.slice(0, 12)}…</span>
                    </div>
                    <Badge variant={ltvBadge.variant} className={`${getLtvColor(loan.ltv_percent)} border-current text-[10px]`}>
                      {ltvBadge.label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">{t("lendDash.collateral", "Collateral")}</div>
                      <div className="text-sm font-bold text-foreground">{loan.collateral_amount} {loan.collateral_currency.toUpperCase()}</div>
                      {loan.collateral_value_usd && (
                        <div className="text-[10px] text-muted-foreground">{fmt.usd(loan.collateral_value_usd)}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">{t("lendDash.loanAmount", "Loan Amount")}</div>
                      <div className="text-sm font-bold text-[#D4AF37]">{fmt.usd(loan.loan_amount)} {loan.loan_currency.toUpperCase()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">{t("lendDash.currentLtv", "Current LTV")}</div>
                      <div className={`text-sm font-bold font-mono ${getLtvColor(loan.ltv_percent)}`}>{loan.ltv_percent.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">{t("lendDash.liqPrice", "Liquidation Price")}</div>
                      <div className="text-sm font-bold text-red-400 font-mono">
                        {loan.liquidation_price ? `$${loan.liquidation_price.toFixed(2)}` : "—"}
                      </div>
                    </div>
                  </div>

                  {/* Auth-gated management actions */}
                  <div className="flex gap-2 flex-wrap pt-2 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => requireAuth(t("lendDash.repay", "Repay")) && toast.info(t("lendDash.comingSoon", "Coming soon — contact support"))}
                      className="text-xs border-[#D4AF37]/30"
                    >
                      <Wallet className="h-3 w-3 me-1" /> {t("lendDash.repay", "Repay")}
                      {!user && <Lock className="h-3 w-3 ms-1 text-muted-foreground" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => requireAuth(t("lendDash.topUp", "Top Up")) && toast.info(t("lendDash.comingSoon", "Coming soon — contact support"))}
                      className="text-xs border-[#D4AF37]/30"
                    >
                      <TrendingUp className="h-3 w-3 me-1" /> {t("lendDash.topUp", "Top Up")}
                      {!user && <Lock className="h-3 w-3 ms-1 text-muted-foreground" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Active Earns */}
      {earns.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Percent className="h-5 w-5 text-[#D4AF37]" />
            {t("lendDash.activeEarns", "Active Earn Positions")}
          </h3>
          {earns.map((earn) => (
            <Card key={earn.id} className="border-[#D4AF37]/20 bg-card/50">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-emerald-400/40 text-emerald-400 text-[10px]">
                      {earn.status.toUpperCase()}
                    </Badge>
                    <span className="font-mono text-xs text-muted-foreground">ID: {earn.id.slice(0, 12)}…</span>
                  </div>
                  <span className="text-xl font-bold text-[#D4AF37]">{earn.annual_percent}% APY</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase">{t("lendDash.deposited", "Deposited")}</div>
                    <div className="text-sm font-bold text-foreground">{earn.amount} {earn.currency.toUpperCase()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase">{t("lendDash.interestEarned", "Interest Earned")}</div>
                    <div className="text-sm font-bold text-emerald-400 font-mono">
                      {earn.earned_interest != null ? `+${earn.earned_interest.toFixed(6)}` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase">{t("lendDash.totalBalance", "Total Balance")}</div>
                    <div className="text-sm font-bold text-foreground font-mono">
                      {earn.total_balance != null ? earn.total_balance.toFixed(6) : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase">{t("lendDash.apy", "APY")}</div>
                    <div className="text-sm font-bold text-[#D4AF37] font-mono">{earn.annual_percent}%</div>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap pt-2 border-t border-border">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => requireAuth(t("lendDash.withdraw", "Withdraw")) && toast.info(t("lendDash.comingSoon", "Coming soon — contact support"))}
                    className="text-xs border-[#D4AF37]/30"
                  >
                    <Wallet className="h-3 w-3 me-1" /> {t("lendDash.withdraw", "Withdraw")}
                    {!user && <Lock className="h-3 w-3 ms-1 text-muted-foreground" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-lg border border-[#D4AF37]/20 bg-background/50 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#D4AF37]" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {t("lendDash.disclaimer", "Live data is sourced from our technology partner's API and refreshes every 60 seconds. Withdraw, Repay, and Top Up require a registered account. MRC GlobalPay · MSB Registration C100000015.")}
        </p>
      </div>

      {/* Auth modal */}
      <PostTransactionAuth
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthenticated={() => {
          setAuthModalOpen(false);
          toast.success(t("lendDash.authenticated", "Signed in successfully"));
        }}
      />
    </div>
  );
}
