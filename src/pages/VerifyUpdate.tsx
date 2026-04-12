import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle2, XCircle, Loader2, Lock, Wallet } from "lucide-react";

const BTC_REGEX = /^(1[1-9A-HJ-NP-Za-km-z]{25,34}|3[1-9A-HJ-NP-Za-km-z]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{25,90})$/;

const VerifyUpdate = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const { toast } = useToast();

  const [status, setStatus] = useState<"loading" | "valid" | "expired" | "used" | "invalid" | "success" | "error">("loading");
  const [newPassword, setNewPassword] = useState("");
  const [newWallet, setNewWallet] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [walletError, setWalletError] = useState("");

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    (async () => {
      try {
        const { data } = await supabase.functions.invoke("partner-update-token", {
          body: { action: "validate", token },
        });
        if (data?.valid) setStatus("valid");
        else setStatus(data?.reason === "expired" ? "expired" : data?.reason === "used" ? "used" : "invalid");
      } catch {
        setStatus("error");
      }
    })();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword && !newWallet) {
      toast({ title: "Nothing to update", description: "Enter a new password or wallet address.", variant: "destructive" });
      return;
    }
    if (newWallet && !BTC_REGEX.test(newWallet)) {
      setWalletError("Invalid BTC address format");
      return;
    }
    setWalletError("");
    setSubmitting(true);

    const lang = localStorage.getItem("user-lang") || navigator.language?.slice(0, 2) || "en";

    try {
      const { data } = await supabase.functions.invoke("partner-update-token", {
        body: { action: "apply", token, newPassword: newPassword || undefined, newWallet: newWallet || undefined, lang },
      });
      if (data?.success) {
        setStatus("success");
        toast({ title: "Account updated successfully" });
      } else {
        toast({ title: "Update failed", description: data?.reason || "Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Secure Account Update | MRC GlobalPay</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <Card className="relative z-10 w-full max-w-md border-border/40 bg-card/60 backdrop-blur-xl">
          {status === "loading" && (
            <CardContent className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Verifying secure link…</p>
            </CardContent>
          )}

          {status === "invalid" && (
            <CardContent className="py-16 text-center">
              <XCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-bold text-foreground mb-2">Invalid Link</h2>
              <p className="text-sm text-muted-foreground">This link is invalid or has been tampered with.</p>
            </CardContent>
          )}

          {status === "expired" && (
            <CardContent className="py-16 text-center">
              <XCircle className="w-10 h-10 text-amber-400 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-foreground mb-2">Link Expired</h2>
              <p className="text-sm text-muted-foreground">This secure link has expired. Please request a new one from your dashboard.</p>
            </CardContent>
          )}

          {status === "used" && (
            <CardContent className="py-16 text-center">
              <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="text-lg font-bold text-foreground mb-2">Already Used</h2>
              <p className="text-sm text-muted-foreground">This secure link has already been used. Request a new one if needed.</p>
            </CardContent>
          )}

          {status === "success" && (
            <CardContent className="py-16 text-center">
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">Account Updated</h2>
              <p className="text-sm text-muted-foreground">Your security details have been updated successfully. A confirmation email has been sent.</p>
            </CardContent>
          )}

          {status === "error" && (
            <CardContent className="py-16 text-center">
              <XCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-bold text-foreground mb-2">Error</h2>
              <p className="text-sm text-muted-foreground">Something went wrong. Please try again later.</p>
            </CardContent>
          )}

          {status === "valid" && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Secure Account Update</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Update your password and/or payout wallet below.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm">
                      <Lock className="w-4 h-4 text-muted-foreground" /> New Password
                    </Label>
                    <Input
                      type="password"
                      placeholder="Min. 8 characters (leave blank to skip)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={8}
                      className="bg-background/50 border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm">
                      <Wallet className="w-4 h-4 text-muted-foreground" /> New Settlement Wallet (BTC)
                    </Label>
                    <Input
                      type="text"
                      placeholder="BTC address (leave blank to skip)"
                      value={newWallet}
                      onChange={(e) => { setNewWallet(e.target.value); setWalletError(""); }}
                      className="bg-background/50 border-border/50 font-mono text-sm"
                    />
                    {walletError && <p className="text-xs text-destructive">{walletError}</p>}
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating…</> : "Confirm Update"}
                  </Button>

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
