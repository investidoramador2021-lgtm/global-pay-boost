// MRC GlobalPay Lite API — webhook receiver reference.
// Verifies X-MRC-Signature (HMAC-SHA256, hex, raw body) and de-duplicates
// by X-MRC-Idempotency-Key. Always responds 2xx within 8 seconds.
//
// Run: MRC_WEBHOOK_SECRET=... node server.mjs

import crypto from "node:crypto";
import express from "express";

const app = express();
const SECRET = process.env.MRC_WEBHOOK_SECRET;
if (!SECRET) {
  console.error("Set MRC_WEBHOOK_SECRET to the same value passed at create-time.");
  process.exit(1);
}

// Replace with Redis SET / Postgres INSERT ... ON CONFLICT in production.
const seen = new Set();

app.post(
  "/mrc-webhook",
  express.raw({ type: "application/json", limit: "256kb" }),
  (req, res) => {
    const sig = req.header("X-MRC-Signature") ?? "";
    const idem = req.header("X-MRC-Idempotency-Key") ?? "";
    const expected = crypto.createHmac("sha256", SECRET).update(req.body).digest("hex");

    // Length-equal first to avoid timingSafeEqual throwing on mismatched sizes.
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(401).send("bad signature");
    }

    if (idem && seen.has(idem)) {
      return res.status(200).send("duplicate-ignored");
    }
    if (idem) seen.add(idem);

    const evt = JSON.parse(req.body.toString("utf8"));
    console.log(
      `[${new Date().toISOString()}] ${evt.event} ${evt.data?.order_id} → ${evt.data?.state}`,
    );

    res.status(200).send("ok");
  },
);

app.listen(3000, () => {
  console.log("MRC webhook receiver listening on http://localhost:3000/mrc-webhook");
});
