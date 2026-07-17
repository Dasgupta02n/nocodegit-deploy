import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NoCodeGit — Save. Ship. Still.",
  description:
    "Version vault and one-click deploy for vibe-coded projects. Free 300MB saves; Pro ₹500/mo unlimited + ads editor. We never run your live app.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://nocodegit.tech"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
