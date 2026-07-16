"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [devUrl, setDevUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    setDevUrl("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMsg(data.message || data.error || "Done");
      if (data.reset_url) setDevUrl(data.reset_url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Link href="/" className="mb-8 text-lg font-semibold">
        NoCodeGit
      </Link>
      <h1 className="text-2xl font-semibold">Reset password</h1>
      <form onSubmit={onSubmit} className="card mt-6 space-y-4 p-6">
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button className="btn-primary w-full" disabled={busy} type="submit">
          {busy ? "Sending…" : "Send reset link"}
        </button>
        {msg && <p className="text-sm text-[var(--muted)]">{msg}</p>}
        {devUrl && (
          <p className="break-all text-xs text-[var(--teal)]">
            Dev only: <a href={devUrl}>{devUrl}</a>
          </p>
        )}
      </form>
      <Link href="/login" className="mt-6 text-center text-sm text-[var(--teal)]">
        Back to login
      </Link>
    </div>
  );
}
