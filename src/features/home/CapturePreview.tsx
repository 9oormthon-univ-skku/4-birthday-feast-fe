import { toPng } from "html-to-image";
import React, { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  /** dataURL (toPng 결과) */
  src?: string | null;
  onClose: () => void;
  onDownload?: (src: string) => void;
  onShare?: (src: string) => void;
  closeOnBackdrop?: boolean;
  className?: string;
  titleDate?: string;
};

export default function CapturePreview({
  open,
  src,
  onClose,
  onDownload,
  onShare,
  closeOnBackdrop = true,
  className,
  titleDate = "2025. 00. 00",
}: Props) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  // ESC 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !src) return null;

  const handleDownload = async () => {
    // 1) 카드 DOM을 직접 PNG로 저장
    if (cardRef.current) {
      try {
        const dataUrl = await toPng(cardRef.current, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: "#FFFFFF",
          // 필요시 특정 요소 제외하고 싶으면 클래스/데이터 속성으로 필터링
          // filter: (n) => !(n instanceof Element && n.classList.contains("capture-ignore")),
        });

        if (onDownload) return onDownload(dataUrl);

        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `birthday-feast-${new Date().toISOString().replace(/[:.]/g, "-")}.png`;
        a.click();
        return;
      } catch (e) {
        console.error("Card capture failed, fallback to src download.", e);
      }
    }

    // 2) (폴백) 기존 src 저장
    if (onDownload) return onDownload(src);
    const a = document.createElement("a");
    a.href = src;
    a.download = `birthday-feast-${new Date().toISOString().replace(/[:.]/g, "-")}.png`;
    a.click();
  };

  const handleShare = async () => {
    if (onShare) return onShare(src!);
    try {
      const res = await fetch(src!);
      const blob = await res.blob();
      // @ts-ignore
      if (navigator.canShare && navigator.canShare({ files: [] })) {
        const file = new File([blob], "birthday-feast.png", { type: "image/png" });
        // @ts-ignore
        await navigator.share({ files: [file], title: "생일한상 캡쳐" });
      } else {
        await navigator.clipboard.writeText(src!);
        alert("이미지 주소를 클립보드에 복사했어요.");
      }
    } catch {}
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-1000 flex items-center justify-center bg-black/50 p-4 ${className ?? ""}`}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      {/* 카드 + 플로팅 버튼 컨테이너 */}
      <div ref={cardRef}
        className="relative max-w-[468px] w-[90%] rounded-[5px] bg-white p-5 pb-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[48vh] overflow-hidden rounded-[5px] border-1 border-[#BEBEBE]
        flex items-center justify-center"
        >
          <img src={src} alt="캡쳐 이미지" className="w-full h-auto block" />
        </div>

        <h2 className="mt-2 ms-2 font-normal font-['KoreanSWGIG2'] text-[#FF8B8B] text-2xl">
          {titleDate}
        </h2>

        <input className="ms-2 w-[90%] text-[#BFBFBF] text-base font-semibold font-['Pretendard']
        focus:outline-none focus:ring-1 focus:ring-[#BEBEBE] rounded-xs
        "
          placeholder="사진에 적힐 메시지를 적어주세요." />

        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-21 flex items-center gap-5
                    pb-[env(safe-area-inset-bottom)]"
        >
          <button
            aria-label="공유하기"
            onClick={handleShare}
            className="w-14 h-14 rounded-full bg-[#FF8B8B] text-white shadow-md active:scale-95 transition
                      flex items-center justify-center"
          >
            {shareIcon}
          </button>
          <button
            aria-label="다운로드"
            onClick={handleDownload}
            className="w-14 h-14 rounded-full bg-[#FF8B8B] text-white shadow-md active:scale-95 transition
                      flex items-center justify-center"
          >
            {downloadIcon}
          </button>
        </div>
      </div>
    </div>
  );
}

/* 아이콘 */
const shareIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 22 24" fill="none">
  <path d="M17.5 23.0002C19.3226 23.0002 20.8001 21.5228 20.8001 19.7003C20.8001 17.8778 19.3226 16.4004 17.5 16.4004C15.6774 16.4004 14.2 17.8778 14.2 19.7003C14.2 21.5228 15.6774 23.0002 17.5 23.0002Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M17.5 7.59983C19.3226 7.59983 20.8001 6.1224 20.8001 4.29991C20.8001 2.47743 19.3226 1 17.5 1C15.6774 1 14.2 2.47743 14.2 4.29991C14.2 6.1224 15.6774 7.59983 17.5 7.59983Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M4.30002 15.299C6.12257 15.299 7.60004 13.8217 7.60004 11.9991C7.60004 10.1766 6.12257 8.69922 4.30002 8.69922C2.47747 8.69922 1 10.1766 1 11.9991C1 13.8217 2.47747 15.299 4.30002 15.299Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M14.7502 5.9502L7.05011 10.3501" stroke="white" strokeWidth="2"/>
  <path d="M7.05011 13.6504L14.7502 18.0503" stroke="white" strokeWidth="2"/>
</svg>
);

const downloadIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="25" viewBox="0 0 19 25" fill="none">
  <path d="M1 23.6667H18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M9.50002 1V18M9.50002 18L14.4584 13.0417M9.50002 18L4.54169 13.0417" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
);
