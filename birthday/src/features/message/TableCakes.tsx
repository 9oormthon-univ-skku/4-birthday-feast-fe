// src/features/TableCakes.tsx
import React, { MouseEvent } from 'react';
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
  { key: 'middleLeft', left: '5%', bottom: '37%', width: '32%' },
  { key: 'bottomLeft', left: '22%', bottom: '16%', width: '32%' },
  { key: 'bottomRight', left: '62%', bottom: '20%', width: '33%' },
];

export default function TableCakes({
  items,
  uniformWidth,
  zIndex = 20,
  onSelect,
  buttonClassName,
}: {
  items: CakeItem[];
  uniformWidth?: string;
  zIndex?: number;
  onSelect?: (item: CakeItem, index: number, e: MouseEvent<HTMLButtonElement>) => void;
  buttonClassName?: string;
}) {
  const navigate = useNavigate();

  return (
    <>
      {items.map((cake, i) => {
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

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
          onSelect?.(cake, i, e);
          navigate(`/message?i=${i}`, { state: { cakeId: cake.id } });
        };

        return (
          <button
            key={cake.id}
            type="button"
            onClick={handleClick}
            style={style}
            aria-label={cake.alt ?? `cake-${cake.id}`}
            title={cake.alt ?? `cake-${cake.id}`}
            className={[
              'absolute block bg-transparent p-0 m-0 border-0 outline-none',
              'cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2',
              'rounded-xl',
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
    </>
  );
}
