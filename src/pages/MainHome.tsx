// src/pages/MainHome.tsx
import React, { useMemo, useState } from 'react';
import Header from '../components/Header'; // 프로젝트 경로에 맞게 유지하세요
import table from '../assets/images/table.svg';
import lBalloon from '../assets/images/left-balloon.svg';
import rBalloon from '../assets/images/right-balloon.svg';
import host from '../assets/images/host.svg';
import mainCake from '../assets/images/main-cake.svg';

// 폴백 이미지 (데이터 로딩 전/부족 시 사용)
import food1 from '../assets/images/food-1.svg';
import food2 from '../assets/images/food-2.svg';
import food3 from '../assets/images/food-3.svg';
import food4 from '../assets/images/food-4.svg';
import food5 from '../assets/images/food-5.svg';
import food6 from '../assets/images/food-6.svg';

// ✅ 커스텀 BottomSheet (Tailwind + framer-motion 버전)
// import BottomSheet from '@/components/BottomSheet.tailwind';

import TableCakes from '../features/message/TableCakes';
// 더미 메시지에서 카드 목록을 가져오는 훅(React Query 미사용 버전)
import { useBirthdayCards } from '@/features/message/useBirthdayCards';
import BottomSheet from '@/components/BottomSheet';

type CakeItem = { id: number | string; src: string; alt?: string };

const MainHome: React.FC = () => {
  // 헤더에서 열리는 Drawer/메뉴 등 외부 오버레이가 뜰 경우 바텀시트 숨김 처리
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 1) 더미 메시지(= messageCakes.js)에서 카드 데이터 가져오기
  const { data: cards = [] } = useBirthdayCards();

  // 2) 카드 → CakeItem으로 매핑 (앞에서 6개만 사용)
  //    데이터 없거나 6개 미만이면 food1~6으로 폴백 채움
  const cakes: CakeItem[] = useMemo(() => {
    const fallback = [food1, food2, food3, food4, food5, food6];
    const picked = cards.slice(0, 6);

    return Array.from({ length: 6 }).map((_, i) => {
      const c = picked[i];
      return c
        ? { id: c.birthdayCardId, src: c.imageUrl, alt: c.nickname }
        : { id: `fallback-${i + 1}`, src: fallback[i], alt: `디저트${i + 1}` };
    });
  }, [cards]);

  return (
    <div className="relative flex h-screen w-screen max-w-[520px] flex-col bg-[#FFF4DF]">
      {/* Header: 내부에서 메뉴/드로어 열릴 때 setDrawerOpen(true/false) 호출하도록 연결 */}
      <Header onDrawerOpenChange={setDrawerOpen} />

      {/* 메인 이미지 영역 */}
      <div className="relative mt-auto w-full">
        <img
          src={lBalloon}
          alt=""
          className="absolute left-0 z-30 -translate-y-[75%] transform"
        />
        <img
          src={rBalloon}
          alt=""
          className="absolute right-0 z-30 -translate-y-[75%] transform"
        />
        <img
          src={host}
          alt=""
          className="absolute left-1/2 z-0 -translate-x-1/2 -translate-y-[83%] transform"
        />
        <img
          src={mainCake}
          alt=""
          className="absolute left-1/2 z-20 -translate-x-1/2 -translate-y-[60%] transform drop-shadow-[0_8px_8px_rgba(0,0,0,0.15)]"
        />

        <div className="relative h-full w-full">
          <img src={table} alt="table" className="z-10 h-auto w-full" />
          {/* 케이크들: 더미 메시지의 이미지로 표시(부족분은 폴백) */}
          <TableCakes items={cakes} />
        </div>
      </div>

      {/* 하단 바텀시트 (Drawer/오버레이 열릴 땐 suspended로 숨김) */}
      <BottomSheet title="" suspended={drawerOpen} peekHeight={35} height="80vh">
        {/* ↓↓↓ 시트 내부 콘텐츠 예시 (필요 시 교체) ↓↓↓ */}
        <div className="mx-auto max-w-md space-y-3">
          <div className="text-center text-base font-semibold text-neutral-700">
            오늘의 추천
          </div>
          <ul className="space-y-2">
            {cakes.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-xl bg-white/80 p-3 shadow-sm"
              >
                <img src={c.src} alt={c.alt ?? ''} className="h-10 w-10 shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-bold text-neutral-900">
                    {c.alt ?? '달콤한 디저트'}
                  </div>
                  <div className="text-xs text-neutral-500">생일상에 살짝 올려둘까요?</div>
                </div>
                <button className="rounded-lg bg-[var(--brand-1,#0e7400)] px-3 py-1.5 text-xs font-bold text-white">
                  담기
                </button>
              </li>
            ))}
          </ul>
        </div>
      </BottomSheet>
    </div>
  );
};

export default MainHome;
