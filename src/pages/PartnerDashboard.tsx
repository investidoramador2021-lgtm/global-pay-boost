import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import {
  Copy, LogOut, TrendingUp, Check, RefreshCw, Clock, CheckCircle2,
  XCircle, ArrowRightLeft, AlertTriangle, Wallet, Lock, Search, Filter,
  Activity, Key, ChevronDown, ChevronUp, Loader2, Shield,
} from "lucide-react";

/* ── Obsidian Design Tokens ── */
const OBS = {
  bg: "#0B0D10",
  card: "rgba(255,255,255,0.03)",
  border: "rgba(192,192,192,0.12)",
  text: "#E8E8E8",
  muted: "#6B7280",
  accent: "#3B82F6",
  success: "#22D3EE",
  danger: "#EF4444",
} as const;

/* ── Types ── */
interface LiveStatus { status: string; amountSend: number | null; amountReceive: number | null; payinHash: string | null; payoutHash: string | null; }
interface SwapRow { id: string; transaction_id: string; from_currency: string; to_currency: string; amount: number; recipient_address: string; payin_address: string; created_at: string; ref_code: string | null; live?: LiveStatus; }
interface PartnerProfile { id: string; first_name: string; last_name: string; btc_wallet: string; referral_code: string; verification_status: string; }
interface PartnerTx { id: string; partner_id: string; asset: string; volume: number; commission_btc: number; completed_at: string; is_paid: boolean; paid_at: string | null; }

/* ── Status Pipeline Steps ── */
const PIPELINE = ["waiting", "confirming", "exchanging", "sending", "finished"] as const;
const STATUS_LABELS: Record<string, string> = {
  waiting: "Confirming Deposit",
  confirming: "Deposit Confirmed",
  exchanging: "Liquidity Sourced",
  sending: "Payout Initiated",
  finished: "Complete",
  failed: "Failed",
  refunded: "Refunded",
  expired: "Expired",
};

function StatusPipeline({ status }: { status?: string }) {
  const current = status?.toLowerCase() || "waiting";
  const isFailed = ["failed", "refunded", "expired"].includes(current);
  const activeIdx = PIPELINE.indexOf(current as typeof PIPELINE[number]);

  if (isFailed) {
    return (
      <div className="flex items-center gap-2">
        <XCircle className="w-4 h-4" style={{ color: OBS.danger }} />
        <span className="text-xs font-medium" style={{ color: OBS.danger }}>{STATUS_LABELS[current] || current}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {PIPELINE.map((step, i) => {
        const done = i <= activeIdx;
        const isCurrent = i === activeIdx;
        return (
          <div key={step} className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${isCurrent ? "animate-pulse" : ""}`}
              style={{ background: done ? OBS.success : "rgba(255,255,255,0.1)" }}
              title={STATUS_LABELS[step]}
            />
            {i < PIPELINE.length - 1 && (
              <div className="w-4 h-px" style={{ background: done ? OBS.success : "rgba(255,255,255,0.1)" }} />
            )}
          </div>
        );
      })}
      <span className="text-xs ms-2" style={{ color: activeIdx >= 0 ? OBS.success : OBS.muted }}>
        {STATUS_LABELS[current] || current}
      </span>
    </div>
  );
}

/* ── 2FA Challenge Gate ── */
function TOTPGate({ onPass }: { onPass: () => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-totp?action=verify`,
        { method: "POST", headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY }, body: JSON.stringify({ code }) }
      );
      const data = await resp.json();
      if (data.valid) onPass();
      else toast({ title: t("portal.invalidCode", "Invalid code"), variant: "destructive" });
    } catch (e: any) { toast({ title: e.message, variant: "destructive" }); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: OBS.bg }}>
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3B82F6, #22D3EE)" }}>
            <Shield className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-semibold" style={{ color: OBS.text }}>{t("portal.2faChallenge", "Two-Factor Authentication")}</h1>
          <p className="mt-2 text-sm" style={{ color: OBS.muted }}>{t("portal.enter2fa", "Enter the code from your authenticator app")}</p>
        </div>
        <div className="rounded-xl p-6 space-y-5" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}`, backdropFilter: "blur(20px)" }}>
          <Input
            value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6} placeholder="000000" autoFocus
            className="border-0 bg-white/5 text-white text-center text-2xl tracking-[0.5em] font-mono placeholder:text-gray-700 focus-visible:ring-1 focus-visible:ring-cyan-500/50"
          />
          <Button onClick={verify} disabled={loading || code.length !== 6} className="w-full h-11 bg-white text-black hover:bg-gray-200 transition-all duration-100 font-medium">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("portal.verify", "Verify")}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  MAIN DASHBOARD                                           */
/* ────────────────────────────────────────────────────────── */
function DashboardContent() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [swaps, setSwaps] = useState<SwapRow[]>([]);
  const [commissions, setCommissions] = useState<PartnerTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"wallet" | "txid">("txid");
  const idleRef = useRef<ReturnType<typeof setTimeout>>();

  // 30-min idle timeout
  useEffect(() => {
    const reset = () => {
      clearTimeout(idleRef.current);
      idleRef.current = setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/partners");
        toast({ title: t("portal.sessionExpired", "Session expired due to inactivity"), variant: "destructive" });
      }, 30 * 60 * 1000);
    };
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(e => window.addEventListener(e, reset));
    reset();
    return () => { clearTimeout(idleRef.current); events.forEach(e => window.removeEventListener(e, reset)); };
  }, [navigate, toast, t]);

  const fetchLiveStatuses = useCallback(async (rows: SwapRow[]) => {
    if (rows.length === 0) return;
    setStatusLoading(true);
    const updated = [...rows];
    for (let i = 0; i < rows.length; i += 5) {
      const batch = rows.slice(i, i + 5);
      const results = await Promise.allSettled(
        batch.map(async (row) => {
          const { data } = await supabase.functions.invoke("changenow", { method: "POST", body: { _get: true, action: "tx-status", id: row.transaction_id } });
          return { txId: row.transaction_id, data };
        })
      );
      results.forEach((r) => {
        if (r.status === "fulfilled" && r.value.data && !r.value.data.error) {
          const idx = updated.findIndex(s => s.transaction_id === r.value.txId);
          if (idx !== -1) updated[idx] = { ...updated[idx], live: { status: r.value.data.status, amountSend: r.value.data.amountSend, amountReceive: r.value.data.amountReceive, payinHash: r.value.data.payinHash, payoutHash: r.value.data.payoutHash } };
        }
      });
      setSwaps([...updated]);
    }
    setStatusLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/partners"); return; }
      const { data: p } = await supabase.from("partner_profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (!p) { navigate("/partners"); return; }
      if ((p as PartnerProfile).verification_status !== "active") {
        toast({ title: "Account not verified", variant: "destructive" });
        await supabase.auth.signOut();
        navigate("/partners?mode=login");
        return;
      }
      setProfile(p as PartnerProfile);
      const [swapRes, commRes] = await Promise.all([
        supabase.from("swap_transactions").select("*").eq("ref_code", (p as PartnerProfile).referral_code).order("created_at", { ascending: false }),
        supabase.from("partner_transactions").select("*").eq("partner_id", (p as PartnerProfile).id).order("completed_at", { ascending: false }),
      ]);
      const rows = (swapRes.data || []) as SwapRow[];
      setSwaps(rows);
      setCommissions((commRes.data || []) as PartnerTx[]);
      setLoading(false);
      fetchLiveStatuses(rows);
    })();
  }, [navigate, fetchLiveStatuses, toast]);

  const totalVolume = useMemo(() => commissions.reduce((a, t) => a + t.volume, 0), [commissions]);
  const totalCommission = useMemo(() => commissions.reduce((a, t) => a + t.commission_btc, 0), [commissions]);
  const finishedSwaps = useMemo(() => swaps.filter(s => s.live?.status === "finished"), [swaps]);
  const conversionRate = swaps.length > 0 ? ((finishedSwaps.length / swaps.length) * 100).toFixed(1) : "0";
  const referralLink = profile ? `https://mrcglobalpay.com/?ref=${profile.referral_code}` : "";

  const filteredSwaps = useMemo(() => {
    if (!searchQuery.trim()) return swaps;
    const q = searchQuery.toLowerCase().trim();
    return swaps.filter(s => {
      if (searchType === "txid") return s.transaction_id.toLowerCase().includes(q);
      return s.recipient_address.toLowerCase().includes(q) || s.payin_address.toLowerCase().includes(q);
    });
  }, [swaps, searchQuery, searchType]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/partners"); };
  const copyLink = () => { navigator.clipboard.writeText(referralLink); toast({ title: "Copied" }); };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: OBS.bg }}><Loader2 className="w-8 h-8 animate-spin" style={{ color: OBS.muted }} /></div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center" style={{ background: OBS.bg }}><p style={{ color: OBS.muted }}>Partner profile not found.</p></div>;

  const kpis = [
    { label: t("portal.networkVolume", "Network Volume"), value: `$${totalVolume.toLocaleString("en", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: OBS.accent },
    { label: t("portal.accruedCommission", "Accrued Commission"), value: `${totalCommission.toFixed(8)} BTC`, icon: Activity, color: OBS.success },
    { label: t("portal.conversionRate", "Conversion Rate"), value: `${conversionRate}%`, icon: RefreshCw, color: "#A78BFA" },
    { label: "Referred Swaps", value: swaps.length.toString(), icon: ArrowRightLeft, color: "#FBBF24" },
  ];

  return (
    <div className="min-h-screen" style={{ background: OBS.bg }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `0.5px solid ${OBS.border}` }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3B82F6, #22D3EE)" }}>
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-sm font-medium" style={{ color: OBS.text }}>{profile.first_name} {profile.last_name}</span>
          <code className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", color: OBS.muted }}>{profile.referral_code}</code>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={copyLink} className="text-xs flex items-center gap-1 px-2 py-1 rounded" style={{ color: OBS.muted, background: "rgba(255,255,255,0.05)" }}>
            <Copy className="w-3 h-3" /> Referral Link
          </button>
          <Button onClick={handleLogout} variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5">
            <LogOut className="w-4 h-4 me-1.5" />{t("portal.logout", "Logout")}
          </Button>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(k => (
            <div key={k.label} className="rounded-xl p-5" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}`, backdropFilter: "blur(20px)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider" style={{ color: OBS.muted }}>{k.label}</span>
                <k.icon className="w-4 h-4" style={{ color: k.color }} />
              </div>
              <span className="text-2xl font-semibold font-mono" style={{ color: OBS.text }}>{k.value}</span>
            </div>
          ))}
        </div>

        {/* Tabs: Transaction Search + Earnings + Account */}
        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="bg-white/5 border-0">
            <TabsTrigger value="search" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
              <Search className="w-4 h-4 me-1.5" />{t("portal.txMonitor", "Transaction Search")}
            </TabsTrigger>
            <TabsTrigger value="earnings" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
              <TrendingUp className="w-4 h-4 me-1.5" />Earnings
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
              <Lock className="w-4 h-4 me-1.5" />Account
            </TabsTrigger>
          </TabsList>

          {/* ── TRANSACTION SEARCH ── */}
          <TabsContent value="search" className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-lg overflow-hidden" style={{ border: `0.5px solid ${OBS.border}` }}>
                <button onClick={() => setSearchType("txid")} className="px-3 py-2 text-xs font-medium transition-colors" style={{ background: searchType === "txid" ? "rgba(255,255,255,0.1)" : "transparent", color: searchType === "txid" ? OBS.text : OBS.muted }}>
                  TXID
                </button>
                <button onClick={() => setSearchType("wallet")} className="px-3 py-2 text-xs font-medium transition-colors" style={{ background: searchType === "wallet" ? "rgba(255,255,255,0.1)" : "transparent", color: searchType === "wallet" ? OBS.text : OBS.muted }}>
                  Wallet
                </button>
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: OBS.muted }} />
                <Input
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder={searchType === "txid" ? "Search by Transaction ID…" : "Search by wallet address…"}
                  className="ps-9 border-0 bg-white/5 text-white placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-cyan-500/50"
                />
              </div>
              {statusLoading && <RefreshCw className="w-4 h-4 animate-spin" style={{ color: OBS.muted }} />}
            </div>

            <div className="rounded-xl overflow-hidden" style={{ border: `0.5px solid ${OBS.border}` }}>
              <Table>
                <TableHeader>
                  <TableRow style={{ borderColor: OBS.border }}>
                    <TableHead className="text-xs uppercase" style={{ color: OBS.muted }}>Status</TableHead>
                    <TableHead className="text-xs uppercase" style={{ color: OBS.muted }}>ID</TableHead>
                    <TableHead className="text-xs uppercase" style={{ color: OBS.muted }}>{t("portal.pair", "Pair")}</TableHead>
                    <TableHead className="text-xs uppercase" style={{ color: OBS.muted }}>{t("portal.amount", "Amount")}</TableHead>
                    <TableHead className="text-xs uppercase" style={{ color: OBS.muted }}>{t("portal.date", "Date")}</TableHead>
                    <TableHead className="text-xs uppercase" style={{ color: OBS.muted }}></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSwaps.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-12 text-sm" style={{ color: OBS.muted }}>{t("portal.noTxs", "No transactions found.")}</TableCell></TableRow>
                  ) : filteredSwaps.map(s => (
                    <>
                      <TableRow key={s.id} className="cursor-pointer hover:bg-white/[0.02]" style={{ borderColor: OBS.border }} onClick={() => setExpandedRow(expandedRow === s.id ? null : s.id)}>
                        <TableCell><StatusPipeline status={s.live?.status} /></TableCell>
                        <TableCell className="font-mono text-xs" style={{ color: OBS.text }}>{s.transaction_id.slice(0, 10)}…</TableCell>
                        <TableCell className="text-xs" style={{ color: OBS.text }}>{s.from_currency.toUpperCase()} → {s.to_currency.toUpperCase()}</TableCell>
                        <TableCell className="font-mono text-xs" style={{ color: OBS.text }}>{s.live?.amountSend ?? s.amount}</TableCell>
                        <TableCell className="text-xs" style={{ color: OBS.muted }}>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{expandedRow === s.id ? <ChevronUp className="w-4 h-4" style={{ color: OBS.muted }} /> : <ChevronDown className="w-4 h-4" style={{ color: OBS.muted }} />}</TableCell>
                      </TableRow>
                      {expandedRow === s.id && (
                        <TableRow key={`${s.id}-detail`} style={{ borderColor: OBS.border }}>
                          <TableCell colSpan={6}>
                            <div className="p-4 rounded-lg space-y-3 text-xs" style={{ background: "rgba(0,0,0,0.3)" }}>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div><span style={{ color: OBS.muted }}>Transaction ID:</span><br /><code className="font-mono select-all" style={{ color: OBS.text }}>{s.transaction_id}</code></div>
                                <div><span style={{ color: OBS.muted }}>Recipient Wallet:</span><br /><code className="font-mono break-all select-all" style={{ color: OBS.text }}>{s.recipient_address}</code></div>
                                <div><span style={{ color: OBS.muted }}>Deposit Address:</span><br /><code className="font-mono break-all select-all" style={{ color: OBS.text }}>{s.payin_address}</code></div>
                                <div><span style={{ color: OBS.muted }}>Ref Code:</span><br /><code className="font-mono" style={{ color: OBS.success }}>{s.ref_code}</code></div>
                                {s.live?.payinHash && <div><span style={{ color: OBS.muted }}>Deposit Hash:</span><br /><code className="font-mono break-all" style={{ color: OBS.text }}>{s.live.payinHash}</code></div>}
                                {s.live?.payoutHash && <div><span style={{ color: OBS.muted }}>Payout Hash:</span><br /><code className="font-mono break-all" style={{ color: OBS.text }}>{s.live.payoutHash}</code></div>}
                                {s.live?.amountReceive && <div><span style={{ color: OBS.muted }}>Amount Received:</span><br /><span style={{ color: OBS.success }}>{s.live.amountReceive} {s.to_currency.toUpperCase()}</span></div>}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ── EARNINGS ── */}
          <TabsContent value="earnings" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Total Earned", value: `${totalCommission.toFixed(8)} BTC`, color: OBS.text },
                { label: "Paid Out", value: `${commissions.filter(c => c.is_paid).reduce((a, c) => a + c.commission_btc, 0).toFixed(8)} BTC`, color: OBS.success },
                { label: "Pending", value: `${commissions.filter(c => !c.is_paid).reduce((a, c) => a + c.commission_btc, 0).toFixed(8)} BTC`, color: "#FBBF24" },
              ].map(m => (
                <div key={m.label} className="rounded-xl p-5" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}` }}>
                  <span className="text-xs uppercase tracking-wider" style={{ color: OBS.muted }}>{m.label}</span>
                  <p className="text-lg font-bold font-mono mt-2" style={{ color: m.color }}>{m.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: `0.5px solid ${OBS.border}` }}>
              <Table>
                <TableHeader>
                  <TableRow style={{ borderColor: OBS.border }}>
                    <TableHead className="text-xs uppercase" style={{ color: OBS.muted }}>Date</TableHead>
                    <TableHead className="text-xs uppercase" style={{ color: OBS.muted }}>Asset</TableHead>
                    <TableHead className="text-xs uppercase text-right" style={{ color: OBS.muted }}>Volume</TableHead>
                    <TableHead className="text-xs uppercase text-right" style={{ color: OBS.muted }}>Commission</TableHead>
                    <TableHead className="text-xs uppercase" style={{ color: OBS.muted }}>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-sm" style={{ color: OBS.muted }}>No commission records yet.</TableCell></TableRow>
                  ) : commissions.map(c => (
                    <TableRow key={c.id} style={{ borderColor: OBS.border }}>
                      <TableCell className="text-xs" style={{ color: OBS.muted }}>{new Date(c.completed_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-xs uppercase" style={{ color: OBS.text }}>{c.asset}</TableCell>
                      <TableCell className="text-right text-xs font-mono" style={{ color: OBS.text }}>${c.volume.toLocaleString("en", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right text-xs font-mono" style={{ color: OBS.success }}>{c.commission_btc.toFixed(8)}</TableCell>
                      <TableCell>
                        {c.is_paid ? (
                          <span className="text-xs flex items-center gap-1" style={{ color: OBS.success }}><Check className="w-3 h-3" /> Paid</span>
                        ) : (
                          <span className="text-xs" style={{ color: "#FBBF24" }}>Pending</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ── ACCOUNT ── */}
          <TabsContent value="account" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl p-5 space-y-3" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}` }}>
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4" style={{ color: OBS.muted }} />
                  <span className="text-sm font-medium" style={{ color: OBS.text }}>Account Details</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span style={{ color: OBS.muted }}>Name</span><p className="font-medium mt-0.5" style={{ color: OBS.text }}>{profile.first_name} {profile.last_name}</p></div>
                  <div><span style={{ color: OBS.muted }}>Referral Code</span><p className="font-mono mt-0.5" style={{ color: OBS.success }}>{profile.referral_code}</p></div>
                </div>
                <div className="text-xs"><span style={{ color: OBS.muted }}>BTC Wallet</span><p className="font-mono break-all mt-0.5" style={{ color: OBS.text }}>{profile.btc_wallet}</p></div>
                <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.2)" }}>🔒 Identity fields are permanently locked for security.</p>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl p-5" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}` }}>
                  <span className="text-sm font-medium" style={{ color: OBS.text }}>Change Password</span>
                  <p className="text-xs mt-1 mb-3" style={{ color: OBS.muted }}>We'll email you a secure, time-limited link.</p>
                  <Button onClick={async () => {
                    const lang = localStorage.getItem("user-lang") || "en";
                    toast({ title: "Sending secure link…" });
                    try {
                      const { data } = await supabase.functions.invoke("partner-update-token", { body: { action: "generate", purpose: "password", lang } });
                      if (data?.success) toast({ title: "Link sent!", description: "Check your inbox — expires in 15 min." });
                      else toast({ title: "Error", variant: "destructive" });
                    } catch { toast({ title: "Error", variant: "destructive" }); }
                  }} className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-100 text-sm">
                    <Lock className="w-3.5 h-3.5 me-1.5" /> Change Password
                  </Button>
                </div>
                <div className="rounded-xl p-5" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}` }}>
                  <span className="text-sm font-medium" style={{ color: OBS.text }}>Update Settlement Wallet</span>
                  <p className="text-xs mt-1 mb-3" style={{ color: OBS.muted }}>Secure email link to update your BTC payout address.</p>
                  <Button onClick={async () => {
                    const lang = localStorage.getItem("user-lang") || "en";
                    toast({ title: "Sending secure link…" });
                    try {
                      const { data } = await supabase.functions.invoke("partner-update-token", { body: { action: "generate", purpose: "wallet", lang } });
                      if (data?.success) toast({ title: "Link sent!", description: "Check your inbox — expires in 15 min." });
                      else toast({ title: "Error", variant: "destructive" });
                    } catch { toast({ title: "Error", variant: "destructive" }); }
                  }} className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-100 text-sm">
                    <Wallet className="w-3.5 h-3.5 me-1.5" /> Update Wallet
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  ORCHESTRATOR — checks auth + 2FA before showing dashboard */
/* ────────────────────────────────────────────────────────── */
const PartnerDashboard = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"loading" | "totp" | "dashboard">("loading");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/partners"); return; }

      // Check if TOTP is configured for this user
      try {
        const resp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-totp?action=status`,
          { headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
        );
        const data = await resp.json();
        if (data.configured) { setPhase("totp"); }
        else { setPhase("dashboard"); } // No TOTP configured — allow in (legacy partners)
      } catch {
        setPhase("dashboard"); // If TOTP service fails, don't block
      }
    })();
  }, [navigate]);

  return (
    <>
      <Helmet>
        <title>Partner Dashboard | MRC GlobalPay</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {phase === "loading" && (
        <div className="min-h-screen flex items-center justify-center" style={{ background: OBS.bg }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: OBS.muted }} />
        </div>
      )}
      {phase === "totp" && <TOTPGate onPass={() => setPhase("dashboard")} />}
      {phase === "dashboard" && <DashboardContent />}
    </>
  );
};

export default PartnerDashboard;
