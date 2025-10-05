import React, { useEffect } from "react";

type Props = {
  open: boolean;
  /** dataURL (toPng 결과) */
  src?: string | null;
  onClose: () => void;
  onDownload?: (src: string) => void;
  /** 기본 true: 배경 클릭 시 닫기 */
  closeOnBackdrop?: boolean;
  className?: string; // 필요시 스타일 커스터마이즈
};

export default function CapturePreview({
  open,
  src,
  onClose,
  onDownload,
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

  if (!open || !src) return null;

  const handleDownload = () => {
    if (onDownload) return onDownload(src);
    // 기본 다운로드 동작
    const a = document.createElement("a");
    a.href = src;
    a.download = `birthday-feast-${new Date().toISOString().replace(/[:.]/g, "-")}.png`;
    a.click();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 ${className ?? ""}`}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className="relative max-w-[468px] w-[90%] rounded-[5px] bg-white p-5 pb-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[48vh] overflow-hidden rounded-[5px] border-1 border-[#BEBEBE]
        flex items-center justify-center"
        >
          <img src={src} alt="캡쳐 이미지" className="w-full h-auto block" />
        </div>
        <h2 className="mt-2 ms-2 font-normal font-['KoreanSWGIG2'] text-[#FF8B8B] text-2xl">2025. 03. 11</h2>
        <input className="ms-2 w-[90%] text-[#BFBFBF] text-base font-semibold font-['Pretendard']
        focus:outline-none focus:ring-1 focus:ring-[#BEBEBE] rounded-xs
        "
          placeholder="사진에 적힐 메시지를 적어주세요." />
      </div>
    </div>
  );
}

