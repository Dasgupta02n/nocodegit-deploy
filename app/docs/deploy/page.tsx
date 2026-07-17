import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";

export default function DeployDoc() {
  return (
    <MarketingShell
      heroImage="/images/feature-deploy.jpg"
      eyebrow="Self-hosting"
      title="Run NoCodeGit on your metal."
      subtitle="Node 20+, SQLite on disk, reverse proxy to port 3000."
    >
      <pre className="overflow-x-auto rounded-2xl bg-[var(--surface-dark)] p-5 text-xs leading-relaxed text-white/85">
{`cp .env.example .env.local
# NOCODEGIT_SECRET
# NEXT_PUBLIC_APP_URL=https://nocodegit.tech
# RESEND_API_KEY=re_...
# EMAIL_FROM=NoCodeGit <noreply@nocodegit.tech>

npm install
npm run build
npm start
# or: pm2 start ecosystem.config.cjs`}
      </pre>
      <p className="mt-5 text-[var(--muted)]">
        SQLite on disk (free open-source). Snapshots under{" "}
        <code className="rounded bg-[var(--paper)] px-1">data/snapshots</code>.
        HTTPS reverse proxy → port 3000.
      </p>
      <p className="mt-4 text-[var(--muted)]">
        Windows:{" "}
        <code className="rounded bg-[var(--paper)] px-1">
          npm run deploy:hostinger:ps1
        </code>{" "}
        with DEPLOY_HOST / APP_URL.
      </p>
      <Link
        href="/docs"
        className="mt-8 inline-flex text-sm font-semibold text-violet-700 hover:underline"
      >
        ← All documentation
      </Link>
    </MarketingShell>
  );
}
