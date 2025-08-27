// src/features/TableCakes.tsx
import React from 'react';

export type CakeItem = {
  id: string | number;
  src: string;
  alt?: string;
};

type Slot = {
  key: 'center' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  left: string;     // '50%'
  bottom: string;   // '34%'  (모든 슬롯을 bottom 기준으로 잡습니다)
  width: string;    // 컨테이너 대비 너비
  anchorCenter?: boolean; // 수평 중앙정렬이면 true
};

/** 테이블 위 5개 고정 슬롯 (좌표는 필요에 맞게 조정 가능) */
const SLOTS: Slot[] = [
  // 가장 최근: 중앙
  { key: 'center',     left: '51%', bottom: '38%', width: '32%', anchorCenter: true },
  // 상단(뒤쪽) 좌/우
  { key: 'topLeft',    left: '8%', bottom: '55%', width: '34%' },
  { key: 'topRight',   left: '65%', bottom: '59%', width: '29%' },
  // 하단(앞쪽) 좌/우
  { key: 'bottomLeft', left: '5%', bottom: '15%', width: '35%' },
  { key: 'bottomRight',left: '62%', bottom: '20%', width: '32%' },
];

export default function TableCakes({
  items,
  uniformWidth,     // e.g. '22%' | '160px'
  zIndex = 20,
  onSelect,         // 버튼 클릭 핸들러(선택사항)
  buttonClassName,  // 버튼 추가 클래스(선택사항)
}: {
  items: CakeItem[];
  uniformWidth?: string;
  zIndex?: number;
  onSelect?: (item: CakeItem, index: number, e: React.MouseEvent<HTMLButtonElement>) => void;
  buttonClassName?: string;
}) {
  // 최근 5개만, 최근이 첫 슬롯(center)에 오도록
  const latestFive = items.slice(-5).reverse();

  return (
    <>
      {latestFive.map((cake, i) => {
        const slot = SLOTS[i];
        if (!slot) return null;

        const style: React.CSSProperties = {
          position: 'absolute',
          left: slot.left,
          bottom: slot.bottom,
          width: uniformWidth ?? slot.width,
          transform: slot.anchorCenter ? 'translateX(-50%)' : undefined,
          zIndex,
        };

        return (
          <button
            key={cake.id}
            type="button"
            aria-label={cake.alt ?? `cake-${cake.id}`}
            title={cake.alt ?? `cake-${cake.id}`}
            onClick={(e) => onSelect?.(cake, i, e)}
            style={style}
            className={[
              // 기본 버튼 리셋 & 클릭/포커스 시각화
              'absolute block bg-transparent p-0 m-0 border-0 outline-none',
              'cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2',
              'rounded-xl', // 링 모서리 둥글게
              buttonClassName ?? '',
            ].join(' ')}
          >
            <img
              src={cake.src}
              alt=""            // 접근성: 버튼의 aria-label이 이름을 제공하므로 중복 피하려고 비움
              role="presentation"
              className="block w-full h-auto object-contain select-none pointer-events-none drop-shadow-[0_5px_5px_rgba(0,0,0,0.15)]"
              draggable={false}
            />
          </button>
        );
      })}
    </>
  );
}
