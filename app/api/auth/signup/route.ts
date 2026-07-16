import { z } from "zod";
import { createSession, createUser, findUserByEmail } from "@/lib/auth";
import { error, json } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().max(80).optional(),
});

export async function POST(req: Request) {
  const rl = rateLimit(`signup:${clientIp(req)}`, 10, 60 * 60_000);
  if (!rl.ok) return error(`Too many signups. Retry in ${rl.retryAfterSec}s`, 429);
  try {
    const body = schema.parse(await req.json());
    if (findUserByEmail(body.email)) {
      return error("Email already registered", 409);
    }
    const user = createUser(body.email, body.password, body.name);
    await createSession(user);
    try {
      const { sendWelcomeEmail } = await import("@/lib/email");
      await sendWelcomeEmail(user.email, user.name);
    } catch (mailErr) {
      console.warn("[welcome email]", mailErr);
    }
    return json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (e) {
    if (e instanceof z.ZodError) return error(e.errors[0]?.message || "Invalid");
    return error("Signup failed", 500);
  }
}
