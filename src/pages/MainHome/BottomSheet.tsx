import { Drawer } from '@/ui/CustomDrawer';
import * as React from 'react';
import type { MotionProps } from 'framer-motion';

export type BottomSheetProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  peekHeight?: number;
  height?: string;
  title?: string;
  children?: React.ReactNode;
  suspended?: boolean;
  closableHead?: boolean;
};

export default function BottomSheet({
  open: controlledOpen,
  onOpenChange,
  peekHeight = 36,
  height = '80vh',
  title,
  children,
  suspended = false,
  closableHead = true,
}: BottomSheetProps) {
  const [uncontrolled, setUncontrolled] = React.useState(false);
  const open = controlledOpen ?? uncontrolled;
  const setOpen = (v: boolean) => (onOpenChange ? onOpenChange(v) : setUncontrolled(v));

  const [isAnimating, setIsAnimating] = React.useState(false);

  const handleKeyPressToClose = (e: React.KeyboardEvent) => {
    if (!closableHead) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(false);
    }
  };

  if (suspended) return null;

  // 드래그 임계값
  const OPEN_DRAG_THRESHOLD = 40;
  const CLOSE_DRAG_THRESHOLD = 64;
  const FAST_VELOCITY = 600;

  // ✅ 패널(=Drawer의 motion.div)에 적용할 모션 속성
  const panelMotionProps = React.useMemo<MotionProps | undefined>(() => {
    if (!open) return undefined;
    return {
      drag: 'y',
      dragConstraints: { top: 0, bottom: 200 },
      dragElastic: 0.02,
      dragMomentum: false,
      onDragStart: () => setIsAnimating(true),
      onDragEnd: (_e, info) => {
        setIsAnimating(false);
        if (info.offset.y > CLOSE_DRAG_THRESHOLD || info.velocity.y > FAST_VELOCITY) {
          setOpen(false);
        }
      },
      onAnimationStart: () => setIsAnimating(true),
      onAnimationComplete: () => setIsAnimating(false),
    };
  }, [open, setOpen]);

  return (
    <>
      {/* 닫혀 있고 + 애니메이션 중 아님 → 외부 헤드 (드래그 업으로 열기) */}
      {!open && !isAnimating && (
        <div className="fixed inset-x-0 bottom-0 z-1000 pointer-events-none" aria-hidden="true">
          <div
            className="pointer-events-auto relative mx-0 w-full rounded-t-2xl bg-white shadow-[0_-4px_4px_rgba(0,0,0,0.05)]"
            style={{ height: `${peekHeight}px`, paddingBottom: 'env(safe-area-inset-bottom)' }}
            role="button"
            tabIndex={0}
            aria-label="Open bottom sheet"
            onClick={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setOpen(true);
              }
            }}
            // 간단 제스처: 닫힌 헤드를 위로 드래그하면 열림
            onTouchStart={(e) => {
              const startY = e.touches[0].clientY;
              const onMove = (m: TouchEvent) => {
                const delta = m.touches[0].clientY - startY;
                if (delta < -OPEN_DRAG_THRESHOLD) {
                  setOpen(true);
                  window.removeEventListener('touchmove', onMove);
                  window.removeEventListener('touchend', onEnd);
                }
              };
              const onEnd = () => {
                window.removeEventListener('touchmove', onMove);
                window.removeEventListener('touchend', onEnd);
              };
              window.addEventListener('touchmove', onMove, { passive: true });
              window.addEventListener('touchend', onEnd);
            }}
          >
            <div className="flex h-full items-center justify-center">{arrowUp}</div>
          </div>
        </div>
      )}

      {/* 패널: 이제 패널 자체가 드래그됨 (배경 잔상 이슈 해결) */}
      <Drawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        size={height}
        ariaLabel="bottom sheet"
        panelMotionProps={panelMotionProps} // ✅ 추가: 패널 드래그는 여기로!
      >
        {/* 내부 헤드 — 클릭/키보드로 닫기 */}
        <div
          className={`relative mx-0 w-full rounded-t-2xl bg-white shadow-[0_-4px_4px_rgba(0,0,0,0.05)] ${closableHead ? 'cursor-pointer' : ''
            }`}
          style={{ height: `${Math.max(36, peekHeight)}px`, paddingBottom: 'env(safe-area-inset-bottom)' }}
          role={closableHead ? 'button' : undefined}
          tabIndex={closableHead ? 0 : -1}
          aria-label={closableHead ? 'Close bottom sheet' : undefined}
          onClick={closableHead ? () => setOpen(false) : undefined}
          onKeyDown={handleKeyPressToClose}
        >
          <div className="flex h-full items-center justify-center">{arrowDown}</div>
        </div>

        {/* 본문 */}
        <div className="h-full overflow-hidden px-8 py-3">{children}</div>
      </Drawer>
    </>
  );
}

// --------- 아이콘 svg ----------
const arrowUp = (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="12" viewBox="0 0 20 12" fill="none">
    <path d="M18 10L10 2L2 10" stroke="#D9D9D9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const arrowDown = (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="12" viewBox="0 0 20 12" fill="none">
    <path d="M2 2L10 10L18 2" stroke="#D9D9D9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
