// src/features/auth/useLogout.ts
import { useNavigate } from "react-router-dom";
import { postLogout } from "@/apis/auth";
import { clearAccessToken } from "@/lib/authToken";
import { clearAuthUserId } from "@/features/auth/authStorage";

export function useLogout() {
  const nav = useNavigate();

  const logout = async () => {
    try {
      await postLogout(); // 서버 로그아웃
    } catch (err) {
      console.error("서버 로그아웃 실패:", err);
    } finally {
      // ⬇️ 로컬 세션 정리: 토큰 + userId
      clearAccessToken();
      clearAuthUserId();

      nav("/login", { replace: true });
    }
  };

  return { logout };
}
