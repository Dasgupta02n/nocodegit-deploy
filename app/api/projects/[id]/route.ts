import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getProjectForUser } from "@/lib/projects";
import { error, json, unauthorized } from "@/lib/api";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const project = getProjectForUser(id, user.id);
  if (!project) return error("Not found", 404);
  return json({ project });
}

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  live_url: z.string().url().nullable().optional(),
  folder_hint: z.string().max(500).nullable().optional(),
});

export async function PATCH(req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const project = getProjectForUser(id, user.id);
  if (!project) return error("Not found", 404);
  try {
    const body = patchSchema.parse(await req.json());
    getDb()
      .prepare(
        `UPDATE projects SET
          name = COALESCE(?, name),
          live_url = COALESCE(?, live_url),
          folder_hint = COALESCE(?, folder_hint),
          updated_at = datetime('now')
        WHERE id = ?`
      )
      .run(
        body.name ?? null,
        body.live_url === undefined ? null : body.live_url,
        body.folder_hint === undefined ? null : body.folder_hint,
        id
      );
    // Fix COALESCE issue for explicit null live_url
    if (body.live_url !== undefined) {
      getDb()
        .prepare(
          `UPDATE projects SET live_url = ?, updated_at = datetime('now') WHERE id = ?`
        )
        .run(body.live_url, id);
    }
    if (body.name) {
      getDb()
        .prepare(
          `UPDATE projects SET name = ?, updated_at = datetime('now') WHERE id = ?`
        )
        .run(body.name, id);
    }
    const updated = getProjectForUser(id, user.id);
    return json({ project: updated });
  } catch (e) {
    if (e instanceof z.ZodError) return error(e.errors[0]?.message || "Invalid");
    return error("Update failed", 500);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const project = getProjectForUser(id, user.id);
  if (!project) return error("Not found", 404);
  getDb().prepare("DELETE FROM projects WHERE id = ?").run(id);
  return json({ ok: true });
}
