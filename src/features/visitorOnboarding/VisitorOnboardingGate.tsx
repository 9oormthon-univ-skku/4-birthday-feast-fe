// src/features/onboarding/visitor/VisitorOnboardingGate.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import VisitorQuizPromptModal from "./VisitorQuizPropmptModal";
import VisitorSkipInfoModal from "./VisitorSkipInfoModal";
import { useVisitorOnboarding } from "./useVisitorOnboarding";
import NicknameModal from "@/features/auth/NicknameModal";
import WelcomeModal from "../home/WelcomeModal";

// 🔐 게스트 인증 API
import {
  guestLogin,
  LS_GUEST_AT,
  LS_GUEST_RT,
  LS_GUEST_NN,
} from "@/apis/guest";

type Props = {
  quizIconSrc?: string;
  /** B안 중첩 라우팅 대응: 기본 상대경로 */
  quizPlayPath?: string; // 기본: "../play"
  nicknameOverride?: string | null;
};

// ✅ 새 라우팅 대응: /u/:userId/main 인식
function useIsOnMain() {
  const loc = useLocation();
  const pathname = (loc.pathname || "/").replace(/\/+$/, "") || "/";
  return useMemo(() => {
    // 레거시 호환
    if (pathname === "/" || pathname === "/home" || pathname === "/main") return true;
    // B안: /u/:userId/main 정확 매칭
    if (/^\/u\/[^/]+\/main$/.test(pathname)) return true;
    return false;
  }, [pathname]);
}

const LS_NICK = "bh.visitor.nickname";
const LS_WELCOME = "bh.visitor.welcomeShownDate";

export default function VisitorOnboardingGate({
  quizIconSrc,
  quizPlayPath = "../play", // ⬅️ 상대 경로 기본값
  nicknameOverride,
}: Props) {
  const nav = useNavigate();
  const loc = useLocation();
  const isOnMain = useIsOnMain();
  const today = new Date().toISOString().slice(0, 10);

  const { nickname: hookNickname, hasSeenPlayPrompt, markPlayPromptSeen } =
    useVisitorOnboarding();

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

  // 게스트 인증 로딩/중복 방지
  const [authLoading, setAuthLoading] = useState(false);
  const didGuestAuthOnce = useRef(false);

  // 쿼리의 ?code= 파싱 (게스트 인증 트리거)
  const searchParams = new URLSearchParams(loc.search);
  const urlCode = (searchParams.get("code") || "").trim();

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
    if (lastShown !== today) setShowWelcome(true);
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

  // ✅ 닉네임이 있고, 게스트 토큰이 없고, code가 있으면 1회 자동 게스트 인증
  useEffect(() => {
    const hasGuestTokens =
      !!localStorage.getItem(LS_GUEST_AT) && !!localStorage.getItem(LS_GUEST_RT);
    if (!isOnMain) return;
    if (didGuestAuthOnce.current) return;
    if (!nickname) return;
    if (!urlCode) return;
    if (hasGuestTokens) return;

    didGuestAuthOnce.current = true;
    (async () => {
      try {
        setAuthLoading(true);
        await guestLogin({ code: urlCode, nickname });
        try {
          localStorage.setItem(LS_GUEST_NN, nickname);
        } catch { }
      } catch (e) {
        // Kakao 로그인은 절대 타지 않고, 게스트 인증 실패만 처리
        console.error("guestLogin(auto) failed:", e);
        alert("☁️ 생일상에 접속 가능한 기간이 아닙니다. 나중에 다시 시도해주세요!");
      } finally {
        setAuthLoading(false);
      }
    })();
  }, [isOnMain, nickname, urlCode]);

  // ⛳ 닉네임 제출 -> 로컬 저장 + (code 있으면) 게스트 인증 -> 환영/프롬프트
  const handleNicknameSubmit = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      localStorage.setItem(LS_NICK, trimmed);
      localStorage.setItem(LS_GUEST_NN, trimmed);
    } catch { }

    setLocalNickname(trimmed);
    setShowNickname(false);

    if (urlCode && !authLoading) {
      try {
        setAuthLoading(true);
        await guestLogin({ code: urlCode, nickname: trimmed });
      } catch (e) {
        console.error("guestLogin(on submit) failed:", e);
      } finally {
        setAuthLoading(false);
      }
    }

    const lastShown = localStorage.getItem(LS_WELCOME);
    if (lastShown !== today) {
      setShowWelcome(true);
    } else if (isOnMain && !hasSeenPlayPrompt) {
      setShowPlayPrompt(true);
    }
  };

  const handleWelcomeClose = () => {
    try {
      localStorage.setItem(LS_WELCOME, today);
    } catch { }
    setShowWelcome(false);
    if (isOnMain && (nickname ?? localNickname) && !hasSeenPlayPrompt) {
      setShowPlayPrompt(true);
    }
  };

  const handleParticipate = () => {
    markPlayPromptSeen();
    setShowPlayPrompt(false);
    // 상대 경로 기본값("../play") → /u/:userId/play 로 이동
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
      // loading={authLoading} // 필요시 모달 버튼 로딩에 반영
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
