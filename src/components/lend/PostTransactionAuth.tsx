import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Loader2, LogIn, UserPlus } from "lucide-react";

interface PostTransactionAuthProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
  prefillEmail?: string;
  txId?: string;
  txType?: "loan" | "earn";
}

export default function PostTransactionAuth({
  open, onClose, onAuthenticated, prefillEmail = "", txId, txType,
}: PostTransactionAuthProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);

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
          data: {
            lend_tx_id: txId,
            lend_tx_type: txType,
          },
        },
      });
      if (error) throw error;
      toast.success(t("lendDash.auth.registered", "Account created! Check your email to verify."));

      // Auto sign-in after registration for immediate dashboard access
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (!signInError) onAuthenticated();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      onAuthenticated();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md border-[#D4AF37]/20 bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Shield className="h-5 w-5 text-[#D4AF37]" />
            {mode === "register"
              ? t("lendDash.auth.createTitle", "Create Your Management Account")
              : t("lendDash.auth.loginTitle", "Sign In to Dashboard")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <Shield className="inline h-3 w-3 me-1 text-[#D4AF37]" />
              {t("lendDash.auth.whyNeeded", "A password-protected account is required to manage your positions — withdraw, repay, or top up collateral.")}
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
      </DialogContent>
    </Dialog>
  );
}
