const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function hasImageUpload() {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}

/** Uploads an image to Cloudinary via an unsigned preset and returns its URL. */
export async function uploadImage(file: File): Promise<string> {
  if (!hasImageUpload()) throw new Error("이미지 업로드 설정이 필요해요.");
  if (!file.type.startsWith("image/")) throw new Error("이미지 파일만 올릴 수 있어요.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("이미지는 10MB 이하만 가능해요.");

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET as string);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("업로드에 실패했어요.");

  const data = (await res.json()) as { secure_url?: string };
  if (!data.secure_url) throw new Error("업로드 응답이 올바르지 않아요.");
  return data.secure_url;
}
