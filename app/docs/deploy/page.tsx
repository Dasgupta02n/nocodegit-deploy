import Link from "next/link";

export default function DeployDoc() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 text-sm leading-relaxed">
      <Link href="/docs" className="text-violet-600">
        ← Docs
      </Link>
      <h1 className="mt-6 text-2xl font-bold">Self-hosting NoCodeGit</h1>
      <pre className="card mt-6 overflow-x-auto p-4 text-xs">
{`cp .env.example .env.local
# NOCODEGIT_SECRET
# NEXT_PUBLIC_APP_URL=https://nocodegit.tech
# SENDGRID_API_KEY=SG....
# EMAIL_FROM=NoCodeGit <noreply@nocodegit.tech>

npm install
npm run build
npm start
# or: pm2 start ecosystem.config.cjs`}
      </pre>
      <p className="mt-4 text-[var(--muted)]">
        SQLite on disk (free open-source). Snapshots under{" "}
        <code>data/snapshots</code>. HTTPS reverse proxy → port 3000.
      </p>
      <p className="mt-4 text-[var(--muted)]">
        Windows: <code>npm run deploy:hostinger:ps1</code> with DEPLOY_HOST /
        APP_URL.
      </p>
    </div>
  );
}
