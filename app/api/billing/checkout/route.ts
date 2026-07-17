import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { config } from "@/lib/config";
import { getRazorpay } from "@/lib/razorpay";
import { error, json, unauthorized } from "@/lib/api";

/**
 * Create a Razorpay Subscription for Pro.
 * Client opens Checkout with subscription_id + key_id.
 */
export async function POST() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const rzp = getRazorpay();
  if (!rzp || !config.razorpaySubscriptionEnabled) {
    return error(
      "Razorpay subscription API is not configured. Set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and RAZORPAY_PLAN_PRO — or use the Payment Button on /app/billing.",
      503
    );
  }

  try {
    const planId = config.razorpayPlanPro;
    let customerId = user.razorpay_customer_id;
    if (!customerId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const customer = (await (rzp as any).customers.create({
        name: user.name || user.email.split("@")[0],
        email: user.email,
        fail_existing: 0,
        notes: { ncg_user_id: user.id },
      })) as { id: string };
      customerId = customer.id;
      getDb()
        .prepare(
          `UPDATE users SET razorpay_customer_id = ?, updated_at = datetime('now') WHERE id = ?`
        )
        .run(customerId, user.id);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription = (await (rzp as any).subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 120,
      notes: {
        ncg_user_id: user.id,
        plan: "pro",
      },
    })) as { id: string; status: string };

    getDb()
      .prepare(
        `UPDATE users SET razorpay_subscription_id = ?, updated_at = datetime('now') WHERE id = ?`
      )
      .run(subscription.id, user.id);

    return json({
      key: config.razorpayKeyId,
      subscription_id: subscription.id,
      customer_id: customerId,
      name: "NoCodeGit Pro",
      description: "Pro · unlimited saves + ads editor",
      prefill: {
        name: user.name || "",
        email: user.email,
      },
      callback_url: `${config.appUrl}/app/billing?success=1`,
    });
  } catch (e) {
    console.error(e);
    return error(
      e instanceof Error ? e.message : "Checkout failed",
      500
    );
  }
}
