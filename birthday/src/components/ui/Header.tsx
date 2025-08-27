import React, { useState } from 'react';
import menuIcon from '../../assets/images/menu.svg';
import brushIcon from '../../assets/images/brush.svg';
import DrawerMenu from '../DrawerMenu';

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 w-full bg-[#FFFFFF] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.05)] backdrop-blur"
      style={{ fontFamily: 'KoreanSWGIG1, Pretendard, sans-serif' }}
    >
      <div className="mx-[60px] max-w-md px-4 py-3 flex items-center justify-between">
        {/* Title */}
        <h1 className="text-[48px] my-[36px] leading-none font-bold tracking-tight">
          <span className="text-[#FF8B8B]">사용자</span>
          <span className="text-[#A0A0A0]">님의 생일한상</span>
        </h1>

        {/* Right icon group */}
        <div className="flex items-center gap-[28px]">
          {/* brush */}
          <button
            type="button"
            aria-label="테마 변경"
            className="p-2 rounded-full bg-transparent border border-transparent flex items-center justify-center hover:shadow-md active:scale-95 transition"
          >
            <img src={brushIcon} alt="" className="w-[34px] h-[52px]" />
          </button>

          {/* menu (hamburger) → Drawer 트리거 */}
          <button
            type="button"
            aria-label="메뉴 열기"
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-full bg-transparent border border-transparent flex items-center justify-center hover:shadow-md active:scale-95 transition"
          >
            <img src={menuIcon} alt="" className="w-[34px] h-[23px]" />
          </button>

          {/* Drawer: 원래 메뉴 + (옵션) 커스텀 섹션 */}
          <DrawerMenu
            open={drawerOpen}
            onOpen={() => setDrawerOpen(true)}
            onClose={() => setDrawerOpen(false)}
          >
            {/* 옵션: 여기에 추가 섹션을 넣으면 원래 메뉴 아래에 붙음 */}
            {/* <ul className="space-y-3">
              <li>홈</li>
              <li>내 정보</li>
              <li>설정</li>
            </ul> */}
          </DrawerMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
