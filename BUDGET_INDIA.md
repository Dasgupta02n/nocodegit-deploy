# Domain & hosting budget (India) — NoCodeGit

## Domain: **nocodegit.tech**

Primary product domain. Check year-1 promo vs **renewal** for `.tech` (renewals can jump).

## Hosting NoCodeGit itself (control plane only)

Shared Node host or small VPS. SQLite + disk snapshots — no fleet for user apps.

| Item | Notes |
|------|--------|
| Domain | nocodegit.tech |
| Host | Hostinger / VPS with Node 20+ |
| DB | SQLite file — ₹0 (OSS, not SaaS free tier) |
| Email | Resend API |

## Env (production)

```
NOCODEGIT_SECRET=...
NEXT_PUBLIC_APP_URL=https://nocodegit.tech
RESEND_API_KEY=re_...
EMAIL_FROM=NoCodeGit <noreply@nocodegit.tech>
```
