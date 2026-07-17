import { Resend } from "resend";
import { BRAND, config } from "./config";

let client: Resend | null = null;

function getResend(): Resend {
  if (!config.resendApiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }
  if (!client) {
    client = new Resend(config.resendApiKey);
  }
  return client;
}

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

/**
 * Send transactional email via Resend.
 * If RESEND_API_KEY is missing, logs in development and throws in production for critical flows.
 */
export async function sendEmail(input: SendEmailInput): Promise<{
  ok: boolean;
  mode: "resend" | "log";
}> {
  if (!config.emailEnabled) {
    console.info("[email:log-only]", {
      to: input.to,
      subject: input.subject,
      text: input.text,
    });
    return { ok: true, mode: "log" };
  }

  const resend = getResend();
  const { error } = await resend.emails.send({
    from: config.emailFrom,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html:
      input.html ||
      `<pre style="font-family:sans-serif">${escapeHtml(input.text)}</pre>`,
  });

  if (error) {
    throw new Error(
      typeof error === "object" && error && "message" in error
        ? String((error as { message: string }).message)
        : "Resend send failed"
    );
  }

  return { ok: true, mode: "resend" };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<void> {
  const subject = `Reset your ${BRAND.name} password`;
  const text = `You requested a password reset for ${BRAND.name} (${BRAND.domain}).

Open this link within 1 hour:
${resetUrl}

If you did not request this, ignore this email.`;

  const html = `
  <div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0f0a1e">
    <h1 style="font-size:20px;color:#6d28d9">${BRAND.name}</h1>
    <p>You requested a password reset.</p>
    <p><a href="${resetUrl}" style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;font-weight:600">Reset password</a></p>
    <p style="font-size:12px;color:#5b5470">Or copy: ${resetUrl}</p>
    <p style="font-size:12px;color:#9b93ad">Link expires in 1 hour. If you didn't ask for this, ignore the email.</p>
  </div>`;

  await sendEmail({ to, subject, text, html });
}

export async function sendWelcomeEmail(to: string, name?: string | null) {
  const subject = `Welcome to ${BRAND.name}`;
  const text = `Hi${name ? ` ${name}` : ""},

Welcome to ${BRAND.name} (${BRAND.domain}).

Save your vibe projects, connect your host, and deploy — we never run your live app.

Get started: ${config.appUrl}/app

— The ${BRAND.name} team`;

  await sendEmail({ to, subject, text });
}

export async function sendVerifyEmail(to: string, verifyUrl: string) {
  const subject = `Verify your ${BRAND.name} email`;
  const text = `Confirm your email for ${BRAND.name}:

${verifyUrl}

This link expires in 24 hours.`;
  const html = `
  <div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#141414">
    <h1 style="font-size:20px;color:#2F6F6B">${BRAND.name}</h1>
    <p>Confirm your email to finish setup.</p>
    <p><a href="${verifyUrl}" style="display:inline-block;background:#2F6F6B;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600">Verify email</a></p>
    <p style="font-size:12px;color:#5C5A56">Or copy: ${verifyUrl}</p>
  </div>`;
  await sendEmail({ to, subject, text, html });
}
