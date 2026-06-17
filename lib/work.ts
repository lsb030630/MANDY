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
import { BOARD_COMMENT_REWARD, awardCredits } from "./credits";
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
  body: string; // board: full text; showcase: "" (lives in gated detail)
  nickname: string;
  authorUid: string;
  imageCount: number;
  usedStoreCount: number;
  commentCount: number;
  createdAt: number | null;
};

/** Gated body for showcases — readable only by author or someone who unlocked it. */
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
  {
    base: string;
    title: string;
    cta: string;
    emptyTitle: string;
    emptyHint: string;
    activityHint: string;
    rich: boolean; // images + used stores
    gated: boolean; // viewing detail costs a credit
    titlePlaceholder: string;
    bodyPlaceholder: string;
    submitButtonLabel: string;
  }
> = {
  board: {
    base: "/board",
    title: "게시판",
    cta: "글쓰기",
    emptyTitle: "아직 글이 없어요.",
    emptyHint: "질문이나 작업 이야기를 자유롭게 남겨보세요.",
    activityHint: "게시판은 자유롭게 볼 수 있고, 답변을 달면 +1 크레딧을 받아요.",
    rich: false,
    gated: false,
    titlePlaceholder: "제목",
    bodyPlaceholder: "질문, 정보 공유, 잡담 등 자유롭게 적어주세요",
    submitButtonLabel: "올리기",
  },
  showcase: {
    base: "/showcase",
    title: "제작후기",
    cta: "제작 후기 올리기",
    emptyTitle: "아직 후기가 없어요.",
    emptyHint: "작업 사진과 사용한 업체를 담은 첫 후기를 남겨보세요.",
    activityHint: "후기 1개 올리면 +3 크레딧 · 상세 열람 −1",
    rich: true,
    gated: true,
    titlePlaceholder: "예: 황동 무드등 제작 후기",
    bodyPlaceholder: "어떤 작업인지, 과정과 팁을 적어주세요",
    submitButtonLabel: "올리고 +3 크레딧 받기",
  },
};

const collectionName = (kind: WorkKind) => (kind === "board" ? "posts" : "showcases");

const workDetailOverrides: Partial<Record<string, Partial<WorkDetail>>> = {
  "seed-showcase-anodized-flower": {
    body: "동일한 형태의 얇은 파츠를 여러 장 끼워 올리는 구조라 먼저 무채색 샘플을 확인한 뒤 아노다이징 컬러 테스트로 넘어갔습니다. 에스와이레이저에서 기본 파츠를 레이저커팅하고 슬롯 결합 상태를 점검한 다음, 설산실업에 맡겨 색을 입혔어요. 표면 질감이 살아있는 쪽이 염색 후 반짝임이 더 잘 보여서, 지나치게 매끈하게 밀기보다 원판의 결을 조금 남기는 편이 결과가 좋았습니다. 컬러별로 층이 겹쳤을 때 명도가 달라지는 점도 재미있었습니다.",
    usedStores: [
      { name: "에스와이레이저", how: "반복되는 꽃잎형 파츠 레이저커팅" },
      { name: "설산실업", how: "실버 샘플을 컬러 아노다이징 톤으로 염색 마감" },
    ],
  },
};

const hiddenWorkIds: Record<WorkKind, Set<string>> = {
  board: new Set(),
  showcase: new Set([
    "seed-showcase-brass-lamp",
    "seed-showcase-acrylic-keyring",
    "seed-showcase-bracket-coating",
    "seed-showcase-walnut-table",
    "seed-showcase-lightbox",
    "seed-showcase-chair-frame",
  ]),
};

const isHiddenWork = (kind: WorkKind, id: string) => hiddenWorkIds[kind].has(id);
const applyWorkDetailOverride = (id: string, detail: WorkDetail): WorkDetail => {
  const override = workDetailOverrides[id];
  return override ? { ...detail, ...override } : detail;
};

function mapCard(id: string, data: DocumentData): WorkCard {
  return {
    id,
    title: data.title ?? "",
    coverUrl: data.coverUrl ?? "",
    body: data.body ?? "",
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
    (snap) =>
      onChange(
        snap.docs
          .filter((entry) => !isHiddenWork(kind, entry.id))
          .map((entry) => mapCard(entry.id, entry.data())),
      ),
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
  if (isHiddenWork(kind, id)) {
    onChange(null);
    return () => {};
  }

  return onSnapshot(
    doc(db, collectionName(kind), id),
    (snap) => onChange(snap.exists() ? mapCard(snap.id, snap.data()) : null),
    () => onChange(null),
  );
}

/** Showcase only — returns the gated detail, or "locked" when the viewer lacks access. */
export async function getWorkDetail(
  kind: WorkKind,
  id: string,
): Promise<WorkDetail | "locked" | null> {
  const db = getFirebaseDb();
  if (!db) return demoGetWorkDetail(kind, id);
  if (isHiddenWork(kind, id)) return null;

  if (kind === "board") {
    try {
      const snap = await getDoc(doc(db, collectionName(kind), id));
      if (!snap.exists()) return null;
      const data = snap.data();
      return applyWorkDetailOverride(id, {
        body: data.body ?? "",
        imageUrls: [],
        usedStores: [],
        authorUid: data.authorUid ?? "",
      });
    } catch {
      return null;
    }
  }

  try {
    const snap = await getDoc(doc(db, collectionName(kind), id, "detail", "data"));
    if (!snap.exists()) return null;
    const data = snap.data();
    return applyWorkDetailOverride(id, {
      body: data.body ?? "",
      imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
      usedStores: Array.isArray(data.usedStores) ? data.usedStores : [],
      authorUid: data.authorUid ?? "",
    });
  } catch {
    return "locked";
  }
}

export async function addWork(kind: WorkKind, input: NewWork) {
  const db = getFirebaseDb();
  if (!db) return demoAddWork(kind, input);

  const rich = workMeta[kind].rich;
  const cardRef = doc(collection(db, collectionName(kind)));

  const batch = writeBatch(db);
  batch.set(cardRef, {
    title: input.title,
    coverUrl: rich ? (input.imageUrls[0] ?? "") : "",
    body: rich ? "" : input.body,
    nickname: input.nickname,
    authorUid: input.authorUid,
    imageCount: rich ? input.imageUrls.length : 0,
    usedStoreCount: rich ? input.usedStores.length : 0,
    commentCount: 0,
    createdAt: serverTimestamp(),
  });
  if (rich) {
    batch.set(doc(db, collectionName(kind), cardRef.id, "detail", "data"), {
      body: input.body,
      imageUrls: input.imageUrls,
      usedStores: input.usedStores,
      authorUid: input.authorUid,
    });
  }
  await batch.commit();
  if (kind === "showcase") {
    try {
      await awardCredits(input.authorUid);
    } catch {
      // Keep the post even if the reward write fails.
    }
  }
  return { id: cardRef.id };
}

export async function deleteWork(kind: WorkKind, id: string) {
  const db = getFirebaseDb();
  if (!db) return demoDeleteWork(kind, id);

  const batch = writeBatch(db);
  if (workMeta[kind].rich) {
    batch.delete(doc(db, collectionName(kind), id, "detail", "data"));
  }
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
  if (kind === "board") {
    try {
      await awardCredits(input.authorUid, BOARD_COMMENT_REWARD);
    } catch {
      // Keep the comment even if the reward write fails.
    }
  }
}

export async function deleteComment(kind: WorkKind, id: string, commentId: string) {
  const db = getFirebaseDb();
  if (!db) return demoDeleteComment(kind, id, commentId);

  await deleteDoc(doc(db, collectionName(kind), id, "comments", commentId));
  await updateDoc(doc(db, collectionName(kind), id), { commentCount: increment(-1) });
}
