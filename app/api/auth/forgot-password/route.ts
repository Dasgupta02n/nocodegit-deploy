import crypto from "crypto";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { findUserByEmail } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { hashToken } from "@/lib/crypto";
import { config } from "@/lib/config";
import { sendPasswordResetEmail } from "@/lib/email";
import { error, json } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const rl = rateLimit(`forgot:${clientIp(req)}`, 5, 60 * 60_000);
  if (!rl.ok) return error(`Too many requests. Retry in ${rl.retryAfterSec}s`, 429);

  try {
    const body = schema.parse(await req.json());
    const user = findUserByEmail(body.email);
    const generic = {
      ok: true,
      message: "If that email exists, a reset link was sent.",
    };
    if (!user) return json(generic);

    const raw = crypto.randomBytes(32).toString("hex");
    const id = uuid();
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    getDb()
      .prepare(
        `INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)`
      )
      .run(id, user.id, hashToken(raw), expires);

    const resetUrl = `${config.appUrl}/reset-password?token=${raw}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (e) {
      console.error("[password-reset email failed]", e);
      // Still return generic; include dev URL when email provider is not configured
      if (process.env.NODE_ENV === "development" || !config.emailEnabled) {
        return json({
          ...generic,
          reset_url: resetUrl,
          warning:
            "Email not sent via Resend (missing RESEND_API_KEY or send failed). Use reset_url in development.",
        });
      }
      return error("Could not send email. Try again later.", 502);
    }

    if (process.env.NODE_ENV === "development" && !config.emailEnabled) {
      return json({ ...generic, reset_url: resetUrl, dev_only: true });
    }
    return json(generic);
  } catch (e) {
    if (e instanceof z.ZodError) return error("Invalid email");
    return error("Request failed", 500);
  }
}
