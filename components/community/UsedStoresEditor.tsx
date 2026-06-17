"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { UsedStore } from "@/lib/work";
import styles from "./work.module.css";

type UsedStoresEditorProps = {
  value: UsedStore[];
  onChange: (rows: UsedStore[]) => void;
  suggestions?: string[];
};

export function UsedStoresEditor({ value, onChange, suggestions = [] }: UsedStoresEditorProps) {
  const rows = value.length > 0 ? value : [{ name: "", how: "" }];
  const [focus, setFocus] = useState<number | null>(null);

  const update = (index: number, key: keyof UsedStore, next: string) =>
    onChange(rows.map((row, idx) => (idx === index ? { ...row, [key]: next } : row)));

  const add = () => onChange([...rows, { name: "", how: "" }]);

  const remove = (index: number) =>
    onChange(rows.length <= 1 ? [{ name: "", how: "" }] : rows.filter((_, idx) => idx !== index));

  const matchesFor = (queryText: string) => {
    const q = queryText.trim();
    if (!q) return [];
    return suggestions.filter((name) => name.includes(q) && name !== q).slice(0, 6);
  };

  return (
    <div className={styles.usedEditor}>
      {rows.map((row, index) => {
        const matches = focus === index ? matchesFor(row.name) : [];
        return (
          <div key={index} className={styles.usedItem}>
            <div className={styles.usedItemHead}>
              <div className={styles.suggestWrap}>
                <input
                  className="field"
                  value={row.name}
                  onChange={(event) => update(index, "name", event.target.value)}
                  onFocus={() => setFocus(index)}
                  onBlur={() => setTimeout(() => setFocus((f) => (f === index ? null : f)), 120)}
                  placeholder="업체명 (등록된 업체는 자동 추천)"
                  maxLength={80}
                />
                {matches.length ? (
                  <ul className={styles.suggestList}>
                    {matches.map((name) => (
                      <li key={name}>
                        <button
                          type="button"
                          className={styles.suggestItem}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            update(index, "name", name);
                            setFocus(null);
                          }}
                        >
                          {name}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
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
        );
      })}
      <button type="button" className="btn btn-soft" onClick={add}>
        <Plus size={18} /> 업체 추가
      </button>
    </div>
  );
}
