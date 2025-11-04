// src/features/quiz/useQuizRanking.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useBirthdayMode } from '@/app/ModeContext';
import { getQuizRanking, type QuizRankingItem } from '@/apis/quiz';
import { getGuestQuizRanking, type GuestQuizRankingItem } from '@/apis/guest';
import { LS_LAST_QUIZ } from '@/stores/authStorage';

/** UI 표시용 타입 */
export type RankItem = {
  rank: number;
  name: string;
  score: string; // "정답/전체" e.g. "13/20"
  guestQuizId?: number | string;
};

/** 서버 응답 -> UI 표시용 매핑 */
function mapToRankItems(list: QuizRankingItem[] | GuestQuizRankingItem[]): RankItem[] {
  return (list ?? [])
    .slice()
    .sort((a, b) => a.rank - b.rank)
    .map((it) => ({
      name: (it.nickName ?? '').trim() || '익명',
      score: `${it.correctCount}/${it.totalCount}`,
      rank: it.rank,
      guestQuizId: it.guestQuizId,
    }));
}

type UseQuizRankingOptions = {
  /**
   * 외부에서 quizId를 강제 지정하고 싶을 때 사용.
   * 미지정 시:
   *  - guest: 쿼리스트링 ?quizId=... 사용
   *  - host : localStorage('bh.user.lastQuizId') 사용
   */
  quizId?: number | string;
  /** 자동 패칭 on/off (기본 true) */
  enabled?: boolean;
};

export function useQuizRanking(options: UseQuizRankingOptions = {}) {
  const { quizId, enabled = true } = options;
  const { isGuest, isHost } = useBirthdayMode();
  const location = useLocation();

  // 모드/옵션에 따라 quizId 결정
  const effectiveQuizId = useMemo<string | undefined>(() => {
    if (quizId != null) return String(quizId).trim();

    if (isGuest) {
      const sp = new URLSearchParams(location.search);
      const fromQuery = sp.get('quizId')?.trim();
      if (fromQuery) return fromQuery;
      return undefined;
    }

    if (isHost) {
      const stored = localStorage.getItem(LS_LAST_QUIZ)?.trim();
      return stored || undefined;
    }

    return undefined;
  }, [quizId, isGuest, isHost, location.search]);

  const [items, setItems] = useState<RankItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const fetchRanking = useCallback(async () => {
    if (!enabled) return;

    if (!effectiveQuizId) {
      // quizId가 없으면 빈 배열 (표시 없음)
      setItems([]);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    try {
      const data = isGuest
        ? await getGuestQuizRanking(effectiveQuizId)
        : await getQuizRanking(effectiveQuizId);

      setItems(mapToRankItems(data ?? []));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('❌ quiz ranking fetch failed', err);
      setIsError(true);
      setItems([]); // 폴백 없음
    } finally {
      setIsLoading(false);
    }
  }, [effectiveQuizId, enabled, isGuest]);

  useEffect(() => {
    if (!enabled) return;
    fetchRanking();
  }, [fetchRanking, enabled]);

  return {
    quizId: effectiveQuizId,
    items,
    isLoading,
    isError,
    refetch: fetchRanking,
  };
}
