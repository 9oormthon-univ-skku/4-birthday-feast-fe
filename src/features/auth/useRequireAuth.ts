// src/hooks/useRequireAuth.ts
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";


/** 페이지 내부에서 훅으로 간단히 보호하고 싶을 때 */
export function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();


  useEffect(() => {
    if (!isAuthenticated) {
      nav("/login", { replace: true, state: { from: loc } });
    }
  }, [isAuthenticated, nav, loc]);
}