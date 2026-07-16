"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function AppShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string;
}) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--line)] bg-[var(--elevated)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/app" className="font-semibold">
            NoCodeGit
          </Link>
          <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
            <Link href="/app/billing" className="hover:text-[var(--ink)]">
              Billing
            </Link>
            <Link href="/app/settings" className="hover:text-[var(--ink)]">
              Settings
            </Link>
            <Link href="/docs" className="hover:text-[var(--ink)]">
              Docs
            </Link>
            <span className="hidden sm:inline">{email}</span>
            <button type="button" onClick={logout} className="btn-ghost !px-2">
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
