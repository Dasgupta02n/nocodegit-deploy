"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PreSaveChecklist } from "@/components/PreSaveChecklist";

type Save = {
  id: string;
  label: string | null;
  size_bytes: number;
  created_at: string;
};

function formatBytes(n: number) {
  if (n >= 1024 * 1024) return `${Math.round(n / (1024 * 1024))} MB`;
  return `${Math.round(n / 1024)} KB`;
}

export function TimelinePanel({
  projectId,
  initialSaves,
  uploadLimitLabel,
  canDeploy,
}: {
  projectId: string;
  initialSaves: Save[];
  uploadLimitLabel: string;
  canDeploy: boolean;
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
      setMsg("Saved.");
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
        body: JSON.stringify({ save_id: saveId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deploy failed");
      setMsg(
        data.deploy?.status === "success"
          ? "Deploy succeeded."
          : "Deploy finished with errors."
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
    const next = window.prompt("Rename save", current || "Project save");
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rename failed");
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
    if (!confirm("Delete this save?")) return;
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
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Project Timeline</h2>
          <p className="text-sm text-[var(--teal)]">Version History</p>
        </div>
        <label className="btn-secondary cursor-pointer text-sm">
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
          + New save
        </label>
      </div>

      {msg && <p className="mb-4 text-sm text-[var(--teal)]">{msg}</p>}
      {err && <p className="mb-4 text-sm text-[var(--danger)]">{err}</p>}

      <div className="mb-6">
        <PreSaveChecklist projectId={projectId} compact={saves.length > 0} />
      </div>

      {saves.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-[var(--muted)]">
            No saves yet. Click <strong>Save</strong> and upload a ZIP of your
            project (stored on NoCodeGit).
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
              Drag ZIP here or Browse
            </div>
            <div className="mt-2 text-xs text-[var(--faint)]">
              Limit {uploadLimitLabel}
            </div>
          </label>
        </div>
      ) : (
        <div className="timeline max-w-2xl">
          {saves.map((s, i) => (
            <div key={s.id} className="timeline-item">
              <div className="timeline-card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                      <span>
                        {new Date(s.created_at).toLocaleString()} — Save
                      </span>
                      {i === 0 && (
                        <span className="badge badge-teal">Latest</span>
                      )}
                    </div>
                    <div className="mt-1 font-semibold">
                      {s.label || "Project save"}
                    </div>
                    <div className="mt-1 text-xs text-[var(--faint)]">
                      {formatBytes(s.size_bytes)}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn-secondary !py-1.5 !text-xs"
                      disabled={busy}
                      onClick={() => void loadPreview(s.id)}
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      className="btn-primary !py-1.5 !text-xs"
                      disabled={busy || !canDeploy}
                      onClick={() => void deploy(s.id)}
                    >
                      Deploy this
                    </button>
                    <button
                      type="button"
                      className="btn-secondary !py-1.5 !text-xs"
                      disabled={busy}
                      onClick={() => void rename(s.id, s.label)}
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      className="btn-secondary !py-1.5 !text-xs"
                      disabled={busy}
                      onClick={() => download(s.id)}
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      className="btn-ghost !py-1.5 !text-xs text-[var(--danger)]"
                      onClick={() => void remove(s.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
                Files in this save (restore = download zip, then open locally).
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
