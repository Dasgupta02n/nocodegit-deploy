"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Save = {
  id: string;
  label: string | null;
  size_bytes: number;
  created_at: string;
};

type Props = {
  project: {
    id: string;
    name: string;
    slug: string;
    live_url: string | null;
  };
  initialSaves: Save[];
  initialHosting: {
    provider: string;
    display_name: string | null;
    target_json: string;
    last_test_status: string | null;
    last_test_message: string | null;
  } | null;
  initialEnv: { id: string; key: string; visibility: string }[];
  initialSnippets: {
    id: string;
    slug: string;
    name: string;
    placement: string;
    content: string;
    enabled: number;
  }[];
  initialAffiliates: {
    id: string;
    label: string;
    slug: string;
    destination_url: string;
    mode: string;
  }[];
  initialDeploys: {
    id: string;
    status: string;
    live_url: string | null;
    created_at: string;
    log: string;
  }[];
  isPaid: boolean;
  uploadLimitLabel: string;
};

type Panel = "timeline" | "hosting" | "ship" | "extra";

function formatBytes(n: number) {
  if (n >= 1024 * 1024) return `${Math.round(n / (1024 * 1024))} MB`;
  return `${Math.round(n / 1024)} KB`;
}

function parseTarget(json: string | null | undefined) {
  try {
    return JSON.parse(json || "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

export function ProjectWorkspace(props: Props) {
  const router = useRouter();
  const [panel, setPanel] = useState<Panel>("timeline");
  const [saves, setSaves] = useState(props.initialSaves);
  const [snippets, setSnippets] = useState(props.initialSnippets);
  const [affiliates, setAffiliates] = useState(props.initialAffiliates);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [deployLog, setDeployLog] = useState(
    props.initialDeploys[0]?.log || ""
  );
  const [busy, setBusy] = useState(false);

  const initialTarget = parseTarget(props.initialHosting?.target_json);
  const [provider, setProvider] = useState(
    props.initialHosting?.provider || "netlify"
  );
  const [credentials, setCredentials] = useState("");
  const [siteId, setSiteId] = useState(initialTarget.site_id || "");
  const [hookUrl, setHookUrl] = useState(initialTarget.hook_url || "");
  const [liveUrl, setLiveUrl] = useState(
    props.project.live_url || initialTarget.live_url || ""
  );
  const [sftpHost, setSftpHost] = useState(initialTarget.host || "");
  const [sftpUser, setSftpUser] = useState(initialTarget.user || "");
  const [sftpPath, setSftpPath] = useState(
    initialTarget.remote_path || "/var/www"
  );
  const [sftpPort, setSftpPort] = useState(initialTarget.port || "22");
  const [dbConn, setDbConn] = useState("");
  const [envKey, setEnvKey] = useState("");
  const [envVal, setEnvVal] = useState("");
  const [snName, setSnName] = useState("");
  const [snContent, setSnContent] = useState("");
  const [afLabel, setAfLabel] = useState("");
  const [afUrl, setAfUrl] = useState("");

  const readiness = useMemo(() => {
    return {
      save: saves.length > 0,
      host: Boolean(props.initialHosting),
      env: props.initialEnv.length,
      snips: snippets.length,
    };
  }, [saves.length, props.initialHosting, props.initialEnv.length, snippets.length]);

  function flash(ok: string) {
    setMsg(ok);
    setErr("");
  }
  function fail(e: unknown) {
    setErr(e instanceof Error ? e.message : "Something went wrong");
    setMsg("");
  }

  async function uploadSave(file: File) {
    setBusy(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("label", file.name);
      const res = await fetch(`/api/projects/${props.project.id}/saves`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setSaves((s) => [data.save, ...s]);
      flash("Saved to NoCodeGit storage.");
      setPanel("timeline");
      router.refresh();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  function buildTargetJson() {
    if (provider === "netlify") {
      return JSON.stringify({
        site_id: siteId,
        live_url: liveUrl || undefined,
      });
    }
    if (provider === "sftp") {
      return JSON.stringify({
        host: sftpHost,
        user: sftpUser,
        port: sftpPort,
        remote_path: sftpPath,
        live_url: liveUrl || undefined,
      });
    }
    return JSON.stringify({
      hook_url: hookUrl,
      live_url: liveUrl || undefined,
      project_id: provider === "vercel" ? siteId || undefined : undefined,
    });
  }

  async function saveHosting() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/projects/${props.project.id}/hosting`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          credentials,
          target_json: buildTargetJson(),
          test: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not connect host");
      if (liveUrl) {
        await fetch(`/api/projects/${props.project.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ live_url: liveUrl }),
        });
      }
      flash(
        `Hosting saved · ${data.last_test_status || "ok"} — ${data.last_test_message || ""}`
      );
      setCredentials("");
      router.refresh();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  async function deploy(saveId?: string) {
    setBusy(true);
    setErr("");
    setDeployLog("Deploying…");
    setPanel("ship");
    try {
      const res = await fetch(`/api/projects/${props.project.id}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saveId ? { save_id: saveId } : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deploy failed");
      setDeployLog(data.deploy?.log || "");
      flash(
        data.deploy?.status === "success"
          ? "Deploy succeeded on your host."
          : "Deploy finished with errors — copy report for your AI tool."
      );
      router.refresh();
    } catch (e) {
      fail(e);
      setDeployLog("");
    } finally {
      setBusy(false);
    }
  }

  async function copyErrorReport() {
    const last = props.initialDeploys[0];
    const text = `My NoCodeGit deploy to my hosting provider failed. Fix the project so production deploy works.\n\nProject: ${props.project.name}\nStatus: ${last?.status || "n/a"}\n\nLog:\n${last?.log || deployLog || "(no log)"}`;
    await navigator.clipboard.writeText(text);
    flash("Error report copied — paste into your vibe coding tool.");
  }

  async function deleteSave(sid: string) {
    if (!confirm("Delete this save?")) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/projects/${props.project.id}/saves/${sid}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setSaves((s) => s.filter((x) => x.id !== sid));
      flash("Save deleted.");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  async function saveDatabase() {
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${props.project.id}/database`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: dbConn ? "external" : "none",
          connection_string: dbConn || null,
          add_to_env: Boolean(dbConn),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      flash(dbConn ? "Database linked · DATABASE_URL in Environment" : "Database cleared");
      router.refresh();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  async function addEnv() {
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${props.project.id}/environment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: envKey,
          value: envVal,
          visibility: "secret",
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setEnvKey("");
      setEnvVal("");
      flash(`Saved ${envKey}`);
      router.refresh();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  async function addSnippet() {
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${props.project.id}/snippets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: snName,
          content: snContent,
          placement: "marker",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSnippets((prev) => [
        ...prev,
        {
          id: data.id,
          slug: data.slug,
          name: snName || data.slug,
          placement: "marker",
          content: snContent,
          enabled: 1,
        },
      ]);
      setSnName("");
      setSnContent("");
      flash("Snippet added.");
      router.refresh();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  async function addAffiliate() {
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${props.project.id}/affiliates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: afLabel,
          destination_url: afUrl,
          mode: "replace",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setAffiliates((prev) => [
        ...prev,
        {
          id: data.id,
          label: afLabel,
          slug: data.slug,
          destination_url: afUrl,
          mode: "replace",
        },
      ]);
      setAfLabel("");
      setAfUrl("");
      flash("Affiliate link added.");
      router.refresh();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  const tabs: { id: Panel; label: string }[] = [
    { id: "timeline", label: "Timeline" },
    { id: "hosting", label: "Hosting" },
    { id: "ship", label: "Ship" },
    { id: "extra", label: "Environment" },
  ];

  return (
    <div>
      {/* Project header — mockup 4 style */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/app"
            className="text-xs font-semibold text-[var(--teal)] hover:underline"
          >
            ← Projects
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {props.project.name}
            </h1>
            {props.project.live_url ? (
              <a
                href={props.project.live_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[var(--teal)]"
              >
                <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
                {props.project.live_url}
                <span className="badge badge-live">LIVE</span>
              </a>
            ) : (
              <span className="badge badge-muted">Not live yet</span>
            )}
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Hosting{" "}
            {readiness.host ? (
              <span className="text-[var(--success)]">● Ready</span>
            ) : (
              <span className="text-[var(--faint)]">○ Connect</span>
            )}{" "}
            · Env {readiness.env} · Snips {readiness.snips}
            {!props.isPaid && (
              <>
                {" "}
                · Limit {props.uploadLimitLabel} ·{" "}
                <Link href="/app/billing" className="text-[var(--teal)]">
                  Pro ₹500
                </Link>
              </>
            )}
          </p>
        </div>

        {/* Core buttons — exact Quay tray pattern */}
        <div className="flex flex-wrap gap-2">
          <label className="btn-ink cursor-pointer">
            <input
              type="file"
              accept=".zip,application/zip"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadSave(f);
              }}
            />
            💾 Save
          </label>
          <button
            type="button"
            className="btn-primary"
            disabled={busy || saves.length === 0}
            onClick={() => void deploy()}
          >
            🚀 Deploy
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => void copyErrorReport()}
          >
            ⚠ Report
          </button>
        </div>
      </div>

      {(msg || err) && (
        <div
          className={`mb-6 rounded-xl px-4 py-3 text-sm ${
            err
              ? "bg-[var(--danger-soft)] text-[var(--danger)]"
              : "bg-[var(--teal-soft)] text-[var(--teal)]"
          }`}
        >
          {err || msg}
        </div>
      )}

      {/* Sub-nav */}
      <div className="mb-6 flex flex-wrap gap-1 border-b border-[var(--line)]">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setPanel(t.id)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              panel === t.id
                ? "border-[var(--teal)] text-[var(--teal)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {panel === "timeline" && (
        <div>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Project Timeline</h2>
              <p className="text-sm text-[var(--teal)]">Version History</p>
            </div>
            <label className="btn-secondary cursor-pointer text-sm">
              <input
                type="file"
                accept=".zip,application/zip"
                className="hidden"
                disabled={busy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadSave(f);
                }}
              />
              + New save
            </label>
          </div>

          {saves.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-sm text-[var(--muted)]">
                No saves yet. Click <strong>Save</strong> and upload a ZIP of
                your project.
              </p>
              <label className="dropzone mt-6 inline-block w-full max-w-md cursor-pointer">
                <input
                  type="file"
                  accept=".zip,application/zip"
                  className="hidden"
                  disabled={busy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadSave(f);
                  }}
                />
                <div className="text-sm font-medium text-[var(--teal)]">
                  Drag ZIP here or Browse
                </div>
                <div className="mt-2 text-xs text-[var(--faint)]">
                  Limit {props.uploadLimitLabel}
                </div>
              </label>
            </div>
          ) : (
            <div className="timeline max-w-2xl">
              {saves.map((s, i) => (
                <div key={s.id} className="timeline-item">
                  <div className="timeline-card">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                          <span>
                            {new Date(s.created_at).toLocaleString()} — Save
                          </span>
                          {i === 0 && (
                            <span className="badge badge-teal">Latest</span>
                          )}
                        </div>
                        <div className="mt-1 font-semibold">
                          {s.label || "Project save"}
                        </div>
                        <div className="mt-1 text-xs text-[var(--faint)]">
                          {formatBytes(s.size_bytes)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="btn-primary !py-1.5 !text-xs"
                          disabled={busy}
                          onClick={() => void deploy(s.id)}
                        >
                          Deploy this
                        </button>
                        <button
                          type="button"
                          className="btn-ghost !py-1.5 !text-xs text-[var(--danger)]"
                          onClick={() => void deleteSave(s.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hosting — mockup 10 style form */}
      {panel === "hosting" && (
        <div className="card max-w-2xl p-6 md:p-8">
          <h2 className="text-lg font-semibold">
            Hosting settings{" "}
            <span className="text-[var(--teal)]" aria-hidden>
              ⚓
            </span>
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Connect the provider that will run your live app. NoCodeGit only
            ships the package.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <label className="label">Provider</label>
              <select
                className="input"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                <option value="netlify">Netlify</option>
                <option value="vercel">Vercel (deploy hook)</option>
                <option value="hook">Generic deploy hook</option>
                <option value="sftp">SFTP / VPS</option>
              </select>
            </div>

            {provider === "netlify" && (
              <>
                <div>
                  <label className="label">Site ID</label>
                  <input
                    className="input"
                    value={siteId}
                    onChange={(e) => setSiteId(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Access token</label>
                  <input
                    className="input"
                    type="password"
                    value={credentials}
                    onChange={(e) => setCredentials(e.target.value)}
                  />
                </div>
              </>
            )}

            {(provider === "vercel" || provider === "hook") && (
              <div>
                <label className="label">Deploy hook URL</label>
                <input
                  className="input"
                  value={hookUrl}
                  onChange={(e) => setHookUrl(e.target.value)}
                />
              </div>
            )}

            {provider === "vercel" && (
              <div>
                <label className="label">Project ID (optional)</label>
                <input
                  className="input"
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                />
              </div>
            )}

            {provider === "sftp" && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Host</label>
                    <input
                      className="input"
                      value={sftpHost}
                      onChange={(e) => setSftpHost(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Port</label>
                    <input
                      className="input"
                      value={sftpPort}
                      onChange={(e) => setSftpPort(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">User</label>
                    <input
                      className="input"
                      value={sftpUser}
                      onChange={(e) => setSftpUser(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Password</label>
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
                  <input
                    className="input"
                    value={sftpPath}
                    onChange={(e) => setSftpPath(e.target.value)}
                  />
                </div>
              </>
            )}

            <div>
              <label className="label">Live URL</label>
              <input
                className="input"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://your-app.com"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                className="btn-primary"
                disabled={busy}
                onClick={() => void saveHosting()}
              >
                Save hosting config
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setPanel("timeline")}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ship / deploy status — mockup 2 style */}
      {panel === "ship" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="card p-6">
            <div className="h-1 w-full rounded-full bg-[var(--teal)]" />
            <h2 className="mt-4 text-lg font-semibold text-[var(--teal)]">
              Deploy
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Latest save ships to your connected host.
            </p>
            <button
              type="button"
              className="btn-primary mt-6"
              disabled={busy || saves.length === 0}
              onClick={() => void deploy()}
            >
              {busy ? "Deploying…" : "Deploy now"}
            </button>
            {deployLog && (
              <pre className="mt-6 max-h-64 overflow-auto rounded-xl bg-[#f7f4ef] p-4 text-xs text-[var(--ink)] ring-1 ring-[var(--line)]">
                {deployLog}
              </pre>
            )}
          </div>

          <div className="card overflow-hidden p-0">
            <div className="h-1 w-full bg-[var(--danger)]" />
            <div className="p-6">
              <h2 className="text-lg font-semibold text-[var(--danger)]">
                If deploy failed
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Copy the error pack and paste it into your vibe coding tool,
                then Save again.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => void copyErrorReport()}
                >
                  Copy error for AI tool
                </button>
              </div>
              <ul className="mt-6 space-y-2 text-sm">
                {props.initialDeploys.slice(0, 5).map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--line)] px-3 py-2"
                  >
                    <span
                      className={
                        d.status === "success"
                          ? "font-medium text-[var(--success)]"
                          : "font-medium text-[var(--danger)]"
                      }
                    >
                      {d.status}
                    </span>
                    <span className="text-xs text-[var(--faint)]">
                      {new Date(d.created_at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Environment / extras — settings mockup */}
      {panel === "extra" && (
        <div className="card max-w-2xl space-y-8 p-6 md:p-8">
          <div>
            <h2 className="text-lg font-semibold">Environment variables</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Secrets are encrypted at rest and pushed to Netlify/Vercel on
              deploy when possible.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                className="input"
                placeholder="KEY"
                value={envKey}
                onChange={(e) => setEnvKey(e.target.value)}
              />
              <input
                className="input"
                placeholder="value"
                value={envVal}
                onChange={(e) => setEnvVal(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn-secondary mt-3"
              onClick={() => void addEnv()}
            >
              + Add variable
            </button>
            {props.initialEnv.length > 0 && (
              <ul className="mt-4 divide-y divide-[var(--line)] rounded-xl border border-[var(--line)]">
                {props.initialEnv.map((e) => (
                  <li
                    key={e.id}
                    className="flex justify-between px-3 py-2 text-sm"
                  >
                    <span className="font-mono font-medium">{e.key}</span>
                    <span className="text-[var(--faint)]">••••••••</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold">Database</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Paste your Supabase / Postgres URL (optional).
            </p>
            <input
              className="input mt-3"
              value={dbConn}
              onChange={(e) => setDbConn(e.target.value)}
              placeholder="postgres://..."
            />
            <button
              type="button"
              className="btn-secondary mt-3"
              onClick={() => void saveDatabase()}
            >
              Save database
            </button>
          </div>

          {props.isPaid ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Ads & affiliates (Pro)</h2>
              <div>
                <input
                  className="input"
                  placeholder="Snippet name"
                  value={snName}
                  onChange={(e) => setSnName(e.target.value)}
                />
                <textarea
                  className="input mt-2 min-h-[80px]"
                  placeholder="HTML / script"
                  value={snContent}
                  onChange={(e) => setSnContent(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-secondary mt-2"
                  onClick={() => void addSnippet()}
                >
                  Add snippet
                </button>
                {snippets.map((s) => (
                  <div key={s.id} className="mt-1 text-xs text-[var(--muted)]">
                    {s.name}
                  </div>
                ))}
              </div>
              <div>
                <input
                  className="input"
                  placeholder="Affiliate label"
                  value={afLabel}
                  onChange={(e) => setAfLabel(e.target.value)}
                />
                <input
                  className="input mt-2"
                  placeholder="https://..."
                  value={afUrl}
                  onChange={(e) => setAfUrl(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-secondary mt-2"
                  onClick={() => void addAffiliate()}
                >
                  Add affiliate
                </button>
                {affiliates.map((a) => (
                  <div key={a.id} className="mt-1 text-xs text-[var(--muted)]">
                    {a.label}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="rounded-xl bg-[var(--clay-soft)] px-4 py-3 text-sm text-[var(--muted)]">
              Ads editor is on Pro.{" "}
              <Link href="/app/billing" className="font-semibold text-[var(--teal)]">
                Upgrade — ₹500/mo
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
