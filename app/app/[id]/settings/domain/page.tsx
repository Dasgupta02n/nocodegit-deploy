import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getProjectForUser } from "@/lib/projects";
import { SettingsDomain } from "@/components/settings/SettingsDomain";

type Props = { params: Promise<{ id: string }> };

export default async function SettingsDomainPage({ params }: Props) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const project = getProjectForUser(id, user.id);
  if (!project) notFound();

  return (
    <SettingsDomain
      project={{ id: project.id, live_url: project.live_url }}
    />
  );
}
