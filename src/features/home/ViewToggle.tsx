// src/features/home/ViewToggle.tsx
import React from "react";

type Props = {
  isIconView: boolean;
  onToggle: (next: boolean) => void;
  className?: string;
};

export default function ViewToggle({ isIconView, onToggle, className }: Props) {
  return (
    <button
      type="button"
      aria-pressed={isIconView}
      onClick={() => onToggle(!isIconView)}
      className={[
        'relative inline-flex items-center h-7 w-14 rounded-full transition-colors',
        isIconView ? 'bg-[#FF8B8B]' : 'bg-white',
        className ?? ''
      ].join(' ')}
    >
      <span
        className={[
          'absolute text-xs font-semibold',
          isIconView ? 'left-[27px] text-white' : 'left-[7px] text-[#FF8B8B]',
        ].join(' ')}
      >
        {isIconView ? 'Icon' : 'List'}
      </span>
      <span
        className={[
          'inline-block h-5 w-5 rounded-full shadow transform transition',
          isIconView ? 'translate-x-[3px] bg-white' : 'translate-x-[32px] bg-[#FF8B8B]',
        ].join(' ')}
      />
    </button>
  );
}
