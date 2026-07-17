import { BrandLogo, PierIcon } from "./BrandLogo";

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-[var(--paper)] p-12 lg:flex">
        <BrandLogo />
        <div>
          <p className="font-display text-5xl leading-tight text-[var(--ink)]">
            Save.
            <br />
            Ship.
            <br />
            Still.
          </p>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
            NoCodeGit keeps versions and deploys to your host. Your live app
            never runs here.
          </p>
          <div className="mt-10 opacity-50">
            <PierIcon className="h-14 w-20" />
          </div>
        </div>
        <p className="text-xs text-[var(--faint)]">nocodegit.tech</p>
      </div>

      <div className="flex flex-col justify-center bg-white px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <BrandLogo />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
          )}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
