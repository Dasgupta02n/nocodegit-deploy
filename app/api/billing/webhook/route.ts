import { getDb } from "@/lib/db";
import { config } from "@/lib/config";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { error, json } from "@/lib/api";

export const runtime = "nodejs";

/**
 * Razorpay webhooks: subscription.activated, subscription.charged,
 * subscription.cancelled, subscription.completed, payment.failed
 * Set endpoint secret as RAZORPAY_WEBHOOK_SECRET
 */
export async function POST(req: Request) {
  if (!config.razorpayWebhookSecret) {
    return error("Webhook not configured", 503);
  }

  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature");
  if (!verifyRazorpayWebhookSignature(raw, sig)) {
    return error("Invalid signature", 400);
  }

  let payload: {
    event?: string;
    payload?: {
      subscription?: {
        entity?: {
          id?: string;
          status?: string;
          notes?: Record<string, string>;
          customer_id?: string;
        };
      };
      payment?: {
        entity?: {
          notes?: Record<string, string>;
        };
      };
    };
  };

  try {
    payload = JSON.parse(raw);
  } catch {
    return error("Invalid JSON", 400);
  }

  const db = getDb();
  const event = payload.event || "";
  const sub = payload.payload?.subscription?.entity;
  const userId =
    sub?.notes?.ncg_user_id ||
    payload.payload?.payment?.entity?.notes?.ncg_user_id;
  const subId = sub?.id;
  const status = sub?.status || "";

  try {
    if (
      event === "subscription.activated" ||
      event === "subscription.charged" ||
      event === "subscription.resumed"
    ) {
      if (userId) {
        db.prepare(
          `UPDATE users SET plan = 'pro', plan_status = ?, razorpay_subscription_id = COALESCE(?, razorpay_subscription_id), updated_at = datetime('now') WHERE id = ?`
        ).run(status || "active", subId || null, userId);
      } else if (subId) {
        db.prepare(
          `UPDATE users SET plan = 'pro', plan_status = ? WHERE razorpay_subscription_id = ?`
        ).run(status || "active", subId);
      }
    } else if (
      event === "subscription.cancelled" ||
      event === "subscription.completed" ||
      event === "subscription.halted"
    ) {
      if (userId) {
        db.prepare(
          `UPDATE users SET plan = 'free', plan_status = ?, razorpay_subscription_id = NULL, updated_at = datetime('now') WHERE id = ?`
        ).run(status || "canceled", userId);
      } else if (subId) {
        db.prepare(
          `UPDATE users SET plan = 'free', plan_status = ?, razorpay_subscription_id = NULL WHERE razorpay_subscription_id = ?`
        ).run(status || "canceled", subId);
      }
    }
  } catch (e) {
    console.error("Razorpay webhook handler error", e);
    return error("Handler failed", 500);
  }

  return json({ received: true });
}
