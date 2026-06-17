"use client";

import { Coins } from "lucide-react";
import { useCredits } from "@/lib/use-credits";
import styles from "./work.module.css";

export function CreditBadge() {
  const { credits, enabled } = useCredits();
  if (!enabled) return null;

  return (
    <span className={styles.creditBadge} aria-label={`보유 크레딧 ${credits ?? 0}`}>
      <Coins size={15} />
      {credits ?? "–"}
    </span>
  );
}
