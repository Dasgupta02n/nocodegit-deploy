"use client";

import { useEffect, useState } from "react";

type Sess = {
  id: string;
  user_agent: string | null;
  ip: string | null;
  created_at: string;
  last_seen_at: string;
  revoked_at: string | null;
};

export function SessionsPanel() {
  const [sessions, setSessions] = useState<Sess[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/auth/sessions");
    const data = await res.json();
    if (res.ok) setSessions(data.sessions || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function revoke(id: string) {
    await fetch(`/api/auth/sessions?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    setMsg("Session revoked (token may still work until cookie expires).");
    void load();
  }

  return (
    <div className="card mt-8 p-6">
      <h2 className="font-semibold">Active sessions</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Devices that signed in to your NoCodeGit account.
      </p>
      {msg && <p className="mt-2 text-xs text-[var(--teal)]">{msg}</p>}
      <ul className="mt-4 space-y-2">
        {sessions.length === 0 && (
          <li className="text-sm text-[var(--muted)]">No recorded sessions yet.</li>
        )}
        {sessions.map((s) => (
          <li
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--line)] px-3 py-2 text-sm"
          >
            <div>
              <div className="font-medium">
                {s.revoked_at ? "Revoked" : "Active"} · {s.ip || "unknown IP"}
              </div>
              <div className="text-xs text-[var(--faint)]">
                {(s.user_agent || "unknown agent").slice(0, 80)} ·{" "}
                {new Date(s.created_at).toLocaleString()}
              </div>
            </div>
            {!s.revoked_at && (
              <button
                type="button"
                className="btn-ghost !py-1 text-xs text-[var(--danger)]"
                onClick={() => void revoke(s.id)}
              >
                Revoke
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
