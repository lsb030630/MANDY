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
      body,
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
      "을지로에서 아크릴 절곡 잘하는 곳 아세요?",
      "좌대장인",
      "전시 좌대용으로 3T 투명 아크릴 6개만 절곡하려고 합니다. 한쪽만 90도로 세우는 정도고 도면은 간단해요. 아크릴최가나 현대아크릴처럼 소량 응대 괜찮았던 곳 있으면 추천 부탁드려요.",
      [],
      [],
      minutesAgo(55),
    ),
    makeWork(
      "demo-b2",
      "seed-2",
      "레이저커팅 맡길 때 ai 말고 pdf만 보내도 돼요?",
      "도면초보",
      "일러스트를 못 쓰는 팀원이 있어서 우선 pdf로 정리했는데, 디즈팩트리나 성북 창작소 같은 곳은 어느 포맷까지 받아주는지 궁금해요. 컷팅선하고 각인선도 미리 나눠서 보내야 하나요?",
      [],
      [],
      minutesAgo(130),
    ),
    makeWork(
      "demo-b3",
      "seed-3",
      "문래 쪽 분체도장 맡겨본 분 계신가요",
      "브라켓찾는중",
      "스틸 브라켓 8개 정도라 수량이 애매한데 삼원분체도장이나 정성특수도장 쪽에서 소량도 받아주는지 궁금합니다. 검정 무광 생각 중이고 용접 자국 조금 있는 상태예요.",
      [],
      [],
      minutesAgo(230),
    ),
    makeWork(
      "demo-b4",
      "seed-4",
      "소량 CNC 조각 급하게 맡길 곳 찾습니다",
      "급한모형",
      "합판 시제품인데 하루 이틀 안에 깎아야 해서요. 하나컴퓨터정밀조각, 서원씨앤씨, 국민대 상상공방 중 일반 개인이 문의하기에 어디가 제일 수월했는지 알려주세요.",
      [],
      [],
      minutesAgo(340),
    ),
    makeWork(
      "demo-b5",
      "seed-5",
      "정릉 근처에서 목공 피드백 받을 만한 곳 있을까요",
      "스툴수정중",
      "졸전용 작은 스툴 만들고 있는데 목재 선택이 아직 헷갈립니다. 삼구나무공방이나 Woodist처럼 상담 가능한 곳 추천 부탁드려요. 가공 전에 치수 한번 같이 봐줄 곳이면 더 좋습니다.",
      [],
      [],
      minutesAgo(820),
    ),
    makeWork(
      "demo-b6",
      "seed-6",
      "을지로 금속 마감 사포 호수 어디까지 올리세요?",
      "사포질문",
      "황동이랑 스텐 번갈아 만지고 있는데 320-400-600까지만 해도 되는지, 거울 느낌 내고 싶으면 800 이상 꼭 가는지 궁금해요. 작은 파츠는 스펀지사포가 낫다는 말도 있던데 실제로 어떤지요.",
      [],
      [],
      minutesAgo(1280),
    ),
  ],
  showcase: [
    makeWork(
      "demo-s1",
      "seed-11",
      "황동 무드등 제작기",
      "조명덕후",
      "0.8T 황동판으로 전시용 무드등 2개를 제작했습니다. 대덕메탈에서 판재를 사고 성진 cnc 벤딩에서 본체를 세운 뒤, 쁘띠도금에서 무광 도금으로 마감했어요. 황동은 스크래치가 잘 보여서 400-600-800 순서로 한 번 정리하고 넘기는 게 마음 편했습니다. 도금 전에 손자국 안 남게 장갑 끼고 포장한 것도 도움 됐어요.",
      ["https://picsum.photos/seed/mandybrass/900/600", "https://picsum.photos/seed/mandybrass2/900/600"],
      [
        { name: "대덕메탈", how: "황동판 0.8T 구매" },
        { name: "성진 cnc 벤딩", how: "본체 절곡" },
        { name: "쁘띠도금", how: "무광 도금 마감" },
      ],
      minutesAgo(310),
    ),
    makeWork(
      "demo-s2",
      "seed-12",
      "아크릴 키링 소량 제작 후기",
      "키링반장",
      "학교 행사 굿즈로 투명 아크릴 키링 30개만 뽑았습니다. 아크릴최가에서 판재 상담하고 애드윈테크 쪽 인쇄 문의까지 같이 비교했어요. 컷팅선과 인쇄선을 미리 분리해 두니까 수정 왕복이 많이 줄었고, 보호필름 제거 시점도 미리 확인하는 게 좋았습니다.",
      ["https://picsum.photos/seed/mandyacrylic/900/600", "https://picsum.photos/seed/mandyacrylic2/900/600"],
      [
        { name: "아크릴최가", how: "투명 아크릴 재단과 샘플 상담" },
        { name: "애드윈테크", how: "UV 인쇄 사양 비교" },
      ],
      minutesAgo(910),
    ),
    makeWork(
      "demo-s3",
      "seed-13",
      "스틸 브라켓 분체도장까지 맡긴 후기",
      "브라켓조립",
      "전시 구조물 브라켓을 1T 스틸로 만들고 검정 무광 분체도장까지 맡겼습니다. 가야금속에서 재료를 보고 성진 cnc 벤딩과 삼원분체도장 쪽으로 이어서 진행했어요. 용접 자국은 320으로 한 번 정리해서 넘겼고, 색상은 샘플 사진보다 실물 칩 보여드리는 게 훨씬 빨랐습니다. 일정 촉박하면 도장 입고일 먼저 잡는 게 중요합니다.",
      ["https://picsum.photos/seed/mandybracket/900/600"],
      [
        { name: "가야금속", how: "스틸 소재 확인과 재단 상담" },
        { name: "성진 cnc 벤딩", how: "브라켓 절곡" },
        { name: "삼원분체도장", how: "검정 무광 분체도장" },
      ],
      minutesAgo(1600),
    ),
    makeWork(
      "demo-s4",
      "seed-14",
      "월넛 협탁 첫 제작",
      "우드워커",
      "백산무늬목재에서 월넛을 보고, 삼구나무공방에서 치수 상담을 받아 작은 협탁을 만들었습니다. 목재는 예쁘다고 바로 고르기보다 뒤틀림이랑 함수율부터 보는 게 중요하다는 걸 배웠어요. 다리 각도 때문에 한 번 수정했는데, 초반에 테이프로 실물 크기 표시해본 게 꽤 도움이 됐습니다.",
      ["https://picsum.photos/seed/mandywood/900/600"],
      [
        { name: "백산무늬목재", how: "월넛 상판용 원목 구매" },
        { name: "삼구나무공방", how: "치수 검토와 제작 피드백" },
      ],
      minutesAgo(2900),
    ),
    makeWork(
      "demo-s5",
      "seed-15",
      "세운상가에서 라이트박스 시제품 만든 후기",
      "세운야작",
      "작은 전시용 라이트박스 하나를 급하게 만들었습니다. 한일조명에서 조명 부품 챙기고 아크릴최가에서 확산판 재단, 하나컴퓨터정밀조각 쪽에 뒷판 가공을 문의했어요. LED 바 길이보다 먼저 확산판 깊이를 정해야 빛이 덜 뜨고, 타공 위치는 현장 메모 그대로 다시 확인하는 게 안전했습니다.",
      ["https://picsum.photos/seed/mandylightbox/900/600", "https://picsum.photos/seed/mandylightbox2/900/600"],
      [
        { name: "한일조명", how: "조명 부품 구매" },
        { name: "아크릴최가", how: "확산판 재단" },
        { name: "하나컴퓨터정밀조각", how: "뒷판 가공 문의" },
      ],
      minutesAgo(4200),
    ),
  ],
};

const comments: Record<string, WorkComment[]> = {
  "board:demo-b1": [
    {
      id: "demo-bc1",
      body: "아크릴최가에서 10개 이하도 받아줬어요. 치수 메모해서 가면 이야기 빨라집니다.",
      nickname: "모형마감",
      authorUid: "seed-31",
      createdAt: minutesAgo(45),
    },
    {
      id: "demo-bc2",
      body: "절곡선 표시만 있으면 될까요? 아니면 펼친 도면까지 챙겨가야 하나 고민이네요.",
      nickname: "좌대장인",
      authorUid: "seed-1",
      createdAt: minutesAgo(38),
    },
    {
      id: "demo-bc3",
      body: "저는 현대아크릴이 좀 더 빨랐는데, 가장자리 폴리싱은 따로 물어보셔야 해요.",
      nickname: "세운야행",
      authorUid: "seed-32",
      createdAt: minutesAgo(31),
    },
    {
      id: "demo-bc4",
      body: "아크릴최가는 오전에 먼저 전화 넣고 가는 게 안전했습니다. 갑자기 가면 바쁠 때가 있더라고요.",
      nickname: "B108출석",
      authorUid: "seed-33",
      createdAt: minutesAgo(24),
    },
  ],
  "board:demo-b2": [
    {
      id: "demo-bc5",
      body: "pdf만 보내도 되는데 컷선이랑 각인선 색상은 분리해달라고 하셨어요.",
      nickname: "커터날",
      authorUid: "seed-34",
      createdAt: minutesAgo(110),
    },
    {
      id: "demo-bc6",
      body: "성북 창작소는 장비 이용형에 더 가깝고, 외주 맡길 거면 디즈팩트리 쪽이 덜 번거로웠습니다.",
      nickname: "동선최적화",
      authorUid: "seed-35",
      createdAt: minutesAgo(96),
    },
    {
      id: "demo-bc7",
      body: "오 외주랑 장비 이용이 좀 다른 거였군요. 감사합니다.",
      nickname: "도면초보",
      authorUid: "seed-2",
      createdAt: minutesAgo(88),
    },
    {
      id: "demo-bc8",
      body: "글자 작은 건 윤곽선으로 변환해서 넘기세요. 폰트 깨지면 다시 수정 요청 옵니다.",
      nickname: "전시막차",
      authorUid: "seed-36",
      createdAt: minutesAgo(79),
    },
  ],
  "board:demo-b3": [
    {
      id: "demo-bc9",
      body: "삼원은 색상표 보여달라고 하면 얘기 빨라요. 수량 적으면 일정부터 물어보는 게 낫습니다.",
      nickname: "철판인간",
      authorUid: "seed-37",
      createdAt: minutesAgo(205),
    },
    {
      id: "demo-bc10",
      body: "정성특수도장은 에폭시 쪽 문의할 때 응대 괜찮았어요. 사진 몇 장 먼저 보내면 편합니다.",
      nickname: "문래출근",
      authorUid: "seed-38",
      createdAt: minutesAgo(191),
    },
    {
      id: "demo-bc11",
      body: "용접 자국 있으면 320 정도로 정리해서 보내는 게 나았습니다. 그대로 보내면 표면이 좀 올라오더라고요.",
      nickname: "마감지옥",
      authorUid: "seed-39",
      createdAt: minutesAgo(166),
    },
  ],
  "board:demo-b4": [
    {
      id: "demo-bc12",
      body: "하나는 소량 문의 괜찮았고, 서원씨앤씨는 도면 정리 잘돼 있으면 응답이 빨랐어요.",
      nickname: "졸전주간",
      authorUid: "seed-40",
      createdAt: minutesAgo(318),
    },
    {
      id: "demo-bc13",
      body: "국민대 상상공방은 외부 업체라기보다 실습공간 느낌이 강해서, 급한 발주는 다른 데가 나을 수 있어요.",
      nickname: "정릉러",
      authorUid: "seed-41",
      createdAt: minutesAgo(302),
    },
    {
      id: "demo-bc14",
      body: "그럼 급한 건 하나나 서원부터 물어봐야겠네요.",
      nickname: "급한모형",
      authorUid: "seed-4",
      createdAt: minutesAgo(287),
    },
    {
      id: "demo-bc15",
      body: "파일 DXF로 같이 보내면 덜 왔다 갔다 합니다.",
      nickname: "cad밤샘",
      authorUid: "seed-42",
      createdAt: minutesAgo(280),
    },
  ],
  "board:demo-b5": [
    {
      id: "demo-bc16",
      body: "삼구나무공방은 실제 제작 이야기까지 잘 해주시고, Woodist는 수업 경험담 찾기 좋아요.",
      nickname: "합판냄새",
      authorUid: "seed-43",
      createdAt: minutesAgo(790),
    },
    {
      id: "demo-bc17",
      body: "월넛이랑 오크 고민이면 백산무늬목재 한 번 들렀다가 공방 가보세요. 재료 보고 가면 얘기 빨라집니다.",
      nickname: "원목초보",
      authorUid: "seed-44",
      createdAt: minutesAgo(774),
    },
    {
      id: "demo-bc18",
      body: "좌판까지 직접 하실 거면 피스 위치 먼저 체크하세요. 나중에 흔들림 잡기 귀찮아요.",
      nickname: "못질연습",
      authorUid: "seed-45",
      createdAt: minutesAgo(752),
    },
  ],
  "board:demo-b6": [
    {
      id: "demo-bc19",
      body: "황동은 400에서 끝내도 괜찮은데 반사감 원하면 800 넘어가야 해요.",
      nickname: "브라스맨",
      authorUid: "seed-46",
      createdAt: minutesAgo(1235),
    },
    {
      id: "demo-bc20",
      body: "스텐은 320 바로 쓰면 결이 너무 도드라져서 220 한 번 거치는 편입니다.",
      nickname: "스텐파",
      authorUid: "seed-47",
      createdAt: minutesAgo(1218),
    },
    {
      id: "demo-bc21",
      body: "작은 건 스펀지사포 빨강-파랑-초록 순으로 써도 될까요?",
      nickname: "사포질문",
      authorUid: "seed-6",
      createdAt: minutesAgo(1199),
    },
    {
      id: "demo-bc22",
      body: "네 그 순서 무난해요. 모서리 죽이기엔 오히려 더 편합니다.",
      nickname: "도장전",
      authorUid: "seed-48",
      createdAt: minutesAgo(1186),
    },
  ],
  "showcase:demo-s1": [
    {
      id: "demo-sc1",
      body: "도금 전에 사포 800까지 올리셨어요?",
      nickname: "금속새내기",
      authorUid: "seed-51",
      createdAt: minutesAgo(260),
    },
    {
      id: "demo-sc2",
      body: "전면만 800까지 올리고 안쪽은 600에서 멈췄어요. 보이는 면만 챙겼습니다.",
      nickname: "조명덕후",
      authorUid: "seed-11",
      createdAt: minutesAgo(248),
    },
    {
      id: "demo-sc3",
      body: "무광 도금 색 예쁘네요. 샘플 직접 가져가셨나요?",
      nickname: "도금산책",
      authorUid: "seed-52",
      createdAt: minutesAgo(233),
    },
    {
      id: "demo-sc4",
      body: "네 기존 부품 하나 들고 가서 맞췄어요. 사진만 보여주는 것보다 훨씬 빨랐습니다.",
      nickname: "조명덕후",
      authorUid: "seed-11",
      createdAt: minutesAgo(219),
    },
  ],
  "showcase:demo-s2": [
    {
      id: "demo-sc5",
      body: "30개 정도도 받아주던가요?",
      nickname: "굿즈막차",
      authorUid: "seed-53",
      createdAt: minutesAgo(870),
    },
    {
      id: "demo-sc6",
      body: "네, 대신 일정은 조금 넉넉하게 잡는 편이 좋았어요.",
      nickname: "키링반장",
      authorUid: "seed-12",
      createdAt: minutesAgo(852),
    },
    {
      id: "demo-sc7",
      body: "구멍 위치도 파일에서 먼저 표시하셨나요?",
      nickname: "도면수정중",
      authorUid: "seed-54",
      createdAt: minutesAgo(840),
    },
  ],
  "showcase:demo-s3": [
    {
      id: "demo-sc8",
      body: "분체도장 전에 탈지 따로 하셨나요?",
      nickname: "도장초보",
      authorUid: "seed-55",
      createdAt: minutesAgo(1540),
    },
    {
      id: "demo-sc9",
      body: "업체에서 기본 처리는 해주셨는데, 큰 오염은 제가 먼저 닦아갔어요.",
      nickname: "브라켓조립",
      authorUid: "seed-13",
      createdAt: minutesAgo(1528),
    },
    {
      id: "demo-sc10",
      body: "소량이어도 해주나요?",
      nickname: "철물막내",
      authorUid: "seed-56",
      createdAt: minutesAgo(1509),
    },
    {
      id: "demo-sc11",
      body: "수량 적어서 단가가 낮진 않았는데 가능은 했습니다.",
      nickname: "브라켓조립",
      authorUid: "seed-13",
      createdAt: minutesAgo(1498),
    },
  ],
  "showcase:demo-s4": [
    {
      id: "demo-sc12",
      body: "월넛 상판 두께 몇으로 하셨어요?",
      nickname: "목재헤맴",
      authorUid: "seed-57",
      createdAt: minutesAgo(2848),
    },
    {
      id: "demo-sc13",
      body: "18T로 갔고, 다리는 24T처럼 보이게 짰어요.",
      nickname: "우드워커",
      authorUid: "seed-14",
      createdAt: minutesAgo(2830),
    },
    {
      id: "demo-sc14",
      body: "오일 마감은 뭐 쓰셨어요?",
      nickname: "사포먼지",
      authorUid: "seed-58",
      createdAt: minutesAgo(2815),
    },
  ],
  "showcase:demo-s5": [
    {
      id: "demo-sc15",
      body: "빛 핫스팟 심하지 않았나요?",
      nickname: "전시조명",
      authorUid: "seed-59",
      createdAt: minutesAgo(4140),
    },
    {
      id: "demo-sc16",
      body: "처음엔 떴는데 확산판 간격 5mm 늘리니까 훨씬 나아졌어요.",
      nickname: "세운야작",
      authorUid: "seed-15",
      createdAt: minutesAgo(4122),
    },
    {
      id: "demo-sc17",
      body: "전원은 12V 쓰셨나요?",
      nickname: "납땜중",
      authorUid: "seed-60",
      createdAt: minutesAgo(4106),
    },
  ],
};

for (const kind of Object.keys(works) as WorkKind[]) {
  for (const work of works[kind]) {
    work.card.commentCount = (comments[`${kind}:${work.card.id}`] ?? []).length;
  }
}

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
