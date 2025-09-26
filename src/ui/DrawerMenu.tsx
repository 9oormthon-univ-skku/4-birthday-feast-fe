import * as React from 'react';
import { Drawer } from './CustomDrawer';
// import { Drawer } from '@/components/DrawerAnchor.tailwind';

export type DrawerMenuProps = {
  open: boolean;
  onOpen?: () => void;
  onClose: () => void;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
  /** 좌/우 드로어 폭, 기본 75vw */
  width?: number | string;
  /** 메뉴 선택 시 호출 (예: 'account', 'visibility' ...) */
  onSelect?: (key: string) => void;
  /** 상단 표시 이름 (기본: '사용자님') */
  userName?: string;
  /** 필요하면 하단에 추가 섹션을 넣고 싶을 때 사용 */
  children?: React.ReactNode;
};

const primary = [
  { key: 'account', label: '계정 설정' },
  { key: 'visibility', label: '생일상 공개 날짜' },
  { key: 'history', label: '지난 생일상 모아보기' },
  { key: 'qrcode', label: '내 생일상 큐알코드' },
  { key: 'quiz', label: '내 생일 퀴즈' },
];

const secondary = [
  { key: 'about', label: '생일한상 팀 소개' },
  { key: 'contact', label: '문의하기' },
];

export default function DrawerMenu({
  open,
  onOpen,
  onClose,  
  anchor = 'right',
  width = '75vw',
  userName = '사용자님',
  onSelect,
  children,
}: DrawerMenuProps) {
  const handleClick = (key: string) => {
    onSelect?.(key);
    onClose();
  };

  // SwipeableDrawer의 onOpen 대체: 외부에서 open=true로 변경되면 콜백 통지
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (!prevOpen.current && open) onOpen?.();
    prevOpen.current = open;
  }, [open, onOpen]);

  // Drawer size: 좌/우는 폭, 상/하는 높이 사용
  const size = ((): string | number => {
    if (anchor === 'left' || anchor === 'right') return typeof width === 'number' ? `${width}px` : width;
    return '56vh';
  })();

  return (
    <Drawer anchor={anchor} open={open} onClose={onClose} size={size} ariaLabel={`${anchor} menu`}>
      <div className="flex h-full max-h-full flex-col bg-white">
        {/* 상단 사용자 영역 */}
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#FFE1E1] text-sm font-bold text-[#FF8B8B]">사</div>
          <div className="text-xl font-bold text-[#FF8B8B]">{userName}</div>
        </div>

        {/* 1차 메뉴 */}
        <nav className="px-1">
          <ul className="divide-y divide-neutral-100 rounded-xl bg-white">
            {primary.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => handleClick(item.key)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-neutral-50"
                >
                  <span className="text-base font-[600] tracking-[0.02em] text-[#A0A0A0]">{item.label}</span>
                  <span aria-hidden className="text-neutral-300">›</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <hr className="my-4 border-t border-neutral-100" />

        {/* 2차 메뉴 */}
        <nav className="px-1">
          <ul className="divide-y divide-neutral-100 rounded-xl bg-white">
            {secondary.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => handleClick(item.key)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-neutral-50"
                >
                  <span className="text-base font-[600] tracking-[0.02em] text-[#A0A0A0]">{item.label}</span>
                  <span aria-hidden className="text-neutral-700">›</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* (선택) 추가 섹션 */}
        {children && (
          <>
            <hr className="my-4 border-t border-neutral-100" />
            <div className="px-4 py-3">{children}</div>
          </>
        )}
      </div>
    </Drawer>
  );
}
