import { WorkDetailClient } from "@/components/community/WorkDetailClient";

export default async function BoardPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorkDetailClient kind="board" id={id} />;
}
