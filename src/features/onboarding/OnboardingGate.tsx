// src/features/onboarding/OnboardingGate.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BirthdaySetupModal from "./BirthdaySetupModal";
import QuizPromptModal from "./QuizPromptModal";
import { useBirthdayOnboarding } from "./useBirthdayOnboarding";
import { useAuth } from "@/features/auth/useAuth";
import WelcomeModal from "@/features/home/WelcomeModal";
import { createBirthday, getThisYearBirthday, getAllBirthdays } from "@/apis/birthday"; // API 직접 호출

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

  const [loadingThisYear, setLoadingThisYear] = useState(false);
  const fetchedThisYearRef = useRef(false);

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

  // 1) 유틸: 올해 생일상 존재 여부 확인
  async function findExistingThisYear(): Promise<{
    exists: boolean;
    pickedId?: string;
    code?: string;
  }> {
    // 1) 로컬 보관 ID 우선
    let bid = localStorage.getItem("bh.lastBirthdayId") || undefined;

    // 2) 없으면 전체 조회해서 하나 선택
    if (!bid) {
      const list = await getAllBirthdays().catch(() => []);
      const picked = Array.isArray(list) && list.length > 0 ? list[0] : null;
      if (picked) {
        bid = String(picked.birthdayId);
        localStorage.setItem("bh.lastBirthdayId", bid);
        if (picked.code) localStorage.setItem("bh.lastBirthdayCode", picked.code);
      }
    }

    if (!bid) return { exists: false };

    try {
      const thisYear = await getThisYearBirthday(bid);
      // 성공적으로 응답이 오면 올해 생일상이 “존재”하는 것으로 간주
      localStorage.setItem("bh.lastBirthdayId", String(thisYear.birthdayId));
      if (thisYear.code) localStorage.setItem("bh.lastBirthdayCode", thisYear.code);
      return { exists: true, pickedId: String(thisYear.birthdayId), code: thisYear.code };
    } catch {
      // 404/빈응답 등은 “올해 없음”
      return { exists: false, pickedId: bid };
    }
  }

  /** 생일 입력 완료 → (이미 있으면 건너뛰고) 없으면 서버에 생일상 생성 */
  const handleBirthdaySubmit = async (iso: string) => {
    setBirthdayISO(iso);
    setShowBirthday(false);

    // 올해 생일상 선검사
    setCreatingFeast(true);
    try {
      const check = await findExistingThisYear();
      if (check.exists) {
        // 이미 올해 생일상 있음 → 생성 생략
        console.log("☁️ 이미 올해 생일상이 생성되어있음");
        setShowWelcome(true);
        if (!isOnMain) nav("/main", { replace: true });
        return;
      }

      // 이미 생성 시도 중이면 중복 방지
      if (createOnceRef.current) {
        setShowWelcome(true);
        if (!isOnMain) nav("/main", { replace: true });
        return;
      }

      createOnceRef.current = true;

      // ❗올해 생일상이 없을 때만 생성
      const data = await createBirthday();
      localStorage.setItem("bh.lastBirthdayId", String(data.birthdayId));
      localStorage.setItem("bh.lastBirthdayCode", data.code);
    } catch (e) {
      console.error("☁️ 생일상 생성/조회 단계 실패:", e);
      alert("☁️ 생일상 준비 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setCreatingFeast(false);
      setShowWelcome(true);
      if (!isOnMain) nav("/main", { replace: true });
    }
  };

  const handleWelcomeClose = async () => {
    try {
      localStorage.setItem(LS_HOST_WELCOME_SHOWN, today);
    } catch { }

    // 중복 호출 방지
    if (!fetchedThisYearRef.current) {
      fetchedThisYearRef.current = true;
      setLoadingThisYear(true);

      try {
        // 1) 저장된 ID 우선
        let bid = localStorage.getItem("bh.lastBirthdayId");

        // 2) 그래도 없으면 전체 조회해서 하나 선택
        if (!bid) {
          const list = await getAllBirthdays();
          const picked = Array.isArray(list) && list.length > 0 ? list[0] : null;
          if (picked) {
            bid = String(picked.birthdayId);
            localStorage.setItem("bh.lastBirthdayId", bid);
            if (picked.code) localStorage.setItem("bh.lastBirthdayCode", picked.code);
          }
        }

        // 3) 이번년도 생일상 상세(또는 요약) 조회
        if (bid) {
          const thisYear = await getThisYearBirthday(bid);
          // 필요하면 전역/컨텍스트에 반영하고,
          // 최소한 최근값을 캐시해 둠
          localStorage.setItem("bh.lastBirthdayId", String(thisYear.birthdayId));
          if (thisYear.code) localStorage.setItem("bh.lastBirthdayCode", thisYear.code);
        } else {
          console.warn("올해 생일상을 조회할 birthdayId가 없습니다.");
        }
      } catch (e) {
        console.warn("이번년도 생일상 조회 실패:", e);
        // 실패해도 플로우 계속 진행
      } finally {
        setLoadingThisYear(false);
      }
    }

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
      // submitting={loadingThisYear} // 모달이 지원하면 사용
      />

      <QuizPromptModal open={showQuiz} onMake={handleQuizMake} onLater={handleQuizLater} />
    </>
  );
}
