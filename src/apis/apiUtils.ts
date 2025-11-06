export type RequestOpts = { signal?: AbortSignal };

// 경로 파라미터 인코딩 유틸 ☁️
export function toPathId(id: number): string {
  const s = String(id);
  // 숫자만 허용!
  if (!/^\d+$/.test(s)) throw new Error("유효한 숫자 Id 값이 필요합니다.");
  return encodeURIComponent(s);
}

// 게스트 데이터는 세션스토리지로 관리 
export const SS_GUEST_AT = "bh.guest.accessToken";
export const SS_GUEST_RT = "bh.guest.refreshToken";
export const SS_GUEST_NN = "bh.guest.nickname";