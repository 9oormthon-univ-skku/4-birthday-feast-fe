import React, { useEffect, useState } from 'react';
import Header from '../ui/Header';
import BottomSheet from '@/ui/BottomSheet';;

import { BirthdayModeProvider, useBirthdayMode } from '@/features/home/ModeContext';
import ModeToggle from '@/features/home/ModeToggle';
import ViewToggle from '@/features/home/ViewToggle';
import FeatureButtons from '@/features/home/FeatureButtons';
import EventBanner from '@/features/event/EventBanner';

import MainFeast from '@/features/message/MainFeast';
import MainList from '@/features/message/MainList';

import FooterButton from '@/ui/FooterButton';
import { useNavigate } from 'react-router-dom';
import QuizRankList from '@/features/quiz/QuizRankList';
import WelcomeModal from '@/features/home/WelcomeModal';
import NicknameModal from '@/features/auth/NicknameModal';

const MainHomeBody: React.FC = () => {
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [nicknameOpen, setNicknameOpen] = useState(false);
  const [isIconView, setIsIconView] = useState(true);

  useEffect(() => { setWelcomeOpen(true); }, []);

  const { isHost, isGuest } = useBirthdayMode();

  // 닉네임 저장 처리 
  const handleNicknameSubmit = (nickname: string) => {
    // 예시: 로컬 저장 또는 API 호출
    try {
      localStorage.setItem('guest_nickname', nickname);
    } catch { }
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
          {isHost && <FeatureButtons />}
        </div>

        {isHost && (
          <div className="shrink-0">
            <EventBanner />
          </div>
        )}
      </div>

      {/* 메인 영역 토글: 아이콘(Feast) vs 리스트 */}
      {isIconView ? (
        <div className="w-full mt-auto flex justify-center">
          <MainFeast />
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[520px] px-4 pb-3">
          <MainList columns={4} />
        </div>
      )}

      <BottomSheet>
        <h2 className='my-2 text-[#FF8B8B] text-xl font-bold'>방문자 퀴즈 랭킹</h2>
        <QuizRankList />
      </BottomSheet>

      {(isGuest && !drawerOpen) && (
        <footer className="fixed bottom-8 left-0 right-0 z-100 flex justify-center bg-transparent">
          <div className="w-full max-w-[520px] px-8 py-4 pt-15 pb-[env(safe-area-inset-bottom)]">
            <FooterButton
              label="사용자님에게 생일 메시지 남기기"
              onClick={() => navigate('/write')}
            />
          </div>
        </footer>
      )}

      <WelcomeModal
        open={welcomeOpen}
        isHost={isHost}
        onClose={() => {
          setWelcomeOpen(false);
          if (isGuest) setNicknameOpen(true);
        }}
      />
      <NicknameModal
        open={isGuest && nicknameOpen}
        defaultValue={localStorage.getItem('guest_nickname') || ''}
        onSubmit={handleNicknameSubmit}
        onClose={() => setNicknameOpen(false)}
      />
    </div>

  );
};

const MainHome: React.FC = () => (
  <BirthdayModeProvider defaultMode="guest">
    <MainHomeBody />
  </BirthdayModeProvider>
);

export default MainHome;
