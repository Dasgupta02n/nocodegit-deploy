import { getSessionUser } from "@/lib/auth";
import { json, unauthorized } from "@/lib/api";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  return json({ id: user.id, email: user.email, name: user.name });
}
