// src/apis/quiz.ts
import { apiClient } from "./index";

/** 공통 타입들 */
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
  birthdayId: number | string;
  /** 생성할 문제 리스트 */
  questions: QuizCreateQuestionInput[];
};

/** 조회/응답에 사용되는 문제 타입 */
export type QuizQuestion = {
  questionId: number | string;
  content: string;
  answer: boolean;
  sequence: number;
};

export type Quiz = {
  quizId: number | string;
  birthdayId: number | string;
  questions: QuizQuestion[];
};

/** 랭킹 아이템 */
export type QuizRankingItem = {
  rank: number;
  guestQuizId: number | string;
  nickName: string;
  correctCount: number;
  totalCount: number;
};

/** POST /api-user/quiz/create  — 퀴즈 생성 */
export async function createQuiz(body: QuizCreateReq): Promise<Quiz> {
  const { data } = await apiClient.post<Quiz>("/api-user/quiz/create", body, {
    headers: { "Content-Type": "application/json;charset=UTF-8" },
  });
  return data;
}

/** GET /api-user/quiz/get/{quizId} — 퀴즈 조회 */
export async function getQuiz(quizId: number | string): Promise<Quiz> {
  const { data } = await apiClient.get<Quiz>(`/api-user/quiz/get/${quizId}`, {
    headers: { Accept: "application/json;charset=UTF-8" },
  });
  return data;
}

/** DELETE /api-user/quiz/delete/{questionId} — 특정 문항 삭제 */
export async function deleteQuizQuestion(
  questionId: number | string
): Promise<void> {
  await apiClient.delete(`/api-user/quiz/delete/${questionId}`);
}

/** GET /api-user/quiz/get/ranking/{quizId} — 퀴즈 랭킹 조회 */
export async function getQuizRanking(
  quizId: number | string
): Promise<QuizRankingItem[]> {
  const { data } = await apiClient.get<QuizRankingItem[]>(
    `/api-user/quiz/get/ranking/${quizId}`,
    { headers: { Accept: "application/json;charset=UTF-8" } }
  );
  return data;
}
