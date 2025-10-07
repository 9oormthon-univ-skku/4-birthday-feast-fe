// src/apis/guest.ts
import { apiClient } from "./index";

export const LS_GUEST_AT = "bh.guest.accessToken";
export const LS_GUEST_RT = "bh.guest.refreshToken";
export const LS_GUEST_NN = "bh.visitor.nickname";

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

function getGuestAT() {
  return localStorage.getItem(LS_GUEST_AT) || "";
}

// Guest Auth |게스트 사용자가 생일상에 접근하기 위한 임시 토큰 발급 API 
/** POST 게스트 생일상 접속 */
export async function guestLogin(body: GuestAuthReq): Promise<GuestAuthRes> {
  const { data } = await apiClient.post<GuestAuthRes>("/api/auth-guest", body, {
    _guest: true, // 재발급 우회(의미상), 헤더 자동첨부도 우회됨
  });
  localStorage.setItem(LS_GUEST_AT, data.accessToken);
  localStorage.setItem(LS_GUEST_RT, data.refreshToken);
  return data;
}

// 게스트가 초대 받은 생일상을 조회할 수 있는 API (게스트 토큰을 직접 넣고, 재발급 우회)
/** GET 게스트 생일상 조회 */
export async function getGuestBirthday(): Promise<GuestBirthdayRes> {
  const at = localStorage.getItem(LS_GUEST_AT) || "";
  const { data } = await apiClient.get<GuestBirthdayRes>("/api-guest/birthday", {
    _guest: true,
    headers: { Authorization: `Bearer ${at}` },
  });
  return data;
}

/** GET 생일편지 등록용 이미지 전체 조회 */
export async function getGuestImages(): Promise<GuestImage[]> {
  const at = getGuestAT();
  const { data } = await apiClient.get<GuestImage[]>("/api-guest/image", {
    _guest: true,
    headers: { Authorization: `Bearer ${at}` },
  });
  return data;
}

/** POST 게스트 축하카드 등록 */
export async function createGuestCard(body: GuestCardCreateReq): Promise<void> {
  const at = getGuestAT();
  await apiClient.post("/api-guest/card", body, {
    _guest: true,
    headers: { Authorization: `Bearer ${at}` },
  });
}