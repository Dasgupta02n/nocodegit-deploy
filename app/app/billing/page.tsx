import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { BillingClient } from "@/components/BillingClient";
import { PLANS } from "@/lib/stripe";
import { config } from "@/lib/config";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const sp = await searchParams;

  return (
    <AppShell email={user.email}>
      <div className="mb-6 text-sm text-[var(--muted)]">
        <Link href="/app" className="hover:text-[var(--ink)]">
          Projects
        </Link>
        <span> / Billing</span>
      </div>
      <h1 className="text-2xl font-semibold">Billing</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Current plan:{" "}
        <strong className="text-[var(--ink)]">{user.plan || "free"}</strong>
        {user.plan_status ? ` (${user.plan_status})` : ""}
      </p>
      {sp.success && (
        <p className="mt-4 rounded-xl bg-[var(--teal-soft)] px-4 py-3 text-sm text-[var(--teal)]">
          Payment successful. Plan updates when Stripe webhook confirms.
        </p>
      )}
      {sp.canceled && (
        <p className="mt-4 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
          Checkout canceled.
        </p>
      )}
      <BillingClient
        stripeEnabled={config.stripeEnabled}
        currentPlan={user.plan || "free"}
        plans={Object.values(PLANS)}
      />
    </AppShell>
  );
}
