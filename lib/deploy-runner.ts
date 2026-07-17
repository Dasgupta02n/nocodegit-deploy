/**
 * Shared deploy pipeline used by web session + tray agent.
 */
import fs from "fs";
import os from "os";
import path from "path";
import { execSync } from "child_process";
import { v4 as uuid } from "uuid";
import { getDb } from "./db";
import { getProjectForUser } from "./projects";
import { readSnapshot, readSnapshotAsync } from "./storage";
import { applySnippets } from "./snippets-apply";
import { runDeploy, type HostingConfig } from "./deploy";
import { pushEnvToHost } from "./env-push";
import { decrypt } from "./crypto";

export type DeployOutcome = {
  deployId: string;
  status: "success" | "failed";
  log: string;
  live_url: string | null;
  provider_ref?: string;
};

function extractZip(zipPath: string, extractDir: string) {
  if (process.platform === "win32") {
    execSync(
      `powershell -NoProfile -Command "Expand-Archive -Path '${zipPath.replace(/'/g, "''")}' -DestinationPath '${extractDir.replace(/'/g, "''")}' -Force"`,
      { stdio: "pipe" }
    );
  } else {
    execSync(`unzip -q -o "${zipPath}" -d "${extractDir}"`, { stdio: "pipe" });
  }
}

function makeZip(extractDir: string, outZip: string) {
  if (process.platform === "win32") {
    execSync(
      `powershell -NoProfile -Command "Compress-Archive -Path '${extractDir.replace(/'/g, "''")}\\*' -DestinationPath '${outZip.replace(/'/g, "''")}' -Force"`,
      { stdio: "pipe" }
    );
  } else {
    execSync(`cd "${extractDir}" && zip -r "${outZip}" .`, { stdio: "pipe" });
  }
}

export async function executeProjectDeploy(
  projectId: string,
  userId: string,
  saveId?: string
): Promise<DeployOutcome> {
  const project = getProjectForUser(projectId, userId);
  if (!project) throw new Error("Project not found");

  const hosting = getDb()
    .prepare("SELECT * FROM hosting_connections WHERE project_id = ?")
    .get(projectId) as HostingConfig | undefined;
  if (!hosting) throw new Error("Connect hosting first (Settings → Hosting)");

  let resolvedSave = saveId;
  if (!resolvedSave) {
    const latest = getDb()
      .prepare(
        "SELECT id FROM saves WHERE project_id = ? ORDER BY created_at DESC LIMIT 1"
      )
      .get(projectId) as { id: string } | undefined;
    if (!latest) throw new Error("No saves yet — upload a ZIP save first");
    resolvedSave = latest.id;
  }

  const deployId = uuid();
  const logs: string[] = [];
  const persistLog = (line?: string) => {
    if (line) logs.push(line);
    try {
      getDb()
        .prepare(`UPDATE deploys SET log = ?, status = 'running' WHERE id = ?`)
        .run(logs.join("\n"), deployId);
    } catch {
      /* ignore */
    }
  };

  getDb()
    .prepare(
      `INSERT INTO deploys (id, project_id, save_id, status, log) VALUES (?, ?, ?, 'running', 'Queued…')`
    )
    .run(deployId, projectId, resolvedSave);

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ncg-deploy-"));
  try {
    persistLog("1/6 Loading snapshot…");
    const zipBuf = await readSnapshotAsync(projectId, resolvedSave).catch(() =>
      readSnapshot(projectId, resolvedSave)
    );
    const zipPath = path.join(tmp, "source.zip");
    fs.writeFileSync(zipPath, zipBuf);
    const extractDir = path.join(tmp, "src");
    fs.mkdirSync(extractDir);
    persistLog("2/6 Extracting package…");
    extractZip(zipPath, extractDir);
    persistLog("Extracted snapshot");

    const snippets = getDb()
      .prepare("SELECT * FROM snippets WHERE project_id = ?")
      .all(projectId) as Array<{
      slug: string;
      content: string;
      placement: string;
      enabled: number;
    }>;
    const affiliates = getDb()
      .prepare("SELECT * FROM affiliate_links WHERE project_id = ?")
      .all(projectId) as Array<{
      slug: string;
      destination_url: string;
      last_applied_url: string | null;
      find_url_on_create: string | null;
      mode: string;
      enabled: number;
    }>;

    persistLog("3/6 Applying snippets & affiliates…");
    const applied = applySnippets(
      extractDir,
      snippets.map((s) => ({
        slug: s.slug,
        content: s.content,
        placement: s.placement as "head" | "body_start" | "body_end" | "marker",
        enabled: !!s.enabled,
      })),
      affiliates.map((a) => ({
        slug: a.slug,
        destination_url: a.destination_url,
        last_applied_url: a.last_applied_url,
        find_url_on_create: a.find_url_on_create,
        mode: a.mode as "replace" | "redirect" | "both",
        enabled: !!a.enabled,
      }))
    );
    for (const line of applied.log) persistLog(line);

    for (const [slug, content] of Object.entries(applied.appliedSnippets)) {
      getDb()
        .prepare(
          `UPDATE snippets SET last_applied_content = ?, updated_at = datetime('now') WHERE project_id = ? AND slug = ?`
        )
        .run(content, projectId, slug);
    }
    for (const [slug, url] of Object.entries(applied.appliedAffiliates)) {
      getDb()
        .prepare(
          `UPDATE affiliate_links SET last_applied_url = ?, updated_at = datetime('now') WHERE project_id = ? AND slug = ?`
        )
        .run(url, projectId, slug);
    }

    // Optional: inject DATABASE_URL from project_database into a .env.example note
    const dbRow = getDb()
      .prepare("SELECT mode, connection_enc FROM project_database WHERE project_id = ?")
      .get(projectId) as { mode: string; connection_enc: string | null } | undefined;
    if (dbRow?.mode === "external" && dbRow.connection_enc) {
      try {
        const url = decrypt(dbRow.connection_enc);
        const envPath = path.join(extractDir, ".env.production.local");
        // Do not overwrite if exists; append DATABASE_URL for hosts that read it
        if (!fs.existsSync(envPath)) {
          fs.writeFileSync(envPath, `DATABASE_URL=${url}\n`, "utf8");
          logs.push("Wrote DATABASE_URL into .env.production.local for package");
        }
      } catch {
        logs.push("Could not inject DATABASE_URL into package");
      }
    }

    const outZip = path.join(tmp, "out.zip");
    persistLog("4/6 Packaging artifact…");
    makeZip(extractDir, outZip);
    persistLog("Packaged deploy artifact");

    // Push env to host when possible
    const envRows = getDb()
      .prepare(
        "SELECT key, value_enc, visibility FROM env_vars WHERE project_id = ?"
      )
      .all(projectId) as Array<{
      key: string;
      value_enc: string;
      visibility: string;
    }>;
    persistLog("5/6 Pushing environment to host…");
    const envLog = await pushEnvToHost(
      hosting.provider,
      hosting.credentials_enc,
      hosting.target_json,
      envRows
    );
    for (const line of envLog) persistLog(line);

    persistLog("6/6 Uploading to your host…");
    const result = await runDeploy(outZip, hosting);
    for (const line of result.log) persistLog(line);

    const status = result.ok ? "success" : "failed";
    const live = result.live_url || project.live_url || null;
    getDb()
      .prepare(
        `UPDATE deploys SET status = ?, log = ?, provider_ref = ?, live_url = ?, finished_at = datetime('now') WHERE id = ?`
      )
      .run(
        status,
        logs.join("\n"),
        result.provider_ref || null,
        live,
        deployId
      );
    if (result.ok && live) {
      getDb()
        .prepare(
          `UPDATE projects SET live_url = ?, updated_at = datetime('now') WHERE id = ?`
        )
        .run(live, projectId);
    }

    return {
      deployId,
      status,
      log: logs.join("\n"),
      live_url: live,
      provider_ref: result.provider_ref,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Deploy failed";
    logs.push(msg);
    getDb()
      .prepare(
        `UPDATE deploys SET status = 'failed', log = ?, finished_at = datetime('now') WHERE id = ?`
      )
      .run(logs.join("\n"), deployId);
    return {
      deployId,
      status: "failed",
      log: logs.join("\n"),
      live_url: null,
    };
  } finally {
    try {
      fs.rmSync(tmp, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}
