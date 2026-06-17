"use client";

import Link from "next/link";
import { useState } from "react";
import { Bookmark, ChevronRight, MapPin, Phone } from "lucide-react";
import { getCategoryLabel, type ExploreMode, type Store } from "@/lib/stores";
import { useBookmarks } from "@/lib/use-bookmarks";
import styles from "./BookmarksClient.module.css";

type Filter = "all" | ExploreMode;

export function BookmarksClient({ stores }: { stores: Store[] }) {
  const { bookmarkedSet, toggleBookmark } = useBookmarks();
  const [filter, setFilter] = useState<Filter>("all");

  const saved = stores.filter((store) => bookmarkedSet.has(store.id));
  const shown = filter === "all" ? saved : saved.filter((store) => store.type === filter);

  const counts = {
    all: saved.length,
    service: saved.filter((store) => store.type === "service").length,
    material: saved.filter((store) => store.type === "material").length,
  };
  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "전체" },
    { id: "service", label: "작업" },
    { id: "material", label: "재료" },
  ];

  return (
    <main>
      <header className="appbar">
        <h1>북마크</h1>
      </header>

      {saved.length === 0 ? (
        <div className="empty">
          아직 저장한 업체가 없어요.
          <br />
          탐색에서 마음에 드는 업체를 북마크해보세요.
        </div>
      ) : (
        <>
          <div className={styles.filters}>
            {filters.map((item) => (
              <button
                key={item.id}
                className={`chip ${filter === item.id ? "chip-active" : ""}`}
                onClick={() => setFilter(item.id)}
              >
                {item.label} {counts[item.id]}
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            <div className="empty">이 분류에 저장한 업체가 없어요.</div>
          ) : (
            <ul className={styles.list}>
              {shown.map((store) => (
                <li key={store.id}>
                  <Link href={`/store/${store.id}`} className={styles.card}>
                    <div className={styles.main}>
                      <div className={styles.top}>
                        <h3>{store.name}</h3>
                        <button
                          type="button"
                          className={styles.bm}
                          aria-label="북마크 해제"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            toggleBookmark(store.id);
                          }}
                        >
                          <Bookmark size={18} fill="currentColor" />
                        </button>
                      </div>
                      <div className={styles.badges}>
                        {store.categories.slice(0, 3).map((category) => (
                          <span key={category} className={styles.badge}>
                            {getCategoryLabel(category)}
                          </span>
                        ))}
                      </div>
                      <div className={styles.meta}>
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
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
