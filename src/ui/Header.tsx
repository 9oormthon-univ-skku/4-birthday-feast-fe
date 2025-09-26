// src/components/ui/Header.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DrawerMenu from './DrawerMenu';

export type HeaderProps = {
  /** 문자열뿐 아니라 JSX도 허용 (색상 하이라이트 등) */
  title?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  showMenu?: boolean;
  showBrush?: boolean;
  /** 브러시 클릭 핸들러(선택) */
  onBrushClick?: () => void;
  /** 기본 테마 페이지 경로 */
  themePath?: string;
  /** 우측에 추가 버튼/아이콘 넣고 싶을 때(선택) */
  rightExtra?: React.ReactNode;
  /** 헤더에서 열리는 드로어 상태를 부모에 통지 */
  onDrawerOpenChange?: (open: boolean) => void;
};

export default function Header({
  title,
  showBack = false,
  onBack,
  showMenu = true,
  showBrush = true,
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
      className="sticky top-0 z-50 w-full bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.05)] backdrop-blur"
      style={{ fontFamily: 'KoreanSWGIG3, Pretendard, sans-serif' }}
    >
      <div className="flex items-center justify-between px-7 py-4">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              type="button"
              aria-label="뒤로가기"
              onClick={handleBack}
              className="flex items-center justify-center rounded-full border border-transparent bg-transparent transition active:scale-95"
            >
              {backArrow}
            </button>
          )}

          {title ? (
            <h1 className="text-2xl font-normal leading-none">{title}</h1>
          ) : (
            <h1 className="text-2xl font-normal leading-none">
              <span className="text-[#FF8B8B]">사용자</span>
              <span className="text-[#A0A0A0]">님의 생일한상</span>
            </h1>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-6">
          {showBrush && (
            <button
              type="button"
              aria-label="테마 변경"
              onClick={handleBrush}
              className="flex items-center justify-center rounded-full border border-transparent bg-transparent transition active:scale-95"
            >
              {brushIcon}
            </button>
          )}

          {showMenu && (
            <>
              <button
                type="button"
                aria-label="메뉴 열기"
                onClick={() => setDrawer(true)}
                className="flex items-center justify-center rounded-full border border-transparent bg-transparent transition active:scale-95"
              >
                {menuIcon}
              </button>

              <DrawerMenu
                open={drawerOpen}
                onOpen={() => setDrawer(true)}
                onClose={() => setDrawer(false)}
                userName="사용자님"
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
                    default:
                      break;
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

const backArrow = <svg xmlns="http://www.w3.org/2000/svg" width="10" height="18" viewBox="0 0 10 18" fill="none">
  <path d="M8 2L0.999938 9.00006L8 16.0001" stroke="#A0A0A0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
</svg>
const brushIcon = <svg xmlns="http://www.w3.org/2000/svg" width="17" height="27" viewBox="0 0 17 27" fill="none">
  <path fillRule="evenodd" clipRule="evenodd" d="M13.515 -0.000244141H0.894737C0.398158 -0.000244141 0 0.400151 0 0.894493V15.9247C0 17.5066 1.2839 18.7892 2.86311 18.7892H5.36842V20.2083C5.36842 20.7809 5.1403 21.3303 4.73767 21.7356C4.73767 21.7356 4.47368 21.9302 4.47368 22.3946V24.1899C4.47368 25.6545 5.65918 26.8419 7.12655 26.8419C7.9855 26.8419 9.0145 26.8419 9.87345 26.8419C11.3408 26.8419 12.5263 25.6545 12.5263 24.1899V22.3682L12.4637 22.4313C12.5353 22.2165 12.5039 21.9772 12.2623 21.7356C11.8597 21.3303 11.6316 20.7809 11.6316 20.2083V18.7892H14.1369C15.7161 18.7892 17 17.5066 17 15.9247V3.48476C17 2.5605 16.6331 1.67425 15.98 1.02065C15.3268 0.367044 14.441 -0.000244141 13.515 -0.000244141ZM10.7368 22.7113V24.1899C10.7368 24.6663 10.3521 25.0524 9.87345 25.0524C9.0145 25.0524 7.9855 25.0524 7.12655 25.0524C6.64786 25.0524 6.26316 24.6663 6.26316 24.1899V22.7113C6.84026 22.0089 7.15789 21.1249 7.15789 20.2083V17.8945C7.15789 17.4002 6.75974 16.9998 6.26316 16.9998C6.26316 16.9998 4.39759 16.9998 2.86311 16.9998C2.27259 16.9998 1.78947 16.5184 1.78947 15.9247V14.3155H15.2105V15.9247C15.2105 16.5184 14.7274 16.9998 14.1369 16.9998C12.6024 16.9998 10.7368 16.9998 10.7368 16.9998C10.2403 16.9998 9.8421 17.4002 9.8421 17.8945C9.8421 17.8945 9.8421 19.1784 9.8421 20.2083C9.8421 21.1249 10.1597 22.0089 10.7368 22.7113ZM3.57895 1.78923H1.78947V12.5261H15.2105V3.48476C15.2105 3.03515 15.0315 2.60389 14.7139 2.28581C14.3963 1.96773 13.9668 1.78923 13.515 1.78923H11.6316V7.15765C11.6316 7.65155 11.2289 8.05239 10.7368 8.05239C10.2447 8.05239 9.8421 7.65155 9.8421 7.15765V1.78923H5.36842V4.92081C5.36842 5.4147 4.96579 5.81555 4.47368 5.81555C3.98158 5.81555 3.57895 5.4147 3.57895 4.92081V1.78923Z" fill="#A0A0A0" />
</svg>
const menuIcon = <svg xmlns="http://www.w3.org/2000/svg" width="19" height="12" viewBox="0 0 19 12" fill="none">
  <path d="M1.83333 11.5H17.1667C17.6938 11.5 18.125 11.0687 18.125 10.5417C18.125 10.0146 17.6938 9.58333 17.1667 9.58333H1.83333C1.30625 9.58333 0.875 10.0146 0.875 10.5417C0.875 11.0687 1.30625 11.5 1.83333 11.5ZM1.83333 6.70833H17.1667C17.6938 6.70833 18.125 6.27708 18.125 5.75C18.125 5.22292 17.6938 4.79167 17.1667 4.79167H1.83333C1.30625 4.79167 0.875 5.22292 0.875 5.75C0.875 6.27708 1.30625 6.70833 1.83333 6.70833ZM0.875 0.958333C0.875 1.48542 1.30625 1.91667 1.83333 1.91667H17.1667C17.6938 1.91667 18.125 1.48542 18.125 0.958333C18.125 0.43125 17.6938 0 17.1667 0H1.83333C1.30625 0 0.875 0.43125 0.875 0.958333Z" fill="#A0A0A0" />
</svg>
