import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import VisitorQuizPromptModal from "./VisitorQuizPromptModal";
import VisitorSkipInfoModal from "./VisitorSkipInfoModal";
import NicknameModal from "@/features/auth/NicknameModal";
import WelcomeModal from "@/features/home/WelcomeModal";

// 🔐 게스트 인증 API
import {
  guestLogin,
  SS_GUEST_AT,
  SS_GUEST_RT,
  SS_GUEST_NN,
} from "@/apis/guest";

const LS_WELCOME = "bh.visitor.welcomeShownDate";
const PLAY_PROMPT_SEEN_KEY = "bh.visitor.hasSeenPlayPrompt"; // 퀴즈 프롬프트 노출 여부(기기 단위)

/** 메인 경로 판별 */
function useIsOnMain() {
  const loc = useLocation();
  const pathname = (loc.pathname || "/").replace(/\/+$/, "") || "/";
  return useMemo(() => /^\/u\/[^/]+\/main$/.test(pathname), [pathname]);
}

/** 게스트 준비완료 판정: 닉네임 있고, (code 없거나) 토큰 보유 */
function isGuestReady(nickname: string | null, hasCode: boolean) {
  const at = sessionStorage.getItem(SS_GUEST_AT);
  const rt = sessionStorage.getItem(SS_GUEST_RT);
  const nn = (sessionStorage.getItem(SS_GUEST_NN) ?? "").trim();
  const nickOk = (nickname ?? nn).trim().length > 0;
  const tokenOk = Boolean(at && rt);
  return nickOk && (!hasCode || tokenOk);
}

type Props = {
  quizIconSrc?: string;
  /** 상대/절대 경로. 기본 "../play" → /u/:userId/play 로 resolve */
  quizPlayPath?: string;
  /** 온보딩 완료(닉네임+토큰 준비) 시 호출 — 라우트 가드에서 사용 */
  onCompleted?: () => void;
};

export default function VisitorOnboardingGate({
  quizIconSrc,
  quizPlayPath = "../play",
  onCompleted,
}: Props) {
  const nav = useNavigate();
  const loc = useLocation();
  const { search } = loc;

  const isOnMain = useIsOnMain();
  const today = new Date().toISOString().slice(0, 10);

  const [sessionNickname, setSessionNickname] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(SS_GUEST_NN);
    } catch {
      return null;
    }
  });

  const [hasSeenPlayPrompt, setHasSeenPlayPrompt] = useState<boolean>(() => {
    return sessionStorage.getItem(PLAY_PROMPT_SEEN_KEY) === "1";
  });
  const markPlayPromptSeen = () => {
    setHasSeenPlayPrompt(true);
    sessionStorage.setItem(PLAY_PROMPT_SEEN_KEY, "1");
  };

  const [showNickname, setShowNickname] = useState(false);
  const [showPlayPrompt, setShowPlayPrompt] = useState(false);
  const [showSkipInfo, setShowSkipInfo] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // 🚫 접속 차단 상태
  const [accessBlocked, setAccessBlocked] = useState(false);
  const [blockedReason, setBlockedReason] = useState<string>("");

  // 게스트 인증 로딩/중복 방지
  const [authLoading, setAuthLoading] = useState(false);
  const didGuestAuthOnce = useRef(false);

  // 쿼리의 ?code= 파싱 (게스트 인증 트리거)
  const searchParams = new URLSearchParams(loc.search);
  const urlCode = (searchParams.get("code") || "").trim();
  const hasCode = urlCode.length > 0;

  /** 온보딩 완료 시 부모에게 통지 */
  const tryNotifyCompleted = () => {
    if (!onCompleted) return;
    if (accessBlocked) return; // 🚫 차단 시 절대 진행하지 않음
    if (isGuestReady(sessionNickname, hasCode)) {
      onCompleted();
    }
  };

  /** 🚫 온보딩/접속 차단: 모든 모달 닫고, 차단 화면으로 전환 */
  const stopOnboarding = (reason: string) => {
    setAccessBlocked(true);
    setBlockedReason(reason || "생일상에 접속할 수 없습니다.");
    setShowNickname(false);
    setShowPlayPrompt(false);
    setShowSkipInfo(false);
    setShowWelcome(false);
  };

  // 닉네임 없으면 닉네임 모달
  useEffect(() => {
    if (!isOnMain || accessBlocked) {
      setShowNickname(false);
      return;
    }
    setShowNickname(!(sessionNickname && sessionNickname.trim()));
  }, [isOnMain, sessionNickname, accessBlocked]);

  // 닉네임이 있고, 오늘 환영 모달을 아직 안봤다면 자동으로 환영 모달 오픈
  useEffect(() => {
    if (!isOnMain || !sessionNickname || accessBlocked) return;
    const lastShown = sessionStorage.getItem(LS_WELCOME);
    if (lastShown !== today) setShowWelcome(true);
  }, [isOnMain, sessionNickname, today, accessBlocked]);

  // 환영 모달이 열려 있을 땐 프롬프트 자동 오픈 금지
  useEffect(() => {
    if (accessBlocked) {
      setShowPlayPrompt(false);
      return;
    }
    if (isOnMain && sessionNickname && !hasSeenPlayPrompt && !showWelcome) {
      setShowPlayPrompt(true);
    } else {
      setShowPlayPrompt(false);
    }
  }, [isOnMain, sessionNickname, hasSeenPlayPrompt, showWelcome, accessBlocked]);

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
    if (accessBlocked) return;
    if (didGuestAuthOnce.current) return;
    if (!sessionNickname) return;
    if (!hasCode) {
      tryNotifyCompleted(); // code가 없어도 닉네임만으로 완료로 간주 가능
      return;
    }
    if (hasGuestTokens) {
      tryNotifyCompleted();
      return;
    }

    didGuestAuthOnce.current = true;
    (async () => {
      try {
        setAuthLoading(true);
        await guestLogin({ code: urlCode, nickname: sessionNickname });
        // 닉네임 보강 저장
        try {
          sessionStorage.setItem(SS_GUEST_NN, sessionNickname);
        } catch { }
      } catch (e: any) {
        console.error("guestLogin(auto) failed:", e);
        const status = e?.response?.status;
        // 401/403/404/410 등 접근 불가로 간주 → 온보딩 강제 중단
        if ([401, 403, 404, 410, 400].includes(status)) {
          stopOnboarding("생일상에 접속 가능한 기간이 아닙니다.\n나중에 다시 시도해주세요!");
        } else {
          stopOnboarding("생일상 접속에 문제가 발생했습니다.\n나중에 다시 시도해주세요!");
        }
        return;
      } finally {
        setAuthLoading(false);
        tryNotifyCompleted();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnMain, sessionNickname, urlCode, hasCode, accessBlocked]);

  // ⛳ 닉네임 제출 -> 세션 저장 + (code 있으면) 게스트 인증 -> 환영/프롬프트
  const handleNicknameSubmit = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      sessionStorage.setItem(SS_GUEST_NN, trimmed);
    } catch { }

    setSessionNickname(trimmed);
    setShowNickname(false);

    if (hasCode && !authLoading && !accessBlocked) {
      try {
        setAuthLoading(true);
        await guestLogin({ code: urlCode, nickname: trimmed });
      } catch (e: any) {
        console.error("guestLogin(on submit) failed:", e);
        const status = e?.response?.status;
        if ([401, 403, 404, 410].includes(status)) {
          stopOnboarding("☁️ 생일상에 접속 가능한 기간이 아닙니다.\n나중에 다시 시도해주세요!");
        } else {
          stopOnboarding("☁️ 생일상 접속에 문제가 발생했습니다.\n나중에 다시 시도해주세요!");
        }
        return;
      } finally {
        setAuthLoading(false);
      }
    }

    if (accessBlocked) return;

    const lastShown = sessionStorage.getItem(LS_WELCOME);
    if (lastShown !== today) {
      setShowWelcome(true);
    } else if (isOnMain && !hasSeenPlayPrompt) {
      setShowPlayPrompt(true);
    }

    // 닉네임이 세팅되었고 (code가 없거나) 토큰이 이미 있으면 완료 통지
    tryNotifyCompleted();
  };

  const handleWelcomeClose = () => {
    try {
      sessionStorage.setItem(LS_WELCOME, today);
    } catch { }
    setShowWelcome(false);
    if (isOnMain && sessionNickname && !hasSeenPlayPrompt && !accessBlocked) {
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

  // 차단 화면(온보딩 중단 UI)
  if (accessBlocked) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/50 px-6 text-center">
        <div className="mx-auto w-full max-w-[420px] rounded-2xl bg-white border border-[#ffe0e0] p-6 shadow-lg">
          <h2 className="mb-2 text-xl font-bold text-[#FF8B8B]">접속이 제한되었어요🥲</h2>
          <p className="mb-4 text-sm text-[#666] whitespace-pre-line">
            {blockedReason || "생일상에 접속할 수 없습니다."}
          </p>
          <div className="mt-2 flex items-center justify-center">
            <button
              className="rounded-xl bg-[#FF8B8B] px-4 py-2 text-sm text-white"
              onClick={() => nav("/", { replace: true })}
            >
              홈으로
            </button>
          </div>
        </div>
      </div>
    );
  }

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
