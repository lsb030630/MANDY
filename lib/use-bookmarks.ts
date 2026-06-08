"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "mandi:bookmarks";

export function useBookmarks() {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  const toggleBookmark = useCallback((storeId: string) => {
    setBookmarkedIds((current) =>
      current.includes(storeId)
        ? current.filter((id) => id !== storeId)
        : [...current, storeId],
    );
  }, []);

  const bookmarkedSet = useMemo(() => new Set(bookmarkedIds), [bookmarkedIds]);

  return {
    bookmarkedIds,
    bookmarkedSet,
    toggleBookmark,
  };
}
