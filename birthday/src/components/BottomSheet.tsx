import * as React from 'react';
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
  const [uncontrolled, setUncontrolled] = React.useState(false);
  const open = controlledOpen ?? uncontrolled;
  const setOpen = (v: boolean) => (onOpenChange ? onOpenChange(v) : setUncontrolled(v));

  const [isSwiping, setIsSwiping] = React.useState(false);

  if (suspended) return null;

  return (
    <>
      {/* 닫혀 있고 스와이프 중이 아닐 때만 미리보기 헤드 노출 */}
      {!open && (
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1300,
            pointerEvents: 'none',
            opacity: isSwiping ? 0 : 1,
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
          setIsSwiping(false);
          setOpen(true);
        }}
        onClose={() => {
          setIsSwiping(false);
          setOpen(false);
        }}
        disableSwipeToOpen={false}
        swipeAreaWidth={peekHeight + 12}
        ModalProps={{ keepMounted: true }}
        // ✅ 이 바텀시트 Drawer "만" 스타일 적용
        PaperProps={{
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
          onTouchStart: () => setIsSwiping(true),
          onMouseDown: () => setIsSwiping(true),
          onTouchEnd: () => setIsSwiping(false),
          onMouseUp: () => setIsSwiping(false),
          onTouchCancel: () => setIsSwiping(false),
        }}
      >
        {/* 내부 헤드 */}
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
