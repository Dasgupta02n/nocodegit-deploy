import { getDb } from "@/lib/db";
import { getProjectForUser } from "@/lib/projects";
import { userFromAgentToken } from "@/lib/agent-auth";
import { error, json, unauthorized } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

/** Tray status line: hosting · env N · snips N */
export async function GET(req: Request, ctx: Ctx) {
  const user = userFromAgentToken(req.headers.get("authorization"));
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const project = getProjectForUser(id, user.id);
  if (!project) return error("Not found", 404);

  const hosting = getDb()
    .prepare(
      "SELECT provider, display_name, last_test_status FROM hosting_connections WHERE project_id = ?"
    )
    .get(id) as
    | { provider: string; display_name: string | null; last_test_status: string | null }
    | undefined;
  const envCount = (
    getDb()
      .prepare("SELECT COUNT(*) as c FROM env_vars WHERE project_id = ?")
      .get(id) as { c: number }
  ).c;
  const snipCount = (
    getDb()
      .prepare("SELECT COUNT(*) as c FROM snippets WHERE project_id = ?")
      .get(id) as { c: number }
  ).c;
  const saveCount = (
    getDb()
      .prepare("SELECT COUNT(*) as c FROM saves WHERE project_id = ?")
      .get(id) as { c: number }
  ).c;

  const hostLabel = hosting
    ? `${hosting.display_name || hosting.provider}${
        hosting.last_test_status === "ok" ? " ✓" : ""
      }`
    : "host ?";

  return json({
    project: { id: project.id, name: project.name, live_url: project.live_url },
    hosting: hosting || null,
    envCount,
    snipCount,
    saveCount,
    statusLine: `${hostLabel} · Env ${envCount} · Snips ${snipCount}`,
  });
}
