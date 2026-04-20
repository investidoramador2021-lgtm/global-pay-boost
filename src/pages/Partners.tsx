import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight, Check, X, AlertCircle, Shield, ExternalLink, Sparkles,
  BarChart3, LineChart, Wallet, Users, TrendingUp, Coins, Percent,
  Gauge, Webhook, KeyRound, Building2,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MobileBottomNav from "@/components/MobileBottomNav";
import { ProgramsNav, ProgramsFooterLinks } from "@/components/ProgramsNav";
import { Link } from "react-router-dom";

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
      "Wallet updates are handled manually via our secure support channel for maximum security.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    icon: (
      <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

const Partners = () => {
  const initialParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(() => initialParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [btcWallet, setBtcWallet] = useState(() => initialParams.get("btc") || "");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(() => initialParams.get("mode") === "login");
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
        const { data: loginData, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Check verification status
        const { data: profile } = await supabase
          .from("partner_profiles")
          .select("verification_status")
          .eq("user_id", loginData.user.id)
          .maybeSingle();
        if (profile && profile.verification_status !== "active") {
          await supabase.auth.signOut();
          toast({ title: "Email not verified", description: "Please check your inbox and verify your email before logging in.", variant: "destructive" });
          return;
        }
        navigate("/dashboard");
        return;
      }

      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error("Registration failed");

      // Generate verification token
      const verificationToken = crypto.randomUUID() + '-' + crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

      const { data: profileRow, error: profileError } = await supabase
        .from("partner_profiles")
        .insert({
          user_id: data.user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          btc_wallet: btcWallet.trim(),
          referral_code: "temp",
          verification_status: "pending_verification",
          verification_token: verificationToken,
          verification_expires_at: expiresAt,
        })
        .select("id")
        .maybeSingle();

      if (profileError) throw profileError;

      // CLAIM any existing affiliate widget/link signups generated from /affiliates
      // with the same email — so all prior commissions and traffic are now attributed
      // to this partner account and visible on their dashboard.
      if (profileRow?.id) {
        const { data: claimedLeads } = await supabase
          .from("affiliate_leads" as any)
          .update({ partner_id: profileRow.id })
          .ilike("email", email.trim())
          .is("partner_id", null)
          .select("ref_token");
        const claimedCount = (claimedLeads as any[] | null)?.length || 0;
        if (claimedCount > 0) {
          toast({
            title: `${claimedCount} affiliate widget${claimedCount > 1 ? "s" : ""} linked`,
            description: "Your existing widget/link traffic will now be tracked on your dashboard.",
          });
        }
      }

      // Send verification email via smtp-send
      const lang = localStorage.getItem("user-lang") || navigator.language?.slice(0, 2) || "en";
      await supabase.functions.invoke("smtp-send", {
        body: {
          type: "verification",
          to: email,
          lang,
          verificationToken,
          expiresAt,
        },
      });

      await supabase.auth.signOut();
      toast({
        title: "Check your inbox",
        description: "A verification email has been sent. You must confirm within 48 hours or your account will be deleted.",
      });
      setIsLogin(true);
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
        <title>Partner Program | MRC Global Pay</title>
        <meta name="description" content="Join the MRC Global Pay Partner Program. Earn lifetime BTC commissions on every crypto swap from your referral network. FINTRAC MSB-registered, weekly payouts." />
      </Helmet>

      <SiteHeader />
      <ProgramsNav active="partners" />

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
                  Earn BTC on Referred Settlements with a{" "}
                  <span className="text-primary">Dedicated Dashboard</span>
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                  The MRC Global Pay Partner Program pays{" "}
                  <span className="text-foreground font-semibold">0.1% – 0.2% in BTC</span>{" "}
                  on every settlement your network generates — tracked live in a private dashboard,
                  paid automatically, and built for high-volume referrers.
                </p>

                {/* Top cross-links */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <Link
                    to="/affiliates"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    Prefer easy widgets? Visit Affiliate Program <ArrowRight className="h-3 w-3" />
                  </Link>
                  <Link
                    to="/referral"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    Referral Program <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
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

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="https://www10.fintrac-canafe.gc.ca/msb-esm/public/msb-search/search-by-name/?searchTerm=MRC+Pay+International"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                >
                  <Shield className="h-3 w-3" /> FINTRAC MSB · C100000015
                </a>
                <a
                  href="https://www.bankofcanada.ca/core-functions/retail-payments-supervision/psp-registry/psp-registry-details/?account_id=408b884a-1aa1-ef11-a72d-0022483bf164"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                >
                  <Shield className="h-3 w-3" /> Bank of Canada PSP
                </a>
              </div>
            </div>

            {/* ════════ RIGHT — Glassmorphic Registration Card ════════ */}
            <div className="lg:sticky lg:top-28">
              <div className="relative rounded-3xl border border-border/40 bg-card/30 backdrop-blur-xl p-px shadow-[0_0_80px_-20px_hsl(var(--primary)/0.15)]">
                {/* Top glow accent */}
                <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                <div className="rounded-3xl p-6 sm:p-8">
                  <div className="text-center space-y-1.5 mb-6">
                    <h2 className="text-xl font-bold text-foreground">
                      {isLogin ? "Welcome Back, Partner" : "Activate Your Partner Account"}
                    </h2>
                    {!isLogin && (
                      <p className="text-sm text-muted-foreground">
                        Free · ~2 minutes · BTC payouts to a wallet you control.
                      </p>
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

                    <Button
                      type="submit"
                      size="lg"
                      disabled={loading || !canSubmit}
                      className="w-full gap-2.5 h-14 text-lg font-bold rounded-xl mt-4 border-0 text-primary-foreground bg-primary hover:bg-primary/90 shadow-[0_6px_24px_-4px_hsl(var(--primary)/0.55)] hover:shadow-[0_8px_32px_-4px_hsl(var(--primary)/0.7)] transition-all duration-200 uppercase tracking-wide"
                    >
                      {loading ? "Processing…" : isLogin ? "→ Sign In to Dashboard" : "→ Create Partner Account"}
                    </Button>
                  </form>

                  {/* Toggle login / register — highly visible */}
                  <div className="mt-6 pt-5 border-t border-border/30 text-center space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {isLogin ? "Don't have a partner account yet?" : "Already registered as a partner?"}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsLogin(!isLogin)}
                      className="w-full h-12 text-base font-semibold rounded-xl border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60 transition-all"
                    >
                      {isLogin ? "Register as a New Partner" : "Sign In to Your Dashboard"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ════════ COMMISSION TIERS ════════ */}
        <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/40">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <Percent className="h-3 w-3" /> Commission Structure
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Earn 0.1% – 0.2% in BTC on Every Settlement
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Partners earn a percentage of every successfully completed swap volume from their referral
              network — paid in BTC, for life. Tiers scale with monthly settled volume.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { tier: "Activate", rate: "0.10%", range: "First $100k / mo", icon: Coins },
              { tier: "Scale",    rate: "0.13%", range: "$100k – $500k / mo", icon: TrendingUp },
              { tier: "Volume",   rate: "0.16%", range: "$500k – $2M / mo", icon: BarChart3 },
              { tier: "Strategic",rate: "0.20%", range: "$2M+ / mo · negotiated",    icon: Sparkles },
            ].map((c) => (
              <div
                key={c.tier}
                className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-5 text-center transition-all hover:-translate-y-1 hover:border-primary/40"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <c.icon className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.tier}</p>
                <p className="mt-1 text-3xl font-extrabold text-foreground">{c.rate}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.range}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground max-w-2xl mx-auto">
            Tiers re-evaluate monthly. Lifetime attribution is permanent — your referrals stay yours.
            Strategic-tier partners get custom rates, dedicated account management, and bespoke integrations.
          </p>
        </section>

        {/* ════════ DASHBOARD PREVIEWS ════════ */}
        <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/40">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <LineChart className="h-3 w-3" /> Inside the Partner Dashboard
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Real-Time Volume, Earnings &amp; Referral Stats
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Once your account is verified you get a private dashboard with API keys, webhooks,
              live attribution, and BTC payout history.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {/* Earnings */}
            <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Lifetime Earnings
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
                  <Coins className="h-3 w-3" /> BTC
                </span>
              </div>
              <div className="mt-3 font-mono text-3xl font-extrabold text-foreground">₿ 0.48217340</div>
              <p className="mt-1 text-xs text-muted-foreground">≈ $46,820 USD · live, 30s refresh</p>
              <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-border/60">
                <div className="h-full w-2/3 bg-gradient-to-r from-primary to-[hsl(var(--neon))]" />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">66% to next tier (Volume · 0.16%)</p>
            </div>

            {/* Volume */}
            <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  30-Day Settled Volume
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                  <TrendingUp className="h-3 w-3" /> +24.1%
                </span>
              </div>
              <div className="mt-3 font-mono text-3xl font-extrabold text-foreground">$612,480</div>
              <p className="mt-1 text-xs text-muted-foreground">1,284 swaps · 312 unique referrals</p>
              <div className="mt-4 flex items-end gap-1 h-12">
                {[55, 70, 60, 85, 75, 95, 88, 100, 92, 80, 96, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-gradient-to-t from-primary/40 to-primary/80"
                    style={{ height: `${h}%` }}
                    aria-hidden
                  />
                ))}
              </div>
            </div>

            {/* Referral stats */}
            <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Top Referral Sources
                </span>
                <Users className="h-3.5 w-3.5 text-primary" />
              </div>
              <ul className="mt-3 space-y-2">
                {[
                  { src: "youtube.com/@cryptodaily", vol: "$184k", pct: "30%" },
                  { src: "wallet-app · in-app cta",  vol: "$128k", pct: "21%" },
                  { src: "x.com/yourhandle",         vol: "$96k",  pct: "16%" },
                  { src: "Direct link / blog",       vol: "$74k",  pct: "12%" },
                ].map((r) => (
                  <li key={r.src} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs">
                    <span className="font-mono text-muted-foreground truncate max-w-[55%]">{r.src}</span>
                    <span className="font-mono font-semibold text-foreground">{r.vol}</span>
                    <span className="font-display text-[10px] font-semibold text-primary">{r.pct}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] text-muted-foreground">Drill-down by ref code, country, asset.</p>
            </div>
          </div>

          {/* Dev-tier perks */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { icon: KeyRound, label: "API keys + webhooks" },
              { icon: Webhook,  label: "Real-time settlement events" },
              { icon: Gauge,    label: "Conversion analytics by ref code" },
            ].map((p) => (
              <div key={p.label} className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/40 px-4 py-3">
                <p.icon className="h-4 w-4 text-primary shrink-0" aria-hidden />
                <span className="text-sm text-foreground">{p.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ════════ BEST FOR / WHO QUALIFIES ════════ */}
        <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/40">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <Building2 className="h-3 w-3" /> Built for High-Volume Referrers
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Who the Partner Program Is For
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              If you have an audience, a wallet, an exchange, or a community that swaps crypto regularly,
              the Partner Program is the right tier for you.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Wallet & DeFi Apps", desc: "Embed swaps natively, track per-user volume, settle in BTC." },
              { title: "Crypto Media & Creators", desc: "Monetize tutorials, comparison content, and price alerts." },
              { title: "Exchanges & OTC Desks", desc: "Route 6,000+ asset pairs you don't list — earn on the spread." },
              { title: "Communities & DAOs", desc: "Treasury-grade settlement with transparent on-chain payouts." },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-5 transition-all hover:-translate-y-1 hover:border-primary/40">
                <h3 className="font-semibold text-foreground">{p.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Lower volume? Start with the{" "}
            <Link to="/affiliates" className="font-semibold text-primary hover:underline">Affiliate Program</Link>{" "}
            (no signup, instant widget) and upgrade anytime — your traffic auto-migrates to your dashboard.
          </p>
        </section>

        {/* ════════ REGULATORY EDGE ════════ */}
        <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/40">
          <div className="rounded-3xl border border-primary/20 bg-card/40 backdrop-blur-sm p-8 sm:p-12 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <Shield className="h-7 w-7 text-primary" aria-hidden />
              </div>
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                  Regulatory Edge
                </div>
                <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  A Partner Program Backed by Real Canadian Regulation
                </h2>
                <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  MRC Global Pay is operated by{" "}
                  <span className="font-semibold text-foreground">MRC Pay International Corp</span>,
                  a Canadian fintech registered as a{" "}
                  <span className="font-semibold text-foreground">FINTRAC Money Services Business (#C100000015)</span>{" "}
                  and an officially registered{" "}
                  <span className="font-semibold text-foreground">Bank of Canada Payment Service Provider (PSP)</span>.
                  Every settlement you refer flows through a fully supervised, AML-compliant, non-custodial pipeline —
                  giving your audience (and your accountant) something most swap aggregators simply can't offer.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a
                    href="https://www10.fintrac-canafe.gc.ca/msb-esm/public/msb-search/search-by-name/?searchTerm=MRC+Pay+International"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                  >
                    <ExternalLink className="h-3 w-3" /> Verify FINTRAC MSB
                  </a>
                  <a
                    href="https://www.bankofcanada.ca/core-functions/retail-payments-supervision/psp-registry/psp-registry-details/?account_id=408b884a-1aa1-ef11-a72d-0022483bf164"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                  >
                    <ExternalLink className="h-3 w-3" /> Verify Bank of Canada PSP
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════ FINAL CTA + BOTTOM CROSS-LINKS ════════ */}
        <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/40 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> 2 minutes to activate
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Activate Your Partner Account &amp; Start Earning in BTC
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            No KYC for the program itself. Just verify your email, paste a BTC wallet you control,
            and your dashboard goes live with API keys, webhooks, and live attribution.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#top"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-[0_6px_24px_-4px_hsl(var(--primary)/0.55)] hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
            >
              <Sparkles className="h-4 w-4" /> Create My Partner Account
            </a>
            <Link
              to="/affiliates"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border-2 border-primary/40 bg-background/60 px-7 py-4 text-sm font-bold text-primary transition-all hover:bg-primary/10 hover:border-primary"
            >
              Try the Free Widget First <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs">
            <Link
              to="/affiliates"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              Prefer easy widgets? Visit Affiliate Program <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              to="/referral"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              Referral Program <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <p className="mt-6 text-[11px] text-muted-foreground">
            Operated by MRC Pay International Corp · FINTRAC MSB #C100000015 · Bank of Canada PSP.
          </p>
        </section>
      </div>

      <ProgramsFooterLinks active="partners" />
      <SiteFooter />
      <MobileBottomNav />
    </>
  );
};

export default Partners;
