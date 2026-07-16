import Link from "next/link";

export default function FlippaDoc() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 text-sm leading-relaxed">
      <Link href="/docs" className="text-violet-600">
        ← Docs
      </Link>
      <h1 className="mt-6 text-2xl font-bold">Sale / Flippa checklist</h1>
      <ul className="mt-6 list-disc space-y-2 pl-5 text-[var(--muted)]">
        <li>No AI API dependency for core product</li>
        <li>No multi-tenant user compute</li>
        <li>
          Document <code>NOCODEGIT_SECRET</code> rotation + full{" "}
          <code>.env</code>
        </li>
        <li>Transfer SendGrid + Stripe + domain nocodegit.tech</li>
        <li>Backup SQLite + snapshots procedure</li>
        <li>SOPs: save, connect host, deploy, support macros</li>
        <li>Verified MRR, churn, Free vs Pro mix</li>
      </ul>
    </div>
  );
}
