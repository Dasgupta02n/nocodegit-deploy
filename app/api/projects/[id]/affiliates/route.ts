import { v4 as uuid } from "uuid";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getProjectForUser } from "@/lib/projects";
import { isPaidPlan } from "@/lib/config";
import { error, json, unauthorized, slugify } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  label: z.string().min(1).max(80),
  slug: z.string().max(60).optional(),
  destination_url: z.string().url(),
  mode: z.enum(["replace", "redirect", "both"]).default("replace"),
  find_url_on_create: z.string().url().optional().nullable(),
  enabled: z.boolean().default(true),
});

export async function POST(req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (!isPaidPlan(user.plan)) {
    return error(
      "Ads & affiliate editor is a Pro feature (₹500/mo). Free users can deploy code that already includes affiliate links.",
      403
    );
  }
  const { id } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);
  try {
    const body = schema.parse(await req.json());
    const aid = uuid();
    const slug = body.slug || slugify(body.label);
    getDb()
      .prepare(
        `INSERT INTO affiliate_links (id, project_id, label, slug, destination_url, mode, find_url_on_create, enabled)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        aid,
        id,
        body.label,
        slug,
        body.destination_url,
        body.mode,
        body.find_url_on_create || null,
        body.enabled ? 1 : 0
      );
    return json({ id: aid, slug }, 201);
  } catch (e) {
    if (e instanceof z.ZodError) return error(e.errors[0]?.message || "Invalid");
    return error("Could not create affiliate link", 400);
  }
}
