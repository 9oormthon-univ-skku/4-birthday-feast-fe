import { toPng } from "html-to-image";
import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  open: boolean;
  /** 미리보기/폴백용 dataURL(or URL) */
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
  titleDate,
}: Props) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [message, setMessage] = useState("");

  // 오늘 날짜 자동 생성 (YYYY. MM. DD)
  const todayString = useMemo(() => {
    if (titleDate) return titleDate;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}. ${mm}. ${dd}`;
  }, [titleDate]);

  // ESC 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !src) return null;

  /** 외부 리소스 로딩 대기 */
  const waitForImages = (root: HTMLElement): Promise<void> => {
    const imgs = Array.from(root.querySelectorAll("img"));
    const promises = imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && (img as any).naturalWidth !== 0) return resolve();
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true }); // 에러여도 진행
        })
    );
    return Promise.all([document.fonts?.ready ?? Promise.resolve(), ...promises]).then(() => { });
  };

  /** dataURL → Blob */
  const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(",");
    const mime = arr[0]?.match(/:(.*?);/)?.[1] ?? "image/png";
    const bstr = atob(arr[1] ?? "");
    let n = bstr.length;
    const u8 = new Uint8Array(n);
    while (n--) u8[n] = bstr.charCodeAt(n);
    return new Blob([u8], { type: mime });
  };

  /** 플랫폼 판별 (아주 러프하게) */
  const isIOS = () =>
    /iP(hone|od|ad)/.test(navigator.platform) ||
    (/Mac/.test(navigator.platform) && "ontouchend" in document); // iPadOS
  const isAndroid = () => /Android/i.test(navigator.userAgent);
  const isChrome = () => /Chrome\/\d+/.test(navigator.userAgent);
  // (1) 추가: iOS 전용 폴백 렌더러
  const iosFallbackFromImg = async (): Promise<string> => {
    if (!imgRef.current) throw new Error("이미지가 준비되지 않았어요.");

    // 이미지 로딩 보장
    if (!imgRef.current.complete || (imgRef.current as any).naturalWidth === 0) {
      await new Promise<void>((resolve) => {
        imgRef.current!.addEventListener("load", () => resolve(), { once: true });
        imgRef.current!.addEventListener("error", () => resolve(), { once: true });
      });
    }

    const img = imgRef.current!;
    const dpr = Math.max(2, Math.round(window.devicePixelRatio || 2));
    const padding = 24; // 좌우/상하 여백
    const textBlockH = 120; // 날짜/메시지 출력 영역 높이

    const naturalW = img.naturalWidth || img.width || 1080;
    const naturalH = img.naturalHeight || img.height || 1350;

    const canvasW = naturalW;
    const canvasH = naturalH + textBlockH;

    const canvas = document.createElement("canvas");
    canvas.width = canvasW * dpr;
    canvas.height = canvasH * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("캔버스 컨텍스트 생성 실패");
    ctx.scale(dpr, dpr);

    // 배경 흰색
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvasW, canvasH);

    // 이미지 그리기 (가로 꽉, 세로 비율 유지만 상단 정렬)
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, canvasW, naturalH);

    // 텍스트 영역
    const left = padding;
    const top = naturalH + padding;

    // 날짜
    ctx.font = "700 28px Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial";
    ctx.fillStyle = "#FF8B8B";
    ctx.textBaseline = "top";
    ctx.fillText(todayString || "", left, top);

    // 메시지 (줄바꿈 없이 한줄)
    if (message?.trim()) {
      ctx.font = "600 18px Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial";
      ctx.fillStyle = "#BFBFBF";
      const msgY = top + 36;
      const maxWidth = canvasW - padding * 2;
      // 너무 길면 말줄임
      let drawText = message.trim();
      while (ctx.measureText(drawText + "…").width > maxWidth && drawText.length > 0) {
        drawText = drawText.slice(0, -1);
      }
      if (drawText !== message.trim()) drawText += "…";
      ctx.fillText(drawText, left, msgY);
    }

    return canvas.toDataURL("image/png");
  };

  // (2) 변경: captureCard 내 iOS 분기와 폴백 추가 (+ iOS에서 skipFonts: true)
  const captureCard = async (): Promise<string> => {
    if (!cardRef.current) throw new Error("카드가 준비되지 않았어요.");
    await waitForImages(cardRef.current);

    // 버튼/플로팅 UI 제외 필터
    const filter = (node: HTMLElement) => {
      const cls = node.classList?.value ?? "";
      return !(
        cls.includes("capture-exclude") ||
        cls.includes("fixed-action-area") ||
        node.tagName === "BUTTON"
      );
    };

    try {
      return await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#FFFFFF",
        style: {
          transform: "translateZ(0)",
          WebkitTransform: "translateZ(0)", // iOS Safari 보정
        } as any,
        filter,
        // iOS는 외부 폰트 대기/임베딩 이슈가 잦아 skipFonts 권장
        skipFonts: isIOS(),
      });
    } catch (err) {
      // iOS 전용 폴백: <img> + 텍스트를 캔버스에 직접 그려 PNG 생성
      if (isIOS()) {
        try {
          return await iosFallbackFromImg();
        } catch (e) {
          console.error("iOS 폴백 렌더링도 실패", e);
        }
      }
      throw err;
    }
  };


  const doNativeDownload = (dataUrl: string, fileName: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  /** 공통 저장 파일명 */
  const fileName = `birthday-feast-${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.png`;

  const handleDownload = async () => {
    try {
      // 1) cardRef 기준 캡처 시도
      const dataUrl = await captureCard().catch(async (err) => {
        console.error("cardRef 캡처 실패, src 폴백 사용", err);
        return src; // 폴백
      });

      if (!dataUrl) throw new Error("캡처에 실패했어요.");

      if (onDownload) {
        onDownload(dataUrl);
        return;
      }

      // 2) 플랫폼별 저장 전략
      if (isIOS()) {
        // iOS: 항상 새 탭에서 이미지 표시 (길게 눌러 저장)
        const blob = dataURLtoBlob(dataUrl);
        const url = URL.createObjectURL(blob);
        // 새 탭 오픈
        window.open(url, "_blank", "noopener,noreferrer");
        // 메모리 누수 방지
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else if (isAndroid() && isChrome()) {
        // Android Chrome: download 속성 정상 동작
        doNativeDownload(dataUrl, fileName);
      } else {
        // 기타: 우선 다운로드 시도, 안 되면 새 탭
        try {
          doNativeDownload(dataUrl, fileName);
        } catch {
          const blob = dataURLtoBlob(dataUrl);
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank", "noopener,noreferrer");
          setTimeout(() => URL.revokeObjectURL(url), 60_000);
        }
      }
    } catch (e) {
      console.error("Card capture failed, fallback to src download.", e);
      alert(`이미지 저장 실패\n${e}`);
    } finally {
      onClose(); // 완료 후 모달 닫기
    }
  };

  const handleShare = async () => {
    try {
      // cardRef 기준으로 항상 최신 상태 공유
      const dataUrl = await captureCard().catch(async () => src!);
      if (onShare) {
        onShare(dataUrl);
        return;
      }
      const blob = dataURLtoBlob(dataUrl);
      // @ts-ignore
      if (navigator.canShare && navigator.canShare({ files: [] })) {
        const file = new File([blob], "birthday-feast.png", { type: "image/png" });
        // @ts-ignore
        await navigator.share({ files: [file], title: "생일한상 캡쳐" });
      } else {
        // 파일 공유 불가 → 링크 복사 폴백
        await navigator.clipboard.writeText(dataUrl);
        alert("이미지 주소를 클립보드에 복사했어요.");
      }
    } catch (e) {
      console.error(e);
      alert(`공유에 실패했어요\n${e}`);
    } finally {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-10000 flex items-center justify-center bg-black/50 px-2 pt-1 pb-14 ${className ?? ""
        }`}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      {/* 카드 + 플로팅 버튼 컨테이너 */}
      <div
        ref={cardRef}
        className="relative max-w-[468px] w-[80%] rounded-[5px] bg-white p-5 pb-3"
        onClick={(e) => e.stopPropagation()}  // 배경 클릭 전파 차단

      >
        <div
          className="max-h-[52dvh] overflow-hidden rounded-[5px] border-1 border-[#BEBEBE]
        flex items-center justify-center"
        >
          <img
            ref={imgRef}
            src={src}
            alt="캡쳐 이미지"
            className="w-full h-auto block"
            crossOrigin="anonymous"
          />
        </div>

        <h2 className="mt-2 ms-2 font-normal font-['KoreanSWGIG3'] text-[#FF8B8B] text-2xl">
          {todayString}
        </h2>
        <input
          value={isIOS() ? "사진을 길게 눌러 저장하세요" : message}
          onChange={isIOS() ? undefined : (e) => setMessage(e.target.value)}
          readOnly={isIOS()}
          aria-readonly={isIOS()}
          className={`ms-2 w-[90%] text-base font-semibold font-['Pretendard']
    focus:outline-none focus:ring-1 focus:ring-[#BEBEBE] rounded-xs ${isIOS() ? "text-black" : "text-[#BFBFBF]"
            }`}
          placeholder="사진에 적힐 메시지를 적어주세요."
        />
        {!isIOS() && <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-21 flex items-center gap-7
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
        </div>}
      </div>
    </div>
  );
}

const shareIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 22 24" fill="none">
    <path d="M17.5 23.0002C19.3226 23.0002 20.8001 21.5228 20.8001 19.7003C20.8001 17.8778 19.3226 16.4004 17.5 16.4004C15.6774 16.4004 14.2 17.8778 14.2 19.7003C14.2 21.5228 15.6774 23.0002 17.5 23.0002Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17.5 7.59983C19.3226 7.59983 20.8001 6.1224 20.8001 4.29991C20.8001 2.47743 19.3226 1 17.5 1C15.6774 1 14.2 2.47743 14.2 4.29991C14.2 6.1224 15.6774 7.59983 17.5 7.59983Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.30002 15.299C6.12257 15.299 7.60004 13.8217 7.60004 11.9991C7.60004 10.1766 6.12257 8.69922 4.30002 8.69922C2.47747 8.69922 1 10.1766 1 11.9991C1 13.8217 2.47747 15.299 4.30002 15.299Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.7502 5.9502L7.05011 10.3501" stroke="white" strokeWidth="2" />
    <path d="M7.05011 13.6504L14.7502 18.0503" stroke="white" strokeWidth="2" />
  </svg>
);

const downloadIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="25" viewBox="0 0 19 25" fill="none">
    <path d="M1 23.6667H18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.50002 1V18M9.50002 18L14.4584 13.0417M9.50002 18L4.54169 13.0417" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);