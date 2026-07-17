import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { loadProjectBundle } from "@/lib/project-data";
import { SettingsHosting } from "@/components/settings/SettingsHosting";

type Props = { params: Promise<{ id: string }> };

export default async function SettingsHostingPage({ params }: Props) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const bundle = loadProjectBundle(id, user.id);
  if (!bundle) notFound();

  return <SettingsHosting projectId={id} initial={bundle.hosting} />;
}
