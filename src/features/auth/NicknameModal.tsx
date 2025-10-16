import React from "react";
import Modal from "@/ui/Modal";

type NicknameModalProps = {
  open: boolean;
  defaultValue?: string;
  onSubmit: (nickname: string) => void;
  onClose: () => void;
};

export default function NicknameModal({
  open,
  defaultValue = "",
  onSubmit,
  onClose,
}: NicknameModalProps) {
  return (
    <Modal
      open={open}
      type="prompt"
      message="사용하실 닉네임을 등록해주세요."
      confirmText="확인"
      defaultValue={defaultValue}
      validate={(v) => v.trim().length > 0}
      onConfirm={(v) => {
        const nickname = (v ?? "").trim();
        if (!nickname) return;
        onSubmit(nickname);
      }}
      closeOnBackdrop={true}
      onClose={onClose}
      className="pt-4"
    />
  );
}
