import * as React from 'react';
import { Drawer } from './CustomDrawer';
// import { Drawer } from '@/components/DrawerAnchor.tailwind';

export type BottomSheetProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 닫혀 있을 때 살짝 보이는 헤드 높이(px) */
  peekHeight?: number;
  /** 펼친 시트의 전체 높이 (예: '64vh') */
  height?: string;
  title?: string;
  children?: React.ReactNode;
  /** true면 아예 렌더링하지 않음(드로어가 떠야할 때 숨김 처리용) */
  suspended?: boolean;
};

/**
 * Material UI 의 SwipeableDrawer 대신, 커스텀 Drawer(Framer Motion)로 구성한 BottomSheet
 * - 스와이프 제스처는 제공하지 않지만, 동일한 props API(open/onOpenChange/peek) 유지
 * - 외부/내부 헤드 모두 Tailwind 로 구현
 */
export default function BottomSheet({
  open: controlledOpen,
  onOpenChange,
  peekHeight = 50,
  height = '80vh',
  children,
  suspended = false,
}: BottomSheetProps) {
  // 외부에서 컨트롤하지 않으면 내부 상태로 제어
  const [uncontrolled, setUncontrolled] = React.useState(false);
  const open = controlledOpen ?? uncontrolled;
  const setOpen = (v: boolean) => (onOpenChange ? onOpenChange(v) : setUncontrolled(v));

  // 제스처/애니메이션 중에는 외부 헤드 숨기기 (애니메이션 기반이라 간단 플래그만 유지)
  const [isAnimating, setIsAnimating] = React.useState(false);

  if (suspended) return null;

  return (
    <>
      {/* 닫혀 있고 + 애니메이션 중 아님 → 외부 헤드 표시 */}
      {!open && !isAnimating && (
        <div
          className="fixed inset-x-0 bottom-0 z-1000 pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="pointer-events-auto relative mx-0 w-full h-9 rounded-t-2xl bg-white shadow-[0_-4px_4px_rgba(0,0,0,0.05)]"
            style={{
              paddingBottom: 'env(safe-area-inset-bottom)'
            }}
            onClick={() => setOpen(true)}
            role="button"
            tabIndex={0}
          >
            <div className="flex h-full items-center justify-center">
              {arrowUp}
            </div>
          </div>
        </div>
      )}

      {/* 패널: 커스텀 Drawer 사용 */}
      <Drawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        size={height}
        ariaLabel="bottom sheet"
      >
        <div
          className="relative h-full overflow-visible"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          // 애니메이션 시작/끝 추정 (Framer Motion hook 없이 간단히 처리)
          onAnimationStart={() => setIsAnimating(true)}
          onAnimationEnd={() => setIsAnimating(false)}
        >
          {/* 내부 헤드(시트 상단 외부로 살짝 보이는 부분) */}
          <div
            className="pointer-events-auto relative mx-0 w-full h-9 rounded-t-2xl bg-white shadow-[0_-4px_4px_rgba(0,0,0,0.05)]"
            style={{
              paddingBottom: 'env(safe-area-inset-bottom)'
            }}
          >
            <div className="flex h-full items-center justify-center">
              {arrowDown}
            </div>
          </div>

          {/* 본문 */}
          <div className="h-full overflow-auto px-8 py-1">{children}</div>
        </div>
      </Drawer>
    </>
  );
}

// --------- 아이콘 svg ----------
const arrowUp = <svg xmlns="http://www.w3.org/2000/svg" width="20" height="12" viewBox="0 0 20 12" fill="none">
  <path d="M18 10L10 2L2 10" stroke="#D9D9D9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
</svg>

const arrowDown = <svg xmlns="http://www.w3.org/2000/svg" width="20" height="12" viewBox="0 0 20 12" fill="none">
  <path d="M2 2L10 10L18 2" stroke="#D9D9D9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
