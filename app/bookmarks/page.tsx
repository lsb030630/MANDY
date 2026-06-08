import { BookmarksClient } from "@/components/bookmarks/BookmarksClient";
import { stores } from "@/lib/stores";

export default function BookmarksPage() {
  return <BookmarksClient stores={stores.filter((store) => store.isVisible)} />;
}

