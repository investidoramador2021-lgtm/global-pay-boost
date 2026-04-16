import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

/**
 * Real-time "System Pulse" indicator.
 * Sits near the swap CTA to mimic the live operational feel of leading exchanges.
 * Animation is a slow color pulse — non-distracting, accessibility-safe.
 */
const SystemPulse = () => {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="System pulse: liquidity optimal, global network online"
      className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.04] px-3 py-1.5"
      title="Live system status — liquidity optimal, global network online"
    >
      <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
        <span
          className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 transition-all duration-700 ${
            pulse ? "scale-150 opacity-60" : "scale-100 opacity-0"
          }`}
        />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-foreground/80 sm:text-[11px]">
        Liquidity:{" "}
        <span className="text-emerald-500">Optimal</span>
        <span className="mx-1.5 text-border" aria-hidden="true">|</span>
        Global Network:{" "}
        <span className="text-emerald-500">Online</span>
      </span>
      <Activity className="h-3 w-3 text-emerald-500/60" aria-hidden="true" />
    </div>
  );
};

export default SystemPulse;
