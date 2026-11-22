#!/usr/bin/env bash
# Live server smoke test. Usage: ./scripts/test-live-server.sh [base_url]
set -euo pipefail

BASE="${1:-https://backend.shorexapp.cloud}"
EMAIL="${TEST_EMAIL:-arbutt1111@gmail.com}"
TYPE="${TEST_TYPE:-DRIVER}"

echo "=== Health: $BASE/welcome ==="
curl -s "$BASE/welcome" | head -c 500
echo -e "\n"

echo "=== forgetPassword ($TYPE) ==="
curl -s -w "\nHTTP %{http_code}\n" -X POST "$BASE/forgetPassword" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"type\":\"$TYPE\"}"
echo ""

echo "=== signin ($TYPE) — set TEST_PASSWORD env to test login ==="
if [ -n "${TEST_PASSWORD:-}" ]; then
  curl -s -w "\nHTTP %{http_code}\n" -X POST "$BASE/signin" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$TEST_PASSWORD\",\"type\":\"$TYPE\"}" | head -c 300
  echo "..."
fi
