// src/features/message/TableCakes.tsx
import React, { MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { CakeItem } from "@/types/birthday";

type Slot = {
  key: 'center' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'middleLeft';
  left: string;
  bottom: string;
  width: string;
  anchorCenter?: boolean;
};

const SLOTS: Slot[] = [
  { key: 'center', left: '54%', bottom: '44%', width: '33%', anchorCenter: true },
  { key: 'topLeft', left: '8%', bottom: '58%', width: '30%' },
  { key: 'topRight', left: '69%', bottom: '59%', width: '30%' },
  { key: 'middleLeft', left: '4%', bottom: '37%', width: '30%' },
  { key: 'bottomLeft', left: '23%', bottom: '14%', width: '32%' },
  { key: 'bottomRight', left: '62%', bottom: '20%', width: '33%' },
];

export default function TableCakes({
  items,
  uniformWidth,
  // zIndex = 20,
  onSelect,
  buttonClassName,
}: {
  items: CakeItem[];
  uniformWidth?: string;
  // zIndex?: number;
  onSelect?: (item: CakeItem, index: number, e: MouseEvent<HTMLButtonElement>) => void;
  buttonClassName?: string;
}) {
  const navigate = useNavigate();

  // ===== 캐러셀 상태 =====
  const PAGE_SIZE = 6;
  const pageCount = Math.max(Math.ceil(items.length / PAGE_SIZE), 1);
  const [page, setPage] = useState(0);

  // items 변경 시 페이지 안전화
  useEffect(() => {
    setPage((p) => Math.min(Math.max(p, 0), Math.max(pageCount - 1, 0)));
  }, [pageCount]);

  // 현재 페이지 아이템 6개
  const pageItems = useMemo(() => {
    if (items.length === 0) return [];
    const start = page * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  const loop = true;
  const canPrev = loop || page > 0;
  const canNext = loop || page < pageCount - 1;

  const next = () => {
    setPage((p) => {
      if (p < pageCount - 1) return p + 1;
      return loop ? 0 : p;
    });
  };
  const prev = () => {
    setPage((p) => {
      if (p > 0) return p - 1;
      return loop ? pageCount - 1 : p;
    });
  };

  // 키보드 ←/→
  useEffect(() => {
    if (pageCount <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && canNext) next();
      if (e.key === 'ArrowLeft' && canPrev) prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pageCount, canNext, canPrev]);

  // 스와이프(모바일)
  const swipeRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = swipeRef.current;
    if (!el || pageCount <= 1) return;
    let startX = 0;
    const onStart = (e: TouchEvent) => (startX = e.touches[0].clientX);
    const onMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - startX;
      if (Math.abs(dx) > 60) {
        if (dx < 0 && canNext) next();
        if (dx > 0 && canPrev) prev();
        startX = e.touches[0].clientX; // 연속 스와이프 허용
      }
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
    };
  }, [pageCount, canNext, canPrev]);

  return (
    <>
      {/* 스와이프 영역 래퍼 (테이블 이미지와 같은 relative 컨테이너 안에서 절대 위치) */}
      <div ref={swipeRef} className="absolute inset-0 z-100 pointer-events-none">
        {/* 케이크 6개 배치 */}
        {pageItems.map((cake, i) => {
          const slot = SLOTS[i];
          if (!slot) return null;

          const style: React.CSSProperties = {
            position: 'absolute',
            left: slot.left,
            bottom: slot.bottom,
            width: uniformWidth ?? slot.width,
            transform: slot.anchorCenter ? 'translateX(-50%)' : undefined,
            // zIndex,
          };

          const globalIndex = page * PAGE_SIZE + i;

          const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            onSelect?.(cake, globalIndex, e);
            navigate(`/message?i=${globalIndex}`, { state: { cakeId: cake.id } });
          };

          return (
            <button
              key={`${cake.id}-${globalIndex}`}
              type="button"
              onClick={handleClick}
              style={style}
              aria-label={cake.alt ?? `cake-${cake.id}`}
              title={cake.alt ?? `cake-${cake.id}`}
              className={[
                'absolute block bg-transparent p-0 m-0 border-0 outline-none',
                'cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2',
                'rounded-xl pointer-events-auto', // ← 클릭 가능
                buttonClassName ?? '',
              ].join(' ')}
            >
              <img
                src={cake.src}
                alt=""
                role="presentation"
                className="block w-full h-auto object-contain select-none pointer-events-none drop-shadow-[0_5px_5px_rgba(0,0,0,0.15)]"
                draggable={false}
              />
            </button>
          );
        })}

        {/* 좌/우 화살표 (페이지가 2개 이상일 때만) */}
        {pageCount > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              disabled={!canPrev}
              aria-label="이전"
              className="pointer-events-auto absolute left-2 top-1/4 -translate-y-1/2 bg-transparent disabled:opacity-40 z-30"
              data-capture="hide"
            >
              {goLeft}
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!canNext}
              aria-label="다음"
              className="pointer-events-auto absolute right-2 top-1/4 -translate-y-1/2 bg-transparent disabled:opacity-40 z-30"
              data-capture="hide"
            >
              {goRight}
            </button>
          </>
        )}
      </div>
    </>
  );
}

// ---------- 아이콘 svg ---------
const goLeft = <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
  <rect width="30" height="30" rx="15" transform="matrix(-1 0 0 1 30 0)" fill="#60343F" />
  <path d="M18.75 22.5L11.25 15L18.75 7.5" stroke="#FF8B8B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
</svg>
const goRight = <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
  <rect width="30" height="30" rx="15" fill="#60343F" />
  <path d="M11.25 22.5L18.75 15L11.25 7.5" stroke="#FF8B8B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
</svg>