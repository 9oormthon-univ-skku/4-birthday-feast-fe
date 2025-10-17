// src/pages/PlayQuizPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
// 필요 시 결과/랭크 컴포넌트 사용
import QuizResultList from '@/features/quiz/QuizResultList';
import QuizRankList from '@/features/quiz/QuizRankList';
import { useLocation, useNavigate } from 'react-router-dom';

// 여기서 퀴즈 불러오는 api는 guest 전용 !!!!
// guest만 접근 가능하도록 하는 로직 추가 필요 !!!!

/* ---------- 타입 ---------- */
type QuizQuestion = {
  questionId: number | string;
  content: string;
  answer: boolean; // true=O, false=X
  sequence: number;
};
type QuizData = {
  quizId: number | string;
  birthdayId?: number | string;
  questions: QuizQuestion[];
  updatedAt?: string;
};

/* ---------- 로컬 스토리지 ---------- */
const STORAGE_KEY = 'bh.quiz.ox.draft';

// 안전 로드
function loadFromStorage(): QuizData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.questions)) return null;
    return data as QuizData;
  } catch {
    return null;
  }
}

// 시퀀스 정렬/보정
function normalize(questions: QuizQuestion[]): QuizQuestion[] {
  return questions
    .map((q, i) => ({ ...q, sequence: q.sequence ?? i + 1 }))
    .sort((a, b) => a.sequence - b.sequence);
}

/* ---------- 페이지 ---------- */
export default function PlayQuizPage() {
  const navigate = useNavigate();
  const location = useLocation(); // 현재 쿼리 유지용

  // 최초 로드 시점에만 스토리지에서 불러오기
  const initial = useMemo<QuizData>(() => {
    const stored = loadFromStorage();
    if (stored) {
      return { ...stored, questions: normalize(stored.questions) };
    }
    return { quizId: 'local-quiz', questions: [], updatedAt: new Date().toISOString() };
  }, []);

  const [questions, setQuestions] = useState<QuizQuestion[]>(initial.questions);
  const [index, setIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(boolean | null)[]>(
    Array(initial.questions.length).fill(null)
  );
  const [finished, setFinished] = useState(false);

  // 다른 탭/창에서 변경 시 실시간 반영
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = loadFromStorage();
      if (next?.questions) {
        const normalized = normalize(next.questions);
        setQuestions(normalized);
        setIndex(0);
        setUserAnswers(Array(normalized.length).fill(null));
        setFinished(false);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // 질문 길이가 바뀌면 답안 배열/인덱스 안전 보정
  useEffect(() => {
    setUserAnswers((prev) => {
      if (prev.length === questions.length) return prev;
      return Array(questions.length).fill(null);
    });
    setIndex((i) => Math.min(i, Math.max(questions.length - 1, 0)));
  }, [questions.length]);

  const total = questions.length;
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

  const correctCount =
    total === 0
      ? 0
      : userAnswers.reduce((acc, v, i) => acc + (v === questions[i]?.answer ? 1 : 0), 0);

  const progressPct =
    total === 0 ? 0 : Math.min(((index) / Math.max(total, 1)) * 100, 100);

  const reset = () => {
    setIndex(0);
    setUserAnswers(Array(total).fill(null));
    setFinished(false);
    // ✅ /u/:userId/main 으로 이동 + ?code=... 유지
    navigate({ pathname: '../main', search: location.search });
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
      {total === 0 ? (
        <section className="py-20 text-center">
          <h3 className="text-xl text-[#FF8B8B] font-['KoreanSWGIG3']">등록된 퀴즈가 없어요</h3>
          <p className="mt-2 text-sm text-[#A0A0A0]">
            생일자가 퀴즈를 등록하면 여기에서 풀 수 있어요.
          </p>
        </section>
      ) : !finished ? (
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

          {/* 필요에 따라 결과/랭킹 중 택1 */}
          {/* <QuizResultList questions={questions} userAnswers={userAnswers} total={total} heightClassName="max-h-[70vh]" /> */}
          <QuizRankList />
        </section>
      )}
    </AppLayout>
  );
}

/* ---------- 아이콘 svg ---------- */
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
