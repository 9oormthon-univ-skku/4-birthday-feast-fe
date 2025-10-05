// src/features/home/WelcomeModal.tsx
import React from 'react';
import Modal from '@/ui/Modal';

type WelcomeModalProps = {
  open: boolean;
  isHost: boolean;
  onClose: () => void;
};

const HostMessage = () => (
  <>
    생일한상에 오신 것을 환영합니다!
    <br />
    <br />
    생일상을 꾸미고 공유해서
    <br />
    친구들에게 생일축하를 받아보아요!
    <br />
    <br />
    생일축하 메시지는 <b>14일 전</b>부터
    <br />
    등록할 수 있으며,
    <br />
    <b>생일 당일</b>에 공개됩니다!
  </>
);

const GuestMessage = () => (
  <>
    생일한상에 오신 것을 환영합니다!
    <br />
    <br />
    디저트와 함께 축하 메시지를 남겨 친구의 생일상을 꾸며주세요.
    <br />
    <br />
    메시지는 친구의 생일 <b>14일 전</b>부터 남길 수 있고, 공개는 <b>당일</b>에 이루어져요.
  </>
);

// const welcomeMessage = isHost
//   ? "생일한상에 오신 것을 환영합니다!\n\n생일상을 꾸미고 공유해서\n친구들에게 생일축하를 받아보아요!\n\n생일축하 메시지는 14일 전부터\n등록할 수 있으며,\n생일 당일에 공개됩니다!"
//   : (
//     <>
//       생일한상에 오신 것을 환영합니다, <b>게스트</b>님!<br /><br />
//       축하 메시지와 디저트를 남겨 생일자를 빛나게 해주세요.<br /><br />
//       메시지는 <b>생일 14일 전</b>부터 남길 수 있고, 공개는 <b>당일</b>에 이루어져요.
//     </>
//   );

export default function WelcomeModal({ open, isHost, onClose }: WelcomeModalProps) {
  const highlightText = isHost ? '사용자' : '게스트';
  const helperText = isHost ? '공개 기간은 설정할 수 있어요.' : '공개 기간은 호스트가 설정해요.';

  return (
    <Modal
      open={open}
      type="welcome"
      highlightText={highlightText}
      message={isHost ? <HostMessage /> : <GuestMessage />}
      helperText={helperText}
      onConfirm={onClose}
      onClose={onClose}
    />
  );
}
