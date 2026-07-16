import Stripe from "stripe";
import { config, isPaidPlan } from "./config";

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!config.stripeSecret) return null;
  if (!stripe) {
    stripe = new Stripe(config.stripeSecret, {
      typescript: true,
    });
  }
  return stripe;
}

export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    priceLabel: "$0",
    priceUsd: 0,
    projects: config.maxProjectsFree,
    maxUpload: "300 MB",
    adsEditor: false,
    features: [
      "Version saves (up to 300 MB each)",
      "Deploy to your own host",
      "Environment / API keys",
      "Deploy code that already includes ads/affiliates",
      "No ads/affiliate editor",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceLabel: "$5/mo",
    priceUsd: 5,
    projects: config.maxProjectsPaid,
    maxUpload: "Unlimited",
    adsEditor: true,
    features: [
      "Unlimited codebase upload size",
      "Ads & affiliate snippets editor",
      "Replace links/snippets on deploy",
      "Priority for more projects",
      "Everything in Free",
    ],
  },
} as const;

export { isPaidPlan };
