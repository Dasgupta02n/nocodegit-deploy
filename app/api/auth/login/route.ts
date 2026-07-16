import { z } from "zod";
import {
  createSession,
  findUserByEmail,
  verifyPassword,
} from "@/lib/auth";
import { error, json } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const rl = rateLimit(`login:${clientIp(req)}`, 20, 15 * 60_000);
  if (!rl.ok) return error(`Too many attempts. Retry in ${rl.retryAfterSec}s`, 429);
  try {
    const body = schema.parse(await req.json());
    const user = findUserByEmail(body.email);
    if (!user || !(await verifyPassword(body.password, user.password_hash))) {
      return error("Invalid email or password", 401);
    }
    await createSession(user);
    return json({ id: user.id, email: user.email, name: user.name });
  } catch (e) {
    if (e instanceof z.ZodError) return error("Invalid input");
    return error("Login failed", 500);
  }
}
