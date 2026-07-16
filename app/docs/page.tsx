import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm text-violet-600">
        ← NoCodeGit
      </Link>
      <h1 className="mt-6 text-3xl font-bold">Documentation</h1>
      <p className="mt-2 text-[var(--muted)]">
        nocodegit.tech — control plane only. We store versions; you host the app.
      </p>

      <section className="mt-10 space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold">Free vs Pro</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--faint)]">
                  <th className="py-2 pr-4">Feature</th>
                  <th className="py-2 pr-4">Free</th>
                  <th className="py-2">Pro $5/mo</th>
                </tr>
              </thead>
              <tbody className="text-[var(--muted)]">
                <tr className="border-b border-[var(--line)]">
                  <td className="py-2 pr-4">Save size</td>
                  <td className="py-2 pr-4">300 MB</td>
                  <td className="py-2 font-medium text-violet-600">Unlimited</td>
                </tr>
                <tr className="border-b border-[var(--line)]">
                  <td className="py-2 pr-4">Deploy to your host</td>
                  <td className="py-2 pr-4">Yes</td>
                  <td className="py-2">Yes</td>
                </tr>
                <tr className="border-b border-[var(--line)]">
                  <td className="py-2 pr-4">Code already has ads/affiliates</td>
                  <td className="py-2 pr-4">Deploys as-is</td>
                  <td className="py-2">Deploys as-is</td>
                </tr>
                <tr className="border-b border-[var(--line)]">
                  <td className="py-2 pr-4">Ads &amp; affiliate editor</td>
                  <td className="py-2 pr-4">No</td>
                  <td className="py-2 font-medium text-violet-600">Yes</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">API keys / database URL</td>
                  <td className="py-2 pr-4">Yes</td>
                  <td className="py-2">Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Quick start</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-[var(--muted)]">
            <li>Sign up → create a project</li>
            <li>Upload a ZIP save (exclude node_modules)</li>
            <li>Hosting: Netlify site_id + token, or deploy hook, or SFTP</li>
            <li>Optional: Database URL, Environment keys</li>
            <li>Pro: Ads &amp; affiliates editor</li>
            <li>Ship checklist → Deploy</li>
            <li>On failure: Report error → fix in vibe tool → Save again</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Snippet markers (Pro)</h2>
          <pre className="card mt-2 overflow-x-auto p-4 text-xs">
{`<!-- ncg:snippet:header-ad -->
  ... ad HTML ...
<!-- /ncg:snippet:header-ad -->`}
          </pre>
          <p className="mt-2 text-[var(--muted)]">
            Legacy <code>quay:snippet</code> markers are still detected on
            deploy.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Env push</h2>
          <p className="mt-2 text-[var(--muted)]">
            On Deploy, NoCodeGit attempts to push Environment keys to{" "}
            <strong>Netlify</strong> and <strong>Vercel</strong> (needs{" "}
            <code>project_id</code> for Vercel). Other providers: paste keys on
            their dashboard (names listed in deploy log).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Providers</h2>
          <pre className="card mt-2 overflow-x-auto p-4 text-xs">
{`Netlify:  provider=netlify
  credentials=token
  target: {"site_id":"...","live_url":"https://..."}

Vercel:   provider=vercel
  target: {"hook_url":"https://api.vercel.com/v1/integrations/deploy/...","live_url":"...","project_id":"..."}

SFTP:     provider=sftp
  credentials=password
  target: {"host":"...","user":"...","port":"22","remote_path":"/var/www","live_url":"https://..."}

Hook:     provider=hook
  target: {"hook_url":"https://...","live_url":"https://..."}`}
          </pre>
        </div>

        <ul className="list-disc space-y-1 pl-5 text-violet-600">
          <li>
            <Link href="/docs/security">Security</Link>
          </li>
          <li>
            <Link href="/docs/deploy">Self-hosting</Link>
          </li>
          <li>
            <Link href="/docs/flippa">Sale checklist</Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
