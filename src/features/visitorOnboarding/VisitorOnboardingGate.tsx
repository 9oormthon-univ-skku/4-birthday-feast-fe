// src/features/onboarding/visitor/VisitorOnboardingGate.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import VisitorQuizPromptModal from "./VisitorQuizPropmptModal";
import VisitorSkipInfoModal from "./VisitorSkipInfoModal";
import NicknameModal from "@/features/auth/NicknameModal";
import WelcomeModal from "../home/WelcomeModal";

// 🔐 게스트 인증 API
import {
  guestLogin,
  SS_GUEST_AT,
  SS_GUEST_RT,
  SS_GUEST_NN,
} from "@/apis/guest";

// const LS_NICK = "bh.visitor.nickname";
const LS_WELCOME = "bh.visitor.welcomeShownDate";
const PLAY_PROMPT_SEEN_KEY = "bh.visitor.hasSeenPlayPrompt"; // 퀴즈 프롬프트 노출 여부(기기 단위)

/** 메인 경로 판별 */
function useIsOnMain() {
  const loc = useLocation();
  const pathname = (loc.pathname || "/").replace(/\/+$/, "") || "/";
  return useMemo(() => /^\/u\/[^/]+\/main$/.test(pathname), [pathname]);
}


type Props = {
  quizIconSrc?: string;
  quizPlayPath?: string; // 기본: "../play"
  // nicknameOverride?: string | null;
};
export default function VisitorOnboardingGate({
  quizIconSrc,
  quizPlayPath = "../play", // 기본값 
}: Props) {
  const nav = useNavigate();
  const loc = useLocation();
  const { search } = loc;

  const isOnMain = useIsOnMain();
  const today = new Date().toISOString().slice(0, 10);

  // const { nickname: hookNickname, hasSeenPlayPrompt, markPlayPromptSeen } =
  //   useVisitorOnboarding();

  const [sessionNickname, setSessionNickname] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(SS_GUEST_NN);
    } catch {
      return null;
    }
  });

  const [hasSeenPlayPrompt, setHasSeenPlayPrompt] = useState<boolean>(() => sessionStorage.getItem(PLAY_PROMPT_SEEN_KEY) === "1");
  const markPlayPromptSeen = () => {
    setHasSeenPlayPrompt(true);
    sessionStorage.setItem(PLAY_PROMPT_SEEN_KEY, "1");
  };

  // const nickname = sessionNickname ?? null;

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
    setShowNickname(!sessionNickname);
  }, [isOnMain, sessionNickname]);

  // 닉네임이 있고, 오늘 환영 모달을 아직 안봤다면 자동으로 환영 모달 오픈
  useEffect(() => {
    if (!isOnMain || !sessionNickname) return;
    const lastShown = sessionStorage.getItem(LS_WELCOME);
    if (lastShown !== today) setShowWelcome(true);
  }, [isOnMain, sessionNickname, today]);

  // 환영 모달이 열려 있을 땐 프롬프트 자동 오픈 금지
  useEffect(() => {
    if (isOnMain && sessionNickname && !hasSeenPlayPrompt && !showWelcome) {
      setShowPlayPrompt(true);
    } else {
      setShowPlayPrompt(false);
    }
  }, [isOnMain, sessionNickname, hasSeenPlayPrompt, showWelcome]);

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
      !!sessionStorage.getItem(SS_GUEST_AT) && !!sessionStorage.getItem(SS_GUEST_RT);
    if (!isOnMain) return;
    if (didGuestAuthOnce.current) return;
    if (!sessionNickname) return;
    if (!urlCode) return;
    if (hasGuestTokens) return;

    didGuestAuthOnce.current = true;
    (async () => {
      try {
        setAuthLoading(true);
        await guestLogin({ code: urlCode, nickname: sessionNickname });
        try {
          sessionStorage.setItem(SS_GUEST_NN, sessionNickname);
        } catch { }
      } catch (e) {
        // Kakao 로그인은 절대 타지 않고, 게스트 인증 실패만 처리
        console.error("guestLogin(auto) failed:", e);
        alert("☁️ 생일상에 접속 가능한 기간이 아닙니다. 나중에 다시 시도해주세요!");
      } finally {
        setAuthLoading(false);
      }
    })();
  }, [isOnMain, sessionNickname, urlCode]);

  // ⛳ 닉네임 제출 -> 세션 저장 + (code 있으면) 게스트 인증 -> 환영/프롬프트
  const handleNicknameSubmit = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      // sessionStorage.setItem(LS_NICK, trimmed);
      sessionStorage.setItem(SS_GUEST_NN, trimmed);
    } catch { }

    setSessionNickname(trimmed);
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

    const lastShown = sessionStorage.getItem(LS_WELCOME);
    if (lastShown !== today) {
      setShowWelcome(true);
    } else if (isOnMain && !hasSeenPlayPrompt) {
      setShowPlayPrompt(true);
    }
  };

  const handleWelcomeClose = () => {
    try {
      sessionStorage.setItem(LS_WELCOME, today);
    } catch { }
    setShowWelcome(false);
    if (isOnMain && sessionNickname && !hasSeenPlayPrompt) {
      setShowPlayPrompt(true);
    }
  };

  const handleParticipate = () => {
    markPlayPromptSeen();
    setShowPlayPrompt(false);
    // 상대 경로 기본값("../play") → /u/:userId/play 로 이동
    nav({ pathname: quizPlayPath, search }, { replace: false });
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
        defaultValue={sessionNickname ?? ""}
        onSubmit={handleNicknameSubmit}
        onClose={() => setShowNickname(false)}
      // loading={authLoading} // 필요시 모달 버튼 로딩에 반영
      />

      <WelcomeModal
        open={showWelcome}
        isHost={false}
        nickname={sessionNickname ?? ""}
        onClose={handleWelcomeClose}
      />

      <VisitorQuizPromptModal
        open={showPlayPrompt}
        nickname={sessionNickname ?? ""}
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
