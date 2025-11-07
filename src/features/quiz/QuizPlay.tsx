// src/features/quiz/OXQuestion.tsx
import React from 'react';
import OIcon from '@/assets/images/OIcon.svg';
import XIcon from '@/assets/images/XIcon.svg';

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
      <div className="text-center text-2xl font-normal leading-snug break-keep text-[#FF8B8B] font-['KoreanSWGIG3']">
        {content ?? ''}
      </div>

      {/* O / X */}
      <div className="mt-[13dvh] flex items-center justify-center gap-8">
        <button
          type="button"
          aria-label="O"
          disabled={disabled}
          onClick={() => onChoose(true)}
        >
          <img src={OIcon} alt='' />
        </button>
        <button
          type="button"
          aria-label="X"
          disabled={disabled}
          onClick={() => onChoose(false)}
        >
          <img src={XIcon} alt='' />
        </button>
      </div>
    </div>
  );
}
