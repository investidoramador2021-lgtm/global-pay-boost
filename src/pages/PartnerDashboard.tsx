import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Copy, LogOut, Bitcoin, TrendingUp } from "lucide-react";
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
}

const PartnerDashboard = () => {
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [transactions, setTransactions] = useState<PartnerTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [userEmail, setUserEmail] = useState("");
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

  const totalVolume = transactions.reduce((s, t) => s + Number(t.volume), 0);
  const totalBtc = transactions.reduce((s, t) => s + Number(t.commission_btc), 0);
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Partner Dashboard | MRC GlobalPay</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <SiteHeader />

      <div className="relative min-h-screen bg-background overflow-hidden">
        {/* Ambient blurs */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Volume Referred</p>
                  <p className="text-3xl font-bold text-foreground">
                    ${totalVolume.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bitcoin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total BTC Earned</p>
                  <p className="text-3xl font-bold text-foreground">{totalBtc.toFixed(8)} BTC</p>
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

          {/* Completed Transactions */}
          <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
            <CardHeader><CardTitle className="text-lg">Completed Transactions</CardTitle></CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No transactions yet. Share your referral link to start earning.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Volume</TableHead>
                      <TableHead className="text-right">BTC Earned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-muted-foreground">
                          {new Date(tx.completed_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          ${Number(tx.volume).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {Number(tx.commission_btc).toFixed(8)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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
                  To update your payout wallet, contact our desk at:{" "}
                  <a href="mailto:partners@mrc-pay.com" className="text-primary hover:underline font-medium">
                    partners@mrc-pay.com
                  </a>
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
