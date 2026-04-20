---
name: Liquidity Aggregator
description: Coverage-router across ChangeNOW (cn) → SimpleSwap (ss) → StealthEX (se) → LetsExchange (le). CN is the primary provider; SS+ extend coverage.
type: feature
---

LiquidityAggregator unifies ChangeNOW, SimpleSwap, StealthEX, and LetsExchange behind a provider-agnostic layer.

- **Routing strategy**: Priority waterfall: **CN (primary) → SS (secondary, matched 0.5% commission) → SE (tertiary) → LE (quaternary)**. CN is always used when it returns a valid positive quote. SS is invoked when CN can't quote. SE/LE follow.
- **Quoting**: `getBestEstimate` tries CN → SS → SE → LE in order; `coverageFallback: true` flag marks SS/SE/LE-served quotes.
- **Failover**: Silent on `create-transaction`. If winning provider fails, the next in priority order is attempted automatically.
- **Storage**: `swap_transactions.provider` (`'cn'|'ss'|'se'|'le'`) + `swap_transactions.mrc_tx_id` (`MRC-XXXXXXXX` format).
- **Status polling**: `getStatusByProvider(id, provider)` routes to correct API; legacy txs default to `cn`.
- **SimpleSwap specifics**: v3 API; mandates separate `ticker` + `network` params; `/ranges` pre-flight before create; crypto-to-crypto only (no fiat key configured); `x-api-key` header auth.
- **Brand integrity**: Provider names never appear in UI. All customer-facing copy stays MRC Global Pay.
- **Files**: `src/lib/liquidity-aggregator.ts`, `src/lib/changenow.ts`, `src/lib/simpleswap.ts`, `src/lib/stealthex.ts`, `src/lib/letsexchange.ts`, edge functions of the same names.
- **Secrets**: `CHANGENOW_API_KEY`, `SIMPLESWAP_API_KEY`, `STEALTHEX_API_KEY`, `LETSEXCHANGE_API_KEY`.
- **Out of scope**: PrivateTransferTab (Shielded) stays cn-only; fixed-address bridge stays cn-only; SimpleSwap fiat is not used.
