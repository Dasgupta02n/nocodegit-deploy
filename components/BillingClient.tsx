"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";

type Plan = {
  id: string;
  name: string;
  priceLabel: string;
  projects: number;
  maxUpload: string;
  adsEditor: boolean;
  features: readonly string[];
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, cb: (resp: unknown) => void) => void;
    };
  }
}

/** Razorpay Payment Button (Dashboard → Payment Buttons → embed script). */
function RazorpayPaymentButton({ buttonId }: { buttonId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form || !buttonId) return;

    // Clear previous injects (Strict Mode remount / navigation)
    form.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/payment-button.js";
    script.async = true;
    script.setAttribute("data-payment_button_id", buttonId);
    form.appendChild(script);

    return () => {
      form.innerHTML = "";
    };
  }, [buttonId]);

  return (
    <form
      ref={formRef}
      className="razorpay-payment-button flex min-h-[44px] w-full justify-center [&_button]:w-full"
    />
  );
}

export function BillingClient({
  razorpayEnabled,
  paymentButtonId,
  subscriptionEnabled,
  currentPlan,
  plans,
}: {
  razorpayEnabled: boolean;
  /** Razorpay Payment Button id (pl_...) */
  paymentButtonId?: string;
  /** True when KEY + SECRET + PLAN_PRO allow API subscription checkout */
  subscriptionEnabled?: boolean;
  /** @deprecated alias */
  stripeEnabled?: boolean;
  currentPlan: string;
  plans: Plan[];
}) {
  const enabled = razorpayEnabled;
  const buttonId = paymentButtonId || "";
  const apiCheckout = Boolean(subscriptionEnabled);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function checkout() {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      if (!window.Razorpay) {
        throw new Error("Razorpay Checkout script not loaded yet. Try again.");
      }

      const rzp = new window.Razorpay({
        key: data.key,
        subscription_id: data.subscription_id,
        name: data.name || "NoCodeGit",
        description: data.description || "Pro plan",
        prefill: data.prefill || {},
        theme: { color: "#2F6F6B" },
        handler: function () {
          setMsg(
            "Payment received. Plan activates when Razorpay confirms (webhook)."
          );
          window.location.href = "/app/billing?success=1";
        },
      });
      rzp.on("payment.failed", (resp: unknown) => {
        console.error(resp);
        setErr("Payment failed or was cancelled.");
      });
      rzp.open();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function cancelSub() {
    if (!confirm("Cancel Pro subscription?")) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cancel failed");
      setMsg(data.message || "Subscription canceled.");
      window.location.reload();
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
      {apiCheckout && (
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      )}
      {!enabled && (
        <div className="card mb-6 p-4 text-sm text-[var(--muted)]">
          Razorpay is not configured yet. Free plan works without it. Set{" "}
          <code className="text-[var(--ink)]">RAZORPAY_PAYMENT_BUTTON_ID</code>{" "}
          (Payment Button) and/or{" "}
          <code className="text-[var(--ink)]">RAZORPAY_KEY_ID</code>,{" "}
          <code className="text-[var(--ink)]">RAZORPAY_KEY_SECRET</code>, and{" "}
          <code className="text-[var(--ink)]">RAZORPAY_PLAN_PRO</code>.
        </div>
      )}
      {err && (
        <p className="mb-4 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
          {err}
        </p>
      )}
      {msg && (
        <p className="mb-4 rounded-xl bg-[var(--teal-soft)] px-4 py-3 text-sm text-[var(--teal)]">
          {msg}
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((p) => {
          const active =
            (p.id === "pro" && isPro) || (p.id === "free" && !isPro);
          return (
            <div
              key={p.id}
              className={`card p-6 ${active ? "ring-2 ring-[var(--teal)]" : ""}`}
            >
              <div className="text-sm font-semibold text-[var(--teal)]">
                {p.name}
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-tight">
                {p.priceLabel}
              </div>
              <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                {p.features.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
              <div className="mt-6">
                {p.id === "free" && (
                  <Link href="/app" className="btn-secondary w-full">
                    {active ? "Current plan" : "Use free"}
                  </Link>
                )}
                {p.id === "pro" &&
                  (isPro ? (
                    <button
                      type="button"
                      className="btn-secondary w-full"
                      disabled={busy || !apiCheckout}
                      onClick={() => void cancelSub()}
                      title={
                        !apiCheckout
                          ? "Cancel via API needs subscription keys; manage in Razorpay Dashboard if you paid with Payment Button."
                          : undefined
                      }
                    >
                      {apiCheckout ? "Cancel Pro" : "Pro active"}
                    </button>
                  ) : buttonId ? (
                    <div className="space-y-3">
                      <RazorpayPaymentButton buttonId={buttonId} />
                      <p className="text-center text-xs text-[var(--faint)]">
                        Pay with Razorpay. Use the same email as your NoCodeGit
                        account so Pro can activate after payment.
                      </p>
                      {apiCheckout && (
                        <button
                          type="button"
                          className="btn-secondary w-full text-sm"
                          disabled={busy}
                          onClick={() => void checkout()}
                        >
                          Or subscribe via API checkout
                        </button>
                      )}
                    </div>
                  ) : apiCheckout ? (
                    <button
                      type="button"
                      className="btn-primary w-full"
                      disabled={busy || !enabled}
                      onClick={() => void checkout()}
                    >
                      Upgrade with Razorpay
                    </button>
                  ) : (
                    <button type="button" className="btn-primary w-full" disabled>
                      Upgrade unavailable
                    </button>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
