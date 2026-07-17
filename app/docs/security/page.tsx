import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";

export default function SecurityDoc() {
  return (
    <MarketingShell
      heroImage="/images/feature-security.jpg"
      eyebrow="Security"
      title="Built for quiet confidence."
      subtitle="Encryption, rate limits, and a hard line: we never execute your app."
    >
      <ul className="list-disc space-y-3 pl-5 text-[var(--muted)]">
        <li>
          <strong className="text-[var(--ink)]">NOCODEGIT_SECRET</strong> — long
          random string; derives session JWT + AES key material.
        </li>
        <li>Passwords: bcrypt · sessions: httpOnly cookies</li>
        <li>Host tokens & env values: AES-256-GCM at rest</li>
        <li>Rate limits: login, signup, forgot/reset, deploy</li>
        <li>
          Password reset via <strong className="text-[var(--ink)]">Resend</strong>{" "}
          when <code className="rounded bg-[var(--paper)] px-1">RESEND_API_KEY</code>{" "}
          is set
        </li>
        <li>Security headers: X-Frame-Options, nosniff, referrer</li>
        <li>
          User ZIP contents are untrusted — NoCodeGit only stores and re-uploads
        </li>
        <li>No execution of user apps on NoCodeGit servers</li>
        <li>
          Back up <code className="rounded bg-[var(--paper)] px-1">data/nocodegit.sqlite</code>{" "}
          + <code className="rounded bg-[var(--paper)] px-1">data/snapshots</code>{" "}
          regularly
        </li>
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
