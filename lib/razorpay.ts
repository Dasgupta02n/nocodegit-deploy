import Razorpay from "razorpay";
import crypto from "crypto";
import { config, isPaidPlan } from "./config";

let client: Razorpay | null = null;

export function getRazorpay(): Razorpay | null {
  if (!config.razorpayKeyId || !config.razorpayKeySecret) return null;
  if (!client) {
    client = new Razorpay({
      key_id: config.razorpayKeyId,
      key_secret: config.razorpayKeySecret,
    });
  }
  return client;
}

export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!config.razorpayWebhookSecret || !signature) return false;
  const expected = crypto
    .createHmac("sha256", config.razorpayWebhookSecret)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    );
  } catch {
    return false;
  }
}

export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    priceLabel: "₹0",
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
    priceLabel: "₹399/mo",
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
