import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";

export default function DownloadPage() {
  return (
    <MarketingShell
      eyebrow="Desktop"
      title="Download NoCodeGit Tray"
      subtitle="Windows x64 portable tray — Save, Deploy, and Report from the system tray."
    >
      <div className="space-y-6 text-sm leading-relaxed text-[var(--muted)]">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-xs text-[var(--faint)]">
          Installer / build target: <strong className="text-[var(--ink)]">Windows x64 portable</strong>
          . Place a built binary under{" "}
          <code className="rounded bg-white px-1">public/downloads/</code> if you
          want a direct link from this page.
        </div>

        <div>
          <h2 className="text-base font-semibold text-[var(--ink)]">
            Get the tray
          </h2>
          <p className="mt-2">
            A prebuilt portable is not always published in{" "}
            <code className="rounded bg-[var(--paper)] px-1">public/</code>. From
            the repo:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-2xl bg-[var(--surface-dark)] p-5 text-xs leading-relaxed text-white/85">
{`cd tray
npm install
npm run dist
# Output: tray/dist/NoCodeGit Tray *.exe
# or tray/dist/win-unpacked/NoCodeGit Tray.exe`}
          </pre>
          <p className="mt-3">
            Or run in dev:{" "}
            <code className="rounded bg-[var(--paper)] px-1">npm run tray</code>{" "}
            from the monorepo root (see README).
          </p>
          <p className="mt-3">
            If you have published a portable build at{" "}
            <code className="rounded bg-[var(--paper)] px-1">
              /downloads/NoCodeGit-Tray-win-x64.exe
            </code>
            , use the button below.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/downloads/NoCodeGit-Tray-win-x64.exe"
              className="btn-primary"
            >
              Download Windows x64 portable
            </a>
            <Link href="/onboarding" className="btn-secondary">
              Onboarding guide
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-[var(--ink)]">
            Configure the tray
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>
              Open{" "}
              <Link href="/app/settings" className="text-[var(--teal)] hover:underline">
                Settings
              </Link>{" "}
              (signed in) and create a <strong className="text-[var(--ink)]">Tray agent token</strong>.
              Copy it once.
            </li>
            <li>
              Set config (Windows default path:{" "}
              <code className="rounded bg-[var(--paper)] px-1">
                %APPDATA%/nocodegit-tray/nocodegit-tray.json
              </code>
              ):
            </li>
          </ol>
          <pre className="mt-3 overflow-x-auto rounded-2xl bg-[var(--surface-dark)] p-5 text-xs leading-relaxed text-white/85">
{`{
  "apiUrl": "https://nocodegit.tech",
  "token": "ncg_...",
  "projectId": "your-project-id",
  "folderPath": "C:\\\\path\\\\to\\\\project"
}`}
          </pre>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>
              <code className="rounded bg-[var(--paper)] px-1">apiUrl</code> —
              your NoCodeGit control-plane base URL
            </li>
            <li>
              <code className="rounded bg-[var(--paper)] px-1">token</code> —
              agent token from Settings
            </li>
            <li>
              <code className="rounded bg-[var(--paper)] px-1">projectId</code> —
              project id from the dashboard URL (
              <code className="rounded bg-[var(--paper)] px-1">/app/[id]</code>)
            </li>
            <li>
              <code className="rounded bg-[var(--paper)] px-1">folderPath</code> —
              local project folder the tray zips on Save
            </li>
          </ul>
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
