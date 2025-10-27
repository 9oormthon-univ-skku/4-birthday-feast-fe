// src/features/quiz/useQuizById.ts
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQuiz, type Quiz, type QuizQuestion } from '@/apis/quiz';

// ---------- 로컬 스토리지 ----------
const STORAGE_KEY = 'bh.quiz.ox.draft';
const LS_LAST_QUIZ_ID = 'bh.lastQuizId';

// 서버 성공 결과를 로컬에 캐시(단, 폴백엔 사용하지 않음)
// function saveToStorage(data: Quiz) {
//   try {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
//   } catch { }
// }

function readLastQuizId(): string | number | undefined {
  try {
    const raw = localStorage.getItem(LS_LAST_QUIZ_ID);
    if (!raw) return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : (raw as string);
  } catch {
    return undefined;
  }
}

// 시퀀스 정렬/보정
function normalize(questions: QuizQuestion[]): QuizQuestion[] {
  return (questions || [])
    .map((q, i) => ({ ...q, sequence: q.sequence ?? i + 1 }))
    .sort((a, b) => a.sequence - b.sequence);
}

// 쿼리 키 빌더
const qkQuizById = (quizId: string | number) =>
  ['quiz', 'byId', String(quizId)] as const;

type UseQuizOptions = {
  /** 서버 성공 시 로컬 스토리지/lastQuizId 업데이트 (기본 true) */
  persistLocalOnSuccess?: boolean;
};

type UseQuizResult = {
  data: Quiz | null;
  /** 데이터 출처 (서버만 사용하거나 비어 있음) */
  source: 'server' | 'empty';
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  /** 마지막 퀴즈 ID(로컬에서 읽어온 값) */
  lastQuizId?: string | number;
};

/**
 * 서버 퀴즈 단건 조회 훅 (로컬 폴백 제거)
 * - quizId는 내부에서 로컬(LS_LAST_QUIZ_ID)에서 읽습니다.
 * - 서버 성공 시 normalize + 로컬 캐시(STORAGE_KEY, LS_LAST_QUIZ_ID)만 수행
 * - 서버 실패 또는 quizId 없음 시 data=null 유지
 */
export function useQuizById(options?: UseQuizOptions): UseQuizResult {
  const { persistLocalOnSuccess = true } = options || {};

  const lastQuizId = useMemo(readLastQuizId, []);
  const enabled = Boolean(lastQuizId);

  const query = useQuery<Quiz>({
    queryKey: enabled ? qkQuizById(lastQuizId as string | number) : ['quiz', 'noop'],
    enabled,
    queryFn: async () => {
      const q = await getQuiz(lastQuizId as string | number);
      const packed: Quiz = { ...q, questions: normalize(q.questions || []) };

      if (persistLocalOnSuccess) {
        // saveToStorage(packed);
        try {
          localStorage.setItem(LS_LAST_QUIZ_ID, String(q.quizId));
        } catch { }
      }
      return packed;
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
