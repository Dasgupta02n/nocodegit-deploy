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

  return (
    <div>
      <h2 className="text-lg font-semibold">Deploy history</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        NoCodeGit-side prepare / upload / provider responses — not your app
        runtime logs (those live on your host).
      </p>
      {msg && <p className="mt-3 text-sm text-[var(--teal)]">{msg}</p>}

      {deploys.length === 0 ? (
        <div className="card mt-6 p-8 text-center text-sm text-[var(--muted)]">
          No deploys yet. Use Ship checklist or Deploy.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {deploys.map((d) => {
            const ok = d.status === "success";
            const open = openId === d.id;
            return (
              <div key={d.id} className="card overflow-hidden p-0">
                <div
                  className={`h-1 w-full ${ok ? "bg-[var(--teal)]" : "bg-[var(--danger)]"}`}
                />
                <div className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span
                        className={
                          ok
                            ? "font-semibold text-[var(--success)]"
                            : "font-semibold text-[var(--danger)]"
                        }
                      >
                        {ok ? "Success" : "Deploy failed"}
                      </span>
                      <span className="ml-3 text-xs text-[var(--faint)]">
                        {new Date(d.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {!ok && (
                        <button
                          type="button"
                          className="btn-primary !py-1.5 !text-xs"
                          onClick={() => void copyError(d)}
                        >
                          Copy error for AI tool
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-ghost !py-1.5 !text-xs"
                        onClick={() => setOpenId(open ? null : d.id)}
                      >
                        {open ? "Hide log" : "View log"}
                      </button>
                    </div>
                  </div>
                  {d.live_url && (
                    <a
                      href={d.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm text-[var(--teal)]"
                    >
                      {d.live_url}
                    </a>
                  )}
                  {open && d.log && (
                    <pre className="mt-4 max-h-72 overflow-auto rounded-xl bg-[var(--paper)] p-4 text-xs">
                      {d.log}
                    </pre>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
