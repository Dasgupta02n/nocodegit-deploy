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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Saves stay on NoCodeGit. Live apps run on your host. Free: 300 MB
            per save · Pro $5/mo: unlimited + ads editor.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <NewProjectForm />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {projects.length === 0 && (
          <div className="card col-span-full p-8 text-center text-sm text-[var(--muted)]">
            No projects yet. Create one, upload a ZIP save, connect hosting,
            deploy.
          </div>
        )}
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/app/${p.id}`}
            className="card block p-5 transition hover:border-[var(--teal)]"
          >
            <div className="font-medium">{p.name}</div>
            <div className="mt-1 text-xs text-[var(--faint)]">{p.slug}</div>
            {p.live_url && (
              <div className="mt-3 truncate text-xs text-[var(--teal)]">
                {p.live_url}
              </div>
            )}
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
