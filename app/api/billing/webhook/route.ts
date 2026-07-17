import { getDb } from "@/lib/db";
import { config } from "@/lib/config";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { error, json } from "@/lib/api";

export const runtime = "nodejs";

/**
 * Razorpay webhooks:
 * - subscription.* (API subscription checkout)
 * - payment.captured / payment.authorized (Payment Button & one-time pays)
 * Set endpoint secret as RAZORPAY_WEBHOOK_SECRET
 * URL: POST /api/billing/webhook
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
          id?: string;
          email?: string;
          contact?: string;
          status?: string;
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
  const payment = payload.payload?.payment?.entity;
  const userId =
    sub?.notes?.ncg_user_id ||
    payment?.notes?.ncg_user_id ||
    payment?.notes?.user_id;
  const subId = sub?.id;
  const status = sub?.status || "";
  const payEmail = (payment?.email || "").trim().toLowerCase();

  function activatePro(opts: {
    userId?: string | null;
    email?: string | null;
    planStatus?: string;
    subId?: string | null;
  }) {
    const planStatus = opts.planStatus || "active";
    if (opts.userId) {
      db.prepare(
        `UPDATE users SET plan = 'pro', plan_status = ?, razorpay_subscription_id = COALESCE(?, razorpay_subscription_id), updated_at = datetime('now') WHERE id = ?`
      ).run(planStatus, opts.subId || null, opts.userId);
      return true;
    }
    if (opts.email) {
      const r = db
        .prepare(
          `UPDATE users SET plan = 'pro', plan_status = ?, updated_at = datetime('now') WHERE email = ? COLLATE NOCASE`
        )
        .run(planStatus, opts.email);
      return r.changes > 0;
    }
    return false;
  }

  try {
    if (
      event === "subscription.activated" ||
      event === "subscription.charged" ||
      event === "subscription.resumed"
    ) {
      if (userId) {
        activatePro({ userId, planStatus: status || "active", subId });
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
    } else if (
      event === "payment.captured" ||
      event === "payment.authorized" ||
      event === "order.paid"
    ) {
      // Payment Button / one-time: activate Pro by notes user id or payer email
      const ok = activatePro({
        userId: userId || null,
        email: payEmail || null,
        planStatus: payment?.status || "active",
      });
      if (!ok) {
        console.warn(
          "Razorpay payment event but no matching user",
          event,
          payment?.id,
          payEmail
        );
      }
    }
  } catch (e) {
    console.error("Razorpay webhook handler error", e);
    return error("Handler failed", 500);
  }

  return json({ received: true });
}
