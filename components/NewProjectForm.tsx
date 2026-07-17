"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewProjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push(`/app/${data.project.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card flex flex-wrap items-end gap-3 p-5">
      <div className="min-w-[200px] flex-1">
        <label className="label">Project name</label>
        <input
          className="input"
          placeholder="e.g. atelier-landing"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <button className="btn-primary" disabled={loading} type="submit">
        {loading ? "Creating…" : "New project"}
      </button>
      {error && (
        <p className="w-full text-sm text-[var(--danger)]">{error}</p>
      )}
    </form>
  );
}
