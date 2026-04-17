---
name: Liquidity Aggregator
description: Smart-routing across ChangeNOW (cn) + LetsExchange (le) with parallel quoting, highest-output winner, silent create-tx failover, and unified storage
type: feature
---

LiquidityAggregator unifies ChangeNOW and LetsExchange behind a provider-agnostic layer.

- **Quoting**: `getBestEstimate` runs both providers in parallel; picks the highest output. Switch toast fires on quote provider change.
- **Winner selection**: Strict highest-output (no commission stickiness). Tie → cn (partner attribution stability).
- **Failover**: Silent on `create-transaction` only. If winning provider fails, secondary attempted automatically.
- **Storage**: `swap_transactions.provider` (`'cn'|'le'`) + `swap_transactions.mrc_tx_id` (`MRC-XXXXXXXX` format).
- **Status polling**: `getStatusByProvider(id, provider)` routes to correct API; legacy txs default to `cn`.
- **Brand integrity**: 'ChangeNOW' / 'LetsExchange' never appear in UI. All customer-facing copy stays MRC Global Pay.
- **Files**: `src/lib/liquidity-aggregator.ts`, `src/lib/letsexchange.ts`, `supabase/functions/letsexchange/index.ts`.
- **Secret**: `LETSEXCHANGE_API_KEY` (Bearer auth on `https://api.letsexchange.io/api/v2`).
- **Out of scope**: PrivateTransferTab (Shielded) stays cn-only; fixed-address bridge stays cn-only.
