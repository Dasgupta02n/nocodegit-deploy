import { v4 as uuid } from "uuid";
import { userFromAgentToken } from "@/lib/agent-auth";
import { getDb } from "@/lib/db";
import { getProjectForUser } from "@/lib/projects";
import { writeSnapshot } from "@/lib/storage";
import { maxSnapshotBytesForPlan } from "@/lib/config";
import { error, json, unauthorized } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

/** Tray: POST multipart file zip */
export async function POST(req: Request, ctx: Ctx) {
  const user = userFromAgentToken(req.headers.get("authorization"));
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);

  try {
    const form = await req.formData();
    const file = form.get("file");
    const label = String(form.get("label") || "Tray save").slice(0, 120);
    if (!file || typeof file === "string") {
      return error("file required");
    }
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
      .prepare(`UPDATE projects SET updated_at = datetime('now') WHERE id = ?`)
      .run(id);
    return json({ save: { id: saveId, size_bytes: size, label } }, 201);
  } catch (e) {
    return error(e instanceof Error ? e.message : "Save failed", 400);
  }
}
