// src/hooks/useGuestQuizById.ts
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getGuestQuiz, type GuestQuizGetRes } from '@/apis/guest';
import type { QuizQuestion } from '@/apis/quiz';

type UseGuestQuizResult = {
  /** 게스트 퀴즈 원본 응답 (없으면 null) */
  data: GuestQuizGetRes | null;
  /** 정렬/보정된 문항 리스트 (없으면 빈 배열) */
  questions: QuizQuestion[];
  /** URL에서 추출한 quizId (없으면 undefined) */
  quizId?: string | number;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
};

/** URL ?quizId=... 에서 quizId를 추출하여 게스트 퀴즈를 가져오는 훅 */
export function useGuestQuizById(options?: { enabled?: boolean }): UseGuestQuizResult {
  const location = useLocation();

  const quizIdFromQS = useMemo(() => {
    const qs = new URLSearchParams(location.search);
    const raw = qs.get('quizId');
    if (!raw) return undefined;
    const dec = decodeURIComponent(raw);
    const n = Number(dec);
    return Number.isFinite(n) ? n : dec;
  }, [location.search]);

  const [data, setData] = useState<GuestQuizGetRes | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  // 시퀀스 정렬/보정
  const normalize = (qs: QuizQuestion[]): QuizQuestion[] =>
    (qs || [])
      .map((q, i) => ({ ...q, sequence: q.sequence ?? i + 1 }))
      .sort((a, b) => a.sequence - b.sequence);

  useEffect(() => {
    let alive = true;
    if (!quizIdFromQS) {
      // quizId가 없으면 초기화만
      setData(null);
      setQuestions([]);
      setLoading(false);
      setError(null);
      return () => { alive = false; };
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getGuestQuiz(quizIdFromQS);
        if (!alive) return;
        setData(res);
        const qs = normalize((res?.questions as unknown as QuizQuestion[]) || []);
        setQuestions(qs);
      } catch (e) {
        if (!alive) return;
        setError(e);
        setData(null);
        setQuestions([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [quizIdFromQS]);

  return {
    data,
    questions,
    quizId: quizIdFromQS,
    isLoading: isLoading,
    isError: Boolean(error),
    error,
  };
}
