#!/usr/bin/env bash
# Run ON the VPS after SSH login to debug 502 / PM2 issues.
set -euo pipefail

APP_DIR="${1:-$HOME/htdocs/backend.shorexapp.cloud}"

echo "=== PM2 status ==="
pm2 list || true

echo ""
echo "=== PM2 logs (last 40 lines) ==="
pm2 logs shorex-backend --lines 40 --nostream 2>&1 || true

echo ""
echo "=== Local health (127.0.0.1:3000/welcome) ==="
curl -s -o /tmp/welcome-local.json -w "HTTP %{http_code}\n" http://127.0.0.1:3000/welcome || echo "curl failed — app not listening on 3000"
head -c 400 /tmp/welcome-local.json 2>/dev/null || true
echo ""

echo ""
echo "=== Node version ==="
node -v || true

echo ""
echo "=== Disk / app dir ==="
ls -la "$APP_DIR" | head -20

echo ""
echo "=== Recover command ==="
echo "cd $APP_DIR && pm2 start ecosystem.config.cjs --update-env && pm2 save"
echo "=== Persist without sudo (Hostinger) ==="
echo "(crontab -l 2>/dev/null | grep -v pm2-reboot.sh; echo '@reboot sleep 20 && bash $HOME/htdocs/backend.shorexapp.cloud/scripts/pm2-reboot.sh') | crontab -"
