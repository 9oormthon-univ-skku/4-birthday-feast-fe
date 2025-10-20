// src/pages/PlayQuizPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/ui/AppLayout';
import QuizRankList from '@/features/quiz/QuizRankList';
import QuizPlay from '@/features/quiz/QuizPlay';
import QuizAnswerList from '@/features/quiz/QuizAnswerList';
import { useLocation, useNavigate } from 'react-router-dom';
// 여기서 퀴즈 불러오는 api는 guest 전용 !!!!
// guest만 접근 가능하도록 하는 로직 추가 필요 !!!!
// host일 경우 ui만 표시, api 연결은 없음 (퀴즈 조회만 api 연결, 결과 등록은 하지 않음)

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
  const location = useLocation();

  const initial = useMemo<QuizData>(() => {
    const stored = loadFromStorage();
    if (stored) return { ...stored, questions: normalize(stored.questions) };
    return { quizId: 'local-quiz', questions: [], updatedAt: new Date().toISOString() };
  }, []);

  const [questions, setQuestions] = useState<QuizQuestion[]>(initial.questions);
  const [index, setIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(boolean | null)[]>(
    Array(initial.questions.length).fill(null)
  );
  const [finished, setFinished] = useState(false);

  // ⬇️ 추가: 결과화면 내 랭킹/오답 탭 전환
  const [showAnswers, setShowAnswers] = useState(false);

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
        setShowAnswers(false); // 동기화 시 뷰 초기화
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

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
    total === 0 ? 0 : Math.min((index / Math.max(total, 1)) * 100, 100);

  const resetToMain = () => {
    setIndex(0);
    setUserAnswers(Array(total).fill(null));
    setFinished(false);
    setShowAnswers(false);
    navigate({ pathname: '../main', search: location.search });
  };

  const goRank = () => setShowAnswers(false);
  const goAnswers = () => setShowAnswers(true);

  const footerLabel = finished
    ? (showAnswers ? '랭킹으로' : '처음으로')
    : undefined;

  const footerAction = finished
    ? (showAnswers ? goRank : resetToMain)
    : undefined;

  return (
    <AppLayout
      showBack
      showMenu={false}
      showBrush={false}
      title={<span className="text-[#FF8B8B]">생일 퀴즈</span>}
      footerButtonLabel={footerLabel}
      onFooterButtonClick={footerAction}
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

          <QuizPlay
            content={current?.content}
            onChoose={handleChoose}
            disabled={finished || !current}
          />
        </section>
      ) : (
        /* ---------------- 결과 화면 ---------------- */
        <section className="pt-9">
          <h2 className="text-4xl font-normal font-['KoreanSWGIG3'] text-[#FF8B8B]">결과는?</h2>
          <p className="mt-1 mb-4 text-2xl font-normal font-['KoreanSWGIG3'] text-[#A0A0A0]">
            {total}문제 중 <span className="text-[#FF8B8B]">{correctCount}</span>문제 맞췄어요!
          </p>

          {/* 토글 버튼 (필요 시) */}
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              className={clsxBtn(!showAnswers)}
              onClick={goRank}
            >
              랭킹
            </button>
            <button
              type="button"
              className={clsxBtn(showAnswers)}
              onClick={goAnswers}
            >
              오답보기
            </button>
          </div>

          {showAnswers ? (
            <QuizAnswerList
              questions={questions}
              userAnswers={userAnswers}
              heightClassName="max-h-[70vh]"
            />
          ) : (
            <QuizRankList
              heightClassName="max-h-[70vh]"
              onShowAnswers={goAnswers} // ⬅️ 랭킹에서 “오답보기” 누르면 전환
            />
          )}
        </section>
      )}
    </AppLayout>
  );
}

/** 내부 유틸: 탭 버튼 스타일 */
function clsxBtn(active: boolean) {
  return [
    'rounded-full px-3 py-1 text-xs font-semibold shadow-sm active:scale-95 transition',
    active ? 'bg-[#FF8B8B] text-white' : 'bg-neutral-200 text-neutral-700'
  ].join(' ');
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
