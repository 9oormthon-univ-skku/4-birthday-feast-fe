// src/pages/QuizPage.tsx
import React, { useMemo, useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import rawQuiz from '@/features/quiz/quizDummy.json';
import QuizResultList from '@/features/quiz/QuizResultList';
import QuizRankList from '@/features/quiz/QuizRankList';

type QuizQuestion = {
  questionId: number;
  content: string;
  answer: boolean;
  sequence: number;
};
type QuizData = {
  quizId: number;
  birthdayId: number;
  questions: QuizQuestion[];
};

const initialQuizData: QuizData = rawQuiz as QuizData;

export default function PlayQuizPage() {
  const questions = useMemo<QuizQuestion[]>(
    () => [...initialQuizData.questions].sort((a, b) => a.sequence - b.sequence),
    []
  );

  const total = questions.length;
  const [index, setIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(boolean | null)[]>(Array(total).fill(null));
  const [finished, setFinished] = useState(false);

  const current = questions[index];

  const handleChoose = (ans: boolean) => {
    setUserAnswers((prev) => {
      const next = [...prev];
      next[index] = ans;
      return next;
    });
    if (index < total - 1) setIndex((i) => i + 1);
    else setFinished(true);
  };

  const correctCount = userAnswers.reduce(
    (acc, v, i) => acc + (v === questions[i]?.answer ? 1 : 0),
    0
  );
  const progressPct = Math.min((index / Math.max(total, 1)) * 100, 100);

  const reset = () => {
    setIndex(0);
    setUserAnswers(Array(total).fill(null));
    setFinished(false);
  };

  return (
    <AppLayout
      showBack
      showMenu={false}
      showBrush={false}
      title={<span className="text-[#FF8B8B]">생일 퀴즈</span>}
      footerButtonLabel={finished ? '처음으로' : undefined}
      onFooterButtonClick={finished ? reset : undefined}
    >
      {!finished ? (
        <section className="pt-2">
          {/* 진행바 */}
          <div className="mt-28 mx-auto mb-8 w-64">
            <div className="mb-1 text-[11px] font-semibold text-[#FF8B8B]">
              {index + 1}/{total}
            </div>
            <div className="h-1 w-full overflow-hidden rounded bg-[#D9D9D9]">
              <div className="h-full bg-[#FF8B8B]" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* 문제 */}
          <div className="my-20 text-center text-2xl font-normal leading-snug text-[#FF8B8B] font-['KoreanSWGIG3']">
            {current?.content ?? ''}
          </div>

          {/* O / X */}
          <div className="mt-10 flex items-center justify-center gap-8">
            <button
              type="button"
              aria-label="O"
              onClick={() => handleChoose(true)}
              className="grid h-16 w-16 place-items-center rounded-full bg-[#FF8B8B] shadow-sm active:scale-95 transition"
            >
              {O}
            </button>
            <button
              type="button"
              aria-label="X"
              onClick={() => handleChoose(false)}
              className="grid h-16 w-16 place-items-center rounded-full border-2 border-neutral-300 bg-white text-neutral-400 shadow-sm active:scale-95 transition"
            >
              {X}
            </button>
          </div>
        </section>
      ) : (
        /* ---------------- 결과 화면 ---------------- */
        <section className="pt-9">
          <h2 className="text-4xl font-normal font-['KoreanSWGIG3'] text-[#FF8B8B]">결과는?</h2>
          <p className="mt-1 mb-4 text-2xl font-normal font-['KoreanSWGIG3'] text-[#A0A0A0]">
            {total}문제 중 <span className="text-[#FF8B8B]">{correctCount}</span>문제 맞췄어요!
          </p>

          {/* ✅ 분리된 스크롤 리스트 */}
          {/* <QuizResultList
            questions={questions}
            userAnswers={userAnswers}
            total={total}
            heightClassName="max-h-[70vh]"
          /> */}
          <QuizRankList />
        </section>
      )}
    </AppLayout>
  );
}

// ---------- 아이콘 svg ----------
const O = (
  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
    <path d="M12.6207 23.2414C18.4863 23.2414 23.2414 18.4863 23.2414 12.6207C23.2414 6.75504 18.4863 2 12.6207 2C6.75504 2 2 6.75504 2 12.6207C2 18.4863 6.75504 23.2414 12.6207 23.2414Z" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const X = (
  <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" fill="none">
    <path d="M21.3556 2L2 21.3556M2 2L21.3556 21.3556" stroke="#FF8B8B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
