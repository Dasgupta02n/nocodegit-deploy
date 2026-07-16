# NoCodeGit VPS deploy helper for Windows
#   $env:DEPLOY_HOST = "user@1.2.3.4"
#   $env:DEPLOY_PATH = "/var/www/nocodegit"
#   $env:APP_URL = "https://nocodegit.tech"
#   .\scripts\hostinger-deploy.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

if (-not $env:DEPLOY_HOST) {
  Write-Error "Set DEPLOY_HOST=user@your-server"
}

$DeployPath = if ($env:DEPLOY_PATH) { $env:DEPLOY_PATH } else { "/var/www/nocodegit" }
$AppUrl = $env:APP_URL

Write-Host "==> npm ci + build"
npm.cmd ci
npm.cmd run build

Write-Host "==> Ensure remote dirs"
ssh $env:DEPLOY_HOST "mkdir -p $DeployPath/data/snapshots"

$Archive = Join-Path $env:TEMP "nocodegit-deploy.tgz"
if (Test-Path $Archive) { Remove-Item $Archive -Force }

Write-Host "==> Packing release"
tar -czf $Archive --exclude=node_modules --exclude=.git --exclude=data --exclude=tray/node_modules --exclude=tray/dist --exclude=.env.local -C $Root .

Write-Host "==> Upload"
scp $Archive "${env:DEPLOY_HOST}:/tmp/nocodegit-deploy.tgz"
ssh $env:DEPLOY_HOST "mkdir -p $DeployPath && tar -xzf /tmp/nocodegit-deploy.tgz -C $DeployPath && cd $DeployPath && npm ci --omit=dev"

if ($AppUrl) {
  $secretCmd = @"
if [ ! -f $DeployPath/.env.local ]; then
  cat > $DeployPath/.env.local <<'EOF'
NOCODEGIT_SECRET=REPLACE_WITH_openssl_rand_hex_32
NEXT_PUBLIC_APP_URL=$AppUrl
NOCODEGIT_DATA_DIR=$DeployPath/data
NOCODEGIT_DATABASE_PATH=$DeployPath/data/nocodegit.sqlite
NOCODEGIT_STORAGE_PATH=$DeployPath/data/snapshots
NODE_ENV=production
# SENDGRID_API_KEY=
# EMAIL_FROM=NoCodeGit <noreply@nocodegit.tech>
EOF
  echo 'Created .env.local — set NOCODEGIT_SECRET and SENDGRID_API_KEY on server'
fi
"@
  ssh $env:DEPLOY_HOST $secretCmd
}

Write-Host @"

Next on server:
  cd $DeployPath
  nano .env.local
  npm start
  # or: pm2 start ecosystem.config.cjs

Point domain / nginx to port 3000 with SSL.
"@
