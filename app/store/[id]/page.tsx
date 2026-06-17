import { notFound } from "next/navigation";
import { StoreDetailClient } from "@/components/store/StoreDetailClient";
import { stores } from "@/lib/stores";

export function generateStaticParams() {
  return stores.filter((store) => store.isVisible).map((store) => ({ id: store.id }));
}

export default async function StorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = stores.find((item) => item.id === id && item.isVisible);
  if (!store) notFound();

  return <StoreDetailClient store={store} />;
}
