import { redirect } from "next/navigation";

/** Spec alias: /checklist → ship checklist */
type Props = { params: Promise<{ id: string }> };

export default async function ChecklistAliasPage({ params }: Props) {
  const { id } = await params;
  redirect(`/app/${id}/ship`);
}
