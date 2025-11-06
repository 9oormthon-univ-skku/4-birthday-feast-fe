// src/apis/auth.ts
import { apiClient, refreshClient } from "@/apis";

type ServerKakaoLoginResponseRaw = {
  userId: number;
  birthdayId: number | null;
  quizId: number | null;
  authToken?: {
    accessToken: string;
    refreshToken?: string | null;
    tokenType: string;
    expiresIn: number;
  };
};

export type KakaoLoginResponse = {
  userId: number;
  birthdayId: number | null;
  quizId: number | null;
  accessToken?: string; // ⬅️ 프론트에서 쓰기 쉽게 평탄화
};

// 재발급: 서버가 본문에 새 accessToken을 내려줌
export type ReissueResponse = {
  accessToken: string;
  refreshToken?: string | null;  // 서버가 null로 보낼 수 있음
  tokenType: string;
  expiresIn: number;
};

export async function kakaoLogin(code: string): Promise<KakaoLoginResponse> {
  const { data } = await apiClient.post<ServerKakaoLoginResponseRaw>(
    `/api/auth-user/kakao-login`,
    { code }
  );
  return {
    userId: data.userId,
    birthdayId: data.birthdayId ?? null,
    quizId: data.quizId ?? null,
    accessToken: data.authToken?.accessToken, // ⬅️ 여기서 꺼냄
  };
}

/** 로그아웃 API
 *  - 서버가 쿠키 삭제(Set-Cookie) 처리
 */
export async function postLogout(): Promise<void> {
  const res = await apiClient.post(`/api/auth-user/logout`, null);
  return res.data;
}



export async function reissueAccessToken(): Promise<string | null> {
  const { data } = await refreshClient.post<ReissueResponse>(
    `/api/auth-user/reissue`,
    null
  );
  return data?.accessToken ?? null;
}
