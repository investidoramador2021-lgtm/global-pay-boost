import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, ShieldCheck } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "already" | "expired" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    const verify = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-partner", {
          body: { token },
        });

        if (error) {
          setStatus("error");
          return;
        }

        if (data?.success) {
          setStatus(data.already_verified ? "already" : "success");
        } else if (data?.error === "token_expired") {
          setStatus("expired");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };

    verify();
  }, [token]);

  return (
    <>
      <Helmet>
        <title>Verify Email | MRC GlobalPay</title>
        <meta name="robots" content="index, follow" />
      </Helmet>
      <SiteHeader />
      <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-20 pb-20">
        <Card className="max-w-md w-full border-border/40 bg-card/40 backdrop-blur-sm">
          <CardContent className="p-8 text-center space-y-6">
            {status === "loading" && (
              <>
                <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
                <p className="text-muted-foreground">Verifying your email…</p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
                <h2 className="text-xl font-bold text-foreground">Email Verified Successfully</h2>
                <p className="text-muted-foreground">
                  Your account is now active. You may log in to your secure dashboard.
                </p>
                <Button
                  onClick={() => navigate("/partners?mode=login")}
                  className="w-full gap-2"
                >
                  <ShieldCheck className="w-4 h-4" /> Go to Login
                </Button>
              </>
            )}

            {status === "already" && (
              <>
                <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
                <h2 className="text-xl font-bold text-foreground">Already Verified</h2>
                <p className="text-muted-foreground">
                  Your email has already been verified. You can log in now.
                </p>
                <Button
                  onClick={() => navigate("/partners?mode=login")}
                  variant="outline"
                  className="w-full"
                >
                  Go to Login
                </Button>
              </>
            )}

            {status === "expired" && (
              <>
                <XCircle className="w-16 h-16 text-destructive mx-auto" />
                <h2 className="text-xl font-bold text-foreground">Link Expired</h2>
                <p className="text-muted-foreground">
                  This verification link has expired. Your account may have been deleted after 48 hours.
                  Please register again.
                </p>
                <Button
                  onClick={() => navigate("/partners")}
                  variant="outline"
                  className="w-full"
                >
                  Register Again
                </Button>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="w-16 h-16 text-destructive mx-auto" />
                <h2 className="text-xl font-bold text-foreground">Invalid Link</h2>
                <p className="text-muted-foreground">
                  This verification link is invalid or has already been used.
                </p>
                <Button
                  onClick={() => navigate("/partners")}
                  variant="outline"
                  className="w-full"
                >
                  Go to Partners
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <SiteFooter />
    </>
  );
};

export default VerifyEmail;
