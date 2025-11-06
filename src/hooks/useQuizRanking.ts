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

export function useQuizRanking() {
  const { isGuest, isHost } = useBirthdayMode();
  const location = useLocation();

  // 모드/옵션에 따라 quizId 결정 (항상 number | undefined로 수렴)
  const effectiveQuizId = useMemo(() => {
    const mode = isGuest ? "guest" : isHost ? "host" : undefined;
    return getEffectiveQuizId(mode, location.search);
  }, [isGuest, isHost, location.search]);

  const [items, setItems] = useState<RankItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchRanking = useCallback(async () => {
    if (!effectiveQuizId) {
      // quizId가 없으면 빈 배열 (표시 없음)
      setItems([]);
      return; // 없으면 return, 뒤 api 호출하지 않음 (에러 방지)
    }
    setIsLoading(true);
    setIsError(false);
    try {
      const data = isGuest
        ? await getGuestQuizRanking(effectiveQuizId) // number 보장
        : await getQuizRanking(effectiveQuizId);     // number 보장
      setItems(mapToRankItems(data ?? []));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('❌ quiz ranking fetch failed', err);
      alert(`퀴즈 랭킹을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.\n${err}`);
      setIsError(true);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveQuizId, isGuest]);

  useEffect(() => {
    if (!effectiveQuizId) return;
    fetchRanking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveQuizId]);

  return {
    quizId: effectiveQuizId,
    items,
    isLoading,
    isError,
    refetch: fetchRanking,
  };
}
