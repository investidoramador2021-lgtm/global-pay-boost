import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Check, X, AlertCircle } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MobileBottomNav from "@/components/MobileBottomNav";

/* ── BTC address regex (mainnet: legacy, segwit, taproot) ── */
const BTC_REGEX = /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{25,90})$/;

/* ── Basic RFC-ish email regex ── */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ── Feature cards data ── */
const features = [
  {
    title: "The Rewards",
    description:
      "Earn between 0.1% and 0.2% in Bitcoin on all successfully completed transaction volume.",
    gradient: "from-amber-500/20 to-orange-500/20",
    icon: (
      <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Real-Time Settlement",
    description:
      "All rewards are tracked in real-time and settled in BTC directly to your registered wallet.",
    gradient: "from-violet-500/20 to-purple-500/20",
    icon: (
      <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
      </svg>
    ),
  },
  {
    title: "Private Dashboard",
    description:
      "Access a secure dashboard to monitor your referral link performance, volume, and earnings.",
    gradient: "from-sky-500/20 to-cyan-500/20",
    icon: (
      <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: "Dedicated Support",
    description:
      "Wallet updates are handled manually via partners@mrc-pay.com for maximum security.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    icon: (
      <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
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

  /* ── Validation ── */
  const emailValid = EMAIL_REGEX.test(email);
  const btcValid = BTC_REGEX.test(btcWallet);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const signupReady = useMemo(
    () =>
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      emailValid &&
      btcValid &&
      password.length >= 8 &&
      passwordsMatch,
    [firstName, lastName, emailValid, btcValid, password, passwordsMatch],
  );

  const loginReady = emailValid && password.length >= 1;
  const canSubmit = isLogin ? loginReady : signupReady;

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

  /* ── Tiny inline validation indicator ── */
  const ValidationHint = ({ valid, show, ok, fail }: { valid: boolean; show: boolean; ok: string; fail: string }) =>
    show ? (
      <div className="flex items-center gap-1.5 mt-1">
        {valid ? (
          <><Check className="w-3.5 h-3.5 text-primary" /><span className="text-xs text-primary">{ok}</span></>
        ) : (
          <><AlertCircle className="w-3.5 h-3.5 text-destructive" /><span className="text-xs text-destructive">{fail}</span></>
        )}
      </div>
    ) : null;

  const inputClass = "bg-background/50 border-border/50 focus:border-primary/60 focus:ring-primary/20 h-11";

  return (
    <>
      <Helmet>
        <title>Partner Program | MRC GlobalPay</title>
        <meta name="description" content="Join the MRC GlobalPay Partner Program. Earn BTC rewards on every settlement processed through your referral network." />
      </Helmet>

      <SiteHeader />

      {/* ── Page wrapper with mesh gradient ── */}
      <div className="relative min-h-screen bg-background overflow-hidden">
        {/* Decorative ambient blurs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">

            {/* ════════ LEFT — Value Proposition ════════ */}
            <div className="space-y-10">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-semibold tracking-widest uppercase text-primary">Partner Program</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-foreground leading-[1.1] tracking-tight">
                  Earn BTC on Every<br />
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
                    <div className={`mb-3 w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center ring-1 ring-white/5`}>
                      {f.icon}
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  </div>
                ))}
              </div>

              {/* Trust note */}
              <p className="text-xs text-muted-foreground/60">
                Canadian MSB Registration&nbsp;C100000015&nbsp;·&nbsp;FINTRAC Compliant
              </p>
            </div>

            {/* ════════ RIGHT — Glassmorphic Registration Card ════════ */}
            <div className="lg:sticky lg:top-28">
              <div className="relative rounded-3xl border border-border/40 bg-card/30 backdrop-blur-xl p-px shadow-[0_0_80px_-20px_hsl(var(--primary)/0.15)]">
                {/* Top glow accent */}
                <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                <div className="rounded-3xl p-6 sm:p-8">
                  <div className="text-center space-y-1.5 mb-6">
                    <h2 className="text-xl font-bold text-foreground">
                      {isLogin ? "Partner Login" : "Create Partner Account"}
                    </h2>
                    {!isLogin && (
                      <p className="text-sm text-muted-foreground">All fields are required to join the program.</p>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                      <>
                        {/* Names */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="firstName" className="text-xs text-muted-foreground">First Name</Label>
                            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputClass} />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="lastName" className="text-xs text-muted-foreground">Last Name</Label>
                            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputClass} />
                          </div>
                        </div>

                        {/* BTC Wallet */}
                        <div className="space-y-1.5">
                          <Label htmlFor="btcWallet" className="text-xs text-muted-foreground">BTC Wallet Address</Label>
                          <Input id="btcWallet" value={btcWallet} onChange={(e) => setBtcWallet(e.target.value)} placeholder="bc1q..." required className={`${inputClass} font-mono text-sm`} />
                          <ValidationHint valid={btcValid} show={btcWallet.length > 5} ok="Valid Bitcoin address" fail="Enter a valid mainnet BTC address" />
                        </div>
                      </>
                    )}

                    {/* Email */}
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
                      {!isLogin && <ValidationHint valid={emailValid} show={email.length > 3} ok="Valid email" fail="Enter a valid email address" />}
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-xs text-muted-foreground">Password</Label>
                      <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className={inputClass} />
                      {!isLogin && password.length > 0 && password.length < 8 && (
                        <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    {!isLogin && (
                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword" className="text-xs text-muted-foreground">Confirm Password</Label>
                        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} className={inputClass} />
                        <ValidationHint
                          valid={passwordsMatch}
                          show={confirmPassword.length > 0}
                          ok="Passwords match"
                          fail="Passwords do not match"
                        />
                      </div>
                    )}

                    <Button type="submit" className="w-full gap-2 h-12 text-base font-semibold rounded-xl mt-2" size="lg" disabled={loading || !canSubmit}>
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
