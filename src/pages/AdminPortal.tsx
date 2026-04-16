import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, Users, Bitcoin, TrendingUp, Check, LogOut, Lock, MessageCircle,
  Trash2, DollarSign, Copy, FileText, Landmark, Percent, Key, Activity,
  AlertTriangle, Search, Code2, Link2, Zap, XCircle,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ExchangeTracker from "@/components/ExchangeTracker";
import InvoiceManager from "@/components/InvoiceManager";

interface Partner {
  id: string;
  first_name: string;
  last_name: string;
  btc_wallet: string;
  user_id: string;
  referral_code: string;
}

interface DevProfile {
  partner_id: string;
  totp_configured: boolean;
  tier: string;
}

interface ApiKeyRow {
  id: string;
  key_id: string;
  partner_id: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

interface Tx {
  id: string;
  partner_id: string;
  asset: string;
  volume: number;
  commission_btc: number;
  completed_at: string;
  is_paid: boolean;
  paid_at: string | null;
  status?: string;
  mrc_transaction_id?: string;
  changenow_order_id?: string;
}

type Stage = "login" | "mfa-enroll" | "mfa-verify" | "dashboard";

interface ChatLog {
  id: string;
  session_id: string;
  persona_name: string;
  user_message: string;
  ai_response: string;
  page_url: string | null;
  created_at: string;
}

interface LendEarnTx {
  id: string;
  tx_type: string;
  external_tx_id: string;
  email: string;
  phone: string;
  currency: string;
  amount: number;
  loan_currency: string;
  loan_amount: number;
  ltv_percent: number;
  apy_percent: number;
  deposit_address: string;
  status: string;
  language: string;
  created_at: string;
}

const AdminPortal = () => {
  // Auth state
  const [stage, setStage] = useState<Stage>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // MFA state
  const [qrUri, setQrUri] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [challengeId, setChallengeId] = useState("");

  // Dashboard state
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [devProfiles, setDevProfiles] = useState<DevProfile[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyRow[]>([]);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [tab, setTab] = useState("current");
  const [adminTab, setAdminTab] = useState<"partners" | "exchanges" | "invoices" | "support" | "lending" | "proxy">("exchanges");
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [lendEarnTxs, setLendEarnTxs] = useState<LendEarnTx[]>([]);
  const [webhookDeliveries, setWebhookDeliveries] = useState<any[]>([]);
  const [partnerSearch, setPartnerSearch] = useState("");
  const [proxySearch, setProxySearch] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const activityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const INACTIVITY_MS = 24 * 60 * 60 * 1000;

  const resetInactivityTimer = useCallback(() => {
    if (activityTimer.current) clearTimeout(activityTimer.current);
    activityTimer.current = setTimeout(async () => {
      await supabase.auth.signOut();
      setStage("login");
      setPartners([]);
      setTransactions([]);
      toast({ title: "Session Expired", description: "You've been logged out due to inactivity." });
    }, INACTIVITY_MS);
  }, [toast]);

  useEffect(() => {
    if (stage !== "dashboard") return;
    resetInactivityTimer();
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    const handler = () => resetInactivityTimer();
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (activityTimer.current) clearTimeout(activityTimer.current);
    };
  }, [stage, resetInactivityTimer]);

  const loadDashboard = useCallback(async () => {
    const [pRes, txRes, logRes, leRes, devRes, keyRes, whRes] = await Promise.all([
      supabase.from("partner_profiles").select("*"),
      supabase.from("partner_transactions").select("*").order("completed_at", { ascending: false }),
      supabase.from("support_chat_logs" as any).select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("lend_earn_transactions" as any).select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("developer_profiles").select("*"),
      supabase.from("partner_api_keys").select("*").order("created_at", { ascending: false }),
      supabase.from("webhook_deliveries" as any).select("*").order("created_at", { ascending: false }).limit(500),
    ]);
    setPartners((pRes.data || []) as Partner[]);
    setTransactions((txRes.data || []) as Tx[]);
    setChatLogs((logRes.data as unknown as ChatLog[]) || []);
    setLendEarnTxs((leRes.data as unknown as LendEarnTx[]) || []);
    setDevProfiles((devRes.data || []) as unknown as DevProfile[]);
    setApiKeys((keyRes.data || []) as unknown as ApiKeyRow[]);
    setWebhookDeliveries((whRes.data || []) as any[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setStage("login"); setLoading(false); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const isAdmin = roles?.some((r: any) => r.role === "admin");
      if (!isAdmin) {
        await supabase.auth.signOut();
        setStage("login");
        setLoading(false);
        toast({ title: "Access Denied", description: "Admin credentials required.", variant: "destructive" });
        return;
      }
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.currentLevel === "aal2") { setStage("dashboard"); loadDashboard(); return; }
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactors = factors?.totp || [];
      if (totpFactors.length > 0) {
        const verified = totpFactors.find((f: any) => f.status === "verified");
        if (verified) {
          setMfaFactorId(verified.id);
          const { data: challenge, error } = await supabase.auth.mfa.challenge({ factorId: verified.id });
          if (!error && challenge) setChallengeId(challenge.id);
          setStage("mfa-verify");
        } else { setStage("mfa-enroll"); await startEnrollment(); }
      } else { setStage("mfa-enroll"); await startEnrollment(); }
      setLoading(false);
    };
    checkSession();
  }, [navigate, loadDashboard]);

  const startEnrollment = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "MRC Admin Auth" });
    if (error) { toast({ title: "MFA Error", description: error.message, variant: "destructive" }); return; }
    if (data) { setMfaFactorId(data.id); setQrUri(data.totp.uri); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Auth failed");
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const isAdmin = roles?.some((r: any) => r.role === "admin");
      if (!isAdmin) { await supabase.auth.signOut(); throw new Error("Access denied. Admin only."); }
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactors = factors?.totp || [];
      if (totpFactors.length > 0) {
        const verified = totpFactors.find((f: any) => f.status === "verified");
        if (verified) {
          setMfaFactorId(verified.id);
          const { data: challenge } = await supabase.auth.mfa.challenge({ factorId: verified.id });
          if (challenge) setChallengeId(challenge.id);
          setStage("mfa-verify");
        } else { await startEnrollment(); setStage("mfa-enroll"); }
      } else { await startEnrollment(); setStage("mfa-enroll"); }
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setLoginLoading(false); }
  };

  const handleEnrollVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaLoading(true);
    try {
      const { data: challenge, error: chalErr } = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
      if (chalErr) throw chalErr;
      const { error: verErr } = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: challenge.id, code: totpCode });
      if (verErr) throw verErr;
      toast({ title: "MFA Enabled", description: "Authenticator registered successfully." });
      setStage("dashboard"); loadDashboard();
    } catch (err: any) { toast({ title: "Verification Failed", description: err.message, variant: "destructive" }); }
    finally { setMfaLoading(false); setTotpCode(""); }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaLoading(true);
    try {
      const { error } = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId, code: totpCode });
      if (error) throw error;
      setStage("dashboard"); loadDashboard();
    } catch (err: any) { toast({ title: "Invalid Code", description: err.message, variant: "destructive" }); }
    finally { setMfaLoading(false); setTotpCode(""); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setStage("login"); setPartners([]); setTransactions([]);
  };

  /* ═══ Helper lookups ═══ */
  const isDeveloper = (partnerId: string) => devProfiles.some(d => d.partner_id === partnerId);
  const hasTOTP = (partnerId: string) => devProfiles.some(d => d.partner_id === partnerId && d.totp_configured);
  const getPartnerKeys = (partnerId: string) => apiKeys.filter(k => k.partner_id === partnerId);
  const getPartnerName = (pid: string) => {
    const p = partners.find((x) => x.id === pid);
    return p ? `${p.first_name} ${p.last_name}` : "Unknown";
  };

  /* ═══ Computed data ═══ */
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTxs = useMemo(() =>
    transactions.filter((t) => { const d = new Date(t.completed_at); return d.getMonth() === currentMonth && d.getFullYear() === currentYear; }),
    [transactions, currentMonth, currentYear]);

  const historyTxs = useMemo(() =>
    transactions.filter((t) => { const d = new Date(t.completed_at); return !(d.getMonth() === currentMonth && d.getFullYear() === currentYear); }),
    [transactions, currentMonth, currentYear]);

  const historyGrouped = useMemo(() => {
    const groups: Record<string, Tx[]> = {};
    historyTxs.forEach((t) => { const d = new Date(t.completed_at); const key = `${d.toLocaleString("en-US", { month: "long" })} ${d.getFullYear()}`; if (!groups[key]) groups[key] = []; groups[key].push(t); });
    return groups;
  }, [historyTxs]);

  // Split volume by tier
  const affiliateTxs = useMemo(() => transactions.filter(t => !isDeveloper(t.partner_id)), [transactions, devProfiles]);
  const developerTxs = useMemo(() => transactions.filter(t => isDeveloper(t.partner_id)), [transactions, devProfiles]);
  const affiliateVolume = affiliateTxs.reduce((s, t) => s + Number(t.volume), 0);
  const developerVolume = developerTxs.reduce((s, t) => s + Number(t.volume), 0);

  const unpaidTxs = transactions.filter((t) => !t.is_paid);
  const totalVolume = currentMonthTxs.reduce((s, t) => s + Number(t.volume), 0);
  const totalUnpaid = unpaidTxs.reduce((s, t) => s + Number(t.commission_btc), 0);
  const totalPaid = transactions.filter((t) => t.is_paid).reduce((s, t) => s + Number(t.commission_btc), 0);

  // Gross MSB Profit = platform spread (0.5%) minus partner payouts
  const totalPartnerCommission = transactions.reduce((s, t) => s + Number(t.commission_btc), 0);
  const grossPlatformSpread = transactions.reduce((s, t) => s + Number(t.volume) * 0.005, 0);
  const grossMsbProfit = grossPlatformSpread - totalPartnerCommission;

  // Proxy bridge data
  const proxyTxs = useMemo(() => transactions.filter(t => t.changenow_order_id || t.mrc_transaction_id), [transactions]);
  const failedProxyTxs = useMemo(() => proxyTxs.filter(t => t.status === "failed"), [proxyTxs]);

  const filteredPartners = useMemo(() => {
    if (!partnerSearch.trim()) return partners;
    const q = partnerSearch.toLowerCase();
    return partners.filter(p =>
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
      p.btc_wallet.toLowerCase().includes(q) ||
      p.referral_code.toLowerCase().includes(q)
    );
  }, [partners, partnerSearch]);

  const filteredProxyTxs = useMemo(() => {
    if (!proxySearch.trim()) return proxyTxs;
    const q = proxySearch.toLowerCase();
    return proxyTxs.filter(t =>
      (t.mrc_transaction_id || "").toLowerCase().includes(q) ||
      (t.changenow_order_id || "").toLowerCase().includes(q) ||
      getPartnerName(t.partner_id).toLowerCase().includes(q)
    );
  }, [proxyTxs, proxySearch, partners]);

  const markAsPaid = async (txId: string) => {
    const { error } = await supabase.from("partner_transactions").update({ is_paid: true, paid_at: new Date().toISOString() } as any).eq("id", txId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setTransactions((prev) => prev.map((t) => (t.id === txId ? { ...t, is_paid: true, paid_at: new Date().toISOString() } : t)));
    toast({ title: "Marked as Paid" });
  };

  const emergencyRevokeKey = async (keyId: string, partnerId: string) => {
    const { error } = await supabase.from("partner_api_keys").update({ is_active: false } as any).eq("key_id", keyId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setApiKeys(prev => prev.map(k => k.key_id === keyId ? { ...k, is_active: false } : k));
    toast({ title: "API Key Revoked", description: `Emergency revoke for ${getPartnerName(partnerId)}` });
  };

  const deleteChatLog = async (logId: string) => {
    const { error } = await supabase.from("support_chat_logs" as any).delete().eq("id", logId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setChatLogs((prev) => prev.filter((l) => l.id !== logId));
    toast({ title: "Log deleted" });
  };

  const deleteAllChatLogs = async () => {
    const ids = chatLogs.map((l) => l.id);
    if (ids.length === 0) return;
    const { error } = await supabase.from("support_chat_logs" as any).delete().in("id", ids);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setChatLogs([]);
    toast({ title: "All logs cleared" });
  };

  const copyWallet = (wallet: string) => { navigator.clipboard.writeText(wallet); toast({ title: "Wallet copied" }); };

  /* ═══ TxTable sub-component ═══ */
  const TxTable = ({ txs, showPay = false }: { txs: Tx[]; showPay?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Partner</TableHead>
          <TableHead>Tier</TableHead>
          <TableHead>Asset</TableHead>
          <TableHead className="text-right">Volume</TableHead>
          <TableHead className="text-right">Commission</TableHead>
          <TableHead>Status</TableHead>
          {showPay && <TableHead />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {txs.length === 0 ? (
          <TableRow><TableCell colSpan={showPay ? 8 : 7} className="text-center text-muted-foreground py-8">No transactions found.</TableCell></TableRow>
        ) : txs.map((tx) => {
          const partnerIsDev = isDeveloper(tx.partner_id);
          return (
            <TableRow key={tx.id}>
              <TableCell className="text-muted-foreground">{new Date(tx.completed_at).toLocaleDateString()}</TableCell>
              <TableCell>{getPartnerName(tx.partner_id)}</TableCell>
              <TableCell>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${partnerIsDev ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                  {partnerIsDev ? "API" : "Affiliate"}
                </span>
              </TableCell>
              <TableCell className="uppercase">{tx.asset}</TableCell>
              <TableCell className="text-right">${Number(tx.volume).toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
              <TableCell className="text-right font-mono">{Number(tx.commission_btc).toFixed(8)} BTC</TableCell>
              <TableCell>
                {tx.is_paid ? (
                  <span className="text-xs text-primary flex items-center gap-1"><Check className="w-3 h-3" /> Paid</span>
                ) : (
                  <span className="text-xs text-amber-400">{tx.status || "Pending"}</span>
                )}
              </TableCell>
              {showPay && (
                <TableCell>
                  {!tx.is_paid && <Button size="sm" variant="outline" onClick={() => markAsPaid(tx.id)} className="text-xs">Mark Paid</Button>}
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  /* ═══ Auth screens ═══ */
  const inputClass = "bg-background/50 border-border/50 focus:border-primary/60 focus:ring-primary/20 h-11";

  if (stage === "login") {
    return (
      <>
        <Helmet><title>Admin Login | MRC GlobalPay</title><meta name="robots" content="noindex, nofollow" /></Helmet>
        <SiteHeader />
        <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden">
          <div className="pointer-events-none absolute inset-0"><div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" /></div>
          <div className="relative z-10 w-full max-w-md px-4">
            <div className="rounded-3xl border border-border/40 bg-card/30 backdrop-blur-xl p-8 shadow-[0_0_60px_-15px_hsl(var(--primary)/0.15)]">
              <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3"><Shield className="w-6 h-6 text-primary" /></div>
                <h1 className="text-xl font-bold text-foreground">Admin Portal</h1>
                <p className="text-sm text-muted-foreground">Restricted access</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} /></div>
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} /></div>
                <Button type="submit" className="w-full h-11" disabled={loginLoading}>{loginLoading ? "Authenticating…" : "Sign In"}</Button>
              </form>
            </div>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  if (stage === "mfa-enroll") {
    return (
      <>
        <Helmet><title>Setup 2FA | MRC GlobalPay</title><meta name="robots" content="noindex, nofollow" /></Helmet>
        <SiteHeader />
        <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden">
          <div className="pointer-events-none absolute inset-0"><div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" /></div>
          <div className="relative z-10 w-full max-w-md px-4">
            <div className="rounded-3xl border border-border/40 bg-card/30 backdrop-blur-xl p-8 shadow-[0_0_60px_-15px_hsl(var(--primary)/0.15)]">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3"><Lock className="w-6 h-6 text-primary" /></div>
                <h1 className="text-xl font-bold text-foreground">Setup Authenticator</h1>
                <p className="text-sm text-muted-foreground">Scan the QR code with your authenticator app</p>
              </div>
              {qrUri && <div className="flex justify-center mb-6"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUri)}`} alt="MFA QR Code" className="rounded-xl border border-border/40" width={200} height={200} /></div>}
              <form onSubmit={handleEnrollVerify} className="space-y-4">
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Enter 6-digit code</Label><Input value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" className={`${inputClass} text-center text-2xl tracking-[0.5em] font-mono`} maxLength={6} required /></div>
                <Button type="submit" className="w-full h-11" disabled={mfaLoading || totpCode.length !== 6}>{mfaLoading ? "Verifying…" : "Activate 2FA"}</Button>
              </form>
            </div>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  if (stage === "mfa-verify") {
    return (
      <>
        <Helmet><title>2FA Verification | MRC GlobalPay</title><meta name="robots" content="noindex, nofollow" /></Helmet>
        <SiteHeader />
        <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden">
          <div className="pointer-events-none absolute inset-0"><div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" /></div>
          <div className="relative z-10 w-full max-w-md px-4">
            <div className="rounded-3xl border border-border/40 bg-card/30 backdrop-blur-xl p-8 shadow-[0_0_60px_-15px_hsl(var(--primary)/0.15)]">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3"><Lock className="w-6 h-6 text-primary" /></div>
                <h1 className="text-xl font-bold text-foreground">Two-Factor Authentication</h1>
                <p className="text-sm text-muted-foreground">Enter the code from your authenticator app</p>
              </div>
              <form onSubmit={handleMfaVerify} className="space-y-4">
                <Input value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" className={`${inputClass} text-center text-2xl tracking-[0.5em] font-mono`} maxLength={6} required autoFocus />
                <Button type="submit" className="w-full h-11" disabled={mfaLoading || totpCode.length !== 6}>{mfaLoading ? "Verifying…" : "Verify & Continue"}</Button>
              </form>
            </div>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  /* ═══════════════════════════════════════════ */
  /*  DASHBOARD                                  */
  /* ═══════════════════════════════════════════ */
  return (
    <>
      <Helmet><title>Admin Portal | MRC GlobalPay</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <SiteHeader />
      <div className="relative min-h-screen bg-background overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
        </div>
        <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-20 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Shield className="w-5 h-5 text-primary" /></div>
              <div><h1 className="text-2xl font-bold text-foreground">Admin Console</h1><p className="text-sm text-muted-foreground">MRC GlobalPay Management</p></div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2"><LogOut className="w-4 h-4" /> Sign Out</Button>
          </div>

          <Tabs value={adminTab} onValueChange={(v) => setAdminTab(v as any)}>
            <TabsList className="bg-card/60 backdrop-blur-sm border border-border/40 flex-wrap">
              <TabsTrigger value="exchanges" className="gap-2 data-[state=active]:bg-primary/10"><TrendingUp className="w-4 h-4" /> Exchanges</TabsTrigger>
              <TabsTrigger value="invoices" className="gap-2 data-[state=active]:bg-primary/10"><FileText className="w-4 h-4" /> Invoices</TabsTrigger>
              <TabsTrigger value="partners" className="gap-2 data-[state=active]:bg-primary/10"><Users className="w-4 h-4" /> Partners</TabsTrigger>
              <TabsTrigger value="proxy" className="gap-2 data-[state=active]:bg-primary/10"><Zap className="w-4 h-4" /> Proxy Bridge</TabsTrigger>
              <TabsTrigger value="lending" className="gap-2 data-[state=active]:bg-primary/10"><Landmark className="w-4 h-4" /> Lending ({lendEarnTxs.length})</TabsTrigger>
              <TabsTrigger value="support" className="gap-2 data-[state=active]:bg-primary/10"><MessageCircle className="w-4 h-4" /> Support ({chatLogs.length})</TabsTrigger>
            </TabsList>

            {/* ═══ EXCHANGES ═══ */}
            <TabsContent value="exchanges" className="mt-6"><ExchangeTracker /></TabsContent>

            {/* ═══ INVOICES ═══ */}
            <TabsContent value="invoices" className="mt-6"><InvoiceManager /></TabsContent>

            {/* ═══ PARTNERS (Enhanced) ═══ */}
            <TabsContent value="partners" className="mt-6 space-y-6">
              {/* Split volume metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm"><CardContent className="p-5 flex items-center gap-3"><Users className="w-5 h-5 text-primary" /><div><p className="text-xs text-muted-foreground">Partners</p><p className="text-2xl font-bold text-foreground">{partners.length}</p></div></CardContent></Card>
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm"><CardContent className="p-5 flex items-center gap-3"><Link2 className="w-5 h-5 text-emerald-400" /><div><p className="text-xs text-muted-foreground">Affiliate Vol</p><p className="text-xl font-bold text-foreground">${affiliateVolume.toLocaleString("en-US", { minimumFractionDigits: 0 })}</p></div></CardContent></Card>
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm"><CardContent className="p-5 flex items-center gap-3"><Code2 className="w-5 h-5 text-blue-400" /><div><p className="text-xs text-muted-foreground">Developer Vol</p><p className="text-xl font-bold text-foreground">${developerVolume.toLocaleString("en-US", { minimumFractionDigits: 0 })}</p></div></CardContent></Card>
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm"><CardContent className="p-5 flex items-center gap-3"><DollarSign className="w-5 h-5 text-primary" /><div><p className="text-xs text-muted-foreground">Gross MSB Profit</p><p className="text-xl font-bold text-foreground">${grossMsbProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p></div></CardContent></Card>
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm"><CardContent className="p-5 flex items-center gap-3"><Bitcoin className="w-5 h-5 text-amber-400" /><div><p className="text-xs text-muted-foreground">Unpaid BTC</p><p className="text-xl font-bold text-foreground">{totalUnpaid.toFixed(8)}</p></div></CardContent></Card>
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm"><CardContent className="p-5 flex items-center gap-3"><Check className="w-5 h-5 text-primary" /><div><p className="text-xs text-muted-foreground">Lifetime Paid</p><p className="text-xl font-bold text-foreground">{totalPaid.toFixed(8)}</p></div></CardContent></Card>
              </div>

              {/* Partner Directory with search, tier badges, 2FA, API status */}
              <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2"><Users className="w-5 h-5" /> Partner Directory</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={partnerSearch} onChange={e => setPartnerSearch(e.target.value)} placeholder="Search name, wallet, code…" className="ps-9 h-9 bg-background/50 border-border/50 text-sm" />
                  </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>2FA</TableHead>
                        <TableHead>API Keys</TableHead>
                        <TableHead>Last Heartbeat</TableHead>
                        <TableHead>Affiliate Link</TableHead>
                        <TableHead>BTC Wallet</TableHead>
                        <TableHead className="text-right">Volume</TableHead>
                        <TableHead className="text-right">Earned</TableHead>
                        <TableHead className="text-right">Unpaid</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPartners.map((p) => {
                        const ptxs = transactions.filter((t) => t.partner_id === p.id);
                        const pVolume = ptxs.reduce((s, t) => s + Number(t.volume), 0);
                        const pEarned = ptxs.reduce((s, t) => s + Number(t.commission_btc), 0);
                        const pUnpaid = ptxs.filter((t) => !t.is_paid).reduce((s, t) => s + Number(t.commission_btc), 0);
                        const partnerIsDev = isDeveloper(p.id);
                        const partnerHasTotp = hasTOTP(p.id);
                        const pKeys = getPartnerKeys(p.id);
                        const activeKeys = pKeys.filter(k => k.is_active);
                        const lastHeartbeat = pKeys.reduce<string | null>((latest, k) => {
                          if (!k.last_used_at) return latest;
                          if (!latest) return k.last_used_at;
                          return new Date(k.last_used_at) > new Date(latest) ? k.last_used_at : latest;
                        }, null);
                        const affiliateLink = `https://mrcglobalpay.com/?ref=${p.referral_code}`;
                        return (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium">{p.first_name} {p.last_name}</TableCell>
                            <TableCell>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${partnerIsDev ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                                {partnerIsDev ? "Developer" : "Affiliate"}
                              </span>
                            </TableCell>
                            <TableCell>
                              {partnerHasTotp ? (
                                <span className="text-xs text-primary flex items-center gap-1"><Shield className="w-3 h-3" /> Active</span>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {partnerIsDev ? (
                                <span className="text-xs font-mono">{activeKeys.length} active</span>
                              ) : <span className="text-xs text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell>
                              {lastHeartbeat ? (
                                <span className="text-xs text-muted-foreground flex items-center gap-1"><Activity className="w-3 h-3 text-primary" />{new Date(lastHeartbeat).toLocaleString()}</span>
                              ) : <span className="text-xs text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground max-w-[200px]">
                              <div className="flex items-center gap-1">
                                <span className="truncate">{affiliateLink}</span>
                                <button onClick={() => { navigator.clipboard.writeText(affiliateLink); toast({ title: "Copied" }); }} className="flex-shrink-0 p-1 rounded hover:bg-muted/50"><Copy className="w-3 h-3" /></button>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground max-w-[180px]">
                              <div className="flex items-center gap-1">
                                <span className="truncate">{p.btc_wallet}</span>
                                <button onClick={() => copyWallet(p.btc_wallet)} className="flex-shrink-0 p-1 rounded hover:bg-muted/50"><Copy className="w-3 h-3" /></button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">${pVolume.toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell className="text-right font-mono">{pEarned.toFixed(8)}</TableCell>
                            <TableCell className="text-right font-mono text-amber-400">{pUnpaid.toFixed(8)}</TableCell>
                            <TableCell>
                              {activeKeys.length > 0 && (
                                <Button size="sm" variant="destructive" className="text-xs gap-1" onClick={() => {
                                  activeKeys.forEach(k => emergencyRevokeKey(k.key_id, p.id));
                                }}>
                                  <XCircle className="w-3 h-3" /> Revoke All
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Transactions & Payouts */}
              <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-lg">Transactions & Payouts</CardTitle></CardHeader>
                <CardContent>
                  <Tabs value={tab} onValueChange={setTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="current">Current Month</TabsTrigger>
                      <TabsTrigger value="unpaid">Unpaid ({unpaidTxs.length})</TabsTrigger>
                      <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="current"><TxTable txs={currentMonthTxs} showPay /></TabsContent>
                    <TabsContent value="unpaid"><TxTable txs={unpaidTxs} showPay /></TabsContent>
                    <TabsContent value="history">
                      {Object.keys(historyGrouped).length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No historical transactions.</p>
                      ) : Object.entries(historyGrouped).map(([month, txs]) => (
                        <div key={month} className="mb-6"><h3 className="font-semibold text-foreground mb-2">{month}</h3><TxTable txs={txs} /></div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══ PROXY BRIDGE (New Tab) ═══ */}
            <TabsContent value="proxy" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm"><CardContent className="p-5 flex items-center gap-3"><Zap className="w-5 h-5 text-primary" /><div><p className="text-xs text-muted-foreground">Proxied Orders</p><p className="text-2xl font-bold text-foreground">{proxyTxs.length}</p></div></CardContent></Card>
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm"><CardContent className="p-5 flex items-center gap-3"><TrendingUp className="w-5 h-5 text-primary" /><div><p className="text-xs text-muted-foreground">Proxy Volume</p><p className="text-xl font-bold text-foreground">${proxyTxs.reduce((s, t) => s + Number(t.volume), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p></div></CardContent></Card>
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm"><CardContent className="p-5 flex items-center gap-3"><AlertTriangle className="w-5 h-5 text-amber-400" /><div><p className="text-xs text-muted-foreground">Failed Relays</p><p className="text-2xl font-bold text-foreground">{failedProxyTxs.length}</p></div></CardContent></Card>
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm"><CardContent className="p-5 flex items-center gap-3"><Key className="w-5 h-5 text-primary" /><div><p className="text-xs text-muted-foreground">Active API Keys</p><p className="text-2xl font-bold text-foreground">{apiKeys.filter(k => k.is_active).length}</p></div></CardContent></Card>
              </div>

              <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2"><Zap className="w-5 h-5" /> Proxy Bridge — ID Mapping</CardTitle>
                  <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={proxySearch} onChange={e => setProxySearch(e.target.value)} placeholder="Search MRC ID, CN ID, partner…" className="ps-9 h-9 bg-background/50 border-border/50 text-sm" />
                  </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>MRC Transaction ID</TableHead>
                        <TableHead>ChangeNOW Order ID</TableHead>
                        <TableHead>Partner</TableHead>
                        <TableHead>Asset</TableHead>
                        <TableHead className="text-right">Volume</TableHead>
                        <TableHead className="text-right">Commission</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Webhook</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProxyTxs.length === 0 ? (
                        <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No proxy transactions yet.</TableCell></TableRow>
                      ) : filteredProxyTxs.map(tx => {
                        const whd = webhookDeliveries.find((w: any) => w.mrc_transaction_id === tx.mrc_transaction_id);
                        const whStatus = whd ? whd.status : "—";
                        return (
                        <TableRow key={tx.id}>
                          <TableCell className="font-mono text-xs text-primary">{tx.mrc_transaction_id || "—"}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{tx.changenow_order_id || "—"}</TableCell>
                          <TableCell className="text-sm">{getPartnerName(tx.partner_id)}</TableCell>
                          <TableCell className="uppercase text-sm">{tx.asset}</TableCell>
                          <TableCell className="text-right">${Number(tx.volume).toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{Number(tx.commission_btc).toFixed(8)}</TableCell>
                          <TableCell>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              tx.status === "success" ? "bg-emerald-500/20 text-emerald-400" :
                              tx.status === "failed" ? "bg-red-500/20 text-red-400" :
                              "bg-amber-500/20 text-amber-400"
                            }`}>
                              {tx.status || "pending"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              whStatus === "delivered" ? "bg-emerald-500/20 text-emerald-400" :
                              whStatus === "failed" ? "bg-red-500/20 text-red-400" :
                              whStatus === "pending" ? "bg-amber-500/20 text-amber-400" :
                              "text-muted-foreground"
                            }`}>
                              {whStatus === "—" ? "—" : whStatus.charAt(0).toUpperCase() + whStatus.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{new Date(tx.completed_at).toLocaleString()}</TableCell>
                        </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Failed relay logs */}
              {failedProxyTxs.length > 0 && (
                <Card className="border-red-500/30 bg-card/40 backdrop-blur-sm">
                  <CardHeader><CardTitle className="text-lg flex items-center gap-2 text-red-400"><AlertTriangle className="w-5 h-5" /> Failed Relay Logs</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {failedProxyTxs.map(tx => (
                      <div key={tx.id} className="rounded-lg p-3 bg-background/50 border border-border/30">
                        <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
                          {JSON.stringify({ mrc_id: tx.mrc_transaction_id, partner: getPartnerName(tx.partner_id), asset: tx.asset, volume: tx.volume, status: tx.status, date: tx.completed_at }, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ═══ LENDING ═══ */}
            <TabsContent value="lending" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm"><CardContent className="p-5 flex items-center gap-3"><Landmark className="w-5 h-5 text-primary" /><div><p className="text-xs text-muted-foreground">Total Submissions</p><p className="text-2xl font-bold text-foreground">{lendEarnTxs.length}</p></div></CardContent></Card>
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm"><CardContent className="p-5 flex items-center gap-3"><Lock className="w-5 h-5 text-primary" /><div><p className="text-xs text-muted-foreground">Loans</p><p className="text-2xl font-bold text-foreground">{lendEarnTxs.filter(t => t.tx_type === "loan").length}</p></div></CardContent></Card>
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm"><CardContent className="p-5 flex items-center gap-3"><Percent className="w-5 h-5 text-primary" /><div><p className="text-xs text-muted-foreground">Earn Deposits</p><p className="text-2xl font-bold text-foreground">{lendEarnTxs.filter(t => t.tx_type === "earn").length}</p></div></CardContent></Card>
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm"><CardContent className="p-5 flex items-center gap-3"><Users className="w-5 h-5 text-primary" /><div><p className="text-xs text-muted-foreground">Unique Clients</p><p className="text-2xl font-bold text-foreground">{new Set(lendEarnTxs.map(t => t.email)).size}</p></div></CardContent></Card>
              </div>
              <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Landmark className="w-5 h-5" /> Loan & Earn Client Directory</CardTitle></CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Currency</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Loan Currency</TableHead><TableHead className="text-right">Loan Amt</TableHead><TableHead className="text-right">LTV %</TableHead><TableHead className="text-right">APY %</TableHead><TableHead>Status</TableHead><TableHead>Lang</TableHead><TableHead>TX ID</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {lendEarnTxs.length === 0 ? (
                        <TableRow><TableCell colSpan={13} className="text-center text-muted-foreground py-8">No loan or earn submissions yet.</TableCell></TableRow>
                      ) : lendEarnTxs.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(tx.created_at).toLocaleString()}</TableCell>
                          <TableCell><span className={`text-xs font-semibold px-2 py-0.5 rounded ${tx.tx_type === "loan" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>{tx.tx_type.toUpperCase()}</span></TableCell>
                          <TableCell className="text-sm">{tx.email}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{tx.phone || "—"}</TableCell>
                          <TableCell className="uppercase font-mono text-sm">{tx.currency}</TableCell>
                          <TableCell className="text-right font-mono">{Number(tx.amount).toLocaleString("en-US", { maximumFractionDigits: 8 })}</TableCell>
                          <TableCell className="uppercase font-mono text-sm">{tx.loan_currency || "—"}</TableCell>
                          <TableCell className="text-right font-mono">{tx.loan_amount ? `$${Number(tx.loan_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}</TableCell>
                          <TableCell className="text-right">{tx.ltv_percent ? `${tx.ltv_percent}%` : "—"}</TableCell>
                          <TableCell className="text-right">{tx.apy_percent ? `${tx.apy_percent}%` : "—"}</TableCell>
                          <TableCell><span className="text-xs capitalize">{tx.status}</span></TableCell>
                          <TableCell className="text-xs uppercase">{tx.language}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground max-w-[120px] truncate" title={tx.external_tx_id}>{tx.external_tx_id || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══ SUPPORT ═══ */}
            <TabsContent value="support" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm"><CardContent className="p-5 flex items-center gap-3"><MessageCircle className="w-5 h-5 text-primary" /><div><p className="text-xs text-muted-foreground">Total Questions</p><p className="text-2xl font-bold text-foreground">{chatLogs.length}</p></div></CardContent></Card>
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm"><CardContent className="p-5 flex items-center gap-3"><Users className="w-5 h-5 text-primary" /><div><p className="text-xs text-muted-foreground">Unique Sessions</p><p className="text-2xl font-bold text-foreground">{new Set(chatLogs.map((l) => l.session_id)).size}</p></div></CardContent></Card>
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm"><CardContent className="p-5 flex items-center gap-3"><TrendingUp className="w-5 h-5 text-primary" /><div><p className="text-xs text-muted-foreground">Today</p><p className="text-2xl font-bold text-foreground">{chatLogs.filter((l) => new Date(l.created_at).toDateString() === new Date().toDateString()).length}</p></div></CardContent></Card>
              </div>
              <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2"><MessageCircle className="w-5 h-5" /> Customer Questions</CardTitle>
                  {chatLogs.length > 0 && <Button size="sm" variant="destructive" onClick={deleteAllChatLogs} className="gap-1 text-xs"><Trash2 className="w-3 h-3" /> Clear All</Button>}
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Agent</TableHead><TableHead>Customer Question</TableHead><TableHead>AI Response</TableHead><TableHead>Page</TableHead><TableHead /></TableRow></TableHeader>
                    <TableBody>
                      {chatLogs.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No support conversations yet.</TableCell></TableRow>
                      ) : chatLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</TableCell>
                          <TableCell className="text-sm whitespace-nowrap">{log.persona_name}</TableCell>
                          <TableCell className="max-w-[250px]"><p className="text-sm truncate" title={log.user_message}>{log.user_message}</p></TableCell>
                          <TableCell className="max-w-[300px]"><p className="text-xs text-muted-foreground truncate" title={log.ai_response}>{log.ai_response}</p></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{log.page_url || "/"}</TableCell>
                          <TableCell><button onClick={() => deleteChatLog(log.id)} className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <SiteFooter />
    </>
  );
};

export default AdminPortal;
