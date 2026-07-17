import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { ProjectChrome } from "@/components/ProjectChrome";
import { ShipChecklist } from "@/components/ShipChecklist";
import { loadProjectBundle, shipReadiness } from "@/lib/project-data";

type Props = { params: Promise<{ id: string }> };

export default async function ShipPage({ params }: Props) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const bundle = loadProjectBundle(id, user.id);
  if (!bundle) notFound();
  const readiness = shipReadiness(bundle);

  return (
    <AppShell email={user.email}>
      <ProjectChrome project={bundle.project} readiness={readiness}>
        <ShipChecklist projectId={id} readiness={readiness} />
      </ProjectChrome>
    </AppShell>
  );
}
