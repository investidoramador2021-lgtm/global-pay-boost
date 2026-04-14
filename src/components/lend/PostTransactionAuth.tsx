import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Shield, Loader2, LogIn, UserPlus, KeyRound, MailCheck } from "lucide-react";

interface PostTransactionAuthProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
  prefillEmail?: string;
  txId?: string;
  txType?: "loan" | "earn";
}

/* ------------------------------------------------------------------ */
/*  OTP helpers                                                        */
/* ------------------------------------------------------------------ */
function generateOtp(): string {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join("");
}

async function sendOtpEmail(email: string, otp: string, lang: string) {
  const { error } = await supabase.functions.invoke("smtp-send", {
    body: {
      to: email,
      from: "no-reply@mrc-pay.com",
      subject: `MRC GlobalPay – ${lang === "en" ? "Your Security Code" : "Code de sécurité"}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#D4AF37;margin-bottom:8px">🔐 MRC GlobalPay</h2>
          <p style="color:#333;font-size:14px;margin-bottom:16px">
            ${lang === "en" ? "Your two-factor authentication code is:" : "Votre code d'authentification à deux facteurs est :"}
          </p>
          <div style="background:#f9f9f9;border:2px solid #D4AF37;border-radius:12px;padding:20px;text-align:center;margin-bottom:16px">
            <span style="font-size:32px;letter-spacing:8px;font-weight:bold;color:#1a1a1a">${otp}</span>
          </div>
          <p style="color:#777;font-size:12px">
            ${lang === "en" ? "This code expires in 10 minutes. Do not share it with anyone." : "Ce code expire dans 10 minutes. Ne le partagez avec personne."}
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
          <p style="color:#999;font-size:11px">MRC GlobalPay · Registered Canadian MSB · C100000015</p>
        </div>
      `,
    },
  });
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function PostTransactionAuth({
  open, onClose, onAuthenticated, prefillEmail = "", txId, txType,
}: PostTransactionAuthProps) {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP state
  const [otpValue, setOtpValue] = useState("");
  const [expectedOtp, setExpectedOtp] = useState("");
  const [otpExpiry, setOtpExpiry] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  /* ── Send OTP ── */
  const dispatchOtp = useCallback(async (targetEmail: string) => {
    const code = generateOtp();
    setExpectedOtp(code);
    setOtpExpiry(Date.now() + 10 * 60 * 1000); // 10 min
    setOtpValue("");
    await sendOtpEmail(targetEmail, code, i18n.language);

    // cooldown
    setResendCooldown(60);
    const id = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(id); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, [i18n.language]);

  /* ── Register ── */
  const handleRegister = async () => {
    if (password.length < 8) { toast.error(t("lendDash.auth.minPassword", "Password must be at least 8 characters")); return; }
    if (password !== confirmPw) { toast.error(t("lendDash.auth.mismatch", "Passwords do not match")); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { lend_tx_id: txId, lend_tx_type: txType },
        },
      });
      if (error) throw error;
      toast.success(t("lendDash.auth.registered", "Account created! Check your email to verify."));

      // Auto sign-in after registration
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      // Move to 2FA step
      await dispatchOtp(email);
      setStep("otp");
      toast.info(t("lendDash.auth.otpSent", "A 6-digit security code was sent to your email."));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  /* ── Login ── */
  const handleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Move to 2FA step
      await dispatchOtp(email);
      setStep("otp");
      toast.info(t("lendDash.auth.otpSent", "A 6-digit security code was sent to your email."));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /* ── Verify OTP ── */
  const handleVerifyOtp = () => {
    if (Date.now() > otpExpiry) {
      toast.error(t("lendDash.auth.otpExpired", "Code expired. Please request a new one."));
      return;
    }
    if (otpValue !== expectedOtp) {
      toast.error(t("lendDash.auth.otpInvalid", "Invalid code. Please try again."));
      return;
    }
    toast.success(t("lendDash.authenticated", "Signed in successfully"));
    onAuthenticated();
  };

  /* ── Resend ── */
  const handleResend = async () => {
    setLoading(true);
    try {
      await dispatchOtp(email);
      toast.info(t("lendDash.auth.otpResent", "New code sent to your email."));
    } catch {
      toast.error(t("lendDash.auth.otpResendFail", "Failed to resend code. Try again."));
    } finally {
      setLoading(false);
    }
  };

  /* ── Reset on close ── */
  const handleClose = () => {
    // If we're at OTP step, sign out since 2FA not completed
    if (step === "otp") {
      supabase.auth.signOut();
    }
    setStep("credentials");
    setOtpValue("");
    setExpectedOtp("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md border-[#D4AF37]/20 bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            {step === "otp" ? (
              <>
                <KeyRound className="h-5 w-5 text-[#D4AF37]" />
                {t("lendDash.auth.otpTitle", "Two-Factor Verification")}
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 text-[#D4AF37]" />
                {mode === "register"
                  ? t("lendDash.auth.createTitle", "Create Your Management Account")
                  : t("lendDash.auth.loginTitle", "Sign In to Dashboard")}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* ── OTP Step ── */}
        {step === "otp" && (
          <div className="space-y-5">
            <div className="rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <MailCheck className="inline h-3 w-3 me-1 text-[#D4AF37]" />
                {t("lendDash.auth.otpExplain", "Enter the 6-digit code sent to {{email}} to complete sign-in.", { email })}
              </p>
            </div>

            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerifyOtp}
              disabled={loading || otpValue.length < 6}
              className="w-full bg-[#D4AF37] text-background hover:bg-[#D4AF37]/90"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <KeyRound className="h-4 w-4 me-2" />}
              {t("lendDash.auth.verifyBtn", "Verify & Continue")}
            </Button>

            <div className="text-center">
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
                className="text-xs text-[#D4AF37] hover:underline font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0
                  ? t("lendDash.auth.resendIn", "Resend in {{secs}}s", { secs: resendCooldown })
                  : t("lendDash.auth.resendCode", "Resend Code")}
              </button>
            </div>

            <p className="text-center text-[10px] text-muted-foreground">
              {t("lendDash.auth.otpExpiry", "This code is valid for 10 minutes.")}
            </p>
          </div>
        )}

        {/* ── Credentials Step ── */}
        {step === "credentials" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <Shield className="inline h-3 w-3 me-1 text-[#D4AF37]" />
                {t("lendDash.auth.whyNeeded", "A password-protected account is required to manage your positions — withdraw, repay, or top up collateral.")}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                <KeyRound className="inline h-3 w-3 me-1 text-[#D4AF37]" />
                {t("lendDash.auth.twoFaNotice", "A 6-digit verification code will be sent to your email after login for additional security.")}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">{t("lendDash.auth.email", "Email Address")}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="border-border"
                disabled={!!prefillEmail}
              />
              {prefillEmail && (
                <p className="text-[10px] text-muted-foreground">
                  {t("lendDash.auth.emailLocked", "Must match the email submitted to the partner API.")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm">{t("lendDash.auth.password", "Password")}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("lendDash.auth.minPassword", "Min. 8 characters")}
                className="border-border"
              />
            </div>

            {mode === "register" && (
              <div className="space-y-2">
                <Label className="text-sm">{t("lendDash.auth.confirmPw", "Confirm Password")}</Label>
                <Input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder={t("lendDash.auth.reenter", "Re-enter password")}
                  className="border-border"
                />
                {confirmPw && password !== confirmPw && (
                  <p className="text-xs text-destructive">{t("lendDash.auth.mismatch", "Passwords do not match")}</p>
                )}
              </div>
            )}

            <Button
              onClick={mode === "register" ? handleRegister : handleLogin}
              disabled={loading || !email || !password}
              className="w-full bg-[#D4AF37] text-background hover:bg-[#D4AF37]/90"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : mode === "register" ? <UserPlus className="h-4 w-4 me-2" /> : <LogIn className="h-4 w-4 me-2" />}
              {mode === "register"
                ? t("lendDash.auth.createBtn", "Create Account")
                : t("lendDash.auth.loginBtn", "Sign In")}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              {mode === "register" ? (
                <>
                  {t("lendDash.auth.haveAccount", "Already have an account?")}{" "}
                  <button onClick={() => setMode("login")} className="text-[#D4AF37] hover:underline font-medium">
                    {t("lendDash.auth.signIn", "Sign In")}
                  </button>
                </>
              ) : (
                <>
                  {t("lendDash.auth.noAccount", "No account yet?")}{" "}
                  <button onClick={() => setMode("register")} className="text-[#D4AF37] hover:underline font-medium">
                    {t("lendDash.auth.register", "Register")}
                  </button>
                </>
              )}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
