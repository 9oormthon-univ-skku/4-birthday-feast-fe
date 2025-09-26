import * as React from 'react';
import { Drawer } from './Drawer';
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
  height = '64vh',
  title = '오늘의 추천',
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
          className="fixed inset-x-0 bottom-0 z-[1300] pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="pointer-events-auto relative mx-0 w-full bg-white shadow-[0_-6px_16px_rgba(0,0,0,0.12)]"
            style={{
              height: peekHeight,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              paddingBottom: 'env(safe-area-inset-bottom)'
            }}
            onClick={() => setOpen(true)}
            role="button"
            tabIndex={0}
          >
            <div
              className="absolute left-1/2 top-2 h-[5px] w-11 -translate-x-1/2 rounded-full bg-neutral-300"
            />
            <div className="flex h-full items-center justify-center">
              <span className="text-[14px] font-semibold text-neutral-600">{title}</span>
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
          className="relative h-full overflow-visible bg-white"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          // 애니메이션 시작/끝 추정 (Framer Motion hook 없이 간단히 처리)
          onAnimationStart={() => setIsAnimating(true)}
          onAnimationEnd={() => setIsAnimating(false)}
        >
          {/* 내부 헤드(시트 상단 외부로 살짝 보이는 부분) */}
          <div
            className="absolute inset-x-0 -top-[--peek] flex flex-col items-center bg-white"
            style={{
              // Tailwind CSS 에서 CSS 변수 사용 (동적으로 높이 전달)
              // @ts-expect-error -- custom property for runtime
              '--peek': `${peekHeight}px`,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              paddingTop: 5,
              paddingBottom: 10,
            }}
          >
            <div className="mb-2 h-[5px] w-11 rounded-full bg-neutral-300" />
            <div className="text-[14px] text-neutral-500">{title}</div>
          </div>

          {/* 본문 */}
          <div className="h-full overflow-auto px-4 pb-4 pt-4">{children}</div>
        </div>
      </Drawer>
    </>
  );
}
