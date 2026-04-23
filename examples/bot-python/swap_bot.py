"""
MRC GlobalPay Lite API — Python reference bot.

Estimate → Create → Poll a non-custodial swap. No API key required.

Docs: https://mrcglobalpay.com/developers#lite-api
"""

from __future__ import annotations

import sys
import time
from typing import Any

import requests

BASE = "https://tjikwxkmsfmyjkssvyoh.supabase.co/functions/v1/lite-swap"

# --- Edit these for your trade ----------------------------------------------
FROM = "btc"
TO = "sol"
AMOUNT = 0.001  # source-token amount
RECIPIENT = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"  # YOUR Solana wallet
POLL_SECONDS = 15
TERMINAL_STATES = {"finished", "failed", "refunded", "expired"}
# ---------------------------------------------------------------------------


def post(body: dict[str, Any]) -> dict[str, Any]:
    r = requests.post(BASE, json=body, timeout=30)
    return r.json()


def main() -> int:
    # 1. Estimate (validates $1,000 cap)
    est = post({"action": "estimate", "from": FROM, "to": TO, "amount": AMOUNT})
    if est.get("status") != "success":
        print("estimate failed:", est)
        return 1
    print(f"Estimated: {est['estimated_amount']} {TO.upper()} (~${est['estimated_usd']:.2f})")

    # 2. Create non-custodial order
    order = post({
        "action": "create",
        "from": FROM,
        "to": TO,
        "amount": AMOUNT,
        "address": RECIPIENT,
    })
    if order.get("status") != "success":
        print("create failed:", order)
        return 1

    print(f"\nSend {order['from_amount']} {order['from'].upper()} to {order['deposit_address']}")
    print(f"Order ID:   {order['order_id']}")
    print(f"Expires at: {order['expires_at']}\n")

    # 3. Poll status until terminal
    while True:
        s = requests.get(
            BASE, params={"action": "status", "id": order["order_id"]}, timeout=30
        ).json()
        state = s.get("state", "unknown")
        print(f"  state = {state}")
        if state in TERMINAL_STATES:
            print("\nFinal payload:", s)
            return 0
        time.sleep(POLL_SECONDS)


if __name__ == "__main__":
    sys.exit(main())
