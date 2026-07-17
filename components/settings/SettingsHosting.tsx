"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Hosting = {
  provider: string;
  display_name: string | null;
  target_json: string;
  last_test_status: string | null;
  last_test_message: string | null;
} | null;

function parseTarget(json: string | null | undefined) {
  try {
    return JSON.parse(json || "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

export function SettingsHosting({
  projectId,
  initial,
}: {
  projectId: string;
  initial: Hosting;
}) {
  const router = useRouter();
  const t = parseTarget(initial?.target_json);
  const [provider, setProvider] = useState(initial?.provider || "netlify");
  const [displayName, setDisplayName] = useState(initial?.display_name || "");
  const [credentials, setCredentials] = useState("");
  const [siteId, setSiteId] = useState(t.site_id || t.project_id || "");
  const [hookUrl, setHookUrl] = useState(t.hook_url || "");
  const [liveUrl, setLiveUrl] = useState(t.live_url || "");
  const [sftpHost, setSftpHost] = useState(t.host || "");
  const [sftpUser, setSftpUser] = useState(t.user || "");
  const [sftpPath, setSftpPath] = useState(t.remote_path || "/var/www");
  const [sftpPort, setSftpPort] = useState(t.port || "22");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  function buildTarget() {
    if (provider === "netlify") {
      return { site_id: siteId, live_url: liveUrl || undefined };
    }
    if (provider === "sftp") {
      return {
        host: sftpHost,
        user: sftpUser,
        port: sftpPort,
        remote_path: sftpPath,
        live_url: liveUrl || undefined,
      };
    }
    if (provider === "custom") {
      return {
        url: hookUrl,
        hook_url: hookUrl,
        live_url: liveUrl || undefined,
        dashboard_url: liveUrl || undefined,
      };
    }
    return {
      hook_url: hookUrl,
      live_url: liveUrl || undefined,
      project_id: provider === "vercel" ? siteId || undefined : undefined,
    };
  }

  async function save(test: boolean) {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch(`/api/projects/${projectId}/hosting`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          display_name: displayName || undefined,
          credentials,
          target_json: JSON.stringify(buildTarget()),
          test,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg(
        test
          ? `Saved. Test: ${data.last_test_status} — ${data.last_test_message || ""}`
          : "Hosting connection saved."
      );
      setCredentials("");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    if (!confirm("Disconnect hosting for this project? Deploy will be blocked until you reconnect.")) {
      return;
    }
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch(`/api/projects/${projectId}/hosting`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg("Hosting disconnected.");
      setCredentials("");
      setDisplayName("");
      setSiteId("");
      setHookUrl("");
      setLiveUrl("");
      setSftpHost("");
      setSftpUser("");
      setSftpPath("/var/www");
      setSftpPort("22");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card max-w-xl space-y-5 p-6">
      <div>
        <h2 className="text-lg font-semibold">
          Hosting settings <span className="text-[var(--teal)]">⚓</span>
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Your app runs on <strong className="text-[var(--ink)]">your</strong>{" "}
          hosting account. NoCodeGit stores versions and deploys to the provider
          you connect.
        </p>
      </div>

      {initial && (
        <div className="rounded-xl bg-[var(--teal-soft)] px-3 py-2 text-xs text-[var(--teal)]">
          <p>
            Connected · last test: {initial.last_test_status || "n/a"}
            {initial.last_test_message ? ` — ${initial.last_test_message}` : ""}
          </p>
          {/* dashboard link computed client-side from known providers */}
          {(initial.provider === "vercel" ||
            initial.provider === "netlify" ||
            initial.provider === "railway" ||
            initial.provider === "render") && (
            <a
              className="mt-1 inline-block font-semibold underline"
              href={
                initial.provider === "vercel"
                  ? "https://vercel.com/dashboard"
                  : initial.provider === "netlify"
                    ? "https://app.netlify.com"
                    : initial.provider === "railway"
                      ? "https://railway.app/dashboard"
                      : "https://dashboard.render.com"
              }
              target="_blank"
              rel="noreferrer"
            >
              Open provider dashboard ↗
            </a>
          )}
        </div>
      )}

      <div>
        <label className="label">Provider</label>
        <select
          className="input"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        >
          <option value="vercel">Vercel</option>
          <option value="netlify">Netlify</option>
          <option value="railway">Railway (deploy hook)</option>
          <option value="render">Render (deploy hook)</option>
          <option value="cloudflare">Cloudflare Pages (hook)</option>
          <option value="hook">Generic Deploy Hook</option>
          <option value="sftp">SFTP / FTPS</option>
          <option value="custom">Custom HTTP API</option>
        </select>
      </div>

      <div>
        <label className="label">Display name</label>
        <input
          className="input"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Prod Vercel"
        />
      </div>

      {provider === "netlify" && (
        <>
          <div>
            <label className="label">Site ID</label>
            <input className="input" value={siteId} onChange={(e) => setSiteId(e.target.value)} />
          </div>
          <div>
            <label className="label">API token</label>
            <input
              className="input"
              type="password"
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
              placeholder={initial ? "Leave blank to keep existing" : "Paste token"}
            />
          </div>
        </>
      )}

      {(provider === "vercel" ||
        provider === "hook" ||
        provider === "railway" ||
        provider === "render" ||
        provider === "cloudflare") && (
        <div>
          <label className="label">Deploy hook URL</label>
          <input
            className="input"
            value={hookUrl}
            onChange={(e) => setHookUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
      )}

      {provider === "custom" && (
        <>
          <div>
            <label className="label">API URL (POST zip)</label>
            <input
              className="input"
              value={hookUrl}
              onChange={(e) => setHookUrl(e.target.value)}
              placeholder="https://api.example.com/deploy"
            />
          </div>
          <p className="text-xs text-[var(--muted)]">
            Optional target JSON fields: method, bearer, auth_header,
            headers_json, content_type, dashboard_url, live_url. Token goes in
            credentials.
          </p>
        </>
      )}

      {provider === "vercel" && (
        <div>
          <label className="label">Project ID (optional, for env push)</label>
          <input className="input" value={siteId} onChange={(e) => setSiteId(e.target.value)} />
        </div>
      )}

      {provider === "sftp" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Host</label>
              <input className="input" value={sftpHost} onChange={(e) => setSftpHost(e.target.value)} />
            </div>
            <div>
              <label className="label">Port</label>
              <input className="input" value={sftpPort} onChange={(e) => setSftpPort(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">User</label>
              <input className="input" value={sftpUser} onChange={(e) => setSftpUser(e.target.value)} />
            </div>
            <div>
              <label className="label">Password / key material</label>
              <input
                className="input"
                type="password"
                value={credentials}
                onChange={(e) => setCredentials(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label">Remote path</label>
            <input className="input" value={sftpPath} onChange={(e) => setSftpPath(e.target.value)} />
          </div>
        </>
      )}

      <div>
        <label className="label">Live URL (optional shortcut)</label>
        <input
          className="input"
          value={liveUrl}
          onChange={(e) => setLiveUrl(e.target.value)}
          placeholder="https://myapp.vercel.app"
        />
      </div>

      {msg && <p className="text-sm text-[var(--teal)]">{msg}</p>}
      {err && <p className="text-sm text-[var(--danger)]">{err}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          disabled={busy}
          onClick={() => void save(true)}
        >
          Save hosting connection
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={busy}
          onClick={() => void save(true)}
        >
          Test connection
        </button>
        {initial && (
          <button
            type="button"
            className="btn-ghost text-[var(--danger)]"
            disabled={busy}
            onClick={() => void disconnect()}
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
}
