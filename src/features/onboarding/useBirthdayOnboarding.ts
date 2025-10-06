// src/features/onboarding/useBirthdayOnboarding.ts
import { useCallback, useMemo, useState } from "react";

const LS_KEYS = {
  birthday: "bh.birthday.iso",
  quizPromptShown: "bh.quiz.prompt.shown",
} as const;

function readLS(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export type OnboardingState = {
  birthdayISO: string | null; // e.g. "2025-10-06"
  setBirthdayISO: (iso: string | null) => void;
  hasSeenQuizPrompt: boolean;
  setHasSeenQuizPrompt: (v: boolean) => void;
  resetOnboarding: () => void;
};

export function useBirthdayOnboarding(): OnboardingState {
  // 처음 렌더 시점에 동기적으로 localStorage에서 읽음
  const [birthdayISO, setBirthdayISOState] = useState<string | null>(() => readLS(LS_KEYS.birthday));
  const [hasSeenQuizPrompt, setHasSeenQuizPromptState] = useState<boolean>(
    () => readLS(LS_KEYS.quizPromptShown) === "1"
  );

  const setBirthdayISO = useCallback((iso: string | null) => {
    setBirthdayISOState(iso);
    try {
      if (iso) localStorage.setItem(LS_KEYS.birthday, iso);
      else localStorage.removeItem(LS_KEYS.birthday);
    } catch {}
  }, []);

  const setHasSeenQuizPrompt = useCallback((v: boolean) => {
    setHasSeenQuizPromptState(v);
    try {
      localStorage.setItem(LS_KEYS.quizPromptShown, v ? "1" : "0");
    } catch {}
  }, []);

  const resetOnboarding = useCallback(() => {
    setBirthdayISOState(null);
    setHasSeenQuizPromptState(false);
    try {
      localStorage.removeItem(LS_KEYS.birthday);
      localStorage.removeItem(LS_KEYS.quizPromptShown);
    } catch {}
  }, []);

  return useMemo(
    () => ({ birthdayISO, setBirthdayISO, hasSeenQuizPrompt, setHasSeenQuizPrompt, resetOnboarding }),
    [birthdayISO, setBirthdayISO, hasSeenQuizPrompt, setHasSeenQuizPrompt, resetOnboarding]
  );
}
