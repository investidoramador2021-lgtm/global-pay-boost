/**
 * WebhookStatusCard
 * ─────────────────
 * Reusable, fully-typed React component that fetches the public
 * /webhook-status.json feed and renders a professional stats card with:
 *   • overall 24h success rate (with health badge)
 *   • last successful delivery timestamp (relative + absolute)
 *   • per-event counts for swap.created / deposit_detected / finished / expired
 *
 * Drop it anywhere — it self-contains fetching, polling, and error handling.
 *
 *   <WebhookStatusCard />
 *   <WebhookStatusCard pollMs={15000} endpoint="/webhook-status.json" />
 */

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type WebhookEvent =
  | "swap.created"
  | "swap.deposit_detected"
  | "swap.finished"
  | "swap.expired";

export type WebhookEventCounts = Record<WebhookEvent, number>;

export interface WebhookStatusCounts24h extends WebhookEventCounts {
  total_with_webhook: number;
  success_rate_percent: number | null;
}

export interface WebhookStatusResponse {
  status: "success";
  generated_at: string;
  window: { hours_24: string; days_7: string };
  last_successful_delivery_at: string | null;
  counts_24h: WebhookStatusCounts24h;
  counts_7d: WebhookEventCounts;
  provider: string;
  documentation: string;
}

const DEFAULT_ENDPOINT = "/webhook-status.json";
const FALLBACK_ENDPOINT =
  "https://tjikwxkmsfmyjkssvyoh.supabase.co/functions/v1/lite-webhook-status";

const EVENT_LABELS: Record<WebhookEvent, string> = {
  "swap.created": "Created",
  "swap.deposit_detected": "Deposit detected",
  "swap.finished": "Finished",
  "swap.expired": "Expired",
};

const EVENTS = Object.keys(EVENT_LABELS) as WebhookEvent[];

function timeAgo(iso: string | null, now: number): string {
  if (!iso) return "no deliveries yet";
  const ms = now - new Date(iso).getTime();
  if (ms < 0) return "just now";
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s ago`;
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  return `${Math.floor(ms / 86_400_000)}d ago`;
}

function isWebhookStatus(x: unknown): x is WebhookStatusResponse {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return (
    r.status === "success" &&
    typeof r.generated_at === "string" &&
    typeof r.counts_24h === "object" &&
    r.counts_24h !== null
  );
}

export interface WebhookStatusCardProps {
  /** Override the JSON feed URL (defaults to /webhook-status.json with edge-function fallback). */
  endpoint?: string;
  /** Poll interval in ms. Defaults to 30s. Set to 0 to disable polling. */
  pollMs?: number;
  /** Extra wrapper className. */
  className?: string;
  /** Hide the per-event grid and only show the hero. */
  compact?: boolean;
}

export function WebhookStatusCard({
  endpoint = DEFAULT_ENDPOINT,
  pollMs = 30_000,
  className,
  compact = false,
}: WebhookStatusCardProps) {
  const [data, setData] = useState<WebhookStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const tryUrl = async (url: string) => {
        const r = await fetch(url, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = (await r.json()) as unknown;
        if (!isWebhookStatus(j)) throw new Error("invalid payload shape");
        return j;
      };

      try {
        let payload: WebhookStatusResponse;
        try {
          payload = await tryUrl(endpoint);
        } catch {
          // Fall back to the canonical edge function if the alias 404s or returns HTML.
          payload = await tryUrl(FALLBACK_ENDPOINT);
        }
        if (!cancelled) {
          setData(payload);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "fetch failed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const ids: number[] = [];
    if (pollMs > 0) ids.push(window.setInterval(load, pollMs));
    ids.push(window.setInterval(() => setNow(Date.now()), 1000));
    return () => {
      cancelled = true;
      ids.forEach((id) => window.clearInterval(id));
    };
  }, [endpoint, pollMs]);

  const c24 = data?.counts_24h;
  const c7 = data?.counts_7d;
  const successRate = c24?.success_rate_percent ?? null;
  const healthy = successRate === null || successRate >= 95;

  const headlineLabel = useMemo(() => {
    if (loading && !data) return "Loading…";
    if (error && !data) return "Unavailable";
    if (successRate === null) return "Idle";
    return `${successRate}%`;
  }, [loading, data, error, successRate]);

  return (
    <section
      aria-label="Webhook delivery status"
      className={cn(
        "rounded-2xl border border-border bg-card text-card-foreground shadow-sm",
        "p-6 md:p-7",
        className,
      )}
    >
      {/* Hero row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
            <Activity className="h-3 w-3" />
            Delivery health · 24h
          </div>
          <div className="flex items-center gap-2">
            {loading && !data ? (
              <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
            ) : healthy ? (
              <CheckCircle2 className="h-6 w-6 text-primary" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-destructive" />
            )}
            <span
              className={cn(
                "text-3xl font-bold tabular-nums",
                error && !data ? "text-destructive" : "text-foreground",
              )}
            >
              {headlineLabel}
            </span>
            {successRate !== null && (
              <span className="text-sm text-muted-foreground self-end mb-1">
                delivered
              </span>
            )}
          </div>
          {c24 && (
            <div className="text-xs text-muted-foreground mt-1">
              {c24.total_with_webhook.toLocaleString()} webhook-enabled swaps in window
            </div>
          )}
        </div>

        <div className="text-right">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1 justify-end">
            <Clock className="h-3 w-3" /> Last successful delivery
          </div>
          <div className="text-lg font-mono text-foreground">
            {timeAgo(data?.last_successful_delivery_at ?? null, now)}
          </div>
          {data?.last_successful_delivery_at && (
            <div className="text-[11px] text-muted-foreground font-mono">
              {new Date(data.last_successful_delivery_at).toISOString()}
            </div>
          )}
        </div>
      </div>

      {/* Per-event grid */}
      {!compact && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {EVENTS.map((evt) => (
            <div
              key={evt}
              className="rounded-xl border border-border bg-muted/30 p-3"
            >
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {EVENT_LABELS[evt]}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground/70 mb-1.5 truncate">
                {evt}
              </div>
              <div className="text-2xl font-bold text-foreground tabular-nums">
                {(c24?.[evt] ?? 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                7d: <span className="tabular-nums">{(c7?.[evt] ?? 0).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4 text-xs text-destructive">
          Feed error: {error}
        </div>
      )}
    </section>
  );
}

export default WebhookStatusCard;
