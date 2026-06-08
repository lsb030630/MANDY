import { allCategories, stores, type CategoryId } from "@/lib/stores";
import { ExploreClient } from "@/components/explore/ExploreClient";

type ExplorePageProps = {
  searchParams?: Promise<{
    category?: string;
    mode?: string;
    store?: string;
  }>;
};

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = (await searchParams) ?? {};
  const initialMode = params.mode === "material" ? "material" : "service";
  const initialCategory = allCategories.some((category) => category.id === params.category)
    ? (params.category as CategoryId)
    : null;
  const initialStoreId = params.store ?? null;

  return (
    <ExploreClient
      initialCategory={initialCategory}
      initialMode={initialMode}
      initialStoreId={initialStoreId}
      stores={stores.filter((store) => store.isVisible)}
    />
  );
}
