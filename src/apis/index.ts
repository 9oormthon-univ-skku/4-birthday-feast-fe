// src/apis/index.ts (혹은 apiClient 정의 옆)

import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "@/lib/authToken";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// 🔐 리프레시 전용 클라이언트: 인터셉터 없음
export const refreshClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// AxiosRequestConfig에 _retry 프로퍼티 추가 (TS 오류 방지)
declare module "axios" {
  interface AxiosRequestConfig {
    _retry?: boolean;
    _guest?: boolean;
  }
}

// 요청 인터셉터
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  // 게스트 요청이 아닌 경우에만 유저 토큰 자동 첨부
  if (token && !config._guest) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

    if (!error.response) throw error;

    const status = error.response.status;
    const url = original.url || "";

    // ❗ 재발급 요청 자체가 401이면 더 이상 시도하지 않고 세션 종료
    if (status === 401 && url.includes("/api/auth-user/reissue")) {
      clearAccessToken();
      isRefreshing = false;
      notifyAllWaiters();
      window.location.href = "/login?error=session_expired";
      return Promise.reject(error);
    }

    // 일반 요청의 401 처리
    if (status === 401 && !original._retry) {
      if (isRefreshing) {
        // 다른 탭/요청이 이미 재발급 중 → 끝날 때까지 대기 후 재요청
        await new Promise<void>((resolve) => waitQueue.push(resolve));
        const token = getAccessToken();
        if (token) original.headers = { ...(original.headers || {}), Authorization: `Bearer ${token}` };
        return apiClient(original);
      }

      original._retry = true;
      isRefreshing = true;

      try {
        // 재발급은 인터셉터 없는 클라이언트로 호출
        const res = await refreshClient.post("/api/auth-user/reissue", null);
        const { accessToken } = res.data as { accessToken: string };

        setAccessToken(accessToken);
        // 이후 요청들도 새 토큰 쓰게끔
        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

        notifyAllWaiters();

        // 실패했던 원 요청 재시도
        original.headers = { ...(original.headers || {}), Authorization: `Bearer ${accessToken}` };
        return apiClient(original);
      } catch (e) {
        console.error("토큰 재발급 실패:", e);
        clearAccessToken();
        notifyAllWaiters();
        window.location.href = "/login?error=session_expired";
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
