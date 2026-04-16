---
name: Sync Engine
description: Adaptive sync engine that auto-generates pairs table with 13-language SEO templates, hourly cron, batch limits, and rate-limit handling
type: feature
---
## Sync Engine

- Edge function `sync-engine` runs on 1-hour cron (`sync-engine-hourly`)
- **Growth phase** (<50k pairs): syncs every run, 100 pairs/batch
- **Maintenance phase** (≥50k pairs): only runs every 48 hours
- Fetches active tickers from ChangeNow API, generates all valid from→to combinations
- 20 title templates × 10 description templates × 13 languages = rotated SEO content per pair
- `pairs` table: `from_ticker`, `to_ticker`, `partner_fee_percent` (0.4%), `seo_template_id`, `content_json` (13-lang JSONB)
- `sync_engine_state` table: singleton health row with `last_run_at`, `pairs_count`, `status`, `last_error`
- Rate limit: 429 from ChangeNow → logs error, stops batch immediately
- DynamicExchange page can consume `pairs.content_json` for pre-rendered SEO metadata
