"use client";

import Link from "next/link";
import { ArrowLeft, Bookmark, Phone } from "lucide-react";
import { getCategoryLabel, type Store } from "@/lib/stores";
import { useBookmarks } from "@/lib/use-bookmarks";
import styles from "./BookmarksClient.module.css";

type BookmarksClientProps = {
  stores: Store[];
};

export function BookmarksClient({ stores }: BookmarksClientProps) {
  const { bookmarkedIds, toggleBookmark } = useBookmarks();
  const bookmarkedStores = stores.filter((store) => bookmarkedIds.includes(store.id));

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.topbar}>
          <Link className={styles.backLink} href="/">
            <ArrowLeft size={18} />
            홈으로
          </Link>
        </div>

        <section className={styles.panel}>
          <div className={styles.title}>
            <h1>북마크</h1>
            <p>
              나중에 다시 연락하거나 비교해보고 싶은 업체를 여기에 모아둡니다.
            </p>
          </div>

          {bookmarkedStores.length === 0 ? (
            <div className={styles.empty}>
              아직 저장한 업체가 없습니다.
              <br />
              탐색 화면에서 필요한 업체를 북마크에 담아보세요.
            </div>
          ) : (
            <div className={styles.list}>
              {bookmarkedStores.map((store) => (
                <article key={store.id} className={styles.card}>
                  <div className={styles.head}>
                    <div>
                      <h2>{store.name}</h2>
                      <div className={styles.meta}>
                        {store.categories.map((category) => (
                          <span key={category} className={styles.pill}>
                            {getCategoryLabel(category)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      className={styles.bookmarkButton}
                      onClick={() => toggleBookmark(store.id)}
                      aria-label="북마크 해제"
                    >
                      <Bookmark size={18} fill="currentColor" />
                    </button>
                  </div>

                  <div className={styles.copy}>
                    {store.description ? <p>{store.description}</p> : null}
                    {store.memo ? <p>{store.memo}</p> : null}
                    {store.address ? <p>주소 · {store.address}</p> : <p>권역 · {store.area}</p>}
                    {store.phone ? <p>전화 · {store.phone}</p> : null}
                  </div>

                  <div className={styles.actions}>
                    {store.phone ? (
                      <a className={styles.primaryAction} href={`tel:${store.phone.replaceAll(" ", "")}`}>
                        <Phone size={18} />
                        전화하기
                      </a>
                    ) : null}
                    <Link className={styles.secondaryAction} href="/explore">
                      탐색으로 돌아가기
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
