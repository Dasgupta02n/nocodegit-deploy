import { LandingPage } from "@/components/LandingPage";

/** Marketing homepage (also rewritten from `/` via middleware). */
export const dynamic = "force-dynamic";

export default function MarketingHomePage() {
  return <LandingPage />;
}
