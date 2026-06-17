import { WorkDetailClient } from "@/components/community/WorkDetailClient";

export default async function ShowcaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WorkDetailClient kind="showcase" id={id} />;
}
