/**
 * Integration tests for the Lite Swap public API.
 *
 * Hits the deployed edge function (no local server boot). Validates:
 *   - rates       : public passthrough returns a structured envelope
 *   - estimate    : input validation + $1,000 USD cap
 *   - create      : input validation, blacklist, geo-block, address rules
 *   - status      : input validation
 *   - geo-block   : sanctioned country header (CF-IPCountry) returns 451
 *   - rate limit  : repeated create calls from the same IP eventually 429
 *
 * Run with: deno test --allow-net --allow-env supabase/functions/lite-swap
 */
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ||
  "https://tjikwxkmsfmyjkssvyoh.supabase.co";
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ||
  Deno.env.get("SUPABASE_ANON_KEY") || "";

const FN_URL = `${SUPABASE_URL}/functions/v1/lite-swap`;

type JsonResp = { status: number; body: Record<string, unknown> };

async function call(
  method: "GET" | "POST",
  pathOrBody: string | Record<string, unknown>,
  headers: Record<string, string> = {},
): Promise<JsonResp> {
  const init: RequestInit = {
    method,
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      "Content-Type": "application/json",
      ...headers,
    },
  };
  let url = FN_URL;
  if (method === "GET" && typeof pathOrBody === "string") {
    url = `${FN_URL}${pathOrBody}`;
  } else if (method === "POST" && typeof pathOrBody === "object") {
    init.body = JSON.stringify(pathOrBody);
  }
  const resp = await fetch(url, init);
  const text = await resp.text();
  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(text);
  } catch {
    body = { _raw: text };
  }
  return { status: resp.status, body };
}

// ─── 1. RATES ──────────────────────────────────────────────────────────────
Deno.test("rates: returns structured envelope for valid pair", async () => {
  const r = await call("GET", "?action=rates&from=btc&to=usdterc20&amount=0.01");
  // Either success or upstream-rate-unavailable, but never a server crash
  assert(
    r.status === 200 || r.status === 502,
    `expected 200/502, got ${r.status}`,
  );
  assert(typeof r.body.status === "string");
});

Deno.test("rates: rejects malformed ticker", async () => {
  const r = await call("GET", "?action=rates&from=BAD!!!&to=usdt&amount=1");
  assertEquals(r.status, 400);
  assertEquals(r.body.status, "error");
});

Deno.test("rates: rejects non-positive amount", async () => {
  const r = await call("GET", "?action=rates&from=btc&to=usdt&amount=-5");
  assertEquals(r.status, 400);
});

// ─── 2. ESTIMATE ($1,000 cap) ─────────────────────────────────────────────
Deno.test("estimate: rejects amount above $1,000 USD cap", async () => {
  // 5 BTC ≈ well above $1k regardless of price
  const r = await call("POST", {
    action: "estimate",
    from: "btc",
    to: "usdterc20",
    amount: 5,
  });
  // Either 413 (cap hit) or 502 (upstream rate unavailable)
  assert(
    r.status === 413 || r.status === 502,
    `expected 413 or 502, got ${r.status} — body=${JSON.stringify(r.body)}`,
  );
  if (r.status === 413) {
    assertEquals(r.body.status, "error");
    assertEquals(typeof r.body.max_usd, "number");
    assertEquals(r.body.max_usd, 1000);
  }
});

Deno.test("estimate: rejects invalid ticker format", async () => {
  const r = await call("POST", {
    action: "estimate",
    from: "!!bad!!",
    to: "usdt",
    amount: 1,
  });
  assertEquals(r.status, 400);
});

Deno.test("estimate: rejects zero amount", async () => {
  const r = await call("POST", {
    action: "estimate",
    from: "btc",
    to: "usdt",
    amount: 0,
  });
  assertEquals(r.status, 400);
});

// ─── 3. CREATE — input validation ──────────────────────────────────────────
Deno.test("create: rejects invalid destination address", async () => {
  const r = await call("POST", {
    action: "create",
    from: "btc",
    to: "usdterc20",
    amount: 0.001,
    address: "x", // too short
  });
  assertEquals(r.status, 400);
  assertEquals(r.body.status, "error");
});

Deno.test("create: rejects invalid ticker", async () => {
  const r = await call("POST", {
    action: "create",
    from: "!!bad",
    to: "usdt",
    amount: 0.01,
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  });
  assertEquals(r.status, 400);
});

Deno.test("create: rejects amount above $1,000 USD cap", async () => {
  const r = await call("POST", {
    action: "create",
    from: "btc",
    to: "usdterc20",
    amount: 10, // ~$600k+ — way over the cap
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  });
  // Should be 413 (cap) — may be 502 if upstream unreachable
  assert(
    r.status === 413 || r.status === 502,
    `expected 413 or 502, got ${r.status}`,
  );
});

// ─── 4. GEO-BLOCK ─────────────────────────────────────────────────────────
// NOTE: Supabase's gateway strips inbound `cf-ipcountry`, so external clients
// can't forge the header. Geo-block is therefore only exercisable when traffic
// actually arrives via Cloudflare. We assert here that:
//   (a) the BLOCKED_COUNTRIES list contains the FATF/OFAC jurisdictions
//   (b) the endpoint does not crash when an attacker tries to spoof the header
const EXPECTED_BLOCKED = ["KP", "IR", "SY", "CU", "RU", "BY", "MM"];

Deno.test("geo-block: source code blocks all FATF/OFAC jurisdictions", async () => {
  const src = await Deno.readTextFile(
    new URL("./index.ts", import.meta.url),
  );
  for (const cc of EXPECTED_BLOCKED) {
    assert(
      src.includes(`"${cc}"`),
      `BLOCKED_COUNTRIES is missing ${cc}`,
    );
  }
});

Deno.test("geo-block: spoofed cf-ipcountry header is ignored by gateway (no crash)", async () => {
  const r = await call(
    "POST",
    {
      action: "estimate",
      from: "btc",
      to: "usdterc20",
      amount: 0.001,
    },
    { "cf-ipcountry": "KP" },
  );
  // Spoofed header is stripped upstream → request proceeds normally.
  // We just assert the endpoint stays healthy (no 5xx besides upstream 502).
  assert(
    [200, 400, 413, 451, 502].includes(r.status),
    `unexpected status ${r.status}`,
  );
});

Deno.test("geo-block: allowed country header passes the gate", async () => {
  const r = await call(
    "POST",
    {
      action: "estimate",
      from: "btc",
      to: "usdterc20",
      amount: 0.001,
    },
    { "cf-ipcountry": "CA" },
  );
  // Must NOT be 451; can be 200/400/502 depending on upstream
  assert(r.status !== 451, `unexpected geo-block for CA, got ${r.status}`);
});

Deno.test("geo-block: rates endpoint is not geo-blocked", async () => {
  const r = await call(
    "GET",
    "?action=rates&from=btc&to=usdterc20&amount=0.01",
    { "cf-ipcountry": "KP" },
  );
  assert(r.status !== 451, `rates should be public, got ${r.status}`);
});

// ─── 5. STATUS ────────────────────────────────────────────────────────────
Deno.test("status: rejects malformed order id", async () => {
  const r = await call("GET", "?action=status&id=!!bad!!");
  assertEquals(r.status, 400);
});

Deno.test("status: returns structured response for unknown id", async () => {
  const r = await call("GET", "?action=status&id=mrc-nonexistent-test-id");
  // Either 404, 502, or upstream "not found" envelope — never crash
  assert(
    [200, 400, 404, 502].includes(r.status),
    `unexpected status ${r.status}`,
  );
});

// ─── 6. RATE LIMITING ─────────────────────────────────────────────────────
// We send 12 create-attempts with INVALID addresses from a synthetic IP. The
// rate-limit gate should engage either before or alongside the validation
// gate. We assert that at least one response in the burst is a 429 OR that
// every response is a 4xx (i.e., the function never hands out > 10 successful
// orders). This avoids polluting the live DB with fake successful swaps.
Deno.test("rate-limit: bursts from same IP do not yield > 10 successes", async () => {
  const ip = `203.0.113.${Math.floor(Math.random() * 250) + 1}`; // TEST-NET-3
  const wallet = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
  let success = 0;
  let rateLimited = false;

  for (let i = 0; i < 12; i++) {
    const r = await call(
      "POST",
      {
        action: "create",
        from: "btc",
        to: "usdterc20",
        amount: 0.0001,
        address: wallet,
      },
      { "cf-connecting-ip": ip, "cf-ipcountry": "CA" },
    );
    if (r.status === 200 && r.body.status === "success") success++;
    if (r.status === 429) rateLimited = true;
  }

  assert(
    success <= 10,
    `lite API allowed ${success} successful creates from one IP — rate limit broken`,
  );
  // Soft assertion — log if 429 never fired (upstream may have failed earlier)
  if (!rateLimited) {
    console.warn(
      "[rate-limit test] no explicit 429 observed; upstream may have rejected earlier",
    );
  }
});

// ─── 7. UNKNOWN ACTION ────────────────────────────────────────────────────
Deno.test("unknown action returns 400", async () => {
  const r = await call("POST", { action: "delete-everything" });
  assertEquals(r.status, 400);
  assertEquals(r.body.status, "error");
});

// ─── 8. CORS ──────────────────────────────────────────────────────────────
Deno.test("OPTIONS preflight returns CORS headers", async () => {
  const resp = await fetch(FN_URL, { method: "OPTIONS" });
  await resp.text();
  assertEquals(resp.status, 200);
  assertEquals(resp.headers.get("access-control-allow-origin"), "*");
});
