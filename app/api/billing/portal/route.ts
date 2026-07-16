import { getSessionUser } from "@/lib/auth";
import { config } from "@/lib/config";
import { getStripe } from "@/lib/stripe";
import { error, json, unauthorized } from "@/lib/api";

export async function POST() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const stripe = getStripe();
  if (!stripe || !user.stripe_customer_id) {
    return error("No Stripe customer on file", 400);
  }
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${config.appUrl}/app/billing`,
  });
  return json({ url: session.url });
}
