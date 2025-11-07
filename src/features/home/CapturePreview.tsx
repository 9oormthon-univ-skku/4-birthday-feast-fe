import { toPng } from "html-to-image";
import React, { useEffect, useMemo, useRef } from "react";

type Props = {
  open: boolean;
  /** 미리보기/폴백용 dataURL(or URL) */
  src?: string | null;
  onClose: () => void;
  onDownload?: (src: string) => void;
  onShare?: (src: string) => void;
  closeOnBackdrop?: boolean;
  className?: string;
  /** 헤더 날짜를 외부에서 주입하고 싶을 때 */
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

  // -------------------------
  // iOS 안전 설정 / 유틸들
  // -------------------------
  const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const safePixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  async function blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  }

  async function urlToDataURL(url: string): Promise<string> {
    if (/^(data:|blob:)/i.test(url)) return url;
    const res = await fetch(url, { mode: "cors", cache: "no-store" }).catch(() => null);
    if (res && res.ok) {
      const blob = await res.blob();
      return blobToDataURL(blob);
    }
    // 최후 폴백: no-cors 시도(0바이트일 수 있음)
    const res2 = await fetch(url, { mode: "no-cors", cache: "no-store" }).catch(() => null);
    if (!res2) return url;
    try {
      const blob = await res2.blob();
      if (blob.size > 0) return blobToDataURL(blob);
      return url;
    } catch {
      return url;
    }
  }

  async function prepareNodeForCapture(root: HTMLElement) {
    // 폰트 로드 보장
    if ((document as any).fonts?.ready) {
      try {
        await (document as any).fonts.ready;
        // 렌더 타이밍 2프레임 보정
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      } catch { }
    }

    const restores: Array<() => void> = [];

    // <img> src -> dataURL 치환
    const imgs = Array.from(root.querySelectorAll("img")) as HTMLImageElement[];
    await Promise.all(
      imgs.map(async (img) => {
        const orig = img.src;
        try {
          const dataUrl = await urlToDataURL(orig);
          img.src = dataUrl;
          restores.push(() => {
            img.src = orig;
          });
        } catch { }
      })
    );

    // background-image: url(...) 치환
    const all = Array.from(root.querySelectorAll<HTMLElement>("*"));
    await Promise.all(
      all.map(async (el) => {
        const cs = getComputedStyle(el);
        const bg = cs.backgroundImage;
        if (!bg || bg === "none") return;
        const urls = [...bg.matchAll(/url\((['"]?)(.*?)\1\)/g)].map((m) => m[2]).filter(Boolean);
        if (!urls.length) return;

        const origStyle = el.getAttribute("style") || "";
        try {
          let replaced = bg;
          for (const u of urls) {
            const dataUrl = await urlToDataURL(u);
            replaced = replaced.replace(u, dataUrl);
          }
          el.style.backgroundImage = replaced;
          restores.push(() => {
            el.setAttribute("style", origStyle);
          });
        } catch { }
      })
    );

    // 필요 시 시스템 폰트 강제 적용(주석 해제해서 테스트)
    // const rootOrigStyle = root.getAttribute("style") || "";
    // root.setAttribute(
    //   "style",
    //   rootOrigStyle +
    //     "; font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Helvetica Neue', Arial, sans-serif !important;"
    // );
    // restores.push(() => root.setAttribute("style", rootOrigStyle));

    return () => {
      restores.reverse().forEach((fn) => fn());
    };
  }

  const handleDownload = async () => {
    try {
      // 1) 캡쳐 전 준비(인라인 치환 + 폰트 대기)
      let restore: (() => void) | undefined;
      if (cardRef.current) {
        restore = await prepareNodeForCapture(cardRef.current);
      }

      // 2) toPng 우선 시도
      let dataUrl: string | undefined;
      if (cardRef.current) {
        try {
          dataUrl = await toPng(cardRef.current, {
            cacheBust: true,
            pixelRatio: safePixelRatio, // iOS 메모리 한계 고려(<=2)
            backgroundColor: "#FFFFFF",
          });
        } catch (err) {
          console.warn("toPng failed, fallback to src:", err);
        } finally {
          try { restore?.(); } catch { }
        }
      }

      const finalSrc = dataUrl ?? src!;
      // 3) URL/DataURL -> Blob
      const res = await fetch(finalSrc, { mode: "cors", cache: "no-store" });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const blob = await res.blob();
      const fileName = `birthday-feast-${new Date().toISOString().replace(/[:.]/g, "-")}.png`;

      // ---- 플랫폼별 저장 분기 ----
      const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const supportsDownload = "download" in HTMLAnchorElement.prototype;
      // @ts-ignore (레거시 Edge/IE)
      const canMsSave = typeof navigator.msSaveOrOpenBlob === "function";
      const canFS = "showSaveFilePicker" in window; // File System Access API

      // A) 레거시 Edge/IE
      // @ts-ignore
      if (canMsSave) {
        // @ts-ignore
        navigator.msSaveOrOpenBlob(blob, fileName);
        onClose?.();
        return;
      }

      // B) 크롬/엣지(데스크톱·안드로이드): File System Access API 우선
      if (canFS) {
        // @ts-ignore
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [{ description: "PNG Image", accept: { "image/png": [".png"] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        onClose?.();
        return;
      }

      // C) 그 외 대부분 브라우저: <a download>
      if (supportsDownload && !isiOS) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        // a.target 설정하지 않음 → 새 탭 방지
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        onClose?.();
        return;
      }

      // D) iOS: 새 탭 열기(길게 눌러 저장)
      if (isiOS) {
        const url = URL.createObjectURL(blob);
        // 팝업 차단 대비: open 실패 시 a 클릭으로 대체
        const opened = window.open(url, "_blank", "noopener,noreferrer");
        if (!opened) {
          const a = document.createElement("a");
          a.href = url;
          a.target = "_blank";
          a.rel = "noopener";
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
        onClose?.();
        return;
      }

      // E) 최후 폴백(드물게 download 미지원 + iOS 아님): 새 탭
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      onClose?.();
    } catch (e) {
      console.error("Download failed", e);
      // 마지막 최후 폴백: 원본이라도 열기
      if (src) window.open(src, "_blank", "noopener,noreferrer");
    }
  };


  const handleShare = async () => {
    try {
      if (onShare) {
        onShare(src!);
        return;
      }
      const res = await fetch(src!, { mode: "cors", cache: "no-store" });
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
    } catch (e) {
      console.error(e);
      alert(`이미지 공유/복사 실패\n${e}`);
    } finally {
      onClose(); // 완료 후 모달 닫기
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
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="max-h-[52dvh] overflow-hidden rounded-[5px] border-1 border-[#BEBEBE]
        flex items-center justify-center"
        >
          <img src={src} alt="캡쳐 이미지" className="w-full h-auto block" crossOrigin="anonymous" />
        </div>

        <h2 className="mt-2 ms-2 font-normal font-['KoreanSWGIG3'] text-[#FF8B8B] text-2xl">
          {todayString}
        </h2>

        <input
          className="ms-2 w-[90%] text-[#BFBFBF] text-base font-semibold font-['Pretendard']
        focus:outline-none focus:ring-1 focus:ring-[#BEBEBE] rounded-xs"
          placeholder="사진에 적힐 메시지를 적어주세요."
        />

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

const shareIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 22 24" fill="none">
    <path
      d="M17.5 23.0002C19.3226 23.0002 20.8001 21.5228 20.8001 19.7003C20.8001 17.8778 19.3226 16.4004 17.5 16.4004C15.6774 16.4004 14.2 17.8778 14.2 19.7003C14.2 21.5228 15.6774 23.0002 17.5 23.0002Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.5 7.59983C19.3226 7.59983 20.8001 6.1224 20.8001 4.29991C20.8001 2.47743 19.3226 1 17.5 1C15.6774 1 14.2 2.47743 14.2 4.29991C14.2 6.1224 15.6774 7.59983 17.5 7.59983Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.30002 15.299C6.12257 15.299 7.60004 13.8217 7.60004 11.9991C7.60004 10.1766 6.12257 8.69922 4.30002 8.69922C2.47747 8.69922 1 10.1766 1 11.9991C1 13.8217 2.47747 15.299 4.30002 15.299Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M14.7502 5.9502L7.05011 10.3501" stroke="white" strokeWidth="2" />
    <path d="M7.05011 13.6504L14.7502 18.0503" stroke="white" strokeWidth="2" />
  </svg>
);

const downloadIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="25" viewBox="0 0 19 25" fill="none">
    <path
      d="M1 23.6667H18"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.50002 1V18M9.50002 18L14.4584 13.0417M9.50002 18L4.54169 13.0417"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
