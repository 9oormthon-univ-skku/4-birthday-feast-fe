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

  // 초기 모달 오픈 로직: 게스트는 닉네임 수집을 VisitorOnboardingGate가 처리하므로
  // 환영 모달은 "닉네임이 이미 있는 경우"에만 표시
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const lastShown = localStorage.getItem('welcome_shown_date');
    const hasGuestNickname = !!localStorage.getItem('bh.visitor.nickname');

    if (isGuest) {
      if (hasGuestNickname && lastShown !== today) {
        setWelcomeOpen(true);
      } else {
        setWelcomeOpen(false);
      }
      return;
    }

    // 호스트는 기존 로직대로
    if (lastShown !== today) {
      setWelcomeOpen(true);
    }
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

      {/* 방문자 온보딩 게이트: 닉네임 수집/플레이 프롬프트/스킵 안내를 내부에서 처리 */}
      {isGuest && (
        <VisitorOnboardingGate
          // quizIconSrc={quizIcon}
          quizPlayPath="/play"
        // nicknameOverride prop 제거: 게이트가 자체 관리
        />
      )}
      <CapturePreview open={!!shotUrl} src={shotUrl} onClose={() => setShotUrl(null)} />
    </div>
  );
};

const MainHome: React.FC = () => {
  // 로그인 토큰 존재 여부로 Host/Guest 분기
  const { isAuthenticated } = useAuth();
  const { hostId } = useParams();
  const isShareView = !!hostId;
  const initialMode = isShareView ? 'guest' : (isAuthenticated ? 'host' : 'guest');

  return (
    <BirthdayModeProvider
      defaultMode={initialMode as 'host' | 'guest'}
      sharedHostId={hostId ?? null}
      key={`mode-${initialMode}-${hostId ?? 'self'}`}
    >
      {/* 공유 뷰에서는 생일자 온보딩 숨김(선택) */}
      {!isShareView && <OnboardingGate />}

      <MainHomeBody />
    </BirthdayModeProvider>
  );
};

export default MainHome;
