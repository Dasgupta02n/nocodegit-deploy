import { getDb, type UserRow } from "./db";
import { hashToken } from "./crypto";

export function userFromAgentToken(authHeader: string | null): UserRow | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const raw = authHeader.slice(7).trim();
  if (!raw) return null;
  const row = getDb()
    .prepare(
      `SELECT u.* FROM agent_tokens t
       JOIN users u ON u.id = t.user_id
       WHERE t.token_hash = ?`
    )
    .get(hashToken(raw)) as UserRow | undefined;
  if (!row) return null;
  getDb()
    .prepare(
      `UPDATE agent_tokens SET last_used_at = datetime('now') WHERE token_hash = ?`
    )
    .run(hashToken(raw));
  return row;
}
