"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    title: "Save versions",
    body: "ZIP snapshots with a calm timeline — no Git jargon.",
    color: "from-violet-500 to-fuchsia-500",
    emoji: "💾",
  },
  {
    title: "Ship to your host",
    body: "Vercel, Netlify, hooks, SFTP — your account, your bill.",
    color: "from-cyan-400 to-blue-500",
    emoji: "🚀",
  },
  {
    title: "API keys safe",
    body: "Encrypted vault. Push to Netlify/Vercel when you deploy.",
    color: "from-amber-400 to-orange-500",
    emoji: "🔑",
  },
  {
    title: "Ads editor (Pro)",
    body: "$5/mo · unlimited size · update ads & affiliates.",
    color: "from-pink-500 to-rose-500",
    emoji: "✨",
  },
];

const MARQUEE = [
  "Lovable",
  "Bolt",
  "Cursor",
  "v0",
  "Replit",
  "Netlify",
  "Vercel",
  "SFTP",
  "Stripe",
  "OpenAI",
];

export function LandingPage() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 4200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="hero-mesh min-h-screen overflow-x-hidden">
      {/* floating blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-blob absolute -left-20 top-20 h-72 w-72 rounded-full bg-pink-400/30 blur-3xl" />
        <div
          className="animate-blob absolute -right-16 top-40 h-80 w-80 rounded-full bg-violet-500/25 blur-3xl"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="animate-blob absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 text-sm font-bold text-white shadow-lg shadow-violet-500/30">
            N
          </span>
          <div>
            <div className="text-lg font-bold tracking-tight">NoCodeGit</div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-violet-500">
              nocodegit.tech
            </div>
          </div>
        </div>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link href="/docs" className="btn-ghost hidden sm:inline-flex">
            Docs
          </Link>
          <Link href="/login" className="btn-ghost">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary animate-pulse-glow">
            Start free
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-10 md:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3 py-1 text-xs font-semibold text-violet-700 shadow-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-500" />
              Save · Ship · Still
            </div>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
              Git for vibe coders —{" "}
              <span className="gradient-text">without the Git</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-[var(--muted)]">
              Version your AI-built apps, deploy to{" "}
              <strong className="text-[var(--ink)]">your</strong> host, manage
              keys. Free{" "}
              <strong className="text-violet-600">300&nbsp;MB</strong> saves ·
              Pro{" "}
              <strong className="text-pink-600">$5/mo</strong> unlimited + ads
              editor.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary px-8 py-3.5 text-base">
                Create free account
              </Link>
              <Link
                href="/app/billing"
                className="btn-secondary px-8 py-3.5 text-base"
              >
                Go Pro — $5
              </Link>
            </div>
            <p className="mt-4 text-xs text-[var(--faint)]">
              We never host your live app. Netlify · Vercel · hooks · SFTP
            </p>
          </div>

          {/* Carousel card stack */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="animate-float-slow absolute -right-4 -top-6 z-0 h-40 w-40 rounded-3xl bg-gradient-to-br from-pink-400 to-violet-500 opacity-80 blur-sm" />
            <div
              className="animate-float absolute -bottom-8 -left-6 z-0 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-300 to-blue-500 opacity-70"
              style={{ animationDelay: "1s" }}
            />
            <div className="glass relative z-10 overflow-hidden rounded-3xl p-2 shadow-2xl shadow-violet-500/20">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-400 p-6 text-white">
                {SLIDES.map((s, idx) => (
                  <div
                    key={s.title}
                    className={`absolute inset-0 flex flex-col justify-end p-6 transition-all duration-700 ${
                      idx === i
                        ? "translate-x-0 opacity-100"
                        : idx < i
                          ? "-translate-x-8 opacity-0"
                          : "translate-x-8 opacity-0"
                    }`}
                  >
                    <div className="mb-3 text-4xl">{s.emoji}</div>
                    <h2 className="text-2xl font-bold drop-shadow">{s.title}</h2>
                    <p className="mt-1 text-sm text-white/90">{s.body}</p>
                  </div>
                ))}
                <div className="absolute bottom-4 right-4 flex gap-1.5">
                  {SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      aria-label={`Slide ${idx + 1}`}
                      onClick={() => setI(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === i ? "w-6 bg-white" : "w-2 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
              {/* mini UI mock floating */}
              <div className="animate-float mt-3 grid grid-cols-3 gap-2 p-2">
                {["Save", "Deploy", "Report"].map((b, idx) => (
                  <div
                    key={b}
                    className="rounded-xl bg-gradient-to-br from-violet-50 to-pink-50 py-3 text-center text-xs font-bold text-violet-700 shadow-sm"
                    style={{ animationDelay: `${idx * 0.2}s` }}
                  >
                    {b}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="mt-20 overflow-hidden border-y border-violet-100 py-4">
          <div className="carousel-track animate-marquee">
            {[...MARQUEE, ...MARQUEE].map((t, idx) => (
              <span
                key={`${t}-${idx}`}
                className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-violet-600 shadow-sm ring-1 ring-violet-100"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Feature bento */}
        <section className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            {
              t: "Free · 300 MB",
              d: "Upload vibe exports, timeline, deploy to your host. Ads already in code still ship.",
              c: "from-violet-500 to-purple-600",
            },
            {
              t: "Pro · $5/mo",
              d: "Unlimited codebase size. Ads & affiliate editor. Replace snippets each deploy.",
              c: "from-pink-500 to-rose-500",
            },
            {
              t: "Your infrastructure",
              d: "Database URL, env keys, Netlify env push. We store versions — you own the site.",
              c: "from-cyan-400 to-sky-500",
            },
          ].map((f, idx) => (
            <div
              key={f.t}
              className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-lg shadow-violet-500/10 ring-1 ring-violet-100 transition hover:-translate-y-1 hover:shadow-xl"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div
                className={`mb-4 h-12 w-12 rounded-2xl bg-gradient-to-br ${f.c} shadow-lg`}
              />
              <h3 className="text-lg font-bold">{f.t}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{f.d}</p>
            </div>
          ))}
        </section>

        {/* Pricing strip */}
        <section className="mt-20 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 ring-1 ring-violet-100">
            <h2 className="text-xl font-bold">Free</h2>
            <p className="mt-2 text-4xl font-extrabold text-violet-600">$0</p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
              <li>✓ 300 MB per save</li>
              <li>✓ Deploy to your host</li>
              <li>✓ API keys & environment</li>
              <li>✓ Deploy code that already has ads</li>
              <li className="text-[var(--faint)]">✗ Ads / affiliate editor</li>
            </ul>
            <Link href="/signup" className="btn-secondary mt-6 w-full">
              Start free
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 p-8 text-white shadow-2xl shadow-pink-500/30">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
            <h2 className="text-xl font-bold">Pro</h2>
            <p className="mt-2 text-4xl font-extrabold">$5/mo</p>
            <ul className="mt-4 space-y-2 text-sm text-white/90">
              <li>✓ Unlimited upload size</li>
              <li>✓ Ads & affiliate editor</li>
              <li>✓ Replace on every deploy</li>
              <li>✓ More projects</li>
              <li>✓ Everything in Free</li>
            </ul>
            <Link
              href="/signup"
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-white py-3 text-sm font-bold text-violet-700 shadow-lg"
            >
              Upgrade after signup
            </Link>
          </div>
        </section>

        <section className="mt-20 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Ready to ship without the Git headache?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[var(--muted)]">
            Join NoCodeGit — versions, deploy, keys. Bright, simple, yours.
          </p>
          <Link
            href="/signup"
            className="btn-primary mt-8 inline-flex px-10 py-4 text-base"
          >
            Get started free
          </Link>
        </section>
      </main>

      <footer className="relative z-10 border-t border-violet-100 py-10 text-center text-xs text-[var(--faint)]">
        <div className="font-semibold text-violet-600">nocodegit.tech</div>
        <div className="mt-2">
          <Link href="/legal/privacy" className="hover:text-violet-600">
            Privacy
          </Link>
          {" · "}
          <Link href="/legal/terms" className="hover:text-violet-600">
            Terms
          </Link>
          {" · "}
          <Link href="/docs" className="hover:text-violet-600">
            Docs
          </Link>
        </div>
      </footer>
    </div>
  );
}
