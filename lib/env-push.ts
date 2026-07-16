import { decrypt } from "./crypto";

export type EnvRow = {
  key: string;
  value_enc: string;
  visibility: string;
};

/**
 * Push env vars to the user's host when the provider API supports it.
 */
export async function pushEnvToHost(
  provider: string,
  credentialsEnc: string,
  targetJson: string,
  envRows: EnvRow[]
): Promise<string[]> {
  const log: string[] = [];
  if (!envRows.length) {
    log.push("No env vars to push");
    return log;
  }

  let credentials: string;
  try {
    credentials = decrypt(credentialsEnc);
  } catch {
    log.push("Could not decrypt hosting credentials for env push");
    return log;
  }

  let target: Record<string, string> = {};
  try {
    target = JSON.parse(targetJson || "{}");
  } catch {
    /* ignore */
  }

  const vars = envRows.map((r) => ({
    key: r.key,
    value: decrypt(r.value_enc),
    scopes: r.visibility === "public" ? ["builds", "functions", "runtime", "post_processing"] : ["builds", "functions", "runtime", "post_processing"],
  }));

  const p = provider.toLowerCase();

  if (p === "netlify") {
    const siteId = target.site_id;
    if (!siteId) {
      log.push("Env push skipped: Netlify site_id missing");
      return log;
    }
    // Upsert each env var
    for (const v of vars) {
      try {
        const res = await fetch(
          `https://api.netlify.com/api/v1/accounts/${target.account_slug || "me"}/env/${encodeURIComponent(v.key)}?site_id=${siteId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${credentials}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              key: v.key,
              values: [{ value: v.value, context: "all" }],
              is_secret: true,
            }),
          }
        );
        // Fallback older API: create env var on site
        if (!res.ok) {
          const res2 = await fetch(
            `https://api.netlify.com/api/v1/sites/${siteId}/env`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${credentials}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                key: v.key,
                values: [{ value: v.value, context: "all" }],
              }),
            }
          );
          if (!res2.ok) {
            const t = await res2.text();
            log.push(`Netlify env ${v.key}: ${res2.status} ${t.slice(0, 120)}`);
          } else {
            log.push(`Netlify env set: ${v.key}`);
          }
        } else {
          log.push(`Netlify env set: ${v.key}`);
        }
      } catch (e) {
        log.push(
          `Netlify env ${v.key} failed: ${e instanceof Error ? e.message : "error"}`
        );
      }
    }
    return log;
  }

  if (p === "vercel") {
    const projectId = target.project_id || target.projectId;
    const teamId = target.team_id;
    if (!projectId) {
      log.push(
        "Env push: set target_json.project_id for Vercel, or paste keys in Vercel dashboard"
      );
      return log;
    }
    for (const v of vars) {
      try {
        const q = teamId ? `?teamId=${teamId}` : "";
        const res = await fetch(
          `https://api.vercel.com/v10/projects/${projectId}/env${q}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${credentials}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              key: v.key,
              value: v.value,
              type: "encrypted",
              target: ["production", "preview", "development"],
            }),
          }
        );
        if (res.status === 409) {
          // update existing — list + patch omitted; log hint
          log.push(
            `Vercel env ${v.key}: already exists (update in Vercel dashboard or delete first)`
          );
        } else if (!res.ok) {
          const t = await res.text();
          log.push(`Vercel env ${v.key}: ${res.status} ${t.slice(0, 120)}`);
        } else {
          log.push(`Vercel env set: ${v.key}`);
        }
      } catch (e) {
        log.push(
          `Vercel env ${v.key} failed: ${e instanceof Error ? e.message : "error"}`
        );
      }
    }
    return log;
  }

  log.push(
    `Env push not automated for provider "${provider}" — paste keys on your host dashboard`
  );
  // Include keys list (names only) for operator clarity
  log.push(`Keys on file: ${vars.map((v) => v.key).join(", ")}`);
  return log;
}
