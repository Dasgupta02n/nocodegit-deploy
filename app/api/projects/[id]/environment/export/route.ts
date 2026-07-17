import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getProjectForUser } from "@/lib/projects";
import { decrypt } from "@/lib/crypto";
import { error, unauthorized } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Owner-only export of decrypted KEY=value lines for .env download.
 * Session auth required; project must belong to the authenticated user.
 */
export async function GET(_req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const project = getProjectForUser(id, user.id);
  if (!project) return error("Not found", 404);

  const rows = getDb()
    .prepare(
      "SELECT key, value_enc FROM env_vars WHERE project_id = ? ORDER BY key"
    )
    .all(id) as { key: string; value_enc: string }[];

  const lines: string[] = [
    `# Exported from NoCodeGit — ${project.name || id}`,
    `# ${new Date().toISOString()}`,
    `# Keep this file private. Values are decrypted for the project owner only.`,
    "",
  ];

  for (const row of rows) {
    try {
      const value = decrypt(row.value_enc);
      const needsQuotes =
        /[\s#"']/.test(value) || value.includes("\n") || value.includes("=");
      const escaped = value
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n");
      lines.push(
        needsQuotes ? `${row.key}="${escaped}"` : `${row.key}=${value}`
      );
    } catch {
      lines.push(`# ${row.key}=<decrypt_failed>`);
    }
  }

  const body = lines.join("\n") + "\n";
  const filename = `${(project.slug || project.name || "project")
    .replace(/[^\w.\-]+/g, "_")
    .slice(0, 60)}.env`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
