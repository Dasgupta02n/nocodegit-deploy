"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PreSaveChecklist } from "@/components/PreSaveChecklist";

type Save = {
  id: string;
  label: string | null;
  size_bytes: number;
  created_at: string;
};

type LastDeploy = {
  id: string;
  status: string;
  live_url: string | null;
  created_at: string;
} | null;

function formatBytes(n: number) {
  if (n >= 1024 * 1024) return `${Math.round(n / (1024 * 1024))} MB`;
  return `${Math.round(n / 1024)} KB`;
}

function relativeTime(iso: string) {
  const t = new Date(iso).getTime();
  const d = Date.now() - t;
  const m = Math.floor(d / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;
  return new Date(iso).toLocaleDateString();
}

export function TimelinePanel({
  projectId,
  initialSaves,
  uploadLimitLabel,
  canDeploy,
  lastDeploy,
}: {
  projectId: string;
  initialSaves: Save[];
  uploadLimitLabel: string;
  canDeploy: boolean;
  lastDeploy?: LastDeploy;
}) {
  const router = useRouter();
  const [saves, setSaves] = useState(initialSaves);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState<{
    sid: string;
    entries: string[];
  } | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("label", file.name);
      const res = await fetch(`/api/projects/${projectId}/saves`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setSaves((s) => [data.save, ...s]);
      setMsg("Version saved.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function deploy(saveId: string) {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/projects/${projectId}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ save_id: saveId, async: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ship failed");
      setMsg(
        data.deploy?.status === "success"
          ? "Ship succeeded."
          : "Ship started — see Deploys for logs."
      );
      router.push(`/app/${projectId}/deploy`);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function rename(sid: string, current: string | null) {
    const next = window.prompt("Rename version", current || "Project save");
    if (next === null) return;
    const label = next.trim();
    if (!label) {
      setErr("Label cannot be empty");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/projects/${projectId}/saves/${sid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Rename failed");
      setSaves((list) =>
        list.map((s) => (s.id === sid ? { ...s, label } : s))
      );
      setMsg("Renamed.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  function download(sid: string) {
    window.location.href = `/api/projects/${projectId}/saves/${sid}`;
  }

  async function loadPreview(sid: string) {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(
        `/api/projects/${projectId}/saves/${sid}/preview`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Preview failed");
      setPreview({ sid, entries: data.entries || [] });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(sid: string) {
    if (!confirm("Delete this version?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/saves/${sid}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setSaves((s) => s.filter((x) => x.id !== sid));
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {msg && (
        <p className="rounded-xl bg-[var(--teal-soft)] px-4 py-3 text-sm text-[var(--teal)]">
          {msg}
        </p>
      )}
      {err && (
        <p className="rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
          {err}
        </p>
      )}

      <div className="mb-2">
        <PreSaveChecklist projectId={projectId} compact={saves.length > 0} />
      </div>

      <div className="panel">
        <div className="panel-h">
          <h2>Versions</h2>
          <span className="meta">Restore points · no Git</span>
        </div>

        {saves.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-[var(--muted)]">
              No versions yet. Upload a ZIP of your project (stored on
              NoCodeGit).
            </p>
            <label className="dropzone mt-6 inline-block w-full max-w-md cursor-pointer">
              <input
                type="file"
                accept=".zip,application/zip"
                className="hidden"
                disabled={busy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void upload(f);
                }}
              />
              <div className="text-sm font-medium text-[var(--teal)]">
                Drag ZIP here or browse
              </div>
              <div className="mt-2 text-xs text-[var(--faint)]">
                Limit {uploadLimitLabel}
              </div>
            </label>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--line)]">
            {saves.map((s, i) => {
              const latest = i === 0;
              return (
                <li
                  key={s.id}
                  className={`grid grid-cols-[28px_1fr_auto] items-start gap-3 px-4 py-4 sm:px-5 ${
                    latest ? "bg-gradient-to-r from-[var(--teal-soft)]/80 to-transparent" : ""
                  }`}
                >
                  <div className="flex flex-col items-center pt-1">
                    <span
                      className={`h-3 w-3 rounded-full border-2 border-[var(--teal)] ${
                        latest ? "bg-[var(--teal)]" : "bg-white"
                      }`}
                    />
                    {i < saves.length - 1 && (
                      <span className="mt-1 min-h-[1.5rem] w-0.5 flex-1 bg-[var(--line)]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[var(--ink)]">
                        {s.label || "Project save"}
                      </span>
                      {latest && (
                        <span className="badge badge-teal">Latest</span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-[var(--faint)]">
                      {relativeTime(s.created_at)} · {formatBytes(s.size_bytes)}{" "}
                      · {new Date(s.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <button
                      type="button"
                      className="btn-ghost !px-2.5 !py-1.5 !text-xs"
                      disabled={busy}
                      onClick={() => void loadPreview(s.id)}
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      className="btn-secondary !px-2.5 !py-1.5 !text-xs"
                      disabled={busy || !canDeploy}
                      onClick={() => void deploy(s.id)}
                    >
                      Ship this
                    </button>
                    <button
                      type="button"
                      className="btn-ghost !px-2.5 !py-1.5 !text-xs"
                      disabled={busy}
                      onClick={() => void rename(s.id, s.label)}
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      className="btn-ghost !px-2.5 !py-1.5 !text-xs"
                      disabled={busy}
                      onClick={() => download(s.id)}
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      className="btn-ghost !px-2.5 !py-1.5 !text-xs text-[var(--danger)]"
                      onClick={() => void remove(s.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {lastDeploy && (
        <div className="panel">
          <div className="panel-h">
            <h2>Last deploy</h2>
            <span
              className={
                lastDeploy.status === "success"
                  ? "badge badge-live"
                  : lastDeploy.status === "running" ||
                      lastDeploy.status === "pending"
                    ? "badge badge-teal"
                    : "badge badge-muted"
              }
            >
              {lastDeploy.status}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <div className="text-sm font-semibold">
                {lastDeploy.status === "success"
                  ? "Deployed successfully"
                  : `Deploy ${lastDeploy.status}`}
              </div>
              <div className="mt-1 text-xs text-[var(--faint)]">
                {new Date(lastDeploy.created_at).toLocaleString()}
                {lastDeploy.live_url ? ` · ${lastDeploy.live_url}` : ""}
              </div>
            </div>
            <Link
              href={`/app/${projectId}/deploy`}
              className="btn-secondary !text-sm"
            >
              View logs
            </Link>
          </div>
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card max-h-[80vh] w-full max-w-lg overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3">
              <h3 className="font-semibold">Package preview</h3>
              <button
                type="button"
                className="btn-ghost !py-1"
                onClick={() => setPreview(null)}
              >
                Close
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto p-5">
              <p className="mb-3 text-xs text-[var(--muted)]">
                Files in this save (restore = download zip).
              </p>
              <ul className="space-y-1 font-mono text-xs text-[var(--ink)]">
                {preview.entries.map((e) => (
                  <li key={e} className="truncate">
                    {e}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="btn-primary mt-4"
                onClick={() => download(preview.sid)}
              >
                Download zip (restore)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
