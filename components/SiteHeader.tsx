import Link from "next/link";
import { BrandLogo } from "./BrandLogo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)]/80 bg-[var(--paper)]/90 backdrop-blur-md">
      <div className="site-nav">
        <BrandLogo />
        <nav className="flex items-center gap-0.5 sm:gap-1">
          <a
            href="#versions"
            className="btn-ghost hidden !px-2.5 lg:inline-flex"
          >
            Product
          </a>
          <a
            href="#pricing"
            className="btn-ghost hidden !px-2.5 md:inline-flex"
          >
            Pricing
          </a>
          <Link href="/docs" className="btn-ghost hidden !px-2.5 sm:inline-flex">
            Docs
          </Link>
          <Link href="/login" className="btn-ghost !px-2.5">
            Log in
          </Link>
          <a
            href="/downloads/NoCodeGit-Tray-win-x64.exe"
            className="btn-secondary hidden !py-2 !text-xs sm:inline-flex"
          >
            Tray
          </a>
          <Link href="/signup" className="btn-primary !py-2">
            Start free →
          </Link>
        </nav>
      </div>
    </header>
  );
}
