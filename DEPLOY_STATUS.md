# Hostinger setup status (API)

Last updated: 2026-07-16 — **config only, no app deploy yet**.

## Hosting (VPS) — configured via API

| Item | Value |
|------|--------|
| VPS ID | `1835400` |
| Plan | **KVM 1** |
| OS | **Ubuntu 22.04 LTS** |
| Datacenter | **Mumbai 2** |
| State | **running** |
| Hostname | **nocodegit.tech** |
| Public IPv4 | **187.127.156.152** |
| Public IPv6 | `2a02:4780:63:c199::1` |
| IPv4 PTR (reverse DNS) | **nocodegit.tech** |
| Firewall group | **`nocodegit-web`** (id `329998`) |
| Firewall rules | Accept **SSH 22**, **HTTP 80**, **HTTPS 443** from any |
| Root password | `.secrets-vps.env` (gitignored) |

No application code has been installed or deployed on this VPS.

## Domain — active + DNS set

| Item | Value |
|------|--------|
| Domain | `nocodegit.tech` |
| Portfolio status | **Active** |
| A `@` / `www` | **187.127.156.152** (VPS) |
| Nameservers | Hostinger DNS parking NS (zone managed in Hostinger) |
| WHOIS profile `.tech` | id `15110100` |

## Email (Resend) — configured via API

| Item | Value |
|------|--------|
| Provider | **Resend** (not SendGrid) |
| Domain in Resend | `nocodegit.tech` (id `c8657a20-dafe-4ab1-ada5-7302500ab0c9`) |
| Resend status | **verified** (DKIM + SPF) |
| DNS on Hostinger | DKIM `resend._domainkey` TXT · SPF `send` TXT · MX `send` |
| Site DNS | A `@` + A `www` → `187.127.156.152` |
| App env | `RESEND_API_KEY` + `EMAIL_FROM` in `.env.local` |
| Code | `lib/email.ts` uses Resend SDK |
| Test send | OK → `dasgupta.02n@gmail.com` |

## Deploy — paused until you say so

When ready:

1. Confirm Resend domain **verified**
2. Bootstrap VPS — `scripts/bootstrap-vps.sh` (copy `.env.local` / set Resend on server)
3. SSL with certbot

## Security notes

- Secrets: `Hostinger.env`, `.secrets-vps.env`, `.env.local` — gitignored
- Prefer SSH keys over password for day-to-day access
- Rotate Hostinger API token + Resend API key if they were ever pasted in chat
