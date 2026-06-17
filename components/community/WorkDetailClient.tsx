"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Lock, Send, Trash2 } from "lucide-react";
import { CreditBadge } from "./CreditBadge";
import { DemoBanner } from "./DemoBanner";
import { buildAnonLabels } from "@/lib/anon";
import { useAuthUid } from "@/lib/auth";
import { unlockItem } from "@/lib/credits";
import { DEMO_UID } from "@/lib/demo";
import { hasFirebaseConfig } from "@/lib/firebase";
import { formatRelative } from "@/lib/format";
import { getVisibleStoreByName } from "@/lib/stores";
import {
  addComment,
  deleteComment,
  deleteWork,
  getWorkDetail,
  subscribeComments,
  subscribeWorkCard,
  workMeta,
  type WorkCard,
  type WorkComment,
  type WorkDetail,
  type WorkKind,
} from "@/lib/work";
import styles from "./work.module.css";

export function WorkDetailClient({ kind, id }: { kind: WorkKind; id: string }) {
  const meta = workMeta[kind];
  const router = useRouter();
  const { uid } = useAuthUid();
  const configured = hasFirebaseConfig();
  const demo = !configured;
  const authorUid = configured ? uid : DEMO_UID;

  const [card, setCard] = useState<WorkCard | null | undefined>(undefined);
  const [detail, setDetail] = useState<WorkDetail | "locked" | null | undefined>(undefined);
  const [comments, setComments] = useState<WorkComment[]>([]);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockMsg, setUnlockMsg] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [commentError, setCommentError] = useState("");
  const [posting, setPosting] = useState(false);

  const missingText = kind === "board" ? "삭제되었거나 없는 글이에요." : "삭제되었거나 없는 후기예요.";
  const commentPlaceholder = kind === "board" ? "답변 달기" : "댓글 달기";
  const commentHint = kind === "board" ? "답변을 달면 크레딧 1을 받아요." : "";

  const commentLabels = useMemo(
    () => buildAnonLabels(comments.map((comment) => comment.authorUid), card?.authorUid),
    [comments, card?.authorUid],
  );

  useEffect(() => subscribeWorkCard(kind, id, setCard), [kind, id]);
  useEffect(() => subscribeComments(kind, id, setComments), [kind, id]);

  useEffect(() => {
    if (configured && !uid) return;
    let active = true;
    setDetail(undefined);
    getWorkDetail(kind, id).then((result) => {
      if (active) setDetail(result);
    });
    return () => {
      active = false;
    };
  }, [kind, id, uid, configured]);

  const handleUnlock = async () => {
    if (!uid) return;
    setUnlocking(true);
    setUnlockMsg("");
    const result = await unlockItem(uid, id);
    if (result === "insufficient") {
      setUnlockMsg("크레딧이 부족해요. 게시판 답변은 +1, 후기 작성은 +3 크레딧이에요.");
      setUnlocking(false);
      return;
    }
    const next = await getWorkDetail(kind, id);
    setDetail(next);
    setUnlocking(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(kind === "board" ? "이 글을 삭제할까요?" : "이 후기를 삭제할까요?")) return;
    await deleteWork(kind, id);
    router.replace(meta.base);
  };

  const handleComment = async (event: FormEvent) => {
    event.preventDefault();
    if (!commentBody.trim()) return;
    if (configured && !uid) {
      setCommentError("연결 중이에요. 잠시 후 다시 시도해 주세요.");
      return;
    }
    setPosting(true);
    setCommentError("");
    try {
      await addComment(kind, id, {
        body: commentBody.trim(),
        nickname: "",
        authorUid: authorUid ?? DEMO_UID,
      });
      setCommentBody("");
    } catch {
      setCommentError("댓글 저장에 실패했어요.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <main>
      <header className="appbar">
        <Link href={meta.base} className="iconbtn" aria-label="뒤로">
          <ArrowLeft size={20} />
        </Link>
        <h1>{meta.title}</h1>
        <span className="spacer" />
        <CreditBadge />
      </header>

      {demo ? <DemoBanner /> : null}

      {card === undefined ? (
        <div className="empty">불러오는 중…</div>
      ) : card === null ? (
        <div className="empty">{missingText}</div>
      ) : detail === "locked" ? (
        <div className={styles.lockWrap}>
          <div className={styles.lockCard}>
            {card.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.lockCover} src={card.coverUrl} alt="" />
            ) : (
              <div className={styles.lockCoverEmpty} />
            )}
            <div className={styles.lockInner}>
              <div className={styles.lockIcon}>
                <Lock size={22} />
              </div>
              <h2 className={styles.lockTitle}>{card.title}</h2>
              <p className={styles.lockMeta}>
                익명 · 사진 {card.imageCount} · 업체 {card.usedStoreCount}
              </p>
              <p className={styles.lockMsg}>이 후기를 보려면 크레딧 1이 필요해요.</p>
              <div className={styles.lockActions}>
                <button
                  className="btn btn-primary btn-block"
                  onClick={handleUnlock}
                  disabled={unlocking}
                >
                  {unlocking ? "여는 중" : "크레딧 1 사용해서 보기"}
                </button>
              </div>
              {unlockMsg ? <p className={styles.err}>{unlockMsg}</p> : null}
              <p className={styles.lockHint}>게시판 답변 +1 · 후기 작성 +3</p>
            </div>
          </div>
        </div>
      ) : detail === undefined ? (
        <div className="empty">불러오는 중…</div>
      ) : detail === null ? (
        <div className="empty">내용을 찾을 수 없어요.</div>
      ) : (
        <>
          <article className={styles.detail}>
            <h2 className={styles.title}>{card.title}</h2>
            <div className={styles.meta}>
              <span className={styles.metaName}>익명</span>
              <span>·</span>
              <span>{formatRelative(card.createdAt)}</span>
            </div>
          </article>

          {detail.imageUrls.length ? (
            <div className={styles.gallery}>
              {detail.imageUrls.map((url, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url}
                  className={styles.galleryImg}
                  src={url}
                  alt={`${card.title} ${index + 1}`}
                />
              ))}
            </div>
          ) : null}

          {detail.body ? <p className={styles.body}>{detail.body}</p> : null}

          {detail.usedStores.length ? (
            <section className={styles.usedSection}>
              <h3 className={styles.usedTitle}>사용한 업체</h3>
              {detail.usedStores.map((store, index) => {
                const linkedStore = getVisibleStoreByName(store.name);
                const content = (
                  <>
                    <div className={styles.usedStoreName}>{store.name}</div>
                    {store.how ? <p className={styles.usedStoreHow}>{store.how}</p> : null}
                    {linkedStore ? <p className={styles.usedStoreHint}>업체 정보 보기</p> : null}
                  </>
                );

                return linkedStore ? (
                  <Link
                    key={`${store.name}-${index}`}
                    href={`/store/${linkedStore.id}`}
                    className={`${styles.usedStore} ${styles.usedStoreLink}`}
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={`${store.name}-${index}`} className={styles.usedStore}>
                    {content}
                  </div>
                );
              })}
            </section>
          ) : null}

          {authorUid && card.authorUid === authorUid ? (
            <button className={styles.delete} onClick={handleDelete}>
              <Trash2 size={15} /> 삭제
            </button>
          ) : null}

          <section className={styles.commentSec}>
            <h3 className={styles.commentTitle}>댓글 {comments.length}</h3>
            {commentHint ? <p className={styles.commentHint}>{commentHint}</p> : null}
            <form className={styles.composer} onSubmit={handleComment}>
              <div className={styles.composerRow}>
                <input
                  className="field"
                  value={commentBody}
                  onChange={(event) => setCommentBody(event.target.value)}
                  placeholder={commentPlaceholder}
                  maxLength={1000}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={posting || !commentBody.trim()}
                  aria-label="댓글 등록"
                >
                  <Send size={18} />
                </button>
              </div>
              {commentError ? <p className={styles.err}>{commentError}</p> : null}
            </form>

            <ul className={styles.commentList}>
              {comments.length === 0 ? (
                <li className="empty">첫 댓글을 남겨보세요.</li>
              ) : (
                comments.map((comment) => (
                  <li key={comment.id} className={styles.comment}>
                    <div className={styles.commentTop}>
                      <span className={styles.commentName}>
                        {commentLabels.get(comment.authorUid) ?? "익명"}
                      </span>
                      <span className={styles.commentTime}>{formatRelative(comment.createdAt)}</span>
                    </div>
                    <p className={styles.commentBody}>{comment.body}</p>
                    {authorUid && comment.authorUid === authorUid ? (
                      <button
                        className={styles.commentDel}
                        onClick={() => deleteComment(kind, id, comment.id)}
                      >
                        <Trash2 size={13} /> 삭제
                      </button>
                    ) : null}
                  </li>
                ))
              )}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
