import { v4 as uuid } from "uuid";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getProjectForUser } from "@/lib/projects";
import { isPaidPlan } from "@/lib/config";
import { error, json, unauthorized, slugify } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

function requirePaid(user: { plan?: string }) {
  if (!isPaidPlan(user.plan)) {
    return error(
      "Ads & affiliate editor is a Pro feature ($5/mo). Free users can still deploy code that already contains ads/links.",
      403
    );
  }
  return null;
}

export async function GET(_req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const paid = requirePaid(user);
  if (paid) return paid;
  const { id } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);
  const snippets = getDb()
    .prepare(
      "SELECT id, slug, name, kind, placement, content, enabled, updated_at FROM snippets WHERE project_id = ? ORDER BY name"
    )
    .all(id);
  const affiliates = getDb()
    .prepare(
      "SELECT id, label, slug, destination_url, mode, enabled, updated_at FROM affiliate_links WHERE project_id = ? ORDER BY label"
    )
    .all(id);
  return json({ snippets, affiliates });
}

const snippetSchema = z.object({
  name: z.string().min(1).max(80),
  slug: z.string().max(60).optional(),
  kind: z.string().max(40).default("custom"),
  placement: z.enum(["head", "body_start", "body_end", "marker"]).default("marker"),
  content: z.string().max(100_000).default(""),
  enabled: z.boolean().default(true),
});

export async function POST(req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const paid = requirePaid(user);
  if (paid) return paid;
  const { id } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);
  try {
    const body = snippetSchema.parse(await req.json());
    const sid = uuid();
    const slug = body.slug || slugify(body.name);
    getDb()
      .prepare(
        `INSERT INTO snippets (id, project_id, slug, name, kind, placement, content, enabled)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        sid,
        id,
        slug,
        body.name,
        body.kind,
        body.placement,
        body.content,
        body.enabled ? 1 : 0
      );
    return json({ id: sid, slug }, 201);
  } catch (e) {
    if (e instanceof z.ZodError) return error(e.errors[0]?.message || "Invalid");
    return error("Could not create snippet (slug unique?)", 400);
  }
}
