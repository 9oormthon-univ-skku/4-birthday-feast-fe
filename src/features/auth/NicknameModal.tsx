import React from "react";
import Modal from "@/ui/Modal";
import { useBirthdayMode } from "@/app/ModeContext";
import { useLocation } from "react-router-dom";

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
  const { isGuest } = useBirthdayMode();
  const location = useLocation();

  // URL 쿼리에서 name 파라미터 추출 (디코딩 포함)
  const searchParams = new URLSearchParams(location.search);
  const hostName = searchParams.get("name")
    ? decodeURIComponent(searchParams.get("name")!)
    : "";

  // 기본 문구
  let message: React.ReactNode = "사용하실 닉네임을 등록해주세요";
  let helperText = "";

  // 게스트일 경우 문구 변경
  if (isGuest) {
    if (hostName) {
      message = (
        <>
          <span className="text-[#FF8B8B] font-bold">{hostName}</span>
          님에게 표시될 <span className="font-bold">닉네임</span>을<br />
          입력해주세요🤗
        </>
      );
    } else {
      message = (
        <>
          친구에게 표시될 <span className="font-bold">닉네임</span>을<br />
          입력해주세요🤗
        </>
      );
    }
    helperText = "한 번 설정한 닉네임은 수정할 수 없습니다";
  }

  return (
    <Modal
      open={open}
      type="prompt"
      message={message}
      helperText={helperText}
      confirmText="확인"
      defaultValue={defaultValue}
      validate={(v) => v.trim().length > 0}
      onConfirm={(v) => {
        const nickname = (v ?? "").trim();
        if (!nickname) return;
        onSubmit(nickname);
      }}
      closeOnBackdrop={false}
      onClose={onClose}
      className="pt-4"
    />
  );
}
