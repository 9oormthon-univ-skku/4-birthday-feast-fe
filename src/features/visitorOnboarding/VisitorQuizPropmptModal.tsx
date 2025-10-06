import React from "react";
import Modal from "@/ui/Modal";

type Props = {
  open: boolean;
  nickname?: string;
  onParticipate: () => void;
  onSkip: () => void;
  onClose: () => void;
  closeOnBackdrop?: boolean;
  className?: string;
};

export default function VisitorQuizPromptModal({
  open,
  nickname,
  onParticipate,
  onSkip,
  onClose,
  closeOnBackdrop = true,
  className,
}: Props) {
  const helper = (
    <p className="mt-2 text-center text-sm">
      {nickname ? (
        <>
          <b>{nickname}</b>님, 지금 바로 참여하면
          <br />
          퀴즈 순위를 볼 수 있어요!
        </>
      ) : (
        <>
          지금 바로 참여하면
          <br />
          퀴즈 순위를 볼 수 있어요!
        </>
      )}
    </p>
  );

  return (
    <Modal
      open={open}
      type="confirm"
      title={<span className="text-[#FF8B8B] text-lg">퀴즈 플레이 하시겠습니까?</span>}
      helperText={helper}
      confirmText="참여하기"
      cancelText="건너뛰기"
      onConfirm={onParticipate}
      onCancel={onSkip}
      onClose={onClose}
      closeOnBackdrop={closeOnBackdrop}
      className={className}
    />
  );
}
