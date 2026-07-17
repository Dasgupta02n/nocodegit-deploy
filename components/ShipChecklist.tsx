"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ShipChecklist({
  projectId,
  readiness,
}: {
  projectId: string;
  readiness: {
    code: boolean;
    hosting: boolean;
    database: boolean;
    environment: boolean;
    snippets: boolean;
    domain: boolean;
    canDeploy: boolean;
  };
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const steps = [
    {
      title: "Code saved",
      ok: readiness.code,
      href: `/app/${projectId}`,
      hint: "At least one version on NoCodeGit",
    },
    {
      title: "Hosting connected",
      ok: readiness.hosting,
      href: `/app/${projectId}/settings/hosting`,
      hint: "Provider + credentials",
    },
    {
      title: "Database",
      ok: readiness.database,
      href: `/app/${projectId}/settings/database`,
      hint: "None or connection saved",
    },
    {
      title: "Environment",
      ok: readiness.environment,
      href: `/app/${projectId}/settings/environment`,
      hint: "Optional keys for your host",
    },
    {
      title: "Snippets",
      ok: readiness.snippets,
      href: `/app/${projectId}/settings/snippets`,
      hint: "Optional ads / affiliates (Pro)",
    },
    {
      title: "Domain / live URL",
      ok: readiness.domain,
      href: `/app/${projectId}/settings/domain`,
      hint: "Optional — set when you have a custom domain",
      optional: true,
    },
  ];

  async function ship() {
    if (!readiness.canDeploy) {
      setErr("Ship needs a save and a hosting connection.");
      return;
    }
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch(`/api/projects/${projectId}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ async: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ship failed");
      setMsg("Ship started.");
      router.push(`/app/${projectId}/deploy`);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(
        `NoCodeGit ship report\nProject: ${projectId}\nTime: ${new Date().toISOString()}\n\nPaste latest deploy log from Deploys into your vibe tool.\n\nChecklist:\n- App listens on PORT if required\n- Env keys set in NoCodeGit Environment\n- Hosting connected\n- Snippet markers if using Pro ads`
      );
      setMsg("Report template copied.");
    } catch {
      setErr("Could not copy");
    }
  }

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-h">
          <h2>Ship readiness</h2>
          <span className="meta">Fix gaps, then ship</span>
        </div>
        <ul className="divide-y divide-[var(--line)]">
          {steps.map((s) => (
            <li
              key={s.title}
              className="flex items-center gap-3 px-4 py-3.5 sm:px-5"
            >
              <span
                className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  s.ok
                    ? "bg-[var(--success-soft)] text-[var(--success)]"
                    : s.optional
                      ? "bg-[#fffaeb] text-[#b54708]"
                      : "bg-[var(--danger-soft)] text-[var(--danger)]"
                }`}
              >
                {s.ok ? "✓" : "!"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{s.title}</div>
                <div className="text-xs text-[var(--faint)]">{s.hint}</div>
              </div>
              <Link
                href={s.href}
                className={
                  s.ok
                    ? "btn-ghost !px-2.5 !py-1.5 !text-xs"
                    : "btn-secondary !px-2.5 !py-1.5 !text-xs"
                }
              >
                {s.ok ? "Open" : "Set up"}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {err && (
        <p className="rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
          {err}
        </p>
      )}
      {msg && (
        <p className="rounded-xl bg-[var(--teal-soft)] px-4 py-3 text-sm text-[var(--teal)]">
          {msg}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          disabled={busy || !readiness.canDeploy}
          onClick={() => void ship()}
        >
          {busy ? "Shipping…" : "Ship latest version →"}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => void copyReport()}
        >
          Copy report for AI tool
        </button>
      </div>
    </div>
  );
}
