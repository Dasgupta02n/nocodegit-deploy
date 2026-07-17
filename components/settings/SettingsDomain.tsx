"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SettingsDomain({
  project,
}: {
  project: { id: string; live_url: string | null };
}) {
  const router = useRouter();
  const [liveUrl, setLiveUrl] = useState(project.live_url || "");
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
          live_url: liveUrl.trim() ? liveUrl.trim() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg("Live URL recorded.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card max-w-xl space-y-5 p-6">
      <div>
        <h2 className="text-lg font-semibold">Domain</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Record the public URL of the app on{" "}
          <strong className="text-[var(--ink)]">your</strong> host. NoCodeGit
          does not issue TLS for customer apps or offer free app subdomains for
          hosting.
        </p>
      </div>

      <div>
        <label className="label">Live URL</label>
        <input
          className="input"
          value={liveUrl}
          onChange={(e) => setLiveUrl(e.target.value)}
          placeholder="https://myapp.vercel.app"
        />
      </div>

      <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4 text-sm text-[var(--muted)]">
        <p className="font-semibold text-[var(--ink)]">DNS checklist (on your side)</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Add the domain in Vercel / Netlify / your host dashboard</li>
          <li>Point A / CNAME records at your provider</li>
          <li>Wait for TLS to provision on your host</li>
        </ul>
      </div>

      {msg && <p className="text-sm text-[var(--teal)]">{msg}</p>}
      {err && <p className="text-sm text-[var(--danger)]">{err}</p>}

      <button type="button" className="btn-primary" disabled={busy} onClick={() => void save()}>
        Save live URL
      </button>
    </div>
  );
}
