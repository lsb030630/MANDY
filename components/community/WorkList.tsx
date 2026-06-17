"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Hammer, Images, MessageSquare, PenLine, Store } from "lucide-react";
import { CreditBadge } from "./CreditBadge";
import { DemoBanner } from "./DemoBanner";
import { hasFirebaseConfig } from "@/lib/firebase";
import { formatRelative } from "@/lib/format";
import { subscribeWorks, workMeta, type WorkCard, type WorkKind } from "@/lib/work";
import styles from "./work.module.css";

export function WorkList({ kind }: { kind: WorkKind }) {
  const meta = workMeta[kind];
  const [items, setItems] = useState<WorkCard[]>([]);
  const [loading, setLoading] = useState(true);
  const demo = !hasFirebaseConfig();

  useEffect(() => {
    const unsubscribe = subscribeWorks(kind, (rows) => {
      setItems(rows);
      setLoading(false);
    });
    return unsubscribe;
  }, [kind]);

  return (
    <main>
      <header className="appbar">
        <h1>{meta.title}</h1>
        <span className="spacer" />
        <CreditBadge />
      </header>

      {demo ? (
        <DemoBanner />
      ) : (
        <p className={styles.hintBar}>후기 1개 올리면 +3 크레딧 · 상세 열람 −1</p>
      )}

      {loading ? (
        <div className="empty">불러오는 중…</div>
      ) : items.length === 0 ? (
        <div className="empty">
          아직 후기가 없어요.
          <br />
          {meta.emptyHint}
        </div>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id}>
              <Link href={`${meta.base}/${item.id}`} className={styles.card}>
                {item.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className={styles.cover} src={item.coverUrl} alt={item.title} loading="lazy" />
                ) : (
                  <div className={styles.coverPlaceholder}>
                    <Hammer size={28} />
                  </div>
                )}
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <div className={styles.cardMeta}>
                    <span className={styles.metaName}>{item.nickname}</span>
                    <span>·</span>
                    <span>{formatRelative(item.createdAt)}</span>
                  </div>
                  <div className={styles.cardStats}>
                    {item.imageCount ? (
                      <span className={styles.stat}>
                        <Images size={14} /> {item.imageCount}
                      </span>
                    ) : null}
                    {item.usedStoreCount ? (
                      <span className={styles.stat}>
                        <Store size={14} /> 업체 {item.usedStoreCount}
                      </span>
                    ) : null}
                    <span className={styles.stat}>
                      <MessageSquare size={14} /> {item.commentCount}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link href={`${meta.base}/new`} className={styles.fab} aria-label={meta.cta}>
        <PenLine size={22} />
      </Link>
    </main>
  );
}
