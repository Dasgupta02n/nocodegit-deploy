"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "./AuthLayout";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "signup" ? { email, password, name } : { email, password }
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push("/app");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title={mode === "login" ? "Welcome back" : "Create your account"}
      subtitle={
        mode === "login"
          ? "Sign in to your projects."
          : "Start free — 300 MB saves, your host."
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>
        )}
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />
        </div>
        {error && (
          <p className="rounded-xl bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {error}
          </p>
        )}
        <button className="btn-primary w-full" disabled={loading} type="submit">
          {loading
            ? "Please wait…"
            : mode === "login"
              ? "Log in"
              : "Get started"}
        </button>
      </form>
      {mode === "login" && (
        <p className="mt-4 text-center text-sm">
          <Link href="/forgot-password" className="text-[var(--teal)]">
            Forgot password?
          </Link>
        </p>
      )}
      <p className="mt-4 text-center text-sm text-[var(--muted)]">
        {mode === "login" ? (
          <>
            No account?{" "}
            <Link href="/signup" className="font-semibold text-[var(--ink)]">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--ink)]">
              Log in
            </Link>
          </>
        )}
      </p>
    </AuthLayout>
  );
}
