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

  const steps = [
    {
      n: 1,
      title: "Code saved",
      ok: readiness.code,
      href: `/app/${projectId}`,
      hint: "≥1 snapshot stored on NoCodeGit",
    },
    {
      n: 2,
      title: "Hosting connected",
      ok: readiness.hosting,
      href: `/app/${projectId}/settings/hosting`,
      hint: "Provider + credentials (Settings → Hosting)",
    },
    {
      n: 3,
      title: "Database",
      ok: readiness.database,
      href: `/app/${projectId}/settings/database`,
      hint: "None or details saved",
    },
    {
      n: 4,
      title: "Environment",
      ok: readiness.environment,
      href: `/app/${projectId}/settings/environment`,
      hint: "Optional keys for your host",
    },
    {
      n: 5,
      title: "Snippets",
      ok: readiness.snippets,
      href: `/app/${projectId}/settings/snippets`,
      hint: "Optional ads / affiliates",
    },
    {
      n: 6,
      title: "Domain / Live URL",
      ok: readiness.domain,
      href: `/app/${projectId}/settings/domain`,
      hint: "Record URL (warn if empty)",
    },
  ];

  async function deploy() {
    if (!readiness.canDeploy) {
      setErr("Deploy needs a save and a hosting connection.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/projects/${projectId}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deploy failed");
      router.push(`/app/${projectId}/deploy`);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-lg font-semibold">Ship checklist</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Deploy is blocked without save + hosting connection.
      </p>

      <ol className="mt-6 space-y-3">
        {steps.map((s) => (
          <li key={s.n}>
            <Link
              href={s.href}
              className="card flex items-start gap-3 p-4 transition hover:border-[var(--teal)]"
            >
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  s.ok
                    ? "bg-[var(--teal)] text-white"
                    : "bg-[var(--paper)] text-[var(--faint)] ring-1 ring-[var(--line)]"
                }`}
              >
                {s.ok ? "✓" : s.n}
              </span>
              <div>
                <div className="font-semibold">{s.title}</div>
                <div className="text-xs text-[var(--muted)]">{s.hint}</div>
              </div>
            </Link>
          </li>
        ))}
      </ol>

      {err && (
        <p className="mt-4 text-sm text-[var(--danger)]">{err}</p>
      )}

      <button
        type="button"
        className="btn-primary mt-8"
        disabled={busy || !readiness.canDeploy}
        onClick={() => void deploy()}
      >
        {busy ? "Deploying…" : "Deploy to your host"}
      </button>
    </div>
  );
}
