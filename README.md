# MRC GlobalPay | Regulated $0.30 Crypto Settlement Rail

> **Canadian MSB Registration: C100000015** — [Verify on FINTRAC Registry](https://fintrac-canafe.canada.ca/msb-esm/reg-eng)

MRC GlobalPay is a non-custodial, registration-free crypto exchange platform supporting 500+ tokens with settlement from **$0.30 USD** in under 60 seconds.

This repository contains the machine-readable infrastructure, bot-accessible manifests, and frontend source for the platform.

---

## 🔗 Key Resources

| Resource | URL |
|---|---|
| **Live Platform** | [mrcglobalpay.com](https://mrcglobalpay.com) |
| **Developer Hub** | [mrcglobalpay.com/developer](https://mrcglobalpay.com/developer) |
| **Bot Manifest (JSON)** | [mrcglobalpay.com/trading-bot-manifest.json](https://mrcglobalpay.com/trading-bot-manifest.json) |
| **Dynamic Sitemap** | [mrcglobalpay.com/sitemap.xml](https://mrcglobalpay.com/sitemap.xml) |
| **RSS Feed** | [mrcglobalpay.com/feed.xml](https://mrcglobalpay.com/feed.xml) |
| **Live Rates API** | [mrcglobalpay.com/api/v1/rates](https://mrcglobalpay.com/api/v1/rates) |
| **LLMs.txt** | [mrcglobalpay.com/llms.txt](https://mrcglobalpay.com/llms.txt) |

---

## 🤖 Bot & Programmatic Access

The platform exposes a machine-readable manifest for trading bots and automated systems:

```bash
curl https://mrcglobalpay.com/trading-bot-manifest.json
```

```javascript
fetch('https://mrcglobalpay.com/trading-bot-manifest.json')
  .then(res => res.json())
  .then(manifest => console.log(manifest));
```

### Manifest Schema

```json
{
  "platform": "MRC GlobalPay",
  "status": "Registered MSB",
  "msb_id": "C100000015",
  "min_swap_usd": 0.30,
  "supported_assets": 500,
  "settlement_time": "<60s",
  "top_pairs": ["BTC/USDT", "SOL/USDT", "ETH/SOL", "XRP/USDT", "PEPE/SOL"]
}
```

---

## 📡 API Endpoints

| Endpoint | Format | Description |
|---|---|---|
| `/api/v1/rates` | JSON | Live exchange rates for bot consumption |
| `/api/rates.json` | JSON | Alternative rates endpoint |
| `/export/rates.xml` | XML | Rates in XML format |
| `/feed.xml` | RSS 2.0 | Latest blog posts and ecosystem updates |
| `/sitemap.xml` | XML | Dynamic sitemap with hreflang for 13 languages |

---

## 🏛️ Regulatory Compliance

- **Registered Money Services Business (MSB)** under FINTRAC, Canada
- **Registration Number**: `C100000015`
- **Verification**: [FINTRAC MSB Registry](https://fintrac-canafe.canada.ca/msb-esm/reg-eng) → Search `C100000015`
- **Legal Entity**: MRC GlobalPay
- **Jurisdiction**: Ottawa, Ontario, Canada

---

## 🌐 Supported Languages

The platform is fully localized in 13 languages: English, Spanish, Portuguese, French, Japanese, Farsi, Urdu, Hebrew, Afrikaans, Hindi, Vietnamese, Turkish, and Ukrainian.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase Edge Functions (Deno)
- **Integrations**: ChangeNow, Guardarian, CoinGecko
- **SEO**: Dynamic XML sitemap, RSS feed, JSON-LD schemas, hreflang tags

---

## Local Development

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run dev
```

---

## 📄 License

Proprietary — © 2026 MRC GlobalPay. All rights reserved.
