import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { ProjectChrome } from "@/components/ProjectChrome";
import { ProjectSettingsNav } from "@/components/ProjectSettingsNav";
import { loadProjectBundle, shipReadiness } from "@/lib/project-data";
import { providerDashboardUrl } from "@/lib/provider-meta";

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export default async function SettingsLayout({ children, params }: Props) {
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
      <ProjectChrome
        project={bundle.project}
        readiness={readiness}
        dashboardUrl={dashboardUrl}
      >
        <div className="flex flex-col gap-8 md:flex-row">
          <ProjectSettingsNav projectId={id} />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </ProjectChrome>
    </AppShell>
  );
}
