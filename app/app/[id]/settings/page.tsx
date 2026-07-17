import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function SettingsIndex({ params }: Props) {
  const { id } = await params;
  redirect(`/app/${id}/settings/general`);
}
