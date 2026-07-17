"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function SettingsSnippets({
  projectId,
  isPaid,
  snippets,
  affiliates,
}: {
  projectId: string;
  isPaid: boolean;
  snippets: {
    id: string;
    slug: string;
    name: string;
    placement: string;
    content: string;
    enabled: number;
  }[];
  affiliates: {
    id: string;
    label: string;
    slug: string;
    destination_url: string;
    mode: string;
  }[];
}) {
  const router = useRouter();
  const [snName, setSnName] = useState("");
  const [snContent, setSnContent] = useState("");
  const [afLabel, setAfLabel] = useState("");
  const [afUrl, setAfUrl] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (!isPaid) {
    return (
      <div className="card max-w-xl p-6">
        <h2 className="text-lg font-semibold">Snippets</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Ads, scripts, and affiliate link replace-on-deploy are a Pro feature.
        </p>
        <Link href="/app/billing" className="btn-primary mt-4 inline-flex">
          Upgrade — $5/mo
        </Link>
      </div>
    );
  }

  async function addSnippet() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/projects/${projectId}/snippets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: snName,
          content: snContent,
          placement: "marker",
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setSnName("");
      setSnContent("");
      setMsg("Snippet added. Applied on Deploy before upload to your host.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function addAffiliate() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/projects/${projectId}/affiliates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: afLabel,
          destination_url: afUrl,
          mode: "replace",
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setAfLabel("");
      setAfUrl("");
      setMsg("Affiliate link added.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteSnippet(sid: string, name: string) {
    if (!confirm(`Delete snippet “${name}”?`)) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/projects/${projectId}/snippets/${sid}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setMsg("Snippet deleted.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteAffiliate(aid: string, label: string) {
    if (!confirm(`Delete affiliate “${label}”?`)) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/projects/${projectId}/affiliates/${aid}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setMsg("Affiliate deleted.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card max-w-xl space-y-8 p-6">
      <div>
        <h2 className="text-lg font-semibold">Snippets</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          On Deploy, NoCodeGit loads your snapshot, applies snippet/affiliate
          replacements, then uploads the package to{" "}
          <strong className="text-[var(--ink)]">your</strong> host.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-[var(--paper)] p-3 text-xs text-[var(--muted)]">
{`<!-- ncg:snippet:header-ad -->
  ... ad HTML ...
<!-- /ncg:snippet:header-ad -->`}
        </pre>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Ad / script snippet</h3>
        <input
          className="input"
          placeholder="Name"
          value={snName}
          onChange={(e) => setSnName(e.target.value)}
        />
        <textarea
          className="input min-h-[100px]"
          placeholder="HTML / script"
          value={snContent}
          onChange={(e) => setSnContent(e.target.value)}
        />
        {snContent.trim() && (
          <div className="rounded-xl border border-[var(--line)] bg-white p-3">
            <p className="mb-2 text-xs font-semibold text-[var(--muted)]">
              Live preview
            </p>
            <iframe
              title="snippet-preview"
              sandbox="allow-same-origin"
              className="h-32 w-full rounded-lg bg-[var(--paper)]"
              srcDoc={`<!doctype html><html><head><meta charset="utf-8"/><style>body{font-family:system-ui;margin:8px;font-size:14px}</style></head><body>${snContent}</body></html>`}
            />
          </div>
        )}
        <button
          type="button"
          className="btn-primary"
          disabled={busy}
          onClick={() => void addSnippet()}
        >
          Add snippet
        </button>
        <ul className="divide-y divide-[var(--line)] rounded-xl border border-[var(--line)]">
          {snippets.length === 0 && (
            <li className="px-3 py-3 text-sm text-[var(--muted)]">No snippets yet.</li>
          )}
          {snippets.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
            >
              <span className="text-[var(--muted)]">
                {s.name}{" "}
                <span className="text-[var(--faint)]">({s.slug})</span>
              </span>
              <button
                type="button"
                className="btn-ghost !py-1 !px-2 !text-xs text-[var(--danger)]"
                disabled={busy}
                onClick={() => void deleteSnippet(s.id, s.name)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3 border-t border-[var(--line)] pt-6">
        <h3 className="text-sm font-semibold">Affiliate links</h3>
        <input
          className="input"
          placeholder="Label"
          value={afLabel}
          onChange={(e) => setAfLabel(e.target.value)}
        />
        <input
          className="input"
          placeholder="https://..."
          value={afUrl}
          onChange={(e) => setAfUrl(e.target.value)}
        />
        <button
          type="button"
          className="btn-primary"
          disabled={busy}
          onClick={() => void addAffiliate()}
        >
          Add affiliate
        </button>
        <ul className="divide-y divide-[var(--line)] rounded-xl border border-[var(--line)]">
          {affiliates.length === 0 && (
            <li className="px-3 py-3 text-sm text-[var(--muted)]">No affiliates yet.</li>
          )}
          {affiliates.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
            >
              <span className="min-w-0 truncate text-[var(--muted)]">
                {a.label} → {a.destination_url}
              </span>
              <button
                type="button"
                className="btn-ghost shrink-0 !py-1 !px-2 !text-xs text-[var(--danger)]"
                disabled={busy}
                onClick={() => void deleteAffiliate(a.id, a.label)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {msg && <p className="text-sm text-[var(--teal)]">{msg}</p>}
      {err && <p className="text-sm text-[var(--danger)]">{err}</p>}
    </div>
  );
}
