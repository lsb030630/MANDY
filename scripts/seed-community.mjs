import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signOut } from "firebase/auth";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

for (const [key, value] of Object.entries(firebaseConfig)) {
  if (!value) {
    throw new Error(`Missing Firebase config: ${key}`);
  }
}

const minutesAgo = (mins) => Date.now() - mins * 60_000;

// Each call returns a brand-new anonymous uid so seeded comments look like
// different people (익명1, 익명2 …) instead of all "글쓴이".
async function freshUid(auth) {
  await signOut(auth).catch(() => {});
  const { user } = await signInAnonymously(auth);
  return user.uid;
}

const boardSeeds = [
  {
    id: "seed-board-acrylic-bend",
    title: "을지로에서 아크릴 절곡 잘하는 곳 아세요?",
    nickname: "좌대장인",
    body: "전시 좌대용으로 3T 투명 아크릴 6개만 절곡하려고 합니다. 한쪽만 90도로 세우는 정도고 도면은 간단해요. 아크릴최가나 현대아크릴처럼 소량 응대 괜찮았던 곳 있으면 추천 부탁드려요.",
    createdAt: minutesAgo(55),
    comments: [
      ["c1", "모형마감", "아크릴최가에서 10개 이하도 받아줬어요. 치수 메모해서 가면 이야기 빨라집니다.", 45],
      ["c2", "좌대장인", "절곡선 표시만 있으면 될까요? 아니면 펼친 도면까지 챙겨가야 하나 고민이네요.", 38],
      ["c3", "세운야행", "저는 현대아크릴이 좀 더 빨랐는데, 가장자리 폴리싱은 따로 물어보셔야 해요.", 31],
      ["c4", "B108출석", "아크릴최가는 오전에 먼저 전화 넣고 가는 게 안전했습니다. 갑자기 가면 바쁠 때가 있더라고요.", 24],
    ],
  },
  {
    id: "seed-board-laser-file",
    title: "레이저커팅 맡길 때 ai 말고 pdf만 보내도 돼요?",
    nickname: "도면초보",
    body: "일러스트를 못 쓰는 팀원이 있어서 우선 pdf로 정리했는데, 디즈팩트리나 성북 창작소 같은 곳은 어느 포맷까지 받아주는지 궁금해요. 컷팅선하고 각인선도 미리 나눠서 보내야 하나요?",
    createdAt: minutesAgo(130),
    comments: [
      ["c1", "커터날", "pdf만 보내도 되는데 컷선이랑 각인선 색상은 분리해달라고 하셨어요.", 110],
      ["c2", "동선최적화", "성북 창작소는 장비 이용형에 더 가깝고, 외주 맡길 거면 디즈팩트리 쪽이 덜 번거로웠습니다.", 96],
      ["c3", "도면초보", "오 외주랑 장비 이용이 좀 다른 거였군요. 감사합니다.", 88],
      ["c4", "전시막차", "글자 작은 건 윤곽선으로 변환해서 넘기세요. 폰트 깨지면 다시 수정 요청 옵니다.", 79],
    ],
  },
  {
    id: "seed-board-powder-coating",
    title: "문래 쪽 분체도장 맡겨본 분 계신가요",
    nickname: "브라켓찾는중",
    body: "스틸 브라켓 8개 정도라 수량이 애매한데 삼원분체도장이나 정성특수도장 쪽에서 소량도 받아주는지 궁금합니다. 검정 무광 생각 중이고 용접 자국 조금 있는 상태예요.",
    createdAt: minutesAgo(230),
    comments: [
      ["c1", "철판인간", "삼원은 색상표 보여달라고 하면 얘기 빨라요. 수량 적으면 일정부터 물어보는 게 낫습니다.", 205],
      ["c2", "문래출근", "정성특수도장은 에폭시 쪽 문의할 때 응대 괜찮았어요. 사진 몇 장 먼저 보내면 편합니다.", 191],
      ["c3", "마감지옥", "용접 자국 있으면 320 정도로 정리해서 보내는 게 나았습니다. 그대로 보내면 표면이 좀 올라오더라고요.", 166],
    ],
  },
  {
    id: "seed-board-cnc-rush",
    title: "소량 CNC 조각 급하게 맡길 곳 찾습니다",
    nickname: "급한모형",
    body: "합판 시제품인데 하루 이틀 안에 깎아야 해서요. 하나컴퓨터정밀조각, 서원씨앤씨, 국민대 상상공방 중 일반 개인이 문의하기에 어디가 제일 수월했는지 알려주세요.",
    createdAt: minutesAgo(340),
    comments: [
      ["c1", "졸전주간", "하나는 소량 문의 괜찮았고, 서원씨앤씨는 도면 정리 잘돼 있으면 응답이 빨랐어요.", 318],
      ["c2", "정릉러", "국민대 상상공방은 외부 업체라기보다 실습공간 느낌이 강해서, 급한 발주는 다른 데가 나을 수 있어요.", 302],
      ["c3", "급한모형", "그럼 급한 건 하나나 서원부터 물어봐야겠네요.", 287],
      ["c4", "cad밤샘", "파일 DXF로 같이 보내면 덜 왔다 갔다 합니다.", 280],
    ],
  },
  {
    id: "seed-board-wood-feedback",
    title: "정릉 근처에서 목공 피드백 받을 만한 곳 있을까요",
    nickname: "스툴수정중",
    body: "졸전용 작은 스툴 만들고 있는데 목재 선택이 아직 헷갈립니다. 삼구나무공방이나 Woodist처럼 상담 가능한 곳 추천 부탁드려요. 가공 전에 치수 한번 같이 봐줄 곳이면 더 좋습니다.",
    createdAt: minutesAgo(820),
    comments: [
      ["c1", "합판냄새", "삼구나무공방은 실제 제작 이야기까지 잘 해주시고, Woodist는 수업 경험담 찾기 좋아요.", 790],
      ["c2", "원목초보", "월넛이랑 오크 고민이면 백산무늬목재 한 번 들렀다가 공방 가보세요. 재료 보고 가면 얘기 빨라집니다.", 774],
      ["c3", "못질연습", "좌판까지 직접 하실 거면 피스 위치 먼저 체크하세요. 나중에 흔들림 잡기 귀찮아요.", 752],
    ],
  },
  {
    id: "seed-board-sanding-grit",
    title: "을지로 금속 마감 사포 호수 어디까지 올리세요?",
    nickname: "사포질문",
    body: "황동이랑 스텐 번갈아 만지고 있는데 320-400-600까지만 해도 되는지, 거울 느낌 내고 싶으면 800 이상 꼭 가는지 궁금해요. 작은 파츠는 스펀지사포가 낫다는 말도 있던데 실제로 어떤지요.",
    createdAt: minutesAgo(1280),
    comments: [
      ["c1", "브라스맨", "황동은 400에서 끝내도 괜찮은데 반사감 원하면 800 넘어가야 해요.", 1235],
      ["c2", "스텐파", "스텐은 320 바로 쓰면 결이 너무 도드라져서 220 한 번 거치는 편입니다.", 1218],
      ["c3", "사포질문", "작은 건 스펀지사포 빨강-파랑-초록 순으로 써도 될까요?", 1199],
      ["c4", "도장전", "네 그 순서 무난해요. 모서리 죽이기엔 오히려 더 편합니다.", 1186],
    ],
  },
];

const showcaseSeeds = [
  {
    id: "seed-showcase-floral-light",
    title: "플로럴 조명 제작 후기",
    nickname: "꽃광원",
    body: "꽃잎이 겹쳐지는 조명 헤드를 목표로 작업했습니다. 하나컴퓨터정밀조각에서 중심 결합부 쪽 CNC 가공을 먼저 맞추고, 에스와이레이저에서 꽃잎 파츠를 레이저커팅한 뒤 말아 올려 조립했습니다. 평면 파츠 상태에서는 단순해 보여도 실제로 세워보면 각도 차이가 꽤 커서, 슬롯 간격과 용접 순서를 여러 번 조정한 작업이었어요. 결과물에서는 꽃봉오리처럼 보이도록 외곽 꽃잎 높이를 일부러 다르게 잡았습니다.",
    imageUrls: [
      "/showcase/floral-light-result.png",
      "/showcase/floral-light-cnc.jpg",
      "/showcase/floral-light-laser-assembly.jpg",
      "/showcase/floral-light-laser-parts.jpg",
    ],
    usedStores: [
      { name: "하나컴퓨터정밀조각", how: "중심 결합부와 베이스 쪽 CNC 가공" },
      { name: "에스와이레이저", how: "꽃잎 형태의 판재 파츠 레이저커팅" },
      { name: "자체 조립", how: "용접과 조립 순서를 조정해 꽃 형태로 세팅" },
    ],
    createdAt: minutesAgo(45),
    comments: [
      ["c1", "레이저새벽반", "꽃잎 파츠가 생각보다 얇아 보여서 휘어짐 걱정됐는데 조립 후 형태가 잘 잡혔네요.", 37],
      ["c2", "꽃광원", "슬롯 간격을 조금 타이트하게 잡아서 세울 때 힘으로 맞췄어요. 그 덕에 고정이 잘 됐습니다.", 29],
      ["c3", "금속모형", "결과 사진 보니까 전시 조명으로 바로 써도 될 정도네요.", 22],
    ],
  },
  {
    id: "seed-showcase-standing-light",
    title: "스탠딩 조명 프레임 제작 후기",
    nickname: "라인조명",
    body: "유기적으로 선이 흐르는 스탠딩 조명을 만들고 싶어서 파이프 프레임부터 먼저 잡았습니다. 성진 cnc 벤딩에서 곡률이 다른 파이프를 여러 번 나눠 밴딩하고, 삼환금속에서 용접으로 전체 실루엣을 묶었습니다. 한 번에 완성 형태를 만들기보다 고리 단위로 파트를 나눈 뒤 다시 이어붙이는 방식이 안정적이었어요. 최종적으로 조명 헤드가 달리는 위치까지 고려해서 수직 중심축을 조금 더 길게 뽑았습니다.",
    imageUrls: [
      "/showcase/standing-light-result.png",
      "/showcase/standing-light-process.jpg",
    ],
    usedStores: [
      { name: "성진 cnc 벤딩", how: "파이프를 곡률별로 나눠 벤딩" },
      { name: "삼환금속", how: "밴딩된 파이프 프레임 용접 조립" },
    ],
    createdAt: minutesAgo(160),
    comments: [
      ["c1", "곡률집착", "파이프 굵기랑 밴딩 반경 조합이 예쁘네요. 프레임 비율 참고 많이 됩니다.", 146],
      ["c2", "라인조명", "세워 놓고 보니 상단 고리 크기를 조금 키운 게 전체 균형 잡는 데 제일 컸어요.", 133],
      ["c3", "용접메모", "용접 자국 거의 안 보여서 마감도 깔끔하게 된 것 같아요.", 118],
    ],
  },
  {
    id: "seed-showcase-anodized-flower",
    title: "아노다이징 염색 샘플 제작 후기",
    nickname: "컬러메탈",
    body: "동일한 형태의 얇은 파츠를 여러 장 끼워 올리는 구조라 먼저 무채색 샘플을 확인한 뒤 아노다이징 컬러 테스트로 넘어갔습니다. 에스와이레이저에서 기본 파츠를 레이저커팅하고 슬롯 결합 상태를 점검한 다음, 설산실업에 맡겨 색을 입혔어요. 표면 질감이 살아있는 쪽이 염색 후 반짝임이 더 잘 보여서, 지나치게 매끈하게 밀기보다 원판의 결을 조금 남기는 편이 결과가 좋았습니다. 컬러별로 층이 겹쳤을 때 명도가 달라지는 점도 재미있었습니다.",
    imageUrls: [
      "/showcase/anodizing-result.jpg",
      "/showcase/anodizing-process.jpg",
    ],
    usedStores: [
      { name: "에스와이레이저", how: "반복되는 꽃잎형 파츠 레이저커팅" },
      { name: "설산실업", how: "실버 샘플을 컬러 아노다이징 톤으로 염색 마감" },
    ],
    createdAt: minutesAgo(310),
    comments: [
      ["c1", "색샘플수집", "실버 상태일 때보다 훨씬 풍성해 보이네요. 색 올라간 뒤 그림자가 예쁩니다.", 286],
      ["c2", "컬러메탈", "핑크나 보라처럼 채도 높은 색은 겹쳤을 때 깊이가 생겨서 의도보다 좋았어요.", 270],
      ["c3", "표면덕후", "표면 결을 조금 남긴 게 진짜 잘 먹은 것 같아요.", 249],
    ],
  },
  {
    id: "seed-showcase-sheet-chair",
    title: "레이저컷 체어 프레임 제작 후기",
    nickname: "시트프레임",
    body: "이번 작업은 판재와 파이프를 같이 써서 체어 구조를 만드는 방식이었습니다. 에스와이레이저에서 측판과 좌판 계열 파츠를 레이저커팅하고, 신진벤딩에서 양옆 프레임을 벤딩한 뒤 삼환금속에서 전체 용접 조립을 진행했어요. 판재 부품과 벤딩된 파이프가 만나는 지점이 많아서 구멍 위치와 브라켓 간격을 먼저 맞추는 게 중요했습니다. 최종적으로는 좌판과 등판이 하나의 금속 골조로 읽히도록 표면 방향과 모서리 라인을 정리했습니다.",
    imageUrls: ["/showcase/chair-laser-bending-result.jpg"],
    usedStores: [
      { name: "에스와이레이저", how: "측판과 좌판 계열 판재 파츠 레이저커팅" },
      { name: "신진벤딩", how: "체어 양옆 프레임과 손잡이 라인 벤딩" },
      { name: "삼환금속", how: "벤딩 파츠와 판재 구조물 최종 용접 조립" },
    ],
    createdAt: minutesAgo(18),
    comments: [
      ["c1", "판재조립", "좌판 결이 살아 있어서 구조가 더 또렷해 보이네요.", 14],
      ["c2", "시트프레임", "표면 결 방향을 맞추려고 마지막에 한 번 더 조립 순서를 바꿨습니다.", 9],
      ["c3", "벤딩메모", "양쪽 프레임 라인이 깔끔해서 벤딩 결과가 잘 나온 것 같아요.", 6],
    ],
  },
  {
    id: "seed-showcase-brass-casting",
    title: "황동 오브제 캐스팅",
    nickname: "주물기록",
    body: "작은 오브제를 황동으로 캐스팅하면서 표면 질감이 최대한 그대로 살아나도록 테스트한 작업입니다. 탑플러스에서 먼저 왁스 원형을 출력하고, 그 형상을 기준으로 캐스팅을 진행했어요. 결과물에서는 매끈한 마감보다 울퉁불퉁한 표면과 돌기 느낌이 살아 있는 쪽이 오히려 더 좋았습니다. 원형 단계에서 디테일이 약하면 금속으로 넘어갔을 때 질감이 무뎌져 보여서, 왁스 상태에서부터 결을 세게 잡는 편이 결과가 확실했습니다.",
    imageUrls: [
      "/showcase/brass-casting-result.jpg",
      "/showcase/brass-casting-process.jpg",
    ],
    usedStores: [{ name: "탑플러스", how: "왁스 원형 출력과 황동 캐스팅용 원본 형상 제작" }],
    createdAt: minutesAgo(12),
    comments: [
      ["c1", "주물관찰", "표면 울림이 그대로 살아서 캐스팅 질감이 좋네요. 왁스 단계가 중요하다는 말이 이해됩니다.", 10],
      ["c2", "주물기록", "매끈하게 다듬는 것보다 원형 텍스처를 남기는 쪽이 결과가 훨씬 재밌었어요.", 8],
    ],
  },
  {
    id: "seed-showcase-necklace-main-part",
    title: "목걸이 메인 파츠 제작",
    nickname: "판재주얼리",
    body: "얇은 황동 판에서 메인 파츠를 뽑아 입체적으로 접고 쌓는 구조를 테스트한 작업입니다. 창신부식에서 먼저 판재에 라인과 텍스트를 부식 가공으로 정리하고, 이후 메인 파츠를 접어 조립해 마감 톤을 맞췄어요. 평면 상태에서는 선이 얕아 보여도 접고 올리면 레이어가 겹치면서 표면 정보가 훨씬 또렷하게 읽혔습니다. 문자와 홈이 한 번에 들어가는 판재 작업이라 초반에 선 굵기와 식각 깊이를 잡는 게 가장 중요했습니다.",
    imageUrls: [
      "/showcase/necklace-main-part-result.jpg",
      "/showcase/necklace-main-part-process.jpg",
    ],
    usedStores: [{ name: "창신부식", how: "황동 판재 부식 가공과 메인 파츠 라인 작업" }],
    createdAt: minutesAgo(8),
    comments: [
      ["c1", "식각메모", "평면 판 상태에서 본 라인이 완성 후에 더 잘 읽히는 게 재밌네요.", 6],
      ["c2", "판재주얼리", "얕게만 먹여도 접었을 때 그림자가 생겨서 생각보다 정보량이 커졌습니다.", 4],
    ],
  },
  {
    id: "seed-showcase-object-lamp",
    title: "오브제 조명 제작 후기",
    nickname: "구조광원",
    body: "금속 외피와 내부 광원 박스를 분리해 조립하는 방식으로 오브제 조명을 제작했습니다. 에스와이레이저에서 외곽 판재와 황동 포인트 파츠를 레이저커팅하고, 설산실업에서 초록 계열 컬러 마감을 올린 뒤 조립했어요. 내부에서 LED 모듈을 잡아주는 흰색 박스는 FDM 방식으로 3D프린팅해서 광원 고정과 배선 정리를 동시에 해결했습니다. 판재 자체는 평면이지만 접히는 방향과 내부 프린트 파츠 위치가 잘 맞아야 전체 형상이 안정적으로 서서, 금속 파츠보다 먼저 광원 박스 기준 치수를 고정해 두는 쪽이 작업이 수월했습니다.",
    imageUrls: ["/showcase/object-lamp-process.jpg"],
    usedStores: [
      { name: "에스와이레이저", how: "외곽 판재와 황동 포인트 파츠 레이저커팅" },
      { name: "설산실업", how: "초록 계열 컬러 마감과 표면 처리" },
      { name: "3D프로", how: "LED 모듈이 들어가는 흰색 FDM 3D프린팅 내부 하우징 제작" },
    ],
    createdAt: minutesAgo(4),
    comments: [
      ["c1", "광원구조", "금속 외피랑 흰색 하우징이 분리돼 있어서 유지보수도 편해 보이네요.", 3],
      ["c2", "구조광원", "맞아요. 전구 교체나 배선 점검 때문에 내부 박스를 따로 빼는 구조로 잡았습니다.", 2],
    ],
  },
];

async function ensurePost(db, auth, seed) {
  const postRef = doc(db, "posts", seed.id);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) {
    const opUid = await freshUid(auth);
    await setDoc(postRef, {
      title: seed.title,
      coverUrl: "",
      body: seed.body,
      nickname: seed.nickname,
      authorUid: opUid,
      imageCount: 0,
      usedStoreCount: 0,
      commentCount: 0,
      createdAt: Timestamp.fromMillis(seed.createdAt),
    });
  }

  for (const [commentId, nickname, body, minutes] of seed.comments) {
    const ref = doc(db, "posts", seed.id, "comments", `${seed.id}-${commentId}`);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const commenterUid = await freshUid(auth);
      await setDoc(ref, {
        nickname,
        body,
        authorUid: commenterUid,
        createdAt: Timestamp.fromMillis(minutesAgo(minutes)),
      });
    }
  }

  const commentCount = (await getDocs(collection(db, "posts", seed.id, "comments"))).size;
  await updateDoc(postRef, { commentCount });
}

async function ensureShowcase(db, auth, seed) {
  const showcaseRef = doc(db, "showcases", seed.id);
  const showcaseSnap = await getDoc(showcaseRef);
  if (showcaseSnap.exists()) return;

  const opUid = await freshUid(auth);
  await setDoc(showcaseRef, {
    title: seed.title,
    coverUrl: seed.imageUrls[0] ?? "",
    body: "",
    nickname: seed.nickname,
    authorUid: opUid,
    imageCount: seed.imageUrls.length,
    usedStoreCount: seed.usedStores.length,
    commentCount: seed.comments.length,
    createdAt: Timestamp.fromMillis(seed.createdAt),
  });

  await setDoc(doc(db, "showcases", seed.id, "detail", "data"), {
    body: seed.body,
    imageUrls: seed.imageUrls,
    usedStores: seed.usedStores,
    authorUid: opUid,
  });

  for (const [commentId, nickname, body, minutes] of seed.comments) {
    const ref = doc(db, "showcases", seed.id, "comments", `${seed.id}-${commentId}`);
    const commenterUid = await freshUid(auth);
    await setDoc(ref, {
      nickname,
      body,
      authorUid: commenterUid,
      createdAt: Timestamp.fromMillis(minutesAgo(minutes)),
    });
  }
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
await signInAnonymously(auth);
const db = getFirestore(app);

for (const seed of boardSeeds) {
  await ensurePost(db, auth, seed);
}

for (const seed of showcaseSeeds) {
  await ensureShowcase(db, auth, seed);
}

console.log(
  JSON.stringify(
    {
      seededPosts: boardSeeds.length,
      seededShowcases: showcaseSeeds.length,
      done: true,
    },
    null,
    2,
  ),
);
