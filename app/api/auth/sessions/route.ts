import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { error, json, unauthorized } from "@/lib/api";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const rows = getDb()
    .prepare(
      `SELECT id, user_agent, ip, created_at, last_seen_at, revoked_at
       FROM user_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`
    )
    .all(user.id);
  return json({ sessions: rows });
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return error("id required");
  getDb()
    .prepare(
      `UPDATE user_sessions SET revoked_at = datetime('now') WHERE id = ? AND user_id = ?`
    )
    .run(id, user.id);
  return json({ ok: true });
}
