import { useCallback, useEffect, useMemo, useState } from "react";


export const TOKEN_KEY = "bh.auth.accessToken" as const;


export type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
  /** 로그인: 토큰을 넘기지 않으면 더미 토큰을 생성하여 저장 */
  login: (token?: string) => string; // 반환: 최종 저장된 토큰
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


function makeDummyToken() {
  return `token_${Date.now()}_${Math.random().toString(36).slice(2)}`;
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


  const login = useCallback((t?: string) => {
    const next = t ?? makeDummyToken();
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