import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { demoAddStoreReview, demoDeleteStoreReview, demoSubscribeStoreReviews } from "./demo";
import { getFirebaseDb } from "./firebase";
import { toMillis } from "./format";

export type StoreReview = {
  id: string;
  storeId: string;
  body: string;
  nickname: string;
  authorUid: string;
  createdAt: number | null;
};

export type NewStoreReview = {
  storeId: string;
  body: string;
  nickname: string;
  authorUid: string;
};

export function subscribeStoreReviews(
  storeId: string,
  onChange: (reviews: StoreReview[]) => void,
): () => void {
  const db = getFirebaseDb();
  if (!db) return demoSubscribeStoreReviews(storeId, onChange);

  const reviewsQuery = query(collection(db, "storeReviews"), where("storeId", "==", storeId));
  return onSnapshot(
    reviewsQuery,
    (snap) => {
      const rows = snap.docs.map((entry) => {
        const data = entry.data();
        return {
          id: entry.id,
          storeId: data.storeId,
          body: data.body,
          nickname: data.nickname || "익명",
          authorUid: data.authorUid,
          createdAt: toMillis(data.createdAt),
        } satisfies StoreReview;
      });
      rows.sort((a, b) => (b.createdAt ?? Infinity) - (a.createdAt ?? Infinity));
      onChange(rows);
    },
    () => onChange([]),
  );
}

export async function addStoreReview(input: NewStoreReview) {
  const db = getFirebaseDb();
  if (!db) {
    demoAddStoreReview(input);
    return;
  }
  return addDoc(collection(db, "storeReviews"), {
    ...input,
    createdAt: serverTimestamp(),
  });
}

export async function deleteStoreReview(id: string) {
  const db = getFirebaseDb();
  if (!db) {
    demoDeleteStoreReview(id);
    return;
  }
  return deleteDoc(doc(db, "storeReviews", id));
}
