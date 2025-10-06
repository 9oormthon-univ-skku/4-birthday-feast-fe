import Modal from "@/ui/Modal";
import React from "react";


type Props = {
  open: boolean;
  onMake: () => void;
  onLater: () => void;
};


export default function QuizPromptModal({ open, onMake, onLater }: Props) {
  return (
    <Modal
      open={open}
      type="confirm"
      title={<span className="text-[#FF8B8B] text-lg">퀴즈를 작성해주세요!</span>}
      helperText={<p className="mt-2">내 생일상을 방문한 친구들이<br />퀴즈에 참여할 수 있어요.</p>}
      confirmText="만들기"
      cancelText="나중에"
      onConfirm={onMake}
      onCancel={onLater}
      closeOnBackdrop={false}
    />
  );
}