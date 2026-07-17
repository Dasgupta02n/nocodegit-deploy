"use client";

import { useState } from "react";
import Link from "next/link";

const STEPS = [
  {
    id: 1,
    title: "Welcome",
    body: "NoCodeGit is your calm control plane — version vault and one-click deploy. Your host runs the live app; we never do.",
  },
  {
    id: 2,
    title: "Download the tray",
    body: "Install the Windows desktop tray so Save, Deploy, and Report sit in your system tray while you build.",
  },
  {
    id: 3,
    title: "Connect hosting",
    body: "Open a project, link Netlify, Vercel, a deploy hook, or SFTP, then ship from the checklist.",
  },
] as const;

export function OnboardingClient({ loggedIn }: { loggedIn: boolean }) {
  const [step, setStep] = useState(1);
  const current = STEPS[step - 1];

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(s.id)}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s.id <= step ? "bg-[var(--teal)]" : "bg-[var(--line)]"
            }`}
            aria-label={`Step ${s.id}: ${s.title}`}
          />
        ))}
      </div>

      <p className="section-eyebrow">
        Step {step} of {STEPS.length}
      </p>
      <h1 className="mt-2 font-display text-3xl text-[var(--ink)] md:text-4xl">
        {current.title}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
        {current.body}
      </p>

      <div className="card mt-8 p-6">
        {step === 1 && (
          <div className="space-y-4">
            {loggedIn ? (
              <>
                <p className="text-sm text-[var(--muted)]">
                  You&apos;re signed in. Continue to set up the desktop tray and
                  connect hosting.
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setStep(2)}
                >
                  Continue →
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-[var(--muted)]">
                  Create a free account to store project saves and agent tokens.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/signup" className="btn-primary">
                    Create account →
                  </Link>
                  <Link href="/login" className="btn-secondary">
                    Log in
                  </Link>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setStep(2)}
                  >
                    Skip for now
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--muted)]">
              Windows x64 portable tray. After install, set{" "}
              <code className="rounded bg-[var(--paper)] px-1">apiUrl</code>,
              token from Settings, project id, and folder path.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/download" className="btn-primary">
                Download tray →
              </Link>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setStep(3)}
              >
                Next →
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setStep(1)}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--muted)]">
              Hosting credentials stay encrypted on NoCodeGit. Live traffic
              always hits your provider, not ours.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={loggedIn ? "/app" : "/signup"}
                className="btn-primary"
              >
                {loggedIn ? "Open projects →" : "Sign up to connect →"}
              </Link>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setStep(2)}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
