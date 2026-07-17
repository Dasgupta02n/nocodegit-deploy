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
  hostingLabel?: string | null;
  envCount?: number;
  children: React.ReactNode;
};

export function ProjectChrome({
  project,
  readiness,
  dashboardUrl,
  hostingLabel,
  envCount,
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
      label: "Deploys",
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
      setMsg("Version saved to NoCodeGit.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function ship() {
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
      if (!res.ok) throw new Error(data.error || "Ship failed");
      if (data.deploy?.id) {
        setLiveDeployId(data.deploy.id);
        setMsg("Ship started — live progress below.");
        router.push(`${base}/deploy`);
      } else {
        router.push(`${base}/deploy`);
      }
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ship failed");
    } finally {
      setBusy(false);
    }
  }

  async function copyErrorReport() {
    try {
      const text = `My NoCodeGit deploy to my hosting provider failed. Fix the project so production deploy works.\n\nProject: ${project.name}\nOpen Deploys in NoCodeGit for the full log.`;
      await navigator.clipboard.writeText(text);
      setMsg("Error report template copied — open Deploys for the full log.");
    } catch {
      setErr("Could not copy report");
    }
  }

  const chips: {
    label: string;
    ok: boolean;
    warn?: boolean;
  }[] = [
    { label: "Code saved", ok: readiness.code },
    {
      label: readiness.hosting
        ? `Hosting · ${hostingLabel || "connected"}`
        : "Hosting",
      ok: readiness.hosting,
    },
    {
      label:
        typeof envCount === "number"
          ? `Env · ${envCount} key${envCount === 1 ? "" : "s"}`
          : "Environment",
      ok: readiness.environment,
    },
    {
      label: readiness.domain ? "Domain · set" : "Domain · not set",
      ok: readiness.domain,
      warn: !readiness.domain,
    },
    {
      label: readiness.canDeploy ? "Ready to ship" : "Not ready",
      ok: readiness.canDeploy,
    },
  ];

  return (
    <div className="project-chrome">
      <aside className="project-sidenav">
        <div className="project-sidenav-label">Project</div>
        <div className="project-sidenav-name" title={project.name}>
          {project.name}
        </div>
        <nav className="flex flex-col gap-0.5">
          {nav.map((n) => {
            const on = n.match(pathname);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`project-nav-item ${on ? "active" : ""}`}
              >
                <span className="project-nav-dot" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto hidden pt-6 md:block">
          <Link
            href="/download"
            className="block rounded-xl border border-dashed border-[var(--clay)] bg-white/80 px-3 py-3 text-center text-[11px] font-semibold leading-snug text-[var(--muted)] hover:border-[var(--teal)] hover:text-[var(--teal)]"
          >
            Download tray
            <span className="mt-0.5 block font-normal text-[var(--faint)]">
              Save & ship from desktop
            </span>
          </Link>
        </div>
      </aside>

      <div className="project-main">
        <p className="mb-3 text-sm text-[var(--faint)]">
          <Link href="/app" className="hover:text-[var(--ink)]">
            Projects
          </Link>
          <span> / </span>
          <span className="font-medium text-[var(--muted)]">{project.name}</span>
        </p>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-3xl tracking-tight text-[var(--ink)] md:text-4xl">
              {project.name}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--muted)]">
              {project.live_url ? (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
                    Live
                  </span>
                  <span className="text-[var(--faint)]">·</span>
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-[var(--teal)] hover:underline"
                  >
                    {project.live_url.replace(/^https?:\/\//, "")}
                  </a>
                </>
              ) : (
                <span className="badge badge-muted">Not live yet</span>
              )}
              {dashboardUrl && (
                <>
                  <span className="text-[var(--faint)]">·</span>
                  <a
                    href={dashboardUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-[var(--teal)] hover:underline"
                  >
                    Provider dashboard ↗
                  </a>
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="btn-secondary cursor-pointer">
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
              Save version
            </label>
            <button
              type="button"
              className="btn-primary"
              disabled={busy || !readiness.canDeploy}
              onClick={() => void ship()}
              title={
                readiness.canDeploy
                  ? "Ship latest save to your host"
                  : "Need a save + hosting connection"
              }
            >
              {busy ? "Working…" : "Ship →"}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => void copyErrorReport()}
            >
              Report error
            </button>
          </div>
        </div>

        <div className="status-strip mt-5">
          {chips.map((c) => (
            <span
              key={c.label}
              className={`status-chip ${
                c.ok ? "ok" : c.warn ? "warn" : "bad"
              }`}
            >
              <span className="status-chip-dot" />
              {c.label}
            </span>
          ))}
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

        {/* Mobile project nav */}
        <nav className="mt-5 flex gap-1 overflow-x-auto border-b border-[var(--line)] pb-px md:hidden">
          {nav.map((n) => {
            const on = n.match(pathname);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium ${
                  on
                    ? "border-[var(--teal)] text-[var(--teal)]"
                    : "border-transparent text-[var(--muted)]"
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

        <div className="mt-6 md:mt-8">{children}</div>
      </div>
    </div>
  );
}
