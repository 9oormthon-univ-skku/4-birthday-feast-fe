import React, { useEffect, useRef, useState } from "react";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  /** 초기 스냅: 0=닫힘, 0.3=미니, 0.85=풀 */
  initialSnap?: 0 | 0.3 | 0.85;
  /** 시트 내부 컨텐츠 */
  children: React.ReactNode;
  /** 시트 상단 제목(선택) */
  title?: string;
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export default function BottomSheet({
  open,
  onClose,
  initialSnap = 0.3,
  children,
  title,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const [heightRatio, setHeightRatio] = useState<number>(initialSnap); // 0 ~ 0.95

  // 바디 스크롤 락
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  useEffect(() => {
    if (open) setHeightRatio(initialSnap);
  }, [open, initialSnap]);

  // 드래그 시작
  const onPointerDown = (e: React.PointerEvent) => {
    if (!sheetRef.current) return;
    sheetRef.current.setPointerCapture(e.pointerId);
    startY.current = e.clientY;
    startHeight.current = heightRatio;
  };

  // 드래그 중
  const onPointerMove = (e: React.PointerEvent) => {
    if (!sheetRef.current || startY.current === 0) return;
    const vh = window.innerHeight;
    const deltaY = e.clientY - startY.current; // 아래로 끌면 +값
    const newRatio = clamp(startHeight.current - deltaY / vh, 0, 0.95);
    setHeightRatio(newRatio);
  };

  // 드래그 종료 → 스냅
  const onPointerUp = () => {
    startY.current = 0;
    const snaps = [0, 0.3, 0.85];
    // 가장 가까운 스냅으로 정착
    let nearest = snaps[0];
    let best = Infinity;
    for (const s of snaps) {
      const diff = Math.abs(s - heightRatio);
      if (diff < best) {
        best = diff;
        nearest = s;
      }
    }
    if (nearest === 0) {
      onClose();
      // 애니메이션 자연스럽게 보이도록 약간 지연 후 0으로
      setTimeout(() => setHeightRatio(0), 150);
    } else {
      setHeightRatio(nearest);
    }
  };

  // 닫기(오버레이 클릭)
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden={!open}
        onClick={handleOverlayClick}
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      {/* Sheet */}
      <section
        aria-modal="true"
        role="dialog"
        className="fixed left-0 right-0 bottom-0 z-[70] flex justify-center"
        style={{
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 300ms cubic-bezier(0.2,0.8,0.2,1)",
        }}
      >
        <div
          ref={sheetRef}
          className="w-full max-w-md mx-auto rounded-t-3xl bg-[#FFF6EC] shadow-2xl border-t border-[#EFD9C6] flex flex-col"
          style={{
            height: `${heightRatio * 100}vh`,
          }}
        >
          {/* Drag handle + Header */}
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className="relative select-none"
          >
            <div className="flex items-center justify-center pt-3 pb-2">
              <span className="block w-12 h-1.5 rounded-full bg-[#EECDB9]" />
            </div>

            <div className="px-4 pb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#FF8B8B]">{title}</h2>
              <button
                onClick={onClose}
                className="text-xs px-3 py-1 rounded-full bg-white border border-[#F0D9C8] shadow-sm active:scale-95"
              >
                닫기
              </button>
            </div>
          </div>

          {/* Content (scrollable) */}
          <div className="min-h-0 flex-1 overflow-auto px-4 pb-8">
            {children}
          </div>
        </div>
      </section>
    </>
  );
}
