import {
  doc,
  increment,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

export const SIGNUP_CREDITS = 3;
export const SHOWCASE_REWARD = 3;
export const BOARD_COMMENT_REWARD = 1;
export const VIEW_COST = 1;

/** Creates the user's wallet with the signup bonus on first use (atomic). */
export async function ensureUser(uid: string) {
  const db = getFirebaseDb();
  if (!db) return;
  const userRef = doc(db, "users", uid);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(userRef);
    if (!snap.exists()) {
      tx.set(userRef, { credits: SIGNUP_CREDITS, createdAt: serverTimestamp() });
    }
  });
}

export function subscribeCredits(uid: string, onChange: (credits: number | null) => void) {
  const db = getFirebaseDb();
  if (!db) {
    onChange(null);
    return () => {};
  }
  return onSnapshot(
    doc(db, "users", uid),
    (snap) => onChange(snap.exists() ? (snap.data().credits ?? 0) : null),
    () => onChange(null),
  );
}

/** Adds credits, seeding the signup bonus if the wallet doesn't exist yet. */
export async function awardCredits(uid: string, amount = SHOWCASE_REWARD) {
  const db = getFirebaseDb();
  if (!db) return;
  const userRef = doc(db, "users", uid);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(userRef);
    if (snap.exists()) {
      tx.update(userRef, { credits: increment(amount) });
    } else {
      tx.set(userRef, { credits: SIGNUP_CREDITS + amount, createdAt: serverTimestamp() });
    }
  });
}

/** Atomically spends one credit to permanently unlock an item for this user. */
export async function unlockItem(uid: string, itemId: string): Promise<"ok" | "insufficient"> {
  const db = getFirebaseDb();
  if (!db) return "ok";

  return runTransaction(db, async (tx) => {
    const userRef = doc(db, "users", uid);
    const unlockRef = doc(db, "users", uid, "unlocks", itemId);

    const unlockSnap = await tx.get(unlockRef);
    if (unlockSnap.exists()) return "ok";

    const userSnap = await tx.get(userRef);
    const credits = userSnap.exists() ? (userSnap.data().credits ?? 0) : 0;
    if (credits < VIEW_COST) return "insufficient";

    tx.set(unlockRef, { createdAt: serverTimestamp() });
    tx.update(userRef, { credits: increment(-VIEW_COST) });
    return "ok";
  });
}
