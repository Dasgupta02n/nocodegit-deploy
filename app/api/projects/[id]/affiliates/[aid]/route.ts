import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getProjectForUser } from "@/lib/projects";
import { isPaidPlan } from "@/lib/config";
import { error, json, unauthorized } from "@/lib/api";

type Ctx = { params: Promise<{ id: string; aid: string }> };

const patchSchema = z.object({
  label: z.string().min(1).max(80).optional(),
  destination_url: z.string().url().optional(),
  mode: z.enum(["replace", "redirect", "both"]).optional(),
  enabled: z.boolean().optional(),
});

export async function PATCH(req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (!isPaidPlan(user.plan)) {
    return error("Ads & affiliate editor is Pro only (₹500/mo)", 403);
  }
  const { id, aid } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);
  try {
    const body = patchSchema.parse(await req.json());
    const row = getDb()
      .prepare("SELECT id FROM affiliate_links WHERE id = ? AND project_id = ?")
      .get(aid, id);
    if (!row) return error("Not found", 404);
    if (body.label) {
      getDb()
        .prepare(`UPDATE affiliate_links SET label = ?, updated_at = datetime('now') WHERE id = ?`)
        .run(body.label, aid);
    }
    if (body.destination_url) {
      getDb()
        .prepare(
          `UPDATE affiliate_links SET destination_url = ?, updated_at = datetime('now') WHERE id = ?`
        )
        .run(body.destination_url, aid);
    }
    if (body.mode) {
      getDb()
        .prepare(
          `UPDATE affiliate_links SET mode = ?, updated_at = datetime('now') WHERE id = ?`
        )
        .run(body.mode, aid);
    }
    if (body.enabled !== undefined) {
      getDb()
        .prepare(
          `UPDATE affiliate_links SET enabled = ?, updated_at = datetime('now') WHERE id = ?`
        )
        .run(body.enabled ? 1 : 0, aid);
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
  if (!isPaidPlan(user.plan)) {
    return error("Ads & affiliate editor is Pro only (₹500/mo)", 403);
  }
  const { id, aid } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);
  getDb()
    .prepare("DELETE FROM affiliate_links WHERE id = ? AND project_id = ?")
    .run(aid, id);
  return json({ ok: true });
}
