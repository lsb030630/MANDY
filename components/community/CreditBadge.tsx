"use client";

import { useEffect, useRef, useState } from "react";
import { Coins } from "lucide-react";
import { useCredits } from "@/lib/use-credits";
import styles from "./work.module.css";

export function CreditBadge() {
  const { credits, enabled } = useCredits();
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prev = useRef<number | null>(null);

  const show = () => {
    setOpen(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 7000);
  };

  // Pop the bubble briefly whenever credits increase (e.g. after posting).
  useEffect(() => {
    if (credits == null) return;
    if (prev.current != null && credits > prev.current) show();
    prev.current = credits;
  }, [credits]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  if (!enabled) return null;

  return (
    <div className={styles.creditWrap}>
      <button
        type="button"
        className={styles.creditBadge}
        aria-label="크레딧 정보"
        onClick={() => (open ? setOpen(false) : show())}
      >
        <Coins size={15} />
        {credits ?? "–"}
      </button>
      <div className={`${styles.creditPop} ${open ? styles.creditPopOpen : ""}`} role="status">
        <strong>크레딧 {credits ?? 0}개</strong>
        <span>제작후기 올리면 +3</span>
        <span>게시판 답변 +1</span>
        <span>후기 열람 −1</span>
        <span>가입 시 3개 무료</span>
      </div>
    </div>
  );
}
