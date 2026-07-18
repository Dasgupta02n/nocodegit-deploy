"use client";

import { useState } from "react";

const TABS = [
  {
    id: "versions",
    label: "Version vault",
    title: "Every vibe session is recoverable",
    body: "Upload a ZIP. Get a calm timeline of restore points. No branches, no merge hell, no “which folder was production?”. Builders who ship from Cursor, Lovable, v0, and Bolt finally get memory without learning Git.",
    points: [
      "Free tier: 300 MB per save — enough to start",
      "Pro: unlimited size for serious projects",
      "Download any past save in one click",
    ],
    image: "/images/feature-versions.jpg",
    imageAlt: "Version timeline concept for project saves",
  },
  {
    id: "deploy",
    label: "Ship to their host",
    title: "Deploy to infrastructure they already pay for",
    body: "Netlify, Vercel, hooks, SFTP, Railway, Render, Cloudflare Pages, and more. NoCodeGit is the control plane — the live app stays on the customer’s host. That is a cleaner liability story than “we host your production.”",
    points: [
      "One Ship action from web or tray",
      "Deploy history + logs for support",
      "Customer owns DNS, keys, and runtime bill",
    ],
    image: "/images/feature-deploy.jpg",
    imageAlt: "Deploy workflow to customer hosting",
  },
  {
    id: "tray",
    label: "Desktop tray",
    title: "Save and ship without leaving the flow",
    body: "Windows tray companion keeps Save, Ship, and Report beside the builder’s tools. Same projects as the dashboard. Same agent token. Built for people who refuse to open five tabs just to not lose work.",
    points: [
      "Portable Windows x64 build",
      "Agent token from Settings",
      "Report failures back into the loop",
    ],
    image: "/images/landing-tray.jpg",
    imageAlt: "Desktop workflow with tray companion concept",
  },
  {
    id: "control",
    label: "Control plane",
    title: "Projects, env, domains, ads — one calm surface",
    body: "Hosting connections, environment variables, domain notes, snippets, affiliate links, billing. Everything operators need without turning NoCodeGit into another PaaS. Buyers inherit a product with room to grow MRR, not a science project.",
    points: [
      "Encrypted hosting credentials at rest",
      "Free + Pro pricing already wired (Razorpay)",
      "SQLite + Docker — simple ops, low COGS",
    ],
    image: "/images/landing-dashboard.jpg",
    imageAlt: "Product dashboard aesthetic",
  },
] as const;

export function FeatureTabs() {
  const [active, setActive] = useState(0);
  const tab = TABS[active];

  return (
    <div className="mt-10">
      <div
        className="flex flex-wrap gap-2 rounded-2xl border border-[var(--line)] bg-white/70 p-2 shadow-[var(--shadow)]"
        role="tablist"
        aria-label="Product capabilities"
      >
        {TABS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
              i === active
                ? "bg-[var(--teal)] text-white shadow-sm"
                : "text-[var(--muted)] hover:bg-[var(--teal-soft)] hover:text-[var(--teal)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="section-eyebrow">Capability</p>
          <h3 className="mt-2 font-display text-3xl text-[var(--ink)] md:text-4xl">
            {tab.title}
          </h3>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
            {tab.body}
          </p>
          <ul className="mt-6 space-y-3">
            {tab.points.map((p) => (
              <li key={p} className="flex gap-3 text-sm text-[var(--ink)]">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--teal-soft)] text-xs font-bold text-[var(--teal)]"
                  aria-hidden
                >
                  ✓
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow-lg)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tab.image}
            alt={tab.imageAlt}
            className="aspect-[4/3] w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-5 pt-16">
            <p className="text-sm font-semibold text-white">{tab.label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
