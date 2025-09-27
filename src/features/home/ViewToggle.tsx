import { useState } from "react";

export default function ViewToggle() {
  const [isIconView, setIsIconView] = useState(true);
  return (
    <>
      {/* 토글 */}
      <button
        type="button"
        aria-pressed={isIconView}
        onClick={() => setIsIconView((v) => !v)}
        className={[
          'relative inline-flex items-center h-7 w-14 rounded-full transition-colors',
          isIconView ? 'bg-[#FF8B8B]' : 'bg-white',
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
    </>
  );
}