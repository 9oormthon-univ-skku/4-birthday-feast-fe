import axios from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "@/lib/authToken";
import { reissueAccessToken } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Refresh Token 쿠키 포함
});

// 요청 인터셉터: AccessToken 자동 포함
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 응답 인터셉터: 401 → 재발급 후 재시도
let isRefreshing = false;
let waitQueue: (() => void)[] = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (!error.response) throw error;

    if (error.response.status === 401 && !original._retry) {
      if (isRefreshing) {
        await new Promise<void>((resolve) => waitQueue.push(resolve));
        const token = getAccessToken();
        if (token) original.headers.Authorization = `Bearer ${token}`;
        return apiClient(original);
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const newTokens = await reissueAccessToken();
        setAccessToken(newTokens.accessToken);
        waitQueue.forEach((r) => r());
        waitQueue = [];

        original.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return apiClient(original);
      } catch (e) {
        console.error("토큰 재발급 실패:", e);
        clearAccessToken();
        window.location.href = "/login?error=session_expired";
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
