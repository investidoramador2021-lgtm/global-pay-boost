import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import {
  Shield, Key, Activity, TrendingUp, Copy, Eye, EyeOff, Plus,
  LogOut, RefreshCw, ChevronDown, ChevronUp, Globe, Lock, Trash2,
  CheckCircle2, Clock, XCircle, ArrowRightLeft, AlertTriangle, Loader2,
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
interface ApiKey { id: string; key_id: string; webhook_url: string; ip_whitelist: string[]; is_active: boolean; last_used_at: string | null; created_at: string; }
interface SwapRow { id: string; transaction_id: string; from_currency: string; to_currency: string; amount: number; recipient_address: string; payin_address: string; created_at: string; ref_code: string | null; }
interface PartnerTx { id: string; asset: string; volume: number; commission_btc: number; is_paid: boolean; completed_at: string; }

/* ────────────────────────────────────────────────────────── */
/*  STEP 1 — REGISTRATION                                   */
/* ────────────────────────────────────────────────────────── */
function RegistrationStep({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [entityName, setEntityName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !entityName) { toast({ title: "All fields required", variant: "destructive" }); return; }
    if (password.length < 8) { toast({ title: "Password must be ≥ 8 characters", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/partner-portal" } });
      if (error) throw error;
      toast({ title: "Verification email sent", description: "Check your inbox to verify your account." });
      setStep(2);
    } catch (e: any) { toast({ title: e.message, variant: "destructive" }); }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      onComplete();
    } catch (e: any) { toast({ title: e.message, variant: "destructive" }); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: OBS.bg }}>
      <div className="w-full max-w-md space-y-8">
        {/* Abstract M Logo */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3B82F6, #22D3EE)" }}>
            <span className="text-white font-bold text-xl tracking-tighter">M</span>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: OBS.text }}>
            {step === 1 ? t("portal.register", "Institutional Partner Portal") : t("portal.login", "Sign In")}
          </h1>
          <p className="mt-2 text-sm" style={{ color: OBS.muted }}>
            {step === 1 ? t("portal.registerSub", "Create your secure partner account") : t("portal.loginSub", "Enter your credentials to continue")}
          </p>
        </div>

        <div className="rounded-xl p-6 space-y-5" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}`, backdropFilter: "blur(20px)" }}>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider" style={{ color: OBS.muted }}>{t("portal.entityName", "Entity Name")}</Label>
                <Input value={entityName} onChange={e => setEntityName(e.target.value)} placeholder="MRC Corp" className="border-0 bg-white/5 text-white placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-cyan-500/50" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider" style={{ color: OBS.muted }}>{t("portal.email", "Business Email")}</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="partner@company.com" className="border-0 bg-white/5 text-white placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-cyan-500/50" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider" style={{ color: OBS.muted }}>{t("portal.password", "Password")}</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="border-0 bg-white/5 text-white placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-cyan-500/50" />
              </div>
              <Button onClick={handleRegister} disabled={loading} className="w-full h-11 bg-white text-black hover:bg-gray-200 transition-all duration-100 font-medium">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("portal.createAccount", "Create Account")}
              </Button>
              <p className="text-center text-xs" style={{ color: OBS.muted }}>
                {t("portal.haveAccount", "Already have an account?")}{" "}
                <button onClick={() => setStep(2)} className="underline" style={{ color: OBS.success }}>
                  {t("portal.signIn", "Sign in")}
                </button>
              </p>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider" style={{ color: OBS.muted }}>{t("portal.email", "Business Email")}</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="border-0 bg-white/5 text-white placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-cyan-500/50" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider" style={{ color: OBS.muted }}>{t("portal.password", "Password")}</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="border-0 bg-white/5 text-white placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-cyan-500/50" />
              </div>
              <Button onClick={handleLogin} disabled={loading} className="w-full h-11 bg-white text-black hover:bg-gray-200 transition-all duration-100 font-medium">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("portal.signIn", "Sign In")}
              </Button>
              <p className="text-center text-xs" style={{ color: OBS.muted }}>
                {t("portal.noAccount", "Don't have an account?")}{" "}
                <button onClick={() => setStep(1)} className="underline" style={{ color: OBS.success }}>
                  {t("portal.register", "Register")}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  STEP 2 — TOTP SETUP                                     */
/* ────────────────────────────────────────────────────────── */
function TOTPSetup({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"setup" | "verify">("setup");

  const initSetup = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await supabase.functions.invoke("partner-totp", {
        body: {},
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      // Handle query params manually
      const fn = async () => {
        const resp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-totp?action=setup`,
          { method: "POST", headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY }, body: "{}" }
        );
        return resp.json();
      };
      const data = await fn();
      if (data.error) throw new Error(data.error);
      setOtpauthUrl(data.otpauthUrl);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setStep("verify");
    } catch (e: any) { toast({ title: e.message, variant: "destructive" }); }
    setLoading(false);
  }, [toast]);

  useEffect(() => { initSetup(); }, [initSetup]);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-totp?action=verify`,
        { method: "POST", headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY }, body: JSON.stringify({ code }) }
      );
      const data = await resp.json();
      if (data.valid) { toast({ title: t("portal.2faActivated", "2FA Activated") }); onComplete(); }
      else { toast({ title: t("portal.invalidCode", "Invalid code"), variant: "destructive" }); }
    } catch (e: any) { toast({ title: e.message, variant: "destructive" }); }
    setLoading(false);
  };

  const qrUrl = otpauthUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}` : "";

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: OBS.bg }}>
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3B82F6, #22D3EE)" }}>
            <Shield className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold" style={{ color: OBS.text }}>{t("portal.setup2fa", "Set Up Two-Factor Authentication")}</h1>
          <p className="mt-2 text-sm" style={{ color: OBS.muted }}>{t("portal.scan2fa", "Scan the QR code with your authenticator app")}</p>
        </div>

        <div className="rounded-xl p-6 space-y-6" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}`, backdropFilter: "blur(20px)" }}>
          {step === "verify" && (
            <>
              {qrUrl && (
                <div className="flex justify-center">
                  <div className="bg-white p-3 rounded-lg">
                    <img src={qrUrl} alt="TOTP QR Code" width={200} height={200} />
                  </div>
                </div>
              )}
              {secret && (
                <div className="space-y-1">
                  <Label className="text-xs uppercase tracking-wider" style={{ color: OBS.muted }}>{t("portal.manualKey", "Manual Key")}</Label>
                  <code className="block w-full p-3 rounded-lg text-xs font-mono break-all select-all" style={{ background: "rgba(255,255,255,0.05)", color: OBS.success }}>
                    {secret}
                  </code>
                </div>
              )}
              {backupCodes.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs uppercase tracking-wider" style={{ color: OBS.muted }}>{t("portal.backupCodes", "Backup Codes — Save These")}</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {backupCodes.map((c, i) => (
                      <code key={i} className="p-2 rounded text-xs font-mono text-center" style={{ background: "rgba(255,255,255,0.05)", color: OBS.text }}>{c}</code>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider" style={{ color: OBS.muted }}>{t("portal.enterCode", "Enter 6-Digit Code")}</Label>
                <Input
                  value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6} placeholder="000000"
                  className="border-0 bg-white/5 text-white text-center text-2xl tracking-[0.5em] font-mono placeholder:text-gray-700 focus-visible:ring-1 focus-visible:ring-cyan-500/50"
                  style={{ letterSpacing: "0.5em" }}
                />
              </div>
              <Button onClick={handleVerify} disabled={loading || code.length !== 6} className="w-full h-11 bg-white text-black hover:bg-gray-200 transition-all duration-100 font-medium">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("portal.activate2fa", "Activate 2FA")}
              </Button>
            </>
          )}
          {step === "setup" && (
            <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin" style={{ color: OBS.muted }} /></div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  STEP 3 — 2FA CHALLENGE (login gate)                      */
/* ────────────────────────────────────────────────────────── */
function TOTPChallenge({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-totp?action=verify`,
        { method: "POST", headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY }, body: JSON.stringify({ code }) }
      );
      const data = await resp.json();
      if (data.valid) onComplete();
      else toast({ title: t("portal.invalidCode", "Invalid code"), variant: "destructive" });
    } catch (e: any) { toast({ title: e.message, variant: "destructive" }); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: OBS.bg }}>
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3B82F6, #22D3EE)" }}>
            <Lock className="w-6 h-6 text-white" />
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
          <Button onClick={handleVerify} disabled={loading || code.length !== 6} className="w-full h-11 bg-white text-black hover:bg-gray-200 transition-all duration-100 font-medium">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("portal.verify", "Verify")}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  DASHBOARD — API Settings Tab                             */
/* ────────────────────────────────────────────────────────── */
function ApiSettingsTab({ partnerId }: { partnerId: string }) {
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
    const resp = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-api-keys?action=list`,
      { headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
    );
    const data = await resp.json();
    setKeys(data.keys || []);
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const generateKey = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-api-keys?action=generate`,
        { method: "POST", headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY }, body: "{}" }
      );
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
    await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-api-keys?action=revoke`,
      { method: "POST", headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY }, body: JSON.stringify({ key_id: keyId }) }
    );
    toast({ title: t("portal.keyRevoked", "API key revoked") });
    fetchKeys();
  };

  const updateKey = async (keyId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-api-keys?action=update`,
      { method: "POST", headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY }, body: JSON.stringify({ key_id: keyId, webhook_url: webhookUrl, ip_whitelist: ipWhitelist.split(",").map(s => s.trim()).filter(Boolean) }) }
    );
    toast({ title: t("portal.keyUpdated", "Configuration saved") });
    setEditingKey(null);
    fetchKeys();
  };

  return (
    <div className="space-y-6">
      {/* One-time secret display */}
      {newSecret && (
        <div className="rounded-xl p-5 space-y-3" style={{ background: "rgba(34,211,238,0.05)", border: `0.5px solid rgba(34,211,238,0.3)` }}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" style={{ color: OBS.success }} />
            <span className="text-sm font-medium" style={{ color: OBS.success }}>{t("portal.saveSecret", "Save this secret — it won't be shown again")}</span>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-xs" style={{ color: OBS.muted }}>Partner ID</span>
              <code className="block p-2.5 rounded-lg text-sm font-mono mt-1" style={{ background: "rgba(0,0,0,0.4)", color: OBS.text }}>{newSecret.key_id}</code>
            </div>
            <div>
              <span className="text-xs" style={{ color: OBS.muted }}>API Secret</span>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 p-2.5 rounded-lg text-sm font-mono break-all" style={{ background: "rgba(0,0,0,0.4)", color: OBS.text }}>
                  {showSecret ? newSecret.api_secret : "•".repeat(40)}
                </code>
                <button onClick={() => setShowSecret(!showSecret)}>{showSecret ? <EyeOff className="w-4 h-4" style={{ color: OBS.muted }} /> : <Eye className="w-4 h-4" style={{ color: OBS.muted }} />}</button>
                <button onClick={() => { navigator.clipboard.writeText(newSecret.api_secret); toast({ title: "Copied" }); }}><Copy className="w-4 h-4" style={{ color: OBS.muted }} /></button>
              </div>
            </div>
          </div>
          <Button onClick={() => setNewSecret(null)} variant="outline" size="sm" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
            {t("portal.dismiss", "I've saved it")}
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: OBS.text }}>{t("portal.apiKeys", "API Keys")}</h3>
        <Button onClick={generateKey} disabled={loading} size="sm" className="bg-white text-black hover:bg-gray-200 transition-all duration-100">
          <Plus className="w-3.5 h-3.5 me-1.5" />{t("portal.generateKey", "Generate Production Key")}
        </Button>
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
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: k.is_active ? "rgba(34,211,238,0.1)" : "rgba(239,68,68,0.1)", color: k.is_active ? OBS.success : OBS.danger }}>
                    {k.is_active ? "Active" : "Revoked"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {k.is_active && (
                    <>
                      <button onClick={() => { setEditingKey(editingKey === k.key_id ? null : k.key_id); setWebhookUrl(k.webhook_url || ""); setIpWhitelist((k.ip_whitelist || []).join(", ")); }}>
                        <Globe className="w-4 h-4" style={{ color: OBS.muted }} />
                      </button>
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
                  <Button onClick={() => updateKey(k.key_id)} size="sm" className="bg-white text-black hover:bg-gray-200 transition-all duration-100">
                    {t("portal.saveConfig", "Save Configuration")}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  DASHBOARD — Transaction Monitor Tab                      */
/* ────────────────────────────────────────────────────────── */
function TransactionMonitor({ partnerId, referralCode }: { partnerId: string; referralCode: string }) {
  const { t } = useTranslation();
  const [swaps, setSwaps] = useState<SwapRow[]>([]);
  const [partnerTxs, setPartnerTxs] = useState<PartnerTx[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [swapRes, txRes] = await Promise.all([
        supabase.from("swap_transactions").select("*").eq("ref_code", referralCode).order("created_at", { ascending: false }).limit(100),
        supabase.from("partner_transactions").select("*").eq("partner_id", partnerId).order("completed_at", { ascending: false }).limit(100),
      ]);
      setSwaps((swapRes.data || []) as SwapRow[]);
      setPartnerTxs((txRes.data || []) as PartnerTx[]);
      setLoading(false);
    })();
  }, [partnerId, referralCode]);

  const statusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "finished": return <CheckCircle2 className="w-3.5 h-3.5" style={{ color: OBS.success }} />;
      case "waiting": return <Clock className="w-3.5 h-3.5" style={{ color: "#FBBF24" }} />;
      case "exchanging": case "sending": return <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ color: OBS.accent }} />;
      case "failed": return <XCircle className="w-3.5 h-3.5" style={{ color: OBS.danger }} />;
      default: return <ArrowRightLeft className="w-3.5 h-3.5" style={{ color: OBS.muted }} />;
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" style={{ color: OBS.muted }} /></div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: OBS.text }}>{t("portal.txMonitor", "Transaction Monitor")}</h3>
      {swaps.length === 0 ? (
        <p className="text-sm py-8 text-center" style={{ color: OBS.muted }}>{t("portal.noTxs", "No transactions yet.")}</p>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: `0.5px solid ${OBS.border}` }}>
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: OBS.border }}>
                <TableHead className="text-xs uppercase" style={{ color: OBS.muted }}>ID</TableHead>
                <TableHead className="text-xs uppercase" style={{ color: OBS.muted }}>{t("portal.pair", "Pair")}</TableHead>
                <TableHead className="text-xs uppercase" style={{ color: OBS.muted }}>{t("portal.amount", "Amount")}</TableHead>
                <TableHead className="text-xs uppercase" style={{ color: OBS.muted }}>{t("portal.date", "Date")}</TableHead>
                <TableHead className="text-xs uppercase" style={{ color: OBS.muted }}></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {swaps.map(s => (
                <>
                  <TableRow key={s.id} className="cursor-pointer hover:bg-white/[0.02]" style={{ borderColor: OBS.border }} onClick={() => setExpandedRow(expandedRow === s.id ? null : s.id)}>
                    <TableCell className="font-mono text-xs" style={{ color: OBS.text }}>{s.transaction_id.slice(0, 10)}…</TableCell>
                    <TableCell className="text-xs" style={{ color: OBS.text }}>{s.from_currency.toUpperCase()} → {s.to_currency.toUpperCase()}</TableCell>
                    <TableCell className="font-mono text-xs" style={{ color: OBS.text }}>{s.amount}</TableCell>
                    <TableCell className="text-xs" style={{ color: OBS.muted }}>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{expandedRow === s.id ? <ChevronUp className="w-4 h-4" style={{ color: OBS.muted }} /> : <ChevronDown className="w-4 h-4" style={{ color: OBS.muted }} />}</TableCell>
                  </TableRow>
                  {expandedRow === s.id && (
                    <TableRow key={`${s.id}-detail`} style={{ borderColor: OBS.border }}>
                      <TableCell colSpan={5}>
                        <div className="p-4 rounded-lg space-y-2 text-xs" style={{ background: "rgba(0,0,0,0.3)" }}>
                          <div className="grid grid-cols-2 gap-3">
                            <div><span style={{ color: OBS.muted }}>Transaction ID:</span> <code className="font-mono" style={{ color: OBS.text }}>{s.transaction_id}</code></div>
                            <div><span style={{ color: OBS.muted }}>Recipient:</span> <code className="font-mono break-all" style={{ color: OBS.text }}>{s.recipient_address}</code></div>
                            <div><span style={{ color: OBS.muted }}>Deposit Address:</span> <code className="font-mono break-all" style={{ color: OBS.text }}>{s.payin_address}</code></div>
                            <div><span style={{ color: OBS.muted }}>Ref Code:</span> <code className="font-mono" style={{ color: OBS.success }}>{s.ref_code}</code></div>
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
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  MAIN DASHBOARD                                           */
/* ────────────────────────────────────────────────────────── */
function Dashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [partnerTxs, setPartnerTxs] = useState<PartnerTx[]>([]);
  const [swapCount, setSwapCount] = useState(0);
  const [activeKeys, setActiveKeys] = useState(0);
  const [loading, setLoading] = useState(true);
  const idleRef = useRef<ReturnType<typeof setTimeout>>();

  // Idle session timeout — 30 minutes
  useEffect(() => {
    const reset = () => {
      clearTimeout(idleRef.current);
      idleRef.current = setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/partner-portal");
        toast({ title: t("portal.sessionExpired", "Session expired due to inactivity"), variant: "destructive" });
      }, 30 * 60 * 1000);
    };
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(e => window.addEventListener(e, reset));
    reset();
    return () => { clearTimeout(idleRef.current); events.forEach(e => window.removeEventListener(e, reset)); };
  }, [navigate, toast, t]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase.from("partner_profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (p) {
        setProfile(p as PartnerProfile);
        const [txRes, swapRes, keyRes] = await Promise.all([
          supabase.from("partner_transactions").select("*").eq("partner_id", p.id).order("completed_at", { ascending: false }),
          supabase.from("swap_transactions").select("id", { count: "exact", head: true }).eq("ref_code", p.referral_code),
          supabase.from("partner_api_keys").select("id", { count: "exact", head: true }).eq("partner_id", p.id).eq("is_active", true),
        ]);
        setPartnerTxs((txRes.data || []) as PartnerTx[]);
        setSwapCount(swapRes.count || 0);
        setActiveKeys(keyRes.count || 0);
      }
      setLoading(false);
    })();
  }, []);

  const totalVolume = useMemo(() => partnerTxs.reduce((a, t) => a + t.volume, 0), [partnerTxs]);
  const totalCommission = useMemo(() => partnerTxs.reduce((a, t) => a + t.commission_btc, 0), [partnerTxs]);
  const conversionRate = swapCount > 0 ? ((partnerTxs.length / swapCount) * 100).toFixed(1) : "0";

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/partner-portal"); };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: OBS.bg }}><Loader2 className="w-8 h-8 animate-spin" style={{ color: OBS.muted }} /></div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center" style={{ background: OBS.bg }}><p style={{ color: OBS.muted }}>Partner profile not found. Please register via the <a href="/partners" className="underline" style={{ color: OBS.success }}>Partner Program</a> first.</p></div>;

  const kpis = [
    { label: t("portal.networkVolume", "Network Volume"), value: `$${totalVolume.toLocaleString("en", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: OBS.accent },
    { label: t("portal.accruedCommission", "Accrued Commission"), value: `${totalCommission.toFixed(8)} BTC`, icon: Activity, color: OBS.success },
    { label: t("portal.conversionRate", "Conversion Rate"), value: `${conversionRate}%`, icon: RefreshCw, color: "#A78BFA" },
    { label: t("portal.activeKeys", "Active API Keys"), value: activeKeys.toString(), icon: Key, color: "#FBBF24" },
  ];

  return (
    <div className="min-h-screen" style={{ background: OBS.bg }}>
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `0.5px solid ${OBS.border}` }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3B82F6, #22D3EE)" }}>
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-sm font-medium" style={{ color: OBS.text }}>{profile.first_name} {profile.last_name}</span>
          <code className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", color: OBS.muted }}>{profile.referral_code}</code>
        </div>
        <Button onClick={handleLogout} variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5">
          <LogOut className="w-4 h-4 me-1.5" />{t("portal.logout", "Logout")}
        </Button>
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

        {/* Tabs */}
        <Tabs defaultValue="monitor" className="space-y-6">
          <TabsList className="bg-white/5 border-0">
            <TabsTrigger value="monitor" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
              <Activity className="w-4 h-4 me-1.5" />{t("portal.monitor", "Monitor")}
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
              <Key className="w-4 h-4 me-1.5" />{t("portal.apiSettings", "API Settings")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="monitor">
            <TransactionMonitor partnerId={profile.id} referralCode={profile.referral_code} />
          </TabsContent>
          <TabsContent value="api">
            <ApiSettingsTab partnerId={profile.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  ORCHESTRATOR                                             */
/* ────────────────────────────────────────────────────────── */
export default function PartnerPortal() {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<"loading" | "auth" | "totp-setup" | "totp-challenge" | "dashboard">("loading");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setPhase("auth"); return; }

      // Check TOTP status
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-totp?action=status`,
        { headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );
      const data = await resp.json();
      if (!data.configured) { setPhase("totp-setup"); }
      else { setPhase("totp-challenge"); }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") setPhase("auth");
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <Helmet>
        <title>{t("portal.metaTitle", "Institutional Partner Portal | MRC GlobalPay")}</title>
        <meta name="description" content={t("portal.metaDesc", "Secure partner dashboard with 2FA, API key management, and real-time transaction monitoring.")} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {phase === "loading" && (
        <div className="min-h-screen flex items-center justify-center" style={{ background: OBS.bg }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: OBS.muted }} />
        </div>
      )}
      {phase === "auth" && <RegistrationStep onComplete={() => setPhase("totp-setup")} />}
      {phase === "totp-setup" && <TOTPSetup onComplete={() => setPhase("dashboard")} />}
      {phase === "totp-challenge" && <TOTPChallenge onComplete={() => setPhase("dashboard")} />}
      {phase === "dashboard" && <Dashboard />}
    </>
  );
}
