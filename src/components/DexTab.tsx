import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";

// Public LetsExchange widget affiliate id. Safe to expose (read-only widget routing).
// Replace with your production affiliate id from https://letsexchange.io/affiliate
const LETSEXCHANGE_AFFILIATE_ID = "mrcglobalpay";

interface DexTabProps {
  defaultFrom?: string;
  defaultTo?: string;
}

const DexTab = ({ defaultFrom, defaultTo }: DexTabProps) => {
  const [searchParams] = useSearchParams();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(620);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const widgetUrl = useMemo(() => {
    const from = (searchParams.get("from") || defaultFrom || "eth").toLowerCase();
    const to = (searchParams.get("to") || defaultTo || "usdt").toLowerCase();
    const params = new URLSearchParams({
      affiliate_id: LETSEXCHANGE_AFFILIATE_ID,
      mode: "dex",
      coin_from: from,
      coin_to: to,
      theme: "dark",
    });
    return `https://letsexchange.io/widget?${params.toString()}`;
  }, [searchParams, defaultFrom, defaultTo]);

  // Listen for postMessage height updates (LetsExchange supports this)
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (typeof event.origin !== "string" || !event.origin.includes("letsexchange.io")) return;
      const data = event.data;
      if (data && typeof data === "object" && typeof data.height === "number") {
        const h = Math.max(520, Math.min(900, Math.round(data.height)));
        setIframeHeight(h);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="space-y-4">
      <div
        className="relative overflow-hidden rounded-2xl border"
        style={{
          background: "hsl(220 25% 6% / 0.7)",
          borderColor: "hsl(220 20% 20% / 0.4)",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.45)",
        }}
      >
        {!iframeLoaded && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3"
            style={{ background: "hsl(220 25% 6%)" }}
          >
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Loading DEX router…
            </span>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={widgetUrl}
          title="LetsExchange DEX Widget"
          loading="lazy"
          allow="clipboard-write; clipboard-read"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setIframeLoaded(true)}
          className="block w-full border-0"
          style={{
            height: `${iframeHeight}px`,
            colorScheme: "dark",
            background: "transparent",
          }}
        />
      </div>

      <div
        className="flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[12px] leading-relaxed"
        style={{
          background: "hsl(220 25% 8% / 0.6)",
          borderColor: "hsl(45 90% 55% / 0.25)",
          color: "hsl(220 15% 75%)",
        }}
      >
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
        <p>
          DEX mode interacts directly with decentralized protocols. MRC Global Pay does not facilitate
          these transactions; they are executed peer-to-peer via your connected wallet.
        </p>
      </div>
    </div>
  );
};

export default DexTab;
