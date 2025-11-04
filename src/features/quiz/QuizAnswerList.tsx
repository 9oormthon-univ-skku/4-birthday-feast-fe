// src/features/quiz/QuizAnswerList.tsx
import React from 'react';
import clsx from 'clsx';
import OIcon from '@/assets/images/OIcon.svg';
import XIcon from '@/assets/images/XIcon.svg';

export type QuizQuestion = {
  questionId: number | string;
  content: string;
  answer: boolean; // true=O, false=X
  sequence: number;
};

type Props = {
  questions: QuizQuestion[];
  userAnswers: (boolean | null)[];
  /** 총 문항 수(옵션). 미전달 시 questions.length 사용 */
  total?: number;
  /** 기본: max-h-[70vh] */
  heightClassName?: string;
  className?: string;
};

export default function QuizAnswerList({
  questions,
  userAnswers,
  total,
  heightClassName = 'max-h-[70vh]',
  className,
}: Props) {
  const effectiveTotal = total ?? questions.length;

  return (
    <div className={clsx('mt-4 overflow-auto', heightClassName, className)}>
      <ul className="">
        {questions.map((q, i) => {
          const ua = userAnswers[i];
          const isCorrect = ua === q.answer; // null 포함 시 오답
          return (
            <div className={clsx(!isCorrect && 'bg-[#FFDEDE]')}>
              <li key={q.questionId ?? i} className=
                'flex items-stretch gap-2 py-4 px-6' >
                {/* 좌측 세로 라벨 — 카드와 분리 */}
                <div
                  className="w-2 h-12 rounded-[5px] bg-[#FF8B8B]"
                  aria-hidden
                />
                {/* 우측 카드 */}
                <div
                  className='flex w-full items-center justify-between rounded-[5px] pl-5 mr-2 bg-[#F3F3F3]'
                >
                  {/* 제목 (줄임표) */}
                  <div className="mr-3 min-w-0">
                    <div className="truncate text-sm font-medium font-['Pretendard'] text-black">
                      {q.content}
                    </div>
                  </div>
                </div>
                {/* 원형 O/X 배지 */}
                <div className="shrink-0">
                  {/* 실제 정답 O/X를 표시 */}
                  {q.answer ? (
                    <div
                      className="grid h-11 w-11 place-items-center rounded-full"
                      aria-label="정답"
                      title="정답"
                    >
                      <img src={OIcon} alt='' />
                    </div>
                  ) : (
                    <div
                      className="grid h-11 w-11 place-items-center rounded-full "
                      aria-label="오답"
                      title="오답"
                    >
                      <img src={XIcon} alt='' />
                    </div>
                  )}
                </div>
              </li>
            </div>

          );
        })}
      </ul>
    </div>
  );
}
