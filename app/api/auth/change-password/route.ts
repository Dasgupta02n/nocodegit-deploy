import { z } from "zod";
import { getDb } from "@/lib/db";
import {
  getSessionUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { error, json, unauthorized } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const rl = rateLimit(`change-pw:${user.id}:${clientIp(req)}`, 10, 60 * 60_000);
  if (!rl.ok) {
    return error(`Too many attempts. Retry in ${rl.retryAfterSec}s`, 429);
  }

  try {
    const body = schema.parse(await req.json());
    const ok = await verifyPassword(body.currentPassword, user.password_hash);
    if (!ok) return error("Current password is incorrect", 400);

    if (body.currentPassword === body.newPassword) {
      return error("New password must be different from the current password", 400);
    }

    const password_hash = await hashPassword(body.newPassword);
    getDb()
      .prepare(
        `UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`
      )
      .run(password_hash, user.id);

    return json({ ok: true, message: "Password updated." });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return error(e.errors[0]?.message || "Invalid input");
    }
    return error("Password change failed", 500);
  }
}
