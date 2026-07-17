import { MarketingShell } from "@/components/MarketingShell";

export default function AcceptableUsePage() {
  return (
    <MarketingShell
      eyebrow="Legal"
      title="Acceptable Use Policy"
      subtitle="Template — legal review recommended. Site: nocodegit.tech. Applies to the NoCodeGit control plane, not your app host."
    >
      <div className="space-y-4 text-sm leading-relaxed text-[var(--muted)]">
        <p>
          This Acceptable Use Policy (“AUP”) governs use of NoCodeGit services.
          NoCodeGit is a control plane for versioning project snapshots and
          orchestrating deploys to infrastructure you own or control. We do not
          host your production website traffic.
        </p>
        <p>
          <strong className="text-[var(--ink)]">You may:</strong> store project
          snapshots you have rights to; connect hosting accounts you are
          authorized to use; configure environment variables, snippets, and
          deploy targets for legitimate applications.
        </p>
        <p>
          <strong className="text-[var(--ink)]">You may not:</strong>
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Upload malware, ransomware, exploit kits, or other harmful code
            intended to compromise systems or users.
          </li>
          <li>
            Store or deploy content that is illegal in applicable jurisdictions,
            including child sexual abuse material, facilitation of violent crime,
            or clear copyright infringement at scale.
          </li>
          <li>
            Attack, scan, or overload NoCodeGit infrastructure or other customers
            (including credential stuffing, scraping that harms service
            availability, or DDoS).
          </li>
          <li>
            Abuse agent tokens, share accounts in a way that defeats rate limits
            or billing, or attempt to bypass free-plan storage limits without
            authorization.
          </li>
          <li>
            Use NoCodeGit to transmit spam or phishing packages, or to conceal
            the true source of harmful campaigns.
          </li>
          <li>
            Probe for vulnerabilities outside of coordinated disclosure, or
            reverse-engineer the service solely to circumvent security.
          </li>
        </ul>
        <p>
          <strong className="text-[var(--ink)]">Your hosts, your content:</strong>{" "}
          You are solely responsible for applications and content that run on
          Netlify, Vercel, SFTP servers, or any other provider you connect.
          Provider AUPs and laws apply independently of NoCodeGit.
        </p>
        <p>
          <strong className="text-[var(--ink)]">Enforcement:</strong> We may
          suspend or terminate accounts, revoke tokens, delete abusive content,
          or report activity to authorities when we reasonably believe this AUP
          or the law has been violated. We may rate-limit or block abusive
          traffic without prior notice.
        </p>
        <p>
          <strong className="text-[var(--ink)]">Reporting:</strong> Report abuse
          via the operator contact published on nocodegit.tech.
        </p>
        <p className="text-xs text-[var(--faint)]">
          This is a template for product completeness, not legal advice.
        </p>
      </div>
    </MarketingShell>
  );
}
