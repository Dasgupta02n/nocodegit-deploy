import { MarketingShell } from "@/components/MarketingShell";

export default function PrivacyPage() {
  return (
    <MarketingShell
      heroImage="/images/feature-security.jpg"
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle="Template — have counsel review before public launch (DPDP/GDPR as applicable). Operator: nocodegit.tech"
    >
      <div className="space-y-4 text-sm leading-relaxed text-[var(--muted)]">
        <p>
          NoCodeGit (“we”) provides a control-plane service that stores project
          snapshots and orchestrates deploys to hosting accounts you connect.
        </p>
        <p>
          <strong className="text-[var(--ink)]">Data:</strong> email, password
          hash, project metadata, code snapshots, hosting credentials
          (encrypted), env values (encrypted), snippets, deploy logs, agent
          tokens, password-reset tokens, Razorpay customer/subscription ids when billing is
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
    </MarketingShell>
  );
}
