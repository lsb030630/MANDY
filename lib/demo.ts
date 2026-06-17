import type { StoreReview } from "./reviews";
import type { NewWork, WorkCard, WorkComment, WorkDetail, WorkKind } from "./work";

/**
 * In-memory demo backend used when Firebase isn't configured, so the
 * community can be previewed with realistic content. Demo mode has no
 * credit gating — every work is viewable. Swaps to Firestore automatically
 * once NEXT_PUBLIC_FIREBASE_* values are set.
 */

export const DEMO_UID = "demo-user";
export const DEMO_BOOKMARKS = ["daeseong-materials", "petit-plating", "seoul-magnet"];

const minutesAgo = (mins: number) => Date.now() - mins * 60000;

let idCounter = 1000;
const nextId = () => `demo-${++idCounter}`;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

function subscribe(read: () => void): () => void {
  listeners.add(read);
  read();
  return () => {
    listeners.delete(read);
  };
}

type DemoWork = { card: WorkCard; detail: WorkDetail };

function makeWork(
  id: string,
  authorUid: string,
  title: string,
  nickname: string,
  body: string,
  imageUrls: string[],
  usedStores: { name: string; how: string }[],
  createdAt: number,
  commentCount = 0,
): DemoWork {
  return {
    card: {
      id,
      title,
      coverUrl: imageUrls[0] ?? "",
      nickname,
      authorUid,
      imageCount: imageUrls.length,
      usedStoreCount: usedStores.length,
      commentCount,
      createdAt,
    },
    detail: { body, imageUrls, usedStores, authorUid },
  };
}

const works: Record<WorkKind, DemoWork[]> = {
  board: [
    makeWork(
      "demo-b1",
      "seed-1",
      "황동 명패 절곡 후기",
      "메탈공방",
      "황동판으로 명패를 만들었어요. 재료는 대덕메탈에서 사고, 절곡은 성진에서 했습니다. 깔끔하게 잘 나왔어요.",
      ["https://picsum.photos/seed/mandyb1/900/600", "https://picsum.photos/seed/mandyb1b/900/600"],
      [
        { name: "대덕메탈", how: "황동판 1.0T 구매" },
        { name: "성진 cnc 벤딩", how: "직각 절곡" },
      ],
      minutesAgo(50),
      1,
    ),
    makeWork(
      "demo-b2",
      "seed-2",
      "아크릴 좌대 제작",
      "전시준비중",
      "전시 좌대를 투명 아크릴로 만들었습니다. 우성상사에서 아크릴 재단했어요.",
      ["https://picsum.photos/seed/mandyb2/900/600"],
      [{ name: "우성상사", how: "아크릴 5T 재단" }],
      minutesAgo(400),
    ),
  ],
  showcase: [
    makeWork(
      "demo-s1",
      "seed-11",
      "황동 무드등 제작기",
      "조명덕후",
      "황동판으로 무드등을 만들었습니다. 절곡부터 도금까지 전부 을지로에서 해결했어요. 단가와 과정 공유합니다.",
      ["https://picsum.photos/seed/mandybrass/900/600", "https://picsum.photos/seed/mandybrass2/900/600"],
      [
        { name: "대덕메탈", how: "황동판 0.8T 구매" },
        { name: "성진 cnc 벤딩", how: "본체 절곡" },
        { name: "쁘띠도금", how: "무광 도금 마감" },
      ],
      minutesAgo(240),
    ),
    makeWork(
      "demo-s2",
      "seed-13",
      "원목 협탁 — 을지로 목재상 활용",
      "우드워커",
      "백산무늬목재에서 월넛 원목을 골라 협탁을 만들었습니다. 목재 종류가 정말 많아 고르는 재미가 있어요.",
      ["https://picsum.photos/seed/mandywood/900/600"],
      [{ name: "백산무늬목재", how: "월넛 원목 구매" }],
      minutesAgo(3000),
    ),
  ],
};

const comments: Record<string, WorkComment[]> = {
  "board:demo-b1": [
    {
      id: "demo-bc1",
      body: "절곡 깔끔하네요! 성진 단가 어느 정도였나요?",
      nickname: "입문생",
      authorUid: "seed-4",
      createdAt: minutesAgo(20),
    },
  ],
};

const storeReviews: Record<string, StoreReview[]> = {
  "daeseong-materials": [
    {
      id: "demo-r1",
      storeId: "daeseong-materials",
      body: "대진보다 확실히 저렴해요. 동봉 단가 꼭 물어보세요.",
      nickname: "금속러",
      authorUid: "seed-7",
      createdAt: minutesAgo(95),
    },
    {
      id: "demo-r2",
      storeId: "daeseong-materials",
      body: "사장님 친절하시고 소량도 잘 잘라주십니다.",
      nickname: "졸전생",
      authorUid: "seed-8",
      createdAt: minutesAgo(2880),
    },
  ],
  "petit-plating": [
    {
      id: "demo-r3",
      storeId: "petit-plating",
      body: "도금 퀄리티 좋아요. 원하는 색 샘플 가져가면 빠릅니다.",
      nickname: "주얼리과",
      authorUid: "seed-9",
      createdAt: minutesAgo(320),
    },
  ],
  "seoul-magnet": [
    {
      id: "demo-r4",
      storeId: "seoul-magnet",
      body: "네오디뮴 자석 사이즈 종류 많아요. 흡착력 물어보고 사세요.",
      nickname: "키네틱",
      authorUid: "seed-10",
      createdAt: minutesAgo(700),
    },
  ],
};

const sortDesc = <T extends { createdAt: number | null }>(rows: T[]) =>
  [...rows].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

// ---------- works ----------

export function demoSubscribeWorks(kind: WorkKind, onChange: (rows: WorkCard[]) => void) {
  return subscribe(() => onChange(sortDesc(works[kind].map((work) => work.card))));
}

export function demoSubscribeWork(
  kind: WorkKind,
  id: string,
  onChange: (card: WorkCard | null) => void,
) {
  return subscribe(() => onChange(works[kind].find((work) => work.card.id === id)?.card ?? null));
}

export function demoGetWorkDetail(kind: WorkKind, id: string): Promise<WorkDetail | null> {
  return Promise.resolve(works[kind].find((work) => work.card.id === id)?.detail ?? null);
}

export function demoAddWork(kind: WorkKind, input: NewWork) {
  const id = nextId();
  works[kind] = [
    makeWork(
      id,
      input.authorUid,
      input.title,
      input.nickname,
      input.body,
      input.imageUrls,
      input.usedStores,
      Date.now(),
    ),
    ...works[kind],
  ];
  emit();
  return { id };
}

export function demoDeleteWork(kind: WorkKind, id: string) {
  works[kind] = works[kind].filter((work) => work.card.id !== id);
  delete comments[`${kind}:${id}`];
  emit();
}

export function demoSubscribeComments(
  kind: WorkKind,
  id: string,
  onChange: (rows: WorkComment[]) => void,
) {
  const key = `${kind}:${id}`;
  return subscribe(() =>
    onChange([...(comments[key] ?? [])].sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0))),
  );
}

export function demoAddComment(
  kind: WorkKind,
  id: string,
  input: { body: string; nickname: string; authorUid: string },
) {
  const key = `${kind}:${id}`;
  comments[key] = [...(comments[key] ?? []), { id: nextId(), ...input, createdAt: Date.now() }];
  const work = works[kind].find((entry) => entry.card.id === id);
  if (work) work.card.commentCount += 1;
  emit();
}

export function demoDeleteComment(kind: WorkKind, id: string, commentId: string) {
  const key = `${kind}:${id}`;
  comments[key] = (comments[key] ?? []).filter((entry) => entry.id !== commentId);
  const work = works[kind].find((entry) => entry.card.id === id);
  if (work && work.card.commentCount > 0) work.card.commentCount -= 1;
  emit();
}

// ---------- store reviews ----------

export function demoSubscribeStoreReviews(storeId: string, onChange: (rows: StoreReview[]) => void) {
  return subscribe(() => onChange(sortDesc(storeReviews[storeId] ?? [])));
}

export function demoAddStoreReview(input: {
  storeId: string;
  body: string;
  nickname: string;
  authorUid: string;
}) {
  const id = nextId();
  storeReviews[input.storeId] = [
    { id, ...input, createdAt: Date.now() },
    ...(storeReviews[input.storeId] ?? []),
  ];
  emit();
  return { id };
}

export function demoDeleteStoreReview(id: string) {
  for (const key of Object.keys(storeReviews)) {
    storeReviews[key] = storeReviews[key].filter((review) => review.id !== id);
  }
  emit();
}
