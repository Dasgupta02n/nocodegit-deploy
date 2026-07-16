import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getProjectForUser } from "@/lib/projects";
import { executeProjectDeploy } from "@/lib/deploy-runner";
import { error, json, unauthorized } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);
  const deploys = getDb()
    .prepare(
      "SELECT id, save_id, status, provider_ref, live_url, created_at, finished_at FROM deploys WHERE project_id = ? ORDER BY created_at DESC LIMIT 50"
    )
    .all(id);
  return json({ deploys });
}

export async function POST(req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const rl = rateLimit(`deploy:${user.id}:${clientIp(req)}`, 20, 60_000);
  if (!rl.ok) return error(`Rate limit — retry in ${rl.retryAfterSec}s`, 429);

  const { id } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);

  let body: { save_id?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* empty */
  }

  try {
    const outcome = await executeProjectDeploy(id, user.id, body.save_id);
    return json({
      deploy: {
        id: outcome.deployId,
        status: outcome.status,
        log: outcome.log,
        live_url: outcome.live_url,
        provider_ref: outcome.provider_ref,
      },
    });
  } catch (e) {
    return error(e instanceof Error ? e.message : "Deploy failed", 400);
  }
}
