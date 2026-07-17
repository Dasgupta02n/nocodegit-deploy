import { MarketingShell } from "@/components/MarketingShell";

export default function TermsPage() {
  return (
    <MarketingShell
      heroImage="/images/hero-studio.jpg"
      eyebrow="Legal"
      title="Terms of Service"
      subtitle="Template — legal review required. Site: nocodegit.tech"
    >
      <div className="space-y-4 text-sm leading-relaxed text-[var(--muted)]">
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
    </MarketingShell>
  );
}
