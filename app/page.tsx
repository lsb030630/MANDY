import { ExploreClient } from "@/components/explore/ExploreClient";
import { stores } from "@/lib/stores";

export default function HomePage() {
  return <ExploreClient stores={stores.filter((store) => store.isVisible)} />;
}
