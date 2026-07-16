import { v4 as uuid } from "uuid";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { error, json, slugify, unauthorized } from "@/lib/api";
import { listProjects } from "@/lib/projects";
import { projectLimitForPlan } from "@/lib/config";
// plan limits: free vs pro

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  return json({ projects: listProjects(user.id) });
}

const createSchema = z.object({
  name: z.string().min(1).max(80),
  folder_hint: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  try {
    const body = createSchema.parse(await req.json());
    const existing = listProjects(user.id);
    const limit = projectLimitForPlan(user.plan || "free");
    if (existing.length >= limit) {
      return error(
        `Project limit (${limit}) reached for plan "${user.plan || "free"}". Upgrade in Billing.`,
        403
      );
    }
    const id = uuid();
    let slug = slugify(body.name);
    const db = getDb();
    const clash = db
      .prepare("SELECT id FROM projects WHERE user_id = ? AND slug = ?")
      .get(user.id, slug);
    if (clash) slug = `${slug}-${id.slice(0, 6)}`;
    db.prepare(
      `INSERT INTO projects (id, user_id, name, slug, folder_hint) VALUES (?, ?, ?, ?, ?)`
    ).run(id, user.id, body.name, slug, body.folder_hint || null);
    db.prepare(
      `INSERT INTO project_database (project_id, mode) VALUES (?, 'none')`
    ).run(id);
    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(id);
    return json({ project }, 201);
  } catch (e) {
    if (e instanceof z.ZodError) return error(e.errors[0]?.message || "Invalid");
    return error("Could not create project", 500);
  }
}
