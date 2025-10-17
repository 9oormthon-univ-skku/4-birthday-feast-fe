// src/features/onboarding/OnboardingGate.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BirthdaySetupModal from "./BirthdaySetupModal";
import QuizPromptModal from "./QuizPromptModal";
import { useBirthdayOnboarding } from "./useBirthdayOnboarding";
import { useAuth } from "@/features/auth/useAuth";
import WelcomeModal from "@/features/home/WelcomeModal";
import { useFeastThisYear } from "@/features/feast/useFeastThisYear";
import { useMe } from "../user/useMe";

const LS_HOST_WELCOME_SHOWN = "bh.host.welcomeShownDate";

export default function OnboardingGate(): React.ReactElement | null {
  const nav = useNavigate();
  const loc = useLocation();
  const { isAuthenticated } = useAuth();

  const {
    birthdayISO,
    setBirthdayISO,
    hasSeenQuizPrompt,
    setHasSeenQuizPrompt,
  } = useBirthdayOnboarding();

  // B안: /u/:userId/main 에서만 온보딩 동작
  const isOnMain = useMemo(
    () => /^\/u\/[^/]+\/main$/.test((loc.pathname || "/").replace(/\/+$/, "") || "/"),
    [loc.pathname]
  );

  // 훅은 항상 같은 순서/개수로 호출
  const [showBirthday, setShowBirthday] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const { me, loading: loadingUser } = useMe();
  const { creating, loading, ensureThisYearCreated, preloadThisYearQuietly } = useFeastThisYear();

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    setShowBirthday(birthdayISO == null);
    if (birthdayISO != null) setShowQuiz(false);
  }, [birthdayISO]);

  useEffect(() => {
    if (!isOnMain) return;
    const lastShown = localStorage.getItem(LS_HOST_WELCOME_SHOWN);

    if (birthdayISO && !showBirthday && lastShown !== today) {
      setShowWelcome(true);
      setShowQuiz(false);
      return;
    }
    if (birthdayISO && !showBirthday && !showWelcome && !hasSeenQuizPrompt) {
      setShowQuiz(true);
      return;
    }
    setShowQuiz(false);
  }, [isOnMain, birthdayISO, showBirthday, showWelcome, hasSeenQuizPrompt, today]);

  useEffect(() => {
    if (!isOnMain) {
      setShowBirthday(false);
      setShowWelcome(false);
      setShowQuiz(false);
    }
  }, [isOnMain]);

  /** 생일 입력 완료 → 올해 생일상 생성/스킵 결정 */
  const handleBirthdaySubmit = async (iso: string) => {
    setBirthdayISO(iso);
    setShowBirthday(false);

    try {
      const { alreadyExists } = await ensureThisYearCreated();
      // 이미 있든 새로 만들었든, 환영 모달로 이어짐
      setShowWelcome(true);
      if (!isOnMain) nav("../main", { replace: true });
    } catch (e) {
      console.error("☁️ 생일상 생성/조회 단계 실패:", e);
      alert("☁️ 생일상 준비 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
      setShowWelcome(true); // 실패해도 사용자 플로우는 막지 않음
    }
  };

  const handleWelcomeClose = async () => {
    try {
      localStorage.setItem(LS_HOST_WELCOME_SHOWN, today);
    } catch { }
    // 조용한 프리페치 (실패 무시)
    try {
      await preloadThisYearQuietly();
    } catch { }
    setShowWelcome(false);
    if (birthdayISO && !hasSeenQuizPrompt) setShowQuiz(true);
  };

  const handleQuizMake = () => {
    setHasSeenQuizPrompt(true);
    setShowQuiz(false);
    nav("create-quiz", { replace: false });
  };

  const handleQuizLater = () => {
    setHasSeenQuizPrompt(true);
    setShowQuiz(false);
    alert("우측 상단 메뉴의 '내 생일 퀴즈' 탭에서 언제든지 만들 수 있어요!");
    if (!isOnMain) nav("../main", { replace: true });
  };

  // ✅ 훅 호출이 끝난 뒤에 조건부로 렌더 차단 (안전)
  if (!isAuthenticated || !isOnMain) return null;

  return (
    <>
      <BirthdaySetupModal
        open={showBirthday}
        onSubmit={handleBirthdaySubmit}
        onClose={() => setShowBirthday(false)}
      // submitting={creating}
      />

      <WelcomeModal
        open={showWelcome}
        isHost={true}
        nickname={loadingUser ? "..." : me?.name ?? ""}
        onClose={handleWelcomeClose}
      // submitting={loading}
      />

      <QuizPromptModal open={showQuiz} onMake={handleQuizMake} onLater={handleQuizLater} />
    </>
  );
}
