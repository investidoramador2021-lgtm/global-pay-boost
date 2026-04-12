import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, Bitcoin, TrendingUp, Check, LogOut } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

interface Partner {
  id: string;
  first_name: string;
  last_name: string;
  btc_wallet: string;
  user_id: string;
  referral_code: string;
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
}

const AdminPortal = () => {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [partnerEmails, setPartnerEmails] = useState<Record<string, string>>({});
  const [tab, setTab] = useState("current");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/partners"); return; }

      // Check admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const isAdmin = roles?.some((r: any) => r.role === "admin");
      if (!isAdmin) { navigate("/"); return; }

      setAuthed(true);

      // Load partners
      const { data: p } = await supabase.from("partner_profiles").select("*");
      setPartners((p || []) as Partner[]);

      // Load all transactions
      const { data: txs } = await supabase
        .from("partner_transactions")
        .select("*")
        .order("completed_at", { ascending: false });
      setTransactions((txs || []) as Tx[]);

      setLoading(false);
    };
    check();
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

  // Group history by month
  const historyGrouped = useMemo(() => {
    const groups: Record<string, Tx[]> = {};
    historyTxs.forEach((t) => {
      const d = new Date(t.completed_at);
      const key = `${d.toLocaleString("en-US", { month: "long" })} ${d.getFullYear()}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return groups;
  }, [historyTxs]);

  const unpaidTxs = transactions.filter((t) => !t.is_paid);
  const totalVolume = currentMonthTxs.reduce((s, t) => s + Number(t.volume), 0);
  const totalBtcEarned = currentMonthTxs.reduce((s, t) => s + Number(t.commission_btc), 0);
  const totalUnpaid = unpaidTxs.reduce((s, t) => s + Number(t.commission_btc), 0);
  const totalPaid = transactions.filter((t) => t.is_paid).reduce((s, t) => s + Number(t.commission_btc), 0);

  const getPartnerName = (pid: string) => {
    const p = partners.find((x) => x.id === pid);
    return p ? `${p.first_name} ${p.last_name}` : "Unknown";
  };

  const markAsPaid = async (txId: string) => {
    const { error } = await supabase
      .from("partner_transactions")
      .update({ is_paid: true, paid_at: new Date().toISOString() } as any)
      .eq("id", txId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, is_paid: true, paid_at: new Date().toISOString() } : t))
    );
    toast({ title: "Marked as Paid" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/partners");
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  if (!authed) return null;

  const TxTable = ({ txs, showPay = false }: { txs: Tx[]; showPay?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Partner</TableHead>
          <TableHead>Asset</TableHead>
          <TableHead className="text-right">Volume</TableHead>
          <TableHead className="text-right">BTC Commission</TableHead>
          <TableHead>Status</TableHead>
          {showPay && <TableHead />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {txs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={showPay ? 7 : 6} className="text-center text-muted-foreground py-8">
              No transactions found.
            </TableCell>
          </TableRow>
        ) : (
          txs.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="text-muted-foreground">{new Date(tx.completed_at).toLocaleDateString()}</TableCell>
              <TableCell>{getPartnerName(tx.partner_id)}</TableCell>
              <TableCell className="uppercase">{tx.asset}</TableCell>
              <TableCell className="text-right">${Number(tx.volume).toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
              <TableCell className="text-right font-mono">{Number(tx.commission_btc).toFixed(8)}</TableCell>
              <TableCell>
                {tx.is_paid ? (
                  <span className="text-xs text-primary flex items-center gap-1">
                    <Check className="w-3 h-3" /> Paid {tx.paid_at ? new Date(tx.paid_at).toLocaleDateString() : ""}
                  </span>
                ) : (
                  <span className="text-xs text-amber-400">Pending</span>
                )}
              </TableCell>
              {showPay && (
                <TableCell>
                  {!tx.is_paid && (
                    <Button size="sm" variant="outline" onClick={() => markAsPaid(tx.id)} className="text-xs">
                      Mark Paid
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <>
      <Helmet>
        <title>Admin Portal | MRC GlobalPay</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <SiteHeader />

      <div className="relative min-h-screen bg-background overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-20 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Console</h1>
                <p className="text-sm text-muted-foreground">MRC GlobalPay Management</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-5 flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Partners</p>
                  <p className="text-2xl font-bold text-foreground">{partners.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-5 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Month Volume</p>
                  <p className="text-2xl font-bold text-foreground">${totalVolume.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-5 flex items-center gap-3">
                <Bitcoin className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Unpaid BTC</p>
                  <p className="text-2xl font-bold text-foreground">{totalUnpaid.toFixed(8)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-5 flex items-center gap-3">
                <Check className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Lifetime Paid</p>
                  <p className="text-2xl font-bold text-foreground">{totalPaid.toFixed(8)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Partners List */}
          <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Users className="w-5 h-5" /> Partner Directory</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Referral Code</TableHead>
                    <TableHead>BTC Wallet</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.first_name} {p.last_name}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{p.referral_code}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground break-all">{p.btc_wallet}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Transactions with tabs */}
          <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Transactions & Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="current">Current Month</TabsTrigger>
                  <TabsTrigger value="unpaid">Unpaid ({unpaidTxs.length})</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="current">
                  <TxTable txs={currentMonthTxs} showPay />
                </TabsContent>
                <TabsContent value="unpaid">
                  <TxTable txs={unpaidTxs} showPay />
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
        </main>
      </div>

      <SiteFooter />
    </>
  );
};

export default AdminPortal;
