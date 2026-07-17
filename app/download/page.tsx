import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";
import { TrayDownloadBanner } from "@/components/TrayDownloadBanner";

export default function DownloadPage() {
  return (
    <MarketingShell
      eyebrow="Desktop"
      title="Download NoCodeGit Tray"
      subtitle="Windows system tray — Save, Ship, and Report without leaving your editor."
    >
      <div className="space-y-10 text-sm leading-relaxed text-[var(--muted)]">
        <TrayDownloadBanner />

        <div className="card p-6">
          <h2 className="text-base font-semibold text-[var(--ink)]">
            Quick install
          </h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5">
            <li>
              <a
                href="/downloads/NoCodeGit-Tray-win-x64.exe"
                className="font-semibold text-[var(--teal)] hover:underline"
              >
                Download the Windows x64 portable
              </a>{" "}
              and run it (no installer required).
            </li>
            <li>
              Sign in to NoCodeGit →{" "}
              <Link
                href="/app/settings"
                className="text-[var(--teal)] hover:underline"
              >
                Settings
              </Link>{" "}
              and create a <strong className="text-[var(--ink)]">Tray agent token</strong>.
            </li>
            <li>
              In the tray menu: <strong className="text-[var(--ink)]">Open config</strong>{" "}
              and set <code className="rounded bg-[var(--paper)] px-1">apiUrl</code>,{" "}
              <code className="rounded bg-[var(--paper)] px-1">token</code>, project, and
              folder.
            </li>
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/downloads/NoCodeGit-Tray-win-x64.exe"
              className="btn-primary"
            >
              Download Windows x64 portable
            </a>
            <Link href="/onboarding" className="btn-secondary">
              Onboarding guide
            </Link>
            <Link href="/signup" className="btn-ghost">
              Create account
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-[var(--ink)]">
            Config file
          </h2>
          <p className="mt-2">
            Windows path:{" "}
            <code className="rounded bg-[var(--paper)] px-1">
              %APPDATA%/nocodegit-tray/nocodegit-tray.json
            </code>
          </p>
          <pre className="mt-3 overflow-x-auto rounded-2xl bg-[var(--surface-dark)] p-5 text-xs leading-relaxed text-white/85">
{`{
  "apiUrl": "https://nocodegit.tech",
  "token": "ncg_...",
  "projectId": "your-project-id",
  "folderPath": "C:\\\\path\\\\to\\\\project"
}`}
          </pre>
        </div>

        <div>
          <h2 className="text-base font-semibold text-[var(--ink)]">
            Build from source
          </h2>
          <pre className="mt-3 overflow-x-auto rounded-2xl bg-[var(--surface-dark)] p-5 text-xs leading-relaxed text-white/85">
{`cd tray
npm install
npm run dist
# Output: tray/dist/ or public/downloads/`}
          </pre>
        </div>

        <p>
          Need the full flow?{" "}
          <Link href="/onboarding" className="text-[var(--teal)] hover:underline">
            Onboarding
          </Link>{" "}
          ·{" "}
          <Link href="/docs" className="text-[var(--teal)] hover:underline">
            Docs
          </Link>
        </p>
      </div>
    </MarketingShell>
  );
}
