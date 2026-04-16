import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import {
  Copy, LogOut, TrendingUp, Check, RefreshCw, Clock, CheckCircle2,
  XCircle, ArrowRightLeft, AlertTriangle, Wallet, Lock, Search,
  Activity, Key, ChevronDown, ChevronUp, Loader2, Shield,
  Link2, Code2, Terminal, Globe, Trash2, Eye, EyeOff, Plus,
  BarChart3, Menu, X,
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
interface PartnerProfile { id: string; first_name: string; last_name: string; btc_wallet: string; referral_code: string; verification_status: string; }
interface LiveStatus { status: string; amountSend: number | null; amountReceive: number | null; payinHash: string | null; payoutHash: string | null; }
interface SwapRow { id: string; transaction_id: string; from_currency: string; to_currency: string; amount: number; recipient_address: string; payin_address: string; created_at: string; ref_code: string | null; live?: LiveStatus; }
interface PartnerTx { id: string; partner_id: string; asset: string; volume: number; commission_btc: number; completed_at: string; is_paid: boolean; paid_at: string | null; status?: string; mrc_transaction_id?: string; changenow_order_id?: string; }
interface ApiKey { id: string; key_id: string; webhook_url: string; ip_whitelist: string[]; is_active: boolean; last_used_at: string | null; created_at: string; }
interface PartnerBalance { available_btc: number; pending_btc: number; total_earned_btc: number; last_credited_at: string | null; }

type Section = "overview" | "referrals" | "earnings" | "account" | "dev-setup" | "api-keys" | "api-ledger" | "webhooks" | "docs" | "payouts";

/* ── Status Pipeline ── */
const PIPELINE = ["waiting", "confirming", "exchanging", "sending", "finished"] as const;
const STATUS_LABELS: Record<string, string> = {
  waiting: "Confirming Deposit", confirming: "Deposit Confirmed", exchanging: "Liquidity Sourced",
  sending: "Payout Initiated", finished: "Complete", failed: "Failed", refunded: "Refunded", expired: "Expired",
};

function StatusPipeline({ status }: { status?: string }) {
  const current = status?.toLowerCase() || "waiting";
  const isFailed = ["failed", "refunded", "expired"].includes(current);
  const activeIdx = PIPELINE.indexOf(current as typeof PIPELINE[number]);
  if (isFailed) return <div className="flex items-center gap-2"><XCircle className="w-4 h-4" style={{ color: OBS.danger }} /><span className="text-xs font-medium" style={{ color: OBS.danger }}>{STATUS_LABELS[current] || current}</span></div>;
  return (
    <div className="flex items-center gap-1">
      {PIPELINE.map((step, i) => {
        const done = i <= activeIdx;
        return (
          <div key={step} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${i === activeIdx ? "animate-pulse" : ""}`} style={{ background: done ? OBS.success : "rgba(255,255,255,0.1)" }} title={STATUS_LABELS[step]} />
            {i < PIPELINE.length - 1 && <div className="w-4 h-px" style={{ background: done ? OBS.success : "rgba(255,255,255,0.1)" }} />}
          </div>
        );
      })}
      <span className="text-xs ms-2" style={{ color: activeIdx >= 0 ? OBS.success : OBS.muted }}>{STATUS_LABELS[current] || current}</span>
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
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-totp?action=verify`, { method: "POST", headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY }, body: JSON.stringify({ code }) });
      const data = await resp.json();
      if (data.valid) onPass();
      else toast({ title: t("portal.invalidCode", "Invalid code"), variant: "destructive" });
    } catch (e: any) { toast({ title: e.message, variant: "destructive" }); }
    setLoading(false);
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: OBS.bg }}>
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center"><div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3B82F6, #22D3EE)" }}><Shield className="w-6 h-6 text-white" /></div></div>
        <div className="text-center">
          <h1 className="text-xl font-semibold" style={{ color: OBS.text }}>{t("portal.2faChallenge", "Two-Factor Authentication")}</h1>
          <p className="mt-2 text-sm" style={{ color: OBS.muted }}>{t("portal.enter2fa", "Enter the code from your authenticator app")}</p>
        </div>
        <div className="rounded-xl p-6 space-y-5" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}`, backdropFilter: "blur(20px)" }}>
          <Input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} placeholder="000000" autoFocus className="border-0 bg-white/5 text-white text-center text-2xl tracking-[0.5em] font-mono placeholder:text-gray-700 focus-visible:ring-1 focus-visible:ring-cyan-500/50" />
          <Button onClick={verify} disabled={loading || code.length !== 6} className="w-full h-11 bg-white text-black hover:bg-gray-200 transition-all duration-100 font-medium">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("portal.verify", "Verify")}</Button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  SIDEBAR                                                    */
/* ════════════════════════════════════════════════════════════ */
function Sidebar({ active, onNavigate, isDeveloper, mobileOpen, onClose }: { active: Section; onNavigate: (s: Section) => void; isDeveloper: boolean; mobileOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const marketingItems: { id: Section; label: string; icon: typeof Link2 }[] = [
    { id: "overview", label: t("portal.overview", "Overview"), icon: BarChart3 },
    { id: "referrals", label: t("portal.referrals", "Referral Traffic"), icon: Link2 },
    { id: "earnings", label: t("portal.earnings", "Earnings"), icon: TrendingUp },
    { id: "account", label: t("portal.account", "Account"), icon: Lock },
  ];
  const devItems: { id: Section; label: string; icon: typeof Code2 }[] = [
    { id: "dev-setup", label: t("portal.devSetup", "2FA & Setup"), icon: Shield },
    { id: "api-keys", label: t("portal.apiKeys", "API Keys"), icon: Key },
    { id: "api-ledger", label: t("portal.apiLedger", "API Ledger"), icon: Terminal },
    { id: "payouts", label: t("portal.payouts", "Balances & Payouts"), icon: Wallet },
    { id: "webhooks", label: t("portal.webhooks", "Webhook Tester"), icon: Globe },
    { id: "docs", label: t("portal.docs", "API Docs"), icon: Code2 },
  ];

  const NavItem = ({ id, label, icon: Icon }: { id: Section; label: string; icon: typeof Link2 }) => (
    <button
      onClick={() => { onNavigate(id); onClose(); }}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-start"
      style={{ background: active === id ? "rgba(255,255,255,0.08)" : "transparent", color: active === id ? OBS.text : OBS.muted }}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </button>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed top-0 start-0 h-full w-60 z-50 flex flex-col transition-transform duration-200 lg:relative lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: OBS.bg, borderRight: `0.5px solid ${OBS.border}` }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-5" style={{ borderBottom: `0.5px solid ${OBS.border}` }}>
          <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3B82F6, #22D3EE)" }}>
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-sm font-semibold" style={{ color: OBS.text }}>Partner Hub</span>
          <button onClick={onClose} className="ms-auto lg:hidden"><X className="w-4 h-4" style={{ color: OBS.muted }} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Marketing Tools */}
          <div>
            <span className="text-[10px] uppercase tracking-widest px-3 mb-2 block" style={{ color: OBS.muted }}>
              {t("portal.marketingTools", "Marketing Tools")}
            </span>
            <div className="space-y-0.5">{marketingItems.map(i => <NavItem key={i.id} {...i} />)}</div>
          </div>

          {/* Developer Tools */}
          <div>
            <span className="text-[10px] uppercase tracking-widest px-3 mb-2 block" style={{ color: OBS.muted }}>
              {t("portal.developerTools", "Developer Tools")}
            </span>
            {isDeveloper ? (
              <div className="space-y-0.5">{devItems.map(i => <NavItem key={i.id} {...i} />)}</div>
            ) : (
              <div className="px-3">
                <NavItem id="dev-setup" label={t("portal.activateDev", "Activate Developer Tier")} icon={Code2} />
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  SECTION: OVERVIEW (KPI Cards)                              */
/* ════════════════════════════════════════════════════════════ */
function OverviewSection({ swapCount, totalVolume, totalCommission, conversionRate, activeKeys }: { swapCount: number; totalVolume: number; totalCommission: number; conversionRate: string; activeKeys: number }) {
  const { t } = useTranslation();
  const kpis = [
    { label: t("portal.networkVolume", "Network Volume"), value: `$${totalVolume.toLocaleString("en", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: OBS.accent },
    { label: t("portal.accruedCommission", "Accrued Commission"), value: `${totalCommission.toFixed(8)} BTC`, icon: Activity, color: OBS.success },
    { label: t("portal.conversionRate", "Conversion Rate"), value: `${conversionRate}%`, icon: RefreshCw, color: "#A78BFA" },
    { label: t("portal.referredSwaps", "Referred Swaps"), value: swapCount.toString(), icon: ArrowRightLeft, color: "#FBBF24" },
    { label: t("portal.activeKeys", "Active API Keys"), value: activeKeys.toString(), icon: Key, color: "#F472B6" },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  SECTION: REFERRAL TRAFFIC                                  */
/* ════════════════════════════════════════════════════════════ */
function ReferralSection({ referralCode, swaps, fetchLiveStatuses }: { referralCode: string; swaps: SwapRow[]; fetchLiveStatuses: (rows: SwapRow[]) => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"wallet" | "txid">("txid");
  const referralLink = `https://mrcglobalpay.com/?ref=${referralCode}`;
  const copyLink = () => { navigator.clipboard.writeText(referralLink); toast({ title: "Copied" }); };

  const filteredSwaps = useMemo(() => {
    if (!searchQuery.trim()) return swaps;
    const q = searchQuery.toLowerCase().trim();
    return swaps.filter(s => searchType === "txid" ? s.transaction_id.toLowerCase().includes(q) : (s.recipient_address.toLowerCase().includes(q) || s.payin_address.toLowerCase().includes(q)));
  }, [swaps, searchQuery, searchType]);

  return (
    <div className="space-y-6">
      {/* Referral link card */}
      <div className="rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}` }}>
        <div className="flex-1 min-w-0">
          <span className="text-xs uppercase tracking-wider block mb-1" style={{ color: OBS.muted }}>{t("portal.yourLink", "Your Referral Link")}</span>
          <code className="text-sm font-mono break-all" style={{ color: OBS.success }}>{referralLink}</code>
        </div>
        <Button onClick={copyLink} size="sm" className="bg-white text-black hover:bg-gray-200 shrink-0"><Copy className="w-3.5 h-3.5 me-1.5" />Copy</Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-lg overflow-hidden" style={{ border: `0.5px solid ${OBS.border}` }}>
          <button onClick={() => setSearchType("txid")} className="px-3 py-2 text-xs font-medium transition-colors" style={{ background: searchType === "txid" ? "rgba(255,255,255,0.1)" : "transparent", color: searchType === "txid" ? OBS.text : OBS.muted }}>TXID</button>
          <button onClick={() => setSearchType("wallet")} className="px-3 py-2 text-xs font-medium transition-colors" style={{ background: searchType === "wallet" ? "rgba(255,255,255,0.1)" : "transparent", color: searchType === "wallet" ? OBS.text : OBS.muted }}>Wallet</button>
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: OBS.muted }} />
          <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={searchType === "txid" ? "Search by Transaction ID…" : "Search by wallet address…"} className="ps-9 border-0 bg-white/5 text-white placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-cyan-500/50" />
        </div>
      </div>

      {/* Table */}
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
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  SECTION: EARNINGS                                          */
/* ════════════════════════════════════════════════════════════ */
function EarningsSection({ commissions }: { commissions: PartnerTx[] }) {
  const totalCommission = useMemo(() => commissions.reduce((a, c) => a + c.commission_btc, 0), [commissions]);
  const paidOut = useMemo(() => commissions.filter(c => c.is_paid).reduce((a, c) => a + c.commission_btc, 0), [commissions]);
  const pending = useMemo(() => commissions.filter(c => !c.is_paid).reduce((a, c) => a + c.commission_btc, 0), [commissions]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Earned", value: `${totalCommission.toFixed(8)} BTC`, color: OBS.text },
          { label: "Paid Out", value: `${paidOut.toFixed(8)} BTC`, color: OBS.success },
          { label: "Pending", value: `${pending.toFixed(8)} BTC`, color: "#FBBF24" },
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
                <TableCell>{c.is_paid ? <span className="text-xs flex items-center gap-1" style={{ color: OBS.success }}><Check className="w-3 h-3" /> Paid</span> : <span className="text-xs" style={{ color: "#FBBF24" }}>Pending</span>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  SECTION: ACCOUNT                                           */
/* ════════════════════════════════════════════════════════════ */
function AccountSection({ profile }: { profile: PartnerProfile }) {
  const { toast } = useToast();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-xl p-5 space-y-3" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}` }}>
        <div className="flex items-center gap-2 mb-1"><Lock className="w-4 h-4" style={{ color: OBS.muted }} /><span className="text-sm font-medium" style={{ color: OBS.text }}>Account Details</span></div>
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
          }} className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-100 text-sm"><Lock className="w-3.5 h-3.5 me-1.5" /> Change Password</Button>
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
          }} className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-100 text-sm"><Wallet className="w-3.5 h-3.5 me-1.5" /> Update Wallet</Button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  SECTION: DEVELOPER SETUP (2FA + Activation)                */
/* ════════════════════════════════════════════════════════════ */
function DevSetupSection({ partnerId, isDeveloper, onActivated }: { partnerId: string; isDeveloper: boolean; onActivated: () => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [totpStatus, setTotpStatus] = useState<"loading" | "not-configured" | "configured">("loading");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-totp?action=status`, { headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } });
      const data = await resp.json();
      setTotpStatus(data.configured ? "configured" : "not-configured");
    })();
  }, []);

  const setupTotp = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-totp?action=setup`, { method: "POST", headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY }, body: "{}" });
    const data = await resp.json();
    if (data.error) { toast({ title: data.error, variant: "destructive" }); } else {
      setOtpauthUrl(data.otpauthUrl); setSecret(data.secret); setBackupCodes(data.backupCodes);
    }
    setLoading(false);
  };

  const verifyTotp = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-totp?action=verify`, { method: "POST", headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY }, body: JSON.stringify({ code }) });
    const data = await resp.json();
    if (data.valid) {
      toast({ title: t("portal.2faActivated", "2FA Activated") });
      setTotpStatus("configured");
      // Create developer profile if not exists
      if (!isDeveloper) {
        await supabase.from("developer_profiles").insert({ partner_id: partnerId } as any);
        onActivated();
      }
    } else { toast({ title: t("portal.invalidCode", "Invalid code"), variant: "destructive" }); }
    setLoading(false);
  };

  const activateWithoutTotp = async () => {
    // For partners who already have TOTP configured
    setLoading(true);
    await supabase.from("developer_profiles").insert({ partner_id: partnerId } as any);
    onActivated();
    toast({ title: t("portal.devActivated", "Developer Tier activated") });
    setLoading(false);
  };

  if (totpStatus === "loading") return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" style={{ color: OBS.muted }} /></div>;

  if (isDeveloper && totpStatus === "configured") {
    return (
      <div className="rounded-xl p-6 space-y-4" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}` }}>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" style={{ color: OBS.success }} />
          <span className="text-sm font-medium" style={{ color: OBS.text }}>{t("portal.devActive", "Developer Tier Active")}</span>
        </div>
        <p className="text-xs" style={{ color: OBS.muted }}>{t("portal.devActiveDesc", "Your 2FA is configured and your developer account is active. Use the API Keys and API Ledger sections to manage your integration.")}</p>
      </div>
    );
  }

  // Not yet a developer — show activation flow
  return (
    <div className="space-y-6">
      <div className="rounded-xl p-6 space-y-4" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}` }}>
        <h3 className="text-lg font-semibold" style={{ color: OBS.text }}>{t("portal.activateDevTitle", "Activate Developer Tier")}</h3>
        <p className="text-sm" style={{ color: OBS.muted }}>{t("portal.activateDevDesc", "Enable API access to programmatically create swaps and track transactions. Requires Two-Factor Authentication for security.")}</p>

        {totpStatus === "configured" && !isDeveloper && (
          <Button onClick={activateWithoutTotp} disabled={loading} className="bg-white text-black hover:bg-gray-200 transition-all duration-100">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Code2 className="w-4 h-4 me-1.5" />{t("portal.activateNow", "Activate Developer Tier")}</>}
          </Button>
        )}

        {totpStatus === "not-configured" && !otpauthUrl && (
          <Button onClick={setupTotp} disabled={loading} className="bg-white text-black hover:bg-gray-200 transition-all duration-100">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Shield className="w-4 h-4 me-1.5" />{t("portal.setup2faFirst", "Set Up 2FA to Activate")}</>}
          </Button>
        )}
      </div>

      {otpauthUrl && (
        <div className="rounded-xl p-6 space-y-6" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}`, backdropFilter: "blur(20px)" }}>
          <div className="flex justify-center"><div className="bg-white p-3 rounded-lg"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`} alt="TOTP QR Code" width={200} height={200} /></div></div>
          {secret && (
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wider" style={{ color: OBS.muted }}>{t("portal.manualKey", "Manual Key")}</Label>
              <code className="block w-full p-3 rounded-lg text-xs font-mono break-all select-all" style={{ background: "rgba(255,255,255,0.05)", color: OBS.success }}>{secret}</code>
            </div>
          )}
          {backupCodes.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wider" style={{ color: OBS.muted }}>{t("portal.backupCodes", "Backup Codes — Save These")}</Label>
              <div className="grid grid-cols-2 gap-1.5">{backupCodes.map((c, i) => <code key={i} className="p-2 rounded text-xs font-mono text-center" style={{ background: "rgba(255,255,255,0.05)", color: OBS.text }}>{c}</code>)}</div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider" style={{ color: OBS.muted }}>{t("portal.enterCode", "Enter 6-Digit Code")}</Label>
            <Input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} placeholder="000000" className="border-0 bg-white/5 text-white text-center text-2xl tracking-[0.5em] font-mono placeholder:text-gray-700 focus-visible:ring-1 focus-visible:ring-cyan-500/50" />
          </div>
          <Button onClick={verifyTotp} disabled={loading || code.length !== 6} className="w-full h-11 bg-white text-black hover:bg-gray-200 transition-all duration-100 font-medium">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("portal.activate2fa", "Activate 2FA & Developer Tier")}
          </Button>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  SECTION: API KEYS                                          */
/* ════════════════════════════════════════════════════════════ */
function ApiKeysSection({ partnerId }: { partnerId: string }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newSecret, setNewSecret] = useState<{ key_id: string; api_secret: string } | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [ipWhitelist, setIpWhitelist] = useState("");

  const fetchKeys = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-api-keys?action=list`, { headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } });
    const data = await resp.json();
    setKeys(data.keys || []);
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const generateKey = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-api-keys?action=generate`, { method: "POST", headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY }, body: "{}" });
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      setNewSecret({ key_id: data.key_id, api_secret: data.api_secret });
      fetchKeys();
    } catch (e: any) { toast({ title: e.message, variant: "destructive" }); }
    setLoading(false);
  };

  const revokeKey = async (keyId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-api-keys?action=revoke`, { method: "POST", headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY }, body: JSON.stringify({ key_id: keyId }) });
    toast({ title: t("portal.keyRevoked", "API key revoked") });
    fetchKeys();
  };

  const updateKey = async (keyId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-api-keys?action=update`, { method: "POST", headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY }, body: JSON.stringify({ key_id: keyId, webhook_url: webhookUrl, ip_whitelist: ipWhitelist.split(",").map(s => s.trim()).filter(Boolean) }) });
    toast({ title: t("portal.keyUpdated", "Configuration saved") });
    setEditingKey(null);
    fetchKeys();
  };

  return (
    <div className="space-y-6">
      {newSecret && (
        <div className="rounded-xl p-5 space-y-3" style={{ background: "rgba(34,211,238,0.05)", border: `0.5px solid rgba(34,211,238,0.3)` }}>
          <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" style={{ color: OBS.success }} /><span className="text-sm font-medium" style={{ color: OBS.success }}>{t("portal.saveSecret", "Save this secret — it won't be shown again")}</span></div>
          <div className="space-y-2">
            <div><span className="text-xs" style={{ color: OBS.muted }}>Partner ID</span><code className="block p-2.5 rounded-lg text-sm font-mono mt-1" style={{ background: "rgba(0,0,0,0.4)", color: OBS.text }}>{newSecret.key_id}</code></div>
            <div>
              <span className="text-xs" style={{ color: OBS.muted }}>API Secret</span>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 p-2.5 rounded-lg text-sm font-mono break-all" style={{ background: "rgba(0,0,0,0.4)", color: OBS.text }}>{showSecret ? newSecret.api_secret : "•".repeat(40)}</code>
                <button onClick={() => setShowSecret(!showSecret)}>{showSecret ? <EyeOff className="w-4 h-4" style={{ color: OBS.muted }} /> : <Eye className="w-4 h-4" style={{ color: OBS.muted }} />}</button>
                <button onClick={() => { navigator.clipboard.writeText(newSecret.api_secret); toast({ title: "Copied" }); }}><Copy className="w-4 h-4" style={{ color: OBS.muted }} /></button>
              </div>
            </div>
          </div>
          <Button onClick={() => setNewSecret(null)} variant="outline" size="sm" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">{t("portal.dismiss", "I've saved it")}</Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: OBS.text }}>{t("portal.apiKeys", "API Keys")}</h3>
        <Button onClick={generateKey} disabled={loading} size="sm" className="bg-white text-black hover:bg-gray-200 transition-all duration-100"><Plus className="w-3.5 h-3.5 me-1.5" />{t("portal.generateKey", "Generate Production Key")}</Button>
      </div>

      {keys.length === 0 ? (
        <p className="text-sm py-8 text-center" style={{ color: OBS.muted }}>{t("portal.noKeys", "No API keys yet. Generate your first key to get started.")}</p>
      ) : (
        <div className="space-y-3">
          {keys.map(k => (
            <div key={k.id} className="rounded-xl p-4 space-y-3" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="w-4 h-4" style={{ color: k.is_active ? OBS.success : OBS.danger }} />
                  <code className="text-sm font-mono" style={{ color: OBS.text }}>{k.key_id}</code>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: k.is_active ? "rgba(34,211,238,0.1)" : "rgba(239,68,68,0.1)", color: k.is_active ? OBS.success : OBS.danger }}>{k.is_active ? "Active" : "Revoked"}</span>
                </div>
                <div className="flex items-center gap-2">
                  {k.is_active && (
                    <>
                      <button onClick={() => { setEditingKey(editingKey === k.key_id ? null : k.key_id); setWebhookUrl(k.webhook_url || ""); setIpWhitelist((k.ip_whitelist || []).join(", ")); }}><Globe className="w-4 h-4" style={{ color: OBS.muted }} /></button>
                      <button onClick={() => revokeKey(k.key_id)}><Trash2 className="w-4 h-4" style={{ color: OBS.danger }} /></button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-4 text-xs" style={{ color: OBS.muted }}>
                <span>Created: {new Date(k.created_at).toLocaleDateString()}</span>
                {k.last_used_at && <span>Last used: {new Date(k.last_used_at).toLocaleDateString()}</span>}
              </div>
              {editingKey === k.key_id && (
                <div className="space-y-3 pt-2" style={{ borderTop: `0.5px solid ${OBS.border}` }}>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider" style={{ color: OBS.muted }}>{t("portal.webhookUrl", "Webhook URL")}</Label>
                    <Input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://api.yoursite.com/webhook" className="border-0 bg-white/5 text-white placeholder:text-gray-600 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider" style={{ color: OBS.muted }}>{t("portal.ipWhitelist", "IP Whitelist (comma-separated)")}</Label>
                    <Input value={ipWhitelist} onChange={e => setIpWhitelist(e.target.value)} placeholder="1.2.3.4, 5.6.7.8" className="border-0 bg-white/5 text-white placeholder:text-gray-600 text-sm" />
                  </div>
                  <Button onClick={() => updateKey(k.key_id)} size="sm" className="bg-white text-black hover:bg-gray-200 transition-all duration-100">{t("portal.saveConfig", "Save Configuration")}</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  SECTION: API LEDGER (API-driven transactions)              */
/* ════════════════════════════════════════════════════════════ */
const MRC_STATUS_LABELS: Record<string, string> = {
  pending: "Pending", awaiting_deposit: "Awaiting Funds", confirming_deposit: "Confirming Deposit",
  exchanging: "Exchanging", sending_payout: "Sending Payout", success: "Success", failed: "Failed",
  refunded: "Refunded", expired: "Expired",
};
const MRC_PIPELINE = ["awaiting_deposit", "confirming_deposit", "exchanging", "sending_payout", "success"] as const;

function MrcStatusPipeline({ status }: { status?: string }) {
  const current = status || "pending";
  const isFailed = ["failed", "refunded", "expired"].includes(current);
  const activeIdx = MRC_PIPELINE.indexOf(current as typeof MRC_PIPELINE[number]);
  if (isFailed) return <div className="flex items-center gap-2"><XCircle className="w-4 h-4" style={{ color: OBS.danger }} /><span className="text-xs font-medium" style={{ color: OBS.danger }}>{MRC_STATUS_LABELS[current] || current}</span></div>;
  return (
    <div className="flex items-center gap-1">
      {MRC_PIPELINE.map((step, i) => {
        const done = i <= activeIdx;
        return (
          <div key={step} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${i === activeIdx ? "animate-pulse" : ""}`} style={{ background: done ? OBS.success : "rgba(255,255,255,0.1)" }} title={MRC_STATUS_LABELS[step]} />
            {i < MRC_PIPELINE.length - 1 && <div className="w-3 h-px" style={{ background: done ? OBS.success : "rgba(255,255,255,0.1)" }} />}
          </div>
        );
      })}
      <span className="text-xs ms-2" style={{ color: activeIdx >= 0 ? OBS.success : OBS.muted }}>{MRC_STATUS_LABELS[current] || current}</span>
    </div>
  );
}

function ApiLedgerSection({ partnerId }: { partnerId: string }) {
  const { t } = useTranslation();
  const [txs, setTxs] = useState<PartnerTx[]>([]);
  const [balance, setBalance] = useState<PartnerBalance>({ available_btc: 0, pending_btc: 0, total_earned_btc: 0, last_credited_at: null });
  const [loading, setLoading] = useState(true);
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    (async () => {
      const [txRes, balRes] = await Promise.all([
        supabase.from("partner_transactions").select("*").eq("partner_id", partnerId).order("completed_at", { ascending: false }).limit(200),
        supabase.from("partner_balances").select("*").eq("partner_id", partnerId).maybeSingle(),
      ]);
      setTxs((txRes.data || []) as PartnerTx[]);
      if (balRes.data) setBalance(balRes.data as unknown as PartnerBalance);
      setLoading(false);
    })();
  }, [partnerId]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return txs;
    const q = searchQuery.toLowerCase();
    return txs.filter(t => (t.mrc_transaction_id || "").toLowerCase().includes(q) || t.asset.includes(q));
  }, [txs, searchQuery]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" style={{ color: OBS.muted }} /></div>;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={{ color: OBS.text }}>{t("portal.apiLedger", "API Transaction Ledger")}</h3>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Available Balance", value: `${balance.available_btc.toFixed(8)} BTC`, color: OBS.success },
          { label: "Pending Settlement", value: `${balance.pending_btc.toFixed(8)} BTC`, color: "#FBBF24" },
          { label: "Lifetime Earned", value: `${balance.total_earned_btc.toFixed(8)} BTC`, color: OBS.text },
        ].map(m => (
          <div key={m.label} className="rounded-xl p-5" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}` }}>
            <span className="text-xs uppercase tracking-wider" style={{ color: OBS.muted }}>{m.label}</span>
            <p className="text-lg font-bold font-mono mt-2" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: OBS.muted }} />
        <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by MRC Transaction ID…" className="ps-9 border-0 bg-white/5 text-white placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-cyan-500/50" />
      </div>

      {/* Transaction table */}
      <div className="rounded-xl overflow-hidden" style={{ border: `0.5px solid ${OBS.border}` }}>
        <Table>
          <TableHeader>
            <TableRow style={{ borderColor: OBS.border }}>
              <TableHead className="text-xs uppercase" style={{ color: OBS.muted }}>Status</TableHead>
              <TableHead className="text-xs uppercase" style={{ color: OBS.muted }}>MRC ID</TableHead>
              <TableHead className="text-xs uppercase" style={{ color: OBS.muted }}>Asset</TableHead>
              <TableHead className="text-xs uppercase text-right" style={{ color: OBS.muted }}>Volume</TableHead>
              <TableHead className="text-xs uppercase text-right" style={{ color: OBS.muted }}>Commission</TableHead>
              <TableHead className="text-xs uppercase" style={{ color: OBS.muted }}>Date</TableHead>
              <TableHead className="text-xs uppercase" style={{ color: OBS.muted }}></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-12">
                <Terminal className="w-8 h-8 mx-auto mb-3" style={{ color: OBS.muted }} />
                <p className="text-sm" style={{ color: OBS.muted }}>{t("portal.noApiTxs", "No API transactions yet.")}</p>
              </TableCell></TableRow>
            ) : filtered.map(tx => (
              <>
                <TableRow key={tx.id} className="cursor-pointer hover:bg-white/[0.02]" style={{ borderColor: OBS.border }} onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}>
                  <TableCell><MrcStatusPipeline status={tx.status} /></TableCell>
                  <TableCell className="font-mono text-xs" style={{ color: OBS.text }}>{tx.mrc_transaction_id || tx.id.slice(0, 12)}</TableCell>
                  <TableCell className="text-xs uppercase" style={{ color: OBS.text }}>{tx.asset}</TableCell>
                  <TableCell className="text-right text-xs font-mono" style={{ color: OBS.text }}>${tx.volume.toLocaleString("en", { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-right text-xs font-mono" style={{ color: OBS.success }}>{tx.commission_btc.toFixed(8)}</TableCell>
                  <TableCell className="text-xs" style={{ color: OBS.muted }}>{new Date(tx.completed_at).toLocaleDateString()}</TableCell>
                  <TableCell>{expandedTx === tx.id ? <ChevronUp className="w-4 h-4" style={{ color: OBS.muted }} /> : <ChevronDown className="w-4 h-4" style={{ color: OBS.muted }} />}</TableCell>
                </TableRow>
                {expandedTx === tx.id && (
                  <TableRow key={`${tx.id}-json`} style={{ borderColor: OBS.border }}>
                    <TableCell colSpan={7}>
                      <pre className="text-xs font-mono p-4 rounded-lg overflow-x-auto" style={{ background: "rgba(0,0,0,0.3)", color: OBS.text }}>
                        {JSON.stringify({ mrc_transaction_id: tx.mrc_transaction_id, status: tx.status, asset: tx.asset, volume: tx.volume, commission_btc: tx.commission_btc, is_paid: tx.is_paid, completed_at: tx.completed_at }, null, 2)}
                      </pre>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  SECTION: BALANCES & PAYOUTS                                */
/* ════════════════════════════════════════════════════════════ */
interface PayoutRequest { id: string; amount_btc: number; wallet_address: string; status: string; payout_txid: string; requested_at: string; processed_at: string | null; }

function PayoutsSection({ partnerId, btcWallet }: { partnerId: string; btcWallet: string }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [balance, setBalance] = useState<PartnerBalance>({ available_btc: 0, pending_btc: 0, total_earned_btc: 0, last_credited_at: null });
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");

  useEffect(() => {
    (async () => {
      const [balRes, payRes] = await Promise.all([
        supabase.from("partner_balances").select("*").eq("partner_id", partnerId).maybeSingle(),
        supabase.from("payout_requests" as any).select("*").eq("partner_id", partnerId).order("requested_at", { ascending: false }),
      ]);
      if (balRes.data) setBalance(balRes.data as unknown as PartnerBalance);
      setPayouts((payRes.data || []) as unknown as PayoutRequest[]);
      setLoading(false);
    })();
  }, [partnerId]);

  const requestPayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0 || amount > balance.available_btc) {
      toast({ title: t("portal.invalidAmount", "Invalid amount"), variant: "destructive" });
      return;
    }
    setRequesting(true);
    const { error } = await supabase.from("payout_requests" as any).insert({
      partner_id: partnerId,
      amount_btc: amount,
      wallet_address: btcWallet,
      status: "pending",
    } as any);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
    } else {
      toast({ title: t("portal.payoutRequested", "Payout request submitted") });
      setPayoutAmount("");
      // Refresh
      const { data } = await supabase.from("payout_requests" as any).select("*").eq("partner_id", partnerId).order("requested_at", { ascending: false });
      setPayouts((data || []) as unknown as PayoutRequest[]);
    }
    setRequesting(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" style={{ color: OBS.muted }} /></div>;

  const totalVolume = balance.total_earned_btc / 0.004; // Reverse from 0.4% commission
  const lifetimePaid = payouts.filter(p => p.status === "paid").reduce((s, p) => s + p.amount_btc, 0);

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: t("portal.totalApiVolume", "Total Volume (API)"), value: `$${totalVolume.toLocaleString("en", { minimumFractionDigits: 2 })}`, color: OBS.accent },
          { label: t("portal.currentEarnings", "Current Earnings (0.4%)"), value: `${balance.available_btc.toFixed(8)} BTC`, color: OBS.success },
          { label: t("portal.lifetimePaid", "Lifetime Paid"), value: `${lifetimePaid.toFixed(8)} BTC`, color: OBS.text },
        ].map(m => (
          <div key={m.label} className="rounded-xl p-5" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}` }}>
            <span className="text-xs uppercase tracking-wider block mb-2" style={{ color: OBS.muted }}>{m.label}</span>
            <p className="text-xl font-bold font-mono" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Request Payout */}
      <div className="rounded-xl p-6 space-y-4" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}` }}>
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4" style={{ color: OBS.accent }} />
          <span className="text-sm font-medium" style={{ color: OBS.text }}>{t("portal.requestPayout", "Request Payout")}</span>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: OBS.muted }}>
          <span>{t("portal.payoutWallet", "Destination")}:</span>
          <code className="font-mono" style={{ color: OBS.success }}>{btcWallet.slice(0, 12)}…{btcWallet.slice(-6)}</code>
        </div>
        <div className="flex items-center gap-3">
          <Input
            value={payoutAmount}
            onChange={e => setPayoutAmount(e.target.value)}
            placeholder={`Max: ${balance.available_btc.toFixed(8)} BTC`}
            className="border-0 bg-white/5 text-white placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-cyan-500/50 font-mono max-w-xs"
          />
          <Button onClick={requestPayout} disabled={requesting || !payoutAmount} className="bg-white text-black hover:bg-gray-200 transition-all duration-100">
            {requesting ? <Loader2 className="w-4 h-4 animate-spin me-1.5" /> : <Wallet className="w-4 h-4 me-1.5" />}
            {t("portal.submitPayout", "Submit Request")}
          </Button>
        </div>
      </div>

      {/* Payout history */}
      <div className="rounded-xl overflow-hidden" style={{ border: `0.5px solid ${OBS.border}` }}>
        <Table>
          <TableHeader>
            <TableRow style={{ borderColor: OBS.border }}>
              <TableHead className="text-xs uppercase" style={{ color: OBS.muted }}>{t("portal.status", "Status")}</TableHead>
              <TableHead className="text-xs uppercase" style={{ color: OBS.muted }}>{t("portal.amount", "Amount")}</TableHead>
              <TableHead className="text-xs uppercase" style={{ color: OBS.muted }}>{t("portal.wallet", "Wallet")}</TableHead>
              <TableHead className="text-xs uppercase" style={{ color: OBS.muted }}>TXID</TableHead>
              <TableHead className="text-xs uppercase" style={{ color: OBS.muted }}>{t("portal.date", "Date")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-12 text-sm" style={{ color: OBS.muted }}>{t("portal.noPayouts", "No payout requests yet.")}</TableCell></TableRow>
            ) : payouts.map(p => (
              <TableRow key={p.id} style={{ borderColor: OBS.border }}>
                <TableCell>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{
                    background: p.status === "paid" ? "rgba(34,211,238,0.1)" : p.status === "rejected" ? "rgba(239,68,68,0.1)" : "rgba(251,191,36,0.1)",
                    color: p.status === "paid" ? OBS.success : p.status === "rejected" ? OBS.danger : "#FBBF24",
                  }}>{p.status.charAt(0).toUpperCase() + p.status.slice(1)}</span>
                </TableCell>
                <TableCell className="font-mono text-xs" style={{ color: OBS.text }}>{p.amount_btc.toFixed(8)} BTC</TableCell>
                <TableCell className="font-mono text-xs" style={{ color: OBS.muted }}>{p.wallet_address.slice(0, 10)}…</TableCell>
                <TableCell className="font-mono text-xs" style={{ color: OBS.success }}>{p.payout_txid || "—"}</TableCell>
                <TableCell className="text-xs" style={{ color: OBS.muted }}>{new Date(p.requested_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  SECTION: DEVELOPER DOCUMENTATION                           */
/* ════════════════════════════════════════════════════════════ */
type DocTab = "auth" | "swap" | "webhooks" | "commission";

const CODE_BG = "#050507";
const CODE_BLUE = "#60A5FA";
const CODE_CYAN = "#22D3EE";
const CODE_STRING = "#A5F3FC";
const CODE_COMMENT = "#4B5563";

function CodeBlock({ title, language, children }: { title?: string; language: string; children: string }) {
  const { toast } = useToast();
  const copy = () => { navigator.clipboard.writeText(children); toast({ title: "Copied" }); };
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `0.5px solid ${OBS.border}` }}>
      {title && (
        <div className="flex items-center justify-between px-4 py-2" style={{ background: "rgba(255,255,255,0.03)", borderBottom: `0.5px solid ${OBS.border}` }}>
          <span className="text-xs font-mono" style={{ color: OBS.muted }}>{title}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded" style={{ color: CODE_CYAN, background: "rgba(34,211,238,0.1)" }}>{language}</span>
            <button onClick={copy} className="p-1 rounded hover:bg-white/5"><Copy className="w-3.5 h-3.5" style={{ color: OBS.muted }} /></button>
          </div>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed" style={{ background: CODE_BG, color: "#E2E8F0" }}>
        {children}
      </pre>
    </div>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return <div className="prose-obsidian space-y-4 text-sm leading-relaxed" style={{ color: OBS.text }}>{children}</div>;
}

function DocHeading({ children }: { children: React.ReactNode }) {
  return <h4 className="text-base font-semibold mt-6 mb-3 flex items-center gap-2" style={{ color: OBS.text }}>{children}</h4>;
}

function ParamRow({ name, type, required, desc }: { name: string; type: string; required?: boolean; desc: string }) {
  return (
    <div className="flex items-start gap-3 py-2" style={{ borderBottom: `0.5px solid rgba(255,255,255,0.04)` }}>
      <code className="text-xs font-mono shrink-0 px-1.5 py-0.5 rounded" style={{ color: CODE_CYAN, background: "rgba(34,211,238,0.08)" }}>{name}</code>
      <span className="text-[10px] uppercase tracking-wider shrink-0 mt-0.5" style={{ color: OBS.muted }}>{type}</span>
      {required && <span className="text-[10px] uppercase tracking-wider shrink-0 mt-0.5 px-1.5 rounded" style={{ color: OBS.danger, background: "rgba(239,68,68,0.1)" }}>required</span>}
      <span className="text-xs flex-1" style={{ color: OBS.muted }}>{desc}</span>
    </div>
  );
}

function DevDocsSection() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<DocTab>("auth");
  const [tryItLoading, setTryItLoading] = useState(false);
  const [tryItResponse, setTryItResponse] = useState<string | null>(null);

  const tabs: { id: DocTab; label: string; icon: typeof Shield }[] = [
    { id: "auth", label: t("portal.docsAuth", "Authentication"), icon: Shield },
    { id: "swap", label: t("portal.docsSwap", "Swap Endpoint"), icon: ArrowRightLeft },
    { id: "webhooks", label: t("portal.docsWebhooks", "Webhook Security"), icon: Globe },
    { id: "commission", label: t("portal.docsCommission", "Commission Logic"), icon: TrendingUp },
  ];

  const handleTryIt = async () => {
    setTryItLoading(true);
    setTryItResponse(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-dispatcher?action=test-webhook`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: "{}",
      });
      const data = await resp.json();
      setTryItResponse(JSON.stringify({
        status: 200,
        mock_response: {
          mrc_transaction_id: "MRC-MOCK-" + Math.random().toString(36).slice(2, 10),
          status: "finished",
          from_currency: "eth",
          to_currency: "btc",
          amount_in: 1.5,
          amount_out: 0.0621,
          partner_commission: 0.000248,
          webhook_dispatched: data.success || false,
          timestamp: new Date().toISOString(),
        }
      }, null, 2));
      toast({ title: t("portal.mockSwapSent", "Mock swap executed successfully") });
    } catch (e: any) {
      setTryItResponse(JSON.stringify({ error: e.message }, null, 2));
    }
    setTryItLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1" style={{ borderBottom: `0.5px solid ${OBS.border}` }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors whitespace-nowrap"
            style={{
              color: activeTab === tab.id ? OBS.text : OBS.muted,
              borderBottom: activeTab === tab.id ? `2px solid ${CODE_CYAN}` : "2px solid transparent",
            }}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Prose */}
        <div className="space-y-4">
          {activeTab === "auth" && (
            <Prose>
              <DocHeading><Shield className="w-4 h-4" style={{ color: CODE_CYAN }} /> {t("portal.docsAuthTitle", "Authentication")}</DocHeading>
              <p style={{ color: OBS.muted }}>{t("portal.docsAuthDesc", "All API requests must include two headers to identify and authenticate your integration. Requests missing either header will receive a 401 Unauthorized response.")}</p>
              <div className="rounded-xl p-4 space-y-1" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}` }}>
                <ParamRow name="X-MRC-Partner-ID" type="header" required desc={t("portal.docsPartnerIdDesc", "Your unique Partner ID from the Partner Hub overview.")} />
                <ParamRow name="X-MRC-API-Key" type="header" required desc={t("portal.docsApiKeyDesc", "An active API key generated in the API Keys section.")} />
              </div>
              <p className="text-xs" style={{ color: OBS.muted }}>{t("portal.docsAuthNote", "API keys are bound to your partner account. Each key can optionally be restricted to specific IP addresses via the whitelist in API Keys settings.")}</p>
              <DocHeading>{t("portal.docsBaseUrl", "Base URL")}</DocHeading>
              <div className="rounded-lg px-3 py-2 font-mono text-sm" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}`, color: CODE_CYAN }}>
                https://api.mrcglobalpay.com/v1
              </div>
            </Prose>
          )}

          {activeTab === "swap" && (
            <Prose>
              <DocHeading><ArrowRightLeft className="w-4 h-4" style={{ color: CODE_CYAN }} /> POST /v1/swap</DocHeading>
              <p style={{ color: OBS.muted }}>{t("portal.docsSwapDesc", "Initiate a swap order through the MRC liquidity proxy. The system validates your credentials, logs the transaction internally, and relays the order to our liquidity network.")}</p>
              <DocHeading>{t("portal.docsRequestBody", "Request Body")}</DocHeading>
              <div className="rounded-xl p-4 space-y-1" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}` }}>
                <ParamRow name="from_currency" type="string" required desc={t("portal.docsFromDesc", "Source currency ticker (e.g., 'eth', 'btc', 'usdt').")} />
                <ParamRow name="to_currency" type="string" required desc={t("portal.docsToDesc", "Destination currency ticker.")} />
                <ParamRow name="amount" type="number" required desc={t("portal.docsAmountDesc", "Amount of from_currency to swap. Minimum $0.30 equivalent.")} />
                <ParamRow name="recipient_address" type="string" required desc={t("portal.docsRecipientDesc", "Destination wallet address for the converted funds.")} />
              </div>
              <DocHeading>{t("portal.docsResponse", "Response")}</DocHeading>
              <p style={{ color: OBS.muted }}>{t("portal.docsResponseDesc", "On success, returns 200 with the internal MRC transaction ID and a deposit address. The partner must instruct the end-user to send funds to the payin_address.")}</p>
            </Prose>
          )}

          {activeTab === "webhooks" && (
            <Prose>
              <DocHeading><Globe className="w-4 h-4" style={{ color: CODE_CYAN }} /> {t("portal.docsWebhookTitle", "Webhook Security")}</DocHeading>
              <p style={{ color: OBS.muted }}>{t("portal.docsWebhookDesc", "When a transaction status changes, MRC dispatches a POST request to your configured Webhook URL. Each payload is signed with HMAC-SHA256 using your API Secret as the key.")}</p>
              <DocHeading>{t("portal.docsVerifySteps", "Verification Steps")}</DocHeading>
              <ol className="list-decimal list-inside space-y-2 text-xs" style={{ color: OBS.muted }}>
                <li>{t("portal.docsStep1", "Extract the X-MRC-Signature header from the incoming request.")}</li>
                <li>{t("portal.docsStep2", "Compute HMAC-SHA256 of the raw JSON body using your API Secret.")}</li>
                <li>{t("portal.docsStep3", "Compare your computed signature with the header value. Reject if they differ.")}</li>
              </ol>
              <DocHeading>{t("portal.docsPayloadFields", "Payload Fields")}</DocHeading>
              <div className="rounded-xl p-4 space-y-1" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}` }}>
                <ParamRow name="mrc_tx_id" type="string" desc={t("portal.docsMrcTxDesc", "Internal MRC transaction reference.")} />
                <ParamRow name="status" type="string" desc="waiting | confirming | exchanging | finished | failed" />
                <ParamRow name="amount_out" type="number" desc={t("portal.docsAmountOutDesc", "Final amount delivered to the recipient.")} />
                <ParamRow name="partner_commission" type="number" desc={t("portal.docsCommissionDesc", "Your earned commission on this transaction (BTC).")} />
              </div>
            </Prose>
          )}

          {activeTab === "commission" && (
            <Prose>
              <DocHeading><TrendingUp className="w-4 h-4" style={{ color: CODE_CYAN }} /> {t("portal.docsCommissionTitle", "Commission Logic")}</DocHeading>
              <p style={{ color: OBS.muted }}>{t("portal.docsCommissionDesc2", "All transactions routed through the Partner API are subject to an automated 0.4% commission, calculated on the total transaction volume and credited in BTC.")}</p>
              <div className="rounded-xl p-5 space-y-3" style={{ background: "rgba(34,211,238,0.04)", border: `0.5px solid rgba(34,211,238,0.15)` }}>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" style={{ color: CODE_CYAN }} />
                  <span className="text-sm font-medium" style={{ color: OBS.text }}>{t("portal.docsRateFormula", "Commission Formula")}</span>
                </div>
                <code className="block text-sm font-mono" style={{ color: CODE_CYAN }}>commission_btc = volume_usd × 0.004 ÷ btc_price</code>
              </div>
              <DocHeading>{t("portal.docsSettlement", "Settlement")}</DocHeading>
              <ul className="list-disc list-inside space-y-2 text-xs" style={{ color: OBS.muted }}>
                <li>{t("portal.docsSettlement1", "Commissions accrue in real-time to your Available Balance.")}</li>
                <li>{t("portal.docsSettlement2", "Completed transactions auto-credit to the BTC wallet on your partner profile.")}</li>
                <li>{t("portal.docsSettlement3", "Pending settlements are visible in the API Ledger under 'Pending Settlement'.")}</li>
              </ul>
              <DocHeading>{t("portal.docsLedgerTracking", "Ledger Tracking")}</DocHeading>
              <p style={{ color: OBS.muted }}>{t("portal.docsLedgerDesc", "Each transaction is logged with a unique MRC Transaction ID, volume, commission, and payment status. Review your full ledger in the API Ledger section.")}</p>
            </Prose>
          )}
        </div>

        {/* RIGHT: Code blocks */}
        <div className="space-y-4">
          {activeTab === "auth" && (
            <>
              <CodeBlock title="Authentication Headers" language="HTTP">
{`GET /v1/status HTTP/1.1
Host: api.mrcglobalpay.com
X-MRC-Partner-ID: your_partner_id
X-MRC-API-Key: pk_live_xxxxxxxxxxxxxxxx
Content-Type: application/json`}
              </CodeBlock>
              <CodeBlock title="cURL Example" language="bash">
{`curl -X GET https://api.mrcglobalpay.com/v1/status \\
  -H "X-MRC-Partner-ID: your_partner_id" \\
  -H "X-MRC-API-Key: pk_live_xxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json"`}
              </CodeBlock>
              <CodeBlock title="Error Response (401)" language="JSON">
{`{
  "error": "MRC_AUTH_FAILED",
  "message": "Invalid or missing API credentials.",
  "code": 401
}`}
              </CodeBlock>
            </>
          )}

          {activeTab === "swap" && (
            <>
              <CodeBlock title="Request" language="bash">
{`curl -X POST https://api.mrcglobalpay.com/v1/swap \\
  -H "X-MRC-Partner-ID: your_partner_id" \\
  -H "X-MRC-API-Key: pk_live_xxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from_currency": "eth",
    "to_currency": "btc",
    "amount": 1.5,
    "recipient_address": "bc1q..."
  }'`}
              </CodeBlock>
              <CodeBlock title="Success Response (200)" language="JSON">
{`{
  "mrc_transaction_id": "MRC-a1b2c3d4e5f6",
  "status": "waiting",
  "payin_address": "0x7a250d563...",
  "amount_expected": 1.5,
  "from_currency": "eth",
  "to_currency": "btc",
  "estimated_arrival": "10-30 minutes"
}`}
              </CodeBlock>
              <CodeBlock title="Error Response (400)" language="JSON">
{`{
  "error": "MRC_MINIMUM_AMOUNT",
  "message": "Minimum swap amount is $0.30 equivalent.",
  "code": 400
}`}
              </CodeBlock>
            </>
          )}

          {activeTab === "webhooks" && (
            <>
              <CodeBlock title="Node.js — Verify Signature" language="JavaScript">
{`const crypto = require('crypto');

function verifySignature(body, signature, secret) {
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return hmac === signature;
}

// Express middleware
app.post('/webhook', (req, res) => {
  const sig = req.headers['x-mrc-signature'];
  const raw = JSON.stringify(req.body);

  if (!verifySignature(raw, sig, API_SECRET)) {
    return res.status(401).json({
      error: 'Invalid signature'
    });
  }

  const { mrc_tx_id, status } = req.body;
  console.log(\`TX \${mrc_tx_id}: \${status}\`);
  res.sendStatus(200);
});`}
              </CodeBlock>
              <CodeBlock title="Python — Verify Signature" language="Python">
{`import hmac
import hashlib

def verify_signature(body: bytes, signature: str,
                     secret: str) -> bool:
    computed = hmac.new(
        secret.encode(),
        body,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(computed, signature)

# Flask route
@app.route('/webhook', methods=['POST'])
def webhook():
    sig = request.headers.get('X-MRC-Signature')
    if not verify_signature(
        request.data, sig, API_SECRET
    ):
        return jsonify(error='Invalid'), 401

    data = request.json
    print(f"TX {data['mrc_tx_id']}: {data['status']}")
    return '', 200`}
              </CodeBlock>
            </>
          )}

          {activeTab === "commission" && (
            <>
              <CodeBlock title="Commission Calculation" language="JSON">
{`// Example: 1.5 ETH swap at $3,200/ETH
// BTC price: $67,400

{
  "volume_usd": 4800.00,
  "commission_rate": 0.004,
  "commission_usd": 19.20,
  "btc_price": 67400,
  "commission_btc": 0.00028487
}`}
              </CodeBlock>
              <CodeBlock title="Webhook Commission Payload" language="JSON">
{`{
  "event": "transaction.updated",
  "mrc_transaction_id": "MRC-a1b2c3d4e5f6",
  "status": "finished",
  "amount_out": 0.0621,
  "partner_commission": 0.00028487,
  "asset": "btc",
  "volume": 4800.00,
  "timestamp": "2026-04-16T01:45:00.000Z"
}`}
              </CodeBlock>
            </>
          )}

          {/* Try It Now Console */}
          <div className="rounded-xl overflow-hidden" style={{ border: `0.5px solid ${OBS.border}` }}>
            <div className="flex items-center justify-between px-4 py-2.5" style={{ background: "rgba(255,255,255,0.03)", borderBottom: `0.5px solid ${OBS.border}` }}>
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" style={{ color: CODE_CYAN }} />
                <span className="text-xs font-medium" style={{ color: OBS.text }}>{t("portal.tryItNow", "Try It Now")}</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded" style={{ color: "#22C55E", background: "rgba(34,197,94,0.1)" }}>SANDBOX</span>
            </div>
            <div className="p-4 space-y-3" style={{ background: CODE_BG }}>
              <p className="text-xs" style={{ color: OBS.muted }}>{t("portal.tryItDesc", "Execute a mock swap to preview the JSON response and webhook dispatch behavior.")}</p>
              <Button onClick={handleTryIt} disabled={tryItLoading} className="bg-white text-black hover:bg-gray-200 transition-all duration-100 h-9 text-xs">
                {tryItLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin me-1.5" /> : <ArrowRightLeft className="w-3.5 h-3.5 me-1.5" />}
                {t("portal.executeMockSwap", "Execute Mock Swap")}
              </Button>
              {tryItResponse && (
                <pre className="text-xs font-mono p-3 rounded-lg overflow-x-auto" style={{ background: "rgba(0,0,0,0.5)", color: "#E2E8F0" }}>
                  {tryItResponse}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  SECTION: WEBHOOK TESTER                                    */
/* ════════════════════════════════════════════════════════════ */
function WebhookTesterSection() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; status_code?: number; error?: string; webhook_url?: string } | null>(null);

  const sendTest = async () => {
    setTesting(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-dispatcher?action=test-webhook`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: "{}",
      });
      const data = await resp.json();
      setResult(data);
      if (data.success) toast({ title: t("portal.webhookSuccess", "Webhook delivered successfully!") });
      else toast({ title: t("portal.webhookFailed", "Webhook delivery failed"), variant: "destructive" });
    } catch (e: any) {
      setResult({ success: false, error: e.message });
      toast({ title: e.message, variant: "destructive" });
    }
    setTesting(false);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl p-6 space-y-4" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}` }}>
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5" style={{ color: OBS.accent }} />
          <span className="text-sm font-medium" style={{ color: OBS.text }}>{t("portal.webhookTester", "Webhook Integration Tester")}</span>
        </div>
        <p className="text-xs" style={{ color: OBS.muted }}>
          {t("portal.webhookTesterDesc", "Send a dummy 'transaction.updated' payload to your configured webhook URL to verify your server receives and processes it correctly. The payload will be HMAC-signed with your API secret.")}
        </p>
        <Button onClick={sendTest} disabled={testing} className="bg-white text-black hover:bg-gray-200 transition-all duration-100">
          {testing ? <Loader2 className="w-4 h-4 animate-spin me-1.5" /> : <Globe className="w-4 h-4 me-1.5" />}
          {t("portal.sendTestWebhook", "Send Test Webhook")}
        </Button>
      </div>

      {result && (
        <div className="rounded-xl p-5 space-y-3" style={{
          background: result.success ? "rgba(34,211,238,0.05)" : "rgba(239,68,68,0.05)",
          border: `0.5px solid ${result.success ? "rgba(34,211,238,0.3)" : "rgba(239,68,68,0.3)"}`,
        }}>
          <div className="flex items-center gap-2">
            {result.success ? <CheckCircle2 className="w-4 h-4" style={{ color: OBS.success }} /> : <XCircle className="w-4 h-4" style={{ color: OBS.danger }} />}
            <span className="text-sm font-medium" style={{ color: result.success ? OBS.success : OBS.danger }}>
              {result.success ? "Delivered Successfully" : "Delivery Failed"}
            </span>
          </div>
          <div className="text-xs space-y-1" style={{ color: OBS.muted }}>
            {result.webhook_url && <p>URL: <code className="font-mono" style={{ color: OBS.text }}>{result.webhook_url}</code></p>}
            {result.status_code && <p>Response: <code className="font-mono" style={{ color: OBS.text }}>{result.status_code}</code></p>}
            {result.error && <p>Error: <code className="font-mono" style={{ color: OBS.danger }}>{result.error}</code></p>}
          </div>
        </div>
      )}

      {/* Payload preview */}
      <div className="rounded-xl p-5 space-y-3" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}` }}>
        <span className="text-xs uppercase tracking-wider" style={{ color: OBS.muted }}>Sample Payload</span>
        <pre className="text-xs font-mono p-4 rounded-lg overflow-x-auto" style={{ background: "rgba(0,0,0,0.3)", color: OBS.text }}>
          {JSON.stringify({
            event: "transaction.updated",
            mrc_transaction_id: "MRC-TEST-a1b2c3d4",
            status: "finished",
            amount_out: 0.05,
            partner_commission: 0.0002,
            asset: "btc",
            volume: 50,
            timestamp: new Date().toISOString(),
          }, null, 2)}
        </pre>
        <div className="space-y-1.5 text-xs" style={{ color: OBS.muted }}>
          <p><strong style={{ color: OBS.text }}>X-MRC-Signature</strong> — HMAC-SHA256 of the JSON body, signed with your API secret</p>
          <p><strong style={{ color: OBS.text }}>X-MRC-Event</strong> — Always <code className="font-mono" style={{ color: OBS.success }}>transaction.updated</code></p>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  MAIN DASHBOARD CONTENT                                     */
/* ════════════════════════════════════════════════════════════ */
function DashboardContent() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [swaps, setSwaps] = useState<SwapRow[]>([]);
  const [commissions, setCommissions] = useState<PartnerTx[]>([]);
  const [activeKeys, setActiveKeys] = useState(0);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      const results = await Promise.allSettled(batch.map(async (row) => {
        const { data } = await supabase.functions.invoke("changenow", { method: "POST", body: { _get: true, action: "tx-status", id: row.transaction_id } });
        return { txId: row.transaction_id, data };
      }));
      results.forEach(r => {
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

      const [swapRes, commRes, keyRes, devRes] = await Promise.all([
        supabase.from("swap_transactions").select("*").eq("ref_code", (p as PartnerProfile).referral_code).order("created_at", { ascending: false }),
        supabase.from("partner_transactions").select("*").eq("partner_id", (p as PartnerProfile).id).order("completed_at", { ascending: false }),
        supabase.from("partner_api_keys").select("id", { count: "exact", head: true }).eq("partner_id", (p as PartnerProfile).id).eq("is_active", true),
        supabase.from("developer_profiles").select("id").eq("partner_id", (p as PartnerProfile).id).maybeSingle(),
      ]);
      const rows = (swapRes.data || []) as SwapRow[];
      setSwaps(rows);
      setCommissions((commRes.data || []) as PartnerTx[]);
      setActiveKeys(keyRes.count || 0);
      setIsDeveloper(!!devRes.data);
      setLoading(false);
      fetchLiveStatuses(rows);
    })();
  }, [navigate, fetchLiveStatuses, toast]);

  const totalVolume = useMemo(() => commissions.reduce((a, t) => a + t.volume, 0), [commissions]);
  const totalCommission = useMemo(() => commissions.reduce((a, t) => a + t.commission_btc, 0), [commissions]);
  const finishedSwaps = useMemo(() => swaps.filter(s => s.live?.status === "finished"), [swaps]);
  const conversionRate = swaps.length > 0 ? ((finishedSwaps.length / swaps.length) * 100).toFixed(1) : "0";

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/partners"); };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: OBS.bg }}><Loader2 className="w-8 h-8 animate-spin" style={{ color: OBS.muted }} /></div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center" style={{ background: OBS.bg }}><p style={{ color: OBS.muted }}>Partner profile not found.</p></div>;

  const sectionTitle: Record<Section, string> = {
    overview: t("portal.overview", "Overview"),
    referrals: t("portal.referrals", "Referral Traffic"),
    earnings: t("portal.earnings", "Earnings"),
    account: t("portal.account", "Account"),
    "dev-setup": t("portal.devSetup", "Developer Setup"),
    "api-keys": t("portal.apiKeys", "API Keys"),
    "api-ledger": t("portal.apiLedger", "API Ledger"),
    payouts: t("portal.payouts", "Balances & Payouts"),
    webhooks: t("portal.webhooks", "Webhook Tester"),
    docs: t("portal.docs", "API Documentation"),
  };

  return (
    <div className="min-h-screen flex" style={{ background: OBS.bg }}>
      <Sidebar active={activeSection} onNavigate={setActiveSection} isDeveloper={isDeveloper} mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3" style={{ borderBottom: `0.5px solid ${OBS.border}` }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden"><Menu className="w-5 h-5" style={{ color: OBS.text }} /></button>
            <span className="text-sm font-medium" style={{ color: OBS.text }}>{profile.first_name} {profile.last_name}</span>
            <code className="text-xs px-2 py-0.5 rounded hidden sm:inline" style={{ background: "rgba(255,255,255,0.05)", color: OBS.muted }}>{profile.referral_code}</code>
          </div>
          <Button onClick={handleLogout} variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5"><LogOut className="w-4 h-4 me-1.5" />{t("portal.logout", "Logout")}</Button>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-[1100px] mx-auto space-y-6">
            <h2 className="text-xl font-semibold" style={{ color: OBS.text }}>{sectionTitle[activeSection]}</h2>

            {activeSection === "overview" && <OverviewSection swapCount={swaps.length} totalVolume={totalVolume} totalCommission={totalCommission} conversionRate={conversionRate} activeKeys={activeKeys} />}
            {activeSection === "referrals" && <ReferralSection referralCode={profile.referral_code} swaps={swaps} fetchLiveStatuses={fetchLiveStatuses} />}
            {activeSection === "earnings" && <EarningsSection commissions={commissions} />}
            {activeSection === "account" && <AccountSection profile={profile} />}
            {activeSection === "dev-setup" && <DevSetupSection partnerId={profile.id} isDeveloper={isDeveloper} onActivated={() => setIsDeveloper(true)} />}
            {activeSection === "api-keys" && (isDeveloper ? <ApiKeysSection partnerId={profile.id} /> : <DevSetupSection partnerId={profile.id} isDeveloper={isDeveloper} onActivated={() => setIsDeveloper(true)} />)}
            {activeSection === "api-ledger" && (isDeveloper ? <ApiLedgerSection partnerId={profile.id} /> : <DevSetupSection partnerId={profile.id} isDeveloper={isDeveloper} onActivated={() => setIsDeveloper(true)} />)}
            {activeSection === "payouts" && (isDeveloper ? <PayoutsSection partnerId={profile.id} btcWallet={profile.btc_wallet} /> : <DevSetupSection partnerId={profile.id} isDeveloper={isDeveloper} onActivated={() => setIsDeveloper(true)} />)}
            {activeSection === "webhooks" && (isDeveloper ? <WebhookTesterSection /> : <DevSetupSection partnerId={profile.id} isDeveloper={isDeveloper} onActivated={() => setIsDeveloper(true)} />)}
            {activeSection === "docs" && (isDeveloper ? <DevDocsSection /> : <DevSetupSection partnerId={profile.id} isDeveloper={isDeveloper} onActivated={() => setIsDeveloper(true)} />)}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  ORCHESTRATOR                                               */
/* ════════════════════════════════════════════════════════════ */
const PartnerDashboard = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"loading" | "totp" | "dashboard">("loading");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/partners"); return; }
      try {
        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-totp?action=status`, { headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } });
        const data = await resp.json();
        if (data.configured) { setPhase("totp"); } else { setPhase("dashboard"); }
      } catch { setPhase("dashboard"); }
    })();
  }, [navigate]);

  return (
    <>
      <Helmet>
        <title>Partner Dashboard | MRC GlobalPay</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {phase === "loading" && <div className="min-h-screen flex items-center justify-center" style={{ background: OBS.bg }}><Loader2 className="w-8 h-8 animate-spin" style={{ color: OBS.muted }} /></div>}
      {phase === "totp" && <TOTPGate onPass={() => setPhase("dashboard")} />}
      {phase === "dashboard" && <DashboardContent />}
    </>
  );
};

export default PartnerDashboard;
