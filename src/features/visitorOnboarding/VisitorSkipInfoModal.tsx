// src/features/onboarding/visitor/VisitorSkipInfoModal.tsx
import React from "react";
import Modal from "@/ui/Modal";
import quiz1 from "@/assets/theme/quiz-1.svg"; // ✅ 기본 아이콘 추가

type Props = {
  open: boolean;
  quizIconSrc?: string; // 외부에서 오버라이드 가능
  onClose: () => void;
};

export default function VisitorSkipInfoModal({
  open,
  quizIconSrc,
  onClose,
}: Props) {
  const icon = quizIconSrc || quiz1; // 기본값 지정

  return (
    <Modal
      open={open}
      type="alert"
      title={
        <div className="flex items-center justify-center gap-2">
          <img
            src={icon}
            alt="퀴즈 아이콘"
            className="w-8 h-10 shrink-0"
          />
          <span className="pt-2 text-[#FF8B8B] text-lg font-semibold">
            나중에 참여할 수 있어요
          </span>
        </div>
      }
      helperText={
        <p className="mt-3 text-center text-sm text-gray-600 leading-relaxed">
          메인 화면의 <b>퀴즈 아이콘</b>을 눌러
          <br />
          언제든지 퀴즈에 참여하실 수 있어요.
          <br />
          준비되면 도전해 보세요!
        </p>
      }
      confirmText="확인"
      onConfirm={onClose}
      onClose={onClose}
      closeOnBackdrop={true}
    />
  );
}
