import React from "react";
import Modal from "@/ui/Modal";

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
      title={<span className="pt-2 text-[#FF8B8B] text-lg font-semibold">
        생일 퀴즈 안내
      </span>}
      message={`우측 상단 메뉴의 '내 생일 퀴즈' 탭에서\n언제든지 퀴즈를 만들 수 있어요!`}
      confirmText="확인"
      onConfirm={onClose}
      onClose={onClose}
    />
  );
}
