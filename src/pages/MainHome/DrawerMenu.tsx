import * as React from 'react';
import { Drawer } from '../../ui/CustomDrawer';

export type DrawerMenuProps = {
  open: boolean;
  onOpen?: () => void;
  onClose: () => void;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
  /** 좌/우 드로어 폭 */
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
  width = '80vw',
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
      <div className="w-[80%] mx-auto flex h-full max-h-full flex-col bg-white">
        {/* 상단 사용자 영역 */}
        <div className="flex items-center gap-4 py-6 border-b border-[#D9D9D9]">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#D9D9D9] text-zinc-500 font-bold text-">사</div>
          <div className="text-xl font-bold text-[#FF8B8B]">{userName}</div>
        </div>

        {/* 1차 메뉴 */}
        <nav className='py-4'>
          <ul className="divide-y divide-neutral-50 rounded-xl bg-white">
            {primary.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => handleClick(item.key)}
                  className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-neutral-50"
                >
                  <span className="text-base font-semibold tracking-[0.02em] text-[#A0A0A0]">{item.label}</span>
                  <span aria-hidden className='pr-3'>
                    {rightArrow}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <hr className="my-4 border-t border-[#D9D9D9]" />

        {/* 2차 메뉴 */}
        <nav className="py-4">
          <ul className="divide-y divide-neutral-50 rounded-xl bg-white">
            {secondary.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => handleClick(item.key)}
                  className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-neutral-50"
                >
                  <span className="text-base font-semibold tracking-[0.02em] text-[#A0A0A0]">{item.label}</span>
                  <span aria-hidden className='pr-3'>
                    {rightArrow}
                  </span>
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

const rightArrow = <svg xmlns="http://www.w3.org/2000/svg" width="7" height="12" viewBox="0 0 7 12" fill="none">
  <path d="M1 11L6 6L1 0.999998" stroke="#A0A0A0" strokeLinecap="round" strokeLinejoin="round" />
</svg>