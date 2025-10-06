// src/pages/MainHome.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../ui/Header';
import BottomSheet from '@/ui/BottomSheet';
import FooterButton from '@/ui/FooterButton';

import { BirthdayModeProvider, useBirthdayMode } from '@/features/home/ModeContext';
import ModeToggle from '@/features/home/ModeToggle';
import ViewToggle from '@/features/home/ViewToggle';
import FeatureButtons from '@/features/home/FeatureButtons';
import EventBanner from '@/features/event/EventBanner';

import MainFeast from '@/features/message/MainFeast';
import MainList from '@/features/message/MainList';
import QuizRankList from '@/features/quiz/QuizRankList';

import WelcomeModal from '@/features/home/WelcomeModal';
import NicknameModal from '@/features/auth/NicknameModal';
import CapturePreview from '@/features/home/CapturePreview';

import { useAuth } from '@/features/auth/useAuth';
import OnboardingGate from '@/features/onboarding/OnboardingGate';
import VisitorOnboardingGate from '@/features/visitorOnboarding/VisitorOnboardingGate';

// ✅ 추가: 방문자 온보딩 게이트 & 아이콘
// import VisitorOnboardingGate from '@/features/onboarding/visitor/VisitorOnboardingGate';
// import quizIcon from '@/assets/images/quiz-icon.svg'; // 프로젝트 아이콘 경로에 맞춰 조정
// import VisitorOnboardingGate from '@/features/visitorOnboarding/visitorOnboardingGate';

const MainHomeBody: React.FC = () => {
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [nicknameOpen, setNicknameOpen] = useState(false);
  const [isIconView, setIsIconView] = useState(true);

  const { isHost, isGuest } = useBirthdayMode();

  const [guestNickname, setGuestNickname] = useState<string | null>(
    () => localStorage.getItem('guest_nickname') || null
  );

  // 초기 모달 오픈 로직: 역할/닉네임 유무에 따라 분기
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10); // 예: 2025-10-06
    const lastShown = localStorage.getItem('welcome_shown_date');

    // 게스트면서 닉네임이 아직 없으면 닉네임 모달부터 오픈
    if (isGuest) {
      const hasNickname = !!localStorage.getItem('guest_nickname');
      if (!hasNickname) {
        setNicknameOpen(true);
        setWelcomeOpen(false);
        return;
      }
    }
    if (lastShown !== today) {
      setWelcomeOpen(true);
    }
  }, [isHost, isGuest, nicknameOpen, guestNickname]);

  const handleWelcomeClose = () => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('welcome_shown_date', today);
    setWelcomeOpen(false);
    if (isGuest && !localStorage.getItem('guest_nickname')) {
      setNicknameOpen(true);
    }
  };

  const captureRef = useRef<HTMLDivElement | null>(null);
  const [shotUrl, setShotUrl] = useState<string | null>(null);

  // 닉네임 저장 처리
  const handleNicknameSubmit = (nickname: string) => {
    try {
      localStorage.setItem('guest_nickname', nickname);
      localStorage.setItem('bh.visitor.nickname', nickname.trim());
    } catch { }
    setGuestNickname(nickname);          // 상태 갱신 → 게이트가 즉시 반응
    setNicknameOpen(false);
  };

  return (
    <div className="relative flex h-screen w-screen flex-col bg-[#FFF4DF]">
      <ModeToggle className="absolute right-3 top-30 z-[60]" />
      <Header onDrawerOpenChange={setDrawerOpen} showBrush={isHost} />

      {/* 상단 컨트롤 바 */}
      <div className="z-100 mx-auto my-4 flex w-[90%] max-w-[468px] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <ViewToggle isIconView={isIconView} onToggle={setIsIconView} />
          {isHost && (
            <FeatureButtons
              targetRef={captureRef} // 캡쳐 타깃 전달
              fileName="birthday-feast"
              backgroundColor="#FFF4DF"
              onCaptured={(url) => setShotUrl(url)} // 미리보기 열기
            />
          )}
        </div>

        {isHost && (
          <div className="shrink-0">
            <EventBanner />
          </div>
        )}
      </div>

      <div ref={captureRef} className={isIconView ? 'mt-auto pt-[95%]' : ''}>
        {isIconView ? (
          <div className="w-full flex justify-center">
            <MainFeast />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-[520px] px-4 pb-3">
            <MainList columns={4} />
          </div>
        )}
      </div>

      <BottomSheet>
        <h2 className="my-2 text-[#FF8B8B] text-xl font-bold">방문자 퀴즈 랭킹</h2>
        <QuizRankList />
      </BottomSheet>

      {isGuest && !drawerOpen && (
        <footer className="fixed bottom-8 left-0 right-0 z-100 flex justify-center bg-transparent">
          <div className="w-full max-w-[520px] px-8 py-4 pt-15 pb-[env(safe-area-inset-bottom)]">
            <FooterButton
              label="사용자님에게 생일 메시지 남기기"
              onClick={() => navigate('/write')}
            />
          </div>
        </footer>
      )}

      {/* 방문자 온보딩 게이트: 닉네임 변경 즉시 모달 뜸 */}
      {isGuest && (
        <VisitorOnboardingGate
          // quizIconSrc={quizIcon}
          quizPlayPath="/play"
          nicknameOverride={guestNickname}
        />
      )}

      <WelcomeModal
        open={welcomeOpen}
        isHost={isHost}
        nickname={localStorage.getItem('guest_nickname') || ''}
        onClose={handleWelcomeClose}
      />
      <NicknameModal
        open={isGuest && nicknameOpen}
        defaultValue={localStorage.getItem('guest_nickname') || ''}
        onSubmit={handleNicknameSubmit}
        onClose={() => setNicknameOpen(false)}
      />

      <CapturePreview open={!!shotUrl} src={shotUrl} onClose={() => setShotUrl(null)} />
    </div>
  );
};

const MainHome: React.FC = () => {
  // 로그인 토큰 존재 여부로 Host/Guest 분기
  const { isAuthenticated } = useAuth();
  const initialMode = isAuthenticated ? 'host' : 'guest';

  return (
    <BirthdayModeProvider
      defaultMode={initialMode as 'host' | 'guest'}
      // 토큰이 바뀌면 Provider 리마운트 → 모드 즉시 반영
      key={`mode-${initialMode}`}
    >
      {/* (생일자용) 온보딩 */}
      <OnboardingGate />
      {/* 메인 */}
      <MainHomeBody />
    </BirthdayModeProvider>
  );
};

export default MainHome;
