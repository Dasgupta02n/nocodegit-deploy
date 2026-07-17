import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { ProjectChrome } from "@/components/ProjectChrome";
import { DeployHistory } from "@/components/DeployHistory";
import { loadProjectBundle, shipReadiness } from "@/lib/project-data";

type Props = { params: Promise<{ id: string }> };

export default async function DeployPage({ params }: Props) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const bundle = loadProjectBundle(id, user.id);
  if (!bundle) notFound();
  const readiness = shipReadiness(bundle);

  const hostingLabel = bundle.hosting
    ? bundle.hosting.display_name || bundle.hosting.provider
    : null;

  return (
    <AppShell email={user.email}>
      <ProjectChrome
        project={bundle.project}
        readiness={readiness}
        hostingLabel={hostingLabel}
        envCount={bundle.env?.length ?? 0}
      >
        <DeployHistory
          projectName={bundle.project.name}
          deploys={bundle.deploys}
        />
      </ProjectChrome>
    </AppShell>
  );
}
