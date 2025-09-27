// src/pages/MainHome.tsx
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
import DevPlayQuizButton from '@/features/quiz/DevPlayQuizButton';

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

  const welcomeMessage = isHost
    ? "생일한상에 오신 것을 환영합니다!\n\n생일상을 꾸미고 공유해서\n친구들에게 생일축하를 받아보아요!\n\n생일축하 메시지는 14일 전부터\n등록할 수 있으며,\n생일 당일에 공개됩니다!"
    : (
      <>
        생일한상에 오신 것을 환영합니다, <b>게스트</b>님!<br /><br />
        축하 메시지와 디저트를 남겨 생일자를 빛나게 해주세요.<br /><br />
        메시지는 <b>생일 14일 전</b>부터 남길 수 있고, 공개는 <b>당일</b>에 이루어져요.
      </>
    );

  const bottomSheetTitle = isHost ? '호스트 추천 액션' : '오늘의 추천';
  const primaryActionLabel = isHost ? '상에 올리기' : '담기';

  return (
    <div className="relative flex h-screen w-screen max-w-[520px] flex-col bg-[#FFF4DF]">
      <ModeToggle className="absolute right-3 top-30 z-[60]" />
      <DevPlayQuizButton />


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

      {/* 바텀시트(기존 로직 그대로) */}
      <BottomSheet title={bottomSheetTitle} suspended={drawerOpen} peekHeight={35} height="80vh">
        <ModeGate
          host={
            <div className="mx-auto max-w-md space-y-3">
              <ul className="space-y-2">
                <li className="rounded-xl bg-white/80 p-4 shadow-sm">
                  <div className="text-sm font-bold text-neutral-900">초대 링크 만들기</div>
                  <div className="mt-1 text-xs text-neutral-500">링크를 공유해 메시지를 모아보세요.</div>
                  <div className="mt-2">
                    <button className="rounded-lg bg-[var(--brand-1,#0e7400)] px-3 py-1.5 text-xs font-bold text-white">
                      링크 생성
                    </button>
                  </div>
                </li>
                <li className="rounded-xl bg-white/80 p-4 shadow-sm">
                  <div className="text-sm font-bold text-neutral-900">메시지 검수</div>
                  <div className="mt-1 text-xs text-neutral-500">부적절한 메시지는 숨길 수 있어요.</div>
                  <div className="mt-2">
                    <button className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white">
                      검수하러 가기
                    </button>
                  </div>
                </li>
              </ul>

              <div className="pt-2 text-center text-sm font-semibold text-neutral-700">추천 디저트</div>
              <ul className="space-y-2">
                {cakes.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 rounded-xl bg-white/80 p-3 shadow-sm">
                    <img src={c.src} alt={c.alt ?? ''} className="h-10 w-10 shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-bold text-neutral-900">{c.alt ?? '달콤한 디저트'}</div>
                      <div className="text-xs text-neutral-500">생일상에 올려서 구성 완성하기</div>
                    </div>
                    <button className="rounded-lg bg-[var(--brand-1,#0e7400)] px-3 py-1.5 text-xs font-bold text-white">
                      {primaryActionLabel}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          }
          guest={
            <div className="mx-auto max-w-md space-y-3">
              <div className="text-center text-base font-semibold text-neutral-700">오늘의 추천</div>
              <ul className="space-y-2">
                {cakes.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 rounded-xl bg-white/80 p-3 shadow-sm">
                    <img src={c.src} alt={c.alt ?? ''} className="h-10 w-10 shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-bold text-neutral-900">{c.alt ?? '달콤한 디저트'}</div>
                      <div className="text-xs text-neutral-500">생일상에 살짝 올려둘까요?</div>
                    </div>
                    <button className="rounded-lg bg-[var(--brand-1,#0e7400)] px-3 py-1.5 text-xs font-bold text-white">
                      {primaryActionLabel}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          }
        />
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

      <Modal
        open={welcomeOpen}
        type="welcome"
        highlightText={isHost ? '사용자' : '게스트'}
        message={welcomeMessage}
        helperText={isHost ? '공개 기간은 설정할 수 있어요.' : '공개 범위는 호스트가 설정해요.'}
        onConfirm={() => setWelcomeOpen(false)}
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
