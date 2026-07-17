import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { ProjectChrome } from "@/components/ProjectChrome";
import { TimelinePanel } from "@/components/TimelinePanel";
import { loadProjectBundle, shipReadiness } from "@/lib/project-data";
import { maxSnapshotBytesForPlan, formatBytes } from "@/lib/config";
import { providerDashboardUrl } from "@/lib/provider-meta";
import { EmailVerifyBanner } from "@/components/EmailVerifyBanner";

type Props = { params: Promise<{ id: string }> };

export default async function ProjectTimelinePage({ params }: Props) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const bundle = loadProjectBundle(id, user.id);
  if (!bundle) notFound();
  const readiness = shipReadiness(bundle);
  const dashboardUrl = bundle.hosting
    ? providerDashboardUrl(bundle.hosting.provider, bundle.hosting.target_json)
    : null;

  return (
    <AppShell email={user.email}>
      <EmailVerifyBanner verified={!!user.email_verified} />
      <ProjectChrome
        project={bundle.project}
        readiness={readiness}
        dashboardUrl={dashboardUrl}
      >
        <TimelinePanel
          projectId={id}
          initialSaves={bundle.saves}
          uploadLimitLabel={formatBytes(maxSnapshotBytesForPlan(user.plan))}
          canDeploy={readiness.canDeploy}
        />
      </ProjectChrome>
    </AppShell>
  );
}
