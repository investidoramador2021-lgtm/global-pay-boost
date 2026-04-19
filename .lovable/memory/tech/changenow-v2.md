---
name: ChangeNOW v2 Migration
description: Edge function uses v2 endpoints with x-changenow-api-key header auth and legacy→v2 ticker/network split mapping
type: feature
---
The `changenow` edge function (supabase/functions/changenow/index.ts) calls v2 API at https://api.changenow.io/v2.

Auth: header `x-changenow-api-key` using CHANGENOW_PRIVATE_KEY (preferred) with CHANGENOW_API_KEY fallback via `fetchWithKeyFallback`.

Endpoints used: /exchange/currencies, /exchange/min-amount, /exchange/estimated-amount, /exchange/by-standard-rate, /exchange/by-fixed-rate, /exchange/by-id, /exchanges.

Legacy MRC tickers like `usdterc20` are split via SUFFIX_TO_V2_NETWORK map:
- erc20 → eth, trc20 → trx, arc20 → avaxc, arb → arbitrum, mon → monad
- bsc/bep20 → bsc, matic/polygon → matic
- Others (sol, op, ton, celo, apt, base, etc.) map to themselves
Default fallback: ticker=ticker, network=ticker (e.g. btc→btc/btc).

Frontend continues to use legacy compound tickers (`usdterc20`); the edge function handles all v2 translation transparently.
