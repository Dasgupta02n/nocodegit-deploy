"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SettingsDatabase({
  projectId,
  initial,
}: {
  projectId: string;
  initial: { mode: string; has_connection: boolean };
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"none" | "external">(
    initial.mode === "external" ? "external" : "none"
  );
  const [conn, setConn] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(addToEnv: boolean) {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch(`/api/projects/${projectId}/database`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          connection_string: mode === "external" ? conn || null : null,
          add_to_env: addToEnv && mode === "external",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg(
        mode === "external"
          ? addToEnv
            ? "Database saved · DATABASE_URL added to Environment"
            : "Database details saved."
          : "Database set to none."
      );
      setConn("");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function testFormat() {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch(`/api/projects/${projectId}/database`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connection_string: conn }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg(
        data.message ||
          "Format looks valid. Full TCP test runs on your host when the app starts."
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card max-w-xl space-y-5 p-6">
      <div>
        <h2 className="text-lg font-semibold">Database</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Create a database at Supabase, Neon, PlanetScale, Railway, etc. Paste
          details here so they can be sent to your host as env vars on deploy.
          NoCodeGit does not host application databases.
        </p>
      </div>

      {initial.has_connection && (
        <p className="text-xs text-[var(--teal)]">
          A connection string is stored (encrypted).
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={mode === "none"}
            onChange={() => setMode("none")}
          />
          None
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={mode === "external"}
            onChange={() => setMode("external")}
          />
          I have a database
        </label>
      </div>

      {mode === "external" && (
        <div>
          <label className="label">Connection string</label>
          <input
            className="input"
            type="password"
            value={conn}
            onChange={(e) => setConn(e.target.value)}
            placeholder="postgres://..."
          />
          <p className="mt-2 text-xs text-[var(--faint)]">
            Checklist: use a full URL (<code>postgres://</code> /{" "}
            <code>mysql://</code>), allow your host’s IPs, and set{" "}
            <code>DATABASE_URL</code> in Environment for deploys. Test opens
            outbound TCP only when configured on your host — NoCodeGit validates
            format only.
          </p>
        </div>
      )}

      {msg && <p className="text-sm text-[var(--teal)]">{msg}</p>}
      {err && <p className="text-sm text-[var(--danger)]">{err}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          disabled={busy}
          onClick={() => void save(false)}
        >
          Save
        </button>
        {mode === "external" && (
          <>
            <button
              type="button"
              className="btn-secondary"
              disabled={busy}
              onClick={() => void save(true)}
            >
              Save + add to Environment as DATABASE_URL
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={busy || !conn.trim()}
              onClick={() => void testFormat()}
            >
              Test format
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setErr("");
                setMsg("");
                try {
                  const res = await fetch(
                    `/api/projects/${projectId}/database/test`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        connection_string: conn || undefined,
                      }),
                    }
                  );
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Test failed");
                  setMsg(data.message || (data.ok ? "OK" : "Unreachable"));
                } catch (e) {
                  setErr(e instanceof Error ? e.message : "Failed");
                } finally {
                  setBusy(false);
                }
              }}
            >
              TCP reachability test
            </button>
          </>
        )}
      </div>
    </div>
  );
}
