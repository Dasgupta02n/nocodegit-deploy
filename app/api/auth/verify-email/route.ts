import { createHash, randomBytes } from "crypto";
import { v4 as uuid } from "uuid";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { config } from "@/lib/config";
import { error, json, unauthorized } from "@/lib/api";

function hash(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

/** POST: send verification email to current user */
export async function POST() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.email_verified) return json({ ok: true, already: true });

  const raw = randomBytes(32).toString("hex");
  const id = uuid();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  getDb()
    .prepare(
      `INSERT INTO email_verify_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)`
    )
    .run(id, user.id, hash(raw), expires);

  const verifyUrl = `${config.appUrl}/verify-email?token=${raw}`;
  try {
    const { sendVerifyEmail } = await import("@/lib/email");
    await sendVerifyEmail(user.email, verifyUrl);
  } catch (e) {
    console.warn("[verify email]", e);
    return error("Could not send verification email", 502);
  }
  return json({ ok: true });
}

/** GET ?token= : confirm email */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return error("Missing token", 400);
  const row = getDb()
    .prepare(
      `SELECT * FROM email_verify_tokens WHERE token_hash = ? AND used_at IS NULL`
    )
    .get(hash(token)) as
    | { id: string; user_id: string; expires_at: string }
    | undefined;
  if (!row) return error("Invalid token", 400);
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return error("Token expired", 400);
  }
  getDb()
    .prepare(
      `UPDATE users SET email_verified = 1, updated_at = datetime('now') WHERE id = ?`
    )
    .run(row.user_id);
  getDb()
    .prepare(
      `UPDATE email_verify_tokens SET used_at = datetime('now') WHERE id = ?`
    )
    .run(row.id);
  return json({ ok: true });
}
