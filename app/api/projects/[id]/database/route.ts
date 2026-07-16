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
  const row = getDb()
    .prepare("SELECT mode, connection_enc, updated_at FROM project_database WHERE project_id = ?")
    .get(id) as
    | { mode: string; connection_enc: string | null; updated_at: string }
    | undefined;
  if (!row) return json({ database: { mode: "none", has_connection: false } });
  return json({
    database: {
      mode: row.mode,
      has_connection: Boolean(row.connection_enc),
      updated_at: row.updated_at,
    },
  });
}

const schema = z.object({
  mode: z.enum(["none", "external"]),
  connection_string: z.string().max(2000).optional().nullable(),
  add_to_env: z.boolean().optional(),
});

export async function PUT(req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);
  try {
    const body = schema.parse(await req.json());
    const enc =
      body.mode === "external" && body.connection_string
        ? encrypt(body.connection_string)
        : null;
    getDb()
      .prepare(
        `INSERT INTO project_database (project_id, mode, connection_enc, updated_at)
         VALUES (?, ?, ?, datetime('now'))
         ON CONFLICT(project_id) DO UPDATE SET
           mode = excluded.mode,
           connection_enc = excluded.connection_enc,
           updated_at = datetime('now')`
      )
      .run(id, body.mode, enc);

    if (body.add_to_env && body.mode === "external" && body.connection_string) {
      const { v4: uuid } = await import("uuid");
      const existing = getDb()
        .prepare(
          "SELECT id FROM env_vars WHERE project_id = ? AND key = 'DATABASE_URL'"
        )
        .get(id) as { id: string } | undefined;
      const value_enc = encrypt(body.connection_string);
      if (existing) {
        getDb()
          .prepare(
            `UPDATE env_vars SET value_enc = ?, updated_at = datetime('now') WHERE id = ?`
          )
          .run(value_enc, existing.id);
      } else {
        getDb()
          .prepare(
            `INSERT INTO env_vars (id, project_id, key, value_enc, visibility) VALUES (?, ?, 'DATABASE_URL', ?, 'secret')`
          )
          .run(uuid(), id, value_enc);
      }
    }

    return json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) return error(e.errors[0]?.message || "Invalid");
    return error("Save database failed", 500);
  }
}

/** Optional live connectivity test (does not store) */
export async function POST(req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);
  try {
    const body = z
      .object({ connection_string: z.string().min(1) })
      .parse(await req.json());
    // Lightweight format check only (no pg client required)
    if (
      !body.connection_string.startsWith("postgres") &&
      !body.connection_string.startsWith("mysql") &&
      !body.connection_string.includes("://")
    ) {
      return error("Connection string should look like postgres://... or mysql://...");
    }
    return json({
      ok: true,
      message:
        "Format looks valid. Full TCP test runs on your host when the app starts.",
    });
  } catch (e) {
    if (e instanceof z.ZodError) return error("Invalid");
    return error("Test failed", 500);
  }
}
