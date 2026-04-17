---
name: Affiliate Commissions Auto-Credit
description: Hourly cron credits BTC commissions to partner_balances by joining swap_transactions.ref_code → partner_profiles.referral_code OR affiliate_leads.ref_token, with provider-aware rates
type: feature
---

Cron-driven attribution + payout ledger for affiliates.

- **Cron**: `credit-affiliate-commissions` runs at minute 5 every hour via pg_cron + pg_net.
- **Source**: scans last 30 days of `swap_transactions` (max 500/run) where `ref_code IS NOT NULL`.
- **Resolver**: matches `ref_code` against `partner_profiles.referral_code` OR `affiliate_leads.ref_token` (with non-null `partner_id`). Source labeled `referral_link` or `affiliate_widget`.
- **Rates** (provider-aware): `cn` (ChangeNOW) = 0.3%, `le` (LetsExchange) = 0.1%. Hard-coded in edge function constants `RATE_CN` / `RATE_LE`.
- **Pricing**: CoinGecko simple/price for `from_currency` USD value; stables auto-mapped to $1; BTC USD used as denominator. Job aborts gracefully if BTC price unavailable.
- **Idempotency**: `partner_commissions` has `UNIQUE(swap_transaction_id)`. 23505 violations are silently skipped — re-runs are safe.
- **Ledger table**: `partner_commissions` (partner_id, swap_transaction_id, ref_code, source, provider, from/to_currency, swap_amount, volume_usd, commission_rate, commission_btc, btc_usd_rate). Partners read their own; admins read all; service role writes.
- **Balance update**: increments `partner_balances.available_btc` and `total_earned_btc`; sets `last_credited_at`. Auto-creates a balance row if missing.
- **Dashboard**: Earnings tab merges `partner_transactions` (API) with `partner_commissions` (referral/widget) into one ledger; source pill colors `widget` blue, `referral` cyan, `api` muted.
- **Files**: `supabase/functions/credit-affiliate-commissions/index.ts`, schema in migration `2026-04-17`, dashboard merge in `src/pages/PartnerDashboard.tsx`.
