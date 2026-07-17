"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { slug: "general", label: "General" },
  { slug: "hosting", label: "Hosting" },
  { slug: "database", label: "Database" },
  { slug: "environment", label: "Environment" },
  { slug: "snippets", label: "Snippets" },
  { slug: "domain", label: "Domain" },
] as const;

export function ProjectSettingsNav({ projectId }: { projectId: string }) {
  const pathname = usePathname() || "";
  const base = `/app/${projectId}/settings`;

  return (
    <aside className="w-full shrink-0 md:w-48">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--faint)]">
        Settings
      </p>
      <nav className="flex flex-row flex-wrap gap-1 md:flex-col">
        {ITEMS.map((item) => {
          const href = `${base}/${item.slug}`;
          const on = pathname === href || pathname.endsWith(`/settings/${item.slug}`);
          return (
            <Link
              key={item.slug}
              href={href}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                on
                  ? "bg-[var(--teal-soft)] text-[var(--teal)]"
                  : "text-[var(--muted)] hover:bg-white hover:text-[var(--ink)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
