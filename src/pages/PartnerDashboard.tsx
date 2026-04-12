import { useEffect, useState, useMemo } from "react";
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
import { Copy, LogOut, Bitcoin, TrendingUp, Check } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MobileBottomNav from "@/components/MobileBottomNav";

interface PartnerProfile {
  id: string;
  first_name: string;
  last_name: string;
  btc_wallet: string;
  referral_code: string;
}

interface PartnerTransaction {
  id: string;
  asset: string;
  volume: number;
  commission_btc: number;
  completed_at: string;
  is_paid: boolean;
  paid_at: string | null;
}

const PartnerDashboard = () => {
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [transactions, setTransactions] = useState<PartnerTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [tab, setTab] = useState("current");
  const navigate = useNavigate();
  const { toast } = useToast();

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

      const { data: txs } = await supabase
        .from("partner_transactions")
        .select("*")
        .eq("partner_id", p.id)
        .order("completed_at", { ascending: false });

      setTransactions((txs || []) as PartnerTransaction[]);
      setLoading(false);
    };
    load();
  }, [navigate]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTxs = useMemo(() =>
    transactions.filter((t) => {
      const d = new Date(t.completed_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }), [transactions, currentMonth, currentYear]);

  const historyTxs = useMemo(() =>
    transactions.filter((t) => {
      const d = new Date(t.completed_at);
      return !(d.getMonth() === currentMonth && d.getFullYear() === currentYear);
    }), [transactions, currentMonth, currentYear]);

  const historyGrouped = useMemo(() => {
    const groups: Record<string, PartnerTransaction[]> = {};
    historyTxs.forEach((t) => {
      const d = new Date(t.completed_at);
      const key = `${d.toLocaleString("en-US", { month: "long" })} ${d.getFullYear()}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return groups;
  }, [historyTxs]);

  const monthVolume = currentMonthTxs.reduce((s, t) => s + Number(t.volume), 0);
  const monthBtc = currentMonthTxs.reduce((s, t) => s + Number(t.commission_btc), 0);
  const unpaidBtc = transactions.filter((t) => !t.is_paid).reduce((s, t) => s + Number(t.commission_btc), 0);
  const lifetimePaid = transactions.filter((t) => t.is_paid).reduce((s, t) => s + Number(t.commission_btc), 0);
  const referralLink = profile ? `https://mrcglobalpay.com/?ref=${profile.referral_code}` : "";

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

  const TxTable = ({ txs }: { txs: PartnerTransaction[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Volume</TableHead>
          <TableHead className="text-right">BTC Earned</TableHead>
          <TableHead>Payment Status</TableHead>
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
              <TableCell className="text-muted-foreground">{new Date(tx.completed_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">${Number(tx.volume).toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
              <TableCell className="text-right font-mono">{Number(tx.commission_btc).toFixed(8)}</TableCell>
              <TableCell>
                {tx.is_paid ? (
                  <span className="text-xs text-primary flex items-center gap-1">
                    <Check className="w-3 h-3" /> Paid {tx.paid_at ? `· ${new Date(tx.paid_at).toLocaleDateString()}` : ""}
                  </span>
                ) : (
                  <span className="text-xs text-amber-400">Pending</span>
                )}
              </TableCell>
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
                <TrendingUp className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Month Volume</p>
                  <p className="text-xl font-bold text-foreground">${monthVolume.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-5 flex items-center gap-3">
                <Bitcoin className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Month BTC Earned</p>
                  <p className="text-xl font-bold text-foreground">{monthBtc.toFixed(8)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-5 flex items-center gap-3">
                <Bitcoin className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Unpaid Balance</p>
                  <p className="text-xl font-bold text-foreground">{unpaidBtc.toFixed(8)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-5 flex items-center gap-3">
                <Check className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Lifetime Paid</p>
                  <p className="text-xl font-bold text-foreground">{lifetimePaid.toFixed(8)}</p>
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
            <CardHeader><CardTitle className="text-lg">Transactions</CardTitle></CardHeader>
            <CardContent>
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="current">Current Month</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
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
