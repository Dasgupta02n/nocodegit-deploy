import { v4 as uuid } from "uuid";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getProjectForUser } from "@/lib/projects";
import { encrypt } from "@/lib/crypto";
import { error, json, unauthorized } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);
  const rows = getDb()
    .prepare(
      "SELECT id, key, visibility, updated_at FROM env_vars WHERE project_id = ? ORDER BY key"
    )
    .all(id);
  return json({ env: rows });
}

const upsertSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[A-Za-z_][A-Za-z0-9_]*$/),
  value: z.string().max(8000),
  visibility: z.enum(["secret", "public"]).default("secret"),
});

export async function POST(req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);
  try {
    const body = upsertSchema.parse(await req.json());
    const existing = getDb()
      .prepare("SELECT id FROM env_vars WHERE project_id = ? AND key = ?")
      .get(id, body.key) as { id: string } | undefined;
    const value_enc = encrypt(body.value);
    if (existing) {
      getDb()
        .prepare(
          `UPDATE env_vars SET value_enc = ?, visibility = ?, updated_at = datetime('now') WHERE id = ?`
        )
        .run(value_enc, body.visibility, existing.id);
      return json({ id: existing.id, key: body.key, visibility: body.visibility });
    }
    const rowId = uuid();
    getDb()
      .prepare(
        `INSERT INTO env_vars (id, project_id, key, value_enc, visibility) VALUES (?, ?, ?, ?, ?)`
      )
      .run(rowId, id, body.key, value_enc, body.visibility);
    return json({ id: rowId, key: body.key, visibility: body.visibility }, 201);
  } catch (e) {
    if (e instanceof z.ZodError) return error(e.errors[0]?.message || "Invalid");
    return error("Save env failed", 500);
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);
  const key = new URL(req.url).searchParams.get("key");
  if (!key) return error("key required");
  getDb()
    .prepare("DELETE FROM env_vars WHERE project_id = ? AND key = ?")
    .run(id, key);
  return json({ ok: true });
}
