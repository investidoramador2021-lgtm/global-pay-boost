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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, Users, Bitcoin, TrendingUp, Check, LogOut, Lock, MessageCircle,
  Trash2, DollarSign, Copy, FileText, Landmark, Percent, Key, Activity,
  AlertTriangle, Search, Code2, Link2, Zap, XCircle, Upload, Mail, ExternalLink,
  ShieldAlert, FileUp, Clock, Eye, Wallet,
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
  request_payload?: any;
  provider_response?: any;
}

interface PayoutReq {
  id: string;
  partner_id: string;
  amount_btc: number;
  wallet_address: string;
  status: string;
  payout_txid: string;
  admin_notes: string;
  requested_at: string;
  processed_at: string | null;
}

interface ComplianceHold {
  id: string;
  partner_transaction_id: string | null;
  partner_id: string;
  hold_type: string;
  provider_case_id: string;
  status: string;
  upload_token: string;
  upload_token_expires_at: string | null;
  admin_notes: string;
  partner_notified_at: string | null;
  resolved_at: string | null;
  created_at: string;
}

type Stage = "login" | "mfa-enroll" | "mfa-verify" | "dashboard";

const COMPLIANCE_BLUE = "#00A3FF";

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
  const [adminTab, setAdminTab] = useState<"partners" | "exchanges" | "invoices" | "support" | "lending" | "proxy" | "payouts" | "compliance" | "affiliates">("exchanges");
  const [complianceHolds, setComplianceHolds] = useState<ComplianceHold[]>([]);
  const [affiliateLeads, setAffiliateLeads] = useState<Array<{ id: string; email: string; btc_wallet: string; ref_token: string; theme: string; source: string; created_at: string; partner_id?: string | null }>>([]);
  const [commissions, setCommissions] = useState<Array<{ id: string; partner_id: string; ref_code: string; source: string; provider: string; from_currency: string; to_currency: string; swap_amount: number; volume_usd: number; commission_rate: number; commission_btc: number; created_at: string }>>([]);
  const [runningCron, setRunningCron] = useState(false);
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [lendEarnTxs, setLendEarnTxs] = useState<LendEarnTx[]>([]);
  const [webhookDeliveries, setWebhookDeliveries] = useState<any[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutReq[]>([]);
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
    const [pRes, txRes, logRes, leRes, devRes, keyRes, whRes, poRes, chRes, alRes, cmRes] = await Promise.all([
      supabase.from("partner_profiles").select("*"),
      supabase.from("partner_transactions").select("*").order("completed_at", { ascending: false }),
      supabase.from("support_chat_logs" as any).select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("lend_earn_transactions" as any).select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("developer_profiles").select("*"),
      supabase.from("partner_api_keys").select("*").order("created_at", { ascending: false }),
      supabase.from("webhook_deliveries" as any).select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("payout_requests" as any).select("*").order("requested_at", { ascending: false }),
      supabase.from("compliance_holds" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("affiliate_leads" as any).select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("partner_commissions" as any).select("*").order("created_at", { ascending: false }).limit(500),
    ]);
    setPartners((pRes.data || []) as Partner[]);
    setTransactions((txRes.data || []) as Tx[]);
    setChatLogs((logRes.data as unknown as ChatLog[]) || []);
    setLendEarnTxs((leRes.data as unknown as LendEarnTx[]) || []);
    setDevProfiles((devRes.data || []) as unknown as DevProfile[]);
    setApiKeys((keyRes.data || []) as unknown as ApiKeyRow[]);
    setWebhookDeliveries((whRes.data || []) as any[]);
    setPayoutRequests((poRes.data || []) as unknown as PayoutReq[]);
    setComplianceHolds((chRes.data || []) as unknown as ComplianceHold[]);
    setAffiliateLeads((alRes.data || []) as any[]);
    setCommissions((cmRes.data || []) as any[]);
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

  const markPayoutPaid = async (payoutId: string, txid: string) => {
    const { error } = await supabase.from("payout_requests" as any).update({
      status: "paid",
      payout_txid: txid,
      processed_at: new Date().toISOString(),
    } as any).eq("id", payoutId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setPayoutRequests(prev => prev.map(p => p.id === payoutId ? { ...p, status: "paid", payout_txid: txid, processed_at: new Date().toISOString() } : p));
    toast({ title: "Payout marked as Paid" });
  };

  const rejectPayout = async (payoutId: string) => {
    const { error } = await supabase.from("payout_requests" as any).update({
      status: "rejected",
      processed_at: new Date().toISOString(),
    } as any).eq("id", payoutId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setPayoutRequests(prev => prev.map(p => p.id === payoutId ? { ...p, status: "rejected", processed_at: new Date().toISOString() } : p));
    toast({ title: "Payout rejected" });
  };

  const [payoutTxidInputs, setPayoutTxidInputs] = useState<Record<string, string>>({});
  const [complianceDrawerOpen, setComplianceDrawerOpen] = useState(false);
  const [selectedHold, setSelectedHold] = useState<ComplianceHold | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [complianceLogs, setComplianceLogs] = useState<any[]>([]);

  const copyWallet = (wallet: string) => { navigator.clipboard.writeText(wallet); toast({ title: "Wallet copied" }); };

  // Crisis notification: pulse when action_required holds exist
  const actionRequiredCount = complianceHolds.filter(h => h.status === "action_required").length;
  useEffect(() => {
    if (actionRequiredCount > 0 && stage === "dashboard" && "Notification" in window && Notification.permission === "granted") {
      new Notification("🛡️ Compliance Alert", { body: `${actionRequiredCount} transaction(s) require immediate action.`, icon: "/placeholder.svg" });
    }
  }, [actionRequiredCount, stage]);

  // Sort proxy txs: action_required at top
  const sortedFilteredProxyTxs = useMemo(() => {
    const statusPriority = (s: string | undefined) => s === "action_required" ? 0 : s === "manual_hold" ? 0 : 1;
    return [...filteredProxyTxs].sort((a, b) => statusPriority(a.status) - statusPriority(b.status));
  }, [filteredProxyTxs]);

  // Open compliance drawer
  const openComplianceDrawer = async (hold: ComplianceHold) => {
    setSelectedHold(hold);
    setComplianceDrawerOpen(true);
    setUploadFile(null);
    // Load logs for this hold
    const { data } = await supabase.from("compliance_logs" as any).select("*").eq("hold_id", hold.id).order("created_at", { ascending: true });
    setComplianceLogs((data || []) as any[]);
  };

  // Upload compliance document
  const handleComplianceUpload = async () => {
    if (!uploadFile || !selectedHold) return;
    setUploadLoading(true);
    try {
      const filePath = `${selectedHold.id}/${Date.now()}_${uploadFile.name}`;
      const { error: storageErr } = await supabase.storage.from("compliance-docs").upload(filePath, uploadFile);
      if (storageErr) throw storageErr;
      // Log document in compliance_documents
      await supabase.from("compliance_documents" as any).insert({
        hold_id: selectedHold.id,
        file_name: uploadFile.name,
        file_url: filePath,
        uploaded_by: "admin",
        metadata: { size: uploadFile.size, type: uploadFile.type },
      } as any);
      // Log event
      await supabase.from("compliance_logs" as any).insert({
        hold_id: selectedHold.id,
        event_type: "document_relayed",
        actor: "admin",
        details: `Uploaded: ${uploadFile.name}`,
      } as any);
      setUploadFile(null);
      toast({ title: "Document uploaded", description: uploadFile.name });
      // Refresh logs
      const { data } = await supabase.from("compliance_logs" as any).select("*").eq("hold_id", selectedHold.id).order("created_at", { ascending: true });
      setComplianceLogs((data || []) as any[]);
    } catch (err: any) { toast({ title: "Upload failed", description: err.message, variant: "destructive" }); }
    finally { setUploadLoading(false); }
  };

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
        <Helmet><title>Admin Login | MRC GlobalPay</title><meta name="robots" content="index, follow" /></Helmet>
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
        <Helmet><title>Setup 2FA | MRC GlobalPay</title><meta name="robots" content="index, follow" /></Helmet>
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
        <Helmet><title>2FA Verification | MRC GlobalPay</title><meta name="robots" content="index, follow" /></Helmet>
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
      <Helmet><title>Admin Portal | MRC GlobalPay</title><meta name="robots" content="index, follow" /></Helmet>
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
              <TabsTrigger value="payouts" className="gap-2 data-[state=active]:bg-primary/10"><DollarSign className="w-4 h-4" /> Payouts ({payoutRequests.filter(p => p.status === "pending").length})</TabsTrigger>
              <TabsTrigger value="lending" className="gap-2 data-[state=active]:bg-primary/10"><Landmark className="w-4 h-4" /> Lending ({lendEarnTxs.length})</TabsTrigger>
              <TabsTrigger value="support" className="gap-2 data-[state=active]:bg-primary/10"><MessageCircle className="w-4 h-4" /> Support ({chatLogs.length})</TabsTrigger>
              <TabsTrigger value="compliance" className="gap-2" style={{ color: adminTab === "compliance" ? COMPLIANCE_BLUE : undefined }} data-state={adminTab === "compliance" ? "active" : "inactive"}><ShieldAlert className="w-4 h-4" style={{ color: COMPLIANCE_BLUE }} /> Compliance ({complianceHolds.filter(h => h.status === "action_required").length})</TabsTrigger>
              <TabsTrigger value="affiliates" className="gap-2 data-[state=active]:bg-primary/10"><Wallet className="w-4 h-4" /> Affiliates ({affiliateLeads.length})</TabsTrigger>
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
                      {sortedFilteredProxyTxs.length === 0 ? (
                        <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No proxy transactions yet.</TableCell></TableRow>
                      ) : sortedFilteredProxyTxs.map(tx => {
                        const whd = webhookDeliveries.find((w: any) => w.mrc_transaction_id === tx.mrc_transaction_id);
                        const whStatus = whd ? whd.status : "—";
                        const isHeld = tx.status === "action_required" || tx.status === "manual_hold";
                        const holdForTx = isHeld ? complianceHolds.find(h => h.partner_transaction_id === tx.id && h.status === "action_required") : null;
                        return (
                        <TableRow key={tx.id} className={isHeld ? "border-l-2 cursor-pointer hover:bg-[#00A3FF]/5" : ""} style={isHeld ? { borderLeftColor: COMPLIANCE_BLUE } : {}}
                          onClick={() => { if (holdForTx) openComplianceDrawer(holdForTx); }}
                        >
                          <TableCell className="font-mono text-xs text-primary">
                            <div className="flex items-center gap-1.5">
                              {isHeld && <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: COMPLIANCE_BLUE }} /><span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: COMPLIANCE_BLUE }} /></span>}
                              {tx.mrc_transaction_id || "—"}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{tx.changenow_order_id || "—"}</TableCell>
                          <TableCell className="text-sm">{getPartnerName(tx.partner_id)}</TableCell>
                          <TableCell className="uppercase text-sm">{tx.asset}</TableCell>
                          <TableCell className="text-right">${Number(tx.volume).toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{Number(tx.commission_btc).toFixed(8)}</TableCell>
                          <TableCell>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              tx.status === "success" ? "bg-emerald-500/20 text-emerald-400" :
                              tx.status === "failed" ? "bg-red-500/20 text-red-400" :
                              isHeld ? "" :
                              "bg-amber-500/20 text-amber-400"
                            }`} style={isHeld ? { background: `${COMPLIANCE_BLUE}20`, color: COMPLIANCE_BLUE } : {}}>
                              {isHeld ? "⚠ Action Required" : (tx.status || "pending")}
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

              {/* Strategic Intervention Logs */}
              <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="w-5 h-5" /> Strategic Intervention Logs</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {proxyTxs.filter(tx => tx.request_payload && Object.keys(tx.request_payload).length > 0).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No payload traces recorded yet. Traces are logged automatically for all API transactions.</p>
                  ) : proxyTxs.filter(tx => tx.request_payload && Object.keys(tx.request_payload).length > 0).slice(0, 20).map(tx => (
                    <div key={`trace-${tx.id}`} className="rounded-lg p-4 bg-background/50 border border-border/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono text-primary">{tx.mrc_transaction_id}</code>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${tx.status === "success" ? "bg-emerald-500/20 text-emerald-400" : tx.status === "failed" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}>{tx.status || "pending"}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{getPartnerName(tx.partner_id)}</span>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Partner Request</span>
                          <pre className="text-xs font-mono text-muted-foreground p-2 rounded bg-black/30 overflow-x-auto max-h-32">{JSON.stringify(tx.request_payload, null, 2)}</pre>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Provider Response</span>
                          <pre className="text-xs font-mono text-muted-foreground p-2 rounded bg-black/30 overflow-x-auto max-h-32">{JSON.stringify(tx.provider_response, null, 2)}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══ PAYOUTS ═══ */}
            <TabsContent value="payouts" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm"><CardContent className="p-5 flex items-center gap-3"><DollarSign className="w-5 h-5 text-primary" /><div><p className="text-xs text-muted-foreground">Pending Requests</p><p className="text-2xl font-bold text-foreground">{payoutRequests.filter(p => p.status === "pending").length}</p></div></CardContent></Card>
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm"><CardContent className="p-5 flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /><div><p className="text-xs text-muted-foreground">Completed Payouts</p><p className="text-2xl font-bold text-foreground">{payoutRequests.filter(p => p.status === "paid").length}</p></div></CardContent></Card>
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm"><CardContent className="p-5 flex items-center gap-3"><Bitcoin className="w-5 h-5 text-amber-400" /><div><p className="text-xs text-muted-foreground">Total Paid Out</p><p className="text-xl font-bold text-foreground font-mono">{payoutRequests.filter(p => p.status === "paid").reduce((s, p) => s + p.amount_btc, 0).toFixed(8)} BTC</p></div></CardContent></Card>
              </div>

              <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><DollarSign className="w-5 h-5" /> Payout Requests</CardTitle></CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Status</TableHead><TableHead>Partner</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Wallet</TableHead><TableHead>Payout TXID</TableHead><TableHead>Requested</TableHead><TableHead>Actions</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {payoutRequests.length === 0 ? (
                        <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No payout requests.</TableCell></TableRow>
                      ) : payoutRequests.map(p => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${p.status === "paid" ? "bg-emerald-500/20 text-emerald-400" : p.status === "rejected" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}>
                              {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">{getPartnerName(p.partner_id)}</TableCell>
                          <TableCell className="text-right font-mono text-sm">{p.amount_btc.toFixed(8)} BTC</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground max-w-[180px]">
                            <div className="flex items-center gap-1">
                              <span className="truncate">{p.wallet_address}</span>
                              <button onClick={() => { navigator.clipboard.writeText(p.wallet_address); toast({ title: "Copied" }); }} className="shrink-0 p-1 rounded hover:bg-muted/50"><Copy className="w-3 h-3" /></button>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{p.payout_txid || "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(p.requested_at).toLocaleString()}</TableCell>
                          <TableCell>
                            {p.status === "pending" && (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={payoutTxidInputs[p.id] || ""}
                                  onChange={e => setPayoutTxidInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                                  placeholder="Payout TXID"
                                  className="h-7 text-xs w-40 bg-background/50 border-border/50"
                                />
                                <Button size="sm" variant="outline" className="text-xs h-7 gap-1" disabled={!payoutTxidInputs[p.id]} onClick={() => markPayoutPaid(p.id, payoutTxidInputs[p.id] || "")}><Check className="w-3 h-3" /> Paid</Button>
                                <Button size="sm" variant="destructive" className="text-xs h-7 gap-1" onClick={() => rejectPayout(p.id)}><XCircle className="w-3 h-3" /> Reject</Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
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

            {/* ═══ COMPLIANCE INTERCEPT ═══ */}
            <TabsContent value="compliance" className="mt-6 space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm" style={{ borderColor: `${COMPLIANCE_BLUE}30` }}><CardContent className="p-5 flex items-center gap-3"><ShieldAlert className="w-5 h-5" style={{ color: COMPLIANCE_BLUE }} /><div><p className="text-xs text-muted-foreground">Action Required</p><p className="text-2xl font-bold text-foreground">{complianceHolds.filter(h => h.status === "action_required").length}</p></div></CardContent></Card>
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm"><CardContent className="p-5 flex items-center gap-3"><Shield className="w-5 h-5" style={{ color: COMPLIANCE_BLUE }} /><div><p className="text-xs text-muted-foreground">Total Holds</p><p className="text-2xl font-bold text-foreground">{complianceHolds.length}</p></div></CardContent></Card>
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm"><CardContent className="p-5 flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /><div><p className="text-xs text-muted-foreground">Resolved</p><p className="text-2xl font-bold text-foreground">{complianceHolds.filter(h => h.status === "resolved").length}</p></div></CardContent></Card>
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm"><CardContent className="p-5 flex items-center gap-3"><Mail className="w-5 h-5" style={{ color: COMPLIANCE_BLUE }} /><div><p className="text-xs text-muted-foreground">Partners Notified</p><p className="text-2xl font-bold text-foreground">{complianceHolds.filter(h => h.partner_notified_at).length}</p></div></CardContent></Card>
              </div>

              {/* Manual Flag Button */}
              <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2" style={{ color: COMPLIANCE_BLUE }}>
                    <ShieldAlert className="w-5 h-5" /> Compliance Queue
                  </CardTitle>
                  <Button
                    size="sm"
                    className="gap-1 text-xs"
                    style={{ background: COMPLIANCE_BLUE, color: "#fff" }}
                    onClick={async () => {
                      const txId = prompt("Enter Partner Transaction ID to flag:");
                      if (!txId) return;
                      const tx = transactions.find(t => t.mrc_transaction_id === txId || t.id === txId);
                      if (!tx) { toast({ title: "Transaction not found", variant: "destructive" }); return; }
                      const holdType = prompt("Hold type (hold / kyc / aml):", "hold") || "hold";
                      const caseId = prompt("Provider Case ID (optional):", "") || "";
                      const { data, error } = await supabase.from("compliance_holds" as any).insert({
                        partner_transaction_id: tx.id,
                        partner_id: tx.partner_id,
                        hold_type: holdType,
                        provider_case_id: caseId,
                      } as any).select().single();
                      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
                      setComplianceHolds(prev => [data as unknown as ComplianceHold, ...prev]);
                      // Update tx status
                      await supabase.from("partner_transactions").update({ status: "action_required" } as any).eq("id", tx.id);
                      setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, status: "action_required" } : t));
                      toast({ title: "Transaction flagged for compliance review" });
                    }}
                  >
                    <AlertTriangle className="w-3 h-3" /> Flag Transaction
                  </Button>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead style={{ color: COMPLIANCE_BLUE }}>Type</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Case ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notified</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {complianceHolds.length === 0 ? (
                        <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No compliance holds. Transactions are flagged automatically when the provider returns hold/kyc/aml status.</TableCell></TableRow>
                      ) : complianceHolds.map(hold => {
                        const linkedTx = transactions.find(t => t.id === hold.partner_transaction_id);
                        return (
                          <TableRow key={hold.id} className={hold.status === "action_required" ? "cursor-pointer hover:bg-[#00A3FF]/5" : ""} style={{ borderColor: hold.status === "action_required" ? `${COMPLIANCE_BLUE}30` : undefined }} onClick={() => hold.status === "action_required" && openComplianceDrawer(hold)}>
                            <TableCell>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded uppercase" style={{
                                background: `${COMPLIANCE_BLUE}20`,
                                color: COMPLIANCE_BLUE,
                              }}>
                                {hold.hold_type}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm">{getPartnerName(hold.partner_id)}</TableCell>
                            <TableCell className="font-mono text-xs" style={{ color: COMPLIANCE_BLUE }}>{linkedTx?.mrc_transaction_id || "—"}</TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">{hold.provider_case_id || "—"}</TableCell>
                            <TableCell>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                hold.status === "action_required" ? "" :
                                hold.status === "resolved" ? "bg-emerald-500/20 text-emerald-400" :
                                "bg-amber-500/20 text-amber-400"
                              }`} style={hold.status === "action_required" ? { background: `${COMPLIANCE_BLUE}20`, color: COMPLIANCE_BLUE } : {}}>
                                {hold.status === "action_required" ? "Action Required" : hold.status.charAt(0).toUpperCase() + hold.status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {hold.partner_notified_at ? new Date(hold.partner_notified_at).toLocaleString() : "—"}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{new Date(hold.created_at).toLocaleString()}</TableCell>
                            <TableCell>
                              {hold.status === "action_required" && (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {/* Contact Partner */}
                                  <Button size="sm" variant="outline" className="text-xs h-7 gap-1" style={{ borderColor: `${COMPLIANCE_BLUE}40`, color: COMPLIANCE_BLUE }}
                                    onClick={async () => {
                                      const { data: { session } } = await supabase.auth.getSession();
                                      if (!session) return;
                                      try {
                                        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compliance-notify`, {
                                          method: "POST",
                                          headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
                                          body: JSON.stringify({ action: "notify-partner", hold_id: hold.id, partner_id: hold.partner_id }),
                                        });
                                        const data = await resp.json();
                                        if (data.success) {
                                          setComplianceHolds(prev => prev.map(h => h.id === hold.id ? { ...h, partner_notified_at: new Date().toISOString() } : h));
                                          toast({ title: "Partner notified", description: `Email notification sent to ${data.partner_name}` });
                                        } else { toast({ title: "Error", description: data.error, variant: "destructive" }); }
                                      } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
                                    }}
                                  >
                                    <Mail className="w-3 h-3" /> Notify
                                  </Button>
                                  {/* Generate Upload Link */}
                                  <Button size="sm" variant="outline" className="text-xs h-7 gap-1" style={{ borderColor: `${COMPLIANCE_BLUE}40`, color: COMPLIANCE_BLUE }}
                                    onClick={async () => {
                                      const { data: { session } } = await supabase.auth.getSession();
                                      if (!session) return;
                                      try {
                                        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compliance-notify`, {
                                          method: "POST",
                                          headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
                                          body: JSON.stringify({ action: "generate-upload-link", hold_id: hold.id }),
                                        });
                                        const data = await resp.json();
                                        if (data.success) {
                                          navigator.clipboard.writeText(data.upload_url);
                                          toast({ title: "Upload link copied", description: `Expires: ${new Date(data.expires_at).toLocaleString()}` });
                                        } else { toast({ title: "Error", description: data.error, variant: "destructive" }); }
                                      } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
                                    }}
                                  >
                                    <Upload className="w-3 h-3" /> Link
                                  </Button>
                                  {/* Resolve */}
                                  <Button size="sm" variant="outline" className="text-xs h-7 gap-1 border-emerald-500/40 text-emerald-400"
                                    onClick={async () => {
                                      const notes = prompt("Resolution notes (optional):", "") || "";
                                      const { data: { session } } = await supabase.auth.getSession();
                                      if (!session) return;
                                      try {
                                        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compliance-notify`, {
                                          method: "POST",
                                          headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
                                          body: JSON.stringify({ action: "resolve-hold", hold_id: hold.id, resolution_notes: notes }),
                                        });
                                        const data = await resp.json();
                                        if (data.success) {
                                          setComplianceHolds(prev => prev.map(h => h.id === hold.id ? { ...h, status: "resolved", admin_notes: notes, resolved_at: new Date().toISOString() } : h));
                                          if (hold.partner_transaction_id) {
                                            setTransactions(prev => prev.map(t => t.id === hold.partner_transaction_id ? { ...t, status: "success" } : t));
                                          }
                                          toast({ title: "Hold resolved" });
                                        } else { toast({ title: "Error", description: data.error, variant: "destructive" }); }
                                      } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
                                    }}
                                  >
                                    <Check className="w-3 h-3" /> Resolve
                                  </Button>
                                </div>
                              )}
                              {hold.status === "resolved" && (
                                <span className="text-xs text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Cleared</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Resolution Notes / Admin Notes */}
              {complianceHolds.filter(h => h.admin_notes && h.status === "resolved").length > 0 && (
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
                  <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="w-5 h-5" style={{ color: COMPLIANCE_BLUE }} /> Resolution Log</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {complianceHolds.filter(h => h.admin_notes && h.status === "resolved").map(h => {
                      const linkedTx = transactions.find(t => t.id === h.partner_transaction_id);
                      return (
                        <div key={`res-${h.id}`} className="rounded-lg p-3 bg-background/50 border border-border/30 flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <code className="text-xs font-mono" style={{ color: COMPLIANCE_BLUE }}>{linkedTx?.mrc_transaction_id || h.id.slice(0, 8)}</code>
                              <span className="text-xs uppercase font-semibold px-1.5 py-0.5 rounded" style={{ background: `${COMPLIANCE_BLUE}20`, color: COMPLIANCE_BLUE }}>{h.hold_type}</span>
                              <span className="text-xs text-muted-foreground">{getPartnerName(h.partner_id)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{h.admin_notes}</p>
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{h.resolved_at ? new Date(h.resolved_at).toLocaleString() : ""}</span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ═══ AFFILIATE LEADS ═══ */}
            <TabsContent value="affiliates" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
                  <CardContent className="p-5 flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Total Signups</p>
                      <p className="text-2xl font-bold text-foreground">{affiliateLeads.length}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
                  <CardContent className="p-5 flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Unique Wallets</p>
                      <p className="text-2xl font-bold text-foreground">{new Set(affiliateLeads.map((l) => l.btc_wallet)).size}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
                  <CardContent className="p-5 flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Today</p>
                      <p className="text-2xl font-bold text-foreground">{affiliateLeads.filter((l) => new Date(l.created_at).toDateString() === new Date().toDateString()).length}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wallet className="w-5 h-5" /> Affiliate Signups
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Generated from <code className="text-primary">/affiliates</code>. Maps each opaque <code>ref_token</code> to the affiliate's email and BTC payout wallet.
                  </p>
                </CardHeader>
                <CardContent>
                  {affiliateLeads.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No affiliate signups yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Created</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>BTC Wallet</TableHead>
                          <TableHead>Ref Token</TableHead>
                          <TableHead>Theme</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {affiliateLeads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell className="text-xs whitespace-nowrap">{new Date(lead.created_at).toLocaleString()}</TableCell>
                            <TableCell className="text-xs">{lead.email}</TableCell>
                            <TableCell className="font-mono text-[11px] break-all max-w-[200px]">{lead.btc_wallet}</TableCell>
                            <TableCell>
                              <code className="text-xs text-primary font-mono">{lead.ref_token}</code>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-foreground capitalize">{lead.theme}</span>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{lead.source}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                onClick={() => {
                                  navigator.clipboard.writeText(lead.ref_token);
                                  toast({ title: "Ref token copied", description: lead.ref_token });
                                }}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>


              {/* ═══ COMMISSIONS LEDGER + CRON CONTROL ═══ */}
              <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="w-5 h-5" /> Affiliate Commissions Ledger
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Auto-credited every 2 days at 00:05 UTC. Rates: <code className="text-primary">0.3% ChangeNOW</code> · <code className="text-primary">0.1% LetsExchange</code>. Idempotent per swap.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="gap-2"
                    disabled={runningCron}
                    onClick={async () => {
                      setRunningCron(true);
                      try {
                        const { data: { session } } = await supabase.auth.getSession();
                        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/credit-affiliate-commissions`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
                          },
                        });
                        const json = await resp.json();
                        toast({
                          title: json.ok ? "Commissions cron run complete" : "Cron run failed",
                          description: json.ok
                            ? `Scanned ${json.scanned} · Credited ${json.credited} · ${Number(json.total_btc_credited || 0).toFixed(8)} BTC`
                            : String(json.error || "Unknown error"),
                          variant: json.ok ? "default" : "destructive",
                        });
                        await loadDashboard();
                      } catch (e: any) {
                        toast({ title: "Cron run failed", description: String(e?.message || e), variant: "destructive" });
                      } finally {
                        setRunningCron(false);
                      }
                    }}
                  >
                    <Zap className="w-3.5 h-3.5" /> {runningCron ? "Running…" : "Run cron now"}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-lg border border-border/40 p-3 bg-black/20">
                      <p className="text-[10px] uppercase text-muted-foreground">Total Credits</p>
                      <p className="text-xl font-bold text-foreground">{commissions.length}</p>
                    </div>
                    <div className="rounded-lg border border-border/40 p-3 bg-black/20">
                      <p className="text-[10px] uppercase text-muted-foreground">Total BTC Paid</p>
                      <p className="text-xl font-bold text-primary font-mono">{commissions.reduce((s, c) => s + Number(c.commission_btc || 0), 0).toFixed(8)}</p>
                    </div>
                    <div className="rounded-lg border border-border/40 p-3 bg-black/20">
                      <p className="text-[10px] uppercase text-muted-foreground">Total Volume USD</p>
                      <p className="text-xl font-bold text-foreground font-mono">${commissions.reduce((s, c) => s + Number(c.volume_usd || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="rounded-lg border border-border/40 p-3 bg-black/20">
                      <p className="text-[10px] uppercase text-muted-foreground">Unique Partners</p>
                      <p className="text-xl font-bold text-foreground">{new Set(commissions.map((c) => c.partner_id)).size}</p>
                    </div>
                  </div>

                  {commissions.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No commissions credited yet. Click "Run cron now" to scan recent swaps.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Partner</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Provider</TableHead>
                          <TableHead>Pair</TableHead>
                          <TableHead className="text-right">Volume USD</TableHead>
                          <TableHead className="text-right">Rate</TableHead>
                          <TableHead className="text-right">BTC Credited</TableHead>
                          <TableHead>Ref</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {commissions.slice(0, 100).map((c) => {
                          const partner = partners.find((p) => p.id === c.partner_id);
                          return (
                            <TableRow key={c.id}>
                              <TableCell className="text-xs whitespace-nowrap">{new Date(c.created_at).toLocaleString()}</TableCell>
                              <TableCell className="text-xs">{partner ? `${partner.first_name} ${partner.last_name}` : <span className="text-muted-foreground font-mono">{c.partner_id.slice(0, 8)}…</span>}</TableCell>
                              <TableCell>
                                <span className={`text-[10px] px-2 py-0.5 rounded-md uppercase ${c.source === "affiliate_widget" ? "bg-blue-500/15 text-blue-400" : "bg-cyan-500/15 text-cyan-400"}`}>
                                  {c.source === "affiliate_widget" ? "widget" : "referral"}
                                </span>
                              </TableCell>
                              <TableCell><span className="text-[10px] uppercase font-mono text-muted-foreground">{c.provider}</span></TableCell>
                              <TableCell className="text-xs uppercase font-mono">{c.from_currency} → {c.to_currency}</TableCell>
                              <TableCell className="text-right font-mono text-xs">${Number(c.volume_usd).toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                              <TableCell className="text-right font-mono text-xs">{(Number(c.commission_rate) * 100).toFixed(2)}%</TableCell>
                              <TableCell className="text-right font-mono text-xs text-primary">{Number(c.commission_btc).toFixed(8)}</TableCell>
                              <TableCell><code className="text-[10px] text-muted-foreground">{c.ref_code}</code></TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* ═══ COMPLIANCE ACTION DRAWER ═══ */}
      <Sheet open={complianceDrawerOpen} onOpenChange={setComplianceDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg border-l bg-[#0B0D10] border-[#2a2d35]/60 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-foreground">
              <ShieldAlert className="w-5 h-5" style={{ color: COMPLIANCE_BLUE }} />
              Compliance Action
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Review hold details, generate verification links, and relay documents.
            </SheetDescription>
          </SheetHeader>

          {selectedHold && (() => {
            const linkedTx = transactions.find(t => t.id === selectedHold.partner_transaction_id);
            return (
              <div className="mt-6 space-y-6">
                {/* Transaction Metadata */}
                <div className="rounded-lg border border-[#2a2d35]/60 p-4 space-y-3 bg-black/30">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Hold Metadata</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-[10px] uppercase text-muted-foreground block">Hold Type</span><span className="uppercase font-semibold" style={{ color: COMPLIANCE_BLUE }}>{selectedHold.hold_type}</span></div>
                    <div><span className="text-[10px] uppercase text-muted-foreground block">Status</span><span style={{ color: COMPLIANCE_BLUE }}>{selectedHold.status === "action_required" ? "In-Progress Verification" : selectedHold.status}</span></div>
                    <div><span className="text-[10px] uppercase text-muted-foreground block">Case ID</span><span className="font-mono text-xs">{selectedHold.provider_case_id || "N/A"}</span></div>
                    <div><span className="text-[10px] uppercase text-muted-foreground block">Partner</span><span>{getPartnerName(selectedHold.partner_id)}</span></div>
                    {linkedTx && <>
                      <div><span className="text-[10px] uppercase text-muted-foreground block">MRC ID</span><span className="font-mono text-xs" style={{ color: COMPLIANCE_BLUE }}>{linkedTx.mrc_transaction_id}</span></div>
                      <div><span className="text-[10px] uppercase text-muted-foreground block">Volume</span><span className="font-mono">${Number(linkedTx.volume).toLocaleString()}</span></div>
                      <div><span className="text-[10px] uppercase text-muted-foreground block">Asset</span><span className="uppercase">{linkedTx.asset}</span></div>
                      <div><span className="text-[10px] uppercase text-muted-foreground block">CN Order</span><span className="font-mono text-xs">{linkedTx.changenow_order_id || "—"}</span></div>
                    </>}
                  </div>
                  {linkedTx?.provider_response && Object.keys(linkedTx.provider_response).length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground block mb-1">Provider Hold Reason</span>
                      <pre className="text-xs font-mono text-muted-foreground p-2 rounded bg-black/40 overflow-x-auto max-h-28">{JSON.stringify(linkedTx.provider_response, null, 2)}</pre>
                    </div>
                  )}
                </div>

                {/* Secure Link Generator */}
                <div className="rounded-lg border border-[#2a2d35]/60 p-4 space-y-3 bg-black/30">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5" /> Secure Verification Link</h3>
                  <p className="text-xs text-muted-foreground">Generate a unique, time-limited URL for the partner to submit identity documents.</p>
                  <Button size="sm" className="w-full gap-2 text-xs" style={{ background: COMPLIANCE_BLUE }}
                    onClick={async () => {
                      const { data: { session } } = await supabase.auth.getSession();
                      if (!session) return;
                      try {
                        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compliance-notify`, {
                          method: "POST",
                          headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
                          body: JSON.stringify({ action: "generate-upload-link", hold_id: selectedHold.id }),
                        });
                        const data = await resp.json();
                        if (data.success) {
                          navigator.clipboard.writeText(data.upload_url);
                          toast({ title: "Verification link copied", description: `Expires: ${new Date(data.expires_at).toLocaleString()}` });
                        } else { toast({ title: "Error", description: data.error, variant: "destructive" }); }
                      } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
                    }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Generate & Copy Link
                  </Button>
                </div>

                {/* Document Relay */}
                <div className="rounded-lg border border-[#2a2d35]/60 p-4 space-y-3 bg-black/30">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><FileUp className="w-3.5 h-3.5" /> Document Relay</h3>
                  <p className="text-xs text-muted-foreground">Upload partner-provided ID or Proof of Funds for relay to the liquidity provider.</p>
                  <div
                    className="relative border-2 border-dashed rounded-lg p-6 text-center transition-colors"
                    style={{ borderColor: uploadFile ? COMPLIANCE_BLUE : "#2a2d35" }}
                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={e => { e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer.files[0]; if (f) setUploadFile(f); }}
                  >
                    {uploadFile ? (
                      <div className="space-y-2">
                        <FileText className="w-8 h-8 mx-auto" style={{ color: COMPLIANCE_BLUE }} />
                        <p className="text-sm font-medium">{uploadFile.name}</p>
                        <p className="text-xs text-muted-foreground">{(uploadFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Drag & drop file here, or click to browse</p>
                      </div>
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" style={{ position: "absolute", inset: 0 }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) setUploadFile(f); }}
                    />
                  </div>
                  {uploadFile && (
                    <Button size="sm" className="w-full gap-2 text-xs" style={{ background: COMPLIANCE_BLUE }} disabled={uploadLoading} onClick={handleComplianceUpload}>
                      <Upload className="w-3.5 h-3.5" /> {uploadLoading ? "Uploading…" : "Relay Document"}
                    </Button>
                  )}
                </div>

                {/* Audit Trail */}
                <div className="rounded-lg border border-[#2a2d35]/60 p-4 space-y-3 bg-black/30">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> FINTRAC Audit Trail</h3>
                  {complianceLogs.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-3">No audit events recorded yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {complianceLogs.map((log: any) => (
                        <div key={log.id} className="flex items-start justify-between gap-2 text-xs">
                          <div>
                            <span className="font-semibold" style={{ color: COMPLIANCE_BLUE }}>{log.event_type}</span>
                            <span className="text-muted-foreground ml-2">{log.details}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Release Funds */}
                {selectedHold.status === "action_required" && (
                  <Button className="w-full h-11 text-sm font-semibold gap-2 bg-foreground text-background hover:bg-foreground/90"
                    onClick={async () => {
                      const notes = prompt("Resolution notes (optional):", "") || "";
                      const { data: { session } } = await supabase.auth.getSession();
                      if (!session) return;
                      try {
                        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compliance-notify`, {
                          method: "POST",
                          headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
                          body: JSON.stringify({ action: "resolve-hold", hold_id: selectedHold.id, resolution_notes: notes }),
                        });
                        const data = await resp.json();
                        if (data.success) {
                          setComplianceHolds(prev => prev.map(h => h.id === selectedHold.id ? { ...h, status: "resolved", admin_notes: notes, resolved_at: new Date().toISOString() } : h));
                          if (selectedHold.partner_transaction_id) {
                            setTransactions(prev => prev.map(t => t.id === selectedHold.partner_transaction_id ? { ...t, status: "success" } : t));
                          }
                          setComplianceDrawerOpen(false);
                          toast({ title: "Funds released — hold resolved" });
                        } else { toast({ title: "Error", description: data.error, variant: "destructive" }); }
                      } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
                    }}
                  >
                    <Check className="w-4 h-4" /> Release Funds
                  </Button>
                )}
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>

      <SiteFooter />
    </>
  );
};

export default AdminPortal;
