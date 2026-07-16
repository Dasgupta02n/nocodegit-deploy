import crypto from "crypto";
import { v4 as uuid } from "uuid";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { hashToken } from "@/lib/crypto";
import { error, json, unauthorized } from "@/lib/api";

/** Create a tray/agent API token (shown once). */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  let name = "Tray";
  try {
    const body = await req.json();
    if (body?.name) name = String(body.name).slice(0, 40);
  } catch {
    /* empty */
  }
  const raw = `ncg_${crypto.randomBytes(24).toString("hex")}`;
  const id = uuid();
  getDb()
    .prepare(
      `INSERT INTO agent_tokens (id, user_id, token_hash, name) VALUES (?, ?, ?, ?)`
    )
    .run(id, user.id, hashToken(raw), name);
  return json({
    id,
    token: raw,
    name,
    message: "Copy this token now. It will not be shown again.",
  });
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const tokens = getDb()
    .prepare(
      `SELECT id, name, created_at, last_used_at FROM agent_tokens WHERE user_id = ? ORDER BY created_at DESC`
    )
    .all(user.id);
  return json({ tokens });
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return error("id required");
  getDb()
    .prepare("DELETE FROM agent_tokens WHERE id = ? AND user_id = ?")
    .run(id, user.id);
  return json({ ok: true });
}
