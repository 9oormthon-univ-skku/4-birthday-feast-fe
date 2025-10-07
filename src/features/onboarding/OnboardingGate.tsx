// src/features/onboarding/OnboardingGate.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BirthdaySetupModal from "./BirthdaySetupModal";
import QuizPromptModal from "./QuizPromptModal";
import { useBirthdayOnboarding } from "./useBirthdayOnboarding";
import { useAuth } from "@/features/auth/useAuth";
import WelcomeModal from "@/features/home/WelcomeModal";
import { createBirthday } from "@/apis/birthday"; // API 직접 호출

// 호스트용 환영 모달 노출 기록(방문자와 분리)
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

  const onMainRoutes = useMemo(() => ["/", "/feast", "/home", "/main"], []);
  const isOnMain = onMainRoutes.includes(loc.pathname);

  const [showBirthday, setShowBirthday] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  // 생성 로딩 & 중복호출 방지
  const [creatingFeast, setCreatingFeast] = useState(false);
  const createOnceRef = useRef(false);

  if (!isAuthenticated || !isOnMain) return null;

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

  /** 생일 입력 완료 → 저장 후 서버에 생일상 생성 */
  const handleBirthdaySubmit = async (iso: string) => {
    setBirthdayISO(iso);
    setShowBirthday(false);

    // 이미 생성시도 중이면 무시 (더블클릭 방지)
    if (createOnceRef.current) {
      setShowWelcome(true);
      if (!isOnMain) nav("/main", { replace: true });
      return;
    }

    createOnceRef.current = true;
    setCreatingFeast(true);
    try {
      const data = await createBirthday();
      // 성공 시 식별자/코드 저장 (원하면 앱 상태로도 보관)
      localStorage.setItem("bh.lastBirthdayId", String(data.birthdayId));
      localStorage.setItem("bh.lastBirthdayCode", data.code);
    } catch (e) {
      console.error("☁️ 생일상 생성 실패:", e);
      alert("☁️ 생일상 생성에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setCreatingFeast(false);
      setShowWelcome(true);
      if (!isOnMain) nav("/main", { replace: true });
    }
  };

  const handleWelcomeClose = () => {
    try {
      localStorage.setItem(LS_HOST_WELCOME_SHOWN, today);
    } catch {}
    setShowWelcome(false);
    if (birthdayISO && !hasSeenQuizPrompt) setShowQuiz(true);
  };

  const handleQuizMake = () => {
    setHasSeenQuizPrompt(true);
    setShowQuiz(false);
    nav("/create-quiz", { replace: false });
  };

  const handleQuizLater = () => {
    setHasSeenQuizPrompt(true);
    setShowQuiz(false);
    alert("우측 상단 메뉴의 '내 생일 퀴즈' 탭에서 언제든지 만들 수 있어요!");
    if (!isOnMain) nav("/main", { replace: true });
  };

  return (
    <>
      <BirthdaySetupModal
        open={showBirthday}
        onSubmit={handleBirthdaySubmit}
        onClose={() => setShowBirthday(false)}
        // Modal 컴포넌트가 지원하면 로딩 전달해서 버튼 비활성화
        // submitting={creatingFeast}
      />

      <WelcomeModal
        open={showWelcome}
        isHost={true}
        nickname=""
        onClose={handleWelcomeClose}
      />

      <QuizPromptModal open={showQuiz} onMake={handleQuizMake} onLater={handleQuizLater} />
    </>
  );
}
