import { ShieldCheck, BadgeCheck, Lock, ExternalLink, Landmark } from "lucide-react";

// Official FINTRAC public MSB registry search — passive trust signal for high-value clients
const FINTRAC_REGISTRY_URL =
  "https://www10.fintrac-canafe.gc.ca/msb-esm/public/msb-search/search-by-name/?searchTerm=MRC+Pay+International";

// Official Bank of Canada PSP Registry — direct entry for MRC Pay International Corp.
const BOC_PSP_REGISTRY_URL =
  "https://www.bankofcanada.ca/core-functions/retail-payments-supervision/psp-registry/psp-registry-details/?account_id=408b884a-1aa1-ef11-a72d-0022483bf164";

const MsbTrustBar = () => (
  <section className="border-t border-border/40 bg-muted/30 py-5" aria-label="Compliance and trust signals">
    <div className="container mx-auto px-4">
      <div className="flex flex-wrap items-center justify-center gap-3 text-center sm:gap-4">
        <a
          href={FINTRAC_REGISTRY_URL}
          target="_blank"
          rel="noopener noreferrer external"
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-primary/10 sm:text-sm"
          title="Verify on the official FINTRAC MSB Registry — opens in a new tab"
          aria-label="Verify MRC GlobalPay registration #C100000015 on the official FINTRAC MSB Registry (opens in new tab)"
        >
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>Registered Canadian MSB&nbsp;·&nbsp;<span className="font-mono">#C100000015</span></span>
          <ExternalLink className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
        </a>
        <a
          href={BOC_PSP_REGISTRY_URL}
          target="_blank"
          rel="noopener noreferrer external"
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-primary/10 sm:text-sm"
          title="Verify MRC GlobalPay on the official Bank of Canada PSP Registry — opens in a new tab"
          aria-label="Verify MRC GlobalPay on the official Bank of Canada PSP Registry (opens in new tab)"
        >
          <Landmark className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>Bank of Canada — Authorized PSP</span>
          <ExternalLink className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
        </a>
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
        Operated by MRC Pay International Corp., Ottawa, Canada — a FINTRAC-supervised money services business and Bank of Canada Authorized Payment Service Provider. Every swap is processed through a dual-regulated entity.
      </p>
    </div>
  </section>
);

export default MsbTrustBar;
