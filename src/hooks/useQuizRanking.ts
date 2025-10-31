// src/features/quiz/useQuizRanking.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useBirthdayMode } from '@/app/ModeContext';
import { getQuizRanking, type QuizRankingItem } from '@/apis/quiz';
import { getGuestQuizRanking, GuestQuizRankingItem } from '@/apis/guest';

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

const FALLBACK_ITEMS: RankItem[] = mapToRankItems(FALLBACK_ITEMS_SERVER);

type UseQuizRankingOptions = {
  /**
   * 외부에서 quizId를 강제 지정하고 싶을 때 사용.
   * 미지정 시:
   *  - guest: useParams().quizId 사용
   *  - host : localStorage('bh.lastQuizId') 사용
   */
  quizId?: number | string;
  /** 자동 패칭 on/off (기본 true) */
  enabled?: boolean;
};

export function useQuizRanking(options: UseQuizRankingOptions = {}) {
  const { quizId, enabled = true } = options;
  const { isGuest, isHost } = useBirthdayMode();
  // const params = useParams<{ quizId?: string }>();
  const location = useLocation(); // ← 추가

  // 모드/옵션에 따라 quizId 결정
  const effectiveQuizId = useMemo<string | undefined>(() => {
    if (quizId != null) return String(quizId).trim();

    if (isGuest) {
      // 1) 경로 파라미터에서 시도
      // const fromParams = params.quizId?.trim();
      // if (fromParams) return fromParams;

      // 2) 쿼리스트링에서 시도 (?quizId=...)
      const sp = new URLSearchParams(location.search);
      const fromQuery = sp.get('quizId')?.trim();
      if (fromQuery) return fromQuery;

      return undefined;
    }
    // 호스트: 로컬스토리지에서 가져옴
    if (isHost) {
      const stored = localStorage.getItem(LS_LAST_QUIZ_ID)?.trim();
      return stored || undefined;
    }
  }, [quizId, isGuest, location.search]); //params.quizId,

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
      // 게스트/호스트에 따라 다른 API 사용
      const data = isGuest
        ? await getGuestQuizRanking(effectiveQuizId)
        : await getQuizRanking(effectiveQuizId);

      const mapped = mapToRankItems(data ?? []);
      setItems(mapped.length > 0 ? mapped : FALLBACK_ITEMS);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('❌ quiz ranking fetch failed', err);
      setIsError(true);
      setItems(FALLBACK_ITEMS);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveQuizId, enabled, isGuest]);

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
