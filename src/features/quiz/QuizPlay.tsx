// src/features/quiz/OXQuestion.tsx
import React from 'react';

type QuizPlayProps = {
  content?: string;
  onChoose: (answer: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export default function QuizPlay({
  content,
  onChoose,
  disabled = false,
  className = '',
}: QuizPlayProps) {
  return (
    <div className={className}>
      {/* 문제 */}
      <div className="my-20 text-center text-2xl font-normal leading-snug break-keep text-[#FF8B8B] font-['KoreanSWGIG3']">
        {content ?? ''}
      </div>

      {/* O / X */}
      <div className="mt-10 flex items-center justify-center gap-8">
        <button
          type="button"
          aria-label="O"
          disabled={disabled}
          onClick={() => onChoose(true)}
          className="grid h-16 w-16 place-items-center rounded-full bg-[#FF8B8B] shadow-sm active:scale-95 transition disabled:opacity-50 disabled:active:scale-100"
        >
          {OIcon}
        </button>
        <button
          type="button"
          aria-label="X"
          disabled={disabled}
          onClick={() => onChoose(false)}
          className="grid h-16 w-16 place-items-center rounded-full border-2 border-neutral-300 bg-white text-neutral-400 shadow-sm active:scale-95 transition disabled:opacity-50 disabled:active:scale-100"
        >
          {XIcon}
        </button>
      </div>
    </div>
  );
}

const OIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none" aria-hidden="true">
    <path d="M12.6207 23.2414C18.4863 23.2414 23.2414 18.4863 23.2414 12.6207C23.2414 6.75504 18.4863 2 12.6207 2C6.75504 2 2 6.75504 2 12.6207C2 18.4863 6.75504 23.2414 12.6207 23.2414Z" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const XIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" fill="none" aria-hidden="true">
    <path d="M21.3556 2L2 21.3556M2 2L21.3556 21.3556" stroke="#FF8B8B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
