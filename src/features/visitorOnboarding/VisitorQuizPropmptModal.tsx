// src/features/onboarding/visitor/VisitorQuizPromptModal.tsx
import React, { useEffect } from "react";
import clsx from "clsx";

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
  // ESC 닫기
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
        <h2 className="text-lg font-semibold text-gray-900">
          퀴즈 플레이 하시겠습니까?
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {nickname ? <b>{nickname}</b> : "방문자"} 님, 지금 바로 참여하면 순위에 기록돼요!
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={onSkip}
            className="h-11 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium"
          >
            건너뛰기
          </button>
          <button
            onClick={onParticipate}
            className="h-11 rounded-xl bg-[#FF8B8B] text-white text-sm font-semibold"
          >
            참여하기
          </button>
        </div>
      </div>
    </div>
  );
}
