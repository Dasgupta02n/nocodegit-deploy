import { LandingPage } from "@/components/LandingPage";

/** Public marketing home — never redirect to auth. */
export const dynamic = "force-dynamic";

export default function HomePage() {
  return <LandingPage />;
}
