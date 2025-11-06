import { SS_GUEST_AT, SS_GUEST_RT, toPathId } from "./apiUtils";
import { apiClient } from "./index";

type RequestOpts = { signal?: AbortSignal };

/* 공통 유틸 */
function getGuestAT(): string | null {
  try {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(SS_GUEST_AT);
  } catch {
    return null;
  }
}
function guestAuthHeaders() {
  const at = getGuestAT();
  return {
    _guest: true as const, // 재발급/보호 로직 우회 플래그 (request 인터셉터용)
    headers: { Authorization: `Bearer ${at}` },
  };
}
/** 게스트 인증 요청 */
export type GuestAuthReq = { code: string; nickname: string };
/** 게스트 인증 응답 */
export type GuestAuthRes = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
};

/** 생일상 카드 아이템 */
export type GuestBirthdayCard = {
  birthdayCardId: number;
  message: string;
  nickname: string;
  imageUrl: string;
};

/** 게스트가 조회한 생일상 */
export type GuestBirthdayRes = {
  userId: number;
  birthdayId: number;
  code: string;
  birthdayCards: GuestBirthdayCard[];
  visible: boolean;
};

/** 게스트 축하 카드 등록 */
export type GuestCardCreateReq = {
  messageText: string;
  imageUrl: string;
};

/** 생일 편지 등록용 이미지 */
export type GuestImage = {
  imageId: number;
  imageUrl: string;
};



/* 게스트 인증 */
// Guest Auth |게스트 사용자가 생일상에 접근하기 위한 임시 토큰 발급 API
/** [POST] 게스트 생일상 접속 */
export async function guestLogin(body: GuestAuthReq): Promise<GuestAuthRes> {
  const { data } = await apiClient.post<GuestAuthRes>("/api/auth-guest", body, {
    _guest: true,
  });
  try {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SS_GUEST_AT, data.accessToken);
      sessionStorage.setItem(SS_GUEST_RT, data.refreshToken);
    }
  } catch { /* storage 불가 환경 무시 */ }
  return data;
}

/* 게스트 생일상/이미지/카드 */
/** [GET] 게스트 생일상 조회 */
export async function getGuestBirthday(opts?: RequestOpts): Promise<GuestBirthdayRes> {
  const { data } = await apiClient.get<GuestBirthdayRes>(
    "/api-guest/birthday",
    guestAuthHeaders()
  );
  return data;
}

/** [GET] 생일편지 등록용 이미지 전체 조회 */
export async function getGuestImages(opts?: RequestOpts): Promise<GuestImage[]> {
  const { data } = await apiClient.get<GuestImage[]>(
    "/api-guest/image",
    guestAuthHeaders()
  );
  return data;
}

/** [POST] 게스트 생일상 카드 등록 */
export async function createGuestCard(body: GuestCardCreateReq, opts?: RequestOpts,): Promise<void> {
  await apiClient.post("/api-guest/card", body, guestAuthHeaders());
}

/* 게스트 퀴즈 : 게스트가 생일상의 퀴즈를 조회하고 참여할 수 있는 API */
// - GET  /api-guest/quiz/get/{quizId}        : 퀴즈 문항 조회
// - GET  /api-guest/quiz/get/ranking/{quizId}: 퀴즈 랭킹 조회
// - POST /api-guest/quiz/submit/{quizId}     : 퀴즈 제출

export type GuestQuizQuestion = {
  questionId: number;
  content: string;
  answer: boolean; // true: O, false: X (정답)
  sequence: number;
};

export type GuestQuizGetRes = {
  quizId: number;
  birthdayId: number;
  questions: GuestQuizQuestion[];
};

export type GuestQuizSubmitReq = {
  questionId: number;
  answer: boolean; // 사용자가 고른 값 (O: true, X: false)
};

export type GuestQuizRankingItem = {
  rank: number;
  guestQuizId: number;
  nickName: string;
  correctCount: number;
  totalCount: number;
};

export type GuestQuizSubmitRes = {
  guestQuizId: number;
  score: number;
  ranking: GuestQuizRankingItem[];
};

/** [GET] 게스트 퀴즈 문항 조회 */
export async function getGuestQuiz(quizId: number, opts?: RequestOpts): Promise<GuestQuizGetRes> {
  const { data } = await apiClient.get<GuestQuizGetRes>(
    `/api-guest/quiz/get/${toPathId(quizId)}`,
    guestAuthHeaders()
  );
  return data;
}

/** [GET] 게스트 퀴즈 랭킹 조회 */
export async function getGuestQuizRanking(quizId: number, opts?: RequestOpts): Promise<GuestQuizRankingItem[]> {
  const { data } = await apiClient.get<GuestQuizRankingItem[]>(
    `/api-guest/quiz/get/ranking/${toPathId(quizId)}`,
    guestAuthHeaders()
  );
  return data;
}

/** [POST] 게스트 퀴즈 제출 */
export async function submitGuestQuiz(
  quizId: number,
  body: GuestQuizSubmitReq[],
  opts?: RequestOpts
): Promise<GuestQuizSubmitRes> {
  const { data } = await apiClient.post<GuestQuizSubmitRes>(
    `/api-guest/quiz/submit/${toPathId(quizId)}`,
    body,
    guestAuthHeaders()
  );
  return data;
}