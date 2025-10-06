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

import WelcomeModal from '@/features/home/WelcomeModal';
import NicknameModal from '@/features/auth/NicknameModal';
import CapturePreview from '@/features/home/CapturePreview';

import { useAuth } from '@/features/auth/useAuth';
import OnboardingGate from '@/features/onboarding/OnboardingGate';
import VisitorOnboardingGate from '@/features/visitorOnboarding/VisitorOnboardingGate';

const MainHomeBody: React.FC = () => {
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [nicknameOpen, setNicknameOpen] = useState(false);
  const [isIconView, setIsIconView] = useState(true);

  const { isHost, isGuest, sharedHostId } = useBirthdayMode();

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
            {/* 주석: 공유 모드라면 내부에서 sharedHostId로 데이터 로드하도록 수정 가능 */}
            {/* <MainFeast ownerId={sharedHostId ?? 'self'} /> */}
            <MainFeast />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-[520px] px-4 pb-3">
            {/* <MainList columns={4} ownerId={sharedHostId ?? 'self'} /> */}
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
  const { hostId } = useParams(); // ⬅️ URL 파라미터 읽기 (feast/:hostId 라우트에서만 존재)
  const isShareView = !!hostId;
  const initialMode = isShareView ? 'guest' : (isAuthenticated ? 'host' : 'guest');

  return (
    <BirthdayModeProvider
      defaultMode={initialMode as 'host' | 'guest'}
      sharedHostId={hostId ?? null}                  // ⬅️ 공유 대상 ID 주입
      key={`mode-${initialMode}-${hostId ?? 'self'}`} // 모드/대상 바뀌면 리마운트
    >
      {/* 공유 뷰에서는 생일자 온보딩을 숨겨 UX 단순화(선택) */}
      {!isShareView && <OnboardingGate />}

      <MainHomeBody />
    </BirthdayModeProvider>
  );
};

export default MainHome;
