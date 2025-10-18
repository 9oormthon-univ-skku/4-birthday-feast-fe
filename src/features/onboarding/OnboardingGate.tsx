// src/features/onboarding/OnboardingGate.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QuizPromptModal from "./QuizPromptModal";
import { useBirthdayOnboarding } from "../../hooks/useBirthdayOnboarding";
import { useAuth } from "@/hooks/useAuth";
import WelcomeModal from "@/features/home/WelcomeModal";
import { useFeastThisYear } from "@/hooks/useFeastThisYear";
// import { useMe } from "../../hooks/useMe";
import { qk } from "@/lib/queryKeys";
import type { UserMeResponse } from "@/apis/user";
import { useQueryClient } from "@tanstack/react-query";

const LS_HOST_WELCOME_SHOWN = "bh.host.welcomeShownDate";

export default function OnboardingGate(): React.ReactElement | null {
  const nav = useNavigate();
  const loc = useLocation();
  const { isAuthenticated } = useAuth();

  const { hasSeenQuizPrompt, setHasSeenQuizPrompt } = useBirthdayOnboarding();

  const isOnMain = useMemo(
    () => /^\/u\/[^/]+\/main$/.test((loc.pathname || "/").replace(/\/+$/, "") || "/"),
    [loc.pathname]
  );

  // 훅은 항상 같은 순서/개수로 호출
  const [showWelcome, setShowWelcome] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const qc = useQueryClient();
  const me = (isAuthenticated ? qc.getQueryData<UserMeResponse>(qk.auth.me) : null) ?? null;
  const { preloadThisYearQuietly } = useFeastThisYear();

  const today = new Date().toISOString().slice(0, 10);

  // 온보딩 노출 결정
  useEffect(() => {
    if (!isOnMain) return;

    const lastShown = localStorage.getItem(LS_HOST_WELCOME_SHOWN);

    // 오늘 환영 모달을 아직 안 봤다면 우선 환영 모달
    if (lastShown !== today) {
      setShowWelcome(true);
      setShowQuiz(false);
      return;
    }

    // 환영 모달은 이미 본 상태 → 퀴즈 프롬프트 노출 (한 번만)
    if (!hasSeenQuizPrompt) {
      setShowQuiz(true);
      return;
    }

    // 모두 종료 상태
    setShowQuiz(false);
  }, [isOnMain, hasSeenQuizPrompt, today]);

  // 메인 경로가 아니면 모든 모달 닫기
  useEffect(() => {
    if (!isOnMain) {
      setShowWelcome(false);
      setShowQuiz(false);
    }
  }, [isOnMain]);

  const handleWelcomeClose = async () => {
    try {
      localStorage.setItem(LS_HOST_WELCOME_SHOWN, today);
    } catch { }

    // 조용한 프리페치 (실패 무시)
    try {
      await preloadThisYearQuietly();
    } catch { }

    setShowWelcome(false);

    // 환영 모달 이후 퀴즈 프롬프트 한 번만
    if (!hasSeenQuizPrompt) setShowQuiz(true);
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

  // 훅 호출이 끝난 뒤에 조건부로 렌더 차단 (안전)
  if (!isAuthenticated || !isOnMain) return null;

  return (
    <>
      <WelcomeModal
        open={showWelcome}
        isHost={true}
        nickname={me?.name ?? ""}
        onClose={handleWelcomeClose}
      />

      <QuizPromptModal open={showQuiz} onMake={handleQuizMake} onLater={handleQuizLater} />
    </>
  );
}
