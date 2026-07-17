# Finish NoCodeGit deploy to Hostinger VPS from your Windows PC
# Prerequisites: OpenSSH client, VPS running, root password in .secrets-vps.env
#
#   cd path\to\nocodegit
#   .\scripts\finish-deploy.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$secrets = Get-Content "$Root\.secrets-vps.env" -ErrorAction Stop
$ip = ($secrets | Where-Object { $_ -match '^VPS_IP=(.+)$' } | ForEach-Object { $matches[1] })
$pass = ($secrets | Where-Object { $_ -match '^VPS_ROOT_PASSWORD=(.+)$' } | ForEach-Object { $matches[1] })
if (-not $ip -or -not $pass) { throw "Missing VPS_IP or VPS_ROOT_PASSWORD in .secrets-vps.env" }

Write-Host "Target: root@$ip"

# Upload bootstrap script via scp using sshpass-like approach with plink if available
# Prefer: install Posh-SSH or use ssh with key
$bootstrap = Get-Content "$Root\scripts\bootstrap-vps.sh" -Raw
# Use OpenSSH with password via expect-like - Windows often needs key auth
# Generate temporary instructions if password auth required:

$key = "$env:USERPROFILE\.ssh\id_ed25519_nocodegit"
if (-not (Test-Path $key)) {
  Write-Host "Generating SSH key $key"
  ssh-keygen -t ed25519 -f $key -N '""' -C "nocodegit-deploy"
}

Write-Host @"

=== Manual steps (required once) ===
1) In Hostinger hPanel → VPS → Browser terminal (or SSH from your PC):
   ssh root@$ip
   (password is in .secrets-vps.env as VPS_ROOT_PASSWORD)

2) Paste and run:
   curl -fsSL https://raw.githubusercontent.com/Dasgupta02n/nocodegit/main/scripts/bootstrap-vps.sh -o /root/bootstrap-vps.sh
   # OR copy local bootstrap:
   # scp -i $key scripts/bootstrap-vps.sh root@${ip}:/root/
   bash /root/bootstrap-vps.sh

3) Domain DNS (hPanel → Domains → nocodegit.tech → DNS):
   Type A   Name @     Value $ip
   Type A   Name www   Value $ip

4) After DNS propagates (5–30 min):
   ssh root@$ip
   certbot --nginx -d nocodegit.tech -d www.nocodegit.tech

5) Open https://nocodegit.tech

API already set VPS to Ubuntu 22.04 + IP $ip.
Domain status was pending_setup — finish domain setup in hPanel if DNS editor is locked.
"@
