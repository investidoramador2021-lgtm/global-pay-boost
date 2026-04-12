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
import { Copy, LogOut, Bitcoin, TrendingUp, Check, RefreshCw, Clock, CheckCircle2, XCircle, ArrowRightLeft, AlertTriangle } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MobileBottomNav from "@/components/MobileBottomNav";

interface LiveStatus {
  status: string;
  amountSend: number | null;
  amountReceive: number | null;
  payinHash: string | null;
  payoutHash: string | null;
}

interface SwapRow {
  id: string;
  transaction_id: string;
  from_currency: string;
  to_currency: string;
  amount: number;
  recipient_address: string;
  payin_address: string;
  created_at: string;
  ref_code: string | null;
  live?: LiveStatus;
}

interface PartnerProfile {
  id: string;
  first_name: string;
  last_name: string;
  btc_wallet: string;
  referral_code: string;
}

interface PartnerTx {
  id: string;
  partner_id: string;
  asset: string;
  volume: number;
  commission_btc: number;
  completed_at: string;
  is_paid: boolean;
  paid_at: string | null;
}

const PartnerDashboard = () => {
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [swaps, setSwaps] = useState<SwapRow[]>([]);
  const [commissions, setCommissions] = useState<PartnerTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [tab, setTab] = useState("current");
  const navigate = useNavigate();
  const { toast } = useToast();

  const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    new: { label: "New", color: "text-muted-foreground", icon: <Clock className="w-3.5 h-3.5" /> },
    waiting: { label: "Waiting", color: "text-amber-400", icon: <Clock className="w-3.5 h-3.5" /> },
    confirming: { label: "Confirming", color: "text-blue-400", icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" /> },
    exchanging: { label: "Exchanging", color: "text-blue-400", icon: <ArrowRightLeft className="w-3.5 h-3.5" /> },
    sending: { label: "Sending", color: "text-blue-400", icon: <RefreshCw className="w-3.5 h-3.5" /> },
    finished: { label: "Finished", color: "text-primary", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    failed: { label: "Failed", color: "text-destructive", icon: <XCircle className="w-3.5 h-3.5" /> },
    refunded: { label: "Refunded", color: "text-orange-400", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    expired: { label: "Expired", color: "text-muted-foreground", icon: <XCircle className="w-3.5 h-3.5" /> },
  };

  const fetchLiveStatuses = useCallback(async (rows: SwapRow[]) => {
    if (rows.length === 0) return;
    setStatusLoading(true);
    const BATCH = 5;
    const updated = [...rows];
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        batch.map(async (row) => {
          const { data } = await supabase.functions.invoke("changenow", {
            method: "POST",
            body: { _get: true, action: "tx-status", id: row.transaction_id },
          });
          return { txId: row.transaction_id, data };
        })
      );
      results.forEach((r) => {
        if (r.status === "fulfilled" && r.value.data && !r.value.data.error) {
          const idx = updated.findIndex((s) => s.transaction_id === r.value.txId);
          if (idx !== -1) {
            updated[idx] = {
              ...updated[idx],
              live: {
                status: r.value.data.status,
                amountSend: r.value.data.amountSend,
                amountReceive: r.value.data.amountReceive,
                payinHash: r.value.data.payinHash,
                payoutHash: r.value.data.payoutHash,
              },
            };
          }
        }
      });
      setSwaps([...updated]);
    }
    setStatusLoading(false);
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/partners"); return; }
      setUserEmail(user.email || "");
      const { data: p } = await supabase
        .from("partner_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!p) { navigate("/partners"); return; }
      setProfile(p as PartnerProfile);

      // Load swaps referred by this partner's code
      const { data: swapData } = await supabase
        .from("swap_transactions")
        .select("*")
        .eq("ref_code", (p as PartnerProfile).referral_code)
        .order("created_at", { ascending: false });

      const rows = (swapData || []) as SwapRow[];
      setSwaps(rows);

      // Load commission records for this partner
      const { data: commData } = await supabase
        .from("partner_transactions")
        .select("*")
        .eq("partner_id", (p as PartnerProfile).id)
        .order("completed_at", { ascending: false });
      setCommissions((commData || []) as PartnerTx[]);

      setLoading(false);
      fetchLiveStatuses(rows);
    };
    load();
  }, [navigate, fetchLiveStatuses]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const finishedSwaps = useMemo(() =>
    swaps.filter((s) => s.live?.status === "finished"), [swaps]);

  const currentMonthTxs = useMemo(() =>
    finishedSwaps.filter((s) => {
      const d = new Date(s.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }), [finishedSwaps, currentMonth, currentYear]);

  const historyTxs = useMemo(() =>
    finishedSwaps.filter((s) => {
      const d = new Date(s.created_at);
      return !(d.getMonth() === currentMonth && d.getFullYear() === currentYear);
    }), [finishedSwaps, currentMonth, currentYear]);

  const historyGrouped = useMemo(() => {
    const groups: Record<string, SwapRow[]> = {};
    historyTxs.forEach((t) => {
      const d = new Date(t.created_at);
      const key = `${d.toLocaleString("en-US", { month: "long" })} ${d.getFullYear()}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return groups;
  }, [historyTxs]);

  // Volume = sum of amountSend (actual deposited) for finished swaps
  const monthVolume = currentMonthTxs.reduce((s, t) => s + Number(t.live?.amountSend || t.amount || 0), 0);
  const totalSwaps = finishedSwaps.length;
  const activeSwaps = swaps.filter((s) => s.live && ["waiting", "new", "confirming", "exchanging", "sending"].includes(s.live.status)).length;
  const referralLink = profile ? `https://mrcglobalpay.com/?ref=${profile.referral_code}` : "";

  // Commission calculations from partner_transactions
  const totalEarned = commissions.reduce((s, t) => s + Number(t.commission_btc), 0);
  const totalPaid = commissions.filter((t) => t.is_paid).reduce((s, t) => s + Number(t.commission_btc), 0);
  const totalUnpaid = commissions.filter((t) => !t.is_paid).reduce((s, t) => s + Number(t.commission_btc), 0);
  const commissionVolume = commissions.reduce((s, t) => s + Number(t.volume), 0);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Copied", description: "Referral link copied to clipboard." });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Password updated" }); setNewPassword(""); }
    setChangingPw(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/partners");
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  const statusBadge = (status?: string) => {
    if (!status) return <span className="text-xs text-muted-foreground">Loading…</span>;
    const s = STATUS_MAP[status] || { label: status, color: "text-muted-foreground", icon: null };
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${s.color}`}>
        {s.icon}
        {s.label}
      </span>
    );
  };

  const formatAmount = (amount: number | null | undefined, currency: string) => {
    if (amount === null || amount === undefined) return "—";
    return `${Number(amount).toLocaleString("en-US", { maximumFractionDigits: 8 })} ${currency.toUpperCase()}`;
  };

  const TxTable = ({ txs }: { txs: SwapRow[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>From</TableHead>
          <TableHead>To</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {txs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
              No transactions found.
            </TableCell>
          </TableRow>
        ) : (
          txs.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>{statusBadge(tx.live?.status)}</TableCell>
              <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{new Date(tx.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-sm font-medium">{formatAmount(tx.live?.amountSend ?? tx.amount, tx.from_currency)}</TableCell>
              <TableCell className="text-sm font-medium">{formatAmount(tx.live?.amountReceive, tx.to_currency)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <>
      <Helmet>
        <title>Partner Dashboard | MRC GlobalPay</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <SiteHeader />

      <div className="relative min-h-screen bg-background overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20 space-y-8">
          {/* Profile header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {profile?.first_name} {profile?.last_name}
              </h1>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-5 flex items-center gap-3">
                <ArrowRightLeft className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Referred Swaps</p>
                  <p className="text-xl font-bold text-foreground">{swaps.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-5 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="text-xl font-bold text-foreground">{totalSwaps}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-5 flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Active</p>
                  <p className="text-xl font-bold text-foreground">{activeSwaps}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-5 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Month Volume</p>
                  <p className="text-xl font-bold text-foreground">{monthVolume > 0 ? monthVolume.toLocaleString("en-US", { maximumFractionDigits: 8 }) : "0"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Details */}
          <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
            <CardHeader><CardTitle className="text-lg">Account Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs">Unique Referral Link</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={referralLink} readOnly className="font-mono text-sm bg-background/50 border-border/50" />
                  <Button variant="outline" size="icon" onClick={copyLink}><Copy className="w-4 h-4" /></Button>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Registered BTC Wallet</Label>
                <p className="font-mono text-sm text-foreground mt-1 break-all">{profile?.btc_wallet}</p>
              </div>
            </CardContent>
          </Card>

          {/* Transactions with monthly tabs */}
          <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Referred Transactions
                {statusLoading && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All ({swaps.length})</TabsTrigger>
                  <TabsTrigger value="current">This Month</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  <TxTable txs={swaps} />
                </TabsContent>
                <TabsContent value="current">
                  <TxTable txs={currentMonthTxs} />
                </TabsContent>
                <TabsContent value="history">
                  {Object.keys(historyGrouped).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No historical transactions.</p>
                  ) : (
                    Object.entries(historyGrouped).map(([month, txs]) => (
                      <div key={month} className="mb-6">
                        <h3 className="font-semibold text-foreground mb-2">{month}</h3>
                        <TxTable txs={txs} />
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Security & Support */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
              <CardHeader><CardTitle className="text-lg">Change Password</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <Input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="bg-background/50 border-border/50"
                  />
                  <Button type="submit" disabled={changingPw} className="w-full">
                    {changingPw ? "Updating…" : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
              <CardHeader><CardTitle className="text-lg">Support</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  To update your payout wallet, contact our support desk through your partner dashboard or reply to any partner correspondence.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <SiteFooter />
      <MobileBottomNav />
    </>
  );
};

export default PartnerDashboard;
