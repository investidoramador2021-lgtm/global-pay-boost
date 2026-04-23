import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Activity, CheckCircle2, AlertTriangle, Clock, Code2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

interface StatusPayload {
  status: string;
  generated_at: string;
  last_successful_delivery_at: string | null;
  counts_24h: {
    "swap.created": number;
    "swap.deposit_detected": number;
    "swap.finished": number;
    "swap.expired": number;
    total_with_webhook: number;
    success_rate_percent: number | null;
  };
  counts_7d: {
    "swap.created": number;
    "swap.deposit_detected": number;
    "swap.finished": number;
    "swap.expired": number;
  };
}

const STATUS_ENDPOINT =
  "https://tjikwxkmsfmyjkssvyoh.supabase.co/functions/v1/lite-webhook-status";

function timeAgo(iso: string | null): string {
  if (!iso) return "no deliveries yet";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s ago`;
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  return `${Math.floor(ms / 86_400_000)}d ago`;
}

const RECEIVER_TEMPLATE = `<!-- mrc-webhook-status.html — drop into your own dashboard -->
<!-- Reads from window.localStorage; populated by your webhook receiver below. -->
<div id="mrc-status" style="font-family:ui-monospace,monospace;padding:16px;border:1px solid #2a2a2a;border-radius:12px;max-width:480px;background:#0b0f17;color:#e6edf3">
  <div style="font-weight:600;margin-bottom:8px">MRC Webhook Receiver — local stats</div>
  <div>Last verified: <span id="mrc-last">—</span></div>
  <div>Last 24h:    <span id="mrc-24h">0</span> events</div>
  <div>By type: <span id="mrc-types">—</span></div>
  <div style="margin-top:8px;color:#8b949e;font-size:12px">Updates every 5s from localStorage.</div>
</div>
<script>
(function () {
  const KEY = "mrc_webhook_log";
  function read() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } }
  function ago(t) { const s=Math.floor((Date.now()-t)/1000); if(s<60)return s+"s ago"; if(s<3600)return Math.floor(s/60)+"m ago"; return Math.floor(s/3600)+"h ago"; }
  function render() {
    const log = read();
    const cutoff = Date.now() - 24*3600*1000;
    const recent = log.filter(e => e.t >= cutoff);
    const last = log[log.length-1];
    const types = recent.reduce((m,e)=>(m[e.event]=(m[e.event]||0)+1,m),{});
    document.getElementById("mrc-last").textContent = last ? ago(last.t) : "never";
    document.getElementById("mrc-24h").textContent  = recent.length;
    document.getElementById("mrc-types").textContent = Object.entries(types).map(([k,v])=>k+":"+v).join(" · ") || "—";
  }
  render(); setInterval(render, 5000);
})();
</script>

<!-- ─── In your webhook handler (Node.js example) ───────────────── -->
<!--
import crypto from "node:crypto";
app.post("/mrc-webhook", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.header("X-MRC-Signature");
  const expected = crypto.createHmac("sha256", process.env.MRC_WEBHOOK_SECRET)
    .update(req.body).digest("hex");
  if (!sig || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return res.status(401).send("bad signature");
  }
  const evt = JSON.parse(req.body.toString("utf8"));

  // Persist a tiny audit row (Postgres / Redis / wherever):
  await db.query(
    "INSERT INTO mrc_webhook_log(event, order_id, verified_at) VALUES ($1,$2, now())",
    [evt.event, evt.data.order_id]
  );

  // Optional: push to a public JSON the dashboard can fetch.
  // GET /mrc-webhook-status.json -> { last_verified_at, counts_24h: {...} }

  res.status(200).send("ok");
});
-->`;

export default function WebhookStatus() {
  const [data, setData] = useState<StatusPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const r = await fetch(STATUS_ENDPOINT, { cache: "no-store" });
        const j = (await r.json()) as StatusPayload;
        if (!cancelled) {
          setData(j);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "fetch failed");
      }
    }
    load();
    const id = setInterval(load, 30_000);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
      clearInterval(tick);
    };
  }, []);

  const c24 = data?.counts_24h;
  const c7 = data?.counts_7d;
  const successRate = c24?.success_rate_percent;
  const healthy = successRate === null || successRate >= 95;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Webhook Status — MRC Global Pay Lite API</title>
        <meta
          name="description"
          content="Live delivery health for MRC Global Pay Lite API webhooks: 24h event counts, success rate, and last successful verification."
        />
        <link rel="canonical" href="https://mrcglobalpay.com/webhook-status" />
      </Helmet>
      <SiteHeader />

      <main className="container max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            Webhook Status
          </h1>
          <p className="text-muted-foreground">
            Live, anonymized health of outbound webhook deliveries from the Lite API.
            Updated every 30 seconds. <span className="text-xs">Now: {new Date(now).toUTCString().slice(17, 25)} UTC</span>
          </p>
        </div>

        {/* Hero status card */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Overall delivery health
              </div>
              <div className="flex items-center gap-2">
                {healthy ? (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                )}
                <span className="text-2xl font-bold text-foreground">
                  {error
                    ? "Unknown"
                    : successRate === null
                      ? "Idle"
                      : `${successRate}% delivered (24h)`}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1 justify-end">
                <Clock className="h-3 w-3" /> Last successful delivery
              </div>
              <div className="text-lg font-mono text-foreground">
                {timeAgo(data?.last_successful_delivery_at ?? null)}
              </div>
              {data?.last_successful_delivery_at && (
                <div className="text-xs text-muted-foreground font-mono">
                  {new Date(data.last_successful_delivery_at).toISOString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Per-event tiles */}
        <h2 className="text-xl font-semibold text-foreground mb-4">Events delivered (last 24h)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {(["swap.created", "swap.deposit_detected", "swap.finished", "swap.expired"] as const).map(
            (evt) => (
              <div
                key={evt}
                className="rounded-xl border border-border bg-muted/30 p-4"
              >
                <div className="text-xs font-mono text-muted-foreground mb-1">{evt}</div>
                <div className="text-3xl font-bold text-foreground">
                  {c24?.[evt] ?? 0}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  7d: {c7?.[evt] ?? 0}
                </div>
              </div>
            ),
          )}
        </div>

        {/* Receiver template */}
        <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" />
          Self-hosted receiver dashboard
        </h2>
        <p className="text-muted-foreground mb-4 text-sm">
          The numbers above show <strong className="text-foreground">our</strong> outbound delivery
          stats. To track <strong className="text-foreground">your endpoint's</strong> verifications,
          paste this template into your own admin page — it logs every verified webhook to{" "}
          <code className="font-mono text-xs">localStorage</code> and renders a live count + last-verified
          timestamp.
        </p>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono mb-6 border border-border">
          {RECEIVER_TEMPLATE}
        </pre>

        <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground space-y-2 mb-10">
          <p>
            <strong className="text-foreground">Privacy:</strong> this page exposes only aggregate counts.
            No partner identifiers, wallet addresses, order IDs, or webhook URLs are ever returned.
          </p>
          <p>
            <strong className="text-foreground">Caching:</strong> the upstream JSON is cached at the edge
            for 60 seconds; the page polls every 30s.
          </p>
          <p>
            <strong className="text-foreground">JSON feed:</strong>{" "}
            <a
              className="text-primary hover:underline font-mono"
              href={STATUS_ENDPOINT}
              target="_blank"
              rel="noreferrer"
            >
              GET /functions/v1/lite-webhook-status
            </a>{" "}
            — wire it into your own monitor (Datadog, Grafana, UptimeRobot, etc.).
          </p>
          {error && (
            <p className="text-destructive">
              <strong>Fetch error:</strong> {error}
            </p>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
