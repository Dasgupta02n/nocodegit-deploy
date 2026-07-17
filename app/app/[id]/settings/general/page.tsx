import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getProjectForUser } from "@/lib/projects";
import { SettingsGeneral } from "@/components/settings/SettingsGeneral";

type Props = { params: Promise<{ id: string }> };

export default async function SettingsGeneralPage({ params }: Props) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const project = getProjectForUser(id, user.id);
  if (!project) notFound();

  return (
    <SettingsGeneral
      project={{
        id: project.id,
        name: project.name,
        slug: project.slug,
        folder_hint: project.folder_hint,
      }}
    />
  );
}
