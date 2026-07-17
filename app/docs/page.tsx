import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";

export default function DocsPage() {
  return (
    <MarketingShell
      eyebrow="Documentation"
      title="How NoCodeGit works"
      subtitle="Control plane only. We store versions; you host the app."
    >
      <div className="space-y-8 text-sm leading-relaxed">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Save", "Upload a ZIP. Timeline of restore points."],
            ["Connect", "Netlify, Vercel, hook, or SFTP."],
            ["Ship", "Deploy to your host. Report errors to your AI tool."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border border-[var(--line)] p-4">
              <div className="font-semibold text-[var(--teal)]">{t}</div>
              <p className="mt-2 text-[var(--muted)]">{d}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-semibold">Free vs Pro</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--faint)]">
                <th className="py-2 pr-4 font-medium">Feature</th>
                <th className="py-2 pr-4 font-medium">Free</th>
                <th className="py-2 font-medium">Pro $5</th>
              </tr>
            </thead>
            <tbody className="text-[var(--muted)]">
              <tr className="border-b border-[var(--line)]">
                <td className="py-2 pr-4">Save size</td>
                <td className="py-2 pr-4">300 MB</td>
                <td className="py-2 font-medium text-[var(--teal)]">
                  Unlimited
                </td>
              </tr>
              <tr className="border-b border-[var(--line)]">
                <td className="py-2 pr-4">Deploy</td>
                <td className="py-2 pr-4">Yes</td>
                <td className="py-2">Yes</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Ads editor</td>
                <td className="py-2 pr-4">No</td>
                <td className="py-2 font-medium text-[var(--teal)]">Yes</td>
              </tr>
            </tbody>
          </table>
        </div>

        <ul className="space-y-2 text-[var(--teal)]">
          <li>
            <Link href="/docs/security">Security →</Link>
          </li>
          <li>
            <Link href="/docs/deploy">Self-hosting →</Link>
          </li>
          <li>
            <Link href="/docs/flippa">Sale checklist →</Link>
          </li>
        </ul>
      </div>
    </MarketingShell>
  );
}
