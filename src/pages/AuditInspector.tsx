import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Shield, LogOut, Lock, FileText, Download, Link2, Eye } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import jsPDF from "jspdf";

type Stage = "login" | "mfa-enroll" | "mfa-verify" | "dashboard";

interface AlertRecord {
  id: string;
  partner_id: string | null;
  transaction_ref: string;
  alert_type: string;
  amount: number;
  from_currency: string;
  to_currency: string;
  source_wallet: string;
  destination_wallet: string;
  exchange_rate: number;
  partner_legal_name: string;
  partner_email: string;
  msb_reference: string;
  notes: string;
  status: string;
  created_at: string;
}

interface InspectionLink {
  id: string;
  alert_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

const AuditInspector = () => {
  const [stage, setStage] = useState<Stage>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [qrUri, setQrUri] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [challengeId, setChallengeId] = useState("");

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AlertRecord[]>([]);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();
  const { toast } = useToast();
  const activityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const INACTIVITY_MS = 24 * 60 * 60 * 1000;

  const resetInactivityTimer = useCallback(() => {
    if (activityTimer.current) clearTimeout(activityTimer.current);
    activityTimer.current = setTimeout(async () => {
      await supabase.auth.signOut();
      setStage("login");
      toast({ title: "Session Expired", description: "Logged out due to inactivity." });
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

  const loadRecords = useCallback(async () => {
    const { data } = await supabase
      .from("compliance_alerts")
      .select("*")
      .order("created_at", { ascending: false });
    setRecords((data as unknown as AlertRecord[]) || []);
    setLoading(false);
  }, []);

  const startEnrollment = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "MRC Admin Inspector" });
    if (error) { toast({ title: "MFA Error", description: error.message, variant: "destructive" }); return; }
    if (data) { setMfaFactorId(data.id); setQrUri(data.totp.uri); }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setStage("login"); setLoading(false); return; }

      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const isAdmin = roles?.some((r: any) => r.role === "admin");
      if (!isAdmin) {
        await supabase.auth.signOut();
        setStage("login"); setLoading(false);
        toast({ title: "Access Denied", description: "Admin credentials required.", variant: "destructive" });
        return;
      }

      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.currentLevel === "aal2") { setStage("dashboard"); loadRecords(); return; }

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
  }, [loadRecords]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Auth failed");
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (!roles?.some((r: any) => r.role === "admin")) {
        await supabase.auth.signOut();
        throw new Error("Not an admin");
      }
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.currentLevel === "aal2") { setStage("dashboard"); loadRecords(); setLoginLoading(false); return; }
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactors = factors?.totp || [];
      if (totpFactors.length > 0) {
        const verified = totpFactors.find((f: any) => f.status === "verified");
        if (verified) {
          setMfaFactorId(verified.id);
          const { data: challenge } = await supabase.auth.mfa.challenge({ factorId: verified.id });
          if (challenge) setChallengeId(challenge.id);
          setStage("mfa-verify");
        } else { setStage("mfa-enroll"); await startEnrollment(); }
      } else { setStage("mfa-enroll"); await startEnrollment(); }
    } catch (err: any) {
      toast({ title: "Login Failed", description: err.message, variant: "destructive" });
    }
    setLoginLoading(false);
  };

  const handleMfaEnrollVerify = async () => {
    setMfaLoading(true);
    try {
      const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
      if (cErr || !challenge) throw cErr || new Error("Challenge failed");
      const { error: vErr } = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: challenge.id, code: totpCode });
      if (vErr) throw vErr;
      setStage("dashboard");
      loadRecords();
    } catch (err: any) {
      toast({ title: "Verification Failed", description: err.message, variant: "destructive" });
    }
    setMfaLoading(false);
  };

  const handleMfaVerify = async () => {
    setMfaLoading(true);
    try {
      if (!challengeId) {
        const { data: ch } = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
        if (ch) setChallengeId(ch.id);
      }
      const cid = challengeId || (await supabase.auth.mfa.challenge({ factorId: mfaFactorId })).data?.id;
      if (!cid) throw new Error("Challenge failed");
      const { error } = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: cid, code: totpCode });
      if (error) throw error;
      setStage("dashboard");
      loadRecords();
    } catch (err: any) {
      toast({ title: "Verification Failed", description: err.message, variant: "destructive" });
    }
    setMfaLoading(false);
  };

  const generateInspectionLink = async (record: AlertRecord) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("audit_links")
      .insert({ alert_id: record.id, created_by: user.id })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    const link = `${window.location.origin}/regulatory-report/${(data as unknown as InspectionLink).token}`;
    await navigator.clipboard.writeText(link);
    toast({ title: "Inspection Link Generated", description: "Link copied to clipboard. Valid for 30 days." });
  };

  const exportCSV = () => {
    const rows = filteredRecords.map(a => [
      a.msb_reference, a.transaction_ref, a.partner_legal_name, a.partner_email,
      a.amount, a.from_currency, a.to_currency, a.source_wallet, a.destination_wallet,
      a.exchange_rate, a.alert_type, a.status, a.created_at
    ]);
    const header = ["MSB Reference", "Transaction Ref", "Legal Name", "Email", "Amount", "From", "To", "Source Wallet", "Dest Wallet", "Exchange Rate", "Type", "Status", "Timestamp"];
    const csv = [header, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FINTRAC_Report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text("MRC Global Pay — FINTRAC Transaction Report", 14, 20);
    doc.setFontSize(8);
    doc.text(`MSB Registration: C100000015 | Generated: ${new Date().toISOString()}`, 14, 28);
    doc.setFontSize(7);

    let y = 38;
    const cols = ["MSB Ref", "Tx Ref", "Name", "Email", "Amount", "Pair", "Src Wallet", "Dst Wallet", "Rate", "Status", "Date"];
    const colX = [14, 42, 70, 100, 140, 158, 175, 210, 240, 255, 270];
    cols.forEach((c, i) => doc.text(c, colX[i], y));
    y += 6;

    filteredRecords.forEach(a => {
      if (y > 190) { doc.addPage(); y = 20; }
      const row = [a.msb_reference, a.transaction_ref.slice(0, 12), a.partner_legal_name.slice(0, 14), a.partner_email.slice(0, 18),
        String(a.amount), `${a.from_currency}/${a.to_currency}`, a.source_wallet.slice(0, 16), a.destination_wallet.slice(0, 16),
        String(a.exchange_rate), a.status, new Date(a.created_at).toLocaleDateString()];
      row.forEach((c, i) => doc.text(c, colX[i], y));
      y += 5;
    });

    doc.save(`FINTRAC_Report_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const filteredRecords = records.filter(a => {
    const matchesText = !filter || a.transaction_ref.toLowerCase().includes(filter.toLowerCase()) ||
      a.partner_legal_name.toLowerCase().includes(filter.toLowerCase()) ||
      a.msb_reference.toLowerCase().includes(filter.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesText && matchesStatus;
  });

  // ── Auth screens ──
  if (stage === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Helmet><title>Admin Inspector | MRC Global Pay</title><meta name="description" content="Restricted internal tool for authorized administrators to review flagged transactions and compliance records." /><meta name="robots" content="noindex, nofollow" /></Helmet>
        <Card className="w-full max-w-md border-primary/20">
          <CardHeader className="text-center">
            <Shield className="mx-auto h-10 w-10 text-primary mb-2" />
            <CardTitle className="text-xl">Secure Admin Access</CardTitle>
            <p className="text-sm text-muted-foreground">MFA-protected access for authorized administrators only.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
              <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
              <Button type="submit" className="w-full" disabled={loginLoading}>{loginLoading ? "Authenticating…" : "Sign In"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stage === "mfa-enroll") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-primary/20">
          <CardHeader className="text-center">
            <Lock className="mx-auto h-10 w-10 text-primary mb-2" />
            <CardTitle>Enroll MFA</CardTitle>
            <p className="text-sm text-muted-foreground">Scan the QR code with your authenticator app.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {qrUri && <div className="flex justify-center"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUri)}`} alt="MFA QR" className="rounded-lg" /></div>}
            <div><Label>Enter 6-digit code</Label><Input maxLength={6} value={totpCode} onChange={e => setTotpCode(e.target.value.replace(/\D/g, ""))} /></div>
            <Button className="w-full" onClick={handleMfaEnrollVerify} disabled={mfaLoading || totpCode.length !== 6}>{mfaLoading ? "Verifying…" : "Verify & Continue"}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stage === "mfa-verify") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-primary/20">
          <CardHeader className="text-center">
            <Lock className="mx-auto h-10 w-10 text-primary mb-2" />
            <CardTitle>MFA Verification</CardTitle>
            <p className="text-sm text-muted-foreground">Enter the code from your authenticator app.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><Label>6-digit code</Label><Input maxLength={6} value={totpCode} onChange={e => setTotpCode(e.target.value.replace(/\D/g, ""))} /></div>
            <Button className="w-full" onClick={handleMfaVerify} disabled={mfaLoading || totpCode.length !== 6}>{mfaLoading ? "Verifying…" : "Continue"}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Inspector Dashboard ──
  return (
    <>
      <Helmet><title>Transaction Inspector | MRC Global Pay</title><meta name="description" content="Internal transaction inspector for MRC Global Pay administrators. Review, annotate and generate inspection links for flagged orders." /><meta name="robots" content="noindex, nofollow" /></Helmet>
      <SiteHeader />
      <main className="min-h-screen bg-background pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Transaction Inspector</h1>
                <p className="text-sm text-muted-foreground">FINTRAC MSB # C100000015 — Secure Internal Review</p>
              </div>
            </div>
            <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); setStage("login"); }}>
              <LogOut className="h-4 w-4 mr-2" />Sign Out
            </Button>
          </div>

          {/* Filters & Export */}
          <Card className="mb-6 border-primary/10">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <Label>Search by Ref, Name, or MSB #</Label>
                  <Input placeholder="Search…" value={filter} onChange={e => setFilter(e.target.value)} />
                </div>
                <div className="w-48">
                  <Label>Status</Label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="flagged">Flagged</option>
                    <option value="cleared">Cleared</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />CSV</Button>
                  <Button variant="outline" onClick={exportPDF}><FileText className="h-4 w-4 mr-1" />PDF</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Records Table */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg">Transaction Records ({filteredRecords.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-center py-8">Loading…</p>
              ) : filteredRecords.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No records found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>MSB Ref</TableHead>
                        <TableHead>Transaction</TableHead>
                        <TableHead>Partner</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Pair</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map(a => (
                        <TableRow key={a.id}>
                          <TableCell className="font-mono text-xs">{a.msb_reference}</TableCell>
                          <TableCell className="font-mono text-xs">{a.transaction_ref.slice(0, 16)}…</TableCell>
                          <TableCell>{a.partner_legal_name}</TableCell>
                          <TableCell>{a.amount.toLocaleString()}</TableCell>
                          <TableCell>{a.from_currency}/{a.to_currency}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              a.status === "flagged" ? "bg-destructive/20 text-destructive" :
                              a.status === "cleared" ? "bg-emerald-500/20 text-emerald-400" :
                              a.status === "reviewed" ? "bg-blue-500/20 text-blue-400" :
                              "bg-yellow-500/20 text-yellow-400"
                            }`}>{a.status}</span>
                          </TableCell>
                          <TableCell className="text-xs">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => generateInspectionLink(a)} title="Generate Report Link">
                                <Link2 className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => navigate(`/regulatory-report/preview/${a.id}`)} title="View Report">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
};

export default AuditInspector;