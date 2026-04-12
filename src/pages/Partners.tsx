import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, ArrowRight, Bitcoin, TrendingUp, BarChart3, Wallet } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MobileBottomNav from "@/components/MobileBottomNav";

const infoItems = [
  {
    icon: TrendingUp,
    title: "The Opportunity",
    description:
      "A revenue-sharing initiative for referring volume to the MRC GlobalPay settlement network.",
  },
  {
    icon: Bitcoin,
    title: "The Rewards",
    description:
      "Earn between 0.1% and 0.2%, depending on the swap pair, paid in Bitcoin on all successfully completed transaction volume.",
  },
  {
    icon: Wallet,
    title: "Settlement",
    description:
      "Rewards are tracked in real-time and settled in BTC directly to your registered wallet.",
  },
  {
    icon: BarChart3,
    title: "Tracking",
    description:
      "Access a private dashboard to monitor your link performance and earned volume.",
  },
];

const Partners = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [btcWallet, setBtcWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordsMatch = password === confirmPassword;
  const signupValid =
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    password.length >= 8 &&
    confirmPassword.length > 0 &&
    passwordsMatch &&
    btcWallet.trim();
  const loginValid = email.trim() && password.length >= 1;
  const canSubmit = isLogin ? loginValid : signupValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
        return;
      }

      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error("Registration failed");

      const { error: profileError } = await supabase.from("partner_profiles").insert({
        user_id: data.user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        btc_wallet: btcWallet.trim(),
        referral_code: "temp",
      });

      if (profileError) throw profileError;

      toast({ title: "Welcome to the Partner Program", description: "Your account has been created." });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Partner Program | MRC GlobalPay</title>
        <meta name="description" content="Join the MRC GlobalPay Partner Program. Earn BTC rewards on every settlement processed through your referral network." />
      </Helmet>

      <SiteHeader />
      <div className="min-h-screen bg-background flex flex-col lg:flex-row pt-20">
        {/* Left – Information */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 lg:py-0">
          <div className="max-w-lg mx-auto lg:mx-0 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Shield className="w-6 h-6 text-primary" />
                <span className="text-sm font-semibold tracking-widest uppercase text-primary">
                  Partner Program
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                Earn BTC on Every Settlement
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                Refer transaction volume to the MRC GlobalPay network and receive Bitcoin rewards on every completed swap.
              </p>
            </div>

            <div className="space-y-5">
              {infoItems.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="mt-0.5 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right – Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:border-l lg:border-border/30">
          <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur">
            <CardHeader className="text-center space-y-1 pb-4">
              <CardTitle className="text-xl font-bold">
                {isLogin ? "Partner Login" : "Create Partner Account"}
              </CardTitle>
              {!isLogin && (
                <p className="text-sm text-muted-foreground">
                  All fields are required to join the program.
                </p>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="btcWallet">BTC Wallet Address</Label>
                      <Input id="btcWallet" value={btcWallet} onChange={(e) => setBtcWallet(e.target.value)} placeholder="bc1q..." required />
                    </div>
                  </>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                </div>
                {!isLogin && (
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    {confirmPassword.length > 0 && !passwordsMatch && (
                      <p className="text-xs text-destructive">Passwords do not match.</p>
                    )}
                  </div>
                )}
                <Button type="submit" className="w-full gap-2" size="lg" disabled={loading || !canSubmit}>
                  {loading ? "Processing…" : isLogin ? "Sign In" : "Join Program"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {isLogin ? "Need an account? Register" : "Already a partner? Sign in"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <SiteFooter />
      <MobileBottomNav />
    </>
  );
};

export default Partners;
