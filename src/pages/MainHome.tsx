// src/pages/MainHome.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Header from '../ui/Header';
import table from '../assets/images/table.svg';
import lBalloon from '../assets/images/left-balloon.svg';
import rBalloon from '../assets/images/right-balloon.svg';
import host from '../assets/images/host.svg';
import mainCake from '../assets/images/main-cake.svg';

import food1 from '../assets/images/food-1.svg';
import food2 from '../assets/images/food-2.svg';
import food3 from '../assets/images/food-3.svg';
import food4 from '../assets/images/food-4.svg';
import food5 from '../assets/images/food-5.svg';
import food6 from '../assets/images/food-6.svg';

import TableCakes from '../features/message/TableCakes';
import { useBirthdayCards } from '@/features/message/useBirthdayCards';
import BottomSheet from '@/ui/BottomSheet';
import Modal from '@/ui/Modal';

import { BirthdayModeProvider, ModeGate, useBirthdayMode } from '@/features/home/ModeContext';
import ModeToggle from '@/features/home/ModeToggle';
import ViewToggle from '@/features/home/ViewToggle';
import FeatureButtons from '@/features/home/FeatureButtons';
import EventBanner from '@/features/event/EventBanner';

type CakeItem = { id: number | string; src: string; alt?: string };

const MainHomeBody: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [welcomeOpen, setWelcomeOpen] = useState(false);
  useEffect(() => {
    setWelcomeOpen(true);
  }, []);

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

  // ⬇️ 모드별 분기 데이터/문구
  const { isHost, isGuest } = useBirthdayMode();

  const welcomeMessage = isHost ? (
    "생일한상에 오신 것을 환영합니다!\n\n생일상을 꾸미고 공유해서\n친구들에게 생일축하를 받아보아요!\n\n생일축하 메시지는 14일 전부터\n등록할 수 있으며,\n생일 당일에 공개됩니다!"
  ) : (
    <>
      생일한상에 오신 것을 환영합니다, <b>게스트</b>님!<br />
      <br />
      축하 메시지와 디저트를 남겨 생일자를 빛나게 해주세요.
      <br />
      <br />
      메시지는 <b>생일 14일 전</b>부터 남길 수 있고, 공개는 <b>당일</b>에 이루어져요.
    </>
  );

  const bottomSheetTitle = isHost ? '호스트 추천 액션' : '오늘의 추천';
  const primaryActionLabel = isHost ? '상에 올리기' : '담기';

  return (
    <div className="relative flex h-screen w-screen max-w-[520px] flex-col bg-[#FFF4DF]">
      {/* 개발용: 빠른 전환 버튼 */}
      <ModeToggle className="absolute right-3 top-50 z-[60]" />

      <Header onDrawerOpenChange={setDrawerOpen} showBrush={isHost} />
      <div className="z-100 flex w-[90%] mx-auto my-5 items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <ViewToggle />
          <FeatureButtons />
        </div>
        <div className="shrink-0">
          <EventBanner />
        </div>
      </div>



      {/* 메인 이미지 영역 */}
      <div className="relative mt-auto w-full">
        <img src={lBalloon} alt="" className="absolute left-0 z-30 -translate-y-[75%] transform" />
        <img src={rBalloon} alt="" className="absolute right-0 z-30 -translate-y-[75%] transform" />
        <img src={host} alt="" className="absolute left-1/2 z-0 -translate-x-1/2 -translate-y-[83%] transform" />
        <img
          src={mainCake}
          alt=""
          className="absolute left-1/2 z-20 -translate-x-1/2 -translate-y-[60%] transform drop-shadow-[0_8px_8px_rgba(0,0,0,0.15)]"
        />

        <div className="relative h-full w-full">
          <img src={table} alt="table" className="z-10 h-auto w-full" />
          <TableCakes items={cakes} />
        </div>
      </div>

      {/* 하단 바텀시트: 모드별로 다른 콘텐츠 */}
      <BottomSheet title={bottomSheetTitle} suspended={drawerOpen} peekHeight={35} height="80vh">
        <ModeGate
          host={
            <div className="mx-auto max-w-md space-y-3">
              <ul className="space-y-2">
                <li className="rounded-xl bg-white/80 p-4 shadow-sm">
                  <div className="text-sm font-bold text-neutral-900">초대 링크 만들기</div>
                  <div className="text-xs text-neutral-500 mt-1">링크를 공유해 메시지를 모아보세요.</div>
                  <div className="mt-2">
                    <button className="rounded-lg bg-[var(--brand-1,#0e7400)] px-3 py-1.5 text-xs font-bold text-white">
                      링크 생성
                    </button>
                  </div>
                </li>
                <li className="rounded-xl bg-white/80 p-4 shadow-sm">
                  <div className="text-sm font-bold text-neutral-900">메시지 검수</div>
                  <div className="text-xs text-neutral-500 mt-1">부적절한 메시지는 숨길 수 있어요.</div>
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
                  <li key={c.id} className="flex items-center gap-3 rounded-xl bg白/80 p-3 shadow-sm bg-white/80">
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

// 최상위에서 Provider로 감싸기
const MainHome: React.FC = () => {
  return (
    <BirthdayModeProvider defaultMode="guest">
      <MainHomeBody />
    </BirthdayModeProvider>
  );
};

export default MainHome;
