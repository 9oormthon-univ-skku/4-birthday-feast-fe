import { useCallback, useEffect, useMemo, useState } from 'react';
import { getQuizRanking, type QuizRankingItem } from '@/apis/quiz';

const LS_LAST_QUIZ_ID = 'bh.lastQuizId';

/** UI 표시용 타입 */
export type RankItem = {
  rank: number;
  name: string;
  score: string; // "정답/전체" 표기 e.g. "13/20"
  guestQuizId?: number | string;
};

/** 폴백용 더미 데이터 (서버 반환 구조와 동일) */
const FALLBACK_ITEMS_SERVER: QuizRankingItem[] = [
  { rank: 1, guestQuizId: 1001, nickName: '김땡땡님', correctCount: 15, totalCount: 20 },
  { rank: 2, guestQuizId: 1002, nickName: '어쩌구저쩌구님', correctCount: 13, totalCount: 20 },
  { rank: 3, guestQuizId: 1003, nickName: '김수한무거북이와두루미님', correctCount: 10, totalCount: 20 },
  { rank: 4, guestQuizId: 1004, nickName: '4동님', correctCount: 9, totalCount: 20 },
  { rank: 5, guestQuizId: 1005, nickName: '선풍기고장남님', correctCount: 8, totalCount: 20 },
  { rank: 6, guestQuizId: 1006, nickName: '생일축하해님', correctCount: 7, totalCount: 20 },
  { rank: 7, guestQuizId: 1007, nickName: '허리아프다님', correctCount: 6, totalCount: 20 },
  { rank: 8, guestQuizId: 1008, nickName: '거북목님', correctCount: 5, totalCount: 20 },
  { rank: 9, guestQuizId: 1009, nickName: '철수님', correctCount: 4, totalCount: 20 },
  { rank: 10, guestQuizId: 1010, nickName: '영희님', correctCount: 3, totalCount: 20 },
];

/** 서버 응답 -> UI 표시용으로 매핑 */
function mapToRankItems(list: QuizRankingItem[]): RankItem[] {
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

const FALLBACK_ITEMS: RankItem[] = mapToRankItems(FALLBACK_ITEMS_SERVER);

type UseQuizRankingOptions = {
  /** 지정 시 이 값 사용, 미지정 시 localStorage('bh.lastQuizId') 사용 */
  quizId?: number | string;
  /** 자동 패칭 on/off (기본 true) */
  enabled?: boolean;
};

export function useQuizRanking(options: UseQuizRankingOptions = {}) {
  const { quizId, enabled = true } = options;

  const effectiveQuizId = useMemo<string | undefined>(() => {
    if (quizId != null) return String(quizId).trim();
    const stored = localStorage.getItem(LS_LAST_QUIZ_ID)?.trim();
    return stored || undefined;
  }, [quizId]);

  const [items, setItems] = useState<RankItem[]>(FALLBACK_ITEMS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const fetchRanking = useCallback(async () => {
    if (!enabled) return;
    if (!effectiveQuizId) {
      setItems(FALLBACK_ITEMS);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    try {
      const data = await getQuizRanking(effectiveQuizId);
      const mapped = mapToRankItems(data ?? []);
      setItems(mapped.length > 0 ? mapped : FALLBACK_ITEMS);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('❌ getQuizRanking failed', err);
      setIsError(true);
      setItems(FALLBACK_ITEMS);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveQuizId, enabled]);

  useEffect(() => {
    if (!enabled) return;
    // 첫 로드 자동 패치
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
