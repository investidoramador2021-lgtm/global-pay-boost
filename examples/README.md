# MRC GlobalPay — Lite API Examples

Self-contained, zero-dependency reference integrations for the [Public Lite API](https://mrcglobalpay.com/developers#lite-api).

| Folder | Stack | What it does |
|--------|-------|--------------|
| [`bot-python/`](bot-python) | Python 3.9+ + `requests` | Estimate → Create → Poll a real swap |
| [`bot-js/`](bot-js) | Node 18+ (native `fetch`) | Same flow, ESM, with backoff polling |
| [`url-prefill/`](url-prefill) | Pure JS / Bash | Build pre-filled widget URLs for Telegram/Discord bots |
| [`webhook-receiver/`](webhook-receiver) | Node.js + Express | HMAC-SHA256 signature verification reference |

Every example targets the **public** Lite API endpoint:

```
https://tjikwxkmsfmyjkssvyoh.supabase.co/functions/v1/lite-swap
```

No API key, no registration, $1,000/swap cap. See the root [README](../README.md#-rate-limits--safety-rules) for full rate-limit rules.
