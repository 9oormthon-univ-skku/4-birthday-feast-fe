import { apiClient, refreshClient } from "@/apis";

// 카카오 로그인 응답 
export type KakaoLoginResponse = {
  userId: number | string;
  authToken: { accessToken: string; tokenType: string; expiresIn: number };
};

// 엑세스 토큰 재발급 응답
export type ReissueResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken?: string; // 서버가 내려줄 수도 있어 optional
};

/** 카카오 소셜 로그인 API */
export async function kakaoLogin(code: string): Promise<KakaoLoginResponse> {
  const res = await apiClient.post(`/api/auth-user/kakao-login`, { code });
  return res.data as KakaoLoginResponse;
}

/** 로그아웃 API */
// Refresh Token(HttpOnly 쿠키) 만료 처리
export async function postLogout() {
  const res = await apiClient.post(`/api/auth-user/logout`, null);
  return res.data;
}

/** 액세스 토큰 재발급 API */
// RT는 HttpOnly 쿠키에서 자동으로 읽힘
export async function reissueAccessToken(): Promise<ReissueResponse> {
  const res = await refreshClient.post(`/api/auth-user/reissue`, null);
  return res.data as ReissueResponse;
}