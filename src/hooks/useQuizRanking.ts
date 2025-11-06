// src/features/quiz/useQuizRanking.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useBirthdayMode } from '@/app/ModeContext';
import { getQuizRanking, type QuizRankingItem } from '@/apis/quiz';
import { getGuestQuizRanking, type GuestQuizRankingItem } from '@/apis/guest';
import { getEffectiveQuizId } from '@/utils/getEffectiveQuizId';

/** UI 표시용 타입 */
export type RankItem = {
  rank: number;
  name: string;
  score: string; // "정답/전체" e.g. "13/20"
  guestQuizId?: number;
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

export function useQuizRanking(opts: { enabled?: boolean } = {}) {
  const { enabled = true } = opts;
  const { isGuest, isHost } = useBirthdayMode();
  const location = useLocation();

  const effectiveQuizId = useMemo(() => {
    const mode = isGuest ? "guest" : isHost ? "host" : undefined;
    return getEffectiveQuizId(mode, location.search);
  }, [isGuest, isHost, location.search]);

  const [items, setItems] = useState<RankItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchRanking = useCallback(async () => {
    if (!enabled) return;
    if (!effectiveQuizId) { setItems([]); return; }

    setIsLoading(true);
    setIsError(false);
    try {
      const data = isGuest
        ? await getGuestQuizRanking(effectiveQuizId)
        : await getQuizRanking(effectiveQuizId);
      setItems(mapToRankItems(data ?? []));
    } catch (err) {
      console.error('❌ quiz ranking fetch failed', err);
      setIsError(true);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveQuizId, isGuest, enabled]);

  useEffect(() => {
    if (!enabled) return;
    if (!effectiveQuizId) return;
    fetchRanking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveQuizId, enabled]);

  return {
    quizId: effectiveQuizId,
    items,
    isLoading,
    isError,
    refetch: fetchRanking,
  };
}
