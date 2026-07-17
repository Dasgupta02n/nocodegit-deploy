import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";

export default function FlippaDoc() {
  return (
    <MarketingShell
      heroImage="/images/cta-skyline.jpg"
      eyebrow="Acquisition"
      title="Sale / Flippa checklist"
      subtitle="What a serious buyer will ask for — and what you should prepare."
    >
      <ul className="list-disc space-y-3 pl-5 text-[var(--muted)]">
        <li>No AI API dependency for core product</li>
        <li>No multi-tenant user compute</li>
        <li>
          Document <code className="rounded bg-[var(--paper)] px-1">NOCODEGIT_SECRET</code>{" "}
          rotation + full <code className="rounded bg-[var(--paper)] px-1">.env</code>
        </li>
        <li>Transfer Resend + Razorpay + domain nocodegit.tech</li>
        <li>Backup SQLite + snapshots procedure</li>
        <li>SOPs: save, connect host, deploy, support macros</li>
        <li>Verified MRR, churn, Free vs Pro mix</li>
      </ul>
      <Link
        href="/docs"
        className="mt-8 inline-flex text-sm font-semibold text-violet-700 hover:underline"
      >
        ← All documentation
      </Link>
    </MarketingShell>
  );
}
