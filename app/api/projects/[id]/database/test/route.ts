import net from "net";
import { getSessionUser } from "@/lib/auth";
import { getProjectForUser } from "@/lib/projects";
import { getDb } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { error, json, unauthorized } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

function parseDbHostPort(conn: string): { host: string; port: number } | null {
  try {
    // postgres://user:pass@host:5432/db
    const u = new URL(conn.replace(/^postgres(ql)?:/i, "http:"));
    const host = u.hostname;
    const port = Number(u.port || 5432);
    if (!host) return null;
    return { host, port };
  } catch {
    return null;
  }
}

/** Optional TCP reachability check for stored DB connection (no query). */
export async function POST(req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  if (!getProjectForUser(id, user.id)) return error("Not found", 404);

  let connection_string: string | null = null;
  try {
    const body = await req.json();
    if (body?.connection_string) connection_string = String(body.connection_string);
  } catch {
    /* use stored */
  }

  if (!connection_string) {
    const row = getDb()
      .prepare("SELECT mode, connection_enc FROM project_database WHERE project_id = ?")
      .get(id) as { mode: string; connection_enc: string | null } | undefined;
    if (row?.mode === "external" && row.connection_enc) {
      try {
        connection_string = decrypt(row.connection_enc);
      } catch {
        return error("Could not decrypt stored connection", 400);
      }
    }
  }

  if (!connection_string) {
    return error("No connection string to test", 400);
  }

  const hp = parseDbHostPort(connection_string);
  if (!hp) {
    return json({
      ok: false,
      message: "Could not parse host:port from connection string",
    });
  }

  const ok = await new Promise<boolean>((resolve) => {
    const socket = net.connect({ host: hp.host, port: hp.port });
    const t = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, 4000);
    socket.on("connect", () => {
      clearTimeout(t);
      socket.end();
      resolve(true);
    });
    socket.on("error", () => {
      clearTimeout(t);
      resolve(false);
    });
  });

  return json({
    ok,
    message: ok
      ? `TCP reachability OK for ${hp.host}:${hp.port} (no SQL executed)`
      : `Could not reach ${hp.host}:${hp.port} from this server`,
    host: hp.host,
    port: hp.port,
  });
}
