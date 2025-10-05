import React, { useEffect, useMemo, useState } from 'react';
import Header from '../ui/Header';
import BottomSheet from '@/ui/BottomSheet';
import Modal from '@/ui/Modal';

import { BirthdayModeProvider, ModeGate, useBirthdayMode } from '@/features/home/ModeContext';
import ModeToggle from '@/features/home/ModeToggle';
import ViewToggle from '@/features/home/ViewToggle';
import FeatureButtons from '@/features/home/FeatureButtons';
import EventBanner from '@/features/event/EventBanner';

import MainFeast from '@/features/message/MainFeast';
import MainList from '@/features/message/MainList';

import { useBirthdayCards } from '@/features/message/useBirthdayCards';
import food1 from '../assets/images/food-1.svg';
import food2 from '../assets/images/food-2.svg';
import food3 from '../assets/images/food-3.svg';
import food4 from '../assets/images/food-4.svg';
import food5 from '../assets/images/food-5.svg';
import food6 from '../assets/images/food-6.svg';
import FooterButton from '@/ui/FooterButton';
import { useNavigate } from 'react-router-dom';
import QuizRankList from '@/features/quiz/QuizRankList';
import WelcomeModal from '@/features/home/WelcomeModal';

type CakeItem = { id: number | string; src: string; alt?: string };

const MainHomeBody: React.FC = () => {
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [isIconView, setIsIconView] = useState(true);

  useEffect(() => { setWelcomeOpen(true); }, []);

  const { data: cards = [] } = useBirthdayCards();

  const cakes: CakeItem[] = useMemo(() => {
    const fallback = [food1, food2, food3, food4, food5, food6];
    const mapped = cards.map((c: any, idx: number) => ({
      id: c.birthdayCardId ?? `card-${idx}`,
      src: c.imageUrl,
      alt: c.nickname,
    }));
    if (mapped.length >= 6) return mapped;
    const need = Math.max(0, 6 - mapped.length);
    const fills = Array.from({ length: need }).map((_, i) => ({
      id: `fallback-${i + 1}`,
      src: fallback[i],
      alt: `디저트${i + 1}`,
    }));
    return [...mapped, ...fills];
  }, [cards]);

  const { isHost, isGuest } = useBirthdayMode();


  return (
    <div className="relative flex h-screen w-screen max-w-[520px] flex-col bg-[#FFF4DF]">
      <ModeToggle className="absolute right-3 top-30 z-[60]" />
      {/* <DevPlayQuizButton /> */}
      


      <Header onDrawerOpenChange={setDrawerOpen} showBrush={isHost} />

      {/* 상단 컨트롤 바 */}
      <div className="z-100 mx-auto my-4 flex w-[90%] items-center justify-between gap-3">
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
        <MainFeast />
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
        onClose={() => setWelcomeOpen(false)}
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
