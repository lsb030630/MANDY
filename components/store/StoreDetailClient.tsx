"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bookmark, MapPin, MessageSquarePlus, Phone, Send, Trash2 } from "lucide-react";
import { ContributeModal } from "@/components/community/ContributeModal";
import { DemoBanner } from "@/components/community/DemoBanner";
import { buildAnonLabels } from "@/lib/anon";
import { useAuthUid } from "@/lib/auth";
import { DEMO_UID } from "@/lib/demo";
import { hasFirebaseConfig } from "@/lib/firebase";
import { formatRelative } from "@/lib/format";
import {
  addStoreReview,
  deleteStoreReview,
  subscribeStoreReviews,
  type StoreReview,
} from "@/lib/reviews";
import { getCategoryLabel, type Store } from "@/lib/stores";
import { useBookmarks } from "@/lib/use-bookmarks";
import styles from "./StoreDetailClient.module.css";

export function StoreDetailClient({ store }: { store: Store }) {
  const { bookmarkedSet, toggleBookmark } = useBookmarks();
  const { uid } = useAuthUid();
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [contributeOpen, setContributeOpen] = useState(false);

  const marked = bookmarkedSet.has(store.id);
  const configured = hasFirebaseConfig();
  const demo = !configured;
  const authorUid = configured ? uid : DEMO_UID;

  const reviewLabels = useMemo(() => {
    const chronological = [...reviews].sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
    return buildAnonLabels(chronological.map((review) => review.authorUid));
  }, [reviews]);

  useEffect(() => subscribeStoreReviews(store.id, setReviews), [store.id]);

  const mapQuery = encodeURIComponent(store.address || `서울 ${store.area}`);
  const mapSrc = `https://maps.google.com/maps?q=${mapQuery}&z=16&hl=ko&output=embed`;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!body.trim()) return;
    if (configured && !uid) {
      setError("연결 중이에요. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await addStoreReview({
        storeId: store.id,
        body: body.trim(),
        nickname: "",
        authorUid: authorUid ?? DEMO_UID,
      });
      setBody("");
    } catch {
      setError("저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <header className="appbar">
        <Link href="/" className="iconbtn" aria-label="뒤로">
          <ArrowLeft size={20} />
        </Link>
        <h1>업체 정보</h1>
        <span className="spacer" />
        <button
          className={`iconbtn ${marked ? styles.bmOn : ""}`}
          onClick={() => toggleBookmark(store.id)}
          aria-label={marked ? "북마크 해제" : "북마크 추가"}
        >
          <Bookmark size={20} fill={marked ? "currentColor" : "none"} />
        </button>
      </header>

      <section className={styles.head}>
        <h2 className={styles.name}>{store.name}</h2>
        <div className={styles.badges}>
          {store.categories.map((category) => (
            <span key={category} className={styles.badge}>
              {getCategoryLabel(category)}
            </span>
          ))}
        </div>
        {store.description ? <p className={styles.desc}>{store.description}</p> : null}
      </section>

      <section className={styles.mapWrap}>
        <iframe
          className={styles.map}
          src={mapSrc}
          title={`${store.name} 위치`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className={styles.locText}>
          <MapPin size={15} />
          {store.address || store.area}
        </div>
      </section>

      <section className={styles.actions}>
        {store.phone ? (
          <a className="btn btn-primary btn-block" href={`tel:${store.phone.replaceAll(" ", "")}`}>
            <Phone size={18} />
            전화하기 · {store.phone}
          </a>
        ) : null}
        <button className="btn btn-ghost btn-block" onClick={() => setContributeOpen(true)}>
          <MessageSquarePlus size={18} />
          정보 제보
        </button>
      </section>

      {store.orderGuide || store.fileGuide || store.memo || store.tags.length || store.verifiedAt ? (
        <section className={styles.info}>
          {store.orderGuide ? <InfoRow label="의뢰 방법" value={store.orderGuide} /> : null}
          {store.fileGuide ? <InfoRow label="파일·준비물" value={store.fileGuide} /> : null}
          {store.memo ? <InfoRow label="메모" value={store.memo} /> : null}
          {store.tags.length ? (
            <div className={styles.tags}>
              {store.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
          {store.verifiedAt ? <p className={styles.verified}>확인일 · {store.verifiedAt}</p> : null}
        </section>
      ) : null}

      {demo ? <DemoBanner /> : null}

      <section className={styles.reviews}>
        <h3 className={styles.secTitle}>
          간단 후기 <span>{reviews.length}</span>
        </h3>

        <form className={styles.composer} onSubmit={handleSubmit}>
          <div className={styles.composerRow}>
            <input
              className="field"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="이 업체 써본 짧은 후기"
              maxLength={500}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !body.trim()}
              aria-label="후기 등록"
            >
              <Send size={18} />
            </button>
          </div>
          {error ? <p className={styles.err}>{error}</p> : null}
        </form>

        <ul className={styles.reviewList}>
          {reviews.length === 0 ? (
            <li className="empty">아직 후기가 없어요. 첫 후기를 남겨보세요.</li>
          ) : (
            reviews.map((review) => (
              <li key={review.id} className={styles.review}>
                <div className={styles.reviewTop}>
                  <span className={styles.reviewName}>{reviewLabels.get(review.authorUid) ?? "익명"}</span>
                  <span className={styles.reviewTime}>{formatRelative(review.createdAt)}</span>
                </div>
                <p className={styles.reviewBody}>{review.body}</p>
                {review.authorUid === authorUid ? (
                  <button className={styles.del} onClick={() => deleteStoreReview(review.id)}>
                    <Trash2 size={14} /> 삭제
                  </button>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </section>

      {contributeOpen ? (
        <ContributeModal store={store} onClose={() => setContributeOpen(false)} />
      ) : null}
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowValue}>{value}</span>
    </div>
  );
}
