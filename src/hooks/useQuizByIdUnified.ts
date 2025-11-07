// src/features/quiz/useQuizByIdUnified.ts
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useBirthdayMode } from '@/app/ModeContext';
import { getQuiz, type Quiz, type QuizQuestion } from '@/apis/quiz';
import { getGuestQuiz, type GuestQuizGetRes } from '@/apis/guest';
import { getEffectiveQuizId } from '@/utils/getEffectiveQuizId';
import { LS_LAST_QUIZ } from '@/stores/userStorage';

/** 공통 반환 데이터 (게스트/호스트 통합) */
export type UnifiedQuiz = {
  quizId: number;
  birthdayId: number;
  questions: QuizQuestion[];   // 정렬/보정된 질문
  _source: 'host' | 'guest';   // 어떤 API에서 왔는지
  _raw: Quiz | GuestQuizGetRes; // 원본 응답(필요 시 참조)
};

export type UseQuizByIdUnifiedOptions = {
  /** 쿼리 자동 실행 on/off (기본 true) */
  enabled?: boolean;
  /** 호스트 모드에서 성공 시 lastQuizId 갱신 (기본 true) */
  persistLocalOnSuccess?: boolean;
};

export type UseQuizByIdUnifiedResult = {
  quizId?: number;
  data: UnifiedQuiz | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<void>;
};

function normalize(questions: QuizQuestion[]): QuizQuestion[] {
  return (questions || [])
    .map((q, i) => ({ ...q, sequence: q.sequence ?? i + 1 }))
    .sort((a, b) => a.sequence - b.sequence);
}

export function useQuizByIdUnified(
  opts: UseQuizByIdUnifiedOptions = {}
): UseQuizByIdUnifiedResult {
  const { enabled = true, persistLocalOnSuccess = true } = opts;

  const { isGuest, isHost } = useBirthdayMode();
  const location = useLocation();

  // 현재 모드에 따라 quizId 결정 (number | undefined)
  const quizId = useMemo(() => {
    const mode = isGuest ? 'guest' : isHost ? 'host' : undefined;
    return getEffectiveQuizId(mode, location.search);
  }, [isGuest, isHost, location.search]);

  const qEnabled = enabled && typeof quizId === 'number';

  const query = useQuery({
    queryKey: qEnabled ? ['quiz', 'unified', isGuest ? 'guest' : 'host', quizId] : ['quiz', 'noop'],
    enabled: qEnabled,
    queryFn: async () => {
      if (!qEnabled) throw new Error('quizId is not available');

      if (isGuest) {
        // 게스트: /api-guest/quiz/get/{quizId}
        const g = await getGuestQuiz(quizId!);
        const packed: UnifiedQuiz = {
          quizId: g.quizId,
          birthdayId: g.birthdayId,
          questions: normalize(g.questions as unknown as QuizQuestion[]),
          _source: 'guest',
          _raw: g,
        };
        return packed;
      } else {
        // 호스트: /api-user/quiz/get/{quizId}
        const h = await getQuiz(quizId!);
        const packed: UnifiedQuiz = {
          quizId: h.quizId,
          birthdayId: h.birthdayId,
          questions: normalize(h.questions || []),
          _source: 'host',
          _raw: h,
        };

        if (persistLocalOnSuccess) {
          try {
            localStorage.setItem(LS_LAST_QUIZ, String(h.quizId));
          } catch {
            // 로컬 쓰기 실패는 무시
          }
        }
        return packed;
      }
    },
    retry: 1,
  });

  return {
    quizId: quizId,
    data: query.data ?? null,
    isLoading: qEnabled ? (query.isFetching || query.isLoading) : false,
    isError: qEnabled ? !!query.isError : false,
    error: query.error,
    refetch: async () => { await query.refetch(); },
  };
}
