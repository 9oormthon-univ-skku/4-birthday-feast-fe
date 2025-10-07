import { useCallback, useEffect, useMemo, useState } from "react";

export const TOKEN_KEY = "bh.auth.accessToken" as const;

export type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
  /** 로그인: 전달받은 토큰을 저장(필수 인자) */
  login: (token: string) => string; // 반환: 최종 저장된 토큰
  /** 로그아웃: 토큰 제거 */
  logout: () => void;
};

/** 로컬스토리지에서 즉시 읽기 */
function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function useAuth(): AuthState {
  const [token, setToken] = useState<string | null>(() => readToken());

  // 스토리지 변경(다른 탭) 동기화
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) {
        setToken(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback((t: string) => {
    const next = String(t ?? "").trim();
    if (!next) {
      // 더미 토큰 생성 금지: 잘못된 사용을 빠르게 드러내기 위해 에러 처리
      throw new Error("login(token) requires a non-empty token string");
    }
    localStorage.setItem(TOKEN_KEY, next);
    setToken(next);
    return next;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  const isAuthenticated = useMemo(() => Boolean(token), [token]);

  return { token, isAuthenticated, login, logout };
}
