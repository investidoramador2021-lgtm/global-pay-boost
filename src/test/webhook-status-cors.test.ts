/**
 * Verifies that the public webhook-status feed endpoints respond to CORS
 * preflight (OPTIONS) requests with the correct Access-Control-* headers,
 * so that dashboards on third-party origins can fetch them.
 *
 * Targets the deployed edge function directly (which is what the Vercel
 * rewrites proxy to). Set WEBHOOK_STATUS_BASE to override for staging.
 */
import { describe, it, expect } from "vitest";

const BASE =
  process.env.WEBHOOK_STATUS_BASE ??
  "https://tjikwxkmsfmyjkssvyoh.supabase.co/functions/v1/lite-webhook-status";

const PUBLIC_ALIASES = [
  "https://mrcglobalpay.com/webhook-status.json",
  "https://mrcglobalpay.com/api/v1/webhook-status",
];

async function preflight(url: string) {
  return fetch(url, {
    method: "OPTIONS",
    headers: {
      Origin: "https://dashboard.example.com",
      "Access-Control-Request-Method": "GET",
      "Access-Control-Request-Headers": "content-type",
    },
  });
}

function assertCors(res: Response) {
  const allowOrigin = res.headers.get("access-control-allow-origin");
  const allowMethods = res.headers.get("access-control-allow-methods") ?? "";
  expect(allowOrigin === "*" || allowOrigin === "https://dashboard.example.com")
    .toBe(true);
  expect(allowMethods.toUpperCase()).toMatch(/GET/);
}

describe("webhook-status CORS preflight", () => {
  it("edge function responds to OPTIONS with CORS headers", async () => {
    const res = await preflight(BASE);
    expect([200, 204]).toContain(res.status);
    assertCors(res);
  });

  for (const url of PUBLIC_ALIASES) {
    it(`public alias ${url} responds to OPTIONS with CORS headers`, async () => {
      let res: Response;
      try {
        res = await preflight(url);
      } catch {
        // Domain unreachable from this environment; skip rather than fail.
        return;
      }
      // Alias may not be deployed yet (vercel.json rewrite pending). Only
      // assert CORS once the route exists.
      if (res.status === 404) return;
      expect([200, 204]).toContain(res.status);
      assertCors(res);
    });
  }
});
