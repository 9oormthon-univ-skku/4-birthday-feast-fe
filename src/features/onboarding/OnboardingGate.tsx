// src/features/onboarding/OnboardingGate.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BirthdaySetupModal from "./BirthdaySetupModal";
import QuizPromptModal from "./QuizPromptModal";
import { useBirthdayOnboarding } from "./useBirthdayOnboarding";
import { useAuth } from "@/features/auth/useAuth";
import WelcomeModal from "@/features/home/WelcomeModal";

// 호스트용 환영 모달 노출 기록(방문자와 분리)
const LS_HOST_WELCOME_SHOWN = "bh.host.welcomeShownDate";

/**
 * 메인 페이지에서만 온보딩 수행:
 * - 미인증(토큰 없음)이면 렌더하지 않음
 * - 메인 경로가 아니면 렌더하지 않음
 * - 메인 진입 시: 생일 미설정 → 생일 모달
 * - 생일 설정 완료 이후 1회: 환영 모달 → 퀴즈 만들기 모달
 */
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

  // 메인 페이지 경로들 (생일상)
  const onMainRoutes = useMemo(() => ["/", "/feast", "/home", "/main"], []);
  const isOnMain = onMainRoutes.includes(loc.pathname);

  // 모달 상태
  const [showBirthday, setShowBirthday] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  // 0) 미인증이거나 메인 경로가 아니면 온보딩 비활성화
  if (!isAuthenticated || !isOnMain) return null;

  const today = new Date().toISOString().slice(0, 10);

  // 생일 모달 오픈/닫힘 제어
  useEffect(() => {
    // birthdayISO가 null일 때만 열고, 값이 생기면 닫기
    setShowBirthday(birthdayISO == null);
    if (birthdayISO != null) {
      // 동시노출 방지
      setShowQuiz(false);
    }
  }, [birthdayISO]);

  // 환영/퀴즈 자동 오픈: 환영 모달이 우선, 환영이 닫힌 뒤 퀴즈 오픈
  useEffect(() => {
    if (!isOnMain) return;

    const lastShown = localStorage.getItem(LS_HOST_WELCOME_SHOWN);

    // 생일 설정됨 + 오늘 환영 미노출 + 생일 모달 닫힌 상태 → 환영 모달
    if (birthdayISO && !showBirthday && lastShown !== today) {
      setShowWelcome(true);
      setShowQuiz(false);
      return;
    }

    // 생일 설정됨 + 환영 모달 닫힘 + 아직 퀴즈 프롬프트 미노출 → 퀴즈 모달
    if (birthdayISO && !showBirthday && !showWelcome && !hasSeenQuizPrompt) {
      setShowQuiz(true);
      return;
    }

    // 기본: 아무 것도 안 열기
    setShowQuiz(false);
  }, [isOnMain, birthdayISO, showBirthday, showWelcome, hasSeenQuizPrompt, today]);

  // 3) 라우트 변경 시 모달 정리 (메인 이탈 상황 대비)
  useEffect(() => {
    if (!isOnMain) {
      setShowBirthday(false);
      setShowWelcome(false);
      setShowQuiz(false);
    }
  }, [isOnMain]);

  /** 생일 입력 완료 → 저장 후 환영 모달 먼저 */
  const handleBirthdaySubmit = (iso: string) => {
    setBirthdayISO(iso);
    setShowBirthday(false);
    // 생일 저장 직후 환영 모달 우선 노출
    setShowWelcome(true);
    // 이미 메인에 있으므로 이동은 보수적으로 유지 (메인이 아니라면 보정)
    if (!isOnMain) nav("/main", { replace: true });
  };

  /** 환영 모달 닫기 → 오늘 본 것으로 기록 후 퀴즈 모달 조건이면 열기 */
  const handleWelcomeClose = () => {
    try {
      localStorage.setItem(LS_HOST_WELCOME_SHOWN, today);
    } catch {}
    setShowWelcome(false);
    if (birthdayISO && !hasSeenQuizPrompt) {
      setShowQuiz(true);
    }
  };

  /** 퀴즈 만들기 선택 → 퀴즈 작성 페이지로 이동 */
  const handleQuizMake = () => {
    setHasSeenQuizPrompt(true);
    setShowQuiz(false);
    nav("/create-quiz", { replace: false });
  };

  /** 나중에 만들기 선택 → 메인 유지 */
  const handleQuizLater = () => {
    setHasSeenQuizPrompt(true);
    setShowQuiz(false);
    alert("우측 상단 메뉴의 '내 생일 퀴즈' 탭에서 언제든지 만들 수 있어요!");
    if (!isOnMain) nav("/main", { replace: true });
  };

  return (
    <>
      {/* 생일 설정 모달 */}
      <BirthdaySetupModal
        open={showBirthday}
        onSubmit={handleBirthdaySubmit}
        onClose={() => setShowBirthday(false)}
      />

      {/* 환영 모달 (호스트 전용) */}
      <WelcomeModal
        open={showWelcome}
        isHost={true}
        nickname=""
        onClose={handleWelcomeClose}
      />

      {/* 퀴즈 유도 모달 */}
      <QuizPromptModal
        open={showQuiz}
        onMake={handleQuizMake}
        onLater={handleQuizLater}
      />
    </>
  );
}
