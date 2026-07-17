"use client";

import { useState } from "react";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (newPassword !== confirm) {
      setErr("New passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg(data.message || "Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card mt-8 max-w-md space-y-4 p-6">
      <h2 className="font-semibold text-[var(--ink)]">Change password</h2>
      <p className="text-sm text-[var(--muted)]">
        Enter your current password and a new one (at least 8 characters).
      </p>
      <div>
        <label className="label" htmlFor="current-password">
          Current password
        </label>
        <input
          id="current-password"
          className="input"
          type="password"
          required
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor="new-password">
          New password
        </label>
        <input
          id="new-password"
          className="input"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor="confirm-password">
          Confirm new password
        </label>
        <input
          id="confirm-password"
          className="input"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? "Saving…" : "Update password"}
      </button>
      {err && <p className="text-sm text-[var(--danger)]">{err}</p>}
      {msg && <p className="text-sm text-[var(--teal)]">{msg}</p>}
    </form>
  );
}
