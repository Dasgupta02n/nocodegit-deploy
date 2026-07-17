import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { OnboardingClient } from "@/components/OnboardingClient";

export default async function OnboardingPage() {
  const user = await getSessionUser();

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pb-16 pt-12">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-eyebrow">Get started</p>
            <p className="mt-2 max-w-md text-sm text-[var(--muted)]">
              Three quiet moves. No Git jargon.
            </p>
          </div>
          {user && (
            <p className="text-xs text-[var(--faint)]">
              Signed in as {user.email} ·{" "}
              <Link href="/app" className="text-[var(--teal)] hover:underline">
                Projects
              </Link>
            </p>
          )}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/onboarding.jpg"
          alt=""
          className="mb-10 h-36 w-full rounded-2xl object-cover opacity-90 mix-blend-multiply md:h-44"
        />
        <OnboardingClient loggedIn={Boolean(user)} />
      </main>
      <SiteFooter />
    </div>
  );
}
