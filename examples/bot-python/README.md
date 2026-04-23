# Python Lite API Bot

End-to-end example: estimate → create a non-custodial swap → poll status until terminal state.

## Run

```bash
pip install requests
python swap_bot.py
```

Edit the constants at the top of `swap_bot.py` (`FROM`, `TO`, `AMOUNT`, `RECIPIENT`) for your pair.

## What it does

1. `POST { action: "estimate" }` — quotes the trade and validates the $1k cap.
2. `POST { action: "create" }` — creates the order, returns deposit address + `order_id`.
3. Loops `GET ?action=status&id=...` every 15s until `finished`, `failed`, `refunded`, or `expired`.

Funds **never touch MRC wallets** — the same liquidity provider that powers the widget settles the trade.
