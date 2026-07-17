import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function MarketingShell({
  children,
  eyebrow,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  heroImage?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 pb-6 pt-12">
        {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 font-display text-4xl text-[var(--ink)]">{title}</h1>
        {subtitle && (
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            {subtitle}
          </p>
        )}
      </div>
      <main className="mx-auto max-w-3xl px-6 pb-16">
        <div className="card p-8">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
