import { useCallback, useMemo, useState } from "react";

const LS_KEYS = {
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
  hasSeenQuizPrompt: boolean;
  setHasSeenQuizPrompt: (v: boolean) => void;
  resetOnboarding: () => void;
};

export function useBirthdayOnboarding(): OnboardingState {
  // 처음 렌더 시점에 동기적으로 localStorage에서 읽음
  const [hasSeenQuizPrompt, setHasSeenQuizPromptState] = useState<boolean>(
    () => readLS(LS_KEYS.quizPromptShown) === "1"
  );

  const setHasSeenQuizPrompt = useCallback((v: boolean) => {
    setHasSeenQuizPromptState(v);
    try {
      localStorage.setItem(LS_KEYS.quizPromptShown, v ? "1" : "0");
    } catch { }
  }, []);

  const resetOnboarding = useCallback(() => {
    setHasSeenQuizPromptState(false);
    try {
      localStorage.removeItem(LS_KEYS.quizPromptShown);
    } catch { }
  }, []);

  return useMemo(
    () => ({
      hasSeenQuizPrompt,
      setHasSeenQuizPrompt,
      resetOnboarding,
    }),
    [hasSeenQuizPrompt, setHasSeenQuizPrompt, resetOnboarding]
  );
}
