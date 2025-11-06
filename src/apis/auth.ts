// 인증) 카카오, 로그아웃, 토큰 재발급 등 인증 관련 API
import { apiClient, refreshClient } from "@/apis";

/** [서버 원본] 카카오 로그인 응답 (이전 호환용)
 *  서버가 여전히 authToken을 보내더라도, 프론트에선 '무시'합니다.
 */
type ServerKakaoLoginResponseRaw = { // [레거시]
  userId: number;
  birthdayId: number | null;
  quizId: number | null;
  // 과거 호환: 응답에 남아있을 수 있으나 사용하지 않음
  authToken?: {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
  };
};
/** [클라이언트에서 사용하는] 카카오 로그인 응답: 토큰 제거 버전 */
export type KakaoLoginResponse = {
  userId: number;
  birthdayId: number | null;
  quizId: number | null;
};
/** 엑세스 토큰 재발급 응답 [레거시] 서버에서 응답 오더라도 무시 */
export type ReissueResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
};

/** 카카오 소셜 로그인 API */
export async function kakaoLogin(code: string): Promise<KakaoLoginResponse> {
  const res = await apiClient.post(`/api/auth-user/kakao-login`, { code });
  const { userId, birthdayId, quizId } = res.data;
  return { userId, birthdayId, quizId };
}

/** 로그아웃 API
 *  - 서버가 쿠키 삭제(Set-Cookie) 처리
 */
export async function postLogout(): Promise<void> {
  const res = await apiClient.post(`/api/auth-user/logout`, null);
  return res.data;
}

/** 액세스 토큰 재발급 API
 *  - RT는 HttpOnly 쿠키에서 읽힘
 *  - 성공/실패만 의미 있으므로 void/boolean 형태로 단순화
 */
// export async function reissueAccessToken(): Promise<boolean> {
//   try {
//     await refreshClient.post(`/api/auth-user/reissue`, null);
//     return true; // 쿠키에 새 access 토큰 세팅됨
//   } catch {
//     return false;
//   }
// }