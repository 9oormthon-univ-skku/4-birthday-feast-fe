import { Drawer } from '@/ui/CustomDrawer';
import * as React from 'react';
import { motion } from 'framer-motion';

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
  /** 내부 상단 헤드(손잡이)를 눌러 닫기 허용 */
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
  // 외부에서 컨트롤하지 않으면 내부 상태로 제어
  const [uncontrolled, setUncontrolled] = React.useState(false);
  const open = controlledOpen ?? uncontrolled;
  const setOpen = (v: boolean) => (onOpenChange ? onOpenChange(v) : setUncontrolled(v));

  // 애니메이션 중에는 외부 헤드 숨기기
  const [isAnimating, setIsAnimating] = React.useState(false);

  // 패널 드래그 스냅백을 위한 값
  const [panelY, setPanelY] = React.useState(0);

  const handleKeyPressToClose = (e: React.KeyboardEvent) => {
    if (!closableHead) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(false);
    }
  };

  if (suspended) return null;

  // 드래그 임계값
  const OPEN_DRAG_THRESHOLD = 40;   // 닫힘 헤드에서 위로 40px 드래그 시 open
  const CLOSE_DRAG_THRESHOLD = 64;  // 열린 패널에서 아래로 64px 드래그 시 close
  const FAST_VELOCITY = 600;        // 빠른 스와이프 판정

  return (
    <>
      {/* 닫혀 있고 + 애니메이션 중 아님 → 외부 헤드 표시 (드래그 업으로 열기) */}
      {!open && !isAnimating && (
        <div
          className="fixed inset-x-0 bottom-0 z-1000 pointer-events-none"
          aria-hidden="true"
        >
          <motion.div
            className="pointer-events-auto relative mx-0 w-full rounded-t-2xl bg-white shadow-[0_-4px_4px_rgba(0,0,0,0.05)]"
            style={{
              height: `${peekHeight}px`,
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
            // 드래그로 열기
            drag="y"
            dragConstraints={{ top: -200, bottom: 0 }}
            dragElastic={0.02}
            dragMomentum={false}
            onDragStart={() => setIsAnimating(true)}
            onDragEnd={(_, info) => {
              setIsAnimating(false);
              // 위로 드래그 (offset.y는 음수), 또는 위 방향 빠른 스와이프
              if (info.offset.y < -OPEN_DRAG_THRESHOLD || info.velocity.y < -FAST_VELOCITY) {
                setOpen(true);
              }
            }}
            onClick={() => setOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setOpen(true);
              }
            }}
            aria-label="Open bottom sheet"
          >
            <div className="flex h-full items-center justify-center">
              {arrowUp}
            </div>
          </motion.div>
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
        {/* 드래그 가능한 패널 래퍼 */}
        <motion.div
          className="relative h-full overflow-visible"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          animate={{ y: panelY }}
          drag="y"
          // 열려 있을 때만 아래 방향으로 살짝 끌 수 있게 여유 제공
          dragConstraints={{ top: 0, bottom: 200 }}
          dragElastic={0.02}
          dragMomentum={false}
          onDragStart={() => {
            setIsAnimating(true);
          }}
          onDragEnd={(_, info) => {
            setIsAnimating(false);
            // 아래로 충분히 드래그 or 빠른 하향 스와이프 -> 닫기
            if (info.offset.y > CLOSE_DRAG_THRESHOLD || info.velocity.y > FAST_VELOCITY) {
              setOpen(false);
              setPanelY(0); // 다음 오픈 시 원위치
            } else {
              // 스냅백
              setPanelY(0);
            }
          }}
          // Drawer 자체 진입/퇴장 애니메이션 상태 추정
          onAnimationStart={() => setIsAnimating(true)}
          onAnimationComplete={() => setIsAnimating(false)}
        >
          {/* 내부 헤드(시트 상단 외부로 살짝 보이는 부분) — 클릭/키보드로 닫기 */}
          <div
            className={`relative mx-0 w-full rounded-t-2xl bg-white shadow-[0_-4px_4px_rgba(0,0,0,0.05)] ${closableHead ? 'cursor-pointer' : ''
              }`}
            style={{
              height: `${Math.max(36, peekHeight)}px`,
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
            role={closableHead ? 'button' : undefined}
            tabIndex={closableHead ? 0 : -1}
            aria-label={closableHead ? 'Close bottom sheet' : undefined}
            onClick={closableHead ? () => setOpen(false) : undefined}
            onKeyDown={handleKeyPressToClose}
          >
            <div className="flex h-full items-center justify-center">
              {arrowDown}
            </div>
          </div>

          {/* 본문 */}
          <div className="h-full overflow-auto px-8 py-3">{children}</div>
        </motion.div>
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
