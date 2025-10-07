import { useNavigate } from "react-router-dom";
import { postLogout } from "@/apis/auth";
import { clearAccessToken } from "@/lib/authToken";

export function useLogout() {
  const nav = useNavigate();

  const logout = async () => {
    try {
      await postLogout(); // 서버 로그아웃
    } catch (err) {
      console.error("서버 로그아웃 실패:", err);
    } finally {
      clearAccessToken(); // 로컬 토큰 삭제
      nav("/login", { replace: true }); // 로그인 페이지로 이동
    }
  };

  return { logout };
}
