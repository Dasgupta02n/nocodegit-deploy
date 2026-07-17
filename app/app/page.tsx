import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { listProjects } from "@/lib/projects";
import { AppShell } from "@/components/AppShell";
import { NewProjectForm } from "@/components/NewProjectForm";

export default async function AppHome() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const projects = listProjects(user.id);

  return (
    <AppShell email={user.email}>
      <div className="mb-8">
        <p className="section-eyebrow">Projects</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Your workspace
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Save versions · Connect host · Deploy. Free 300 MB · Pro $5/mo.
        </p>
      </div>

      <NewProjectForm />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 && (
          <div className="card col-span-full p-10 text-center text-sm text-[var(--muted)]">
            No projects yet. Create one above, then Save a ZIP and Deploy.
          </div>
        )}
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/app/${p.id}`}
            className="card block p-5 transition hover:border-[var(--teal)]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold tracking-tight">{p.name}</div>
              {p.live_url ? (
                <span className="badge badge-live">LIVE</span>
              ) : (
                <span className="badge badge-muted">Draft</span>
              )}
            </div>
            <div className="mt-1 text-xs text-[var(--faint)]">{p.slug}</div>
            {p.live_url && (
              <div className="mt-3 truncate text-xs text-[var(--teal)]">
                {p.live_url}
              </div>
            )}
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--line)]">
              <div className="h-full w-2/5 rounded-full bg-[var(--clay)]" />
            </div>
            <div className="mt-2 text-[11px] text-[var(--faint)]">
              Open timeline →
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
