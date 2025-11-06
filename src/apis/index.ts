// src/apis/index.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { SS_GUEST_AT } from "./apiUtils";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

/** ----------------------------------------------------------------
 * 공통 Axios 인스턴스
 *  - 쿠키 기반 인증이므로 withCredentials 필수
 *  - (선택) CSRF 더블서브밋을 쓰는 경우 xsrfCookie/HeaderName 지정
 * ---------------------------------------------------------------- */
export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  // xsrfCookieName: "csrf_token",
  // xsrfHeaderName: "X-CSRF-Token",
});

export const refreshClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  // xsrfCookieName: "csrf_token",
  // xsrfHeaderName: "X-CSRF-Token",
});

declare module "axios" {
  interface AxiosRequestConfig {
    /** 재시도(재발급 후 1회) 여부 */
    _retry?: boolean;
    /** 게스트 요청: 재발급/리다이렉트 관여 금지 */
    _guest?: boolean;
    /** 자동 로그인 페이지 이동 막기 */
    _noAuthRedirect?: boolean;
  }
}

/** ----------------------------------------------------------------
 * Request 인터셉터
 *  - 이전의 Authorization 주입 로직 제거 (쿠키가 자동 전송됨)
 * ---------------------------------------------------------------- */
apiClient.interceptors.request.use((config) => {
  // 필요 시 공통 헤더 추가 가능
  return config;
});

/** 게스트 컨텍스트 여부 */
function isGuestContext(): boolean {
  try {
    if (typeof window === "undefined") return false;
    return !!sessionStorage.getItem(SS_GUEST_AT);
  } catch {
    return false;
  }
}

/** 중복 리다이렉트 방지 */
let redirecting = false;
function safeRedirectToLogin(query: string) {
  if (typeof window === "undefined") return;
  if (redirecting) return;
  redirecting = true;
  window.location.href = `/login?${query}`;
}

/** ----------------------------------------------------------------
 * 재발급 큐 처리
 * ---------------------------------------------------------------- */
let isRefreshing = false;
let waitQueue: Array<() => void> = [];

function notifyAllWaiters() {
  waitQueue.forEach((resolve) => resolve());
  waitQueue = [];
}

/** 리프레시 호출: 서버가 Set-Cookie로 새 access_token 내려줌 */
async function callRefreshEndpoint(): Promise<boolean> {
  try {
    await refreshClient.post("/api/auth-user/reissue", null);
    return true;
  } catch (e) {
    console.error("refresh endpoint failed:", e);
    return false;
  }
}

/** ----------------------------------------------------------------
 * Response 인터셉터
 *  - 401(및 일부 세션만료 코드를) 만나면 1회 한정 재시도
 *  - 게스트/_noAuthRedirect는 관여하지 않음
 * ---------------------------------------------------------------- */
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = (error.config || {}) as AxiosRequestConfig;

    // 네트워크/타임아웃 등 response 자체가 없으면 그대로 throw
    if (!error.response) throw error;

    // 게스트 요청은 재발급/리다이렉트 관여 금지
    if (original?._guest) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const url = original.url || "";

    // 서버 구현에 따라 세션 만료로 401 외의 코드를 쓰는 경우도 처리 (예: 419/440)
    const isSessionExpired = status === 401 || status === 419 || status === 440;

    // 재발급 엔드포인트 자체가 만료되면(401 등) 바로 세션 종료
    if (isSessionExpired && url.includes("/api/auth-user/reissue")) {
      isRefreshing = false;
      notifyAllWaiters();

      if (isGuestContext() || original._noAuthRedirect) {
        return Promise.reject(error);
      }
      safeRedirectToLogin("error=session_expired");
      return Promise.reject(error);
    }

    // 일반 요청에서의 세션 만료 처리 (1회 재시도)
    if (isSessionExpired && !original._retry) {
      if (isGuestContext() || original._noAuthRedirect) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // 이미 재발급 중이면 대기 → 완료 후 재시도
        await new Promise<void>((resolve) => waitQueue.push(resolve));
        original._retry = true;
        return apiClient(original);
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const ok = await callRefreshEndpoint();
        if (!ok) throw new Error("refresh_failed");

        // 성공: 대기자 모두 깨우고 원 요청 재시도 (쿠키 자동 포함)
        notifyAllWaiters();
        return apiClient(original);
      } catch (e) {
        console.error("토큰 재발급 실패:", e);
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

    // 그 외 에러는 그대로 전달
    return Promise.reject(error);
  }
);
