import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getProjectForUser } from "@/lib/projects";
import { deleteSnapshot, readSnapshot } from "@/lib/storage";
import { error, json, unauthorized } from "@/lib/api";

type Ctx = { params: Promise<{ id: string; sid: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id, sid } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);
  const row = getDb()
    .prepare(
      "SELECT id, label, size_bytes FROM saves WHERE id = ? AND project_id = ?"
    )
    .get(sid, id) as
    | { id: string; label: string | null; size_bytes: number }
    | undefined;
  if (!row) return error("Save not found", 404);
  try {
    const buf = readSnapshot(id, sid);
    const filename = `${(row.label || "save").replace(/[^\w.\-]+/g, "_").slice(0, 80)}.zip`;
    return new Response(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buf.byteLength),
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return error("Snapshot file not found", 404);
  }
}

const patchSchema = z.object({
  label: z.string().min(1).max(120),
});

export async function PATCH(req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id, sid } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);
  const row = getDb()
    .prepare("SELECT id FROM saves WHERE id = ? AND project_id = ?")
    .get(sid, id);
  if (!row) return error("Save not found", 404);
  try {
    const body = patchSchema.parse(await req.json());
    getDb()
      .prepare("UPDATE saves SET label = ? WHERE id = ?")
      .run(body.label, sid);
    getDb()
      .prepare(`UPDATE projects SET updated_at = datetime('now') WHERE id = ?`)
      .run(id);
    return json({ ok: true, id: sid, label: body.label });
  } catch (e) {
    if (e instanceof z.ZodError) return error(e.errors[0]?.message || "Invalid");
    return error("Rename failed", 500);
  }
}

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
