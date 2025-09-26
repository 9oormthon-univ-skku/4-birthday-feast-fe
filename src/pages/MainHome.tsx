// src/pages/MainHome.tsx
import React, { useMemo, useState } from 'react';
import Header from '../layouts/Header';
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

import BottomSheet from '../components/BottomSheet';
import TableCakes from '../features/message/TableCakes';

// 더미 메시지에서 카드 목록을 가져오는 훅(React Query 미사용 버전)
import { useBirthdayCards } from '@/features/message/useBirthdayCards';

type CakeItem = { id: number | string; src: string; alt?: string };

const MainHome = () => {
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
    <div className="w-screen h-screen max-w-[520px] bg-[#FFF4DF] flex flex-col relative">
      <Header onDrawerOpenChange={setDrawerOpen} />

      {/* 메인 이미지 영역 */}
      <div className="w-full mt-auto relative">
        <img
          src={lBalloon} alt=""
          className="absolute transform -translate-y-[75%] left-[0px]  z-30"
        />
        <img
          src={rBalloon} alt=""
          className="absolute transform -translate-y-[75%] right-[0px] z-30"
        />
        <img
          src={host} alt=""
          className="absolute transform -translate-y-[83%] left-[50%] -translate-x-[50%] z-0"
        />
        <img
          src={mainCake} alt=""
          className="absolute transform -translate-y-[60%] left-[50%] -translate-x-[50%] z-20 drop-shadow-[0_8px_8px_rgba(0,0,0,0.15)]"
        />

        <div className="relative w-full h-full">
          <img src={table} alt="table" className="w-full h-auto z-10" />
          {/* 케이크들: 더미 메시지의 이미지로 표시(부족분은 폴백) */}
          <TableCakes items={cakes} />
        </div>
      </div>

      {/* 하단 바텀시트 */}
      <BottomSheet title="" suspended={drawerOpen} peekHeight={90} height="80vh">
        {/* <YourContent /> */}
      </BottomSheet>
    </div>
  );
};

export default MainHome;
