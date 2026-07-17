"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

function VerifyInner() {
  const sp = useSearchParams();
  const token = sp.get("token") || "";
  const [msg, setMsg] = useState("Verifying…");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!token) {
      setMsg("Missing verification token.");
      return;
    }
    void (async () => {
      try {
        const res = await fetch(
          `/api/auth/verify-email?token=${encodeURIComponent(token)}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        setOk(true);
        setMsg("Email verified. You can continue to your projects.");
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Verification failed");
      }
    })();
  }, [token]);

  return (
    <div className="card mx-auto max-w-md p-8 text-center">
      <h1 className="text-xl font-semibold">
        {ok ? "You’re verified" : "Email verification"}
      </h1>
      <p className="mt-3 text-sm text-[var(--muted)]">{msg}</p>
      <Link href="/app" className="btn-primary mt-6 inline-flex">
        Go to projects
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <SiteHeader />
      <main className="px-6 py-16">
        <Suspense fallback={<p className="text-center text-sm">Loading…</p>}>
          <VerifyInner />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
