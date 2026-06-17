import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getFirebaseStorage } from "./firebase";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function uploadImage(uid: string, file: File): Promise<string> {
  const storage = getFirebaseStorage();
  if (!storage) throw new Error("Storage 설정이 필요합니다.");
  if (!file.type.startsWith("image/")) throw new Error("이미지 파일만 올릴 수 있어요.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("이미지는 5MB 이하만 가능해요.");

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const path = `uploads/${uid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
