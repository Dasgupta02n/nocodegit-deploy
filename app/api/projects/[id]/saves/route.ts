import { v4 as uuid } from "uuid";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getProjectForUser } from "@/lib/projects";
import { writeSnapshot } from "@/lib/storage";
import { maxSnapshotBytesForPlan } from "@/lib/config";
import { error, json, unauthorized } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);
  const saves = getDb()
    .prepare(
      "SELECT id, project_id, label, size_bytes, created_at FROM saves WHERE project_id = ? ORDER BY created_at DESC"
    )
    .all(id);
  return json({ saves });
}

export async function POST(req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);

  try {
    const form = await req.formData();
    const file = form.get("file");
    const label = String(form.get("label") || "").slice(0, 120) || null;
    if (!(file instanceof File)) return error("file required (zip)");
    const buf = Buffer.from(await file.arrayBuffer());
    const saveId = uuid();
    const maxBytes = maxSnapshotBytesForPlan(user.plan);
    const { size, storageKey } = writeSnapshot(id, saveId, buf, maxBytes);
    getDb()
      .prepare(
        `INSERT INTO saves (id, project_id, label, storage_key, size_bytes) VALUES (?, ?, ?, ?, ?)`
      )
      .run(saveId, id, label, storageKey, size);
    getDb()
      .prepare(
        `UPDATE projects SET updated_at = datetime('now') WHERE id = ?`
      )
      .run(id);
    return json(
      {
        save: {
          id: saveId,
          project_id: id,
          label,
          size_bytes: size,
          created_at: new Date().toISOString(),
        },
      },
      201
    );
  } catch (e) {
    return error(e instanceof Error ? e.message : "Save failed", 400);
  }
}
