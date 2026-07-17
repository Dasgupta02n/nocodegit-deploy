import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { AgentTokenClient } from "@/components/AgentTokenClient";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <AppShell email={user.email}>
      <div className="mb-6 text-sm text-[var(--muted)]">
        <Link href="/app" className="hover:text-[var(--ink)]">
          Projects
        </Link>
        <span> / Settings</span>
      </div>
      <p className="section-eyebrow">Settings</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">General</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Tray agent tokens ·{" "}
        <Link href="/app/billing" className="text-[var(--teal)] hover:underline">
          Billing
        </Link>
      </p>
      <AgentTokenClient />
    </AppShell>
  );
}
