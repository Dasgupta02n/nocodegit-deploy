import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getProjectForUser } from "@/lib/projects";
import { encrypt } from "@/lib/crypto";
import { testHostingConnection } from "@/lib/deploy";
import { error, json, unauthorized } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);
  const row = getDb()
    .prepare("SELECT * FROM hosting_connections WHERE project_id = ?")
    .get(id) as
    | {
        provider: string;
        display_name: string | null;
        target_json: string;
        last_test_status: string | null;
        last_test_message: string | null;
        updated_at: string;
      }
    | undefined;
  if (!row) return json({ hosting: null });
  return json({
    hosting: {
      provider: row.provider,
      display_name: row.display_name,
      target_json: row.target_json,
      last_test_status: row.last_test_status,
      last_test_message: row.last_test_message,
      updated_at: row.updated_at,
      has_credentials: true,
    },
  });
}

const schema = z.object({
  provider: z.enum([
    "hook",
    "vercel",
    "netlify",
    "sftp",
    "railway",
    "render",
    "cloudflare",
    "custom",
  ]),
  display_name: z.string().max(80).optional(),
  credentials: z.string().optional().default(""),
  target_json: z.string().default("{}"),
  test: z.boolean().optional(),
});

export async function PUT(req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);
  try {
    const body = schema.parse(await req.json());
    const existing = getDb()
      .prepare(
        "SELECT credentials_enc FROM hosting_connections WHERE project_id = ?"
      )
      .get(id) as { credentials_enc: string } | undefined;
    if (!body.credentials && !existing) {
      return error("Credentials required for new hosting connection");
    }
    const { decrypt } = await import("@/lib/crypto");
    const plainCreds =
      body.credentials ||
      (existing ? decrypt(existing.credentials_enc) : "");
    let last_test_status: string | null = null;
    let last_test_message: string | null = null;
    if (body.test !== false) {
      const t = await testHostingConnection(
        body.provider,
        plainCreds,
        body.target_json
      );
      last_test_status = t.ok ? "ok" : "fail";
      last_test_message = t.message;
    }
    const enc = body.credentials
      ? encrypt(body.credentials)
      : existing!.credentials_enc;
    getDb()
      .prepare(
        `INSERT INTO hosting_connections (project_id, provider, display_name, credentials_enc, target_json, last_test_status, last_test_message, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
         ON CONFLICT(project_id) DO UPDATE SET
           provider = excluded.provider,
           display_name = excluded.display_name,
           credentials_enc = excluded.credentials_enc,
           target_json = excluded.target_json,
           last_test_status = excluded.last_test_status,
           last_test_message = excluded.last_test_message,
           updated_at = datetime('now')`
      )
      .run(
        id,
        body.provider,
        body.display_name || null,
        enc,
        body.target_json,
        last_test_status,
        last_test_message
      );
    return json({
      ok: true,
      last_test_status,
      last_test_message,
    });
  } catch (e) {
    if (e instanceof z.ZodError) return error(e.errors[0]?.message || "Invalid");
    return error("Save hosting failed", 500);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);
  getDb().prepare("DELETE FROM hosting_connections WHERE project_id = ?").run(id);
  return json({ ok: true });
}
