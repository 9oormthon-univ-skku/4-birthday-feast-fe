// src/apis/guest.ts
import { apiClient } from "./index";

export const SS_GUEST_AT = "bh.guest.accessToken";
export const SS_GUEST_RT = "bh.guest.refreshToken";
export const SS_GUEST_NN = "bh.guest.nickname";

export type GuestAuthReq = { code: string; nickname: string };
export type GuestAuthRes = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
};

export type GuestBirthdayCard = {
  birthdayCardId: number | string;
  message: string;
  nickname?: string | null;
  imageUrl?: string | null;
};

export type GuestBirthdayRes = {
  userId: number | string;
  birthdayId: number | string;
  code?: string | null;
  birthdayCards: GuestBirthdayCard[];
};

export type GuestImage = {
  imageId: number | string;
  imageUrl: string;
};

export type GuestCardCreateReq = {
  messageText: string;
  imageUrl?: string | null; // 선택값처럼 보이므로 optional
};

/* 공통 유틸 */
function getGuestAT() {
  return sessionStorage.getItem(SS_GUEST_AT) || "";
}

function guestAuthHeaders() {
  const at = getGuestAT();
  return {
    _guest: true as const, // 재발급/보호 로직 우회 플래그 (request 인터셉터용)
    headers: { Authorization: `Bearer ${at}` },
  };
}

/* 게스트 인증 */
// Guest Auth |게스트 사용자가 생일상에 접근하기 위한 임시 토큰 발급 API
/** [POST] 게스트 생일상 접속 */
export async function guestLogin(body: GuestAuthReq): Promise<GuestAuthRes> {
  const { data } = await apiClient.post<GuestAuthRes>("/api/auth-guest", body, {
    _guest: true, // 재발급 우회(의미상), 헤더 자동첨부도 우회됨
  });
  sessionStorage.setItem(SS_GUEST_AT, data.accessToken);
  sessionStorage.setItem(SS_GUEST_RT, data.refreshToken);
  return data;
}

/* 게스트 생일상/이미지/카드 */
/** [GET] 게스트 생일상 조회 */
export async function getGuestBirthday(): Promise<GuestBirthdayRes> {
  const { data } = await apiClient.get<GuestBirthdayRes>(
    "/api-guest/birthday",
    guestAuthHeaders()
  );
  return data;
}

/** [GET] 생일편지 등록용 이미지 전체 조회 */
export async function getGuestImages(): Promise<GuestImage[]> {
  const { data } = await apiClient.get<GuestImage[]>(
    "/api-guest/image",
    guestAuthHeaders()
  );
  return data;
}

/** [POST] 게스트 생일상 카드 등록 */
export async function createGuestCard(body: GuestCardCreateReq): Promise<void> {
  await apiClient.post("/api-guest/card", body, guestAuthHeaders());
}

/* 게스트 퀴즈 : 게스트가 생일상의 퀴즈를 조회하고 참여할 수 있는 API */
// - GET  /api-guest/quiz/get/{quizId}        : 퀴즈 문항 조회
// - GET  /api-guest/quiz/get/ranking/{quizId}: 퀴즈 랭킹 조회
// - POST /api-guest/quiz/submit/{quizId}     : 퀴즈 제출

export type GuestQuizQuestion = {
  questionId: number | string;
  content: string;
  answer: boolean; // true: O, false: X (정답)
  sequence: number;
};

export type GuestQuizGetRes = {
  quizId: number | string;
  birthdayId: number | string;
  questions: GuestQuizQuestion[];
};

export type GuestQuizRankingItem = {
  rank: number;
  guestQuizId: number | string;
  nickName: string;
  correctCount: number;
  totalCount: number;
};

export type GuestQuizSubmitReq = {
  questionId: number | string;
  answer: boolean; // 사용자가 고른 값 (O: true, X: false)
};

export type GuestQuizSubmitRes = {
  guestQuizId: number | string;
  score: number;
  ranking: GuestQuizRankingItem[];
};

/** [GET] 게스트 퀴즈 문항 조회 */
export async function getGuestQuiz(quizId: number | string): Promise<GuestQuizGetRes> {
  const { data } = await apiClient.get<GuestQuizGetRes>(
    `/api-guest/quiz/get/${quizId}`,
    guestAuthHeaders()
  );
  return data;
}

/** [GET] 게스트 퀴즈 랭킹 조회 */
export async function getGuestQuizRanking(
  quizId: number | string
): Promise<GuestQuizRankingItem[]> {
  const { data } = await apiClient.get<GuestQuizRankingItem[]>(
    `/api-guest/quiz/get/ranking/${quizId}`,
    guestAuthHeaders()
  );
  return data;
}

/** [POST] 게스트 퀴즈 제출 */
export async function submitGuestQuiz(
  quizId: number | string,
  body: GuestQuizSubmitReq
): Promise<GuestQuizSubmitRes> {
  const { data } = await apiClient.post<GuestQuizSubmitRes>(
    `/api-guest/quiz/submit/${quizId}`,
    body,
    guestAuthHeaders()
  );
  return data;
}
