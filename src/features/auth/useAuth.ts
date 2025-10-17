// src/features/auth/useAuth.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { qk } from "../queryKeys";

export const TOKEN_KEY = "bh.auth.accessToken" as const;

export type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => string;
  logout: () => void;
};

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function useAuth(): AuthState {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => readToken());

  // 스토리지 동기화 (다른 탭)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) {
        setToken(e.newValue);
        // ⬇️ 전역 캐시에 반영
        queryClient.setQueryData(qk.auth.token, e.newValue ?? null);

        // 토큰이 사라졌다면 유저 스코프 쿼리 정리
        if (!e.newValue) {
          queryClient.removeQueries({ queryKey: ["user"], exact: false });
          queryClient.removeQueries({ queryKey: ["birthdays"], exact: false });
          queryClient.removeQueries({ queryKey: ["cards"], exact: false });
          queryClient.removeQueries({ queryKey: ["quiz"], exact: false });
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [queryClient]);

  const login = useCallback(
    (t: string) => {
      const next = String(t ?? "").trim();
      if (!next) {
        throw new Error("login(token) requires a non-empty token string");
      }
      localStorage.setItem(TOKEN_KEY, next);
      setToken(next);

      // Query 캐시 반영 + /me 재검증
      queryClient.setQueryData(qk.auth.token, next);
      queryClient.invalidateQueries({ queryKey: qk.auth.me });

      return next;
    },
    [queryClient]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);

    // ⬇️ Query 캐시 정리 (유저 스코프 중심)
    queryClient.setQueryData(qk.auth.token, null);
    queryClient.cancelQueries();

    queryClient.removeQueries({ queryKey: ["user"], exact: false });
    queryClient.removeQueries({ queryKey: ["birthdays"], exact: false });
    queryClient.removeQueries({ queryKey: ["cards"], exact: false });
    queryClient.removeQueries({ queryKey: ["quiz"], exact: false });
  }, [queryClient]);

  const isAuthenticated = useMemo(() => Boolean(token), [token]);

  return { token, isAuthenticated, login, logout };
}
