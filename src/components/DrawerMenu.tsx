import * as React from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';

type DrawerMenuProps = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
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
  // width = 300,   // ← 더 이상 필요 없다면 제거해도 됨
  userName = '사용자님',
  onSelect,
  children,
}: DrawerMenuProps) {
  const handleClick = (key: string) => {
    onSelect?.(key);
    onClose();
  };

  return (
    <SwipeableDrawer
      anchor={anchor}
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      // ✅ Drawer 패널 자체 폭을 75%로
      PaperProps={{
        sx: {
          width: '75vw', 
          maxWidth: '100vw',     // 안전장치
        },
      }}
    >
      {/* ✅ 안쪽 컨텐츠는 100%로 채우기 */}
      <Box sx={{ width: '100%', bgcolor: '#fff' }} role="presentation">
        {/* 상단 사용자 영역 */}
        <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: '#FFE1E1', color: '#FF8B8B', fontWeight: 700 }}>
            사
          </Avatar>
          <Typography sx={{ fontSize: 48,fontWeight: 700, color: '#FF8B8B' }}>{userName}</Typography>
        </Box>

        {/* 1차 메뉴 */}
        <List dense disablePadding>
          {primary.map((item) => (
            <ListItem key={item.key} disablePadding>
              <ListItemButton onClick={() => handleClick(item.key)} sx={{ px: 2.5, py: 1.25 }}>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    sx: { fontSize: 32, color: '#555', letterSpacing: 0.2 },
                  }}
                />
                <ChevronRightIcon sx={{ color: '#bbb', fontSize: 20 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 1.5 }} />

        {/* 2차 메뉴 */}
        <List dense disablePadding>
          {secondary.map((item) => (
            <ListItem key={item.key} disablePadding>
              <ListItemButton onClick={() => handleClick(item.key)} sx={{ px: 2.5, py: 1.25 }}>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    sx: { fontSize: 32, color: '#555', letterSpacing: 0.2 },
                  }}
                />
                <ChevronRightIcon sx={{ color: '#bbb', fontSize: 20 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* (선택) 추가 섹션 */}
        {children && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ px: 2.5, py: 1 }}>{children}</Box>
          </>
        )}
      </Box>
    </SwipeableDrawer>
  );
}
