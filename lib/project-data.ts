import { getDb } from "./db";
import { getProjectForUser } from "./projects";

export function loadProjectBundle(projectId: string, userId: string) {
  const project = getProjectForUser(projectId, userId);
  if (!project) return null;

  const saves = getDb()
    .prepare(
      "SELECT id, label, size_bytes, created_at FROM saves WHERE project_id = ? ORDER BY created_at DESC"
    )
    .all(projectId) as {
    id: string;
    label: string | null;
    size_bytes: number;
    created_at: string;
  }[];

  const hosting = getDb()
    .prepare(
      "SELECT provider, display_name, target_json, last_test_status, last_test_message FROM hosting_connections WHERE project_id = ?"
    )
    .get(projectId) as
    | {
        provider: string;
        display_name: string | null;
        target_json: string;
        last_test_status: string | null;
        last_test_message: string | null;
      }
    | undefined;

  const env = getDb()
    .prepare(
      "SELECT id, key, visibility, updated_at FROM env_vars WHERE project_id = ? ORDER BY key"
    )
    .all(projectId) as {
    id: string;
    key: string;
    visibility: string;
    updated_at?: string;
  }[];

  const snippets = getDb()
    .prepare(
      "SELECT id, slug, name, kind, placement, content, enabled FROM snippets WHERE project_id = ?"
    )
    .all(projectId) as {
    id: string;
    slug: string;
    name: string;
    kind: string;
    placement: string;
    content: string;
    enabled: number;
  }[];

  const affiliates = getDb()
    .prepare(
      "SELECT id, label, slug, destination_url, mode, enabled FROM affiliate_links WHERE project_id = ?"
    )
    .all(projectId) as {
    id: string;
    label: string;
    slug: string;
    destination_url: string;
    mode: string;
    enabled: number;
  }[];

  const deploys = getDb()
    .prepare(
      "SELECT id, status, live_url, created_at, log FROM deploys WHERE project_id = ? ORDER BY created_at DESC LIMIT 20"
    )
    .all(projectId) as {
    id: string;
    status: string;
    live_url: string | null;
    created_at: string;
    log: string;
  }[];

  const dbRow = getDb()
    .prepare(
      "SELECT mode, connection_enc FROM project_database WHERE project_id = ?"
    )
    .get(projectId) as
    | { mode: string; connection_enc: string | null }
    | undefined;

  return {
    project,
    saves,
    hosting: hosting || null,
    env,
    snippets,
    affiliates,
    deploys,
    database: dbRow
      ? {
          mode: dbRow.mode,
          has_connection: Boolean(dbRow.connection_enc),
        }
      : { mode: "none", has_connection: false },
  };
}

export function shipReadiness(
  bundle: NonNullable<ReturnType<typeof loadProjectBundle>>
) {
  const hostingOk = Boolean(bundle.hosting);
  const dbOk =
    bundle.database.mode === "none" || bundle.database.has_connection;
  return {
    code: bundle.saves.length > 0,
    hosting: hostingOk,
    database: dbOk,
    environment: true,
    snippets: true,
    domain: Boolean(bundle.project.live_url),
    canDeploy: bundle.saves.length > 0 && hostingOk,
  };
}
