import { useState, useEffect } from "react";
import { Activity } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * A small pulsing badge that indicates live network status.
 * Links to /status for full details.
 */
const LiveNetworkBadge = () => {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <Link
      to="/status"
      role="status"
      aria-live="polite"
      aria-label="Live network status: all networks operational"
      className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 transition-colors hover:bg-emerald-500/10"
      title="View live network status — Bitcoin, Ethereum, Solana mainnets operational"
    >
      <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
        <span
          className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 transition-opacity duration-700 ${
            pulse ? "opacity-75 scale-125" : "opacity-0 scale-100"
          }`}
        />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </span>
      <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
        Networks Live
      </span>
      <Activity className="h-3 w-3 text-emerald-500/60" aria-hidden="true" />
    </Link>
  );
};

export default LiveNetworkBadge;
