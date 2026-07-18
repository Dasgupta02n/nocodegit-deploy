import Link from "next/link";
import { BrandLogo } from "./BrandLogo";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--line)]/80 bg-[var(--paper)]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="site-nav">
        <BrandLogo />
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link href="/download" className="btn-ghost hidden sm:inline-flex">
            Download tray
          </Link>
          <Link href="/docs" className="btn-ghost hidden md:inline-flex">
            Docs
          </Link>
          <Link href="/login" className="btn-ghost">
            Log in
          </Link>
          <a
            href="/downloads/NoCodeGit-Tray-win-x64.exe"
            className="btn-secondary hidden !py-2 !text-xs sm:inline-flex"
          >
            Get tray
          </a>
          <Link href="/signup" className="btn-primary">
            Get started →
          </Link>
        </nav>
      </div>
    </header>
  );
}
