# URL Pre-fill Helpers

The lowest-effort integration: build a single URL that opens the MRC GlobalPay swap widget pre-filled. Perfect for **Telegram bots, Discord slash commands, and one-click share links**.

## Format

```
https://mrcglobalpay.com/?from={ticker}&to={ticker}&amount={number}&address={wallet}
```

| Param | Type | Required | Notes |
|-------|------|----------|-------|
| `from` | string | optional | Source ticker (case-insensitive) |
| `to` | string | optional | Destination ticker (Solana auto-corrected) |
| `amount` | number | optional | Source-token amount |
| `address` | string | optional | Pre-fill recipient; field becomes read-only |

## Examples

```
https://mrcglobalpay.com/?from=SOL&to=NOS&amount=10
https://mrcglobalpay.com/?from=USDC&to=JUP
https://mrcglobalpay.com/?from=HNT&to=SOL&amount=5
https://mrcglobalpay.com/?from=BTC&to=USDT&amount=0.001&address=0x742d35cc...
```

## Helper scripts

- [`build-url.sh`](build-url.sh) — POSIX shell builder.
- [`build-url.mjs`](build-url.mjs) — Node helper exposing `buildSwapUrl({ from, to, amount, address })`.

50+ supported Solana tokens with contract addresses: <https://mrcglobalpay.com/developers#token-registry>.
