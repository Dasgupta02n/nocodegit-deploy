"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function LiveDeployPanel({
  projectId,
  deployId,
  onDone,
}: {
  projectId: string;
  deployId: string;
  onDone?: () => void;
}) {
  const [progress, setProgress] = useState(5);
  const [status, setStatus] = useState("running");
  const [log, setLog] = useState("Starting…");
  const [liveUrl, setLiveUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(
          `/api/projects/${projectId}/deploys/${deployId}`
        );
        const data = await res.json();
        if (!res.ok || cancelled) return;
        setProgress(data.deploy?.progress ?? 0);
        setStatus(data.deploy?.status || "running");
        setLog(data.deploy?.log || "");
        setLiveUrl(data.deploy?.live_url || null);
        if (data.deploy?.done) {
          onDone?.();
          return;
        }
      } catch {
        /* ignore */
      }
      if (!cancelled) setTimeout(tick, 800);
    };
    void tick();
    return () => {
      cancelled = true;
    };
  }, [projectId, deployId, onDone]);

  const failed = status === "failed";
  const ok = status === "success";

  return (
    <div className="card overflow-hidden p-0">
      <div
        className={`h-1.5 w-full transition-all ${
          failed ? "bg-[var(--danger)]" : "bg-[var(--teal)]"
        }`}
        style={{ width: `${progress}%`, maxWidth: "100%" }}
      />
      <div className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p
              className={`text-lg font-semibold ${
                failed
                  ? "text-[var(--danger)]"
                  : ok
                    ? "text-[var(--success)]"
                    : "text-[var(--teal)]"
              }`}
            >
              {failed
                ? "Deploy failed"
                : ok
                  ? "Deploy succeeded"
                  : "Deploying…"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {progress}% · {status}
            </p>
          </div>
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              Open live site
            </a>
          )}
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--line)]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              failed ? "bg-[var(--danger)]" : "bg-[var(--teal)]"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <pre className="mt-4 max-h-64 overflow-auto rounded-xl bg-[var(--paper)] p-4 text-xs whitespace-pre-wrap">
          {log}
        </pre>
        <Link
          href={`/app/${projectId}/deploy`}
          className="mt-4 inline-block text-sm text-[var(--teal)]"
        >
          Full deploy history →
        </Link>
      </div>
    </div>
  );
}
