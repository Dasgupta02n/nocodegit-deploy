"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ENV_TEMPLATES } from "@/lib/provider-meta";

export function SettingsEnvironment({
  projectId,
  initial,
}: {
  projectId: string;
  initial: { id: string; key: string; visibility: string }[];
}) {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [visibility, setVisibility] = useState<"secret" | "public">("secret");
  const [paste, setPaste] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function addOne(k: string, v: string, vis: string) {
    const res = await fetch(`/api/projects/${projectId}/environment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: k, value: v, visibility: vis }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");
  }

  async function add() {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await addOne(key, value, visibility);
      setKey("");
      setValue("");
      setMsg("Saved.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function importEnv() {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const lines = paste.split(/\r?\n/).filter(Boolean);
      let n = 0;
      for (const line of lines) {
        if (line.trim().startsWith("#")) continue;
        const i = line.indexOf("=");
        if (i < 1) continue;
        const k = line.slice(0, i).trim();
        let v = line.slice(i + 1).trim();
        if (
          (v.startsWith('"') && v.endsWith('"')) ||
          (v.startsWith("'") && v.endsWith("'"))
        ) {
          v = v.slice(1, -1);
        }
        await addOne(k, v, "secret");
        n++;
      }
      setPaste("");
      setMsg(`Imported ${n} variable(s).`);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(envKey: string) {
    if (!confirm(`Delete ${envKey}?`)) return;
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch(
        `/api/projects/${projectId}/environment?key=${encodeURIComponent(envKey)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg(`Deleted ${envKey}.`);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  function exportEnv() {
    // Owner-only decrypt export (session cookie sent with navigation)
    window.location.href = `/api/projects/${projectId}/environment/export`;
  }

  return (
    <div className="card max-w-xl space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold">Environment</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Keys stay in NoCodeGit’s vault and are sent to{" "}
          <strong className="text-[var(--ink)]">your</strong> hosting provider
          when you Deploy (when supported). NoCodeGit does not call OpenAI for
          you.
        </p>
      </div>

      <div>
        <p className="label">Templates</p>
        <div className="flex flex-wrap gap-2">
          {ENV_TEMPLATES.map((t) => (
            <button
              key={t.key}
              type="button"
              className="badge badge-teal cursor-pointer border-0"
              onClick={() => {
                setKey(t.key);
                setVisibility(t.visibility);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Key</label>
          <input
            className="input"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="OPENAI_API_KEY"
          />
        </div>
        <div>
          <label className="label">Value</label>
          <input
            className="input"
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="label">Visibility</label>
        <select
          className="input"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as "secret" | "public")}
        >
          <option value="secret">Secret (server-side on host)</option>
          <option value="public">Public (frontend build vars)</option>
        </select>
      </div>
      <button type="button" className="btn-primary" disabled={busy} onClick={() => void add()}>
        + Add variable
      </button>

      <div>
        <label className="label">Import .env paste</label>
        <textarea
          className="input min-h-[100px] font-mono text-xs"
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          placeholder={"OPENAI_API_KEY=sk-...\nSTRIPE_SECRET_KEY=sk_..."}
        />
        <button
          type="button"
          className="btn-secondary mt-2"
          disabled={busy || !paste.trim()}
          onClick={() => void importEnv()}
        >
          Import
        </button>
      </div>

      {msg && <p className="text-sm text-[var(--teal)]">{msg}</p>}
      {err && <p className="text-sm text-[var(--danger)]">{err}</p>}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Variables</h3>
        <button
          type="button"
          className="btn-secondary !py-1.5 !text-xs"
          disabled={busy || initial.length === 0}
          onClick={exportEnv}
          title="Downloads KEY=value for the project owner (decrypted, session auth)"
        >
          Export as .env
        </button>
      </div>

      <ul className="divide-y divide-[var(--line)] rounded-xl border border-[var(--line)]">
        {initial.length === 0 && (
          <li className="px-3 py-4 text-sm text-[var(--muted)]">No variables yet.</li>
        )}
        {initial.map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
            <span>
              <span className="font-mono font-medium">{e.key}</span>
              <span className="ml-2 badge badge-muted">{e.visibility}</span>
            </span>
            <span className="flex items-center gap-3">
              <span className="text-[var(--faint)]">••••••••</span>
              <button
                type="button"
                className="btn-ghost !py-1 !px-2 !text-xs text-[var(--danger)]"
                disabled={busy}
                onClick={() => void remove(e.key)}
              >
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
