#!/usr/bin/env bash
# Deploy backend to Hostinger (excludes node_modules and .env)
# Usage: ./deploy-to-hostinger.sh
# Requires: rsync, ssh (SSH key recommended). For password auth, run rsync/ssh manually.

set -e

SSH_USER="shorexapp-backend"
SSH_HOST="72.61.81.212"
REMOTE_DIR="~/htdocs/backend.shorexapp.cloud/"
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Syncing backend to ${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}"
rsync -avz --delete \
  --filter 'protect .env' \
  --filter 'protect .env.postmark' \
  --exclude 'node_modules' \
  --exclude '.env' \
  --exclude '.env.postmark' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude '.DS_Store' \
  --exclude 'yarn-error.log' \
  --exclude 'npm-debug.log' \
  "${LOCAL_DIR}/" "${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}"

echo "==> Installing dependencies and restarting PM2 on server..."
ssh "${SSH_USER}@${SSH_HOST}" <<'ENDSSH'
set -e
cd ~/htdocs/backend.shorexapp.cloud/
if command -v yarn >/dev/null; then
  yarn install --frozen-lockfile
else
  npm install --legacy-peer-deps
fi
bash scripts/ensure-postmark-on-server.sh
if pm2 describe shorex-backend >/dev/null 2>&1; then
  pm2 restart shorex-backend --update-env
else
  echo "PM2 process not found. Starting with ecosystem.config.cjs"
  pm2 start ecosystem.config.cjs --update-env
fi
pm2 save
pm2 list
ENDSSH

echo "==> Deploy finished."
