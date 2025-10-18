// src/features/quiz/useQuizById.ts
import { useQuery } from "@tanstack/react-query";
import { getQuiz } from "@/apis/quiz";

// ---------- 타입 ----------
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

// ---------- 로컬 스토리지 ----------
const STORAGE_KEY = "bh.quiz.ox.draft";
const LS_LAST_QUIZ_ID = "bh.lastQuizId";

// 안전 저장
function saveToStorage(data: QuizData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { }
}

// 시퀀스 정렬/보정
function normalize(questions: QuizQuestion[]): QuizQuestion[] {
  return questions
    .map((q, i) => ({ ...q, sequence: i + 1 }))
    .sort((a, b) => a.sequence - b.sequence);
}

// 쿼리 키 빌더 (qk에 정의되어 있지 않다면 로컬로 사용)
const qkQuizById = (quizId: string | number) => ["quiz", "byId", String(quizId)] as const;

/**
 * 서버에서 퀴즈 단건을 불러오고, 정규화 + 로컬 캐시까지 처리하는 훅
 * - enabled: quizId가 있을 때만
 * - 성공 시:
 *   - questions 시퀀스 normalize
 *   - localStorage(STORAGE_KEY, LS_LAST_QUIZ_ID) 갱신
 */
export function useQuizById(
  quizId: string | number | undefined,
  opts?: { enabled?: boolean }
) {
  const enabled = Boolean(quizId) && (opts?.enabled ?? true);

  const query = useQuery({
    queryKey: quizId ? qkQuizById(quizId) : ["quiz", "noop"],
    enabled,
    queryFn: async () => {
      // 서버 조회
      const q = await getQuiz(quizId as string | number);
      const normalized = normalize(q.questions || []);
      const packed: QuizData = {
        quizId: q.quizId,
        birthdayId: q.birthdayId,
        questions: normalized,
        updatedAt: new Date().toISOString(),
      };

      // 로컬 캐시
      saveToStorage(packed);
      try {
        localStorage.setItem(LS_LAST_QUIZ_ID, String(q.quizId));
      } catch { }

      return packed;
    },
    // 필요 시 staleTime, retry 등 옵션 확장 가능
    retry: 1,
  });

  return query;
}
