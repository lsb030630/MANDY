export type ExploreMode = "service" | "material";

export type ServiceCategoryId =
  | "3d-printing"
  | "cnc"
  | "laser-cutting"
  | "welding"
  | "bending"
  | "coating"
  | "woodwork";

export type MaterialCategoryId =
  | "metal"
  | "wood"
  | "acrylic"
  | "fabric"
  | "leather"
  | "etc";

export type CategoryId = ServiceCategoryId | MaterialCategoryId;

export interface CategoryOption {
  id: CategoryId;
  label: string;
  hint: string;
}

export interface Store {
  id: string;
  type: ExploreMode;
  categories: CategoryId[];
  name: string;
  area: string;
  address?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  extraContact?: string;
  description?: string;
  fileGuide?: string;
  orderGuide?: string;
  review?: string;
  memo?: string;
  tags: string[];
  verifiedAt?: string;
  isVisible: boolean;
}

export interface PendingStore {
  name: string;
  area: string;
  phone?: string;
  reason: string;
}

export const modeCopy: Record<
  ExploreMode,
  {
    label: string;
    title: string;
    caption: string;
  }
> = {
  service: {
    label: "작업 맡기기",
    title: "작업 방식으로 업체 찾기",
    caption: "파일 형식, 의뢰 방법, 실제 사용 메모를 중심으로 정리했습니다.",
  },
  material: {
    label: "재료 사기",
    title: "재료 종류로 재료상 찾기",
    caption: "필요한 재료와 구매 전 확인할 내용을 중심으로 봅니다.",
  },
};

export const serviceCategories: CategoryOption[] = [
  { id: "3d-printing", label: "3D프린팅", hint: "출력 제작" },
  { id: "cnc", label: "CNC", hint: "정밀 절삭" },
  { id: "laser-cutting", label: "레이저커팅", hint: "판재 절단" },
  { id: "welding", label: "용접", hint: "금속 접합" },
  { id: "bending", label: "벤딩", hint: "금속 굽힘" },
  { id: "coating", label: "도장", hint: "표면 마감" },
  { id: "woodwork", label: "목공", hint: "목재 제작" },
];

export const materialCategories: CategoryOption[] = [
  { id: "metal", label: "금속", hint: "판, 봉, 파이프" },
  { id: "wood", label: "목재", hint: "원목, 무늬목" },
  { id: "acrylic", label: "아크릴", hint: "아크릴, 플라스틱" },
  { id: "fabric", label: "천", hint: "패브릭, 원단" },
  { id: "leather", label: "가죽", hint: "가죽, 부자재" },
  { id: "etc", label: "기타", hint: "볼트, 전기, 자석" },
];

export const allCategories = [...serviceCategories, ...materialCategories];

export const stores: Store[] = [
  {
    id: "atelier-fl",
    type: "material",
    categories: ["leather"],
    name: "가죽공방 atelier fl",
    area: "성동구",
    address: "서울시 성동구 상원4길 9, 3층",
    phone: "070-4188-2635",
    extraContact: "카카오톡 @아뜰리에에프엘",
    description: "가죽 작업 상담과 방문 상담이 가능한 공방",
    memo: "전화 또는 카카오톡으로 먼저 상담한 뒤 방문하는 흐름이 자연스럽습니다.",
    tags: ["상담 가능", "가죽", "방문 상담"],
    verifiedAt: "2026-05-30",
    isVisible: false,
  },
  {
    id: "samgu-woodwork",
    type: "service",
    categories: ["woodwork"],
    name: "삼구나무공방",
    area: "미확인",
    phone: "010-4657-2000",
    description: "목공 작업 문의 가능",
    memo: "추가 주소 확인 전까지 연락처 중심으로 활용합니다.",
    tags: ["소량 가능", "목공"],
    verifiedAt: "2026-05-30",
    isVisible: false,
  },
  {
    id: "seongjin-cnc-bending",
    type: "service",
    categories: ["cnc", "bending"],
    name: "성진 cnc 벤딩",
    area: "을지로",
    address: "서울특별시 중구 창경궁로5길 29",
    phone: "010-7760-7417",
    description: "CNC 벤딩 작업 문의 가능",
    fileGuide: "도면 또는 치수 기준 자료가 있으면 상담이 빠릅니다.",
    orderGuide: "전화로 가능 여부를 먼저 확인한 뒤 방문하는 방식이 좋습니다.",
    review: "벤딩이 필요한 작업에서 우선 검토할 수 있는 업체입니다.",
    memo: "벤딩이 필요한 작업에서 우선 검토할 수 있는 업체입니다.",
    tags: ["소량 가능", "벤딩", "CNC"],
    verifiedAt: "2026-05-30",
    isVisible: true,
  },
  {
    id: "yeongdong-laser",
    type: "service",
    categories: ["laser-cutting"],
    name: "영동레이져땜",
    area: "종로",
    phone: "010-9251-5997",
    description: "쥬얼리 외 큰 물건도 레이저 작업 문의 가능",
    memo: "은땜도 올려서 레이저 작업이 가능하다고 들었고, 현금 결제 기준으로 메모되어 있습니다.",
    tags: ["소량 가능", "레이저", "현금 필수"],
    verifiedAt: "2026-05-30",
    isVisible: false,
  },
  {
    id: "petit-plating",
    type: "service",
    categories: ["coating"],
    name: "쁘띠도금",
    area: "종로",
    address: "서울특별시 종로구 돈화문로 48 2층",
    phone: "02-745-6624",
    description: "도금 및 표면 마감 작업",
    fileGuide: "마감하려는 재료, 색상, 수량을 미리 정리해 가는 것이 좋습니다.",
    orderGuide: "작업물 상태와 원하는 마감 기준을 전화로 먼저 설명하세요.",
    review: "작업 퀄리티가 좋다는 메모가 남아 있습니다.",
    memo: "작업 퀄리티가 좋다는 메모가 남아 있습니다.",
    tags: ["도장", "마감", "추천"],
    verifiedAt: "2026-05-30",
    isVisible: true,
  },
  {
    id: "juju-laser",
    type: "service",
    categories: ["laser-cutting"],
    name: "주주레이저",
    area: "종로",
    phone: "010-7676-1753",
    description: "레이저 작업 문의 가능",
    memo: "토요일에도 연다는 메모가 있어 급한 일정에서 보기 좋습니다.",
    tags: ["레이저", "토요일 영업", "소량 가능"],
    verifiedAt: "2026-05-30",
    isVisible: false,
  },
  {
    id: "daeseong-materials",
    type: "material",
    categories: ["metal"],
    name: "대성재료상사",
    area: "종로",
    address: "서울특별시 종로구 돈화문로10가길 7",
    phone: "02-762-3808",
    description: "금속 재료 구매처",
    orderGuide: "구매하려는 재료명과 규격을 적어두고 방문하면 빠릅니다.",
    review: "대진보다 저렴하다는 메모가 남아 있습니다.",
    memo: "대진보다 저렴하다는 메모가 남아 있습니다.",
    tags: ["재료 구매 가능", "금속"],
    verifiedAt: "2026-05-30",
    isVisible: true,
  },
  {
    id: "eun-segye",
    type: "material",
    categories: ["metal"],
    name: "은세계",
    area: "종로",
    address: "서울특별시 종로구 돈화문로5가길 1 피카디리플러스 303호",
    phone: "02-747-3371",
    description: "은 관련 재료 구매 가능",
    orderGuide: "은 재료의 단가와 중량 기준을 현장에서 확인하는 것이 좋습니다.",
    review: "은 구매 가격은 다소 높다는 메모가 있습니다.",
    memo: "은 구매 가격은 다소 높다는 메모가 있습니다.",
    tags: ["금속", "은", "재료 구매 가능"],
    verifiedAt: "2026-05-30",
    isVisible: true,
  },
  {
    id: "daejin-materials",
    type: "material",
    categories: ["metal", "etc"],
    name: "대진재료사",
    area: "종로",
    address: "서울특별시 종로구 묘동 99-1",
    phone: "02-766-0985",
    description: "재료 종류가 넓은 재료상",
    orderGuide: "정확한 재료명을 모를 때도 사진이나 샘플을 가져가면 도움이 됩니다.",
    review: "거의 모든 재료를 다루고, 은을 팔 때도 참고할 수 있다는 메모가 있습니다.",
    memo: "거의 모든 재료를 다루고, 은을 팔 때도 참고할 수 있다는 메모가 있습니다.",
    tags: ["재료 구매 가능", "금속", "기타 재료"],
    verifiedAt: "2026-05-30",
    isVisible: true,
  },
  {
    id: "daedeok-metal",
    type: "material",
    categories: ["metal"],
    name: "대덕메탈",
    area: "을지로",
    address: "서울특별시 중구 을지로15길 20",
    phone: "02-2274-2323",
    description: "동판 구매가 가능한 금속 재료상",
    orderGuide: "동판 두께와 크기를 먼저 정리해 문의하세요.",
    review: "동판이 필요할 때 우선 확인할 만한 곳입니다.",
    memo: "동판이 필요할 때 우선 확인할 만한 곳입니다.",
    tags: ["금속", "동판", "재료 구매 가능"],
    verifiedAt: "2026-05-30",
    isVisible: true,
  },
  {
    id: "gaya-metal",
    type: "material",
    categories: ["metal"],
    name: "가야금속",
    area: "을지로",
    address: "서울특별시 중구 을지로15길 24",
    phone: "02-2263-7788",
    description: "파이프와 봉 재료를 찾기 좋은 금속상",
    orderGuide: "파이프, 봉의 지름과 길이를 미리 적어두고 문의하세요.",
    review: "파이프와 봉 메모가 선명하게 남아 있습니다.",
    memo: "파이프와 봉 메모가 선명하게 남아 있습니다.",
    tags: ["금속", "파이프", "봉"],
    verifiedAt: "2026-05-30",
    isVisible: true,
  },
  {
    id: "seoul-magnet",
    type: "material",
    categories: ["etc"],
    name: "서울자석",
    area: "을지로",
    address: "서울특별시 종로구 청계천로 133",
    phone: "02-2279-0445",
    description: "자석을 중심으로 찾는 부자재 상점",
    orderGuide: "자석 크기와 흡착력을 기준으로 문의하는 것이 좋습니다.",
    review: "자석이 필요할 때 바로 떠올릴 수 있는 곳으로 메모되어 있습니다.",
    memo: "자석이 필요할 때 바로 떠올릴 수 있는 곳으로 메모되어 있습니다.",
    tags: ["기타", "자석", "재료 구매 가능"],
    verifiedAt: "2026-05-30",
    isVisible: true,
  },
  {
    id: "hanil-lighting",
    type: "material",
    categories: ["etc"],
    name: "한일조명",
    area: "을지로",
    address: "서울특별시 종로구 청계천로 159 세운상가 1층 라열 118호",
    phone: "02-2263-1646",
    description: "전구와 조명 부속을 볼 수 있는 상점",
    orderGuide: "전구 규격, 색온도, 연결 부속을 같이 확인하세요.",
    review: "전구를 찾을 때 참고할 수 있고, 응대가 좋다는 메모가 있습니다.",
    memo: "전구를 찾을 때 참고할 수 있고, 응대가 좋다는 메모가 있습니다.",
    tags: ["기타", "조명", "전구"],
    verifiedAt: "2026-05-30",
    isVisible: true,
  },
  {
    id: "baeksan-wood-veneer",
    type: "material",
    categories: ["wood"],
    name: "백산무늬목재",
    area: "을지로",
    address: "서울특별시 중구 을지로 170",
    phone: "02-2285-2800",
    description: "원목과 무늬목 종류가 많은 목재상",
    orderGuide: "재료 사진, 필요한 면적, 두께를 정리해 가면 좋습니다.",
    review: "원목 종류가 매우 많다는 메모가 있어 목재 탐색용으로 좋습니다.",
    memo: "원목 종류가 매우 많다는 메모가 있어 목재 탐색용으로 좋습니다.",
    tags: ["목재", "원목", "재료 구매 가능"],
    verifiedAt: "2026-05-30",
    isVisible: true,
  },
  {
    id: "woosung-trading",
    type: "material",
    categories: ["etc"],
    name: "우성상사",
    area: "을지로",
    address: "서울특별시 중구 을지로 203-1 1층",
    phone: "02-2265-1438",
    description: "실리콘과 레진을 저렴하게 보기 좋은 상점",
    orderGuide: "용도, 경화 방식, 필요한 양을 먼저 정리해 문의하세요.",
    review: "실리콘과 레진 쪽 메모가 강합니다.",
    memo: "실리콘과 레진 쪽 메모가 강합니다.",
    tags: ["기타", "레진", "실리콘"],
    verifiedAt: "2026-05-30",
    isVisible: true,
  },
  {
    id: "samik-electric",
    type: "material",
    categories: ["etc"],
    name: "삼익전기",
    area: "을지로",
    address: "서울특별시 종로구 장사동 204",
    phone: "02-2265-4080",
    description: "전기 관련 부속품을 보기 좋은 상점",
    orderGuide: "사용 전압, 연결 방식, 필요한 부속 사진을 준비하면 좋습니다.",
    review: "응대가 친절하다는 메모가 남아 있습니다.",
    memo: "응대가 친절하다는 메모가 남아 있습니다.",
    tags: ["기타", "전기 부속", "친절"],
    verifiedAt: "2026-05-30",
    isVisible: true,
  },
  {
    id: "taesung-bolt",
    type: "material",
    categories: ["etc"],
    name: "태성 볼트",
    area: "을지로",
    address: "서울특별시 중구 을지로3가 140-5 1층",
    phone: "02-2275-7589",
    description: "볼트와 너트를 소량으로 구매 가능",
    orderGuide: "볼트 규격, 길이, 수량을 적어두고 방문하세요.",
    review: "소량 판매가 가능한 점이 핵심입니다.",
    memo: "소량 판매가 가능한 점이 핵심입니다.",
    tags: ["기타", "볼트", "소량 가능"],
    verifiedAt: "2026-05-30",
    isVisible: true,
  },
];

export const pendingLocationStores: PendingStore[] = [
  { name: "가죽공방 atelier fl", area: "성동구", phone: "070-4188-2635", reason: "권역 외 업체, 현재 타깃 범위 밖" },
  { name: "삼구나무공방", area: "미확인", phone: "010-4657-2000", reason: "정확한 주소 미확인" },
  { name: "영동레이져땜", area: "종로", phone: "010-9251-5997", reason: "세부 주소 미확인" },
  { name: "주주레이저", area: "종로", phone: "010-7676-1753", reason: "세부 주소 미확인" },
];

export function getCategoriesByMode(mode: ExploreMode) {
  return mode === "service" ? serviceCategories : materialCategories;
}

export function getCategoryLabel(categoryId: CategoryId) {
  return allCategories.find((category) => category.id === categoryId)?.label ?? categoryId;
}
