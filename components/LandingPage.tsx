import type { ReactNode } from "react";
import Link from "next/link";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { TrayDownloadBanner } from "./TrayDownloadBanner";
import {
  SnippetBilling,
  SnippetDeploy,
  SnippetEnv,
  SnippetProjects,
  SnippetTimeline,
  SnippetTray,
} from "./landing/UiSnippets";

type FeatureBlock = {
  id: string;
  kicker: string;
  problem: string;
  title: string;
  body: string;
  bullets: string[];
  snippet: ReactNode;
  reverse?: boolean;
};

const FEATURES: FeatureBlock[] = [
  {
    id: "versions",
    kicker: "01 · Version vault",
    problem:
      "You ship five AI iterations before lunch. By evening, the good one is gone — buried under final_v7 and a chat you closed.",
    title: "Every good build gets a restore point",
    body: "Upload a ZIP from the web or tray. NoCodeGit keeps a calm timeline you can download anytime. Built for people who generate apps in Cursor, Lovable, v0, and Bolt — not for people who want a Git lecture.",
    bullets: [
      "See what changed between saves without learning branches",
      "Free: 300 MB per save · Pro: unlimited size",
      "One-click restore when a prompt goes wrong",
    ],
    snippet: <SnippetTimeline />,
  },
  {
    id: "deploy",
    kicker: "02 · Ship",
    problem:
      "Deploy lives in someone’s head: which hook, which token, which “production” site. When they’re offline, shipping stops.",
    title: "Ship to the host they already pay for",
    body: "Connect Netlify, Vercel, a deploy hook, SFTP, Railway, Render, Cloudflare Pages, and more. NoCodeGit packages and ships — the live app still runs on their infrastructure. You’re the control plane, not their landlord.",
    bullets: [
      "Checklist + progress while a deploy runs",
      "History and logs when something breaks",
      "Customer keeps DNS, runtime bill, and ownership",
    ],
    snippet: <SnippetDeploy />,
    reverse: true,
  },
  {
    id: "tray",
    kicker: "03 · Desktop tray",
    problem:
      "Opening five browser tabs just to not lose work kills flow. Builders want Save and Ship next to the tools they already live in.",
    title: "Save and ship from the system tray",
    body: "The Windows companion keeps the same projects as the dashboard. Zip the folder, push a version, deploy — without leaving the session that created the app.",
    bullets: [
      "Portable Windows x64 build",
      "Agent token from Settings — one config",
      "Report failures back into your loop",
    ],
    snippet: <SnippetTray />,
  },
  {
    id: "projects",
    kicker: "04 · Projects",
    problem:
      "Side projects, client work, and experiments blur together. There’s no single place that says “what’s live and where.”",
    title: "One home for every vibe project",
    body: "Create a project, attach a host, keep saves and deploys in one surface. Free for getting started; Pro when the archives get serious.",
    bullets: [
      "Clear project list with host + status",
      "Room for client work without folder chaos",
      "Same identity on web and tray",
    ],
    snippet: <SnippetProjects />,
    reverse: true,
  },
  {
    id: "env",
    kicker: "05 · Secrets & settings",
    problem:
      "API keys end up in chat logs and screenshots. Hosting credentials get copy-pasted into the wrong place.",
    title: "Env vars and host credentials, treated carefully",
    body: "Store environment variables and hosting connections in the control plane. Credentials are encrypted at rest with your app secret — designed so operators can ship without pasting secrets into Slack.",
    bullets: [
      "Encrypted credential storage",
      "Host, domain, and env settings per project",
      "Export paths for serious operators",
    ],
    snippet: <SnippetEnv />,
  },
  {
    id: "billing",
    kicker: "06 · Free → Pro",
    problem:
      "Tools either stay free forever (and die) or force enterprise pricing before anyone feels the habit.",
    title: "A pricing ladder people understand",
    body: "Start free with a real vault and deploy path. Upgrade to Pro when save size and power features matter — ₹500/mo today, easy to reprice for USD markets as distribution grows.",
    bullets: [
      "Free: 300 MB per save",
      "Pro: unlimited size + power features",
      "Razorpay-ready upgrade path",
    ],
    snippet: <SnippetBilling />,
    reverse: true,
  },
];

function FeatureRow({ f }: { f: FeatureBlock }) {
  return (
    <section
      id={f.id}
      className="scroll-mt-24 border-b border-[var(--line)] py-16 md:py-24"
    >
      <div
        className={`mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16 ${
          f.reverse ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--teal)]">
            {f.kicker}
          </p>
          <p className="mt-4 rounded-2xl border border-[var(--danger)]/15 bg-[var(--danger-soft)] px-4 py-3 text-sm leading-relaxed text-[var(--danger)]">
            <span className="font-semibold">The mess: </span>
            {f.problem}
          </p>
          <h2 className="mt-6 font-display text-3xl leading-tight text-[var(--ink)] md:text-4xl">
            {f.title}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
            {f.body}
          </p>
          <ul className="mt-6 space-y-3">
            {f.bullets.map((b) => (
              <li key={b} className="flex gap-3 text-sm text-[var(--ink)]">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--teal-soft)] text-[10px] font-bold text-[var(--teal)]"
                  aria-hidden
                >
                  ✓
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:sticky lg:top-28">{f.snippet}</div>
      </div>
    </section>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--paper)]" data-page="landing">
      <SiteHeader />

      {/* HUMAN HERO */}
      <section className="relative overflow-hidden border-b border-[var(--line)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_10%_0%,_var(--teal-soft),_transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-12 md:pb-24 md:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6">
              <p className="text-sm font-medium text-[var(--teal)]">
                For people who build with AI — and still need last Tuesday’s
                version.
              </p>
              <h1 className="mt-5 font-display text-[2.75rem] leading-[1.08] tracking-tight text-[var(--ink)] sm:text-5xl md:text-6xl">
                You didn’t lose the plot.
                <br />
                <span className="text-[var(--muted)]">
                  You lost the folder.
                </span>
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--muted)] md:text-lg">
                NoCodeGit is a calm place to{" "}
                <strong className="font-semibold text-[var(--ink)]">
                  save every vibe build
                </strong>{" "}
                and{" "}
                <strong className="font-semibold text-[var(--ink)]">
                  ship it to your own host
                </strong>
                . No Git ceremony. No “we host your production.” Just memory and
                a ship button.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/signup" className="btn-clay btn-lg">
                  Start free — it takes a minute
                </Link>
                <a href="#versions" className="btn-secondary btn-lg">
                  Scroll the product →
                </a>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/landing-human.jpg"
                    alt=""
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-[var(--paper)]"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/landing-team.jpg"
                    alt=""
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-[var(--paper)]"
                  />
                </div>
                <p className="max-w-[14rem] text-xs leading-snug text-[var(--faint)]">
                  Made for solo builders and tiny teams shipping from chat —
                  not for enterprise Git theatres.
                </p>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative">
                <div className="overflow-hidden rounded-[1.75rem] border border-[var(--line)] shadow-[var(--shadow-lg)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/landing-human.jpg"
                    alt="A builder at their desk — the person NoCodeGit is for"
                    className="aspect-[5/4] w-full object-cover object-top"
                  />
                </div>
                <div className="absolute -bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-72">
                  <div className="rounded-2xl border border-[var(--line)] bg-white/95 p-4 shadow-[var(--shadow-lg)] backdrop-blur">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--clay)]">
                      How it feels
                    </p>
                    <p className="mt-1.5 text-sm font-medium leading-snug text-[var(--ink)]">
                      “I closed the tab. I still have the build that worked.”
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 grid gap-4 sm:grid-cols-3">
            {[
              ["Save", "ZIP vault with a real timeline"],
              ["Ship", "Deploy to Netlify, Vercel, SFTP…"],
              ["Still", "Your host runs the live app"],
            ].map(([t, d]) => (
              <div
                key={t}
                className="rounded-2xl border border-[var(--line)] bg-white/80 px-5 py-4 shadow-sm"
              >
                <p className="font-display text-2xl text-[var(--ink)]">{t}.</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTRO STRIP */}
      <section className="border-b border-[var(--line)] bg-white px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-eyebrow">Scroll the product</p>
            <h2 className="mt-2 max-w-xl font-display text-3xl text-[var(--ink)] md:text-4xl">
              Each feature is a problem you’ve already had.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-[var(--muted)]">
            Keep scrolling. Left side: the mess. Right side: the actual product
            surface — as it looks in NoCodeGit.
          </p>
        </div>
      </section>

      {/* FEATURE STORY */}
      {FEATURES.map((f) => (
        <FeatureRow key={f.id} f={f} />
      ))}

      {/* TOGETHER */}
      <section className="border-b border-[var(--line)] bg-[#faf8f5] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="overflow-hidden rounded-[1.75rem] border border-[var(--line)] shadow-[var(--shadow-lg)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/landing-team.jpg"
                alt="Builders collaborating — the team NoCodeGit supports"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div>
              <p className="section-eyebrow">Why it matters</p>
              <h2 className="mt-3 font-display text-4xl text-[var(--ink)]">
                AI made creation cheap.
                <br />
                Memory is still expensive.
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-[var(--muted)]">
                Generators will keep multiplying. Someone has to own{" "}
                <em>what happened after the chat</em> — the save that worked,
                the deploy that went live, the key that shouldn’t sit in
                Discord. That’s the job NoCodeGit takes.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-[var(--ink)]">
                <li className="flex gap-2">
                  <span className="text-[var(--teal)]">→</span> Not a host —
                  lower liability, clearer story
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--teal)]">→</span> Not Git —
                  matches how vibe builders already work
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--teal)]">→</span> Free → Pro path
                  already productized
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* TRAY BAND */}
      <section className="border-b border-[var(--line)] bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <TrayDownloadBanner />
        </div>
      </section>

      {/* PRICING compact */}
      <section id="pricing" className="scroll-mt-24 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="section-eyebrow">Pricing</p>
          <h2 className="mt-3 font-display text-4xl text-[var(--ink)]">
            Start free. Grow when it hurts to stay free.
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--line)] bg-white p-8 shadow-[var(--shadow)]">
              <p className="text-sm font-semibold text-[var(--teal)]">Free</p>
              <p className="mt-2 font-display text-4xl">$0</p>
              <ul className="mt-6 space-y-2 text-sm text-[var(--muted)]">
                <li>· Version vault + deploy</li>
                <li>· 300 MB per save</li>
                <li>· Windows tray</li>
              </ul>
              <Link href="/signup" className="btn-secondary mt-8 inline-flex">
                Create free account
              </Link>
            </div>
            <div className="rounded-2xl border-2 border-[var(--teal)] bg-white p-8 shadow-[var(--shadow-lg)]">
              <p className="text-sm font-semibold text-[var(--teal)]">Pro</p>
              <p className="mt-2 font-display text-4xl">
                ₹500<span className="text-lg text-[var(--muted)]">/mo</span>
              </p>
              <ul className="mt-6 space-y-2 text-sm text-[var(--muted)]">
                <li>· Unlimited save size</li>
                <li>· Ads & affiliate tools</li>
                <li>· Everything in Free</li>
              </ul>
              <Link href="/signup" className="btn-primary mt-8 inline-flex">
                Start free, upgrade later
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BUYER NOTE — quieter, professional */}
      <section
        id="for-buyers"
        className="scroll-mt-24 border-t border-[var(--line)] bg-[var(--ink)] px-6 py-16 text-white"
      >
        <div className="mx-auto max-w-6xl md:flex md:items-end md:justify-between md:gap-12">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--clay)]">
              For product acquirers
            </p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">
              A finished control plane in a market that still needs one.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/65">
              You’re not buying a landing page. You’re buying versions, deploy
              orchestration, tray agent, billing path, and Docker ops — aimed at
              the vibe-coding wave. Distribution is the unlock; the product
              surface is already here.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 md:mt-0">
            <Link
              href="/signup"
              className="btn-lg rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)]"
            >
              Try the product
            </Link>
            <a
              href="#versions"
              className="btn-lg rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white"
            >
              Review features
            </a>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-4xl text-[var(--ink)] md:text-5xl">
            Keep the build that worked.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            Free to start. Your host runs production. NoCodeGit remembers the
            rest.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="btn-clay btn-lg">
              Create free account →
            </Link>
            <Link href="/download" className="btn-secondary btn-lg">
              Get the tray
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
