import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { loadProjectBundle } from "@/lib/project-data";
import { SettingsSnippets } from "@/components/settings/SettingsSnippets";
import { isPaidPlan } from "@/lib/config";

type Props = { params: Promise<{ id: string }> };

export default async function SettingsSnippetsPage({ params }: Props) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const bundle = loadProjectBundle(id, user.id);
  if (!bundle) notFound();
  const paid = isPaidPlan(user.plan);

  return (
    <SettingsSnippets
      projectId={id}
      isPaid={paid}
      snippets={paid ? bundle.snippets : []}
      affiliates={paid ? bundle.affiliates : []}
    />
  );
}
