import { getDb } from "@/lib/db";
import { config } from "@/lib/config";
import { getStripe } from "@/lib/stripe";
import { error, json } from "@/lib/api";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe || !config.stripeWebhookSecret) {
    return error("Webhook not configured", 503);
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return error("Missing signature", 400);

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      raw,
      sig,
      config.stripeWebhookSecret
    );
  } catch (e) {
    console.error(e);
    return error("Invalid signature", 400);
  }

  const db = getDb();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          session.metadata?.ncg_user_id || session.metadata?.quay_user_id;
        const plan = session.metadata?.plan || "pro";
        if (userId && session.subscription) {
          db.prepare(
            `UPDATE users SET plan = ?, stripe_subscription_id = ?, plan_status = 'active', updated_at = datetime('now') WHERE id = ?`
          ).run(plan, String(session.subscription), userId);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.ncg_user_id || sub.metadata?.quay_user_id;
        const status = sub.status;
        const plan =
          status === "active" || status === "trialing"
            ? sub.metadata?.plan || "pro"
            : "free";
        if (userId) {
          db.prepare(
            `UPDATE users SET plan = ?, plan_status = ?, stripe_subscription_id = ?, updated_at = datetime('now') WHERE id = ?`
          ).run(
            plan,
            status,
            status === "canceled" ? null : sub.id,
            userId
          );
        } else if (sub.customer) {
          db.prepare(
            `UPDATE users SET plan = ?, plan_status = ?, stripe_subscription_id = ?, updated_at = datetime('now') WHERE stripe_customer_id = ?`
          ).run(
            plan,
            status,
            status === "canceled" ? null : sub.id,
            String(sub.customer)
          );
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("Webhook handler error", e);
    return error("Handler failed", 500);
  }

  return json({ received: true });
}
