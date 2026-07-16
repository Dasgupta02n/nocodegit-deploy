import Link from "next/link";

export default function SecurityDoc() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 text-sm leading-relaxed">
      <Link href="/docs" className="text-violet-600">
        ← Docs
      </Link>
      <h1 className="mt-6 text-2xl font-bold">Security</h1>
      <ul className="mt-6 list-disc space-y-2 pl-5 text-[var(--muted)]">
        <li>
          <strong className="text-[var(--ink)]">NOCODEGIT_SECRET</strong> — long
          random string; derives session JWT + AES key material.
        </li>
        <li>Passwords: bcrypt · sessions: httpOnly cookies</li>
        <li>Host tokens & env values: AES-256-GCM at rest</li>
        <li>Rate limits: login, signup, forgot/reset, deploy</li>
        <li>
          Password reset via <strong>SendGrid</strong> when{" "}
          <code>SENDGRID_API_KEY</code> is set
        </li>
        <li>Security headers: X-Frame-Options, nosniff, referrer</li>
        <li>
          User ZIP contents are untrusted — NoCodeGit only stores and re-uploads
        </li>
        <li>No execution of user apps on NoCodeGit servers</li>
        <li>
          Back up <code>data/nocodegit.sqlite</code> +{" "}
          <code>data/snapshots</code> regularly
        </li>
      </ul>
    </div>
  );
}
