"use client";

import { useState } from "react";
import Link from "next/link";

type Plan = {
  id: string;
  name: string;
  priceLabel: string;
  projects: number;
  maxUpload: string;
  adsEditor: boolean;
  features: readonly string[];
};

export function BillingClient({
  stripeEnabled,
  currentPlan,
  plans,
}: {
  stripeEnabled: boolean;
  currentPlan: string;
  plans: Plan[];
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function checkout() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function portal() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Portal failed");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  const isPro =
    currentPlan === "pro" ||
    currentPlan === "solo" ||
    currentPlan === "studio";

  return (
    <div className="mt-8">
      {!stripeEnabled && (
        <div className="card mb-6 p-4 text-sm text-[var(--muted)]">
          Stripe is not configured yet. Add{" "}
          <code className="text-[var(--ink)]">STRIPE_SECRET_KEY</code> and{" "}
          <code className="text-[var(--ink)]">STRIPE_PRICE_PRO</code> (and
          webhook secret) for $5/mo Pro. Free plan works without Stripe.
        </div>
      )}
      {err && (
        <p className="mb-4 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
          {err}
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`card p-6 ${
              (p.id === "pro" && isPro) || (p.id === "free" && !isPro)
                ? "border-[var(--teal)]"
                : ""
            }`}
          >
            <h2 className="text-lg font-semibold">{p.name}</h2>
            <p className="mt-1 text-2xl font-semibold text-[var(--teal)]">
              {p.priceLabel}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
              {p.features.map((f) => (
                <li key={f}>· {f}</li>
              ))}
            </ul>
            {p.id === "free" ? (
              <p className="mt-6 text-xs text-[var(--faint)]">
                {!isPro ? "Current plan" : "Included as fallback if you cancel"}
              </p>
            ) : (
              <button
                type="button"
                className="btn-primary mt-6 w-full"
                disabled={busy || !stripeEnabled || isPro}
                onClick={checkout}
              >
                {isPro ? "Current plan" : "Upgrade to Pro — $5/mo"}
              </button>
            )}
          </div>
        ))}
      </div>
      {stripeEnabled && isPro && (
        <button
          type="button"
          className="btn-secondary mt-8"
          disabled={busy}
          onClick={portal}
        >
          Manage subscription (Stripe portal)
        </button>
      )}
      <p className="mt-6 text-xs text-[var(--faint)]">
        Free users can deploy projects that already contain ad/affiliate code.
        Only Pro can open the Ads & affiliates editor.{" "}
        <Link href="/docs" className="text-[var(--teal)]">
          Learn more
        </Link>
      </p>
    </div>
  );
}
