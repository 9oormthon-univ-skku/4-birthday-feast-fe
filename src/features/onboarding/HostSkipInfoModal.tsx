import React from "react";
import Modal from "@/ui/Modal";
import quiz1 from "@/assets/theme/quiz-1.svg";

type Props = {
  open: boolean;
  onClose: () => void;
};

/** 퀴즈 '나중에' 선택 시 안내 모달 */
export default function HostSkipInfoModal({ open, onClose }: Props) {
  return (
    <Modal
      open={open}
      type="alert"
      title={
        <div className="flex items-center justify-center gap-2">
          <img
            src={quiz1}
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
          언제든지 내 퀴즈를 만들 수 있어요.
        </p>
      }
      confirmText="확인"
      onConfirm={onClose}
      onClose={onClose}
    />
  );
}
