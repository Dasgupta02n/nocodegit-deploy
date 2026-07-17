"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthLayout } from "@/components/AuthLayout";

function ResetForm() {
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp.get("token") || "";
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg(data.message);
      setTimeout(() => router.push("/login"), 1500);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <p className="text-sm text-[var(--danger)]">Missing reset token.</p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">New password</label>
        <input
          className="input"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button className="btn-primary w-full" disabled={busy} type="submit">
        {busy ? "Saving…" : "Update password"}
      </button>
      {err && <p className="text-sm text-[var(--danger)]">{err}</p>}
      {msg && <p className="text-sm text-[var(--teal)]">{msg}</p>}
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="At least 8 characters."
    >
      <Suspense fallback={<p className="text-sm text-[var(--muted)]">Loading…</p>}>
        <ResetForm />
      </Suspense>
      <Link
        href="/login"
        className="mt-6 block text-center text-sm text-[var(--teal)]"
      >
        Back to login
      </Link>
    </AuthLayout>
  );
}
