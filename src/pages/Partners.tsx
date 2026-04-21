import { useState, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight, Check, AlertCircle, Shield, ExternalLink, Sparkles,
  BarChart3, LineChart, Users, TrendingUp, Coins, Percent,
  Gauge, Webhook, KeyRound, Building2, DollarSign, Wallet, Zap, Headphones, Award,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { ProgramsNav } from "@/components/ProgramsNav";
import { getLangFromPath, langPath } from "@/i18n";

const BTC_REGEX = /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{25,90})$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const Partners = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);

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
        const { data: profile } = await supabase
          .from("partner_profiles")
          .select("verification_status")
          .eq("user_id", loginData.user.id)
          .maybeSingle();
        if (profile && profile.verification_status !== "active") {
          await supabase.auth.signOut();
          toast({ title: t("partners.toast.notVerifiedTitle"), description: t("partners.toast.notVerifiedDesc"), variant: "destructive" });
          return;
        }
        navigate("/dashboard");
        return;
      }

      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error("Registration failed");

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
            title: t("partners.toast.claimedTitle", { count: claimedCount }),
            description: t("partners.toast.claimedDesc"),
          });
        }
      }

      const userLang = localStorage.getItem("user-lang") || navigator.language?.slice(0, 2) || "en";
      await supabase.functions.invoke("smtp-send", {
        body: {
          type: "verification",
          to: email,
          lang: userLang,
          verificationToken,
          expiresAt,
        },
      });

      await supabase.auth.signOut();
      toast({
        title: t("partners.toast.checkInboxTitle"),
        description: t("partners.toast.checkInboxDesc"),
      });
      setIsLogin(true);
    } catch (err: any) {
      toast({ title: t("partners.toast.errorTitle"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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

  const features = [
    { titleKey: "partners.features.rewards.title", descKey: "partners.features.rewards.desc", gradient: "from-amber-500/20 to-orange-500/20", icon: Coins },
    { titleKey: "partners.features.settlement.title", descKey: "partners.features.settlement.desc", gradient: "from-violet-500/20 to-purple-500/20", icon: Wallet },
    { titleKey: "partners.features.dashboard.title", descKey: "partners.features.dashboard.desc", gradient: "from-sky-500/20 to-cyan-500/20", icon: BarChart3 },
    { titleKey: "partners.features.support.title", descKey: "partners.features.support.desc", gradient: "from-emerald-500/20 to-teal-500/20", icon: Headphones },
  ];

  const whyPoints = [
    { icon: Award, titleKey: "partners.why.serious.title", descKey: "partners.why.serious.desc" },
    { icon: LineChart, titleKey: "partners.why.dashboard.title", descKey: "partners.why.dashboard.desc" },
    { icon: Headphones, titleKey: "partners.why.support.title", descKey: "partners.why.support.desc" },
    { icon: Shield, titleKey: "partners.why.regulated.title", descKey: "partners.why.regulated.desc" },
    { icon: Coins, titleKey: "partners.why.lifetime.title", descKey: "partners.why.lifetime.desc" },
    { icon: Zap, titleKey: "partners.why.automation.title", descKey: "partners.why.automation.desc" },
  ];

  const earningsRows = [
    { volumeKey: "partners.earnings.row1.volume", rateKey: "partners.earnings.row1.rate", earnKey: "partners.earnings.row1.earn" },
    { volumeKey: "partners.earnings.row2.volume", rateKey: "partners.earnings.row2.rate", earnKey: "partners.earnings.row2.earn" },
    { volumeKey: "partners.earnings.row3.volume", rateKey: "partners.earnings.row3.rate", earnKey: "partners.earnings.row3.earn" },
    { volumeKey: "partners.earnings.row4.volume", rateKey: "partners.earnings.row4.rate", earnKey: "partners.earnings.row4.earn" },
  ];

  return (
    <>
      <Helmet>
        <title>{t("partners.meta.title")}</title>
        <meta name="description" content={t("partners.meta.description")} />
      </Helmet>

      <SiteHeader />
      <ProgramsNav active="partners" />

      <div className="relative min-h-screen bg-background overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">

            {/* LEFT — Hero / value prop */}
            <div className="space-y-10">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-semibold tracking-widest uppercase text-primary">{t("partners.hero.badge")}</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-foreground leading-[1.1] tracking-tight">
                  {t("partners.hero.headlineLead")}{" "}
                  <span className="text-primary">{t("partners.hero.headlineAccent")}</span>
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                  {t("partners.hero.subPart1")}{" "}
                  <span className="text-foreground font-semibold">{t("partners.hero.subRate")}</span>{" "}
                  {t("partners.hero.subPart2")}
                </p>
              </div>

              {/* Our Programs cross-link box */}
              <div className="rounded-2xl border border-primary/20 bg-card/40 backdrop-blur-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {t("partners.programs.title")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{t("partners.programs.subtitle")}</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  <Link
                    to={langPath(lang, "/affiliates")}
                    className="group inline-flex items-center justify-between rounded-xl border border-border/60 bg-background/50 px-4 py-3 transition-all hover:border-primary/50 hover:bg-primary/5"
                  >
                    <div>
                      <div className="text-sm font-semibold text-foreground">{t("partners.programs.affiliateTitle")}</div>
                      <div className="text-xs text-muted-foreground">{t("partners.programs.affiliateDesc")}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to={langPath(lang, "/referral")}
                    className="group inline-flex items-center justify-between rounded-xl border border-border/60 bg-background/50 px-4 py-3 transition-all hover:border-primary/50 hover:bg-primary/5"
                  >
                    <div>
                      <div className="text-sm font-semibold text-foreground">{t("partners.programs.referralTitle")}</div>
                      <div className="text-xs text-muted-foreground">{t("partners.programs.referralDesc")}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Feature cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div
                      key={f.titleKey}
                      className="group relative rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-5 transition-all hover:border-primary/30 hover:bg-card/60"
                    >
                      <div className={`mb-3 w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center ring-1 ring-white/5`}>
                        <Icon className="w-5 h-5 text-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{t(f.titleKey)}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{t(f.descKey)}</p>
                    </div>
                  );
                })}
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

            {/* RIGHT — Registration */}
            <div className="lg:sticky lg:top-28">
              <div className="relative rounded-3xl border border-border/40 bg-card/30 backdrop-blur-xl p-px shadow-[0_0_80px_-20px_hsl(var(--primary)/0.15)]">
                <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                <div className="rounded-3xl p-6 sm:p-8">
                  <div className="text-center space-y-1.5 mb-6">
                    <h2 className="text-xl font-bold text-foreground">
                      {isLogin ? t("partners.form.welcomeBack") : t("partners.form.activateTitle")}
                    </h2>
                    {!isLogin && (
                      <p className="text-sm text-muted-foreground">
                        {t("partners.form.activateSubtitle")}
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="firstName" className="text-xs text-muted-foreground">{t("partners.form.firstName")}</Label>
                            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputClass} />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="lastName" className="text-xs text-muted-foreground">{t("partners.form.lastName")}</Label>
                            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputClass} />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="btcWallet" className="text-xs text-muted-foreground">{t("partners.form.btcWallet")}</Label>
                          <Input id="btcWallet" value={btcWallet} onChange={(e) => setBtcWallet(e.target.value)} placeholder="bc1q..." required className={`${inputClass} font-mono text-sm`} />
                          <ValidationHint valid={btcValid} show={btcWallet.length > 5} ok={t("partners.form.btcOk")} fail={t("partners.form.btcFail")} />
                        </div>
                      </>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs text-muted-foreground">{t("partners.form.email")}</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
                      {!isLogin && <ValidationHint valid={emailValid} show={email.length > 3} ok={t("partners.form.emailOk")} fail={t("partners.form.emailFail")} />}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-xs text-muted-foreground">{t("partners.form.password")}</Label>
                      <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className={inputClass} />
                      {!isLogin && password.length > 0 && password.length < 8 && (
                        <p className="text-xs text-muted-foreground mt-1">{t("partners.form.passwordMin")}</p>
                      )}
                    </div>

                    {!isLogin && (
                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword" className="text-xs text-muted-foreground">{t("partners.form.confirmPassword")}</Label>
                        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} className={inputClass} />
                        <ValidationHint
                          valid={passwordsMatch}
                          show={confirmPassword.length > 0}
                          ok={t("partners.form.passwordsMatch")}
                          fail={t("partners.form.passwordsNoMatch")}
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      disabled={loading || !canSubmit}
                      className="w-full gap-2.5 h-14 text-lg font-bold rounded-xl mt-4 border-0 text-primary-foreground bg-primary hover:bg-primary/90 shadow-[0_6px_24px_-4px_hsl(var(--primary)/0.55)] hover:shadow-[0_8px_32px_-4px_hsl(var(--primary)/0.7)] transition-all duration-200 uppercase tracking-wide"
                    >
                      {loading ? t("partners.form.processing") : isLogin ? t("partners.form.signInBtn") : t("partners.form.createBtn")}
                    </Button>
                  </form>

                  <div className="mt-6 pt-5 border-t border-border/30 text-center space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {isLogin ? t("partners.form.noAccount") : t("partners.form.haveAccount")}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsLogin(!isLogin)}
                      className="w-full h-12 text-base font-semibold rounded-xl border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60 transition-all"
                    >
                      {isLogin ? t("partners.form.toggleRegister") : t("partners.form.toggleLogin")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* WHY BECOME A PARTNER */}
        <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/40">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <Award className="h-3 w-3" /> {t("partners.why.badge")}
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              {t("partners.why.title")}
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {t("partners.why.subtitle")}
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {whyPoints.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.titleKey}
                  className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-5 transition-all hover:-translate-y-1 hover:border-primary/40"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">{t(p.titleKey)}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(p.descKey)}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* COMMISSION TIERS */}
        <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/40">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <Percent className="h-3 w-3" /> {t("partners.tiers.badge")}
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              {t("partners.tiers.title")}
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {t("partners.tiers.subtitle")}
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { tierKey: "partners.tiers.activate", rate: "0.10%", rangeKey: "partners.tiers.activateRange", icon: Coins },
              { tierKey: "partners.tiers.scale",    rate: "0.13%", rangeKey: "partners.tiers.scaleRange", icon: TrendingUp },
              { tierKey: "partners.tiers.volume",   rate: "0.16%", rangeKey: "partners.tiers.volumeRange", icon: BarChart3 },
              { tierKey: "partners.tiers.strategic",rate: "0.20%", rangeKey: "partners.tiers.strategicRange", icon: Sparkles },
            ].map((c) => (
              <div
                key={c.tierKey}
                className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-5 text-center transition-all hover:-translate-y-1 hover:border-primary/40"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <c.icon className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t(c.tierKey)}</p>
                <p className="mt-1 text-3xl font-extrabold text-foreground">{c.rate}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t(c.rangeKey)}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground max-w-2xl mx-auto">
            {t("partners.tiers.footnote")}
          </p>
        </section>

        {/* EARNINGS EXAMPLES */}
        <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/40">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <DollarSign className="h-3 w-3" /> {t("partners.earnings.badge")}
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              {t("partners.earnings.title")}
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {t("partners.earnings.subtitle")}
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-4 px-5 py-3 border-b border-border/40 bg-background/40">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("partners.earnings.colVolume")}</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">{t("partners.earnings.colRate")}</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">{t("partners.earnings.colEarn")}</span>
            </div>
            {earningsRows.map((r, i) => (
              <div
                key={r.volumeKey}
                className={`grid grid-cols-3 gap-4 px-5 py-4 items-center ${i !== earningsRows.length - 1 ? "border-b border-border/30" : ""}`}
              >
                <span className="font-mono text-sm text-foreground">{t(r.volumeKey)}</span>
                <span className="font-mono text-sm text-primary text-center font-semibold">{t(r.rateKey)}</span>
                <span className="font-mono text-sm text-foreground text-right font-semibold">{t(r.earnKey)}</span>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground max-w-2xl mx-auto">
            {t("partners.earnings.disclaimer")}
          </p>
        </section>

        {/* DASHBOARD PREVIEWS */}
        <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/40">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <LineChart className="h-3 w-3" /> {t("partners.dashboard.badge")}
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              {t("partners.dashboard.title")}
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {t("partners.dashboard.subtitle")}
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("partners.dashboard.lifetimeEarnings")}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
                  <Coins className="h-3 w-3" /> BTC
                </span>
              </div>
              <div className="mt-3 font-mono text-3xl font-extrabold text-foreground">₿ 0.48217340</div>
              <p className="mt-1 text-xs text-muted-foreground">{t("partners.dashboard.lifetimeUsd")}</p>
              <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-border/60">
                <div className="h-full w-2/3 bg-gradient-to-r from-primary to-[hsl(var(--neon))]" />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">{t("partners.dashboard.tierProgress")}</p>
            </div>

            <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("partners.dashboard.volume30d")}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                  <TrendingUp className="h-3 w-3" /> +24.1%
                </span>
              </div>
              <div className="mt-3 font-mono text-3xl font-extrabold text-foreground">$612,480</div>
              <p className="mt-1 text-xs text-muted-foreground">{t("partners.dashboard.volumeMeta")}</p>
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

            <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("partners.dashboard.topSources")}
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
              <p className="mt-3 text-[11px] text-muted-foreground">{t("partners.dashboard.drilldown")}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { icon: KeyRound, key: "partners.dashboard.perkApi" },
              { icon: Webhook,  key: "partners.dashboard.perkWebhook" },
              { icon: Gauge,    key: "partners.dashboard.perkAnalytics" },
            ].map((p) => (
              <div key={p.key} className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/40 px-4 py-3">
                <p.icon className="h-4 w-4 text-primary shrink-0" aria-hidden />
                <span className="text-sm text-foreground">{t(p.key)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* WHO IT'S FOR */}
        <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/40">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <Building2 className="h-3 w-3" /> {t("partners.whoFor.badge")}
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              {t("partners.whoFor.title")}
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {t("partners.whoFor.subtitle")}
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { titleKey: "partners.whoFor.wallets.title", descKey: "partners.whoFor.wallets.desc" },
              { titleKey: "partners.whoFor.media.title", descKey: "partners.whoFor.media.desc" },
              { titleKey: "partners.whoFor.exchanges.title", descKey: "partners.whoFor.exchanges.desc" },
              { titleKey: "partners.whoFor.communities.title", descKey: "partners.whoFor.communities.desc" },
            ].map((p) => (
              <div key={p.titleKey} className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-5 transition-all hover:-translate-y-1 hover:border-primary/40">
                <h3 className="font-semibold text-foreground">{t(p.titleKey)}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{t(p.descKey)}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {t("partners.whoFor.lowerVolumePrefix")}{" "}
            <Link to={langPath(lang, "/affiliates")} className="font-semibold text-primary hover:underline">{t("partners.whoFor.affiliateLink")}</Link>{" "}
            {t("partners.whoFor.lowerVolumeSuffix")}
          </p>
        </section>

        {/* REGULATORY EDGE */}
        <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/40">
          <div className="rounded-3xl border border-primary/20 bg-card/40 backdrop-blur-sm p-8 sm:p-12 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <Shield className="h-7 w-7 text-primary" aria-hidden />
              </div>
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                  {t("partners.regulatory.badge")}
                </div>
                <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  {t("partners.regulatory.title")}
                </h2>
                <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {t("partners.regulatory.body")}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a
                    href="https://www10.fintrac-canafe.gc.ca/msb-esm/public/msb-search/search-by-name/?searchTerm=MRC+Pay+International"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                  >
                    <ExternalLink className="h-3 w-3" /> {t("partners.regulatory.verifyFintrac")}
                  </a>
                  <a
                    href="https://www.bankofcanada.ca/core-functions/retail-payments-supervision/psp-registry/psp-registry-details/?account_id=408b884a-1aa1-ef11-a72d-0022483bf164"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                  >
                    <ExternalLink className="h-3 w-3" /> {t("partners.regulatory.verifyPsp")}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/40 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> {t("partners.finalCta.badge")}
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            {t("partners.finalCta.title")}
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            {t("partners.finalCta.body")}
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#top"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
            >
              {t("partners.finalCta.scrollToTop")} <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to={langPath(lang, "/affiliates")}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-6 py-3 text-base font-semibold text-muted-foreground transition-all hover:border-primary/40 hover:text-primary"
            >
              {t("partners.finalCta.tryAffiliate")}
            </Link>
            <Link
              to={langPath(lang, "/referral")}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-6 py-3 text-base font-semibold text-muted-foreground transition-all hover:border-primary/40 hover:text-primary"
            >
              {t("partners.finalCta.referralLink")}
            </Link>
          </div>
        </section>
      </div>

      <SiteFooter />
    </>
  );
};

export default Partners;
