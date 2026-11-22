#!/usr/bin/env bash
# Run ON THE SERVER inside backend root.
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MARKER_FILE=".env.postmark"
ENV_FILE=".env"

has_postmark() {
  grep -qE '^POSTMARK_SERVER_API_TOKEN=.+' "$1" 2>/dev/null
}

if has_postmark "$ENV_FILE" || has_postmark "$MARKER_FILE"; then
  echo "[Postmark] OK - token present in .env or .env.postmark"
  exit 0
fi

echo "[Postmark] ERROR - no POSTMARK_SERVER_API_TOKEN in .env or .env.postmark"
echo "Create $ROOT/.env.postmark on the server with POSTMARK_SERVER_API_TOKEN=..."
exit 1
