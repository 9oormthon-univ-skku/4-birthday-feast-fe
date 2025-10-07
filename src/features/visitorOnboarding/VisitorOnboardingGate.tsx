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
    // if (pathname === "/feast") return true;
    // if (pathname.startsWith("/feast/")) return true;
    return false;
  }, [pathname]);
}

const LS_NICK = "bh.visitor.nickname";
const LS_WELCOME = "bh.visitor.welcomeShownDate";

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

  const today = new Date().toISOString().slice(0, 10);

  // 닉네임 없으면 닉네임 모달
  useEffect(() => {
    if (!isOnMain) {
      setShowNickname(false);
      return;
    }
    setShowNickname(!nickname);
  }, [isOnMain, nickname]);

  // 닉네임이 있고, 오늘 환영 모달을 아직 안봤다면 자동으로 환영 모달 오픈
  useEffect(() => {
    if (!isOnMain || !nickname) return;
    const lastShown = localStorage.getItem(LS_WELCOME);
    if (lastShown !== today) {
      setShowWelcome(true);
    }
  }, [isOnMain, nickname, today]);

  // 환영 모달이 열려 있을 땐 프롬프트 자동 오픈 금지
  useEffect(() => {
    if (isOnMain && nickname && !hasSeenPlayPrompt && !showWelcome) {
      setShowPlayPrompt(true);
    } else {
      setShowPlayPrompt(false);
    }
  }, [isOnMain, nickname, hasSeenPlayPrompt, showWelcome]);

  // 메인 이탈 시 정리
  useEffect(() => {
    if (!isOnMain) {
      setShowPlayPrompt(false);
      setShowSkipInfo(false);
      setShowNickname(false);
      setShowWelcome(false);
    }
  }, [isOnMain]);

  // 닉네임 제출 -> 환영 모달(오늘 미노출 시) 또는 곧바로 프롬프트
  const handleNicknameSubmit = (name: string) => {
    const trimmed = name.trim();
    try {
      localStorage.setItem(LS_NICK, trimmed);
    } catch {}
    setLocalNickname(trimmed);
    setShowNickname(false);

    const lastShown = localStorage.getItem(LS_WELCOME);
    if (lastShown !== today) {
      setShowWelcome(true);
    } else if (isOnMain && !hasSeenPlayPrompt) {
      setShowPlayPrompt(true);
    }
  };

  // 환영 모달 닫힘 -> 오늘 본 것으로 기록 후 프롬프트(조건 시) 열기
  const handleWelcomeClose = () => {
    try {
      localStorage.setItem(LS_WELCOME, today);
    } catch {}
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
