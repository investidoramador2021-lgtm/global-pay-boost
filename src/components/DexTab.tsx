import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, ShieldAlert, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// Public LetsExchange affiliate id — safe to expose (read-only widget routing).
const LETSEXCHANGE_AFFILIATE_ID = "mrcglobalpay";
// Optional public widget API key — replace with the production key from letsexchange.io.
const LETSEXCHANGE_PUBLIC_API_KEY = "YOUR_API_KEY";

interface DexTabProps {
  defaultFrom?: string;
  defaultTo?: string;
}

const DexTab = ({ defaultFrom, defaultTo }: DexTabProps) => {
  const [searchParams] = useSearchParams();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(620);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const fromTicker = (searchParams.get("from") || defaultFrom || "eth").toLowerCase();
  const toTicker = (searchParams.get("to") || defaultTo || "usdt").toLowerCase();

  const widgetUrl = useMemo(() => {
    const params = new URLSearchParams({
      api_key: LETSEXCHANGE_PUBLIC_API_KEY,
      mode: "dex",
      ref_id: LETSEXCHANGE_AFFILIATE_ID,
      coin_from: fromTicker,
      coin_to: toTicker,
      theme: "dark",
    });
    return `https://letsexchange.io/widget?${params.toString()}`;
  }, [fromTicker, toTicker]);

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

  // If iframe never fires `load` within 6s, treat as blocked (e.g. Lovable preview frame restrictions).
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!iframeLoaded) setIframeBlocked(true);
    }, 6000);
    return () => window.clearTimeout(t);
  }, [iframeLoaded]);

  return (
    <div className="space-y-4">
      <div
        className="relative overflow-hidden rounded-2xl border"
        style={{
          background: "hsl(220 25% 6% / 0.7)",
          borderColor: "hsl(220 20% 20% / 0.4)",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.45)",
          minHeight: 520,
        }}
      >
        {!iframeLoaded && !iframeBlocked && (
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

        {iframeBlocked ? (
          // Development placeholder: shown when the third-party iframe is blocked
          // (e.g. inside Lovable preview). Production builds load the live iframe normally.
          <div
            className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center"
            style={{ minHeight: 520, background: "hsl(220 25% 6%)" }}
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, hsl(142 76% 46% / 0.2), hsl(142 76% 46% / 0.05))",
                border: "1px solid hsl(142 76% 46% / 0.35)",
              }}
            >
              <ExternalLink className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display text-lg font-bold text-foreground">DEX Router (Development Preview)</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                The non-custodial LetsExchange DEX widget is embedded here in production.
                This sandbox preview blocks third-party iframes — open the live URL in a new tab to interact.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(widgetUrl, "_blank", "noopener,noreferrer")}
            >
              Open DEX widget
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </Button>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
              {fromTicker.toUpperCase()} → {toTicker.toUpperCase()} · mode=dex
            </div>
          </div>
        ) : (
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
        )}
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
          DEX mode interacts directly with decentralized protocols. Registration-Free, Direct-to-Wallet
          settlement — MRC Global Pay does not facilitate these transactions; they are executed peer-to-peer
          via your connected wallet.
        </p>
      </div>
    </div>
  );
};

export default DexTab;
