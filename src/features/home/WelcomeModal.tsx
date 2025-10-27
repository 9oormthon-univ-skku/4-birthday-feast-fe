import React from 'react';
import Modal from '@/ui/Modal';

type WelcomeModalProps = {
  open: boolean;
  isHost: boolean;
  onClose: () => void;
  nickname?: string; // 닉네임 추가
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

const GuestMessage = ({ nickname }: { nickname?: string }) => (
  <>
    {nickname ? (
      <>
        생일한상에 오신 것을 환영합니다!
      </>
    ) : (
      <>생일한상에 오신 것을 환영합니다!</>
    )}
    <br />
    <br />
    디저트와 함께 축하 메시지를 남겨
    <br />
    친구의 생일상을 꾸며주세요.
    <br />
    <br />
    생일축하 메시지는 <b>14일 전</b>부터
    <br />
    등록할 수 있으며,
    <br />
    <b>생일 당일</b>에 공개됩니다!
  </>
);

export default function WelcomeModal({ open, isHost, onClose, nickname }: WelcomeModalProps) {
  const highlightText = isHost ? nickname || '사용자' : nickname || '게스트';
  const helperText = isHost ? '공개 범위는 설정할 수 있어요.' : '공개 범위는 생일자가 설정해요.';

  return (
    <Modal
      open={open}
      type="welcome"
      highlightText={highlightText}
      message={isHost ? <HostMessage /> : <GuestMessage nickname={nickname} />}
      helperText={helperText}
      onConfirm={onClose}
      onClose={onClose}
    />
  );
}
