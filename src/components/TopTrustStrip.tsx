import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Slim, high-contrast top bar with regulatory trust signals.
 * Sits above the main nav inside SiteHeader so it inherits the sticky behavior.
 * YMYL trust signal — indexable text + descriptive aria-label for crawlers.
 */
const TopTrustStrip = () => (
  <div
    className="w-full border-b border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 text-foreground"
    role="region"
    aria-label="Regulatory compliance status: Registered Canadian Money Services Business, FINTRAC compliant"
  >
    <div className="container mx-auto flex items-center justify-center gap-2 px-4 py-1.5 text-center">
      <Link
        to="/transparency-security"
        className="inline-flex items-center gap-2 font-body text-[11px] font-semibold leading-tight tracking-wide text-foreground/90 hover:text-primary transition-colors sm:text-xs"
        title="View MRC GlobalPay's Canadian MSB registration and FINTRAC compliance details"
      >
        <span className="text-base leading-none" aria-hidden="true">🇨🇦</span>
        <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        <span>
          Registered Canadian Money Services Business
          <span className="mx-2 text-primary/50" aria-hidden="true">|</span>
          FINTRAC Compliant &amp; Regulated
        </span>
      </Link>
    </div>
  </div>
);

export default TopTrustStrip;
