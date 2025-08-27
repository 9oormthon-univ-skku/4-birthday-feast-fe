import React, { useState } from 'react';
import Header from '../components/ui/Header';
import table from '../assets/images/table.svg';
import lBalloon from '../assets/images/left-balloon.svg';
import rBalloon from '../assets/images/right-balloon.svg';
import host from '../assets/images/host.svg';
import cake from '../assets/images/cake.svg';

import birthdayImg from '../assets/images/mainDummy.png';
import DrawerMenu from '../components/DrawerMenu';
import BottomSheet from '../components/BottomSheet';

const MainHome = () => {
  const [open, setOpen] = useState(false);

  // 데모용 랭킹 데이터
  const mock = Array.from({ length: 20 }).map((_, i) => ({
    id: i + 1,
    name: `${i + 1}등 사용자`,
    score: Math.round(100 - i * 2.5),
  }));

  return (
    <div className="w-screen h-screen bg-[#FFF4DF] flex flex-col relative">
      <Header />

      {/* 메인 이미지 영역 */}
      {/* 이 div를 relative로 만들고, balloon을 absolute로 배치합니다 */}
      <div className="w-full mt-auto relative"> {/* 여기에 relative 추가 */}
        <img src={table} alt="table" className="w-[100vw] object-cover relative z-10" />

        <img
          src={lBalloon}
          alt="lb"
          className="absolute transform -translate-y-3/4 left-[0px]  w-[clamp(160px,30vw,324px)] z-20" // absolute와 위치 조정
        />
        <img
          src={rBalloon}
          alt="rb"
          className="absolute transform -translate-y-3/4  right-[0px] w-[clamp(180px,34vw,360px)] z-20" // absolute와 위치 조정
        />
        <img
          src={host}
          alt=""
          className="absolute transform -translate-y-5/6 left-1/2 -translate-x-1/2 w-[clamp(220px,46vw,450px)] z-0"
        />
        <img
          src={cake}
          alt=""
          className="absolute transform -translate-y-3/5 left-1/2 -translate-x-1/2 w-[clamp(220px,46vw,450px)] z-20"
        />
      </div>

      {/* ✅ 화면 하단에 바텀시트 헤드가 노출 */}
      <BottomSheet title="방문자 퀴즈 랭킹" peekHeight={53} height="80vh">
        {/* 여기에 시트 본문 컨텐츠 */}
        {/* <YourContent /> */}
      </BottomSheet>

    </div>
  );
};

export default MainHome;
