import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Activity, Code2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WebhookStatusCard from "@/components/WebhookStatusCard";

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
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);


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

        {/* Hero status card + per-event grid (typed, self-fetching component) */}
        <WebhookStatusCard className="mb-10" />

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
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
