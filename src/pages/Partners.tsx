import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Check, X } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MobileBottomNav from "@/components/MobileBottomNav";

const features = [
  {
    title: "The Opportunity",
    description:
      "A revenue-sharing initiative for referring volume to the MRC GlobalPay settlement network.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconPath:
      "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  },
  {
    title: "The Rewards",
    description:
      "Earn between 0.1% and 0.2% in Bitcoin on all successfully completed transaction volume.",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconPath:
      "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Settlement",
    description:
      "Rewards are tracked in real-time and settled in BTC directly to your registered wallet.",
    gradient: "from-violet-500/20 to-purple-500/20",
    iconPath:
      "M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3",
  },
  {
    title: "Tracking",
    description:
      "Access a private dashboard to monitor your link performance and earned volume.",
    gradient: "from-sky-500/20 to-cyan-500/20",
    iconPath:
      "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
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
        <meta
          name="description"
          content="Join the MRC GlobalPay Partner Program. Earn BTC rewards on every settlement processed through your referral network."
        />
      </Helmet>

      <SiteHeader />

      {/* Background with mesh gradient */}
      <div className="relative min-h-screen bg-background overflow-hidden">
        {/* Decorative blurs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left – Value Proposition */}
            <div className="space-y-10">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-semibold tracking-widest uppercase text-primary">
                    Partner Program
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-foreground leading-[1.1] tracking-tight">
                  Earn BTC on Every
                  <br />
                  <span className="text-primary">Settlement</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                  Secure BTC rewards by referring settlements to the MRC GlobalPay network.
                </p>
              </div>

              {/* Feature cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((f) => (
                  <div
                    key={f.title}
                    className="group relative rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-5 transition-all hover:border-primary/30 hover:bg-card/60"
                  >
                    {/* Glow icon */}
                    <div
                      className={`mb-3 w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center ring-1 ring-white/5`}
                    >
                      <svg
                        className="w-5 h-5 text-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d={f.iconPath} />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – Glassmorphic Registration Card */}
            <div className="lg:sticky lg:top-28">
              <div className="relative rounded-3xl border border-border/40 bg-card/30 backdrop-blur-xl p-px shadow-[0_0_60px_-15px_hsl(var(--primary)/0.15)]">
                {/* Top glow line */}
                <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                <div className="rounded-3xl p-6 sm:p-8">
                  <div className="text-center space-y-1.5 mb-6">
                    <h2 className="text-xl font-bold text-foreground">
                      {isLogin ? "Partner Login" : "Create Partner Account"}
                    </h2>
                    {!isLogin && (
                      <p className="text-sm text-muted-foreground">
                        All fields are required to join the program.
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="firstName" className="text-xs text-muted-foreground">
                              First Name
                            </Label>
                            <Input
                              id="firstName"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              required
                              className="bg-background/50 border-border/50 focus:border-primary/60 focus:ring-primary/20"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="lastName" className="text-xs text-muted-foreground">
                              Last Name
                            </Label>
                            <Input
                              id="lastName"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              required
                              className="bg-background/50 border-border/50 focus:border-primary/60 focus:ring-primary/20"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="btcWallet" className="text-xs text-muted-foreground">
                            BTC Wallet Address
                          </Label>
                          <Input
                            id="btcWallet"
                            value={btcWallet}
                            onChange={(e) => setBtcWallet(e.target.value)}
                            placeholder="bc1q..."
                            required
                            className="bg-background/50 border-border/50 focus:border-primary/60 focus:ring-primary/20 font-mono text-sm"
                          />
                        </div>
                      </>
                    )}
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs text-muted-foreground">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-background/50 border-border/50 focus:border-primary/60 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-xs text-muted-foreground">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className="bg-background/50 border-border/50 focus:border-primary/60 focus:ring-primary/20"
                      />
                    </div>
                    {!isLogin && (
                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword" className="text-xs text-muted-foreground">
                          Confirm Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={8}
                          className="bg-background/50 border-border/50 focus:border-primary/60 focus:ring-primary/20"
                        />
                        {confirmPassword.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-1">
                            {passwordsMatch ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-primary" />
                                <span className="text-xs text-primary">Passwords match</span>
                              </>
                            ) : (
                              <>
                                <X className="w-3.5 h-3.5 text-destructive" />
                                <span className="text-xs text-destructive">Passwords do not match</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full gap-2 h-12 text-base font-semibold rounded-xl mt-2"
                      size="lg"
                      disabled={loading || !canSubmit}
                    >
                      {loading ? "Processing…" : isLogin ? "Sign In" : "Join Program"}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </form>

                  <div className="mt-5 text-center">
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {isLogin ? "Need an account? Register" : "Already a partner? Sign in"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
      <MobileBottomNav />
    </>
  );
};

export default Partners;
