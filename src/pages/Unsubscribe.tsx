import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle, MailX } from "lucide-react";
import { Button } from "@/components/ui/button";

type Status = "loading" | "valid" | "already" | "invalid" | "success" | "error";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
        );
        const data = await res.json();
        if (!res.ok) { setStatus("invalid"); return; }
        if (data.valid === false && data.reason === "already_unsubscribed") { setStatus("already"); return; }
        setStatus("valid");
      } catch { setStatus("invalid"); }
    })();
  }, [token]);

  const handleConfirm = async () => {
    setStatus("loading");
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", { body: { token } });
      if (error) throw error;
      if (data?.success) setStatus("success");
      else if (data?.reason === "already_unsubscribed") setStatus("already");
      else setStatus("error");
    } catch { setStatus("error"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Processing…</p>
          </>
        )}
        {status === "valid" && (
          <>
            <MailX className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="text-xl font-semibold text-foreground mb-2">Unsubscribe</h1>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to stop receiving email notifications from MRC Global Pay?
            </p>
            <Button onClick={handleConfirm} size="lg" className="w-full">
              Confirm Unsubscribe
            </Button>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="text-xl font-semibold text-foreground mb-2">You've been unsubscribed</h1>
            <p className="text-muted-foreground">You will no longer receive email notifications from us.</p>
          </>
        )}
        {status === "already" && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h1 className="text-xl font-semibold text-foreground mb-2">Already Unsubscribed</h1>
            <p className="text-muted-foreground">This email address has already been removed from our mailing list.</p>
          </>
        )}
        {status === "invalid" && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h1 className="text-xl font-semibold text-foreground mb-2">Invalid Link</h1>
            <p className="text-muted-foreground">This unsubscribe link is invalid or has expired.</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h1 className="text-xl font-semibold text-foreground mb-2">Something Went Wrong</h1>
            <p className="text-muted-foreground">Please try again later or contact support.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
