---
name: Liquidity Aggregator
description: Coverage-router across ChangeNOW (cn) → StealthEX (se) → LetsExchange (le). CN is the primary provider; SE and LE extend coverage.
type: feature
---

LiquidityAggregator unifies ChangeNOW, StealthEX, and LetsExchange behind a provider-agnostic layer.

- **Routing strategy**: Priority waterfall: **CN (primary) → SE (secondary) → LE (tertiary)**. CN is always used when it returns a valid positive quote. SE is invoked when CN can't quote. LE is invoked only when both CN and SE fail. This protects primary-provider margins while guaranteeing at least one quote whenever any provider can serve the pair.
- **Quoting**: `getBestEstimate` tries CN → SE → LE in order; `coverageFallback: true` flag marks SE/LE-served quotes.
- **Failover**: Silent on `create-transaction`. If winning provider fails, the next in priority order is attempted automatically.
- **Storage**: `swap_transactions.provider` (`'cn'|'se'|'le'`) + `swap_transactions.mrc_tx_id` (`MRC-XXXXXXXX` format).
- **Status polling**: `getStatusByProvider(id, provider)` routes to correct API; legacy txs default to `cn`.
- **Brand integrity**: 'ChangeNOW' / 'StealthEX' / 'LetsExchange' never appear in UI. All customer-facing copy stays MRC Global Pay.
- **Files**: `src/lib/liquidity-aggregator.ts`, `src/lib/changenow.ts`, `src/lib/stealthex.ts`, `src/lib/letsexchange.ts`, edge functions of the same names.
- **Secrets**: `CHANGENOW_API_KEY`, `STEALTHEX_API_KEY`, `LETSEXCHANGE_API_KEY`.
- **Out of scope**: PrivateTransferTab (Shielded) stays cn-only; fixed-address bridge stays cn-only.
