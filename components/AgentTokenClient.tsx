"use client";

import { useEffect, useState } from "react";

type TokenMeta = {
  id: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
};

export function AgentTokenClient() {
  const [tokens, setTokens] = useState<TokenMeta[]>([]);
  const [once, setOnce] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    const res = await fetch("/api/agent/token");
    const data = await res.json();
    if (res.ok) setTokens(data.tokens || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function create() {
    setErr("");
    setOnce("");
    const res = await fetch("/api/agent/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Tray" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data.error || "Failed");
      return;
    }
    setOnce(data.token);
    void load();
  }

  async function revoke(id: string) {
    await fetch(`/api/agent/token?id=${id}`, { method: "DELETE" });
    void load();
  }

  return (
    <div className="card mt-8 space-y-4 p-6">
      <h2 className="font-semibold">Tray agent token</h2>
      <p className="text-sm text-[var(--muted)]">
        Create a token for the desktop tray (Save / Deploy / Report). Paste into
        tray config with project id and API URL.
      </p>
      <button type="button" className="btn-primary" onClick={create}>
        Create token
      </button>
      {once && (
        <div className="rounded-xl bg-[var(--teal-soft)] p-3 text-xs break-all text-[var(--teal)]">
          <strong>Copy now:</strong> {once}
        </div>
      )}
      {err && <p className="text-sm text-[var(--danger)]">{err}</p>}
      <ul className="space-y-2 text-sm">
        {tokens.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between rounded-lg border border-[var(--line)] px-3 py-2"
          >
            <span>
              {t.name}{" "}
              <span className="text-xs text-[var(--faint)]">{t.created_at}</span>
            </span>
            <button
              type="button"
              className="btn-ghost text-xs text-[var(--danger)]"
              onClick={() => revoke(t.id)}
            >
              Revoke
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
