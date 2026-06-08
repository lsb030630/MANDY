import type { CategoryId, Store } from "./stores";

export type AdvisorOption = {
  id: string;
  label: string;
  categories: CategoryId[];
};

export type AdvisorRecommendation = {
  store: Store;
  matchedCategories: CategoryId[];
  score: number;
};

export const advisorGroups: { title: string; options: AdvisorOption[] }[] = [
  {
    title: "사용하는 재료가 무엇인가요?",
    options: [
      { id: "material-metal", label: "금속", categories: ["metal"] },
      { id: "material-wood", label: "목재", categories: ["wood"] },
      { id: "material-acrylic", label: "아크릴", categories: ["acrylic"] },
      { id: "material-fabric", label: "천", categories: ["fabric"] },
      { id: "material-leather", label: "가죽", categories: ["leather"] },
      { id: "material-etc", label: "기타", categories: ["etc"] },
    ],
  },
  {
    title: "사용하는 툴은 무엇인가요?",
    options: [
      { id: "tool-3d", label: "3D프린터", categories: ["3d-printing"] },
      { id: "tool-cnc", label: "CNC", categories: ["cnc"] },
      { id: "tool-laser", label: "레이저커터", categories: ["laser-cutting"] },
      { id: "tool-welding", label: "용접", categories: ["welding"] },
      { id: "tool-wood", label: "목공 장비", categories: ["woodwork"] },
      { id: "tool-coating", label: "도장 장비", categories: ["coating"] },
    ],
  },
  {
    title: "어떤 가공이 필요하신가요?",
    options: [
      { id: "process-cut", label: "자르기", categories: ["laser-cutting", "cnc", "woodwork"] },
      { id: "process-print", label: "프린팅", categories: ["3d-printing"] },
      { id: "process-bend", label: "접기/휘기", categories: ["bending"] },
      { id: "process-join", label: "붙이기", categories: ["welding", "woodwork"] },
      { id: "process-finish", label: "마감/칠하기", categories: ["coating"] },
    ],
  },
];

const advisorOptions = advisorGroups.flatMap((group) => group.options);

export function getAdvisorCategories(selectionIds: string[]) {
  return Array.from(
    new Set(
      advisorOptions
        .filter((option) => selectionIds.includes(option.id))
        .flatMap((option) => option.categories),
    ),
  );
}

export function getAdvisorRecommendations(stores: Store[], selectionIds: string[]) {
  const categories = getAdvisorCategories(selectionIds);
  if (categories.length === 0) return [];

  const selected = new Set(categories);

  return stores
    .map((store) => {
      const matchedCategories = store.categories.filter((category) => selected.has(category));
      if (matchedCategories.length === 0) return null;

      const score =
        matchedCategories.length * 10 +
        (store.tags.some((tag) => tag.includes("소량")) ? 2 : 0) +
        (store.address ? 1 : 0);

      return { store, matchedCategories, score };
    })
    .filter((item): item is AdvisorRecommendation => item !== null)
    .sort((a, b) => b.score - a.score || a.store.name.localeCompare(b.store.name, "ko"))
    .slice(0, 5);
}
