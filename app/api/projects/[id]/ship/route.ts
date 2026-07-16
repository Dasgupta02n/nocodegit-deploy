import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getProjectForUser } from "@/lib/projects";
import { error, json, unauthorized } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const project = getProjectForUser(id, user.id);
  if (!project) return error("Not found", 404);

  const saves = getDb()
    .prepare("SELECT COUNT(*) as c FROM saves WHERE project_id = ?")
    .get(id) as { c: number };
  const hosting = getDb()
    .prepare("SELECT last_test_status FROM hosting_connections WHERE project_id = ?")
    .get(id) as { last_test_status: string | null } | undefined;
  const dbRow = getDb()
    .prepare("SELECT mode FROM project_database WHERE project_id = ?")
    .get(id) as { mode: string } | undefined;
  const envCount = getDb()
    .prepare("SELECT COUNT(*) as c FROM env_vars WHERE project_id = ?")
    .get(id) as { c: number };
  const snipCount = getDb()
    .prepare("SELECT COUNT(*) as c FROM snippets WHERE project_id = ?")
    .get(id) as { c: number };

  const steps = [
    {
      id: "code",
      label: "Code saved",
      status: saves.c > 0 ? "ok" : "block",
      message: saves.c > 0 ? `${saves.c} save(s)` : "Upload a ZIP save",
    },
    {
      id: "hosting",
      label: "Hosting connected",
      status: hosting ? (hosting.last_test_status === "fail" ? "warn" : "ok") : "block",
      message: hosting
        ? hosting.last_test_status === "fail"
          ? "Connected but last test failed"
          : "Provider connected"
        : "Connect your host (Vercel/Netlify/hook)",
    },
    {
      id: "database",
      label: "Database",
      status: "ok",
      message: dbRow?.mode === "external" ? "External DB recorded" : "None / optional",
    },
    {
      id: "environment",
      label: "Environment",
      status: "ok",
      message: envCount.c ? `${envCount.c} key(s)` : "Optional — add API keys as needed",
    },
    {
      id: "snippets",
      label: "Snippets",
      status: "ok",
      message: snipCount.c ? `${snipCount.c} snippet(s)` : "Optional",
    },
    {
      id: "domain",
      label: "Live URL",
      status: project.live_url ? "ok" : "warn",
      message: project.live_url || "Record URL after first deploy",
    },
  ] as const;

  const blockers = steps.filter((s) => s.status === "block");
  return json({
    can_deploy: blockers.length === 0,
    steps,
    blockers: blockers.map((b) => b.message),
  });
}
