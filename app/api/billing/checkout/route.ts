import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { config } from "@/lib/config";
import { getStripe } from "@/lib/stripe";
import { error, json, unauthorized } from "@/lib/api";

/** Checkout for Pro — $5/mo */
export async function POST() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const stripe = getStripe();
  if (!stripe || !config.stripeEnabled) {
    return error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_PRO.",
      503
    );
  }

  try {
    const priceId = config.stripePricePro;
    if (!priceId) return error("Missing STRIPE_PRICE_PRO", 500);

    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { ncg_user_id: user.id },
      });
      customerId = customer.id;
      getDb()
        .prepare(
          `UPDATE users SET stripe_customer_id = ?, updated_at = datetime('now') WHERE id = ?`
        )
        .run(customerId, user.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${config.appUrl}/app/billing?success=1`,
      cancel_url: `${config.appUrl}/app/billing?canceled=1`,
      metadata: { ncg_user_id: user.id, plan: "pro" },
      subscription_data: {
        metadata: { ncg_user_id: user.id, plan: "pro" },
      },
    });

    return json({ url: session.url });
  } catch (e) {
    console.error(e);
    return error("Checkout failed", 500);
  }
}
