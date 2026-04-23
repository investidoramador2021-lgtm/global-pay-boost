# Webhook Receiver — HMAC Verification Reference

Minimal Express server that verifies the `X-MRC-Signature` header on incoming Lite API webhooks.

## Run

```bash
npm install express
MRC_WEBHOOK_SECRET="s3cret_at_least_32_chars_long_xxxx" node server.mjs
```

The server listens on `http://localhost:3000/mrc-webhook`. Pass that URL (publicly reachable, e.g. via ngrok) plus the same secret as `webhook_url` / `webhook_secret` when you call `action: "create"`.

## What it demonstrates

- **Raw-body capture** — `express.raw()` so the bytes are byte-identical to what was signed.
- **Constant-time HMAC compare** — `crypto.timingSafeEqual` to defeat timing attacks.
- **Idempotency** — in-memory `Set` keyed on `X-MRC-Idempotency-Key`. Replace with Redis/Postgres in production.
- **Fast 2xx ack** — under the 8-second handler budget.

Live delivery health (public): <https://mrcglobalpay.com/webhook-status.json>.
