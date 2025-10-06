// src/features/onboarding/visitor/VisitorOnboardingGate.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import VisitorQuizPromptModal from "./VisitorQuizPropmptModal";
import VisitorSkipInfoModal from "./VisitorSkipInfoModal";
import { useVisitorOnboarding } from "./useVisitorOnboarding";
import NicknameModal from "@/features/auth/NicknameModal";
import WelcomeModal from "../home/WelcomeModal";

type Props = {
  quizIconSrc?: string;
  quizPlayPath?: string; // 기본: "/play"
  nicknameOverride?: string | null;
};

function useIsOnMain() {
  const loc = useLocation();
  const pathname = (loc.pathname || "/").replace(/\/+$/, "") || "/";
  return useMemo(() => {
    if (pathname === "/") return true;
    if (pathname === "/home") return true;
    if (pathname === "/main") return true;
    if (pathname === "/feast") return true;
    if (pathname.startsWith("/feast/")) return true;
    return false;
  }, [pathname]);
}

const LS_NICK = "bh.visitor.nickname";

export default function VisitorOnboardingGate({
  quizIconSrc,
  quizPlayPath = "/play",
  nicknameOverride,
}: Props) {
  const nav = useNavigate();
  const isOnMain = useIsOnMain();

  const {
    nickname: hookNickname,
    hasSeenPlayPrompt,
    markPlayPromptSeen,
  } = useVisitorOnboarding();

  const [localNickname, setLocalNickname] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LS_NICK);
    } catch {
      return null;
    }
  });

  const nickname = nicknameOverride ?? hookNickname ?? localNickname ?? null;

  const [showNickname, setShowNickname] = useState(false);
  const [showPlayPrompt, setShowPlayPrompt] = useState(false);
  const [showSkipInfo, setShowSkipInfo] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!isOnMain) {
      setShowNickname(false);
      return;
    }
    setShowNickname(!nickname);
  }, [isOnMain, nickname]);

  // 환영 모달이 열려있을 때는 프롬프트 자동 오픈 금지
  useEffect(() => {
    if (isOnMain && nickname && !hasSeenPlayPrompt && !showWelcome) {
      setShowPlayPrompt(true);
    } else {
      setShowPlayPrompt(false);
    }
  }, [isOnMain, nickname, hasSeenPlayPrompt, showWelcome]);

  useEffect(() => {
    if (!isOnMain) {
      setShowPlayPrompt(false);
      setShowSkipInfo(false);
      setShowNickname(false);
      setShowWelcome(false);
    }
  }, [isOnMain]);

  const handleNicknameSubmit = (name: string) => {
    const trimmed = name.trim();
    try {
      localStorage.setItem(LS_NICK, trimmed);
    } catch {}
    setLocalNickname(trimmed);
    setShowNickname(false);
    setShowWelcome(true); // 닉네임 입력 직후 환영 모달 표시
  };

  // 환영 모달 닫힌 직후 프롬프트 조건이면 곧바로 표시
  const handleWelcomeClose = () => {
    setShowWelcome(false);
    if (isOnMain && (nickname ?? localNickname) && !hasSeenPlayPrompt) {
      setShowPlayPrompt(true);
    }
  };

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
      <NicknameModal
        open={showNickname}
        defaultValue={localNickname ?? ""}
        onSubmit={handleNicknameSubmit}
        onClose={() => setShowNickname(false)}
      />

      <WelcomeModal
        open={showWelcome}
        isHost={false}
        nickname={nickname ?? localNickname ?? ""}
        onClose={handleWelcomeClose}
      />

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
