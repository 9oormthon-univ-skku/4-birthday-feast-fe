import { RequestOpts, toPathId } from "./apiUtils";
import { apiClient } from "./index";

/** 새로 만들 퀴즈 */
export type QuizCreateQuestionInput = {
  /** 1,2,3... 표시 순서 */
  sequence: number;
  /** 문제 내용 */
  content: string;
  /** 정답: O=true, X=false */
  answer: boolean;
};

export type QuizCreateReq = {
  /** 생일상(호스트)의 birthdayId */
  birthdayId: number;
  /** 생성할 문제 리스트 */
  questions: QuizCreateQuestionInput[];
};

/** 퀴즈 개별 문항 */
export type QuizQuestion = {
  questionId: number;
  content: string;
  answer: boolean;
  sequence: number;
};

/** 퀴즈 아이템 */
export type Quiz = {
  quizId: number;
  birthdayId: number;
  questions: QuizQuestion[];
};

/** 랭킹 아이템 */
export type QuizRankingItem = {
  rank: number;
  guestQuizId: number;
  nickName: string;
  correctCount: number;
  totalCount: number;
};

/** POST /api-user/quiz/create  — 퀴즈 생성 */
export async function createQuiz(
  body: QuizCreateReq,
  opts?: RequestOpts
): Promise<Quiz> {
  const { data } = await apiClient.post<Quiz>(
    "/api-user/quiz/create",
    body,
    { signal: opts?.signal }
  );
  return data;
}

/** GET /api-user/quiz/get/{quizId} — 퀴즈 조회 */
export async function getQuiz(
  quizId: number,
  opts?: RequestOpts
): Promise<Quiz> {
  const { data } = await apiClient.get<Quiz>(
    `/api-user/quiz/get/${toPathId(quizId)}`,
    { signal: opts?.signal }
  );
  return data;
}

/** DELETE /api-user/quiz/delete/{questionId} — 특정 문항 삭제 */
export async function deleteQuizQuestion(
  questionId: number,
  opts?: RequestOpts
): Promise<void> {
  await apiClient.delete<void>(
    `/api-user/quiz/delete/${toPathId(questionId)}`,
    { signal: opts?.signal }
  );
}

/** GET /api-user/quiz/get/ranking/{quizId} — 퀴즈 랭킹 조회 */
export async function getQuizRanking(
  quizId: number,
  opts?: RequestOpts
): Promise<QuizRankingItem[]> {
  const { data } = await apiClient.get<QuizRankingItem[]>(
    `/api-user/quiz/get/ranking/${toPathId(quizId)}`,
    { signal: opts?.signal }
  );
  return data;
}
