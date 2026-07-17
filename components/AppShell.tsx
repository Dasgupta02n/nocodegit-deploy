"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "./BrandLogo";

const NAV = [
  { href: "/app", label: "Projects", icon: "⌂" },
  { href: "/app/billing", label: "Billing", icon: "▦" },
  { href: "/app/settings", label: "Settings", icon: "⚙" },
  { href: "/docs", label: "Docs", icon: "☰" },
];

export function AppShell({
  children,
  email,
  title,
  actions,
}: {
  children: React.ReactNode;
  email?: string;
  title?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link
          href="/app"
          className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--teal)] text-sm font-bold text-white"
          title="NoCodeGit"
        >
          N
        </Link>
        {NAV.map((n) => {
          const active =
            n.href === "/app"
              ? pathname === "/app" || pathname?.startsWith("/app/")
              : pathname === n.href || pathname?.startsWith(n.href + "/");
          // Don't mark all /app/* as Projects when on billing/settings
          const isProjectsRoot =
            n.href === "/app" &&
            (pathname === "/app" ||
              (pathname?.startsWith("/app/") &&
                !pathname.startsWith("/app/billing") &&
                !pathname.startsWith("/app/settings")));
          const on =
            n.href === "/app"
              ? isProjectsRoot
              : active && n.href !== "/app";
          return (
            <Link
              key={n.href}
              href={n.href}
              title={n.label}
              className={on ? "active" : ""}
            >
              <span className="text-lg leading-none">{n.icon}</span>
            </Link>
          );
        })}
        <div className="mt-auto flex flex-col items-center gap-2 pb-2">
          <button
            type="button"
            onClick={logout}
            title="Log out"
            className="text-[10px] font-semibold text-[var(--faint)] hover:text-[var(--ink)]"
          >
            Out
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="min-w-0 flex-1">
            {title || (
              <div className="flex items-center gap-3">
                <BrandLogo href="/app" size="sm" />
                {email && (
                  <span className="hidden truncate text-xs text-[var(--faint)] sm:inline">
                    {email}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        </header>
        <main className="flex-1 px-5 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
