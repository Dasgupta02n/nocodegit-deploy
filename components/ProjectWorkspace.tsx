"use client";

import { useEffect, useState } from "react";
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

export function ProjectWorkspace(props: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<
    "timeline" | "hosting" | "database" | "env" | "snippets" | "ship"
  >("timeline");
  const [saves, setSaves] = useState(props.initialSaves);
  const [snippets, setSnippets] = useState(props.initialSnippets);
  const [affiliates, setAffiliates] = useState(props.initialAffiliates);
  const [dbMode, setDbMode] = useState<"none" | "external">("none");
  const [dbConn, setDbConn] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [deployLog, setDeployLog] = useState("");
  const [busy, setBusy] = useState(false);

  // hosting form
  const [provider, setProvider] = useState(
    props.initialHosting?.provider || "hook"
  );
  const [credentials, setCredentials] = useState("");
  const [targetJson, setTargetJson] = useState(
    props.initialHosting?.target_json ||
      '{\n  "hook_url": "https://...",\n  "live_url": "https://your-app.vercel.app"\n}'
  );
  const [liveUrl, setLiveUrl] = useState(props.project.live_url || "");

  // env
  const [envKey, setEnvKey] = useState("");
  const [envVal, setEnvVal] = useState("");
  const [envVis, setEnvVis] = useState<"secret" | "public">("secret");

  // snippet
  const [snName, setSnName] = useState("");
  const [snContent, setSnContent] = useState("");
  const [snPlacement, setSnPlacement] = useState("marker");

  // affiliate
  const [afLabel, setAfLabel] = useState("");
  const [afUrl, setAfUrl] = useState("");
  const [afFind, setAfFind] = useState("");

  async function uploadSave(file: File) {
    setBusy(true);
    setErr("");
    setMsg("");
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
      setMsg("Saved to NoCodeGit storage.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveHosting() {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch(`/api/projects/${props.project.id}/hosting`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          credentials,
          target_json: targetJson,
          test: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg(
        `Hosting saved. Test: ${data.last_test_status} — ${data.last_test_message}`
      );
      setCredentials("");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveLiveUrl() {
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${props.project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ live_url: liveUrl || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg("Live URL updated.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function addEnv() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/projects/${props.project.id}/environment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: envKey,
          value: envVal,
          visibility: envVis,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setEnvKey("");
      setEnvVal("");
      setMsg(`Saved ${data.key}`);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
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
          placement: snPlacement,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSnName("");
      setSnContent("");
      setMsg("Snippet added.");
      setSnippets((prev) => [
        ...prev,
        {
          id: data.id,
          slug: data.slug,
          name: snName || data.slug,
          placement: snPlacement,
          content: snContent,
          enabled: 1,
        },
      ]);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
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
          find_url_on_create: afFind || null,
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
      setAfFind("");
      setMsg("Affiliate link added.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function deploy(saveId?: string) {
    setBusy(true);
    setErr("");
    setMsg("");
    setDeployLog("Deploying…");
    try {
      const res = await fetch(`/api/projects/${props.project.id}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saveId ? { save_id: saveId } : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deploy failed");
      setDeployLog(data.deploy?.log || "");
      setMsg(
        data.deploy?.status === "success"
          ? "Deploy succeeded on your host."
          : "Deploy finished with errors — see log."
      );
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Deploy failed");
      setDeployLog("");
    } finally {
      setBusy(false);
    }
  }

  async function copyErrorReport() {
    const last = props.initialDeploys[0];
    const text = `My NoCodeGit deploy to my hosting provider failed. Fix the project so production deploy works.\n\nProject: ${props.project.name}\nStatus: ${last?.status || "n/a"}\n\nLog:\n${last?.log || deployLog || "(no log)"}`;
    await navigator.clipboard.writeText(text);
    setMsg("Error report copied — paste into your vibe coding tool.");
  }

  async function deleteSave(sid: string) {
    if (!confirm("Delete this save?")) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/projects/${props.project.id}/saves/${sid}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSaves((s) => s.filter((x) => x.id !== sid));
      setMsg("Save deleted.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteSnippet(sid: string) {
    if (!confirm("Delete snippet?")) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/projects/${props.project.id}/snippets/${sid}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setSnippets((s) => s.filter((x) => x.id !== sid));
      setMsg("Snippet deleted.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteAffiliate(aid: string) {
    if (!confirm("Delete affiliate link?")) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/projects/${props.project.id}/affiliates/${aid}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setAffiliates((s) => s.filter((x) => x.id !== aid));
      setMsg("Affiliate deleted.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveDatabase() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/projects/${props.project.id}/database`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: dbMode,
          connection_string: dbMode === "external" ? dbConn : null,
          add_to_env: dbMode === "external",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg(
        dbMode === "external"
          ? "Database saved · DATABASE_URL added to Environment"
          : "Database set to none"
      );
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  const tabs = (
    [
      ["timeline", "Timeline"],
      ["hosting", "Hosting"],
      ["database", "Database"],
      ["env", "Environment"],
      ...(props.isPaid
        ? ([["snippets", "Ads & affiliates"]] as const)
        : []),
      ["ship", "Ship"],
    ] as const
  );

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{props.project.name}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Code stored on NoCodeGit · App runs on your host · Upload limit:{" "}
            {props.uploadLimitLabel}
            {!props.isPaid && (
              <>
                {" "}
                ·{" "}
                <Link href="/app/billing" className="text-[var(--teal)]">
                  Pro $5/mo
                </Link>{" "}
                for unlimited + ads editor
              </>
            )}
          </p>
          {props.project.live_url && (
            <a
              href={props.project.live_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm text-[var(--teal)]"
            >
              {props.project.live_url}
            </a>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-primary"
            disabled={busy}
            onClick={() => deploy()}
          >
            Deploy
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={copyErrorReport}
          >
            Report error
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-[var(--line)] pb-2">
        {tabs.map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              tab === k
                ? "bg-[var(--teal-soft)] font-medium text-[var(--teal)]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {(msg || err) && (
        <div
          className={`mt-4 rounded-xl px-4 py-3 text-sm ${
            err
              ? "bg-[var(--danger-soft)] text-[var(--danger)]"
              : "bg-[var(--teal-soft)] text-[var(--teal)]"
          }`}
        >
          {err || msg}
        </div>
      )}

      {tab === "timeline" && (
        <div className="mt-8 space-y-6">
          <div className="card p-5">
            <h2 className="font-medium">Save (ZIP upload)</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Zip your vibe project folder (exclude node_modules). Max size:{" "}
              <strong>{props.uploadLimitLabel}</strong>
              {!props.isPaid && " on Free — unlimited on Pro ($5/mo)"}.
            </p>
            <input
              type="file"
              accept=".zip,application/zip"
              className="mt-4 block w-full text-sm"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadSave(f);
              }}
            />
          </div>
          <div className="space-y-3">
            {saves.length === 0 && (
              <p className="text-sm text-[var(--muted)]">No saves yet.</p>
            )}
            {saves.map((s) => (
              <div
                key={s.id}
                className="card flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <div className="text-sm font-medium">
                    {s.label || "Save"} · {(s.size_bytes / 1024).toFixed(1)} KB
                  </div>
                  <div className="text-xs text-[var(--faint)]">
                    {s.created_at}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-secondary text-xs"
                    disabled={busy}
                    onClick={() => deploy(s.id)}
                  >
                    Deploy this
                  </button>
                  <button
                    type="button"
                    className="btn-ghost text-xs text-[var(--danger)]"
                    disabled={busy}
                    onClick={() => deleteSave(s.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          {deployLog && (
            <pre className="card max-h-64 overflow-auto p-4 text-xs">
              {deployLog}
            </pre>
          )}
        </div>
      )}

      {tab === "hosting" && (
        <div className="card mt-8 space-y-4 p-6">
          <h2 className="font-medium">Your hosting provider</h2>
          <p className="text-sm text-[var(--muted)]">
            NoCodeGit does not host your app. Paste API token or deploy hook from
            Vercel / Netlify / generic hook.
          </p>
          {props.initialHosting && (
            <p className="text-xs text-[var(--faint)]">
              Connected: {props.initialHosting.provider} · test{" "}
              {props.initialHosting.last_test_status} —{" "}
              {props.initialHosting.last_test_message}
            </p>
          )}
          <div>
            <label className="label">Provider</label>
            <select
              className="input"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >
              <option value="hook">Deploy hook (universal)</option>
              <option value="netlify">Netlify</option>
              <option value="vercel">Vercel (via deploy hook)</option>
              <option value="sftp">SFTP</option>
            </select>
          </div>
          <div>
            <label className="label">
              Credentials (token or hook URL — stored encrypted)
            </label>
            <input
              className="input font-mono text-xs"
              type="password"
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
              placeholder="Bearer token or hook secret"
              required
            />
          </div>
          <div>
            <label className="label">Target JSON</label>
            <textarea
              className="input min-h-[120px] font-mono text-xs"
              value={targetJson}
              onChange={(e) => setTargetJson(e.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--faint)]">
              Netlify: {`{"site_id":"...","live_url":"https://..."}`} · Hook:{" "}
              {`{"hook_url":"https://...","live_url":"https://..."}`}
            </p>
          </div>
          <button
            type="button"
            className="btn-primary"
            disabled={busy || !credentials}
            onClick={saveHosting}
          >
            Save hosting connection
          </button>

          <hr className="border-[var(--line)]" />
          <div>
            <label className="label">Live URL (your host)</label>
            <input
              className="input"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="https://my-app.vercel.app"
            />
            <button
              type="button"
              className="btn-secondary mt-2"
              onClick={saveLiveUrl}
            >
              Save live URL
            </button>
          </div>
        </div>
      )}

      {tab === "database" && (
        <div className="card mt-8 space-y-4 p-6">
          <h2 className="font-medium">Your database</h2>
          <p className="text-sm text-[var(--muted)]">
            NoCodeGit does not host Postgres. Paste your Supabase/Neon/etc.
            connection string. Optionally add as DATABASE_URL env (pushed to
            Netlify/Vercel when supported).
          </p>
          <select
            className="input"
            value={dbMode}
            onChange={(e) =>
              setDbMode(e.target.value as "none" | "external")
            }
          >
            <option value="none">No database</option>
            <option value="external">I have a database</option>
          </select>
          {dbMode === "external" && (
            <textarea
              className="input min-h-[80px] font-mono text-xs"
              placeholder="postgres://user:pass@host:5432/db"
              value={dbConn}
              onChange={(e) => setDbConn(e.target.value)}
            />
          )}
          <button
            type="button"
            className="btn-primary"
            disabled={busy}
            onClick={saveDatabase}
          >
            Save database settings
          </button>
        </div>
      )}

      {tab === "env" && (
        <div className="mt-8 space-y-6">
          <div className="card space-y-3 p-6">
            <h2 className="font-medium">API keys & config</h2>
            <p className="text-sm text-[var(--muted)]">
              e.g. OPENAI_API_KEY, STRIPE_SECRET_KEY. Stored encrypted.
              Free and Pro can use API keys.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                className="input"
                placeholder="KEY_NAME"
                value={envKey}
                onChange={(e) => setEnvKey(e.target.value)}
              />
              <input
                className="input"
                placeholder="value"
                type="password"
                value={envVal}
                onChange={(e) => setEnvVal(e.target.value)}
              />
              <select
                className="input"
                value={envVis}
                onChange={(e) =>
                  setEnvVis(e.target.value as "secret" | "public")
                }
              >
                <option value="secret">Secret</option>
                <option value="public">Public</option>
              </select>
            </div>
            <button
              type="button"
              className="btn-primary"
              disabled={busy}
              onClick={addEnv}
            >
              Add variable
            </button>
          </div>
          <ul className="space-y-2">
            {props.initialEnv.map((e) => (
              <li
                key={e.id}
                className="card flex justify-between px-4 py-3 text-sm"
              >
                <span className="font-mono">{e.key}</span>
                <span className="text-xs text-[var(--faint)]">
                  {e.visibility}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "snippets" && props.isPaid && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="card space-y-3 p-6">
            <h2 className="font-medium">Ad / script snippets (Pro)</h2>
            <input
              className="input"
              placeholder="Name"
              value={snName}
              onChange={(e) => setSnName(e.target.value)}
            />
            <select
              className="input"
              value={snPlacement}
              onChange={(e) => setSnPlacement(e.target.value)}
            >
              <option value="marker">Marker only</option>
              <option value="head">Head inject</option>
              <option value="body_end">Body end</option>
              <option value="body_start">Body start</option>
            </select>
            <textarea
              className="input min-h-[120px] font-mono text-xs"
              placeholder="Paste HTML/JS snippet"
              value={snContent}
              onChange={(e) => setSnContent(e.target.value)}
            />
            <button
              type="button"
              className="btn-primary"
              disabled={busy}
              onClick={addSnippet}
            >
              Add snippet
            </button>
            <ul className="mt-4 space-y-2 text-sm">
              {snippets.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--line)] p-2"
                >
                  <span>
                    {s.name}{" "}
                    <span className="text-xs text-[var(--faint)]">
                      ({s.slug} · {s.placement})
                    </span>
                  </span>
                  <button
                    type="button"
                    className="text-xs text-[var(--danger)]"
                    onClick={() => deleteSnippet(s.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="card space-y-3 p-6">
            <h2 className="font-medium">Affiliate links</h2>
            <input
              className="input"
              placeholder="Label"
              value={afLabel}
              onChange={(e) => setAfLabel(e.target.value)}
            />
            <input
              className="input"
              placeholder="New destination URL"
              value={afUrl}
              onChange={(e) => setAfUrl(e.target.value)}
            />
            <input
              className="input"
              placeholder="Current URL in project (for first replace)"
              value={afFind}
              onChange={(e) => setAfFind(e.target.value)}
            />
            <button
              type="button"
              className="btn-primary"
              disabled={busy}
              onClick={addAffiliate}
            >
              Add affiliate link
            </button>
            <ul className="mt-4 space-y-2 text-sm">
              {affiliates.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start justify-between gap-2 rounded-lg border border-[var(--line)] p-2"
                >
                  <div>
                    {a.label}
                    <div className="truncate text-xs text-[var(--faint)]">
                      {a.destination_url}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-[var(--danger)]"
                    onClick={() => deleteAffiliate(a.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "ship" && (
        <div className="card mt-8 space-y-4 p-6">
          <h2 className="font-medium">Ship checklist</h2>
          <ShipStatus projectId={props.project.id} />
          <button
            type="button"
            className="btn-primary"
            disabled={busy}
            onClick={() => deploy()}
          >
            Deploy latest save
          </button>
          <h3 className="pt-4 text-sm font-medium">Recent deploys</h3>
          <ul className="space-y-2 text-sm">
            {props.initialDeploys.map((d) => (
              <li key={d.id} className="rounded-lg border border-[var(--line)] p-3">
                <div className="flex justify-between">
                  <span
                    className={
                      d.status === "success"
                        ? "text-[var(--success)]"
                        : d.status === "failed"
                          ? "text-[var(--danger)]"
                          : ""
                    }
                  >
                    {d.status}
                  </span>
                  <span className="text-xs text-[var(--faint)]">
                    {d.created_at}
                  </span>
                </div>
                {d.live_url && (
                  <div className="mt-1 truncate text-xs text-[var(--teal)]">
                    {d.live_url}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ShipStatus({ projectId }: { projectId: string }) {
  const [data, setData] = useState<{
    can_deploy: boolean;
    steps: { id: string; label: string; status: string; message: string }[];
  } | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/ship`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ can_deploy: false, steps: [] }));
  }, [projectId]);

  if (!data) {
    return <p className="text-sm text-[var(--muted)]">Loading checklist…</p>;
  }

  return (
    <ul className="space-y-2">
      {data.steps.map((s) => (
        <li
          key={s.id}
          className="flex items-start gap-3 rounded-xl border border-[var(--line)] px-3 py-2 text-sm"
        >
          <span>
            {s.status === "ok" ? "✓" : s.status === "warn" ? "!" : "✗"}
          </span>
          <div>
            <div className="font-medium">{s.label}</div>
            <div className="text-xs text-[var(--muted)]">{s.message}</div>
          </div>
        </li>
      ))}
      <li className="text-xs text-[var(--faint)]">
        Can deploy: {data.can_deploy ? "yes" : "no — fix blockers"}
      </li>
    </ul>
  );
}
