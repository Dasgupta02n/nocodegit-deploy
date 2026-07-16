import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getProjectForUser } from "@/lib/projects";
import { getDb } from "@/lib/db";
import { AppShell } from "@/components/AppShell";
import { ProjectWorkspace } from "@/components/ProjectWorkspace";
import { isPaidPlan, maxSnapshotBytesForPlan, formatBytes } from "@/lib/config";

type Props = { params: Promise<{ id: string }> };

export default async function ProjectPage({ params }: Props) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const project = getProjectForUser(id, user.id);
  if (!project) notFound();

  const saves = getDb()
    .prepare(
      "SELECT id, label, size_bytes, created_at FROM saves WHERE project_id = ? ORDER BY created_at DESC"
    )
    .all(id) as {
    id: string;
    label: string | null;
    size_bytes: number;
    created_at: string;
  }[];
  const hosting = getDb()
    .prepare(
      "SELECT provider, display_name, target_json, last_test_status, last_test_message FROM hosting_connections WHERE project_id = ?"
    )
    .get(id) as {
    provider: string;
    display_name: string | null;
    target_json: string;
    last_test_status: string | null;
    last_test_message: string | null;
  } | undefined;
  const env = getDb()
    .prepare(
      "SELECT id, key, visibility, updated_at FROM env_vars WHERE project_id = ? ORDER BY key"
    )
    .all(id) as { id: string; key: string; visibility: string }[];
  const snippets = getDb()
    .prepare(
      "SELECT id, slug, name, kind, placement, content, enabled FROM snippets WHERE project_id = ?"
    )
    .all(id) as {
    id: string;
    slug: string;
    name: string;
    kind: string;
    placement: string;
    content: string;
    enabled: number;
  }[];
  const affiliates = getDb()
    .prepare(
      "SELECT id, label, slug, destination_url, mode, enabled FROM affiliate_links WHERE project_id = ?"
    )
    .all(id) as {
    id: string;
    label: string;
    slug: string;
    destination_url: string;
    mode: string;
    enabled: number;
  }[];
  const deploys = getDb()
    .prepare(
      "SELECT id, status, live_url, created_at, log FROM deploys WHERE project_id = ? ORDER BY created_at DESC LIMIT 10"
    )
    .all(id) as {
    id: string;
    status: string;
    live_url: string | null;
    created_at: string;
    log: string;
  }[];

  return (
    <AppShell email={user.email}>
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
        <Link href="/app" className="hover:text-[var(--ink)]">
          Projects
        </Link>
        <span>/</span>
        <span className="text-[var(--ink)]">{project.name}</span>
      </div>
      <ProjectWorkspace
        project={project}
        initialSaves={saves}
        initialHosting={hosting || null}
        initialEnv={env}
        initialSnippets={isPaidPlan(user.plan) ? snippets : []}
        initialAffiliates={isPaidPlan(user.plan) ? affiliates : []}
        initialDeploys={deploys}
        isPaid={isPaidPlan(user.plan)}
        uploadLimitLabel={formatBytes(maxSnapshotBytesForPlan(user.plan))}
      />
    </AppShell>
  );
}
