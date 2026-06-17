"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "mandi:nickname";

export function useNickname() {
  const [nickname, setNicknameState] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setNicknameState(window.localStorage.getItem(STORAGE_KEY) ?? "");
    setLoaded(true);
  }, []);

  const setNickname = useCallback((value: string) => {
    const trimmed = value.trim().slice(0, 20);
    setNicknameState(trimmed);
    window.localStorage.setItem(STORAGE_KEY, trimmed);
  }, []);

  return { nickname, setNickname, loaded };
}
