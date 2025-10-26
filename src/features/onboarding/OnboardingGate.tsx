// src/features/onboarding/OnboardingGate.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QuizPromptModal from "./QuizPromptModal";
import { useAuth } from "@/hooks/useAuth";
import WelcomeModal from "@/features/home/WelcomeModal";
import { useFeastThisYear } from "@/hooks/useFeastThisYear";
import { qk } from "@/lib/queryKeys";
import type { UserMeResponse } from "@/apis/user";
import { useQueryClient } from "@tanstack/react-query";
import HostSkipInfoModal from "./HostSkipInfoModal";

const LS_HOST_WELCOME_SHOWN = "bh.host.welcomeShownDate";
const LS_QUIZ_PROMPT_SHOWN = "bh.quiz.prompt.shown"; // "1" | "0"

export default function OnboardingGate(): React.ReactElement | null {
  const nav = useNavigate();
  const loc = useLocation();
  const { isAuthenticated } = useAuth();

  // ----- 온보딩 로컬 상태(훅 제거하고 직접 관리) -----
  const [hasSeenQuizPrompt, setHasSeenQuizPromptState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LS_QUIZ_PROMPT_SHOWN) === "1";
    } catch {
      return false;
    }
  });

  const setHasSeenQuizPrompt = useCallback((v: boolean) => {
    setHasSeenQuizPromptState(v);
    try {
      localStorage.setItem(LS_QUIZ_PROMPT_SHOWN, v ? "1" : "0");
    } catch { }
  }, []);
  // -----------------------------------------------

  const isOnMain = useMemo(
    () => /^\/u\/[^/]+\/main$/.test((loc.pathname || "/").replace(/\/+$/, "") || "/"),
    [loc.pathname]
  );

  const [showWelcome, setShowWelcome] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const qc = useQueryClient();
  const me = (isAuthenticated ? qc.getQueryData<UserMeResponse>(qk.auth.me) : null) ?? null;

  const { preloadThisYearQuietly, ensureThisYearCreated } = useFeastThisYear();

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

    // 1) 조용한 프리페치 (실패 무시)
    try {
      await preloadThisYearQuietly();
    } catch { }

    // 2) 올해 생일상 없으면 생성 (실패 무시)
    try {
      await ensureThisYearCreated();
    } catch { }

    // 3) 모달 닫고, 필요 시 퀴즈 프롬프트 노출
    setShowWelcome(false);
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
    setShowInfo(true);
  };

  const handleInfoClose = () => {
    setShowInfo(false);
    if (!isOnMain) nav("../main", { replace: true });
  };

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
      <HostSkipInfoModal open={showInfo} onClose={handleInfoClose} />

      {/* 필요 시 리셋 버튼/디버그용: resetOnboarding() */}
    </>
  );
}
