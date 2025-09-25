// src/components/BottomSheet.tsx
import * as React from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { grey } from '@mui/material/colors';

type BottomSheetProps = {
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

export default function BottomSheet({
  open: controlledOpen,
  onOpenChange,
  peekHeight = 96,
  height = '64vh',
  title = '오늘의 추천',
  children,
  suspended = false,
}: BottomSheetProps) {
  // 외부에서 컨트롤하지 않으면 내부 상태로 제어
  const [uncontrolled, setUncontrolled] = React.useState(false);
  const open = controlledOpen ?? uncontrolled;
  const setOpen = (v: boolean) => (onOpenChange ? onOpenChange(v) : setUncontrolled(v));

  // 제스처/애니메이션 중에는 외부 헤드 숨기기
  const [isSwiping, setIsSwiping] = React.useState(false);
  const closeTimer = React.useRef<number | null>(null);
  const clearCloseTimer = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  if (suspended) return null;

  return (
    <>
      {/* 닫혀 있고 + 스와이프/애니메이션 중 아님 → 외부 헤드 표시 */}
      {!open && !isSwiping && (
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1300,
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: peekHeight,
              bgcolor: '#fff',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              boxShadow: '0 -6px 16px rgba(0,0,0,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pb: 'env(safe-area-inset-bottom)',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 44,
                height: 5,
                borderRadius: 999,
                backgroundColor: grey[300],
              }}
            />
            <Typography sx={{ fontSize: 14, color: '#666', fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
        </Box>
      )}

      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onOpen={() => {
          // 열림 완료
          clearCloseTimer();
          setIsSwiping(false);
          setOpen(true);
        }}
        onClose={() => {
          // 닫힘 시작: 외부 헤드 숨김 유지
          setIsSwiping(true);
          setOpen(false);
          // 혹시 transitionend 이벤트가 누락될 경우를 대비해 폴백
          clearCloseTimer();
          closeTimer.current = window.setTimeout(() => setIsSwiping(false), 350);
        }}
        disableSwipeToOpen={false}
        swipeAreaWidth={peekHeight}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          // 드로어 패널 전환 종료 시점 포착
          onTransitionEnd: (e: React.TransitionEvent<HTMLDivElement>) => {
            // transform 전환이 끝났고 현재는 '닫힌 상태'라면 외부 헤드 다시 보이도록
            if (e.target === e.currentTarget && e.propertyName === 'transform' && !open) {
              clearCloseTimer();
              setIsSwiping(false);
            }
          },
          // 열린 상태에서 끌어내릴 때도 숨김
          onTouchStart: () => setIsSwiping(true),
          onMouseDown: () => setIsSwiping(true),
          sx: {
            height: `calc(${height} - ${peekHeight}px)`,
            overflow: 'visible',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            backgroundColor: '#fff',
            zIndex: 1400,
            pb: 'env(safe-area-inset-bottom)',
          },
        }}
        SwipeAreaProps={{
          // 닫혀 있을 때 끌어올리는 동안도 숨김
          onTouchStart: () => setIsSwiping(true),
          onMouseDown: () => setIsSwiping(true),
          onTouchEnd: () => setIsSwiping(false),
          onMouseUp: () => setIsSwiping(false),
          onTouchCancel: () => setIsSwiping(false),
        }}
      >
        {/* 내부 헤드(드로어 위쪽에 붙어 보이는 바) */}
        <Box
          sx={{
            position: 'absolute',
            top: -peekHeight,
            left: 0,
            right: 0,
            py: 1.25,
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            bgcolor: '#fff',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 5,
              borderRadius: 999,
              backgroundColor: grey[300],
              mb: 10,
            }}
          />
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>{title}</Typography>
        </Box>

        {/* 본문 */}
        <Box sx={{ px: 2, pb: 2, height: '100%', overflow: 'auto' }}>{children}</Box>
      </SwipeableDrawer>
    </>
  );
}
