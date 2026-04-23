# MRC GlobalPay — Public Lite API & Widget for Non-Custodial Crypto Swaps

[![FINTRAC MSB](https://img.shields.io/badge/FINTRAC-C100000015-00C853)](https://fintrac-canafe.canada.ca/msb-esm/reg-eng)
[![Min Swap](https://img.shields.io/badge/min%20swap-%240.30-00C853)](https://mrcglobalpay.com)
[![Non-Custodial](https://img.shields.io/badge/custody-non--custodial-00C853)](https://mrcglobalpay.com/developers#lite-api)
[![No API Key](https://img.shields.io/badge/auth-none%20required-00C853)](https://mrcglobalpay.com/developers#lite-api)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> Public, non-custodial **REST API + URL-prefill + embeddable widget** for crypto-to-crypto swaps. Built for **trading bots, arbitrage scripts, AI agents, and Telegram bots**. No registration, no API key, $0.30 minimum, FINTRAC-registered Canadian MSB.

🌐 **Live site:** https://mrcglobalpay.com  
📚 **API docs:** https://mrcglobalpay.com/developers#lite-api  
📘 **OpenAPI 3.1 spec:** https://mrcglobalpay.com/openapi.json · [Swagger UI](https://mrcglobalpay.com/openapi.html)  
🤖 **Bot manifest:** https://mrcglobalpay.com/trading-bot-manifest.json  
📡 **Webhook health:** https://mrcglobalpay.com/webhook-status.json

---

## Table of Contents

1. [Quick Start for Trading Bots](#-quick-start-for-trading-bots)
2. [Public Lite API](#-public-lite-api)
3. [Python Example](#-python-example)
4. [JavaScript / Node.js Example](#-javascript--nodejs-example)
5. [URL Pre-fill Method](#-url-pre-fill-method)
6. [Embed Widget](#-embed-widget)
7. [Rate Limits & Safety Rules](#-rate-limits--safety-rules)
8. [Bot Manifest](#-bot-manifest)
9. [Webhooks](#-webhooks)
10. [Examples Folder](#-examples-folder)
11. [Project Tech Stack](#-project-tech-stack)
12. [License](#-license)

---

## 🚀 Quick Start for Trading Bots

Three integration paths, ranked from zero-code to fully programmatic:

| # | Method | Best for | Effort |
|---|--------|----------|--------|
| 1 | **URL Pre-fill** | Telegram/Discord bots, share links | 0 lines |
| 2 | **Lite API** ⭐ | Arbitrage, AI agents, automated traders | ~10 lines |
| 3 | **Embed Widget** | Dashboards, partner sites | 1 iframe |

```bash
# Method 2 — Create a real non-custodial swap in one curl
BASE="https://tjikwxkmsfmyjkssvyoh.supabase.co/functions/v1/lite-swap"

curl -X POST "$BASE" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "from": "btc",
    "to": "sol",
    "amount": 0.001,
    "address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
  }'
```

You get back a deposit address, expected output, and an `order_id` you can poll or webhook on.  
**Funds never touch MRC wallets** — the same liquidity provider that powers the widget settles the trade.

---

## 📡 Public Lite API

> Designed for **honest small-amount bots** ($1,000/swap cap). For higher volume or commission tracking, [apply for the Partner API](mailto:contact@mrcglobalpay.com).

**Base URL**

```
https://tjikwxkmsfmyjkssvyoh.supabase.co/functions/v1/lite-swap
```

**Endpoints**

| Method | Action | Purpose |
|--------|--------|---------|
| `GET`  | `?action=rates&from=btc&to=sol&amount=1` | Live rate quote (unmetered) |
| `POST` | `{ action: "estimate", from, to, amount }` | Estimate output + USD value, validates $1k cap |
| `POST` | `{ action: "create", from, to, amount, address, webhook_url?, webhook_secret? }` | Create a real swap, returns deposit address |
| `GET`  | `?action=status&id=MRC-XXXX` | Poll order status |

**Successful `create` response**

```json
{
  "status": "success",
  "order_id": "MRC-A1B2C3D4XK9P",
  "provider_order_id": "a1b2c3d4e5f6g7h8",
  "deposit_address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "deposit_extra_id": null,
  "payout_address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  "from": "btc",
  "to": "sol",
  "from_amount": 0.001,
  "estimated_to_amount": 0.421,
  "estimated_usd": 65.40,
  "expires_at": "2026-04-23T20:30:00.000Z",
  "status_url": "https://.../functions/v1/lite-swap?action=status&id=MRC-A1B2C3D4XK9P",
  "custody": "non-custodial"
}
```

**Error codes**

| HTTP | When |
|------|------|
| `400` | Invalid ticker, address, or amount |
| `403` | Destination wallet on internal blacklist |
| `413` | Estimated USD value exceeds $1,000 cap |
| `429` | Hit IP / wallet / velocity limit (response includes `retry_after_seconds`) |
| `451` | Request from sanctioned jurisdiction |
| `502` | Upstream liquidity provider unavailable — retry |

📖 **Full reference:** https://mrcglobalpay.com/developers#lite-api  
📘 **Machine-readable contract (OpenAPI 3.1):** [`/openapi.json`](https://mrcglobalpay.com/openapi.json) — generate SDKs with `openapi-generator`, import into Postman/Insomnia, or browse interactively at [`/openapi.html`](https://mrcglobalpay.com/openapi.html).  
📮 **Postman collection:** [`/mrc-lite-api.postman_collection.json`](https://mrcglobalpay.com/mrc-lite-api.postman_collection.json) — auto-generated from the OpenAPI spec, drop-in importable.  
🛠 **Generate a typed SDK** (TS / Python / Go / Rust): see [Generate a Typed SDK](https://mrcglobalpay.com/developers#sdk-generation).

---

## 🐍 Python Example

```python
import requests, time

BASE = "https://tjikwxkmsfmyjkssvyoh.supabase.co/functions/v1/lite-swap"

# 1. Estimate the trade (validates $1,000 cap)
est = requests.post(BASE, json={
    "action": "estimate",
    "from":   "btc",
    "to":     "sol",
    "amount": 0.001,
}).json()
print(f"Estimated: {est['estimated_amount']} SOL  (~${est['estimated_usd']:.2f})")

# 2. Create the swap order (non-custodial)
order = requests.post(BASE, json={
    "action":  "create",
    "from":    "btc",
    "to":      "sol",
    "amount":  0.001,
    "address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
}).json()

if order["status"] != "success":
    raise SystemExit(order.get("error", "create failed"))

print(f"Send {order['from_amount']} {order['from'].upper()} to {order['deposit_address']}")
print(f"Order ID: {order['order_id']}")

# 3. Poll status with backoff
while True:
    s = requests.get(BASE, params={"action": "status", "id": order["order_id"]}).json()
    print("State:", s["state"])
    if s["state"] in ("finished", "failed", "refunded", "expired"):
        break
    time.sleep(15)
```

Full runnable version: [`examples/bot-python/swap_bot.py`](examples/bot-python/swap_bot.py).

---

## 🟨 JavaScript / Node.js Example

```javascript
const BASE = "https://tjikwxkmsfmyjkssvyoh.supabase.co/functions/v1/lite-swap";

async function call(body) {
  const r = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

// 1. Estimate
const est = await call({ action: "estimate", from: "usdterc20", to: "sol", amount: 50 });
console.log(`You'll receive ~${est.estimated_amount} SOL`);

// 2. Create the non-custodial order
const order = await call({
  action:  "create",
  from:    "usdterc20",
  to:      "sol",
  amount:  50,
  address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
});

if (order.status !== "success") throw new Error(order.error);

console.log(`Send ${order.from_amount} USDT (ERC-20) to ${order.deposit_address}`);
console.log("Order:", order.order_id);

// 3. Poll status
const s = await fetch(`${BASE}?action=status&id=${order.order_id}`).then((r) => r.json());
console.log("State:", s.state);
```

Full runnable version: [`examples/bot-js/swap-bot.mjs`](examples/bot-js/swap-bot.mjs).

---

## 🔗 URL Pre-fill Method

Build a single URL that opens the widget pre-filled. Perfect for Telegram/Discord bots and one-click share links.

```
https://mrcglobalpay.com/?from={ticker}&to={ticker}&amount={number}&address={wallet}
```

**Examples**

| URL | What it does |
|-----|--------------|
| `https://mrcglobalpay.com/?from=SOL&to=NOS&amount=10` | Swap 10 SOL → NOS (Nosana GPU) |
| `https://mrcglobalpay.com/?from=USDC&to=JUP` | Pre-fill USDC → JUP (auto min) |
| `https://mrcglobalpay.com/?from=HNT&to=SOL&amount=5` | DePIN payout → SOL |
| `https://mrcglobalpay.com/?from=BTC&to=USDT&amount=0.001&address=0x...` | Locked recipient address |

📖 50+ supported Solana tokens with contract addresses: https://mrcglobalpay.com/developers#token-registry

---

## 🖼 Embed Widget

```html
<iframe src="https://mrcglobalpay.com/embed/widget"
        width="100%" height="640"
        frameborder="0"
        allow="clipboard-write"></iframe>
```

Inherits all 50+ tokens, fiat on-ramp, and live 60-second rate locks. Backlink attribution required (auto-rendered in the widget footer).

---

## 🛡 Rate Limits & Safety Rules

| Rule | Limit |
|------|-------|
| **Max per swap** | $1,000 USD equivalent |
| **Per IP** | 10 swaps / hour |
| **Per destination wallet** | 10 swaps / hour |
| **Velocity check** | 30 swaps / wallet / 24h |
| **Concurrent `create`** | ≤ 2/sec per host (recommended) |
| **Quote calls (`rates`/`estimate`)** | Unmetered — cache 3-5s in memory |
| **Custody** | Non-custodial (provider passthrough) |
| **Sanctioned countries** | Blocked at the edge (HTTP 451) |
| **Auth** | None required |

**On `429`:** sleep for `retry_after_seconds` from the response (with ≥ 1s jitter). **On `400`:** never retry — fix the request.

Need higher limits? → [Apply for Partner API](mailto:contact@mrcglobalpay.com).

---

## 🤖 Bot Manifest

A static, machine-readable manifest of the **top 10 dust-swap pairs** with approximate rates and minimums — designed for AI agents and discovery crawlers:

```bash
curl https://mrcglobalpay.com/trading-bot-manifest.json
```

```json
{
  "name": "MRC Global Pay — Trading Bot Manifest",
  "version": "1.0.0",
  "provider": {
    "name": "MRC Global Pay",
    "msb": "C100000015",
    "jurisdiction": "Canada (FINTRAC)",
    "api": "https://mrcglobalpay.com/api/v1/rates"
  },
  "min_swap_usd": "0.30",
  "pairs": [
    { "from": "BTC", "to": "ETH",  "min_amount": "0.0000045 BTC", "approx_rate": "20.5"   },
    { "from": "ETH", "to": "USDT", "min_amount": "0.00015 ETH",   "approx_rate": "2550"   },
    { "from": "SOL", "to": "USDT", "min_amount": "0.002 SOL",     "approx_rate": "145"    }
  ]
}
```

---

## 📬 Webhooks

Pass `webhook_url` + `webhook_secret` at `create` time and we'll POST status updates to your endpoint.

| Event | Fires when |
|-------|------------|
| `swap.created` | Order created, deposit address issued |
| `swap.deposit_detected` | User's deposit detected on-chain |
| `swap.processing` | Exchanging or sending payout |
| `swap.finished` | Payout sent — payload includes `payout_hash` |
| `swap.expired` | No deposit received in time |
| `swap.failed` | Liquidity provider could not complete |
| `swap.refunded` | Funds returned to refund address |

Each delivery is signed with **HMAC-SHA256** (`X-MRC-Signature`, lowercase hex over the raw body) and de-duplicated via `X-MRC-Idempotency-Key`. Verify with constant-time comparison and respond `2xx` within **8 seconds**.

📊 **Live delivery health (public, CORS-enabled):** https://mrcglobalpay.com/webhook-status.json

---

## 📁 Examples Folder

| Path | Description |
|------|-------------|
| [`examples/bot-python/`](examples/bot-python) | End-to-end Python bot: estimate → create → poll status |
| [`examples/bot-js/`](examples/bot-js) | Node.js (ESM) equivalent with backoff polling |
| [`examples/url-prefill/`](examples/url-prefill) | URL builder helpers for Telegram / Discord bots |
| [`examples/webhook-receiver/`](examples/webhook-receiver) | Express + HMAC verification reference handler |

Each folder has its own `README.md` and is self-contained (zero project deps).

---

## 🛠 Project Tech Stack

This repo also contains the source for the live MRC GlobalPay site:

- **Framework:** React 18 + Vite 5 + TypeScript 5
- **Styling:** Tailwind CSS v3 + shadcn/ui (semantic HSL tokens)
- **Backend:** Lovable Cloud (Supabase under the hood) — Edge Functions for Lite API, webhooks, sync engine
- **i18n:** 13 languages via subdirectory routing (`/pt/`, `/es/`, …) + RTL support
- **SEO:** Zero-JS visibility, JSON-LD `@graph`, dynamic sitemaps, `llms.txt` for AI discovery

```bash
# Local dev
npm install
npm run dev          # http://localhost:8080
npm run build        # production bundle
npm run test         # vitest
```

---

## 📜 License

MIT — see [LICENSE](LICENSE).

The Lite API itself is operated by **MRC Pay International Corp.** (Ottawa, Canada · FINTRAC MSB **C100000015**). Use of the live API is subject to the [Terms of Service](https://mrcglobalpay.com/terms) and [AML Policy](https://mrcglobalpay.com/aml-policy).

---

<sub>⭐ If this saved you time wiring up a bot, a star on the repo helps other developers find it.</sub>
