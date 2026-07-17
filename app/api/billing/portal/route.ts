import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getRazorpay } from "@/lib/razorpay";
import { error, json, unauthorized } from "@/lib/api";

/** Cancel active Razorpay subscription (manage billing). */
export async function POST() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const rzp = getRazorpay();
  if (!rzp) return error("Razorpay not configured", 503);
  if (!user.razorpay_subscription_id) {
    return error("No active Razorpay subscription on file", 400);
  }

  try {
    await rzp.subscriptions.cancel(user.razorpay_subscription_id, false);
    getDb()
      .prepare(
        `UPDATE users SET plan = 'free', plan_status = 'canceled', razorpay_subscription_id = NULL, updated_at = datetime('now') WHERE id = ?`
      )
      .run(user.id);
    return json({ ok: true, message: "Subscription canceled at period end or immediately per Razorpay settings." });
  } catch (e) {
    console.error(e);
    return error(
      e instanceof Error ? e.message : "Could not cancel subscription",
      500
    );
  }
}
