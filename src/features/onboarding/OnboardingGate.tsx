// src/features/onboarding/OnboardingGate.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QuizPromptModal from "./QuizPromptModal";
import { useAuth } from "@/hooks/useAuth";
import WelcomeModal from "@/features/home/WelcomeModal";
import { useFeastThisYear } from "@/hooks/useFeastThisYear";
import HostSkipInfoModal from "./HostSkipInfoModal";
import { useMe } from "@/hooks/useMe";              // ✅ 추가
// (qk, UserMeResponse, useQueryClient 는 더이상 불필요하면 제거)

const SS_HOST_WELCOME_SHOWN = "bh.host.welcomeShown";
const LS_QUIZ_PROMPT_SHOWN = "bh.quiz.prompt.shown"; // "1" | "0"

export default function OnboardingGate(): React.ReactElement | null {
  const nav = useNavigate();
  const loc = useLocation();
  const { isAuthenticated } = useAuth();

  // ----- 온보딩 로컬 상태 -----
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
  // ---------------------------

  const isOnMain = useMemo(
    () => /^\/u\/[^/]+\/main$/.test((loc.pathname || "/").replace(/\/+$/, "") || "/"),
    [loc.pathname]
  );

  const [showWelcome, setShowWelcome] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // ✅ 여기서 me를 비차단으로 가져오도록 변경
  //    - 초기 렌더를 블로킹하지 않음
  //    - 데이터가 오면 모달 내 닉네임만 자연스럽게 업데이트됨
  const { me } = useMe({
    enabled: isAuthenticated && isOnMain,
    staleTime: 1000 * 60 * 5,
    // suspense: false  // 훅 내부 기본값이 false라면 생략 가능
  });

  const { preloadThisYearQuietly, ensureThisYearCreated } = useFeastThisYear();

  // 온보딩 노출 결정
  useEffect(() => {
    if (!isOnMain) return;

    let hasSessionToken = false;
    try {
      hasSessionToken = !!sessionStorage.getItem(SS_HOST_WELCOME_SHOWN);
    } catch {
      hasSessionToken = false;
    }

    if (!hasSessionToken) {
      // 세션 최초 진입 → 환영 모달 우선
      setShowWelcome(true);
      setShowQuiz(false);
      return;
    }

    // 환영 모달은 이미 본 상태 → 퀴즈 프롬프트 (로컬 기준 한 번만)
    if (!hasSeenQuizPrompt) {
      setShowQuiz(true);
      return;
    }

    // 모두 종료 상태
    setShowQuiz(false);
  }, [isOnMain, hasSeenQuizPrompt]);

  // 메인 경로가 아니면 모든 모달 닫기
  useEffect(() => {
    if (!isOnMain) {
      setShowWelcome(false);
      setShowQuiz(false);
    }
  }, [isOnMain]);

  const handleWelcomeClose = async () => {
    try {
      sessionStorage.setItem(SS_HOST_WELCOME_SHOWN, "1");
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
        nickname={me?.name ?? ""}   // ✅ me가 늦게 와도 빈 문자열로 안전
        onClose={handleWelcomeClose}
      />
      <QuizPromptModal open={showQuiz} onMake={handleQuizMake} onLater={handleQuizLater} />
      <HostSkipInfoModal open={showInfo} onClose={handleInfoClose} />
    </>
  );
}
