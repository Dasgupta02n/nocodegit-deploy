# NoCodeGit

**nocodegit.tech** · *Save. Ship. Still.*

Control plane for vibe-coded projects:

| Does | Does not |
|------|----------|
| Store version ZIPs | Host your live site |
| Deploy to **your** Netlify / Vercel hook / SFTP | Run customer containers |
| Encrypted API keys + optional env push | Call OpenAI for you |
| Pro ads/affiliate editor ($5/mo) | Free ads editor |

## Plans

| | Free | Pro ($5/mo) |
|--|------|-------------|
| Save size | **300 MB** | **Unlimited** |
| Deploy | Yes | Yes |
| Code that already has ads | Deploys fine | Deploys fine |
| Ads & affiliate **settings** | **No** | **Yes** |
| Env keys / host connect | Yes | Yes |

## Stack

- **Next.js 15** App Router  
- **SQLite** (`better-sqlite3`) — free OSS DB  
- bcrypt + JWT cookies · AES-256-GCM secrets  
- **SendGrid** transactional email  
- Stripe optional · Electron tray · ssh2 SFTP  

## Quick start

```bash
cp .env.example .env.local
# set NOCODEGIT_SECRET, NEXT_PUBLIC_APP_URL
# optional: SENDGRID_API_KEY, EMAIL_FROM

npm install
npm run dev
```

http://localhost:3000

## Environment

See **`.env.example`**. Primary names:

| Variable | Purpose |
|----------|---------|
| `NOCODEGIT_SECRET` | Session + encryption (required) |
| `NEXT_PUBLIC_APP_URL` | e.g. `https://nocodegit.tech` |
| `NOCODEGIT_DATA_DIR` | Data root |
| `NOCODEGIT_DATABASE_PATH` | SQLite path |
| `NOCODEGIT_STORAGE_PATH` | Snapshot ZIPs |
| `SENDGRID_API_KEY` | SendGrid API key |
| `EMAIL_FROM` | Verified sender |
| `STRIPE_SECRET_KEY` / `STRIPE_PRICE_PRO` / `STRIPE_WEBHOOK_SECRET` | Pro billing |

Legacy `QUAY_*` env vars still work as **fallbacks** if present.

## Production

```bash
npm run build
npm start
# pm2 start ecosystem.config.cjs
```

Back up `data/nocodegit.sqlite` and `data/snapshots`.

### SendGrid

1. API key at [SendGrid](https://app.sendgrid.com/settings/api_keys)  
2. Verify sender domain/email  
3. Set `SENDGRID_API_KEY` + `EMAIL_FROM=NoCodeGit <noreply@yourdomain>`  
4. Used for: **password reset**, **welcome** email  

Without SendGrid, messages are logged (dev).

### Stripe Pro $5

1. Create $5/month Price → `STRIPE_PRICE_PRO`  
2. Webhook → `POST /api/billing/webhook`  
3. UI → `/app/billing`

### Tray

```bash
npm run tray:install
npm run tray
```

Config: `%APPDATA%/nocodegit-tray/nocodegit-tray.json`  
Tokens: `ncg_...` · markers: `<!-- ncg:snippet:slug -->`

### Hostinger / VPS

```powershell
$env:DEPLOY_HOST = "user@your-vps"
$env:DEPLOY_PATH = "/var/www/nocodegit"
$env:APP_URL = "https://nocodegit.tech"
npm run deploy:hostinger:ps1
```

## Tests

```bash
npm test
```

## License

Proprietary unless you change it before sale.
