import { userFromAgentToken } from "@/lib/agent-auth";
import { getProjectForUser } from "@/lib/projects";
import { executeProjectDeploy } from "@/lib/deploy-runner";
import { error, json, unauthorized } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const user = userFromAgentToken(req.headers.get("authorization"));
  if (!user) return unauthorized();
  const rl = rateLimit(`agent-deploy:${user.id}:${clientIp(req)}`, 30, 60_000);
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
      },
    });
  } catch (e) {
    return error(e instanceof Error ? e.message : "Deploy failed", 400);
  }
}
