import * as React from 'react';
import { Global } from '@emotion/react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { grey } from '@mui/material/colors';

type BottomSheetProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  peekHeight?: number;
  height?: string;
  title?: string;
  children?: React.ReactNode;
};

export default function BottomSheet({
  open: controlledOpen,
  onOpenChange,
  peekHeight = 96,
  height = '64vh',
  title = '오늘의 추천',
  children,
}: BottomSheetProps) {
  const [uncontrolled, setUncontrolled] = React.useState(false);
  const open = controlledOpen ?? uncontrolled;
  const setOpen = (v: boolean) => (onOpenChange ? onOpenChange(v) : setUncontrolled(v));

  // ✅ 스와이프 감지: 드래그 중에 외부 헤더 숨김
  const [isSwiping, setIsSwiping] = React.useState(false);

  return (
    <>
      <Global
        styles={{
          '.MuiDrawer-root > .MuiPaper-root': {
            height: `calc(${height} - ${peekHeight}px)`,
            overflow: 'visible',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            backgroundColor: '#fff',
            zIndex: 1400,
          },
        }}
      />

      {/* 🔻 닫혀 있고, 스와이프 중이 아닐 때만 외부 헤더(전폭 바) 노출 */}
      {!open && (
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1300,
            pointerEvents: 'none',              // 제스처는 SwipeArea가 받음
            opacity: isSwiping ? 0 : 1,         // 스와이프 시작하면 숨김
            transition: 'opacity .15s ease',
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
          setIsSwiping(false); // 제스처 끝
          setOpen(true);
        }}
        onClose={() => {
          setIsSwiping(false); // 제스처 끝
          setOpen(false);
        }}
        disableSwipeToOpen={false}
        swipeAreaWidth={peekHeight + 12}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { paddingBottom: 'env(safe-area-inset-bottom)' } }}
        // ✅ 스와이프 영역 이벤트로 드래그 시작/종료 감지
        SwipeAreaProps={{
          onTouchStart: () => setIsSwiping(true),
          onMouseDown: () => setIsSwiping(true),
          onTouchEnd: () => setIsSwiping(false),
          onMouseUp: () => setIsSwiping(false),
          onTouchCancel: () => setIsSwiping(false),
        }}
      >
        {/* (옵션) 내부 헤더 */}
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
          <Box sx={{ width: 44, height: 5, borderRadius: 999, backgroundColor: grey[300], mb: 0.75 }} />
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>{title}</Typography>
        </Box>

        {/* 본문 */}
        <Box sx={{ px: 2, pb: 2, height: '100%', overflow: 'auto' }}>{children}</Box>
      </SwipeableDrawer>
    </>
  );
}
