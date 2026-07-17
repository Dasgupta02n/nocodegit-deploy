import path from "path";
import fs from "fs";

function env(name: string, ...fallbacks: string[]): string | undefined {
  if (process.env[name]) return process.env[name];
  for (const f of fallbacks) {
    if (process.env[f]) return process.env[f];
  }
  return undefined;
}

function required(name: string, fallbacks: string[], devFallback?: string): string {
  const v = env(name, ...fallbacks) ?? devFallback;
  if (!v) {
    throw new Error(
      `Missing required env: ${name}${fallbacks.length ? ` (or ${fallbacks.join(", ")})` : ""}`
    );
  }
  return v;
}

/** Brand */
export const BRAND = {
  name: "NoCodeGit",
  domain: "nocodegit.tech",
  tagline: "Save. Ship. Still.",
  url: "https://nocodegit.tech",
  emailFromDefault: "NoCodeGit <noreply@nocodegit.tech>",
};

export const config = {
  get secret() {
    return required(
      "NOCODEGIT_SECRET",
      ["QUAY_SECRET"],
      process.env.NODE_ENV === "development"
        ? "dev-only-secret-change-in-production-min-32-chars!!"
        : undefined
    );
  },
  get appUrl() {
    return (
      env("NEXT_PUBLIC_APP_URL", "APP_URL") || "http://localhost:3000"
    ).replace(/\/$/, "");
  },
  get dataDir() {
    const dir = path.resolve(
      env("NOCODEGIT_DATA_DIR", "QUAY_DATA_DIR") || "./data"
    );
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  },
  get databasePath() {
    const p = path.resolve(
      env("NOCODEGIT_DATABASE_PATH", "QUAY_DATABASE_PATH") ||
        "./data/nocodegit.sqlite"
    );
    fs.mkdirSync(path.dirname(p), { recursive: true });
    // Migrate old default filename if present
    const legacy = path.resolve("./data/quay.sqlite");
    if (!fs.existsSync(p) && fs.existsSync(legacy) && p.endsWith("nocodegit.sqlite")) {
      try {
        fs.renameSync(legacy, p);
      } catch {
        /* keep both if rename fails */
      }
    }
    return p;
  },
  get storagePath() {
    const p = path.resolve(
      env("NOCODEGIT_STORAGE_PATH", "QUAY_STORAGE_PATH") ||
        "./data/snapshots"
    );
    fs.mkdirSync(p, { recursive: true });
    return p;
  },
  sessionCookie: "nocodegit_session",
  sessionDays: 14,
  maxSnapshotBytesFree: 300 * 1024 * 1024,
  maxSnapshotBytesPaid: Number.MAX_SAFE_INTEGER,
  maxProjectsFree: 3,
  maxProjectsPaid: 100,
  bcryptRounds: 12,
  get razorpayKeyId() {
    return env("RAZORPAY_KEY_ID", "NEXT_PUBLIC_RAZORPAY_KEY_ID") || "";
  },
  get razorpayKeySecret() {
    return env("RAZORPAY_KEY_SECRET") || "";
  },
  get razorpayWebhookSecret() {
    return env("RAZORPAY_WEBHOOK_SECRET") || "";
  },
  /** Plan id from Razorpay Dashboard (Subscriptions → Plans) for Pro */
  get razorpayPlanPro() {
    return env("RAZORPAY_PLAN_PRO") || "";
  },
  /**
   * Razorpay Payment Button id (Dashboard → Payment Buttons), e.g. pl_...
   * Used for the embedded Pay button on /app/billing.
   */
  get razorpayPaymentButtonId() {
    return (
      env("RAZORPAY_PAYMENT_BUTTON_ID", "NEXT_PUBLIC_RAZORPAY_PAYMENT_BUTTON_ID") ||
      ""
    );
  },
  /** True when Payment Button and/or full API subscription checkout is configured */
  get razorpayEnabled() {
    return Boolean(
      config.razorpayPaymentButtonId ||
        (config.razorpayKeyId &&
          config.razorpayKeySecret &&
          config.razorpayPlanPro)
    );
  },
  /** Full subscription API checkout (needs keys + plan id) */
  get razorpaySubscriptionEnabled() {
    return Boolean(
      config.razorpayKeyId &&
        config.razorpayKeySecret &&
        config.razorpayPlanPro
    );
  },
  /** @deprecated Stripe removed — use razorpay* */
  get stripeEnabled() {
    return config.razorpayEnabled;
  },
  get stripeSecret() {
    return "";
  },
  get stripeWebhookSecret() {
    return "";
  },
  get stripePricePro() {
    return "";
  },
  get resendApiKey() {
    return env("RESEND_API_KEY") || "";
  },
  /** @deprecated Use resendApiKey — kept so old SENDGRID_API_KEY env still enables email briefly */
  get sendgridApiKey() {
    return env("SENDGRID_API_KEY") || "";
  },
  get emailFrom() {
    return (
      env("EMAIL_FROM", "RESEND_FROM", "SENDGRID_FROM") ||
      BRAND.emailFromDefault
    );
  },
  get emailEnabled() {
    return Boolean(config.resendApiKey);
  },
  get s3Enabled() {
    return Boolean(
      process.env.S3_BUCKET &&
        (process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID)
    );
  },
};

export function isPaidPlan(plan: string | null | undefined): boolean {
  const p = (plan || "free").toLowerCase();
  return p === "pro" || p === "solo" || p === "studio" || p === "paid";
}

export function maxSnapshotBytesForPlan(plan: string | null | undefined): number {
  return isPaidPlan(plan)
    ? config.maxSnapshotBytesPaid
    : config.maxSnapshotBytesFree;
}

export function projectLimitForPlan(plan: string | null | undefined): number {
  return isPaidPlan(plan) ? config.maxProjectsPaid : config.maxProjectsFree;
}

export function formatBytes(n: number): string {
  if (n >= Number.MAX_SAFE_INTEGER / 2) return "unlimited";
  if (n >= 1024 * 1024 * 1024)
    return `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (n >= 1024 * 1024) return `${Math.round(n / (1024 * 1024))} MB`;
  return `${Math.round(n / 1024)} KB`;
}
