import Link from "next/link";

export function PreSaveChecklist({
  projectId,
  compact = false,
}: {
  projectId: string;
  compact?: boolean;
}) {
  const items = [
    {
      title: "PORT",
      body: "If your app listens on a port, set PORT in Environment so your host can inject it.",
      href: `/app/${projectId}/settings/environment`,
    },
    {
      title: "DATABASE_URL",
      body: "Using a database? Save it under Database or add DATABASE_URL in Environment before deploy.",
      href: `/app/${projectId}/settings/database`,
    },
    {
      title: "Env keys",
      body: "API keys and secrets belong in Environment (vault). They are pushed to your host on Deploy when supported.",
      href: `/app/${projectId}/settings/environment`,
    },
    {
      title: "ncg:snippet markers",
      body: (
        <>
          For ads/scripts, wrap placeholders in your code with{" "}
          <code className="rounded bg-[var(--paper)] px-1 text-[11px]">
            {"<!-- ncg:snippet:name -->"}
          </code>{" "}
          …{" "}
          <code className="rounded bg-[var(--paper)] px-1 text-[11px]">
            {"<!-- /ncg:snippet:name -->"}
          </code>
          .
        </>
      ),
      href: `/app/${projectId}/settings/snippets`,
    },
  ];

  return (
    <div
      className={
        compact
          ? "rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4"
          : "card p-5"
      }
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--ink)]">
          Pre-save checklist
        </h3>
        <span className="text-xs text-[var(--teal)]">Before you upload a ZIP</span>
      </div>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.title} className="text-sm text-[var(--muted)]">
            <span className="font-mono text-xs font-semibold text-[var(--teal)]">
              {item.title}
            </span>
            <span className="mx-1.5 text-[var(--faint)]">·</span>
            <span>{item.body}</span>{" "}
            <Link
              href={item.href}
              className="text-xs font-medium text-[var(--teal)] underline-offset-2 hover:underline"
            >
              Open
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
