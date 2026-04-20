import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle2, XCircle, Loader2, Lock, Wallet } from "lucide-react";

const BTC_REGEX = /^(1[1-9A-HJ-NP-Za-km-z]{25,34}|3[1-9A-HJ-NP-Za-km-z]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{25,90})$/;

const VerifyUpdate = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const { toast } = useToast();

  const [status, setStatus] = useState<"loading" | "valid" | "expired" | "used" | "invalid" | "success" | "error">("loading");
  const [purpose, setPurpose] = useState<"password" | "wallet">("password");

  // Password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Wallet fields
  const [newWallet, setNewWallet] = useState("");
  const [walletError, setWalletError] = useState("");
  const [walletConfirmed, setWalletConfirmed] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const passwordsMatch = newPassword.length >= 8 && newPassword === confirmPassword;

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    (async () => {
      try {
        const { data } = await supabase.functions.invoke("partner-update-token", {
          body: { action: "validate", token },
        });
        if (data?.valid) {
          setStatus("valid");
          setPurpose(data.purpose === "wallet" ? "wallet" : "password");
        } else {
          setStatus(data?.reason === "expired" ? "expired" : data?.reason === "used" ? "used" : "invalid");
        }
      } catch {
        setStatus("error");
      }
    })();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (purpose === "password" && !passwordsMatch) return;
    if (purpose === "wallet") {
      if (!BTC_REGEX.test(newWallet)) { setWalletError("Invalid BTC address format"); return; }
      if (!walletConfirmed) return;
    }

    setWalletError("");
    setSubmitting(true);
    const lang = localStorage.getItem("user-lang") || navigator.language?.slice(0, 2) || "en";

    try {
      const payload: Record<string, string | undefined> = { action: "apply", token, purpose, lang };
      if (purpose === "password") payload.newPassword = newPassword;
      if (purpose === "wallet") payload.newWallet = newWallet;

      const { data } = await supabase.functions.invoke("partner-update-token", { body: payload });
      if (data?.success) {
        setStatus("success");
        toast({ title: purpose === "password" ? "Password updated" : "Wallet updated" });
      } else {
        toast({ title: "Update failed", description: data?.reason || "Try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const renderState = () => {
    switch (status) {
      case "loading":
        return (
          <CardContent className="py-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Verifying secure link…</p>
          </CardContent>
        );
      case "invalid":
        return (
          <CardContent className="py-16 text-center">
            <XCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">Invalid Link</h2>
            <p className="text-sm text-muted-foreground">This link is invalid or has been tampered with.</p>
          </CardContent>
        );
      case "expired":
        return (
          <CardContent className="py-16 text-center">
            <XCircle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">Link Expired</h2>
            <p className="text-sm text-muted-foreground">This secure link has expired. Request a new one from your dashboard.</p>
          </CardContent>
        );
      case "used":
        return (
          <CardContent className="py-16 text-center">
            <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">Already Used</h2>
            <p className="text-sm text-muted-foreground">This link has already been used.</p>
          </CardContent>
        );
      case "success":
        return (
          <CardContent className="py-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">
              {purpose === "password" ? "Password Updated" : "Wallet Updated"}
            </h2>
            <p className="text-sm text-muted-foreground">A confirmation email has been sent to your inbox.</p>
          </CardContent>
        );
      case "error":
        return (
          <CardContent className="py-16 text-center">
            <XCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">Error</h2>
            <p className="text-sm text-muted-foreground">Something went wrong. Please try again later.</p>
          </CardContent>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Secure Account Update | MRC Global Pay</title>
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <Card className="relative z-10 w-full max-w-md border-border/40 bg-card/60 backdrop-blur-xl">
          {status !== "valid" ? renderState() : (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {purpose === "password" ? <Lock className="w-6 h-6 text-primary" /> : <Wallet className="w-6 h-6 text-primary" />}
                </div>
                <CardTitle className="text-xl">
                  {purpose === "password" ? "Reset Your Password" : "Update Settlement Wallet"}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {purpose === "password"
                    ? "Enter and confirm your new password below."
                    : "Enter your new BTC payout address below."}
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {purpose === "password" ? (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm">New Password</Label>
                        <Input
                          type="password"
                          placeholder="Min. 8 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          minLength={8}
                          required
                          className="bg-background/50 border-border/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Confirm New Password</Label>
                        <Input
                          type="password"
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          minLength={8}
                          required
                          className="bg-background/50 border-border/50"
                        />
                        {confirmPassword && newPassword !== confirmPassword && (
                          <p className="text-xs text-destructive">Passwords do not match</p>
                        )}
                      </div>
                      <Button type="submit" disabled={submitting || !passwordsMatch} className="w-full">
                        {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</> : "Save New Password"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm">New BTC Settlement Address</Label>
                        <Input
                          type="text"
                          placeholder="BTC address (1..., 3..., or bc1...)"
                          value={newWallet}
                          onChange={(e) => { setNewWallet(e.target.value); setWalletError(""); }}
                          required
                          className="bg-background/50 border-border/50 font-mono text-sm"
                        />
                        {walletError && <p className="text-xs text-destructive">{walletError}</p>}
                      </div>
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="wallet-confirm"
                          checked={walletConfirmed}
                          onCheckedChange={(v) => setWalletConfirmed(v === true)}
                        />
                        <label htmlFor="wallet-confirm" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                          I confirm that this address is correct and I am responsible for any funds sent here.
                        </label>
                      </div>
                      <Button type="submit" disabled={submitting || !walletConfirmed || !newWallet} className="w-full">
                        {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</> : "Save New Wallet"}
                      </Button>
                    </>
                  )}
                  <p className="text-xs text-muted-foreground text-center">
                    This link expires 15 minutes after it was generated.
                  </p>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </>
  );
};

export default VerifyUpdate;
