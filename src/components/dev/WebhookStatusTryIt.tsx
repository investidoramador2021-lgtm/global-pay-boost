/**
 * WebhookStatusTryIt
 * ──────────────────
 * Interactive "Try it" widget for the Developers API page.
 * Fetches /webhook-status.json, validates the response with Zod, and
 * renders either the parsed fields (success) or a detailed list of
 * Zod validation issues (failure). Lets the user override the URL.
 */

import { useState } from "react";
import { z, ZodError } from "zod";
import { Loader2, Play, CheckCircle2, AlertTriangle, Copy, Check, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const WebhookEventSchema = z.enum([
  "swap.created",
  "swap.deposit_detected",
  "swap.finished",
  "swap.expired",
]);

const eventCountsShape = {
  "swap.created":          z.number().int().nonnegative(),
  "swap.deposit_detected": z.number().int().nonnegative(),
  "swap.finished":         z.number().int().nonnegative(),
  "swap.expired":          z.number().int().nonnegative(),
};

const WebhookStatusResponseSchema = z.object({
  status: z.literal("success"),
  generated_at: z.string().datetime(),
  window: z.object({
    hours_24: z.string().datetime(),
    days_7:   z.string().datetime(),
  }),
  last_successful_delivery_at: z.string().datetime().nullable(),
  counts_24h: z.object({
    ...eventCountsShape,
    total_with_webhook: z.number().int().nonnegative(),
    success_rate_percent: z.number().min(0).max(100).nullable(),
  }),
  counts_7d: z.object(eventCountsShape),
  provider: z.literal("MRC Global Pay Lite API"),
  documentation: z.string().url(),
});

type WebhookStatus = z.infer<typeof WebhookStatusResponseSchema>;

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; data: WebhookStatus; raw: string; ms: number }
  | { kind: "http_error"; status: number; body: string }
  | { kind: "shape_error"; issues: ZodError["issues"]; raw: unknown }
  | { kind: "network_error"; message: string };

const DEFAULT_URL = "https://mrcglobalpay.com/webhook-status.json";

// Avoid touching schema-internal types: derive issues from a runtime parse.
type Issue = ZodError["issues"][number];

export default function WebhookStatusTryIt() {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [state, setState] = useState<State>({ kind: "idle" });

  async function run() {
    setState({ kind: "loading" });
    const t0 = performance.now();
    let res: Response;
    try {
      res = await fetch(url, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
    } catch (e) {
      setState({
        kind: "network_error",
        message: e instanceof Error ? e.message : "network error",
      });
      return;
    }
    const text = await res.text();
    if (!res.ok) {
      setState({ kind: "http_error", status: res.status, body: text });
      return;
    }
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      setState({
        kind: "shape_error",
        issues: [
          {
            path: [],
            message: "response was not valid JSON",
            code: "custom",
          } as Issue,
        ],
        raw: text,
      });
      return;
    }
    const parsed = WebhookStatusResponseSchema.safeParse(json);
    if (!parsed.success) {
      setState({ kind: "shape_error", issues: parsed.error.issues, raw: json });
      return;
    }
    setState({
      kind: "ok",
      data: parsed.data,
      raw: text,
      ms: Math.round(performance.now() - t0),
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 mb-6">
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <div>
          <h4 className="text-base font-semibold text-foreground">
            Try it: validate <code className="font-mono text-sm">/webhook-status.json</code>
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fetches the live feed, parses with Zod, and shows the typed payload
            or a detailed list of schema violations.
          </p>
        </div>
        <Button onClick={run} disabled={state.kind === "loading"} size="sm">
          {state.kind === "loading" ? (
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-1.5" />
          )}
          Run request
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={DEFAULT_URL}
          className="font-mono text-xs"
          spellCheck={false}
        />
      </div>

      {state.kind === "idle" && (
        <p className="text-xs text-muted-foreground italic">
          Click <strong>Run request</strong> to fetch and validate the feed.
        </p>
      )}

      {state.kind === "loading" && (
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" /> Fetching…
        </p>
      )}

      {state.kind === "network_error" && (
        <CorsTroubleshooter url={url} message={state.message} />
      )}

      {state.kind === "http_error" && (
        <ErrorBanner
          title={`HTTP ${state.status}`}
          body={state.body.slice(0, 500)}
          hint="Server returned a non-2xx status."
        />
      )}

      {state.kind === "shape_error" && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3">
          <div className="flex items-center gap-2 text-destructive font-semibold text-sm mb-2">
            <AlertTriangle className="h-4 w-4" />
            Zod validation failed — {state.issues.length} issue
            {state.issues.length === 1 ? "" : "s"}
          </div>
          <ul className="space-y-1.5 text-xs">
            {state.issues.map((iss, i) => (
              <li
                key={i}
                className="font-mono bg-background/60 border border-border rounded px-2 py-1.5"
              >
                <span className="text-destructive">
                  {iss.path.length === 0 ? "<root>" : iss.path.join(".")}
                </span>
                <span className="text-muted-foreground"> · {iss.code}</span>
                <div className="text-foreground mt-0.5 font-sans">
                  {iss.message}
                </div>
              </li>
            ))}
          </ul>
          <details className="mt-3">
            <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
              Raw payload
            </summary>
            <pre className="text-[11px] font-mono bg-muted p-2 rounded mt-1 overflow-x-auto max-h-48">
              {JSON.stringify(state.raw, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {state.kind === "ok" && <SuccessView data={state.data} ms={state.ms} raw={state.raw} />}
    </div>
  );
}

function ErrorBanner({ title, body, hint }: { title: string; body: string; hint: string }) {
  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3">
      <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
        <AlertTriangle className="h-4 w-4" />
        {title}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{hint}</div>
      {body && (
        <pre className="text-[11px] font-mono bg-muted p-2 rounded mt-2 overflow-x-auto max-h-32">
          {body}
        </pre>
      )}
    </div>
  );
}

// ─── CORS Troubleshooter ──────────────────────────────────────────────
// Browsers surface CORS, DNS, mixed-content, and offline failures all as
// the same opaque "TypeError: Failed to fetch". We classify the message
// heuristically and show copy-paste headers + proxy guidance.

type FailureKind = "cors" | "mixed_content" | "dns" | "offline" | "unknown";

function classifyFailure(url: string, message: string): FailureKind {
  const m = message.toLowerCase();
  let parsed: URL | null = null;
  try { parsed = new URL(url); } catch { /* ignore */ }
  if (typeof navigator !== "undefined" && navigator.onLine === false) return "offline";
  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    parsed?.protocol === "http:"
  ) return "mixed_content";
  if (m.includes("failed to fetch") || m.includes("networkerror") || m.includes("cors")) return "cors";
  if (m.includes("name not resolved") || m.includes("dns")) return "dns";
  return "unknown";
}

const CORS_HEADERS_SNIPPET = `Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: content-type
Content-Type: application/json; charset=utf-8
Cache-Control: public, max-age=60`;

const DENO_EDGE_SNIPPET = `// Deno / Supabase edge function
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

if (req.method === "OPTIONS") {
  return new Response(null, { status: 204, headers: cors });
}

return new Response(JSON.stringify(payload), {
  status: 200,
  headers: { ...cors, "Content-Type": "application/json" },
});`;

const NODE_PROXY_SNIPPET = `// Node / Express proxy (server-side fetch bypasses CORS)
import express from "express";
app.get("/api/webhook-status", async (_req, res) => {
  const r = await fetch("https://mrcglobalpay.com/webhook-status.json");
  res.set("Cache-Control", "public, max-age=60");
  res.status(r.status).type("application/json").send(await r.text());
});`;

function CopyableSnippet({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded border border-border bg-background/60 mt-2">
      <div className="flex items-center justify-between px-2 py-1 border-b border-border">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          {label}
        </span>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch { /* ignore */ }
          }}
          className="text-[10px] flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="text-[11px] font-mono p-2 overflow-x-auto max-h-48 text-foreground">
        {code}
      </pre>
    </div>
  );
}

function CorsTroubleshooter({ url, message }: { url: string; message: string }) {
  const kind = classifyFailure(url, message);
  const origin = typeof window !== "undefined" ? window.location.origin : "your site";

  const titles: Record<FailureKind, string> = {
    cors: "Likely CORS or network error",
    mixed_content: "Mixed-content blocked",
    dns: "DNS resolution failed",
    offline: "You appear to be offline",
    unknown: "Network error",
  };

  const explanations: Record<FailureKind, string> = {
    cors: `The browser couldn't read the response from ${url}. This is almost always a missing CORS header on the target server, or the request was blocked before it left the browser. The raw error "${message}" is intentionally opaque per the Fetch spec.`,
    mixed_content: `Your page is served over HTTPS but the target URL is HTTP. Browsers block this. Use the https:// version of the endpoint.`,
    dns: `The hostname could not be resolved. Double-check the URL for typos.`,
    offline: `Your network is reporting offline. Reconnect and retry.`,
    unknown: `The browser refused or failed the request. The error "${message}" most often means CORS, but can also be DNS, TLS, or an ad-blocker.`,
  };

  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 space-y-3">
      <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
        <ShieldAlert className="h-4 w-4" />
        {titles[kind]}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {explanations[kind]}
      </p>

      {(kind === "cors" || kind === "unknown") && (
        <>
          <div>
            <div className="text-xs font-semibold text-foreground mb-1">
              1. Add these response headers on the server
            </div>
            <p className="text-[11px] text-muted-foreground">
              The endpoint must reply with <code className="font-mono">Access-Control-Allow-Origin</code> on
              both the <code className="font-mono">OPTIONS</code> preflight and the actual <code className="font-mono">GET</code>.
              For locked-down setups, replace <code className="font-mono">*</code> with{" "}
              <code className="font-mono">{origin}</code>.
            </p>
            <CopyableSnippet label="Response headers" code={CORS_HEADERS_SNIPPET} />
            <CopyableSnippet label="Edge function (Deno)" code={DENO_EDGE_SNIPPET} />
          </div>

          <div>
            <div className="text-xs font-semibold text-foreground mb-1">
              2. Or proxy the request server-side
            </div>
            <p className="text-[11px] text-muted-foreground">
              If you can't change the upstream server, fetch from your own backend
              and forward the JSON. Server-to-server requests have no CORS.
            </p>
            <CopyableSnippet label="Node / Express proxy" code={NODE_PROXY_SNIPPET} />
          </div>

          <div>
            <div className="text-xs font-semibold text-foreground mb-1">
              3. Verify the preflight from your terminal
            </div>
            <CopyableSnippet
              label="curl OPTIONS preflight"
              code={`curl -i -X OPTIONS '${url}' \\
  -H 'Origin: ${origin}' \\
  -H 'Access-Control-Request-Method: GET'`}
            />
          </div>
        </>
      )}

      {kind === "mixed_content" && (
        <CopyableSnippet
          label="Use HTTPS"
          code={url.replace(/^http:\/\//i, "https://")}
        />
      )}

      <details>
        <summary className="text-[11px] cursor-pointer text-muted-foreground hover:text-foreground">
          Raw browser error
        </summary>
        <pre className="text-[11px] font-mono bg-muted p-2 rounded mt-1 overflow-x-auto">
          {message}
        </pre>
      </details>
    </div>
  );
}

function SuccessView({ data, ms, raw }: { data: WebhookStatus; ms: number; raw: string }) {
  const c24 = data.counts_24h;
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <CheckCircle2 className="h-4 w-4" />
          Schema valid · parsed in {ms}ms
        </div>
        <div className="text-[11px] font-mono text-muted-foreground">
          generated_at: {data.generated_at}
        </div>
      </div>

      <dl className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-3">
        <Field label="success_rate_percent" value={c24.success_rate_percent ?? "null"} />
        <Field label="total_with_webhook" value={c24.total_with_webhook.toLocaleString()} />
        <Field label="last_delivery_at" value={data.last_successful_delivery_at ?? "—"} mono />
        <Field label="provider" value={data.provider} />
        {(WebhookEventSchema.options).map((evt) => (
          <Field
            key={evt}
            label={evt}
            value={`${c24[evt].toLocaleString()} (7d: ${data.counts_7d[evt].toLocaleString()})`}
            mono
          />
        ))}
      </dl>

      <details>
        <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
          Raw JSON ({(raw.length / 1024).toFixed(1)} KB)
        </summary>
        <pre className="text-[11px] font-mono bg-muted p-2 rounded mt-1 overflow-x-auto max-h-64">
          {raw}
        </pre>
      </details>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | number;
  mono?: boolean;
}) {
  return (
    <div className="rounded border border-border bg-background/60 px-2 py-1.5 min-w-0">
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
        {label}
      </dt>
      <dd
        className={`text-foreground truncate ${mono ? "font-mono text-[11px]" : "font-semibold"}`}
        title={String(value)}
      >
        {value}
      </dd>
    </div>
  );
}
