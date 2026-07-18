/** Polished UI mock “screenshots” — real text, product-accurate, no AI gibberish */

import type { ReactNode } from "react";

function WindowChrome({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow-lg)] ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-[var(--line)] bg-[#faf8f5] px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 flex-1 truncate rounded-md bg-white px-2 py-1 text-[10px] font-medium text-[var(--faint)] ring-1 ring-[var(--line)]">
          {title}
        </span>
      </div>
      <div className="bg-[var(--paper)] p-3 sm:p-4">{children}</div>
    </div>
  );
}

export function SnippetTimeline() {
  const saves = [
    { name: "auth-flow-fixed.zip", when: "2 min ago", size: "12.4 MB", tag: "Latest" },
    { name: "before-refactor.zip", when: "Yesterday", size: "11.8 MB", tag: null },
    { name: "client-demo.zip", when: "3 days ago", size: "10.2 MB", tag: "Pinned" },
    { name: "first-working.zip", when: "Last week", size: "9.1 MB", tag: null },
  ];
  return (
    <WindowChrome title="nocodegit.tech/app/storefront · Timeline">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[var(--ink)]">storefront</p>
          <p className="text-[10px] text-[var(--faint)]">4 restore points</p>
        </div>
        <span className="rounded-full bg-[var(--teal)] px-2.5 py-1 text-[10px] font-semibold text-white">
          + Save ZIP
        </span>
      </div>
      <ul className="space-y-2">
        {saves.map((s, i) => (
          <li
            key={s.name}
            className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-white px-3 py-2.5"
          >
            <span
              className={`h-8 w-1 rounded-full ${i === 0 ? "bg-[var(--teal)]" : "bg-[var(--line)]"}`}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[var(--ink)]">
                {s.name}
              </p>
              <p className="text-[10px] text-[var(--faint)]">
                {s.when} · {s.size}
              </p>
            </div>
            {s.tag && (
              <span className="rounded-full bg-[var(--teal-soft)] px-2 py-0.5 text-[9px] font-bold text-[var(--teal)]">
                {s.tag}
              </span>
            )}
            <span className="text-[10px] font-semibold text-[var(--teal)]">
              Restore
            </span>
          </li>
        ))}
      </ul>
    </WindowChrome>
  );
}

export function SnippetDeploy() {
  const steps = [
    { t: "Package project", s: "done" },
    { t: "Upload to Netlify", s: "done" },
    { t: "Run build hook", s: "live" },
    { t: "Verify URL", s: "wait" },
  ];
  return (
    <WindowChrome title="Ship checklist · Netlify production">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold">Deploy to Netlify</p>
          <p className="text-[10px] text-[var(--faint)]">
            storefront · main hook
          </p>
        </div>
        <span className="rounded-full bg-[var(--success-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--success)]">
          Shipping…
        </span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[var(--line)]">
        <div className="h-full w-[72%] rounded-full bg-[var(--teal)]" />
      </div>
      <ul className="space-y-2">
        {steps.map((x) => (
          <li
            key={x.t}
            className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs ring-1 ring-[var(--line)]"
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                x.s === "done"
                  ? "bg-[var(--success-soft)] text-[var(--success)]"
                  : x.s === "live"
                    ? "bg-[var(--teal-soft)] text-[var(--teal)]"
                    : "bg-[var(--line)] text-[var(--faint)]"
              }`}
            >
              {x.s === "done" ? "✓" : x.s === "live" ? "…" : "○"}
            </span>
            <span className="font-medium text-[var(--ink)]">{x.t}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 rounded-lg bg-[var(--ink)] px-3 py-2 font-mono text-[10px] text-white/80">
        → https://storefront-demo.netlify.app
      </p>
    </WindowChrome>
  );
}

export function SnippetTray() {
  return (
    <div className="relative mx-auto max-w-sm">
      <div className="rounded-2xl border border-[var(--line)] bg-[#1e1e1e] p-3 shadow-[var(--shadow-lg)]">
        <div className="rounded-xl bg-[#2a2a2a] p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--teal)] text-[10px] font-bold text-white">
                N
              </span>
              <div>
                <p className="text-xs font-semibold text-white">NoCodeGit Tray</p>
                <p className="text-[10px] text-white/45">Connected · 3 projects</p>
              </div>
            </div>
            <span className="h-2 w-2 rounded-full bg-[#28c840]" />
          </div>
          <div className="space-y-1.5">
            {["Save ZIP", "Ship to host", "Report issue"].map((a, i) => (
              <button
                key={a}
                type="button"
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs font-semibold ${
                  i === 0
                    ? "bg-[var(--teal)] text-white"
                    : "bg-white/5 text-white/85 hover:bg-white/10"
                }`}
              >
                {a}
                <span className="text-[10px] opacity-60">⌘{i + 1}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 border-t border-white/10 pt-2 text-[10px] text-white/40">
            Active: storefront · last save 2m ago
          </p>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] font-medium text-[var(--faint)]">
        Windows system tray companion
      </p>
    </div>
  );
}

export function SnippetProjects() {
  const projects = [
    { n: "storefront", h: "Netlify", st: "Shipped" },
    { n: "docs-site", h: "Vercel", st: "Ready" },
    { n: "client-portal", h: "SFTP", st: "Draft" },
  ];
  return (
    <WindowChrome title="nocodegit.tech/app · Projects">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold">Your projects</p>
        <span className="rounded-full bg-[var(--clay)] px-2.5 py-1 text-[10px] font-semibold text-white">
          + New
        </span>
      </div>
      <div className="grid gap-2">
        {projects.map((p) => (
          <div
            key={p.n}
            className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-white px-3 py-3"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--teal-soft)] text-xs font-bold text-[var(--teal)]">
              {p.n.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[var(--ink)]">{p.n}</p>
              <p className="text-[10px] text-[var(--faint)]">{p.h}</p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                p.st === "Shipped"
                  ? "bg-[var(--success-soft)] text-[var(--success)]"
                  : "bg-[var(--line)] text-[var(--muted)]"
              }`}
            >
              {p.st}
            </span>
          </div>
        ))}
      </div>
    </WindowChrome>
  );
}

export function SnippetEnv() {
  return (
    <WindowChrome title="Settings · Environment">
      <p className="mb-3 text-xs font-semibold">Encrypted for production</p>
      <div className="space-y-2">
        {[
          ["DATABASE_URL", "••••••••@db.internal"],
          ["STRIPE_SECRET", "••••••••••••"],
          ["NEXT_PUBLIC_URL", "https://app.example.com"],
        ].map(([k, v]) => (
          <div
            key={k}
            className="grid grid-cols-[1fr_1.2fr] gap-2 rounded-lg bg-white p-2 ring-1 ring-[var(--line)]"
          >
            <code className="truncate text-[10px] font-semibold text-[var(--teal)]">
              {k}
            </code>
            <code className="truncate text-[10px] text-[var(--muted)]">{v}</code>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-[var(--faint)]">
        Keys encrypted at rest · never logged in deploy output
      </p>
    </WindowChrome>
  );
}

export function SnippetBilling() {
  return (
    <WindowChrome title="Billing · Free → Pro">
      <div className="rounded-xl border border-[var(--line)] bg-white p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--teal)]">
              Current plan
            </p>
            <p className="mt-1 text-lg font-semibold">Free</p>
            <p className="text-[10px] text-[var(--faint)]">300 MB per save</p>
          </div>
          <div className="rounded-xl bg-[var(--ink)] px-3 py-2 text-right text-white">
            <p className="text-[10px] text-white/60">Pro</p>
            <p className="text-sm font-semibold">₹500/mo</p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--line)]">
          <div className="h-full w-[42%] rounded-full bg-[var(--clay)]" />
        </div>
        <p className="mt-2 text-[10px] text-[var(--muted)]">
          126 MB of 300 MB used this save
        </p>
        <button
          type="button"
          className="mt-4 w-full rounded-full bg-[var(--teal)] py-2 text-xs font-semibold text-white"
        >
          Upgrade to Pro — unlimited size
        </button>
      </div>
    </WindowChrome>
  );
}
