// src/features/home/FeatureButtons.tsx
import React from "react";
import { toPng } from "html-to-image";
import { useShareLink } from "@/features/share/useShareLink";
import { useAuth } from "@/features/auth/useAuth";

type TargetRef =
  | React.RefObject<HTMLElement>
  | React.MutableRefObject<HTMLElement | null>;

type Props = {
  targetRef: TargetRef;
  fileName?: string;
  backgroundColor?: string;
  onCaptured?: (dataUrl: string) => void;
  autoDownload?: boolean;
};

// (MyFeastQRPage와 동일한 방식)
function getShareHostId(auth: ReturnType<typeof useAuth>): string | number {
  return (auth as any)?.user?.publicId ?? (auth as any)?.user?.id ?? "u_12345";
}

export default function FeatureButtons({
  targetRef,
  fileName = "screenshot",
  backgroundColor = "#FFF4DF",
  onCaptured,
  autoDownload = false,
}: Props) {
  const auth = useAuth();
  const hostId = getShareHostId(auth);

  // /feast/:hostId 링크 공유 훅
  const { share } = useShareLink(hostId);

  // 공유 버튼
  const handleShare = async () => {
    try {
      await share(); // navigator.share 지원 시 시스템 공유, 미지원 시 클립보드 복사
    } catch {
      // 사용자가 취소했거나 오류 → 무시
    }
  };

  // 캡처 버튼
  const handleCapture = async () => {
    const node = targetRef.current; // 클릭 순간에 최신 ref 읽기
    if (!node) return;

    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor,
        filter: (n) => {
          if (!(n instanceof Element)) return true;
          if (n.classList.contains("capture-ignore")) return false;
          if ((n as HTMLElement).dataset.capture === "hide") return false;
          return true;
        },
      });

      onCaptured?.(dataUrl);

      if (autoDownload) {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `${fileName}-${new Date().toISOString().replace(/[:.]/g, "-")}.png`;
        a.click();
      }
    } catch (e) {
      console.error(e);
      alert("이미지 저장 중 오류가 발생했습니다. (외부 이미지 CORS를 확인해주세요)");
    }
  };

  return (
    <div className="flex justify-center gap-2">
      <button
        aria-label="공유하기"
        onClick={handleShare}
        className="w-7 h-7 rounded-full bg-[#FF8B8B] text-white shadow-md active:scale-95 transition flex items-center justify-center"
        title="공유"
      >
        {shareIcon}
      </button>

      <button
        aria-label="화면 캡쳐"
        onClick={handleCapture}
        className="w-7 h-7 rounded-full bg-[#FF8B8B] text-white shadow-md active:scale-95 transition flex items-center justify-center"
        title="캡쳐"
      >
        {downloadIcon}
      </button>
    </div>
  );
}

const shareIcon = <svg xmlns="http://www.w3.org/2000/svg" width="12" height="13" viewBox="0 0 12 13" fill="none">
  <path d="M9.24998 12C10.1613 12 10.9 11.2613 10.9 10.35C10.9 9.43876 10.1613 8.70007 9.24998 8.70007C8.33868 8.70007 7.59998 9.43876 7.59998 10.35C7.59998 11.2613 8.33868 12 9.24998 12Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M9.24998 4.29993C10.1613 4.29993 10.9 3.56122 10.9 2.64997C10.9 1.73872 10.1613 1 9.24998 1C8.33868 1 7.59998 1.73872 7.59998 2.64997C7.59998 3.56122 8.33868 4.29993 9.24998 4.29993Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M2.65 8.14979C3.56127 8.14979 4.3 7.4111 4.3 6.49982C4.3 5.58854 3.56127 4.84985 2.65 4.84985C1.73873 4.84985 1 5.58854 1 6.49982C1 7.4111 1.73873 8.14979 2.65 8.14979Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M7.87502 3.47488L4.02502 5.67484" stroke="white" />
  <path d="M4.02502 7.3251L7.87502 9.52506" stroke="white" />
</svg>
const downloadIcon = <svg xmlns="http://www.w3.org/2000/svg" width="13" height="12" viewBox="0 0 13 12" fill="none">
  <path d="M1 9.72009V4.27015C1 3.66816 1.488 3.18016 2.08999 3.18016H2.36249C2.70557 3.18016 3.02863 3.01863 3.23448 2.74416L4.44436 1.13098C4.50612 1.04864 4.60304 1.00018 4.70596 1.00018H8.19393C8.29687 1.00018 8.39378 1.04864 8.45552 1.13098L9.66541 2.74416C9.87125 3.01863 10.1943 3.18016 10.5374 3.18016H10.8099C11.4119 3.18016 11.8999 3.66816 11.8999 4.27015V9.72009C11.8999 10.3221 11.4119 10.8101 10.8099 10.8101H2.08999C1.488 10.8101 1 10.3221 1 9.72009Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M6.45 8.63019C7.65394 8.63019 8.62997 7.65416 8.62997 6.45021C8.62997 5.24626 7.65394 4.27023 6.45 4.27023C5.24603 4.27023 4.27002 5.24626 4.27002 6.45021C4.27002 7.65416 5.24603 8.63019 6.45 8.63019Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
</svg>