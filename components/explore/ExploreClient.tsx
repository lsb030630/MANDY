"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bookmark, ChevronRight, MapPin, MessageSquarePlus, Phone, Search } from "lucide-react";
import { ContributeModal } from "@/components/community/ContributeModal";
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

export function ExploreClient({ stores }: { stores: Store[] }) {
  const [mode, setMode] = useState<ExploreMode>("service");
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<Record<ExploreMode, CategoryId | null>>({
    service: null,
    material: null,
  });
  const [contributeOpen, setContributeOpen] = useState(false);
  const { bookmarkedSet, toggleBookmark } = useBookmarks();

  const categoryOptions = useMemo(() => getCategoriesByMode(mode), [mode]);
  const activeCategory = categories[mode];

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return stores.filter((store) => {
      if (store.type !== mode) return false;
      if (activeCategory && !store.categories.includes(activeCategory)) return false;
      if (!normalized) return true;

      const haystack = [
        store.name,
        store.area,
        store.address,
        store.description,
        store.memo,
        store.phone,
        ...store.categories.map((category) => getCategoryLabel(category)),
        ...store.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [stores, mode, activeCategory, query]);

  const selectCategory = (id: CategoryId) =>
    setCategories((current) => ({ ...current, [mode]: current[mode] === id ? null : id }));

  return (
    <main>
      <header className="appbar">
        <h1>MANDY</h1>
        <span className="spacer" />
        <button className="iconbtn" onClick={() => setContributeOpen(true)} aria-label="업체 제보">
          <MessageSquarePlus size={20} />
        </button>
        <Link className="iconbtn" href="/bookmarks" aria-label="북마크">
          <Bookmark size={20} />
        </Link>
      </header>

      <label className={styles.search}>
        <Search size={18} />
        <span className="sr-only">업체 검색</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="업체명, 지역, 카테고리 검색"
        />
      </label>

      <div className={styles.segment} role="tablist" aria-label="탐색 모드">
        {(["service", "material"] as ExploreMode[]).map((item) => (
          <button
            key={item}
            role="tab"
            aria-selected={mode === item}
            className={`${styles.segBtn} ${mode === item ? styles.segActive : ""}`}
            onClick={() => {
              setMode(item);
              setQuery("");
            }}
          >
            {modeCopy[item].label}
          </button>
        ))}
      </div>

      <div className={styles.cats}>
        <button
          className={`chip ${!activeCategory ? "chip-active" : ""}`}
          onClick={() => setCategories((current) => ({ ...current, [mode]: null }))}
        >
          전체
        </button>
        {categoryOptions.map((category) => (
          <button
            key={category.id}
            className={`chip ${activeCategory === category.id ? "chip-active" : ""}`}
            onClick={() => selectCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className={styles.listHead}>
        <span className={styles.subtitle}>{modeCopy[mode].title}</span>
        <span className={styles.count}>{filtered.length}곳</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          조건에 맞는 업체가 없어요.
          <br />
          다른 카테고리나 검색어로 찾아보세요.
        </div>
      ) : (
        <ul className={styles.list}>
          {filtered.map((store) => {
            const marked = bookmarkedSet.has(store.id);

            return (
              <li key={store.id}>
                <Link href={`/store/${store.id}`} className={styles.storeCard}>
                  <div className={styles.cardMain}>
                    <div className={styles.cardTop}>
                      <h3>{store.name}</h3>
                      <button
                        type="button"
                        className={`${styles.bm} ${marked ? styles.bmOn : ""}`}
                        aria-label={marked ? "북마크 해제" : "북마크 추가"}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          toggleBookmark(store.id);
                        }}
                      >
                        <Bookmark size={18} fill={marked ? "currentColor" : "none"} />
                      </button>
                    </div>

                    <div className={styles.badges}>
                      {store.categories.slice(0, 3).map((category) => (
                        <span key={category} className={styles.badge}>
                          {getCategoryLabel(category)}
                        </span>
                      ))}
                    </div>

                    {store.description ? <p className={styles.desc}>{store.description}</p> : null}

                    <div className={styles.metaRow}>
                      <span>
                        <MapPin size={14} /> {store.area}
                      </span>
                      {store.phone ? (
                        <span>
                          <Phone size={14} /> {store.phone}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <ChevronRight size={18} className={styles.chev} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {contributeOpen ? <ContributeModal onClose={() => setContributeOpen(false)} /> : null}
    </main>
  );
}
