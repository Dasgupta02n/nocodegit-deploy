import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 text-sm leading-relaxed">
      <Link href="/" className="text-violet-600">
        ← NoCodeGit
      </Link>
      <h1 className="mt-6 text-2xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-xs text-[var(--faint)]">
        Template — legal review required. Site: nocodegit.tech
      </p>
      <div className="mt-6 space-y-4 text-[var(--muted)]">
        <p>
          You retain ownership of your code. You grant NoCodeGit a limited
          license to store snapshots and transmit packages to providers you
          connect.
        </p>
        <p>
          NoCodeGit does not host or guarantee availability of your production
          application. Live uptime depends on your hosting provider.
        </p>
        <p>
          You are responsible for content you store and deploy, including ads,
          affiliates, and third-party API usage.
        </p>
        <p>
          Free plan limits (including 300 MB saves) and Pro features ($5/mo
          unlimited size and ads editor) are described on the site and may
          change with notice.
        </p>
        <p>
          Prohibited: malware, illegal content, abuse, attacking NoCodeGit
          infrastructure.
        </p>
        <p>Service provided “as is” to the extent permitted by law.</p>
      </div>
    </div>
  );
}
