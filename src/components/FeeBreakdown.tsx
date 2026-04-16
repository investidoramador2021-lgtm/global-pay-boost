import { useState } from "react";
import { Info, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface FeeBreakdownProps {
  /** Display ticker the user is receiving (e.g. "BTC") */
  receiveTicker?: string;
  /** Display ticker the user is sending */
  sendTicker?: string;
}

/**
 * Transparent fee disclosure for the swap widget.
 * Critical YMYL trust signal — discloses that the displayed estimate
 * is net of network and provider fees (no hidden markup).
 */
const FeeBreakdown = ({ receiveTicker, sendTicker }: FeeBreakdownProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/40 px-2 py-1 font-body text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:text-[11px]"
          aria-label="View transparent fee breakdown: network fee plus provider fee"
        >
          <Info className="h-3 w-3" aria-hidden="true" />
          <span>Fee breakdown</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 border-border bg-popover/95 p-3 backdrop-blur-xl"
      >
        <div className="space-y-2">
          <p className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
            Transparent Pricing
          </p>
          <p className="font-body text-[11px] leading-relaxed text-muted-foreground">
            The amount shown is what you receive after all costs — no hidden markup.
          </p>

          <div className="my-2 h-px bg-border" />

          <div className="space-y-1.5 font-body text-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-foreground">Network Fee</div>
                <div className="text-[10px] text-muted-foreground">
                  Paid to {receiveTicker?.toUpperCase() || "destination"} miners/validators
                </div>
              </div>
              <span className="font-mono text-[11px] font-semibold text-foreground">Variable</span>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-foreground">Provider Fee</div>
                <div className="text-[10px] text-muted-foreground">
                  Liquidity routing &amp; execution
                </div>
              </div>
              <span className="font-mono text-[11px] font-semibold text-foreground">~0.5%</span>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-foreground">MRC GlobalPay Fee</div>
                <div className="text-[10px] text-muted-foreground">Platform service charge</div>
              </div>
              <span className="font-mono text-[11px] font-semibold text-trust">$0.00</span>
            </div>
          </div>

          <div className="my-2 h-px bg-border" />

          <p className="font-body text-[10px] leading-relaxed text-muted-foreground">
            All fees are pre-included in the quoted rate. Live network conditions may
            adjust the final {receiveTicker?.toUpperCase() || "asset"} amount by &lt;1%.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FeeBreakdown;
