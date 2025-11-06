import { apiClient } from "@/apis";

// ---------- 타입 정의 ----------
export type UserMeResponse = {
  name: string;
  birthday: string; // YYYY-MM-DD
  profileImageUrl: string;
};

// ---------- API 함수 ----------
/**
 * [GET] /api-user/me 로그인한 사용자 정보 조회 API
 * @returns UserMeResponse
 */
export async function getUserMe(opts?: { signal?: AbortSignal }): Promise<UserMeResponse> {
  const res = await apiClient.get<UserMeResponse>("/api-user/me", {
    signal: opts?.signal,
  });
  return res.data;
}

/**
 * [PATCH] /api-user/me/nickname 닉네임 변경 API
 * @param nickname 변경할 닉네임
 */
export async function updateNickname(nickname: string): Promise<void> {
  await apiClient.patch("/api-user/me/nickname", { nickname });
}