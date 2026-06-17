"use client";

import { type FormEvent, useState } from "react";
import { X } from "lucide-react";
import { submitContribution } from "@/lib/contributions";
import { hasFirebaseConfig } from "@/lib/firebase";
import type { Store } from "@/lib/stores";
import styles from "./ContributeModal.module.css";

type ContributeModalProps = {
  store?: Store;
  onClose: () => void;
};

export function ContributeModal({ store, onClose }: ContributeModalProps) {
  const [form, setForm] = useState({
    storeName: store?.name ?? "",
    contact: "",
    fileGuide: "",
    orderGuide: "",
    review: "",
  });
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!hasFirebaseConfig()) {
      setStatus("error");
      setMessage("Firebase 설정을 넣으면 제보가 데이터베이스에 저장됩니다.");
      return;
    }

    setStatus("saving");
    setMessage("");
    try {
      await submitContribution({ ...form, storeId: store?.id });
      onClose();
    } catch {
      setStatus("error");
      setMessage("저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label="업체 정보 제보"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.handle} aria-hidden="true" />
        <div className={styles.header}>
          <div>
            <h2>정보 제보</h2>
            <p className="hint">의뢰 방법·준비물·후기처럼 다음 사람이 바로 쓸 내용을 남겨주세요.</p>
          </div>
          <button className="iconbtn" onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div>
            <label className="label">업체명</label>
            <input
              className="field"
              value={form.storeName}
              onChange={(event) => update("storeName", event.target.value)}
              placeholder="업체명"
              required
            />
          </div>
          <div>
            <label className="label">연락처 / 카톡 / 링크</label>
            <input
              className="field"
              value={form.contact}
              onChange={(event) => update("contact", event.target.value)}
              placeholder="확인한 연락처가 있으면"
            />
          </div>
          <div>
            <label className="label">파일 형식 / 준비물</label>
            <textarea
              className="field"
              value={form.fileGuide}
              onChange={(event) => update("fileGuide", event.target.value)}
              placeholder="예: AI 파일 선호, 도면 필요"
            />
          </div>
          <div>
            <label className="label">의뢰 방법</label>
            <textarea
              className="field"
              value={form.orderGuide}
              onChange={(event) => update("orderGuide", event.target.value)}
              placeholder="예: 전화 후 방문, 현금 결제"
            />
          </div>
          <div>
            <label className="label">사용 후기 / 꿀팁</label>
            <textarea
              className="field"
              value={form.review}
              onChange={(event) => update("review", event.target.value)}
              placeholder="주의할 점이나 팁"
            />
          </div>

          {message ? <p className={styles.message}>{message}</p> : null}

          <div className={styles.actions}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary" disabled={status === "saving"}>
              {status === "saving" ? "저장 중" : "제보 보내기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
