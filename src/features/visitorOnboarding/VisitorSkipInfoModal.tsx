// src/features/onboarding/visitor/VisitorSkipInfoModal.tsx
import React, { useEffect } from "react";
import clsx from "clsx";

type Props = {
  open: boolean;
  quizIconSrc?: string; // 퀴즈 아이콘 이미지 (옵션)
  onClose: () => void;
  className?: string;
  closeOnBackdrop?: boolean;
};

export default function VisitorSkipInfoModal({
  open,
  quizIconSrc,
  onClose,
  className,
  closeOnBackdrop = true,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={clsx(
        "fixed inset-0 z-[10000] flex items-end md:items-center justify-center bg-black/40",
        className
      )}
      onClick={() => closeOnBackdrop && onClose()}
    >
      <div
        className="w-full md:w-[420px] rounded-t-2xl md:rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center gap-3">
          {quizIconSrc ? (
            <img src={quizIconSrc} alt="퀴즈 아이콘" className="w-8 h-8" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500">
              ?
            </div>
          )}
          <h3 className="text-base font-semibold text-gray-900">나중에 참여할 수 있어요</h3>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          메인 화면의 <b>퀴즈 아이콘</b>을 눌러 언제든지 다시 참여하실 수 있어요.
          준비되면 도전해 보세요!
        </p>

        <button
          onClick={onClose}
          className="mt-5 h-11 w-full rounded-xl bg-gray-900 text-white text-sm font-semibold"
        >
          확인
        </button>
      </div>
    </div>
  );
}
