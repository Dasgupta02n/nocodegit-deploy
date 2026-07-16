import { userFromAgentToken } from "@/lib/agent-auth";
import { listProjects } from "@/lib/projects";
import { json, unauthorized } from "@/lib/api";

export async function GET(req: Request) {
  const user = userFromAgentToken(req.headers.get("authorization"));
  if (!user) return unauthorized();
  return json({ projects: listProjects(user.id) });
}
