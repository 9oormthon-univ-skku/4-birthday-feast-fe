// src/features/onboarding/visitor/useVisitorOnboarding.ts
import { useCallback, useEffect, useState } from "react";

const NICKNAME_KEY = "bh.visitor.nickname";
const PLAY_PROMPT_SEEN_KEY = "bh.visitor.hasSeenPlayPrompt";

export function getStoredNickname(): string | null {
  try {
    return localStorage.getItem(NICKNAME_KEY);
  } catch {
    return null;
  }
}

export function setStoredNickname(nickname: string) {
  try {
    localStorage.setItem(NICKNAME_KEY, nickname.trim());
  } catch {}
}

export function useVisitorOnboarding() {
  const [nickname, setNickname] = useState<string | null>(null);
  const [hasSeenPlayPrompt, setHasSeenPlayPrompt] = useState<boolean>(false);

  useEffect(() => {
    setNickname(getStoredNickname());
    try {
      setHasSeenPlayPrompt(localStorage.getItem(PLAY_PROMPT_SEEN_KEY) === "1");
    } catch {}
  }, []);

  const markPlayPromptSeen = useCallback(() => {
    setHasSeenPlayPrompt(true);
    try {
      localStorage.setItem(PLAY_PROMPT_SEEN_KEY, "1");
    } catch {}
  }, []);

  return {
    nickname,
    setStoredNickname, // 외부에서 닉네임 저장 시 사용
    hasSeenPlayPrompt,
    markPlayPromptSeen,
  };
}
