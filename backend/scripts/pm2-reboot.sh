#!/usr/bin/env bash
# Hostinger site users cannot sudo `pm2 startup`. Cron @reboot instead.
export NVM_DIR="${HOME}/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
cd "${HOME}/htdocs/backend.shorexapp.cloud" || exit 1
pm2 resurrect || pm2 start ecosystem.config.cjs --update-env
pm2 save
