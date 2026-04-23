#!/usr/bin/env bash
# Build a pre-filled MRC GlobalPay swap URL from CLI args.
# Usage: ./build-url.sh sol nos 10 [recipient_address]
set -euo pipefail

FROM="${1:-}"
TO="${2:-}"
AMOUNT="${3:-}"
ADDRESS="${4:-}"

URL="https://mrcglobalpay.com/?"
[ -n "$FROM" ]    && URL+="from=${FROM}&"
[ -n "$TO" ]      && URL+="to=${TO}&"
[ -n "$AMOUNT" ]  && URL+="amount=${AMOUNT}&"
[ -n "$ADDRESS" ] && URL+="address=${ADDRESS}&"

echo "${URL%[?&]}"
