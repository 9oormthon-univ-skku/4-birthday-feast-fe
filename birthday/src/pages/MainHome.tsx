import React, { useState } from 'react';
import Header from '../components/ui/Header';
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

import BottomSheet from '../components/BottomSheet';
import TableCakes from '../features/message/TableCakes';
// const foods = [
//   { id: 1, src: food },
//   { id: 2, src: '../assets/images/food-1.svg' },
//   { id: 3, src: '../assets/images/food-1.svg' },
//   { id: 4, src: '../assets/images/food-1.svg' },
//   { id: 5, src: '../assets/images/food-1.svg' },
//   { id: 6, src: '../assets/images/food-1.svg' }, // 최근 것들이 뒤에 온다고 가정
// ];
type CakeItem = { id: number; src: string; alt?: string };

const cakes: CakeItem[] = [
  { id: 1, src: food1, alt: '디저트1' },
  { id: 2, src: food2, alt: '디저트2' },
  { id: 3, src: food3, alt: '디저트3' },
  { id: 4, src: food4, alt: '디저트4' },
  { id: 5, src: food5, alt: '디저트5' },
  { id: 6, src: food6, alt: '디저트6' },
];


const MainHome = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 데모용 랭킹 데이터
  const mock = Array.from({ length: 20 }).map((_, i) => ({
    id: i + 1,
    name: `${i + 1}등 사용자`,
    score: Math.round(100 - i * 2.5),
  }));

  return (
    <div className="w-screen h-screen bg-[#FFF4DF] flex flex-col relative">
      <Header onDrawerOpenChange={setDrawerOpen} />

      {/* 메인 이미지 영역 */}
      {/* 이 div를 relative로 만들고, balloon을 absolute로 배치합니다 */}
      <div className="w-full mt-auto relative"> {/* 여기에 relative 추가 */}
        {/* <img src={table} alt="table" className="w-[100vw] object-cover relative z-10" /> */}

        <img
          src={lBalloon}
          alt="lb"
          className="absolute transform -translate-y-3/4 left-[0px]  w-[clamp(160px,30vw,324px)] z-30" 
        />
        <img
          src={rBalloon}
          alt="rb"
          className="absolute transform -translate-y-3/4  right-[0px] w-[clamp(180px,34vw,360px)] z-30" 
        />
        <img
          src={host}
          alt=""
          className="absolute transform -translate-y-5/6 left-1/2 -translate-x-1/2 w-[clamp(220px,46vw,450px)] z-0"
        />
        <img
          src={ mainCake}
          alt=""
          className="absolute transform -translate-y-3/5 left-1/2 -translate-x-1/2 w-[clamp(220px,46vw,450px)] z-11 drop-shadow-[0_8px_8px_rgba(0,0,0,0.15)]"
        />

        <div className="relative w-full h-full">
          <img src={table} alt="table" className="w-full h-auto z-10" />
          {/* 케이크들: 테이블 위 레이어 */}
          <TableCakes items={cakes} />
        </div>
      </div>

      {/* ✅ 화면 하단에 바텀시트 헤드가 노출 */}
      <BottomSheet title="방문자 퀴즈 랭킹" suspended={drawerOpen} peekHeight={53} height="80vh">
        {/* 여기에 시트 본문 컨텐츠 */}
        {/* <YourContent /> */}
      </BottomSheet>

    </div>
  );
};

export default MainHome;
