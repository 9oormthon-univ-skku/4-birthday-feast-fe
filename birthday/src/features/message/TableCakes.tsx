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
  { key: 'center',     left: '48%', bottom: '38%', width: '30%', anchorCenter: true },
  // 상단(뒤쪽) 좌/우
  { key: 'topLeft',    left: '8%', bottom: '60%', width: '30%' },
  { key: 'topRight',   left: '70%', bottom: '60%', width: '28%' },
  // 하단(앞쪽) 좌/우
  { key: 'bottomLeft', left: '6%', bottom: '18%', width: '34%' },
  { key: 'bottomRight',left: '66%', bottom: '18%', width: '30%' },
];

export default function TableCakes({
  items,
  uniformWidth,     // 모든 슬롯 동일 크기로 강제하고 싶다면 e.g. '22%' 또는 '160px'
  zIndex = 10,      // 레이어링 제어 (table<cakes<balloons<host 등)
}: {
  items: CakeItem[];
  uniformWidth?: string;
  zIndex?: number;
}) {
  // 최근 5개만, 최근이 첫 슬롯(center)에 오도록
  const latestFive = items.slice(-5).reverse(); // [recent, ..., older]

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
          <img
            key={cake.id}
            src={cake.src}
            alt={cake.alt ?? `cake-${cake.id}`}
            style={style}
            className="object-contain select-none pointer-events-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.15)]"
          />
        );
      })}
    </>
  );
}
