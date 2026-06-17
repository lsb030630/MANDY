"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { DemoBanner } from "./DemoBanner";
import { ImageUploader } from "./ImageUploader";
import { UsedStoresEditor } from "./UsedStoresEditor";
import { useAuthUid } from "@/lib/auth";
import { DEMO_UID } from "@/lib/demo";
import { hasFirebaseConfig } from "@/lib/firebase";
import { useNickname } from "@/lib/use-nickname";
import { addWork, workMeta, type UsedStore, type WorkKind } from "@/lib/work";
import styles from "./work.module.css";

export function WorkComposer({ kind }: { kind: WorkKind }) {
  const meta = workMeta[kind];
  const router = useRouter();
  const { uid } = useAuthUid();
  const { nickname, setNickname } = useNickname();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [used, setUsed] = useState<UsedStore[]>([{ name: "", how: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const configured = hasFirebaseConfig();
  const demo = !configured;
  const authorUid = configured ? uid : DEMO_UID;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!nickname.trim()) {
      setError("닉네임을 입력해 주세요.");
      return;
    }
    if (!title.trim()) {
      setError("제목을 입력해 주세요.");
      return;
    }
    if (configured && !uid) {
      setError("연결 중이에요. 잠시 후 다시 시도해 주세요.");
      return;
    }

    const usedStores = used
      .map((row) => ({ name: row.name.trim(), how: row.how.trim() }))
      .filter((row) => row.name);

    setSubmitting(true);
    setError("");
    try {
      const ref = await addWork(kind, {
        title: title.trim(),
        body: body.trim(),
        imageUrls: images,
        usedStores,
        nickname: nickname.trim(),
        authorUid: authorUid ?? DEMO_UID,
      });
      router.replace(`${meta.base}/${ref.id}`);
    } catch {
      setError("저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
      setSubmitting(false);
    }
  };

  return (
    <main>
      <header className="appbar">
        <Link href={meta.base} className="iconbtn" aria-label="뒤로">
          <ArrowLeft size={20} />
        </Link>
        <h1>{meta.cta}</h1>
      </header>

      {demo ? <DemoBanner /> : null}

      <form className={styles.compose} onSubmit={handleSubmit}>
        <div>
          <label className="label">닉네임</label>
          <input
            className="field"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            placeholder="닉네임"
            maxLength={20}
          />
        </div>
        <div>
          <label className="label">제목</label>
          <input
            className="field"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="예: 황동 무드등 제작 후기"
            maxLength={200}
          />
        </div>
        <div>
          <label className="label">작업 사진 · 도안</label>
          <ImageUploader value={images} onChange={setImages} />
        </div>
        <div>
          <label className="label">작업 설명</label>
          <textarea
            className={`field ${styles.bodyArea}`}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="어떤 작업인지, 과정과 팁을 적어주세요"
            maxLength={5000}
          />
        </div>
        <div>
          <label className="label">사용한 업체</label>
          <UsedStoresEditor value={used} onChange={setUsed} />
        </div>

        {error ? <p className={styles.err}>{error}</p> : null}

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "올리는 중" : demo ? "올리기" : "올리고 +3 크레딧 받기"}
        </button>
      </form>
    </main>
  );
}
