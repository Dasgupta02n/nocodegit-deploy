import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getProjectForUser } from "@/lib/projects";
import { error, json, unauthorized } from "@/lib/api";

type Ctx = { params: Promise<{ id: string; deployId: string }> };

/** Poll live deploy job progress */
export async function GET(_req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id, deployId } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);
  const row = getDb()
    .prepare(
      `SELECT id, save_id, status, log, provider_ref, live_url, created_at, finished_at
       FROM deploys WHERE id = ? AND project_id = ?`
    )
    .get(deployId, id) as
    | {
        id: string;
        save_id: string | null;
        status: string;
        log: string;
        provider_ref: string | null;
        live_url: string | null;
        created_at: string;
        finished_at: string | null;
      }
    | undefined;
  if (!row) return error("Deploy not found", 404);

  // Estimate progress from step markers in log
  const log = row.log || "";
  let progress = 5;
  if (log.includes("1/6")) progress = 10;
  if (log.includes("2/6")) progress = 25;
  if (log.includes("3/6")) progress = 40;
  if (log.includes("4/6")) progress = 55;
  if (log.includes("5/6")) progress = 70;
  if (log.includes("6/6")) progress = 85;
  if (row.status === "success") progress = 100;
  if (row.status === "failed") progress = 100;

  return json({
    deploy: {
      ...row,
      progress,
      done: row.status === "success" || row.status === "failed",
    },
  });
}
