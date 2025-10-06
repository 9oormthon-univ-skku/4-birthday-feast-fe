// src/features/onboarding/visitor/VisitorOnboardingGate.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import VisitorQuizPromptModal from "./VisitorQuizPropmptModal";
import VisitorSkipInfoModal from "./VisitorSkipInfoModal";
import { useVisitorOnboarding } from "./useVisitorOnboarding";

type Props = {
  quizIconSrc?: string;
  quizPlayPath?: string;
  /** 닉네임을 외부에서 강제 주입하면 즉시 반영 */
  nicknameOverride?: string | null;
};

// 공통: 메인 경로 판별 유틸 (동적 세그먼트까지 지원)
function useIsOnMain() {
  const loc = useLocation();
  const pathname = loc.pathname.replace(/\/+$/, "") || "/"; // 트레일링 슬래시 정규화
  return useMemo(() => {
    if (pathname === "/") return true;
    if (pathname === "/home") return true;
    if (pathname === "/main") return true;
    if (pathname === "/feast") return true;
    if (pathname.startsWith("/feast/")) return true; // ✅ 동적 경로 지원
    return false;
  }, [pathname]);
}

export default function VisitorOnboardingGate({
  quizIconSrc,
  quizPlayPath = "/play",
  nicknameOverride,
}: Props) {
  const nav = useNavigate();
  const isOnMain = useIsOnMain();

  const { nickname: hookNickname, hasSeenPlayPrompt, markPlayPromptSeen } = useVisitorOnboarding();
  const nickname = nicknameOverride ?? hookNickname; // 우선순위: prop > hook

  const [showPlayPrompt, setShowPlayPrompt] = useState(false);
  const [showSkipInfo, setShowSkipInfo] = useState(false);

  // 닉네임/메인여부/노출여부에 따라 프롬프트 토글
  useEffect(() => {
    if (isOnMain && nickname && !hasSeenPlayPrompt) {
      setShowPlayPrompt(true);
    } else {
      setShowPlayPrompt(false);
    }
  }, [isOnMain, nickname, hasSeenPlayPrompt]);

  // 메인 이탈 시 모달 정리
  useEffect(() => {
    if (!isOnMain) {
      setShowPlayPrompt(false);
      setShowSkipInfo(false);
    }
  }, [isOnMain]);

  const handleParticipate = () => {
    markPlayPromptSeen();
    setShowPlayPrompt(false);
    nav(quizPlayPath, { replace: false });
  };

  const handleSkip = () => {
    markPlayPromptSeen();
    setShowPlayPrompt(false);
    setShowSkipInfo(true);
  };

  return (
    <>
      <VisitorQuizPromptModal
        open={showPlayPrompt}
        nickname={nickname ?? undefined}
        onParticipate={handleParticipate}
        onSkip={handleSkip}
        onClose={() => setShowPlayPrompt(false)}
      />
      <VisitorSkipInfoModal
        open={showSkipInfo}
        quizIconSrc={quizIconSrc}
        onClose={() => setShowSkipInfo(false)}
      />
    </>
  );
}
