#!/usr/bin/env bash
# Deploy NoCodeGit control plane to a Linux VPS / Hostinger VPS (SSH).
# Usage:
#   export DEPLOY_HOST=user@your-server
#   export DEPLOY_PATH=/var/www/nocodegit
#   export APP_URL=https://nocodegit.tech
#   bash scripts/hostinger-deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_HOST="${DEPLOY_HOST:-}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/nocodegit}"
APP_URL="${APP_URL:-}"

if [[ -z "$DEPLOY_HOST" ]]; then
  echo "Set DEPLOY_HOST=user@your-vps-ip"
  exit 1
fi

echo "==> Building locally"
cd "$ROOT"
npm ci
npm run build

echo "==> Creating remote dirs"
ssh "$DEPLOY_HOST" "mkdir -p '$DEPLOY_PATH' '$DEPLOY_PATH/data/snapshots'"

echo "==> Syncing app"
rsync -az --delete \
  --exclude node_modules \
  --exclude .git \
  --exclude data \
  --exclude tray/node_modules \
  --exclude tray/dist \
  --exclude .env.local \
  "$ROOT/" "$DEPLOY_HOST:$DEPLOY_PATH/"

echo "==> Installing production deps on server"
ssh "$DEPLOY_HOST" "cd '$DEPLOY_PATH' && npm ci --omit=dev"

if [[ -n "$APP_URL" ]]; then
  echo "==> Writing .env.local skeleton if missing"
  ssh "$DEPLOY_HOST" "test -f '$DEPLOY_PATH/.env.local' || cat > '$DEPLOY_PATH/.env.local' <<EOF
NOCODEGIT_SECRET=\$(openssl rand -hex 32)
NEXT_PUBLIC_APP_URL=$APP_URL
NOCODEGIT_DATA_DIR=$DEPLOY_PATH/data
NOCODEGIT_DATABASE_PATH=$DEPLOY_PATH/data/nocodegit.sqlite
NOCODEGIT_STORAGE_PATH=$DEPLOY_PATH/data/snapshots
NODE_ENV=production
# SENDGRID_API_KEY=
# EMAIL_FROM=NoCodeGit <noreply@nocodegit.tech>
# STRIPE_SECRET_KEY=
# STRIPE_PRICE_PRO=
# STRIPE_WEBHOOK_SECRET=
EOF"
fi

echo "==> Restart via pm2 if available"
ssh "$DEPLOY_HOST" "cd '$DEPLOY_PATH' && (command -v pm2 >/dev/null && pm2 startOrRestart ecosystem.config.cjs) || echo 'Run: cd $DEPLOY_PATH && npm start'"

echo "Done. Point nginx/Caddy HTTPS to port 3000."
