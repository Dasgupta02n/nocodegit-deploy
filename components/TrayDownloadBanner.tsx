import Link from "next/link";

/** Prominent desktop tray download CTA for marketing surfaces */
export function TrayDownloadBanner({
  compact = false,
}: {
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="card flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div>
          <div className="text-sm font-semibold text-[var(--teal)]">
            Desktop tray
          </div>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Save, Ship, and Report from the Windows system tray.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/downloads/NoCodeGit-Tray-win-x64.exe"
            className="btn-primary"
          >
            Download for Windows
          </a>
          <Link href="/download" className="btn-secondary">
            Setup guide
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow-lg)]">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[var(--teal-soft)] opacity-80" />
      <div className="pointer-events-none absolute -bottom-10 left-1/3 h-32 w-32 rounded-full bg-[var(--clay-soft)] opacity-70" />
      <div className="relative grid gap-8 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10">
        <div>
          <p className="section-eyebrow">Desktop companion</p>
          <h2 className="mt-2 font-display text-3xl text-[var(--ink)] md:text-4xl">
            NoCodeGit Tray
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--muted)]">
            Keep <strong className="font-semibold text-[var(--ink)]">Save</strong>,{" "}
            <strong className="font-semibold text-[var(--ink)]">Ship</strong>, and{" "}
            <strong className="font-semibold text-[var(--ink)]">Report</strong> in
            your system tray while you build. Zip your folder, push a version,
            deploy to your host — no Git required.
          </p>
          <ul className="mt-4 space-y-1.5 text-sm text-[var(--muted)]">
            <li>· Windows x64 portable · free with any plan</li>
            <li>· Agent token from Settings · one config file</li>
            <li>· Same projects as the web dashboard</li>
          </ul>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="/downloads/NoCodeGit-Tray-win-x64.exe"
              className="btn-clay btn-lg"
            >
              Download Windows tray
            </a>
            <Link href="/download" className="btn-secondary btn-lg">
              Full setup guide
            </Link>
          </div>
          <p className="mt-3 text-xs text-[var(--faint)]">
            File: NoCodeGit-Tray-win-x64.exe · Runs without installer
          </p>
        </div>
        <div className="flex justify-center md:justify-end">
          <div className="flex h-36 w-36 flex-col items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--paper)] shadow-[var(--shadow)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--teal)] text-xl font-bold text-white">
              N
            </div>
            <div className="mt-3 text-center text-xs font-semibold text-[var(--ink)]">
              System tray
            </div>
            <div className="mt-1 text-center text-[10px] text-[var(--faint)]">
              Save · Ship · Report
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
