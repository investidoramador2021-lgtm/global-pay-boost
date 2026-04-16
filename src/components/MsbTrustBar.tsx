import { Link } from "react-router-dom";
import { ShieldCheck, BadgeCheck, Lock } from "lucide-react";

const MsbTrustBar = () => (
  <section className="border-t border-border/40 bg-muted/30 py-5" aria-label="Compliance and trust signals">
    <div className="container mx-auto px-4">
      <div className="flex flex-wrap items-center justify-center gap-3 text-center sm:gap-4">
        <Link
          to="/transparency-security"
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-primary/10 sm:text-sm"
          title="View MRC GlobalPay Canadian MSB registration details"
          aria-label="Official Canadian MSB registration badge for MRC GlobalPay, registration number C100000015"
        >
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>Registered Canadian MSB&nbsp;·&nbsp;<span className="font-mono">#C100000015</span></span>
        </Link>
        <span
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-semibold text-foreground sm:text-sm"
          aria-label="Official FINTRAC compliance badge for MRC GlobalPay"
          role="img"
        >
          <BadgeCheck className="h-4 w-4 text-primary" aria-hidden="true" />
          FINTRAC Compliant
        </span>
        <span
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-semibold text-foreground sm:text-sm"
          aria-label="Non-custodial swap engine badge — MRC GlobalPay never holds user funds"
          role="img"
        >
          <Lock className="h-4 w-4 text-primary" aria-hidden="true" />
          Non-Custodial Swaps
        </span>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Operated by MRC Pay International Corp., Ottawa, Canada — a regulated money services business. Unlike offshore exchanges, every swap is processed through a FINTRAC-supervised entity.
      </p>
    </div>
  </section>
);

export default MsbTrustBar;
