---
name: Liquidity Aggregator
description: Coverage-router across ChangeNOW (cn) + LetsExchange (le) — CN always wins when it can quote; LE used only to extend token coverage when CN can't
type: feature
---

LiquidityAggregator unifies ChangeNOW and LetsExchange behind a provider-agnostic layer.

- **Routing strategy**: ChangeNOW-FIRST (margin-priority). CN is always used when it returns a valid positive quote, even if LE would offer more. LE is invoked ONLY as a coverage extender when CN errors or returns 0/null (unsupported pair). This protects primary-provider profits while expanding the supported-token surface.
- **Quoting**: `getBestEstimate` tries CN first; falls through to LE only if CN can't quote. `coverageFallback: true` flag marks LE-served quotes.
- **Failover**: Silent on `create-transaction` only. If winning provider fails, secondary attempted automatically.
- **Storage**: `swap_transactions.provider` (`'cn'|'le'`) + `swap_transactions.mrc_tx_id` (`MRC-XXXXXXXX` format).
- **Status polling**: `getStatusByProvider(id, provider)` routes to correct API; legacy txs default to `cn`.
- **Brand integrity**: 'ChangeNOW' / 'LetsExchange' never appear in UI. All customer-facing copy stays MRC Global Pay.
- **Files**: `src/lib/liquidity-aggregator.ts`, `src/lib/letsexchange.ts`, `supabase/functions/letsexchange/index.ts`.
- **Secret**: `LETSEXCHANGE_API_KEY` (Bearer auth on `https://api.letsexchange.io/api/v2`).
- **Out of scope**: PrivateTransferTab (Shielded) stays cn-only; fixed-address bridge stays cn-only.
