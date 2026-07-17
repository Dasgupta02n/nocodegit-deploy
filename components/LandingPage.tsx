"use client";

import Link from "next/link";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { PierIcon } from "./BrandLogo";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <SiteHeader />

      {/* Hero — Quay mockup: display wordmark + pier line + clay CTA */}
      <section className="relative mx-auto max-w-5xl overflow-hidden px-6 pb-20 pt-16 md:pt-24">
        <div className="pointer-events-none absolute right-0 top-8 hidden w-[48%] opacity-70 md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/hero-pier.jpg"
            alt=""
            className="w-full rounded-2xl object-cover object-left opacity-90 mix-blend-multiply"
          />
        </div>

        <div className="relative z-10 max-w-xl">
          <p className="font-display text-5xl tracking-tight text-[var(--ink)] md:text-7xl">
            NoCodeGit
          </p>
          <p className="mt-4 text-xl font-medium tracking-tight text-[var(--ink)] md:text-2xl">
            Save. Ship. Still.
          </p>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--muted)]">
            Version vault and one-click deploy for vibe-coded projects. Your
            host runs the live app — we never do.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="btn-clay btn-lg">
              Get started →
            </Link>
            <Link href="/download" className="btn-secondary btn-lg">
              Download for desktop
            </Link>
          </div>
          <p className="mt-3 text-xs text-[var(--faint)]">macOS · Windows</p>
        </div>

        <div className="relative z-10 mt-16 md:hidden">
          <PierIcon className="h-16 w-24 opacity-50" />
        </div>
      </section>

      {/* Three steps — calm cards like brand board */}
      <section className="border-t border-[var(--line)] bg-[#faf8f5] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="section-eyebrow">How it works</p>
          <h2 className="mt-2 font-display text-3xl text-[var(--ink)] md:text-4xl">
            Three quiet moves.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                t: "Save",
                d: "Upload a ZIP of your project. A calm timeline of restore points — no Git jargon.",
                n: "01",
              },
              {
                t: "Connect",
                d: "Link Netlify, Vercel, a deploy hook, or SFTP. Your account, your bill.",
                n: "02",
              },
              {
                t: "Ship",
                d: "One Deploy. We package and send to your host. Report errors back to your vibe tool.",
                n: "03",
              },
            ].map((c) => (
              <article key={c.t} className="card p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--teal)]">
                    {c.t}
                  </span>
                  <span className="text-xs font-medium text-[var(--faint)]">
                    {c.n}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
                  {c.d}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Brand metrics strip */}
      <section className="mx-auto grid max-w-5xl gap-5 px-6 py-16 md:grid-cols-3">
        <div className="card p-6">
          <div className="text-sm font-semibold text-[var(--teal)]">Free</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">
            300 MB
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Per save. Deploy to your host. Keys encrypted.
          </p>
        </div>
        <div className="card p-6">
          <div className="text-sm font-semibold text-[var(--teal)]">Pro</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">$5/mo</div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Unlimited size. Ads & affiliate editor.
          </p>
        </div>
        <div className="card p-6">
          <div className="text-sm font-semibold text-[var(--teal)]">
            Control plane
          </div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">0</div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Live apps hosted on NoCodeGit. Always yours.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl rounded-2xl border border-[var(--line)] bg-white px-8 py-12 text-center shadow-[var(--shadow)]">
          <h2 className="font-display text-3xl text-[var(--ink)] md:text-4xl">
            Save. Ship. Still.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-[var(--muted)]">
            Desktop tray + web dashboard. Built for teams who refuse to lose
            track of their work.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="btn-primary btn-lg">
              Get started →
            </Link>
            <Link href="/docs" className="btn-secondary btn-lg">
              Read the docs
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
