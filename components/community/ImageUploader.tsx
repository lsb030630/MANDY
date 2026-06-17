"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { hasImageUpload, uploadImage } from "@/lib/storage";
import styles from "./work.module.css";

type ImageUploaderProps = {
  value: string[];
  onChange: (urls: string[]) => void;
};

export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const enabled = hasImageUpload();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!enabled) {
      setError("이미지 업로드 설정(Cloudinary)이 필요해요.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        uploaded.push(await uploadImage(file));
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
          disabled={uploading || !enabled}
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
      {!enabled ? (
        <p className="hint" style={{ marginTop: 8 }}>
          이미지 업로드는 Cloudinary 설정 후 켜져요.
        </p>
      ) : null}
      {error ? <p className={styles.err}>{error}</p> : null}
    </div>
  );
}
