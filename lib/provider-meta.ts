/** Provider dashboard URLs + labels for NoCodeGit hosting. */

export function providerDashboardUrl(
  provider: string,
  targetJson: string
): string | null {
  let t: Record<string, string> = {};
  try {
    t = JSON.parse(targetJson || "{}");
  } catch {
    /* ignore */
  }
  const p = provider.toLowerCase();
  if (t.dashboard_url) return t.dashboard_url;
  if (p === "vercel") {
    if (t.project_id)
      return `https://vercel.com/dashboard/${encodeURIComponent(t.project_id)}`;
    return "https://vercel.com/dashboard";
  }
  if (p === "netlify") {
    if (t.site_id) return `https://app.netlify.com/sites/${t.site_id}/overview`;
    return "https://app.netlify.com";
  }
  if (p === "railway") return "https://railway.app/dashboard";
  if (p === "render") return "https://dashboard.render.com";
  if (p === "cloudflare") return "https://dash.cloudflare.com";
  if (p === "hook" && t.hook_url) {
    try {
      return new URL(t.hook_url).origin;
    } catch {
      return null;
    }
  }
  return null;
}

export const ENV_TEMPLATES: { key: string; label: string; visibility: "secret" | "public" }[] = [
  { key: "OPENAI_API_KEY", label: "OpenAI", visibility: "secret" },
  { key: "ANTHROPIC_API_KEY", label: "Anthropic", visibility: "secret" },
  { key: "STRIPE_SECRET_KEY", label: "Stripe secret", visibility: "secret" },
  { key: "STRIPE_PUBLISHABLE_KEY", label: "Stripe public", visibility: "public" },
  { key: "DATABASE_URL", label: "Database URL", visibility: "secret" },
  { key: "SUPABASE_URL", label: "Supabase URL", visibility: "public" },
  { key: "SUPABASE_ANON_KEY", label: "Supabase anon", visibility: "public" },
  { key: "RESEND_API_KEY", label: "Resend", visibility: "secret" },
  { key: "NEXT_PUBLIC_APP_URL", label: "Public app URL", visibility: "public" },
];
