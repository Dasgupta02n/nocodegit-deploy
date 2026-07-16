import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getProjectForUser } from "@/lib/projects";
import { deleteSnapshot } from "@/lib/storage";
import { error, json, unauthorized } from "@/lib/api";

type Ctx = { params: Promise<{ id: string; sid: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id, sid } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);
  const row = getDb()
    .prepare("SELECT id FROM saves WHERE id = ? AND project_id = ?")
    .get(sid, id);
  if (!row) return error("Save not found", 404);
  try {
    deleteSnapshot(id, sid);
  } catch {
    /* file may already be gone */
  }
  getDb().prepare("DELETE FROM saves WHERE id = ?").run(sid);
  return json({ ok: true });
}
