"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, ChevronDown, ChevronUp, FileText, MessageSquare, Phone, Search, SlidersHorizontal } from "lucide-react";
import { hasFirebaseConfig } from "@/lib/firebase";
import { submitContribution } from "@/lib/contributions";
import {
  type CategoryId,
  type ExploreMode,
  type Store,
  getCategoriesByMode,
  getCategoryLabel,
  modeCopy,
} from "@/lib/stores";
import { useBookmarks } from "@/lib/use-bookmarks";
import styles from "./ExploreClient.module.css";

type ExploreClientProps = {
  initialCategory: CategoryId | null;
  initialMode: ExploreMode;
  initialStoreId: string | null;
  stores: Store[];
};

type ContributionForm = {
  contact: string;
  fileGuide: string;
  orderGuide: string;
  review: string;
  storeId?: string;
  storeName: string;
};

type ProductOption = {
  category: CategoryId;
  helper: string;
  id: "lighting" | "speaker" | "furniture" | "object";
  label: string;
  mode: ExploreMode;
  query?: string;
};

const productOptions: ProductOption[] = [
  {
    id: "lighting",
    label: "조명",
    helper: "전구, 전기 부속, 금속 재료",
    mode: "material",
    category: "etc",
    query: "조명",
  },
  {
    id: "speaker",
    label: "스피커",
    helper: "전기 부속, 목재/외장 재료",
    mode: "material",
    category: "etc",
    query: "전기",
  },
  {
    id: "furniture",
    label: "가구",
    helper: "목재, 프레임, 결합 부품",
    mode: "material",
    category: "wood",
  },
  {
    id: "object",
    label: "소품",
    helper: "CNC, 벤딩, 마감 업체",
    mode: "service",
    category: "cnc",
  },
];

const emptyContributionForm: ContributionForm = {
  contact: "",
  fileGuide: "",
  orderGuide: "",
  review: "",
  storeName: "",
};

export function ExploreClient({ initialCategory, initialMode, initialStoreId, stores }: ExploreClientProps) {
  const getFirstAvailableCategory = (targetMode: ExploreMode): CategoryId =>
    getCategoriesByMode(targetMode).find((category) =>
      stores.some((store) => store.type === targetMode && store.categories.includes(category.id)),
    )?.id ?? getCategoriesByMode(targetMode)[0].id;

  const [mode, setMode] = useState<ExploreMode>(initialMode);
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Record<ExploreMode, CategoryId | null>>({
    service: initialMode === "service" ? initialCategory : null,
    material: initialMode === "material" ? initialCategory : null,
  });
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(initialStoreId);
  const [selectedMaterial, setSelectedMaterial] = useState<CategoryId | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductOption["id"] | null>(null);
  const [contributionForm, setContributionForm] = useState<ContributionForm | null>(null);
  const [contributionStatus, setContributionStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [contributionMessage, setContributionMessage] = useState("");
  const { bookmarkedSet, toggleBookmark } = useBookmarks();
  const lastScrollY = useRef(0);
  const listPanelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!selectedStoreId) return;

    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY - lastScrollY.current > 24) {
        setSelectedStoreId(null);
      }
      lastScrollY.current = currentY;
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [selectedStoreId]);

  const categories = useMemo(() => getCategoriesByMode(mode), [mode]);
  const materialOptions = useMemo(() => getCategoriesByMode("material"), []);
  const selectedCategory = selectedCategories[mode];
  const hasStoreForSelectedCategory =
    selectedCategory != null &&
    stores.some((store) => store.type === mode && store.categories.includes(selectedCategory));
  const activeCategory =
    selectedCategory &&
    categories.some((category) => category.id === selectedCategory) &&
    hasStoreForSelectedCategory
      ? selectedCategory
      : getFirstAvailableCategory(mode);

  const filteredStores = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return stores.filter((store) => {
      if (store.type !== mode) return false;
      if (activeCategory && !store.categories.includes(activeCategory)) return false;

      if (!normalizedQuery) return true;

      const haystack = [
        store.name,
        store.area,
        store.address,
        store.description,
        store.fileGuide,
        store.memo,
        store.orderGuide,
        store.phone,
        store.review,
        store.extraContact,
        ...store.categories.map((category) => getCategoryLabel(category)),
        ...store.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [activeCategory, mode, query, stores]);

  const activeStoreId =
    selectedStoreId && filteredStores.some((store) => store.id === selectedStoreId)
      ? selectedStoreId
      : null;

  const applyCategory = (targetMode: ExploreMode, categoryId: CategoryId, nextQuery = "") => {
    setMode(targetMode);
    setQuery(nextQuery);
    setSelectedStoreId(null);
    setSelectedCategories((current) => ({
      ...current,
      [targetMode]: categoryId,
    }));
  };

  const selectMaterial = (categoryId: CategoryId) => {
    setSelectedMaterial(categoryId);
    setSelectedProduct(null);
    applyCategory("material", categoryId);
  };

  const selectProduct = (option: ProductOption) => {
    setSelectedProduct(option.id);
    setSelectedMaterial(null);
    applyCategory(option.mode, option.category, option.query ?? "");
  };

  const openContributionForm = (store?: Store) => {
    setContributionStatus("idle");
    setContributionMessage("");
    setContributionForm({
      ...emptyContributionForm,
      storeId: store?.id,
      storeName: store?.name ?? "",
    });
  };

  const updateContributionForm = (field: keyof ContributionForm, value: string) => {
    setContributionForm((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleContributionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contributionForm) return;

    if (!hasFirebaseConfig()) {
      setContributionStatus("error");
      setContributionMessage("Firebase 설정값을 넣으면 이 제보가 데이터베이스에 저장됩니다.");
      return;
    }

    setContributionStatus("saving");
    setContributionMessage("");

    try {
      await submitContribution(contributionForm);
      setContributionStatus("saved");
      setContributionMessage("제보가 저장되었습니다. 확인 후 반영됩니다.");
      setContributionForm(null);
    } catch {
      setContributionStatus("error");
      setContributionMessage("저장에 실패했습니다. Firebase 설정과 권한을 확인해 주세요.");
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <Link className={styles.brand} href="/">
            MANDY
          </Link>

          <div className={styles.topActions}>
            <button
              type="button"
              className={styles.ghostLink}
              onClick={() => openContributionForm()}
            >
              <MessageSquare size={18} />
              제보
            </button>
            <Link className={styles.ghostLink} href="/bookmarks">
              <Bookmark size={18} />
              북마크
            </Link>
          </div>
        </header>

        <div className={styles.layout}>
          <section className={styles.projectBanner} aria-label="작품 조건 추천">
            <div className={styles.surveyCard}>
              <div className={styles.surveyHeader}>
                <strong>어떤 작품을 만들 예정인가요?</strong>
              </div>

              <div className={styles.surveyGroup}>
                <span className={styles.surveyLabel}>소재</span>
                <div className={styles.surveyChips}>
                  {materialOptions.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className={`${styles.surveyChip} ${
                        selectedMaterial === category.id && mode === "material" ? styles.surveyChipActive : ""
                      }`}
                      onClick={() => selectMaterial(category.id)}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.surveyGroup}>
                <span className={styles.surveyLabel}>만들 제품</span>
                <div className={styles.surveyChips}>
                  {productOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`${styles.surveyChip} ${
                        selectedProduct === option.id ? styles.surveyChipActive : ""
                      }`}
                      onClick={() => selectProduct(option)}
                      title={option.helper}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className={styles.controls}>
            <label className={styles.searchWrap}>
              <Search size={18} color="#667085" />
              <span className="sr-only">업체 검색</span>
              <input
                className={styles.searchInput}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="업체명, 카테고리, 의뢰 방법 검색"
              />
            </label>

            <div className={styles.segment} role="tablist" aria-label="탐색 모드 선택">
              {(["service", "material"] as ExploreMode[]).map((item) => {
                const active = mode === item;

                return (
                  <button
                    key={item}
                    type="button"
                    className={`${styles.segmentButton} ${active ? styles.segmentButtonActive : ""}`}
                    onClick={() => {
                      setMode(item);
                      setQuery("");
                      setSelectedMaterial(null);
                      setSelectedProduct(null);
                      setSelectedStoreId(null);
                    }}
                  >
                    {modeCopy[item].label}
                  </button>
                );
              })}
            </div>

            <div className={styles.categoryStrip}>
              {categories.map((category) => {
                const active = category.id === activeCategory;

                return (
                  <button
                    key={category.id}
                    type="button"
                    className={`${styles.categoryChip} ${active ? styles.categoryChipActive : ""}`}
                    onClick={() => {
                      setQuery("");
                      setSelectedProduct(null);
                      setSelectedMaterial(mode === "material" ? category.id : null);
                      setSelectedStoreId(null);
                      setSelectedCategories((current) => ({
                        ...current,
                        [mode]: category.id,
                      }));
                    }}
                  >
                    <strong>{category.label}</strong>
                    <span>{category.hint}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className={styles.workspace}>
            <section
              ref={listPanelRef}
              className={styles.listPanel}
              onScroll={(event) => {
                if (selectedStoreId && event.currentTarget.scrollTop > 18) {
                  setSelectedStoreId(null);
                }
              }}
            >
              <div className={styles.sheetHandle} aria-hidden="true" />

              <div className={styles.panelHeader}>
                <div className={styles.panelTitle}>
                  <h1>{modeCopy[mode].title}</h1>
                  <p>{modeCopy[mode].caption}</p>
                </div>
                <span className={styles.resultMeta}>
                  <SlidersHorizontal size={16} />
                  {filteredStores.length}곳
                </span>
              </div>

              {filteredStores.length === 0 ? (
                <div className={styles.emptyState}>
                  {mode === "service" ? (
                    <>
                      아직 위치가 확인된 작업 업체가 없습니다.
                      <br />
                      확인된 주소부터 순서대로 노출하고 있습니다.
                    </>
                  ) : (
                    <>
                      조건에 맞는 업체가 없습니다.
                      <br />
                      다른 카테고리나 검색어로 다시 찾아보세요.
                    </>
                  )}
                </div>
              ) : (
                <div className={styles.list}>
                  {filteredStores.map((store) => {
                    const active = store.id === activeStoreId;
                    const bookmarked = bookmarkedSet.has(store.id);

                    return (
                      <div
                        key={store.id}
                        className={`${styles.storeButton} ${active ? styles.storeButtonActive : ""}`}
                        onClick={() =>
                          setSelectedStoreId((current) => (current === store.id ? null : store.id))
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedStoreId((current) => (current === store.id ? null : store.id));
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className={styles.storeHead}>
                          <div>
                            <h3>{store.name}</h3>
                            <div className={styles.storeMeta}>
                              {store.categories.slice(0, 2).map((category) => (
                                <span key={category} className={styles.metaBadge}>
                                  {getCategoryLabel(category)}
                                </span>
                              ))}
                            </div>
                          </div>

                          <button
                            type="button"
                            className={`${styles.bookmarkButton} ${bookmarked ? styles.bookmarkButtonActive : ""}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleBookmark(store.id);
                            }}
                            aria-label={bookmarked ? "북마크 해제" : "북마크 추가"}
                          >
                            <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />
                          </button>
                        </div>

                        {store.description ? (
                          <p className={styles.storeDescription}>{store.description}</p>
                        ) : null}

                        <div className={styles.storeFooter}>
                          {store.phone ? (
                            <span>
                              <Phone size={16} />
                              {store.phone}
                            </span>
                          ) : null}
                          <span>
                            <FileText size={16} />
                            {store.orderGuide ? "의뢰 방법 있음" : "기본 메모"}
                          </span>
                        </div>

                        <div className={styles.expandRow}>
                          <span className={styles.expandHint}>
                            {active ? "접기" : "상세 보기"}
                          </span>
                          {active ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>

                        {active ? (
                          <div
                            className={styles.inlineDetail}
                            onClick={(event) => event.stopPropagation()}
                            onKeyDown={(event) => event.stopPropagation()}
                          >
                            <div className={styles.infoCopy}>
                              {store.review ? <p>사용 메모 · {store.review}</p> : null}
                              {store.fileGuide ? <p>파일/포맷 · {store.fileGuide}</p> : null}
                              {store.orderGuide ? <p>의뢰 방법 · {store.orderGuide}</p> : null}
                              {store.phone ? <p>전화 · {store.phone}</p> : null}
                              {store.extraContact ? <p>{store.extraContact}</p> : null}
                              {store.verifiedAt ? <p>확인일 · {store.verifiedAt}</p> : null}
                            </div>

                            <div className={styles.tagRow}>
                              {store.tags.map((tag) => (
                                <span key={tag} className={styles.tag}>
                                  {tag}
                                </span>
                              ))}
                            </div>

                            <div className={styles.actions}>
                              {store.phone ? (
                                <a
                                  className={styles.primaryAction}
                                  href={`tel:${store.phone.replaceAll(" ", "")}`}
                                >
                                  <Phone size={18} />
                                  전화하기
                                </a>
                              ) : null}
                              <button
                                type="button"
                                className={styles.secondaryAction}
                                onClick={() => toggleBookmark(store.id)}
                              >
                                <Bookmark size={18} />
                                {bookmarked ? "북마크 해제" : "북마크 저장"}
                              </button>
                              <a
                                className={styles.secondaryAction}
                                href="#contribution"
                                onClick={(event) => {
                                  event.preventDefault();
                                  openContributionForm(store);
                                }}
                              >
                                <MessageSquare size={18} />
                                정보 제보
                              </a>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </section>
        </div>
      </div>

      {contributionForm ? (
        <div className={styles.modalBackdrop} role="presentation">
          <section className={styles.modal} id="contribution" aria-label="업체 정보 제보">
            <div className={styles.modalHeader}>
              <div>
                <h2>업체 정보 제보</h2>
                <p>의뢰 방법, 파일 형식, 사용 경험처럼 다음 사람이 바로 쓸 수 있는 내용을 남겨주세요.</p>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setContributionForm(null)}
                aria-label="제보 폼 닫기"
              >
                ×
              </button>
            </div>

            <form className={styles.contributionForm} onSubmit={handleContributionSubmit}>
              <label>
                <span>업체명</span>
                <input
                  value={contributionForm.storeName}
                  onChange={(event) => updateContributionForm("storeName", event.target.value)}
                  placeholder="업체명을 입력하세요"
                  required
                />
              </label>

              <label>
                <span>연락처 / 카톡 / 링크</span>
                <input
                  value={contributionForm.contact}
                  onChange={(event) => updateContributionForm("contact", event.target.value)}
                  placeholder="확인한 연락처가 있으면 적어주세요"
                />
              </label>

              <label>
                <span>파일 형식 / 용량 / 준비물</span>
                <textarea
                  value={contributionForm.fileGuide}
                  onChange={(event) => updateContributionForm("fileGuide", event.target.value)}
                  placeholder="예: AI 파일 선호, 도면 필요, 10MB 이하 등"
                />
              </label>

              <label>
                <span>의뢰 방법</span>
                <textarea
                  value={contributionForm.orderGuide}
                  onChange={(event) => updateContributionForm("orderGuide", event.target.value)}
                  placeholder="예: 전화 후 방문, 사진 먼저 보내기, 현금 결제 등"
                />
              </label>

              <label>
                <span>사용 후기 / 꿀팁</span>
                <textarea
                  value={contributionForm.review}
                  onChange={(event) => updateContributionForm("review", event.target.value)}
                  placeholder="실제로 맡겨본 상황이나 주의할 점을 적어주세요"
                />
              </label>

              {contributionMessage ? (
                <p className={styles.formMessage}>{contributionMessage}</p>
              ) : null}

              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryAction} onClick={() => setContributionForm(null)}>
                  취소
                </button>
                <button type="submit" className={styles.primaryAction} disabled={contributionStatus === "saving"}>
                  {contributionStatus === "saving" ? "저장 중" : "제보 보내기"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  );
}
