// src/features/onboarding/BirthdaySetupModal.tsx
import React, { useMemo, useState } from "react";
// import ConfirmModal from "@/components/ConfirmModal";
import dayjs from "dayjs";
import Modal from "@/ui/Modal";
import KoreanDateInput from "./KorenDateInput";


type Props = {
  open: boolean;
  onSubmit: (iso: string) => void;
  onClose?: () => void;
};


export default function BirthdaySetupModal({ open, onSubmit, onClose }: Props) {
  const [value, setValue] = useState("");


  const isValid = useMemo(() => {
    if (!value) return false;
    const d = dayjs(value);
    return d.isValid() && d.year() >= 1900 && d.year() <= 2100;
  }, [value]);


  return (
    <Modal
      open={open}
      type="welcome"
      title={<div className="text-[#FF8B8B] text-lg">
        🎂생일 날짜를 입력해주세요!
      </div>}
      message={
        <div className="mt-4 space-y-3">
          {/* <input
            type="date"
            lang="ko-KR"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF8B8B]"
          /> */}
          <KoreanDateInput
            value={value}
            onChange={setValue}
            className="w-full"
            placeholder="YYYY.MM.DD"
          />
        </div>
      }
      confirmText="입력 완료"
      onConfirm={() => isValid && onSubmit(value)}
      onCancel={onClose}
      closeOnBackdrop={false}
    />
  );
}