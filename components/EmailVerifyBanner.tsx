"use client";

import { useState } from "react";

export function EmailVerifyBanner({ verified }: { verified: boolean }) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  if (verified) return null;

  async function send() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/auth/verify-email", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg(data.already ? "Already verified." : "Verification email sent.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card mb-6 flex flex-wrap items-center justify-between gap-3 border-[var(--clay)] bg-[var(--clay-soft)] p-4">
      <div>
        <p className="text-sm font-semibold text-[var(--ink)]">
          Verify your email
        </p>
        <p className="text-xs text-[var(--muted)]">
          Confirm ownership for account recovery and billing notices.
        </p>
        {msg && <p className="mt-1 text-xs text-[var(--teal)]">{msg}</p>}
      </div>
      <button
        type="button"
        className="btn-primary"
        disabled={busy}
        onClick={() => void send()}
      >
        {busy ? "Sending…" : "Send verification"}
      </button>
    </div>
  );
}
