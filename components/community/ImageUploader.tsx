"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadImage } from "@/lib/storage";
import styles from "./work.module.css";

type ImageUploaderProps = {
  uid: string | null;
  value: string[];
  onChange: (urls: string[]) => void;
};

export function ImageUploader({ uid, value, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!uid) {
      setError("Firebase 연결 후 이미지를 올릴 수 있어요.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        uploaded.push(await uploadImage(uid, file));
      }
      onChange([...value, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드에 실패했어요.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className={styles.thumbs}>
        {value.map((url, index) => (
          <div key={url} className={styles.thumb}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`업로드 이미지 ${index + 1}`} />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, idx) => idx !== index))}
              aria-label="이미지 삭제"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          className={styles.addThumb}
          onClick={() => inputRef.current?.click()}
          disabled={uploading || !uid}
        >
          {uploading ? <Loader2 size={20} className={styles.spin} /> : <ImagePlus size={20} />}
          <span>{uploading ? "올리는 중" : "사진"}</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => handleFiles(event.target.files)}
      />
      {error ? <p className={styles.err}>{error}</p> : null}
    </div>
  );
}
