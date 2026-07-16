import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NoCodeGit — Save. Ship. Still. | nocodegit.tech",
  description:
    "Version vault and one-click deploy for vibe-coded projects. NoCodeGit stores your code and ships it to your hosting — it never runs your live app. Free 300MB saves; Pro $5/mo unlimited + ads editor.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://nocodegit.tech"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
