import React from 'react';
import menuIcon from '../../assets/images/menu.svg';
import brushIcon from '../../assets/images/brush.svg';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#FFF6EC]/90 border-b border-[#EFD9C6] backdrop-blur"
    style={{
          fontFamily: 'KoreanSWGIG1, Pretendard, sans-serif',
          lineHeight: '148px', // Figma 상 전체 텍스트 높이
        }}>
      <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
        {/* Title */}
        <h1 className="text-[48px] leading-none font-bold tracking-tight">
          <span className="text-[#FF8B8B]">사용자</span>
          <span className="text-[#A0A0A0]">님의 생일한상</span>
        </h1>

        {/* Right icon group */}
        <div className="flex items-center gap-2">
          {/* brush */}
          <button
            type="button"
            aria-label="테마 변경"
            className="w-8 h-8 rounded-full bg-white/90 border border-[#F0D9C8] shadow-sm flex items-center justify-center hover:shadow-md active:scale-95 transition"
          >
            <img src={brushIcon} alt="" className="w-4 h-4" />
          </button>

          {/* menu (hamburger) */}
          <button
            type="button"
            aria-label="메뉴 열기"
            className="w-8 h-8 rounded-full bg-white/90 border border-[#F0D9C8] shadow-sm flex items-center justify-center hover:shadow-md active:scale-95 transition"
          >
            <img src={menuIcon} alt="" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
