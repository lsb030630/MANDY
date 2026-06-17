"use client";

import { useEffect, useState } from "react";
import { useAuthUid } from "./auth";
import { ensureUser, subscribeCredits } from "./credits";
import { hasFirebaseConfig } from "./firebase";

export function useCredits() {
  const { uid } = useAuthUid();
  const [credits, setCredits] = useState<number | null>(null);
  const enabled = hasFirebaseConfig();

  useEffect(() => {
    if (!uid) return;
    ensureUser(uid);
    return subscribeCredits(uid, setCredits);
  }, [uid]);

  return { uid, credits, enabled };
}
