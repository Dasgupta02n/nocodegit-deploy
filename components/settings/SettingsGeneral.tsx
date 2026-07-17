"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SettingsGeneral({
  project,
}: {
  project: { id: string; name: string; slug: string; folder_hint?: string | null };
}) {
  const router = useRouter();
  const [name, setName] = useState(project.name);
  const [folder, setFolder] = useState(project.folder_hint || "");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          folder_hint: folder || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg("Saved.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function destroy() {
    if (!confirm("Delete this project and all saves? This cannot be undone."))
      return;
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      router.push("/app");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
      setBusy(false);
    }
  }

  return (
    <div className="card max-w-xl space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold">General</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Project name and folder hint for the desktop tray.
        </p>
      </div>
      <div>
        <label className="label">Project name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="label">Slug</label>
        <input className="input bg-[var(--paper)]" value={project.slug} disabled />
      </div>
      <div>
        <label className="label">Linked folder hint</label>
        <input
          className="input"
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          placeholder="~/Projects/my-app"
        />
      </div>
      {msg && <p className="text-sm text-[var(--teal)]">{msg}</p>}
      {err && <p className="text-sm text-[var(--danger)]">{err}</p>}
      <button type="button" className="btn-primary" disabled={busy} onClick={() => void save()}>
        Save
      </button>

      <div className="border-t border-[var(--line)] pt-6">
        <h3 className="text-sm font-semibold text-[var(--danger)]">Danger zone</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Permanently delete this project, saves, and settings.
        </p>
        <button
          type="button"
          className="btn-danger mt-3"
          disabled={busy}
          onClick={() => void destroy()}
        >
          Delete project
        </button>
      </div>
    </div>
  );
}
