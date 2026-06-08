import { ExploreClient } from "@/components/explore/ExploreClient";
import { stores } from "@/lib/stores";

export default function ExplorePage() {
  return (
    <ExploreClient
      initialCategory={null}
      initialMode="service"
      initialStoreId={null}
      stores={stores.filter((store) => store.isVisible)}
    />
  );
}
