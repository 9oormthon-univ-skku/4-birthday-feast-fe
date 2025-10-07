import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { setAccessToken } from "@/lib/authToken";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

type KakaoLoginResponse = {
  userId: number | string;
  authToken: { accessToken: string; tokenType: string; expiresIn: number };
};

export default function AuthKakaoCallback() {
  const nav = useNavigate();
  const location = useLocation();
  const didRun = useRef(false); // 중복 방지

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    const state = params.get("state");
    const saved = sessionStorage.getItem("kakao_oauth_state");

    if (!code) {
      nav("/login?error=no_code", { replace: true });
      return;
    }
    if (!state || state !== saved) {
      nav("/login?error=invalid_state", { replace: true });
      return;
    }

    // state 일회성 소비
    sessionStorage.removeItem("kakao_oauth_state");

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth-user/kakao-login`,{
          method: "POST",
          headers: { "Content-Type": "application/json;charset=UTF-8" },
          credentials: "include",
          body: JSON.stringify({ code }),
        });

        // 디버깅을 위해 본문을 먼저 확보
        const text = await res.text();
        if (!res.ok) {
          console.error("kakao-login failed:", res.status, text);
          // 카카오 코드 재사용 등 예상 케이스 안내용 쿼리
          nav(`/login?error=${res.status}&desc=${encodeURIComponent(text.slice(0,200))}`, { replace: true });
          return;
        }

        const data = JSON.parse(text) as KakaoLoginResponse;
        setAccessToken(data?.authToken?.accessToken || "");

        const from = (window.history.state && (window.history.state as any).usr?.from) || "/main";
        nav(from, { replace: true });
      } catch (e) {
        console.error(e);
        nav("/login?error=network", { replace: true });
      }
    })();
  }, [location.search, nav]);

  return <div className="p-6 text-center">카카오 로그인 처리 중입니다…</div>;
}
