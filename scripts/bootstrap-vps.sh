#!/usr/bin/env bash
# Bootstrap NoCodeGit on Hostinger KVM1 Ubuntu
# Run ON the VPS as root after SSH works:
#   curl -fsSL ... | bash
# Or:
#   scp scripts/bootstrap-vps.sh root@IP:/root/
#   ssh root@IP 'bash /root/bootstrap-vps.sh'
set -euo pipefail

APP_DIR=/var/www/nocodegit
APP_URL="${APP_URL:-https://nocodegit.tech}"
REPO="${REPO:-https://github.com/Dasgupta02n/nocodegit.git}"
NODE_MAJOR=20

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git build-essential ufw nginx certbot python3-certbot-nginx

# Node 20
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | bash -
  apt-get install -y nodejs
fi

# Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable || true

# App
mkdir -p /var/www
if [[ -d "$APP_DIR/.git" ]]; then
  cd "$APP_DIR" && git pull --ff-only
else
  git clone "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"

mkdir -p data/snapshots
if [[ ! -f .env.local ]]; then
  SECRET=$(openssl rand -hex 32)
  cat > .env.local <<EOF
NOCODEGIT_SECRET=$SECRET
NEXT_PUBLIC_APP_URL=$APP_URL
NOCODEGIT_DATA_DIR=$APP_DIR/data
NOCODEGIT_DATABASE_PATH=$APP_DIR/data/nocodegit.sqlite
NOCODEGIT_STORAGE_PATH=$APP_DIR/data/snapshots
NODE_ENV=production
# RESEND_API_KEY=
# EMAIL_FROM=NoCodeGit <noreply@nocodegit.tech>
# STRIPE_SECRET_KEY=
# STRIPE_PRICE_PRO=
# STRIPE_WEBHOOK_SECRET=
EOF
  echo "Created .env.local with new NOCODEGIT_SECRET"
fi

npm ci
npm run build
npm i -g pm2
pm2 delete nocodegit 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root | tail -n 1 | bash || true

# Nginx reverse proxy
cat > /etc/nginx/sites-available/nocodegit <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name nocodegit.tech www.nocodegit.tech;

    client_max_body_size 512M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/nocodegit /etc/nginx/sites-enabled/nocodegit
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# SSL if DNS already points here
if host nocodegit.tech | grep -q "$(curl -s ifconfig.me || true)"; then
  certbot --nginx -d nocodegit.tech -d www.nocodegit.tech --non-interactive --agree-tos -m admin@nocodegit.tech --redirect || true
else
  echo "DNS not pointing here yet — after A records propagate, run:"
  echo "  certbot --nginx -d nocodegit.tech -d www.nocodegit.tech"
fi

echo "=== NoCodeGit bootstrap complete ==="
echo "App: pm2 status"
echo "HTTP: http://$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
echo "Domain: $APP_URL (after DNS)"
