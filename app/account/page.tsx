import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <AppShell email={user.email}>
      <div className="mb-6 text-sm text-[var(--muted)]">
        <Link href="/app" className="hover:text-[var(--ink)]">
          Projects
        </Link>
        <span> / Account</span>
      </div>
      <p className="section-eyebrow">Account</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Your account</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Profile, security, and billing for your NoCodeGit control plane.
      </p>

      <div className="card mt-8 max-w-lg space-y-3 p-6">
        <div>
          <div className="text-xs font-medium text-[var(--faint)]">Email</div>
          <div className="mt-1 text-sm text-[var(--ink)]">{user.email}</div>
        </div>
        {user.name && (
          <div>
            <div className="text-xs font-medium text-[var(--faint)]">Name</div>
            <div className="mt-1 text-sm text-[var(--ink)]">{user.name}</div>
          </div>
        )}
        <div>
          <div className="text-xs font-medium text-[var(--faint)]">Plan</div>
          <div className="mt-1 text-sm text-[var(--ink)]">
            {user.plan || "free"}
            {user.plan_status ? ` (${user.plan_status})` : ""}
          </div>
        </div>
      </div>

      <div className="mt-8 grid max-w-lg gap-4 sm:grid-cols-2">
        <Link href="/account/security" className="card block p-5 hover:border-[var(--teal)]">
          <div className="text-sm font-semibold text-[var(--ink)]">Security</div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Change password
          </p>
        </Link>
        <Link href="/account/billing" className="card block p-5 hover:border-[var(--teal)]">
          <div className="text-sm font-semibold text-[var(--ink)]">Billing</div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Plans and invoices
          </p>
        </Link>
        <Link href="/app/settings" className="card block p-5 hover:border-[var(--teal)]">
          <div className="text-sm font-semibold text-[var(--ink)]">Settings</div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Tray agent tokens
          </p>
        </Link>
        <Link href="/download" className="card block p-5 hover:border-[var(--teal)]">
          <div className="text-sm font-semibold text-[var(--ink)]">Desktop tray</div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Download &amp; configure
          </p>
        </Link>
      </div>
    </AppShell>
  );
}
