import Link from "next/link";
import { BrandLogo, PierIcon } from "./BrandLogo";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--paper)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12 sm:flex-row sm:justify-between">
        <div>
          <BrandLogo />
          <p className="mt-3 max-w-xs text-sm text-[var(--muted)]">
            Save. Ship. Still. Version your vibe apps and deploy to infrastructure
            you own.
          </p>
          <div className="mt-4 opacity-60">
            <PierIcon className="h-8 w-12" />
          </div>
        </div>
        <div className="flex gap-12 text-sm">
          <div>
            <div className="font-semibold text-[var(--ink)]">Product</div>
            <ul className="mt-3 space-y-2 text-[var(--muted)]">
              <li>
                <Link href="/signup" className="hover:text-[var(--teal)]">
                  Get started
                </Link>
              </li>
              <li>
                <Link href="/download" className="hover:text-[var(--teal)]">
                  Download
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="hover:text-[var(--teal)]">
                  Onboarding
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-[var(--teal)]">
                  Docs
                </Link>
              </li>
              <li>
                <Link href="/app/billing" className="hover:text-[var(--teal)]">
                  Billing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-[var(--ink)]">Legal</div>
            <ul className="mt-3 space-y-2 text-[var(--muted)]">
              <li>
                <Link href="/legal/privacy" className="hover:text-[var(--teal)]">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-[var(--teal)]">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/legal/dpa" className="hover:text-[var(--teal)]">
                  DPA
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/acceptable-use"
                  className="hover:text-[var(--teal)]"
                >
                  Acceptable use
                </Link>
              </li>
              <li>
                <Link href="/docs/security" className="hover:text-[var(--teal)]">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--line)] py-4 text-center text-xs text-[var(--faint)]">
        © {new Date().getFullYear()} NoCodeGit · nocodegit.tech · Free 300 MB ·
        Pro $5/mo
      </div>
    </footer>
  );
}
