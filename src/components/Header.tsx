// src/components/ui/Header.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import menuIcon from '@/assets/images/menu.svg';
import brushIcon from '@/assets/images/brush.svg';
import backArrow from '@/assets/images/nav-arrow-left.svg';
import DrawerMenu from '@/components/DrawerMenu';

export type HeaderProps = {
  /** 문자열뿐 아니라 JSX도 허용 (색상 하이라이트 등) */
  title?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  showMenu?: boolean;
  showBrush?: boolean;
  /** 홈 스타일(대형) vs 컴팩트 */
  compact?: boolean;
  /** 브러시 클릭 핸들러(선택) */
  onBrushClick?: () => void;
  /** 기본 테마 페이지 경로 */
  themePath?: string;
  /** 우측에 추가 버튼/아이콘 넣고 싶을 때(선택) */
  rightExtra?: React.ReactNode;
  onDrawerOpenChange?: (open: boolean) => void;
};

export default function Header({
  title,
  showBack = false,
  onBack,
  showMenu = true,
  showBrush = true,
  compact = false,
  onBrushClick,
  themePath = '/theme',
  rightExtra,
  onDrawerOpenChange,
}: HeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const setDrawer = (open: boolean) => {
    setDrawerOpen(open);
    onDrawerOpenChange?.(open);
  };

  const handleBack = () => (onBack ? onBack() : navigate(-1));
  const handleBrush = () => (onBrushClick ? onBrushClick() : navigate(themePath));

  const titleCls = 'text-[24px] leading-none font-bold tracking-tight';

  return (
    <header
      className="sticky top-0 z-50 w-full bg-[#FFFFFF] shadow-[0px_8px_8px_0px_rgba(0,0,0,0.07)] backdrop-blur"
      style={{ fontFamily: 'KoreanSWGIG1, Pretendard, sans-serif' }}
    >
      <div className={`flex items-center justify-between p-4`}>
        {/* Left: Back + Title */}
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              type="button"
              aria-label="뒤로가기"
              onClick={handleBack}
              className="rounded-full bg-transparent border border-transparent flex items-center justify-center hover:shadow-md active:scale-95 transition"
            >
              <img
                src={backArrow}
                alt="뒤로가기"
                className={compact ? 'w-6 h-6' : 'w-[24px] h-[24px]'}
              />
            </button>
          )}

          {title ? (
            <h1 className={titleCls}>{title}</h1>
          ) : (
            <h1 className={titleCls}>
              <span className="text-[#FF8B8B]">사용자</span>
              <span className="text-[#A0A0A0]">님의 생일한상</span>
            </h1>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-[20px]">
          {showBrush && (
            <button
              type="button"
              aria-label="테마 변경"
              onClick={handleBrush}
              className=" rounded-full bg-transparent border border-transparent flex items-center justify-center hover:shadow-md active:scale-95 transition"
            >
              <img src={brushIcon} alt="테마 변경" className={'w-[17px] h-[26px]'} />
            </button>
          )}

          {showMenu && (
            <>
              <button
                type="button"
                aria-label="메뉴 열기"
                onClick={() => setDrawer(true)}
                className=" rounded-full bg-transparent border border-transparent flex items-center justify-center hover:shadow-md active:scale-95 transition"
              >
                <img src={menuIcon} alt="메뉴" className={'w-[17px] h-[12px]'} />
              </button>

              <DrawerMenu
                open={drawerOpen}
                onOpen={() => setDrawer(true)}
                onClose={() => setDrawer(false)}
                onSelect={(key) => {
                  switch (key) {
                    case 'about':
                      navigate('/about-team');
                      break;
                    case 'contact':
                      navigate('/contact');
                      break;
                    case 'quiz':
                      navigate('/quiz');
                      break;
                    case 'qrcode':
                      navigate('/my-feast-qr');
                      break;
                    case 'history':
                      navigate('/history');
                      break;
                    case 'visibility':
                      navigate('/visibility');
                      break;
                    case 'account':
                      navigate('/account');
                      break;
                    // 필요 시 다른 항목 라우팅 추가
                  }
                }}
              />
            </>
          )}

          {/* 우측 커스텀 슬롯 (예: 편집 아이콘 등) */}
          {rightExtra}
        </div>
      </div>
    </header>
  );
}
