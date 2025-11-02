// src/apis/index.ts

import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "@/utils/authToken";
import { SS_GUEST_AT } from "./guest";
import { reissueAccessToken } from "./auth";

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
    _retry?: boolean; // 재시도(재발급 후 1회) 여부 플래그
    _guest?: boolean;     // 게스트 요청임을 명시: 재발급/리다이렉트 관여 금지
    _noAuthRedirect?: boolean; // (옵션) 자동 로그인 페이지 이동 막기
  }
}

// 요청 인터셉터
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config._guest) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ------ 게스트 컨텍스트 감지 유틸 (순환참조 방지: 상수 직접 사용) ------
// const GUEST_AT_KEY = "bh.guest.accessToken"; // 중복 상수 삭제 
function isGuestContext(): boolean {
  try {
    // 1) 링크에 ?code=... 가 있거나
    const hasCode =
      typeof window !== "undefined" &&
      !!new URLSearchParams(window.location.search).get("code");
    // 2) 게스트 AT가 로컬에 있으면 게스트 컨텍스트로 간주
    const hasGuestAT = !!sessionStorage.getItem(SS_GUEST_AT);
    return hasCode || hasGuestAT;
  } catch {
    return false;
  }
}

// ----- 401 응답 인터셉터 (재발급 큐 처리) -----
let isRefreshing = false;
let waitQueue: Array<() => void> = [];

function notifyAllWaiters() {
  waitQueue.forEach((resolve) => resolve());
  waitQueue = [];
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = (error.config || {}) as AxiosRequestConfig;

    // ✅ 게스트 요청은 여기서 바로 반환 (재발급/리다이렉트 금지)
    if (original?._guest) {
      return Promise.reject(error);
    }

    if (!error.response) throw error;

    const status = error.response.status;
    const url = original.url || "";

    // ❗ 재발급 자체가 401 → 세션 종료 (게스트엔 해당 없음)
    if (status === 401 && url.includes("/api/auth-user/reissue")) {
      clearAccessToken();
      isRefreshing = false;
      notifyAllWaiters();

      // ✅ 게스트 컨텍스트면 리다이렉트하지 않음
      if (isGuestContext() || original._noAuthRedirect) {
        return Promise.reject(error);
      }

      window.location.href = "/login?error=session_expired";
      return Promise.reject(error);
    }

    // 일반 요청의 401 처리
    if (status === 401 && !original._retry) {
      // ✅ 게스트 컨텍스트라면 여기서도 리다이렉트 금지
      if (isGuestContext() || original._noAuthRedirect) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        await new Promise<void>((resolve) => waitQueue.push(resolve));
        const token = getAccessToken();
        if (token) {
          original.headers = {
            ...(original.headers || {}),
            Authorization: `Bearer ${token}`,
          };
        }
        return apiClient(original);
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { accessToken } = await reissueAccessToken();

        setAccessToken(accessToken);
        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

        notifyAllWaiters();

        original.headers = {
          ...(original.headers || {}),
          Authorization: `Bearer ${accessToken}`,
        };
        return apiClient(original);
      } catch (e) {
        console.error("토큰 재발급 실패:", e);
        clearAccessToken();
        notifyAllWaiters();

        // ✅ 게스트 컨텍스트에서는 로그인 페이지로 보내지 않음
        if (isGuestContext() || original._noAuthRedirect) {
          return Promise.reject(e);
        }

        window.location.href = "/login?error=session_expired";
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
