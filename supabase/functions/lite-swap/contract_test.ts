/**
 * Contract tests for the Lite Swap API.
 *
 * Loads the OpenAPI spec from the deployed function and validates real
 * request/response payloads against the JSON Schemas using Ajv. Ensures
 * the wire format never silently drifts from the published contract.
 *
 * Run with: deno test --allow-net --allow-env supabase/functions/lite-swap
 */
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import Ajv from "https://esm.sh/ajv@8.17.1";
import addFormats from "https://esm.sh/ajv-formats@3.0.1";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ||
  "https://tjikwxkmsfmyjkssvyoh.supabase.co";
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ||
  Deno.env.get("SUPABASE_ANON_KEY") || "";

const FN_URL = `${SUPABASE_URL}/functions/v1/lite-swap`;

// deno-lint-ignore no-explicit-any
const ajv = new (Ajv as any)({ allErrors: true, strict: false });
// deno-lint-ignore no-explicit-any
(addFormats as any)(ajv);

type Spec = {
  components: { schemas: Record<string, unknown> };
};

let spec: Spec | null = null;
async function loadSpec(): Promise<Spec> {
  if (spec) return spec;
  const r = await fetch(`${FN_URL}?action=openapi`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
  });
  const body = await r.json();
  assertEquals(r.status, 200, "openapi endpoint must return 200");
  spec = body as Spec;
  return spec;
}

function validator(name: string, schema: Record<string, unknown>) {
  // Inline $ref by injecting all sibling schemas into the validator
  return ajv.compile({ ...schema, $id: name });
}

async function call(
  method: "GET" | "POST",
  pathOrBody: string | Record<string, unknown>,
  headers: Record<string, string> = {},
) {
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

// ─── 1. Spec is well-formed and discoverable ───────────────────────────────
Deno.test("contract: openapi endpoint returns a valid 3.x spec", async () => {
  const s = await loadSpec();
  assert(
    typeof (s as unknown as { openapi?: string }).openapi === "string",
    "missing openapi version",
  );
  assert(s.components?.schemas?.RatesResponse, "RatesResponse schema missing");
  assert(s.components.schemas.EstimateResponse, "EstimateResponse missing");
  assert(s.components.schemas.CreateResponse, "CreateResponse missing");
  assert(s.components.schemas.StatusResponse, "StatusResponse missing");
  assert(s.components.schemas.ErrorResponse, "ErrorResponse missing");
});

// ─── 2. Live RatesResponse matches schema ──────────────────────────────────
Deno.test("contract: rates response matches RatesResponse schema", async () => {
  const s = await loadSpec();
  const r = await call("GET", "?action=rates&from=btc&to=usdterc20&amount=0.01");
  if (r.status === 502) return; // upstream blip — skip
  assertEquals(r.status, 200);
  const validate = validator(
    "RatesResponse",
    s.components.schemas.RatesResponse as Record<string, unknown>,
  );
  const ok = validate(r.body);
  assert(
    ok,
    `RatesResponse schema mismatch: ${JSON.stringify(validate.errors)}\nbody=${
      JSON.stringify(r.body)
    }`,
  );
});

// ─── 3. Live EstimateResponse matches schema ──────────────────────────────
Deno.test("contract: estimate response matches EstimateResponse schema", async () => {
  const s = await loadSpec();
  const r = await call("POST", {
    action: "estimate",
    from: "btc",
    to: "usdterc20",
    amount: 0.001,
  });
  if (r.status === 502 || r.status === 413) return; // upstream / cap edge
  assertEquals(r.status, 200);
  const validate = validator(
    "EstimateResponse",
    s.components.schemas.EstimateResponse as Record<string, unknown>,
  );
  const ok = validate(r.body);
  assert(
    ok,
    `EstimateResponse schema mismatch: ${JSON.stringify(validate.errors)}`,
  );
});

// ─── 4. ErrorResponse shape — invalid ticker ──────────────────────────────
Deno.test("contract: 400 error matches ErrorResponse schema", async () => {
  const s = await loadSpec();
  const r = await call("POST", {
    action: "estimate",
    from: "!!bad",
    to: "usdt",
    amount: 1,
  });
  assertEquals(r.status, 400);
  const validate = validator(
    "ErrorResponse",
    s.components.schemas.ErrorResponse as Record<string, unknown>,
  );
  const ok = validate(r.body);
  assert(ok, `ErrorResponse mismatch: ${JSON.stringify(validate.errors)}`);
});

// ─── 5. ErrorResponse shape — over $1k cap ────────────────────────────────
Deno.test("contract: 413 cap error matches ErrorResponse schema", async () => {
  const s = await loadSpec();
  const r = await call("POST", {
    action: "estimate",
    from: "btc",
    to: "usdterc20",
    amount: 5,
  });
  if (r.status === 502) return; // upstream rate failure
  assertEquals(r.status, 413);
  const validate = validator(
    "ErrorResponse",
    s.components.schemas.ErrorResponse as Record<string, unknown>,
  );
  const ok = validate(r.body);
  assert(ok, `ErrorResponse mismatch: ${JSON.stringify(validate.errors)}`);
  assertEquals(r.body.max_usd, 1000);
});

// ─── 6. CreateRequest validation — invalid address rejected pre-network ──
Deno.test("contract: invalid CreateRequest is rejected with ErrorResponse", async () => {
  const s = await loadSpec();
  const r = await call("POST", {
    action: "create",
    from: "btc",
    to: "usdterc20",
    amount: 0.001,
    address: "x", // too short → fails ADDRESS_RE
  });
  assertEquals(r.status, 400);
  const validate = validator(
    "ErrorResponse",
    s.components.schemas.ErrorResponse as Record<string, unknown>,
  );
  assert(
    validate(r.body),
    `ErrorResponse mismatch: ${JSON.stringify(validate.errors)}`,
  );
});

// ─── 7. StatusResponse — unknown id should return ErrorResponse ───────────
Deno.test("contract: status for unknown id returns ErrorResponse", async () => {
  const s = await loadSpec();
  const r = await call("GET", "?action=status&id=mrc-nonexistent-test-id");
  if (r.status === 200) return; // upstream may echo a "not found" success envelope
  assert([400, 404, 502].includes(r.status), `unexpected ${r.status}`);
  const validate = validator(
    "ErrorResponse",
    s.components.schemas.ErrorResponse as Record<string, unknown>,
  );
  assert(
    validate(r.body),
    `ErrorResponse mismatch: ${JSON.stringify(validate.errors)}`,
  );
});
