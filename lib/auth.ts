"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getFirebaseAuth, hasFirebaseConfig } from "./firebase";

/**
 * Ensures an anonymous Firebase session so community writes can be attributed
 * to a stable per-device uid. Degrades gracefully when Firebase isn't configured.
 */
export function useAuthUid() {
  const [uid, setUid] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        setReady(true);
      } else {
        signInAnonymously(auth).catch(() => {
          setReady(true);
        });
      }
    });

    return unsubscribe;
  }, []);

  return { uid, ready, enabled: hasFirebaseConfig() };
}
