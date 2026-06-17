/**
 * Everytime-style anonymous labels. Within a thread the original poster is
 * "글쓴이", and other participants become 익명1, 익명2 … in order of appearance.
 * Pass uids in chronological order; opUid marks the original poster (optional).
 */
export function buildAnonLabels(uidsInOrder: string[], opUid?: string): Map<string, string> {
  const map = new Map<string, string>();
  let n = 0;
  for (const uid of uidsInOrder) {
    if (!uid || map.has(uid)) continue;
    if (opUid && uid === opUid) {
      map.set(uid, "글쓴이");
      continue;
    }
    n += 1;
    map.set(uid, `익명${n}`);
  }
  return map;
}
