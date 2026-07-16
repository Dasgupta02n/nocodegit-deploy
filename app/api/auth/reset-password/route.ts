import { z } from "zod";
import { getDb } from "@/lib/db";
import { hashToken } from "@/lib/crypto";
import { hashPassword } from "@/lib/auth";
import { error, json } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  token: z.string().min(20),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  const rl = rateLimit(`reset:${clientIp(req)}`, 10, 60 * 60_000);
  if (!rl.ok) return error(`Too many attempts. Retry in ${rl.retryAfterSec}s`, 429);

  try {
    const body = schema.parse(await req.json());
    const row = getDb()
      .prepare(
        `SELECT * FROM password_reset_tokens WHERE token_hash = ? AND used_at IS NULL`
      )
      .get(hashToken(body.token)) as
      | {
          id: string;
          user_id: string;
          expires_at: string;
        }
      | undefined;

    if (!row) return error("Invalid or used token", 400);
    if (new Date(row.expires_at).getTime() < Date.now()) {
      return error("Token expired", 400);
    }

    const password_hash = await hashPassword(body.password);
    getDb()
      .prepare(
        `UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`
      )
      .run(password_hash, row.user_id);
    getDb()
      .prepare(
        `UPDATE password_reset_tokens SET used_at = datetime('now') WHERE id = ?`
      )
      .run(row.id);

    return json({ ok: true, message: "Password updated. You can log in." });
  } catch (e) {
    if (e instanceof z.ZodError) return error(e.errors[0]?.message || "Invalid");
    return error("Reset failed", 500);
  }
}
