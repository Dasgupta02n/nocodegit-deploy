import { getDb, type ProjectRow } from "./db";

export function getProjectForUser(projectId: string, userId: string) {
  return getDb()
    .prepare("SELECT * FROM projects WHERE id = ? AND user_id = ?")
    .get(projectId, userId) as ProjectRow | undefined;
}

export function listProjects(userId: string) {
  return getDb()
    .prepare(
      "SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC"
    )
    .all(userId) as ProjectRow[];
}
