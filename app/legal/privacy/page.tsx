import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 text-sm leading-relaxed">
      <Link href="/" className="text-violet-600">
        ← NoCodeGit
      </Link>
      <h1 className="mt-6 text-2xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-xs text-[var(--faint)]">
        Template — have counsel review before public launch (DPDP/GDPR as
        applicable). Operator: nocodegit.tech
      </p>
      <div className="mt-6 space-y-4 text-[var(--muted)]">
        <p>
          NoCodeGit (“we”) provides a control-plane service that stores project
          snapshots and orchestrates deploys to hosting accounts you connect.
        </p>
        <p>
          <strong className="text-[var(--ink)]">Data:</strong> email, password
          hash, project metadata, code snapshots, hosting credentials
          (encrypted), env values (encrypted), snippets, deploy logs, agent
          tokens, password-reset tokens, Stripe customer ids when billing is
          used.
        </p>
        <p>
          <strong className="text-[var(--ink)]">Purpose:</strong> provide the
          service, security, abuse prevention, billing.
        </p>
        <p>
          <strong className="text-[var(--ink)]">Hosting of your app:</strong> we
          do not serve your production website traffic; that stays on your
          provider.
        </p>
        <p>
          <strong className="text-[var(--ink)]">Rights:</strong> access,
          correction, deletion via the operator contact published on the site.
        </p>
      </div>
    </div>
  );
}
