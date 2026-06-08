import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

export type ContributionInput = {
  contact: string;
  fileGuide: string;
  orderGuide: string;
  review: string;
  storeId?: string;
  storeName: string;
};

export async function submitContribution(input: ContributionInput) {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error("Firebase 설정값이 없어 제보를 저장할 수 없습니다.");
  }

  return addDoc(collection(db, "contributions"), {
    ...input,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}
