// src/features/quiz/useQuizById.ts
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQuiz, type Quiz, type QuizQuestion } from '@/apis/quiz';
import { LS_LAST_QUIZ } from '@/stores/authStorage';

// ---------- 로컬 스토리지 ----------
const STORAGE_KEY = 'bh.quiz.ox.draft';

// 시퀀스 정렬/보정
function normalize(questions: QuizQuestion[]): QuizQuestion[] {
  return (questions || [])
    .map((q, i) => ({ ...q, sequence: q.sequence ?? i + 1 }))
    .sort((a, b) => a.sequence - b.sequence);
}

function readLastQuizId(): string | number | undefined {
  try {
    const raw = localStorage.getItem(LS_LAST_QUIZ);
    if (!raw) return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : (raw as string);
  } catch {
    return undefined;
  }
}

// 쿼리 키 빌더
const qkQuizById = (quizId: string | number) =>
  ['quiz', 'byId', String(quizId)] as const;

type UseQuizOptions = {
  /** 서버 성공 시 로컬 스토리지/lastQuizId 업데이트 (기본 true) */
  persistLocalOnSuccess?: boolean;
  enabled?: boolean;
};

type UseQuizResult = {
  data: Quiz | null;
  source: 'server' | 'empty';
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  lastQuizId?: string | number;
};

/**
 * 서버 퀴즈 단건 조회 훅 (에러 안전 처리)
 */
export function useQuizById(options?: UseQuizOptions): UseQuizResult {
  const { persistLocalOnSuccess = true } = options || {};

  const lastQuizId = useMemo(readLastQuizId, []);
  const enabled = Boolean(lastQuizId);

  const query = useQuery<Quiz>({
    queryKey: enabled ? qkQuizById(lastQuizId as string | number) : ['quiz', 'noop'],
    enabled,
    queryFn: async () => {
      try {
        const q = await getQuiz(lastQuizId as string | number);
        const packed: Quiz = { ...q, questions: normalize(q.questions || []) };

        if (persistLocalOnSuccess) {
          try {
            localStorage.setItem(LS_LAST_QUIZ, String(q.quizId));
          } catch {
            // 로컬 쓰기 실패는 무시
          }
        }

        return packed;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('❌ getQuiz failed:', err);
        alert(`퀴즈 불러오기 실패\n${err}`);
        // react-query로 에러 전파 (쿼리 상태가 isError로 전환됨)
        throw err;
      }
    },
    retry: 1,
  });

  // ---------- 최종 data/source ----------
  const data = query.data ?? null;
  const source: UseQuizResult['source'] = data ? 'server' : 'empty';

  // 로딩/에러 플래그
  const isLoading = enabled ? (query.isFetching || query.isLoading) : false;
  const isError = enabled ? Boolean(query.isError) : false;

  return {
    data,
    source,
    isLoading,
    isError,
    error: query.error,
    lastQuizId,
  };
}
