"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LiveDeployPanel } from "@/components/LiveDeployPanel";

type Props = {
  project: {
    id: string;
    name: string;
    slug: string;
    live_url: string | null;
  };
  readiness: {
    code: boolean;
    hosting: boolean;
    database: boolean;
    environment: boolean;
    snippets: boolean;
    domain: boolean;
    canDeploy: boolean;
  };
  dashboardUrl?: string | null;
  children: React.ReactNode;
};

export function ProjectChrome({
  project,
  readiness,
  dashboardUrl,
  children,
}: Props) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [liveDeployId, setLiveDeployId] = useState<string | null>(null);

  const base = `/app/${project.id}`;
  const nav = [
    { href: base, label: "Timeline", match: (p: string) => p === base },
    {
      href: `${base}/ship`,
      label: "Ship",
      match: (p: string) =>
        p.startsWith(`${base}/ship`) || p.startsWith(`${base}/checklist`),
    },
    {
      href: `${base}/deploy`,
      label: "Deploy history",
      match: (p: string) =>
        p.startsWith(`${base}/deploy`) || p.startsWith(`${base}/logs`),
    },
    {
      href: `${base}/settings/general`,
      label: "Settings",
      match: (p: string) => p.startsWith(`${base}/settings`),
    },
  ];

  async function uploadSave(file: File) {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("label", file.name);
      const res = await fetch(`/api/projects/${project.id}/saves`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setMsg("Saved to NoCodeGit storage.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function deploy() {
    if (!readiness.canDeploy) {
      setErr("Need at least one save and a hosting connection.");
      return;
    }
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch(`/api/projects/${project.id}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ async: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deploy failed");
      if (data.deploy?.id) {
        setLiveDeployId(data.deploy.id);
        setMsg("Deploy started — live progress below.");
      } else {
        router.push(`${base}/deploy`);
      }
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Deploy failed");
    } finally {
      setBusy(false);
    }
  }

  async function copyErrorReport() {
    try {
      const text = `My NoCodeGit deploy to my hosting provider failed. Fix the project so production deploy works.\n\nProject: ${project.name}\nOpen Deploy history in NoCodeGit for the full log.`;
      await navigator.clipboard.writeText(text);
      setMsg("Error report template copied — open Deploy history for the full log.");
    } catch {
      setErr("Could not copy report");
    }
  }

  const strip = [
    { k: "Hosting", ok: readiness.hosting },
    { k: "Database", ok: readiness.database },
    { k: "Environment", ok: readiness.environment },
    { k: "Snippets", ok: readiness.snippets },
    { k: "Domain", ok: readiness.domain },
  ];

  return (
    <div>
      <div className="mb-2 text-sm text-[var(--muted)]">
        <Link href="/app" className="hover:text-[var(--ink)]">
          Projects
        </Link>
        <span> / </span>
        <span className="text-[var(--ink)]">{project.name}</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {project.name}
            </h1>
            {project.live_url ? (
              <a
                href={project.live_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[var(--teal)]"
              >
                <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
                {project.live_url}
                <span className="badge badge-live">LIVE</span>
              </a>
            ) : (
              <span className="badge badge-muted">Not live yet</span>
            )}
            {dashboardUrl && (
              <a
                href={dashboardUrl}
                target="_blank"
                rel="noreferrer"
                className="badge badge-teal"
              >
                Provider dashboard ↗
              </a>
            )}
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Ship readiness:{" "}
            {strip.map((s, i) => (
              <span key={s.k}>
                {i > 0 && " · "}
                {s.k} {s.ok ? "✓" : "○"}
              </span>
            ))}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <label className="btn-ink cursor-pointer">
            <input
              type="file"
              accept=".zip,application/zip"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadSave(f);
              }}
            />
            Save
          </label>
          <button
            type="button"
            className="btn-primary"
            disabled={busy || !readiness.canDeploy}
            onClick={() => void deploy()}
          >
            Deploy
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => void copyErrorReport()}
          >
            Report error
          </button>
        </div>
      </div>

      {(msg || err) && (
        <div
          className={`mt-4 rounded-xl px-4 py-3 text-sm ${
            err
              ? "bg-[var(--danger-soft)] text-[var(--danger)]"
              : "bg-[var(--teal-soft)] text-[var(--teal)]"
          }`}
        >
          {err || msg}
        </div>
      )}

      <nav className="mt-6 flex flex-wrap gap-1 border-b border-[var(--line)]">
        {nav.map((n) => {
          const on = n.match(pathname);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`border-b-2 px-4 py-2.5 text-sm font-medium ${
                on
                  ? "border-[var(--teal)] text-[var(--teal)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>

      {liveDeployId && (
        <div className="mt-6">
          <LiveDeployPanel
            projectId={project.id}
            deployId={liveDeployId}
            onDone={() => router.refresh()}
          />
        </div>
      )}

      <div className="mt-8">{children}</div>
    </div>
  );
}
