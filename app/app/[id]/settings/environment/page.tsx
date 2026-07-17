import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { loadProjectBundle } from "@/lib/project-data";
import { SettingsEnvironment } from "@/components/settings/SettingsEnvironment";

type Props = { params: Promise<{ id: string }> };

export default async function SettingsEnvironmentPage({ params }: Props) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const bundle = loadProjectBundle(id, user.id);
  if (!bundle) notFound();

  return (
    <SettingsEnvironment projectId={id} initial={bundle.env} />
  );
}
