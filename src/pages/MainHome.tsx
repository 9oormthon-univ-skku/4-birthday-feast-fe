// src/pages/MainHome.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Header from '../ui/Header';
import BottomSheet from '@/ui/BottomSheet';
import FooterButton from '@/ui/FooterButton';

import { BirthdayModeProvider, useBirthdayMode } from '@/features/home/ModeContext';
import ViewToggle from '@/features/home/ViewToggle';
import FeatureButtons from '@/features/home/FeatureButtons';
import EventBanner from '@/features/event/EventBanner';

import MainFeast from '@/features/message/MainFeast';
import MainList from '@/features/message/MainList';
import QuizRankList from '@/features/quiz/QuizRankList';

import CapturePreview from '@/features/home/CapturePreview';

import { useAuth } from '@/features/auth/useAuth';
import OnboardingGate from '@/features/onboarding/OnboardingGate';
import VisitorOnboardingGate from '@/features/visitorOnboarding/VisitorOnboardingGate';

const MainHomeBody: React.FC = () => {
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [isIconView, setIsIconView] = useState(true);

  const { isHost, isGuest } = useBirthdayMode();

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const lastShown = localStorage.getItem('welcome_shown_date');
    const hasGuestNickname = !!localStorage.getItem('bh.visitor.nickname');

    if (isGuest) {
      if (hasGuestNickname && lastShown !== today) setWelcomeOpen(true);
      else setWelcomeOpen(false);
      return;
    }

    if (lastShown !== today) setWelcomeOpen(true);
  }, [isGuest, isHost]);

  const captureRef = useRef<HTMLDivElement | null>(null);
  const [shotUrl, setShotUrl] = useState<string | null>(null);

  return (
    <div className="relative flex h-screen w-screen flex-col bg-[#FFF4DF]">
      <Header onDrawerOpenChange={setDrawerOpen} showBrush={isHost} />

      {/* 상단 컨트롤 바 */}
      <div className="z-100 mx-auto my-4 flex w-[90%] max-w-[468px] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <ViewToggle isIconView={isIconView} onToggle={setIsIconView} />
          {isHost && (
            <FeatureButtons
              targetRef={captureRef}
              fileName="birthday-feast"
              backgroundColor="#FFF4DF"
              onCaptured={(url) => setShotUrl(url)}
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

      {/* 방문자 온보딩 게이트 */}
      {isGuest && <VisitorOnboardingGate quizPlayPath="/play" />}

      <CapturePreview open={!!shotUrl} src={shotUrl} onClose={() => setShotUrl(null)} />
    </div>
  );
};

const MainHome: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { hostId } = useParams();

  const isShareView = !!hostId;

  // 비공유 뷰에서만 로그인 강제. 토큰은 로그인 성공 여부만 확인.
  useEffect(() => {
    if (!isShareView && !isAuthenticated) {
      navigate('/login', { replace: true, state: { from: '/main' } });
    }
  }, [isShareView, isAuthenticated, navigate]);

  // 모드 결정은 "공유 뷰" 여부로만
  const initialMode: 'host' | 'guest' = isShareView ? 'guest' : 'host';

  return (
    <BirthdayModeProvider
      defaultMode={initialMode}
      sharedHostId={hostId ?? null}
      key={`mode-${initialMode}-${hostId ?? 'self'}`}
    >
      {/* 공유 뷰에서는 온보딩 숨김 */}
      {!isShareView && <OnboardingGate />}
      <MainHomeBody />
    </BirthdayModeProvider>
  );
};

export default MainHome;
