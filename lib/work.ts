import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type DocumentData,
} from "firebase/firestore";
import { awardCredits } from "./credits";
import {
  demoAddComment,
  demoAddWork,
  demoDeleteComment,
  demoDeleteWork,
  demoGetWorkDetail,
  demoSubscribeComments,
  demoSubscribeWork,
  demoSubscribeWorks,
} from "./demo";
import { getFirebaseDb } from "./firebase";
import { toMillis } from "./format";

export type WorkKind = "board" | "showcase";

export type UsedStore = {
  name: string;
  how: string;
};

/** Public list-card data — readable by anyone. */
export type WorkCard = {
  id: string;
  title: string;
  coverUrl: string;
  nickname: string;
  authorUid: string;
  imageCount: number;
  usedStoreCount: number;
  commentCount: number;
  createdAt: number | null;
};

/** Gated body — readable only by the author or someone who unlocked it. */
export type WorkDetail = {
  body: string;
  imageUrls: string[];
  usedStores: UsedStore[];
  authorUid: string;
};

export type WorkComment = {
  id: string;
  body: string;
  nickname: string;
  authorUid: string;
  createdAt: number | null;
};

export type NewWork = {
  title: string;
  body: string;
  imageUrls: string[];
  usedStores: UsedStore[];
  nickname: string;
  authorUid: string;
};

export const workMeta: Record<
  WorkKind,
  { base: string; title: string; cta: string; emptyHint: string }
> = {
  board: {
    base: "/board",
    title: "게시판",
    cta: "작업 후기 올리기",
    emptyHint: "작업 사진과 사용한 업체를 담은 첫 후기를 남겨보세요.",
  },
  showcase: {
    base: "/showcase",
    title: "제작후기",
    cta: "제작 후기 올리기",
    emptyHint: "예시 작업과 사용한 업체를 정리한 첫 후기를 남겨보세요.",
  },
};

const collectionName = (kind: WorkKind) => (kind === "board" ? "posts" : "showcases");

function mapCard(id: string, data: DocumentData): WorkCard {
  return {
    id,
    title: data.title ?? "",
    coverUrl: data.coverUrl ?? "",
    nickname: data.nickname || "익명",
    authorUid: data.authorUid ?? "",
    imageCount: data.imageCount ?? 0,
    usedStoreCount: data.usedStoreCount ?? 0,
    commentCount: data.commentCount ?? 0,
    createdAt: toMillis(data.createdAt),
  };
}

export function subscribeWorks(kind: WorkKind, onChange: (rows: WorkCard[]) => void): () => void {
  const db = getFirebaseDb();
  if (!db) return demoSubscribeWorks(kind, onChange);

  const worksQuery = query(collection(db, collectionName(kind)), orderBy("createdAt", "desc"));
  return onSnapshot(
    worksQuery,
    (snap) => onChange(snap.docs.map((entry) => mapCard(entry.id, entry.data()))),
    () => onChange([]),
  );
}

export function subscribeWorkCard(
  kind: WorkKind,
  id: string,
  onChange: (card: WorkCard | null) => void,
): () => void {
  const db = getFirebaseDb();
  if (!db) return demoSubscribeWork(kind, id, onChange);

  return onSnapshot(
    doc(db, collectionName(kind), id),
    (snap) => onChange(snap.exists() ? mapCard(snap.id, snap.data()) : null),
    () => onChange(null),
  );
}

/** Returns the gated detail, or "locked" when the viewer lacks access. */
export async function getWorkDetail(
  kind: WorkKind,
  id: string,
): Promise<WorkDetail | "locked" | null> {
  const db = getFirebaseDb();
  if (!db) return demoGetWorkDetail(kind, id);

  try {
    const snap = await getDoc(doc(db, collectionName(kind), id, "detail", "data"));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      body: data.body ?? "",
      imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
      usedStores: Array.isArray(data.usedStores) ? data.usedStores : [],
      authorUid: data.authorUid ?? "",
    };
  } catch {
    return "locked";
  }
}

export async function addWork(kind: WorkKind, input: NewWork) {
  const db = getFirebaseDb();
  if (!db) return demoAddWork(kind, input);

  const cardRef = doc(collection(db, collectionName(kind)));
  const detailRef = doc(db, collectionName(kind), cardRef.id, "detail", "data");

  const batch = writeBatch(db);
  batch.set(cardRef, {
    title: input.title,
    coverUrl: input.imageUrls[0] ?? "",
    nickname: input.nickname,
    authorUid: input.authorUid,
    imageCount: input.imageUrls.length,
    usedStoreCount: input.usedStores.length,
    commentCount: 0,
    createdAt: serverTimestamp(),
  });
  batch.set(detailRef, {
    body: input.body,
    imageUrls: input.imageUrls,
    usedStores: input.usedStores,
    authorUid: input.authorUid,
  });
  await batch.commit();
  await awardCredits(input.authorUid);
  return { id: cardRef.id };
}

export async function deleteWork(kind: WorkKind, id: string) {
  const db = getFirebaseDb();
  if (!db) return demoDeleteWork(kind, id);

  const batch = writeBatch(db);
  batch.delete(doc(db, collectionName(kind), id, "detail", "data"));
  batch.delete(doc(db, collectionName(kind), id));
  await batch.commit();
}

export function subscribeComments(
  kind: WorkKind,
  id: string,
  onChange: (rows: WorkComment[]) => void,
): () => void {
  const db = getFirebaseDb();
  if (!db) return demoSubscribeComments(kind, id, onChange);

  const commentsQuery = query(
    collection(db, collectionName(kind), id, "comments"),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(
    commentsQuery,
    (snap) =>
      onChange(
        snap.docs.map((entry) => {
          const data = entry.data();
          return {
            id: entry.id,
            body: data.body ?? "",
            nickname: data.nickname || "익명",
            authorUid: data.authorUid ?? "",
            createdAt: toMillis(data.createdAt),
          } satisfies WorkComment;
        }),
      ),
    () => onChange([]),
  );
}

export async function addComment(
  kind: WorkKind,
  id: string,
  input: { body: string; nickname: string; authorUid: string },
) {
  const db = getFirebaseDb();
  if (!db) return demoAddComment(kind, id, input);

  await addDoc(collection(db, collectionName(kind), id, "comments"), {
    ...input,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, collectionName(kind), id), { commentCount: increment(1) });
}

export async function deleteComment(kind: WorkKind, id: string, commentId: string) {
  const db = getFirebaseDb();
  if (!db) return demoDeleteComment(kind, id, commentId);

  await deleteDoc(doc(db, collectionName(kind), id, "comments", commentId));
  await updateDoc(doc(db, collectionName(kind), id), { commentCount: increment(-1) });
}
