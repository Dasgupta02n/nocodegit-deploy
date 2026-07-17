import { MarketingShell } from "@/components/MarketingShell";

export default function DpaPage() {
  return (
    <MarketingShell
      eyebrow="Legal"
      title="Data Processing Addendum"
      subtitle="Template — have counsel review before public launch. Operator: nocodegit.tech. NoCodeGit is a control plane only."
    >
      <div className="space-y-4 text-sm leading-relaxed text-[var(--muted)]">
        <p>
          This Data Processing Addendum (“DPA”) supplements the Terms of Service
          between you (“Controller” or “Customer”) and NoCodeGit (“Processor”)
          when NoCodeGit processes personal data on your behalf in connection
          with the service.
        </p>
        <p>
          <strong className="text-[var(--ink)]">Nature of the service:</strong>{" "}
          NoCodeGit provides a control plane that stores project snapshots,
          metadata, encrypted credentials, deploy orchestration logs, and
          account data. NoCodeGit does{" "}
          <strong className="text-[var(--ink)]">not</strong> host or serve your
          production application traffic. Live apps run on hosting providers you
          connect (for example Netlify, Vercel, or SFTP targets).
        </p>
        <p>
          <strong className="text-[var(--ink)]">Categories of data:</strong>{" "}
          account email and name; authentication secrets (password hashes,
          agent tokens); project metadata; code snapshots and related labels;
          encrypted hosting credentials and environment values; snippets;
          deploy prepare/upload logs; billing identifiers when Razorpay is used.
        </p>
        <p>
          <strong className="text-[var(--ink)]">Purpose of processing:</strong>{" "}
          provide, secure, and improve the control-plane service; prevent abuse;
          process billing where applicable; and transmit deploy packages to
          providers you authorize.
        </p>
        <p>
          <strong className="text-[var(--ink)]">Customer instructions:</strong>{" "}
          Processor processes personal data only on documented instructions from
          Customer, including configuration in the product UI and API, unless
          required by law.
        </p>
        <p>
          <strong className="text-[var(--ink)]">Security:</strong> Processor
          implements reasonable technical and organizational measures appropriate
          to the risk (access controls, encrypted storage of secrets, session
          cookies, rate limiting). Details are described in product security
          documentation.
        </p>
        <p>
          <strong className="text-[var(--ink)]">Subprocessors:</strong> Customer
          authorizes subprocessors reasonably required to operate the service
          (for example infrastructure host, email delivery, payment processor).
          A current list should be maintained by the operator.
        </p>
        <p>
          <strong className="text-[var(--ink)]">International transfers:</strong>{" "}
          Where data is transferred across borders, parties will use appropriate
          safeguards as required by applicable law (for example SCCs, DPDP rules
          as applicable).
        </p>
        <p>
          <strong className="text-[var(--ink)]">Assistance &amp; rights:</strong>{" "}
          Processor will reasonably assist Customer with data subject requests,
          security incidents, and DPIAs to the extent related to the service.
        </p>
        <p>
          <strong className="text-[var(--ink)]">Deletion &amp; return:</strong>{" "}
          Upon termination, Customer may export or delete project data via the
          product or operator contact, subject to legal retention requirements.
        </p>
        <p>
          <strong className="text-[var(--ink)]">Liability:</strong> Liability
          allocation remains as set out in the Terms of Service, except where
          mandatory data-protection law requires otherwise.
        </p>
        <p className="text-xs text-[var(--faint)]">
          This is a template for product completeness, not legal advice.
        </p>
      </div>
    </MarketingShell>
  );
}
