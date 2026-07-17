/**
 * Deploy adapters — ship package to USER's hosting provider.
 * NoCodeGit never runs the app.
 */
import fs from "fs";
import path from "path";
import { Client as SshClient } from "ssh2";
import { decrypt } from "./crypto";

export type HostingConfig = {
  provider: string;
  credentials_enc: string;
  target_json: string;
};

export type DeployResult = {
  ok: boolean;
  log: string[];
  provider_ref?: string;
  live_url?: string;
};

function parseTarget(json: string): Record<string, string> {
  try {
    return JSON.parse(json || "{}");
  } catch {
    return {};
  }
}

const UA = "NoCodeGitDeploy/1.1";

async function deployHook(
  zipPath: string,
  credentials: string,
  target: Record<string, string>
): Promise<DeployResult> {
  const log: string[] = [];
  const url = target.hook_url || credentials;
  if (!url.startsWith("http")) {
    return { ok: false, log: ["Deploy hook URL missing or invalid"] };
  }
  log.push(`POST deploy hook: ${url.replace(/\/\/([^:]+):[^@]+@/, "//$1:***@")}`);
  const body = fs.readFileSync(zipPath);
  const headers: Record<string, string> = {
    "Content-Type": "application/zip",
    "User-Agent": UA,
  };
  if (target.auth_header) headers.Authorization = target.auth_header;
  if (target.bearer) headers.Authorization = `Bearer ${target.bearer}`;

  const res = await fetch(url, { method: "POST", headers, body });
  const text = await res.text();
  log.push(`Hook status: ${res.status}`);
  log.push(text.slice(0, 2000));
  return {
    ok: res.ok,
    log,
    provider_ref: `hook:${res.status}`,
    live_url: target.live_url,
  };
}

async function deployVercel(
  zipPath: string,
  token: string,
  target: Record<string, string>
): Promise<DeployResult> {
  // Prefer Deploy Hook when present
  if (target.hook_url) {
    return deployHook(zipPath, token, { ...target, bearer: token });
  }

  // Vercel Deployments API: upload as a single file deployment via files API is complex;
  // use v13 deployments with files from zip is not supported directly.
  // Fallback: create deployment from empty + note, OR require hook.
  // Implementation: POST multipart via /v13/deployments with file blobs requires unpacking.
  // We unpack is done in deploy-runner; here we only have zip.
  // Trigger redeploy of existing project via API if project_id set:
  const projectId = target.project_id || target.projectId;
  if (projectId && token) {
    const log: string[] = [];
    log.push(`Vercel: triggering redeploy for project ${projectId}`);
    try {
      // List deployments and redeploy latest, or create deployment hook-style
      const res = await fetch(
        `https://api.vercel.com/v13/deployments?projectId=${encodeURIComponent(projectId)}&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": UA,
          },
        }
      );
      const text = await res.text();
      log.push(`List deployments: ${res.status}`);
      if (!res.ok) {
        log.push(text.slice(0, 1500));
        log.push(
          "Tip: use a Deploy Hook URL in target_json.hook_url for zip-based deploys."
        );
        return { ok: false, log };
      }
      // Create deployment from git if connected — otherwise instruct hook
      const create = await fetch("https://api.vercel.com/v13/deployments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": UA,
        },
        body: JSON.stringify({
          name: target.name || "nocodegit-ship",
          project: projectId,
          target: "production",
        }),
      });
      const ctext = await create.text();
      log.push(`Create deployment: ${create.status}`);
      log.push(ctext.slice(0, 2000));
      let live_url = target.live_url;
      let provider_ref: string | undefined;
      try {
        const j = JSON.parse(ctext);
        live_url = j.url ? `https://${j.url}` : live_url;
        provider_ref = j.id;
      } catch {
        /* ignore */
      }
      if (!create.ok) {
        log.push(
          'For full ZIP ship without Git, set target_json.hook_url to a Vercel Deploy Hook.'
        );
      }
      return {
        ok: create.ok,
        log,
        provider_ref,
        live_url,
      };
    } catch (e) {
      return {
        ok: false,
        log: [
          e instanceof Error ? e.message : "Vercel API error",
          "Set target_json.hook_url for Deploy Hook based shipping.",
        ],
      };
    }
  }

  return {
    ok: false,
    log: [
      "Vercel: set target_json.hook_url (recommended) or project_id + API token.",
      'Example hook: {"hook_url":"https://api.vercel.com/v1/integrations/deploy/...","live_url":"https://app.vercel.app"}',
      'Example API: {"project_id":"prj_...","live_url":"https://app.vercel.app"}',
    ],
  };
}

async function deployNetlify(
  zipPath: string,
  token: string,
  target: Record<string, string>
): Promise<DeployResult> {
  const log: string[] = [];
  const siteId = target.site_id;
  if (!siteId) {
    return { ok: false, log: ["Netlify requires target_json.site_id"] };
  }
  log.push(`Netlify deploy to site ${siteId}`);
  const body = fs.readFileSync(zipPath);
  const res = await fetch(
    `https://api.netlify.com/api/v1/sites/${siteId}/deploys`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/zip",
        "User-Agent": UA,
      },
      body,
    }
  );
  const text = await res.text();
  log.push(`Status ${res.status}`);
  log.push(text.slice(0, 2000));
  let live_url = target.live_url;
  let provider_ref: string | undefined;
  try {
    const j = JSON.parse(text);
    live_url = j.ssl_url || j.deploy_ssl_url || j.url || live_url;
    provider_ref = j.id;
  } catch {
    /* ignore */
  }
  return { ok: res.ok, log, provider_ref, live_url };
}

/** SFTP upload of zip (and optional extract instruction) */
async function deploySftp(
  zipPath: string,
  credentials: string,
  target: Record<string, string>
): Promise<DeployResult> {
  const log: string[] = [];
  // credentials may be password; or JSON in credentials field
  let password = credentials;
  let privateKey: string | undefined;
  try {
    const j = JSON.parse(credentials);
    if (j.password) password = j.password;
    if (j.privateKey) privateKey = j.privateKey;
  } catch {
    /* plain password */
  }

  const host = target.host;
  const username = target.user || target.username;
  const port = Number(target.port || 22);
  const remotePath = target.remote_path || target.path || "/";
  if (!host || !username) {
    return {
      ok: false,
      log: [
        'SFTP requires target_json: {"host":"...","user":"...","port":"22","remote_path":"/var/www","live_url":"https://..."}',
        "Credentials field = password (or JSON {\"password\":\"...\"} / {\"privateKey\":\"...\"})",
      ],
    };
  }

  const remoteFile = path.posix.join(
    remotePath.replace(/\\/g, "/"),
    "nocodegit-deploy.zip"
  );

  log.push(`SFTP ${username}@${host}:${port} → ${remoteFile}`);

  return new Promise((resolve) => {
    const conn = new SshClient();
    const timeout = setTimeout(() => {
      conn.end();
      resolve({ ok: false, log: [...log, "SFTP timeout"] });
    }, 60000);

    conn
      .on("ready", () => {
        conn.sftp((err, sftp) => {
          if (err || !sftp) {
            clearTimeout(timeout);
            conn.end();
            resolve({
              ok: false,
              log: [...log, err?.message || "SFTP session failed"],
            });
            return;
          }
          sftp.fastPut(zipPath, remoteFile, (putErr) => {
            if (putErr) {
              clearTimeout(timeout);
              conn.end();
              resolve({
                ok: false,
                log: [...log, putErr.message],
              });
              return;
            }
            log.push("Uploaded nocodegit-deploy.zip");
            const extractCmd =
              target.extract_cmd ||
              `cd ${remotePath.replace(/\\/g, "/")} && (unzip -o nocodegit-deploy.zip || tar -xf nocodegit-deploy.zip || true)`;
            conn.exec(extractCmd, (execErr, stream) => {
              if (execErr || !stream) {
                clearTimeout(timeout);
                conn.end();
                log.push(
                  "Zip uploaded. Extract manually: unzip -o nocodegit-deploy.zip"
                );
                resolve({
                  ok: true,
                  log,
                  provider_ref: `sftp:${remoteFile}`,
                  live_url: target.live_url,
                });
                return;
              }
              let out = "";
              stream.on("data", (d: Buffer) => {
                out += d.toString();
              });
              stream.stderr.on("data", (d: Buffer) => {
                out += d.toString();
              });
              stream.on("close", (code: number) => {
                clearTimeout(timeout);
                conn.end();
                log.push(`Extract exit ${code}`);
                if (out.trim()) log.push(out.slice(0, 1500));
                resolve({
                  ok: true,
                  log,
                  provider_ref: `sftp:${remoteFile}`,
                  live_url: target.live_url,
                });
              });
            });
          });
        });
      })
      .on("error", (e) => {
        clearTimeout(timeout);
        resolve({ ok: false, log: [...log, e.message] });
      })
      .connect({
        host,
        port,
        username,
        password: privateKey ? undefined : password,
        privateKey,
        readyTimeout: 20000,
      });
  });
}

/** Custom HTTP API: POST zip to target.url with configurable method/headers. */
async function deployCustom(
  zipPath: string,
  credentials: string,
  target: Record<string, string>
): Promise<DeployResult> {
  const log: string[] = [];
  const url = target.url || target.hook_url || credentials;
  if (!url?.startsWith("http")) {
    return {
      ok: false,
      log: [
        'Custom API requires target_json.url (or hook_url).',
        'Optional: method, auth_header, bearer, content_type, live_url, dashboard_url',
      ],
    };
  }
  const method = (target.method || "POST").toUpperCase();
  const headers: Record<string, string> = {
    "User-Agent": UA,
    "Content-Type": target.content_type || "application/zip",
  };
  if (target.auth_header) headers.Authorization = target.auth_header;
  else if (target.bearer) headers.Authorization = `Bearer ${target.bearer}`;
  else if (credentials && !credentials.startsWith("http")) {
    headers.Authorization = `Bearer ${credentials}`;
  }
  // Extra headers as JSON map
  if (target.headers_json) {
    try {
      Object.assign(headers, JSON.parse(target.headers_json));
    } catch {
      log.push("Warning: headers_json invalid JSON");
    }
  }
  log.push(`${method} ${url.replace(/\/\/([^:]+):[^@]+@/, "//$1:***@")}`);
  const body = fs.readFileSync(zipPath);
  const res = await fetch(url, { method, headers, body });
  const text = await res.text();
  log.push(`Status ${res.status}`);
  log.push(text.slice(0, 2000));
  return {
    ok: res.ok,
    log,
    provider_ref: `custom:${res.status}`,
    live_url: target.live_url,
  };
}

export async function runDeploy(
  zipPath: string,
  hosting: HostingConfig
): Promise<DeployResult> {
  const provider = hosting.provider.toLowerCase();
  const credentials = decrypt(hosting.credentials_enc);
  const target = parseTarget(hosting.target_json);

  switch (provider) {
    case "hook":
    case "deploy_hook":
    case "railway":
    case "render":
    case "cloudflare":
      return deployHook(zipPath, credentials, {
        ...target,
        hook_url: target.hook_url || credentials,
      });
    case "vercel":
      return deployVercel(zipPath, credentials, target);
    case "netlify":
      return deployNetlify(zipPath, credentials, target);
    case "sftp":
      return deploySftp(zipPath, credentials, target);
    case "custom":
    case "api":
      return deployCustom(zipPath, credentials, target);
    default:
      return {
        ok: false,
        log: [
          `Unknown provider: ${provider}.`,
          "Use: hook | vercel | netlify | sftp | railway | render | cloudflare | custom",
        ],
      };
  }
}

export async function testHostingConnection(
  provider: string,
  credentialsPlain: string,
  targetJson: string
): Promise<{ ok: boolean; message: string }> {
  const target = parseTarget(targetJson);
  const p = provider.toLowerCase();
  try {
    if (
      p === "hook" ||
      p === "deploy_hook" ||
      p === "railway" ||
      p === "render" ||
      p === "cloudflare"
    ) {
      const url = target.hook_url || credentialsPlain;
      if (!url.startsWith("http")) return { ok: false, message: "Invalid hook URL" };
      return { ok: true, message: "Hook URL format OK (not invoked on test)" };
    }
    if (p === "custom" || p === "api") {
      const url = target.url || target.hook_url || credentialsPlain;
      if (!url.startsWith("http"))
        return { ok: false, message: "Custom API needs target_json.url" };
      return { ok: true, message: "Custom API URL format OK" };
    }
    if (p === "netlify") {
      const res = await fetch("https://api.netlify.com/api/v1/user", {
        headers: { Authorization: `Bearer ${credentialsPlain}` },
      });
      if (!res.ok) return { ok: false, message: `Netlify auth failed: ${res.status}` };
      return { ok: true, message: "Netlify token valid" };
    }
    if (p === "vercel") {
      const res = await fetch("https://api.vercel.com/v2/user", {
        headers: { Authorization: `Bearer ${credentialsPlain}` },
      });
      if (!res.ok) return { ok: false, message: `Vercel auth failed: ${res.status}` };
      return { ok: true, message: "Vercel token valid" };
    }
    if (p === "sftp") {
      if (!target.host || !(target.user || target.username)) {
        return { ok: false, message: "SFTP needs host + user in target_json" };
      }
      return { ok: true, message: "SFTP config present (live connect on Deploy)" };
    }
    return { ok: true, message: "Saved (no live test for this provider)" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Test failed" };
  }
}
