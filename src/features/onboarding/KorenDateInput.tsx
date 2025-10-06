import React, { useRef } from "react";
import dayjs from "dayjs";
import clsx from "clsx";

type Props = {
  value?: string | null;            // ISO: "2025-10-06"
  onChange: (iso: string) => void;
  className?: string;
  placeholder?: string;             // 미선택 시 표시
  id?: string;
  name?: string;
};

export default function KoreanDateInput({
  value,
  onChange,
  className,
  placeholder = "YYYY.MM.DD",
  id,
  name,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const iso = value ?? "";
  const formatted = iso ? dayjs(iso).format("YYYY.MM.DD") : "";

  const openPicker = () => {
    const el = ref.current;
    // Chrome/Edge 등: showPicker 지원
    if (el && typeof (el as any).showPicker === "function") {
      (el as any).showPicker();
    } else {
      // fallback: 포커스 후 엔터/스페이스 유도
      el?.focus();
    }
  };

  return (
    <div className={clsx("relative", className)}>
      {/* 1) 실제 네이티브 date input (피커용) */}
      <input
        ref={ref}
        id={id}
        name={name}
        type="date"
        lang="ko-KR"
        value={iso}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#FF8B8B] px-4 py-3 focus:outline-none 
                  text-transparent caret-transparent selection:bg-transparent
                  bg-transparent pointer-events-none"
      // iOS 등에서 포커스 시 키보드 뜨는 걸 줄이고 싶으면 inputMode="none" 고려
      />

      {/* 2) 표시용 오버레이 텍스트 (한국식 포맷) */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center px-4"
      >
        <span className={formatted ? "text-gray-900" : "text-gray-400"}>
          {formatted || placeholder}
        </span>
      </div>
      {/* 3) 우측 캘린더 버튼 - 여기서만 피커 오픈 */}
      <button
        type="button"
        aria-label="날짜 선택"
        onClick={openPicker}
        className=" bg-white absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1"
      >
        {calenderIcon}
      </button>

    </div>
  );
}

const calenderIcon =  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>