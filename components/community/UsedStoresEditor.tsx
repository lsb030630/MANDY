"use client";

import { Plus, X } from "lucide-react";
import type { UsedStore } from "@/lib/work";
import styles from "./work.module.css";

type UsedStoresEditorProps = {
  value: UsedStore[];
  onChange: (rows: UsedStore[]) => void;
};

export function UsedStoresEditor({ value, onChange }: UsedStoresEditorProps) {
  const rows = value.length > 0 ? value : [{ name: "", how: "" }];

  const update = (index: number, key: keyof UsedStore, next: string) =>
    onChange(rows.map((row, idx) => (idx === index ? { ...row, [key]: next } : row)));

  const add = () => onChange([...rows, { name: "", how: "" }]);

  const remove = (index: number) =>
    onChange(rows.length <= 1 ? [{ name: "", how: "" }] : rows.filter((_, idx) => idx !== index));

  return (
    <div className={styles.usedEditor}>
      {rows.map((row, index) => (
        <div key={index} className={styles.usedItem}>
          <div className={styles.usedItemHead}>
            <input
              className="field"
              value={row.name}
              onChange={(event) => update(index, "name", event.target.value)}
              placeholder="업체명"
              maxLength={80}
            />
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => remove(index)}
              aria-label="업체 삭제"
            >
              <X size={18} />
            </button>
          </div>
          <input
            className="field"
            value={row.how}
            onChange={(event) => update(index, "how", event.target.value)}
            placeholder="어떻게 사용했는지 (예: 황동판 절곡)"
            maxLength={200}
          />
        </div>
      ))}
      <button type="button" className="btn btn-soft" onClick={add}>
        <Plus size={18} /> 업체 추가
      </button>
    </div>
  );
}
