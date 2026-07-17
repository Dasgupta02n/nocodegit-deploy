import { getSessionUser } from "@/lib/auth";
import { getProjectForUser } from "@/lib/projects";
import { getDb } from "@/lib/db";
import { listSnapshotEntries } from "@/lib/storage";
import { error, json, unauthorized } from "@/lib/api";

type Ctx = { params: Promise<{ id: string; sid: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id, sid } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);
  const row = getDb()
    .prepare("SELECT id, label, size_bytes, created_at FROM saves WHERE id = ? AND project_id = ?")
    .get(sid, id);
  if (!row) return error("Save not found", 404);
  const entries = listSnapshotEntries(id, sid, 100);
  return json({ save: row, entries });
}
