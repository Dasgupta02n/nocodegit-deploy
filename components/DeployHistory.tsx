"use client";

import { useState } from "react";

type Deploy = {
  id: string;
  status: string;
  live_url: string | null;
  created_at: string;
  log: string;
};

export function DeployHistory({
  projectName,
  deploys,
}: {
  projectName: string;
  deploys: Deploy[];
}) {
  const [openId, setOpenId] = useState<string | null>(deploys[0]?.id || null);
  const [msg, setMsg] = useState("");

  async function copyError(d: Deploy) {
    const text = `My NoCodeGit deploy to my hosting provider failed. Fix the project so production deploy works.\n\nProject: ${projectName}\nStatus: ${d.status}\n\nLog:\n${d.log || "(no log)"}`;
    await navigator.clipboard.writeText(text);
    setMsg("Error report copied for AI tool.");
  }

  const open = deploys.find((d) => d.id === openId) || deploys[0];

  return (
    <div className="space-y-4">
      {msg && (
        <p className="rounded-xl bg-[var(--teal-soft)] px-4 py-3 text-sm text-[var(--teal)]">
          {msg}
        </p>
      )}

      {deploys.length === 0 ? (
        <div className="panel p-10 text-center text-sm text-[var(--muted)]">
          No deploys yet. Use <strong>Ship</strong> when a version and hosting
          are ready.
        </div>
      ) : (
        <>
          {open && (
            <div className="panel">
              <div
                className={`flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm font-semibold sm:px-5 ${
                  open.status === "success"
                    ? "bg-[var(--success-soft)] text-[var(--success)]"
                    : open.status === "running" || open.status === "pending"
                      ? "bg-[var(--teal-soft)] text-[var(--teal)]"
                      : "bg-[var(--danger-soft)] text-[var(--danger)]"
                }`}
              >
                <span>
                  {open.status === "success"
                    ? "Deploy succeeded"
                    : open.status === "running" || open.status === "pending"
                      ? "Deploy running…"
                      : "Deploy failed"}
                  {open.live_url ? ` · ${open.live_url}` : ""}
                </span>
                <span className="text-xs font-medium opacity-80">
                  {new Date(open.created_at).toLocaleString()}
                </span>
              </div>
              <pre className="max-h-[360px] overflow-auto bg-[#141414] p-4 font-mono text-xs leading-relaxed text-[#d4d0c8] sm:p-5">
                {open.log || "(no log yet)"}
              </pre>
              <div className="flex flex-wrap gap-2 border-t border-[var(--line)] px-4 py-3 sm:px-5">
                {open.status !== "success" && (
                  <button
                    type="button"
                    className="btn-primary !text-xs"
                    onClick={() => void copyError(open)}
                  >
                    Copy error for AI tool
                  </button>
                )}
                {open.live_url && (
                  <a
                    href={open.live_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary !text-xs"
                  >
                    Open live site
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="panel">
            <div className="panel-h">
              <h2>History</h2>
              <span className="meta">
                {deploys.length} deploy{deploys.length === 1 ? "" : "s"}
              </span>
            </div>
            <ul className="divide-y divide-[var(--line)]">
              {deploys.map((d) => {
                const ok = d.status === "success";
                const selected = openId === d.id;
                return (
                  <li
                    key={d.id}
                    className={`flex cursor-pointer items-center gap-3 px-4 py-3.5 sm:px-5 ${
                      selected ? "bg-[var(--paper)]" : "hover:bg-[var(--paper)]/60"
                    }`}
                    onClick={() => setOpenId(d.id)}
                  >
                    <span
                      className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        ok
                          ? "bg-[var(--success-soft)] text-[var(--success)]"
                          : "bg-[var(--danger-soft)] text-[var(--danger)]"
                      }`}
                    >
                      {ok ? "✓" : "!"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold capitalize">
                        {d.status}
                      </div>
                      <div className="text-xs text-[var(--faint)]">
                        {new Date(d.created_at).toLocaleString()}
                        {d.live_url ? ` · ${d.live_url}` : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-ghost !px-2.5 !py-1.5 !text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenId(d.id);
                      }}
                    >
                      View log
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
