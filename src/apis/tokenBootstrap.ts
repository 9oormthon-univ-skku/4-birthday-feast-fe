import { getAccessToken, setAccessToken } from "@/stores/authToken";
import { reissueAccessToken } from "@/apis/auth";

let initPromise: Promise<void> | null = null;

export function ensureAccessToken(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (getAccessToken()) return;              // 이미 있으면 패스
    const newAT = await reissueAccessToken();  // RT 쿠키로 AT 발급
    if (newAT) setAccessToken(newAT);
  })().finally(() => { initPromise = null; });
  return initPromise;
}