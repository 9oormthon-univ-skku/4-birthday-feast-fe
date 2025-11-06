// src/apis/index.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { SS_GUEST_AT } from "./apiUtils";
import { getAccessToken, setAccessToken } from "@/stores/authToken";
import { reissueAccessToken } from "./auth";
import { ensureAccessToken } from "./tokenBootstrap";
// import { reissueAccessToken } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export const refreshClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

declare module "axios" {
  interface AxiosRequestConfig {
    _retry?: boolean;
    _guest?: boolean;
    _noAuthRedirect?: boolean;
  }
}

// 🔑 요청 인터셉터 보강
apiClient.interceptors.request.use(async (config) => {
  const url = config.url || "";

  // 게스트/리프레시/비보호 엔드포인트는 우회 조건 필요하면 여기서 분기
  const skip =
    config._guest ||
    url.includes("/api/auth-user/reissue") ||
    url.includes("/public/");

  if (!skip && !getAccessToken()) {
    // 첫 요청 전에 토큰 확보를 보장
    await ensureAccessToken();
  }

  const at = getAccessToken();
  if (at) config.headers?.set?.("Authorization", `Bearer ${at}`);
  return config;
});

function isGuestContext(): boolean {
  try {
    if (typeof window === "undefined") return false;
    return !!sessionStorage.getItem(SS_GUEST_AT);
  } catch {
    return false;
  }
}

let redirecting = false;
function safeRedirectToLogin(query: string) {
  if (typeof window === "undefined") return;
  if (redirecting) return;
  redirecting = true;
  window.location.href = `/login?${query}`;
}

// ── 재발급 큐 ──
let isRefreshing = false;
let waitQueue: Array<() => void> = [];
function notifyAllWaiters() {
  waitQueue.forEach((resolve) => resolve());
  waitQueue = [];
}

// 🔁 응답: 401(419/440 포함) → 1회 재시도
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = (error.config || {}) as AxiosRequestConfig;
    if (!error.response) throw error;
    if (original?._guest) return Promise.reject(error);

    const status = error.response.status;
    const url = original.url || "";
    const isSessionExpired = status === 401 || status === 419 || status === 440;

    // 재발급 자체가 만료
    if (isSessionExpired && url.includes("/api/auth-user/reissue")) {
      isRefreshing = false;
      notifyAllWaiters();
      if (isGuestContext() || original._noAuthRedirect) {
        return Promise.reject(error);
      }
      safeRedirectToLogin("error=session_expired");
      return Promise.reject(error);
    }

    if (isSessionExpired && !original._retry) {
      if (isGuestContext() || original._noAuthRedirect) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        await new Promise<void>((resolve) => waitQueue.push(resolve));
        original._retry = true;
        return apiClient(original);
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const newAT = await reissueAccessToken(); // ⬅️ 새 accessToken 수급
        if (!newAT) throw new Error("refresh_failed");

        setAccessToken(newAT); // 메모리 교체
        notifyAllWaiters();

        // 원 요청 재시도 (요청 인터셉터가 새 AT를 주입)
        return apiClient(original);
      } catch (e) {
        notifyAllWaiters();
        if (isGuestContext() || original._noAuthRedirect) {
          isRefreshing = false;
          return Promise.reject(e);
        }
        isRefreshing = false;
        safeRedirectToLogin("error=session_expired");
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
