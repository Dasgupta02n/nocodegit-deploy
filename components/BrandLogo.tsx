import Link from "next/link";

/** Quay-style mark: teal square + wordmark. Name only differs. */
export function BrandLogo({
  href = "/",
  size = "md",
  light = false,
}: {
  href?: string;
  size?: "sm" | "md" | "lg";
  light?: boolean;
}) {
  const box =
    size === "sm" ? "h-7 w-7 text-xs" : size === "lg" ? "h-9 w-9 text-sm" : "h-8 w-8 text-sm";
  const text =
    size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-[15px]";
  return (
    <Link href={href} className="logo-mark">
      <span className={`logo-q ${box}`}>N</span>
      <span className={`${text} ${light ? "text-white" : "text-[var(--ink)]"}`}>
        NoCodeGit
      </span>
    </Link>
  );
}

/** Line pier icon from Quay brand board */
export function PierIcon({ className = "h-10 w-14" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 56 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        className="pier-line"
        d="M4 28 L28 10 L52 28"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path className="pier-line" d="M14 28 V22 M22 28 V18 M30 28 V16 M38 28 V20 M46 28 V24" />
      <path
        className="pier-line"
        d="M2 32 C10 30 18 34 28 32 C38 30 46 34 54 31"
        strokeLinecap="round"
      />
    </svg>
  );
}
