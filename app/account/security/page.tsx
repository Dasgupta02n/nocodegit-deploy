import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { SessionsPanel } from "@/components/SessionsPanel";
import { EmailVerifyBanner } from "@/components/EmailVerifyBanner";

export default async function AccountSecurityPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <AppShell email={user.email}>
      <div className="mb-6 text-sm text-[var(--muted)]">
        <Link href="/app" className="hover:text-[var(--ink)]">
          Projects
        </Link>
        <span> / </span>
        <Link href="/account" className="hover:text-[var(--ink)]">
          Account
        </Link>
        <span> / Security</span>
      </div>
      <p className="section-eyebrow">Security</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">
        Password &amp; access
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Keep your control-plane account safe. Agent tokens live under{" "}
        <Link href="/app/settings" className="text-[var(--teal)] hover:underline">
          Settings
        </Link>
        .
      </p>
      <div className="mt-6">
        <EmailVerifyBanner verified={!!user.email_verified} />
      </div>
      <ChangePasswordForm />
      <SessionsPanel />
    </AppShell>
  );
}
