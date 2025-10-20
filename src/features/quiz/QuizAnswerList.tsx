// src/features/quiz/QuizAnswerList.tsx
import React from 'react';
import clsx from 'clsx';

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
    <div className={clsx('mt-4 overflow-auto pr-1', heightClassName, className)}>
      <ul className="space-y-3">
        {questions.map((q, i) => {
          const ua = userAnswers[i];
          const isCorrect = ua === q.answer; // null 포함 시 오답
          return (
            <li
              key={q.questionId ?? i}
              className={clsx(
                'relative flex items-center justify-between rounded-xl px-3 py-3',
                'bg-[#FFEAEA]' // 행 배경 (아주 연한 분홍)
              )}
            >
              {/* 좌측 세로 라벨 */}
              <span
                className="pointer-events-none absolute left-0 top-0 h-full w-[10px] rounded-l-xl bg-[#FFC1C1]"
                aria-hidden
              />

              {/* 왼쪽: 문항 제목(줄임표) */}
              <div className="ml-3 mr-3 min-w-0">
                <div className="truncate text-[15px] font-semibold text-[#6B6B6B]">
                  {q.content}
                </div>
              </div>

              {/* 오른쪽: 원형 O/X 배지 */}
              <div className="shrink-0">
                {isCorrect ? (
                  <div
                    className={clsx(
                      'grid h-8 w-8 place-items-center rounded-full',
                      'bg-[#FF8B8B] text-white text-sm font-bold shadow-sm'
                    )}
                    aria-label="정답"
                    title="정답"
                  >
                    O
                  </div>
                ) : (
                  <div
                    className={clsx(
                      'grid h-8 w-8 place-items-center rounded-full border',
                      'border-[#FF8B8B] text-[#FF8B8B] text-sm font-bold bg-white'
                    )}
                    aria-label="오답"
                    title="오답"
                  >
                    X
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
