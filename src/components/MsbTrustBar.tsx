import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const MsbTrustBar = () => (
  <section className="border-t border-border/40 bg-muted/30 py-4">
    <div className="container mx-auto flex items-center justify-center gap-2 px-4 text-center">
      <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <p className="text-xs text-muted-foreground sm:text-sm">
        <Link
          to="/transparency-security"
          className="font-medium text-foreground underline-offset-4 hover:underline"
          title="View MRC GlobalPay compliance and security details"
        >
          Registered Canadian MSB
        </Link>
        {" "}— Licensed &amp; compliant under FINTRAC. Your swaps are processed through a regulated money services business.
      </p>
    </div>
  </section>
);

export default MsbTrustBar;
