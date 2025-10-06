import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import VisitorQuizPromptModal from "./VisitorQuizPropmptModal";
import VisitorSkipInfoModal from "./VisitorSkipInfoModal";
import { useVisitorOnboarding } from "./useVisitorOnboarding";

// src/features/onboarding/visitor/VisitorOnboardingGate.tsx
type Props = {
  quizIconSrc?: string;
  quizPlayPath?: string;
  /** 닉네임을 외부에서 강제 주입하면 즉시 반영 */
  nicknameOverride?: string | null;
};

export default function VisitorOnboardingGate({
  quizIconSrc,
  quizPlayPath = "/quiz/play",
  nicknameOverride,
}: Props) {
  const nav = useNavigate();
  const loc = useLocation();
  const { nickname: hookNickname, hasSeenPlayPrompt, markPlayPromptSeen } = useVisitorOnboarding();

  const nickname = nicknameOverride ?? hookNickname; // 우선순위: prop > hook

  const onMainRoutes = useMemo(() => ["/", "/feast", "/home", "/main"], []);
  const isOnMain = onMainRoutes.includes(loc.pathname);

  const [showPlayPrompt, setShowPlayPrompt] = useState(false);
  const [showSkipInfo, setShowSkipInfo] = useState(false);

  // nickname 변경도 트리거로 감지
  useEffect(() => {
    if (isOnMain && nickname && !hasSeenPlayPrompt) {
      setShowPlayPrompt(true);
    } else {
      setShowPlayPrompt(false);
    }
  }, [isOnMain, nickname, hasSeenPlayPrompt]);

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
