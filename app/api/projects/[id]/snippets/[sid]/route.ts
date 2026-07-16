import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getProjectForUser } from "@/lib/projects";
import { isPaidPlan } from "@/lib/config";
import { error, json, unauthorized } from "@/lib/api";

type Ctx = { params: Promise<{ id: string; sid: string }> };

function requirePaid(user: { plan?: string }) {
  if (!isPaidPlan(user.plan)) {
    return error("Ads & affiliate editor is Pro only ($5/mo)", 403);
  }
  return null;
}

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  content: z.string().max(100_000).optional(),
  placement: z.enum(["head", "body_start", "body_end", "marker"]).optional(),
  enabled: z.boolean().optional(),
  kind: z.string().max(40).optional(),
});

export async function PATCH(req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const paid = requirePaid(user);
  if (paid) return paid;
  const { id, sid } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);
  try {
    const body = patchSchema.parse(await req.json());
    const row = getDb()
      .prepare("SELECT * FROM snippets WHERE id = ? AND project_id = ?")
      .get(sid, id) as Record<string, unknown> | undefined;
    if (!row) return error("Snippet not found", 404);
    getDb()
      .prepare(
        `UPDATE snippets SET
          name = COALESCE(?, name),
          content = COALESCE(?, content),
          placement = COALESCE(?, placement),
          kind = COALESCE(?, kind),
          enabled = COALESCE(?, enabled),
          updated_at = datetime('now')
        WHERE id = ?`
      )
      .run(
        body.name ?? null,
        body.content ?? null,
        body.placement ?? null,
        body.kind ?? null,
        body.enabled === undefined ? null : body.enabled ? 1 : 0,
        sid
      );
    if (body.enabled !== undefined) {
      getDb()
        .prepare(`UPDATE snippets SET enabled = ? WHERE id = ?`)
        .run(body.enabled ? 1 : 0, sid);
    }
    if (body.content !== undefined) {
      getDb()
        .prepare(`UPDATE snippets SET content = ? WHERE id = ?`)
        .run(body.content, sid);
    }
    if (body.name) {
      getDb().prepare(`UPDATE snippets SET name = ? WHERE id = ?`).run(body.name, sid);
    }
    if (body.placement) {
      getDb()
        .prepare(`UPDATE snippets SET placement = ? WHERE id = ?`)
        .run(body.placement, sid);
    }
    return json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) return error(e.errors[0]?.message || "Invalid");
    return error("Update failed", 500);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const paid = requirePaid(user);
  if (paid) return paid;
  const { id, sid } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);
  getDb()
    .prepare("DELETE FROM snippets WHERE id = ? AND project_id = ?")
    .run(sid, id);
  return json({ ok: true });
}
