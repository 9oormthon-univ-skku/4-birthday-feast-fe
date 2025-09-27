// src/features/quiz/QuizResultList.tsx
import React, { useState } from 'react';
import clsx from 'clsx';

export type QuizResultQuestion = {
  questionId: number;
  content: string;
  answer: boolean; // true=O, false=X
  sequence: number;
};

type Props = {
  questions: QuizResultQuestion[];
  userAnswers: (boolean | null)[];
  total: number;
  /** 기본: max-h-[70vh] */
  heightClassName?: string;
  className?: string;
};

export default function QuizResultList({
  questions,
  userAnswers,
  total,
  heightClassName = 'max-h-[70vh]',
  className,
}: Props) {
  // 오답 상세 토글 상태
  const [openWrongIdx, setOpenWrongIdx] = useState<number | null>(null);

  return (
    <div className={clsx('mt-5 overflow-auto pr-1', heightClassName, className)}>
      <ul className="space-y-2">
        {questions.map((q, i) => {
          const user = userAnswers[i];
          const isCorrect = user === q.answer;
          const active = openWrongIdx === i && !isCorrect;

          return (
            <li
              key={q.questionId}
              className={clsx(
                'flex items-center justify-between rounded-lg border px-3 py-2',
                isCorrect ? 'border-neutral-200 bg-white' : 'border-[#F1B3B3] bg-[#FFF5F5]',
                active && 'ring-1 ring-[#FF8B8B]'
              )}
            >
              {/* 왼쪽: 번호 + 질문 */}
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={clsx(
                    'grid h-7 w-7 place-items-center rounded-full border-2 text-xs font-bold',
                    isCorrect ? 'border-neutral-300 text-[#E49393]' : 'border-[#E49393] text-[#E49393]'
                  )}
                >
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-neutral-600">{q.content}</div>
                  <div className="text-[11px] text-neutral-400">
                    {i + 1}/{total}
                  </div>
                </div>
              </div>

              {/* 오른쪽: 정답 라벨 / 오답보기 버튼 */}
              <div className="shrink-0">
                {isCorrect ? (
                  <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-400">
                    정답
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpenWrongIdx(active ? null : i)}
                    className="rounded-full bg-[#FF8B8B] px-3 py-1 text-xs font-semibold text-white shadow-sm active:scale-95 transition"
                  >
                    오답보기
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* 오답 상세 */}
      {openWrongIdx !== null && userAnswers[openWrongIdx] !== questions[openWrongIdx].answer && (
        <div className="mt-3 rounded-lg border border-[#F1B3B3] bg-[#FFF5F5] p-3 text-sm text-neutral-600">
          <div className="font-semibold text-[#E49393]">오답 확인</div>
          <div className="mt-1">
            <span className="text-neutral-500">문항: </span>
            {questions[openWrongIdx].content}
          </div>
          <div className="mt-1">
            <span className="text-neutral-500">내 답: </span>
            {userAnswers[openWrongIdx] ? 'O' : 'X'}
          </div>
          <div className="mt-1">
            <span className="text-neutral-500">정답: </span>
            {questions[openWrongIdx].answer ? 'O' : 'X'}
          </div>
        </div>
      )}
    </div>
  );
}
