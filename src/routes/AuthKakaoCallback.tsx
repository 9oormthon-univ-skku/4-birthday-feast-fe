// src/pages/AuthKakaoCallback.tsx
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { setAccessToken } from "@/stores/authToken";
import { kakaoLogin } from "@/apis/auth";
import {
  setAuthSessionUserId,
  setLastBirthdayId,
  setLastQuizId,
} from "@/stores/authStorage";

export default function AuthKakaoCallback() {
  const nav = useNavigate();
  const location = useLocation();
  const didRun = useRef(false);

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
        const data = await kakaoLogin(code);

        // ⬇️ 토큰 저장
        setAccessToken(data?.accessToken || null);

        // ⬇️ userId 저장
        setAuthSessionUserId(data.userId ?? null);

        // 🎂 birthdayId / quizId 저장 (null이면 자동 remove)
        setLastBirthdayId(data?.birthdayId ?? null);
        setLastQuizId(data?.quizId ?? null);

        // ⬇️ 이동 경로: /u/:userId/main
        nav(`/u/${data.userId}/main`, { replace: true });
      } catch (e) {
        if (axios.isAxiosError(e) && e.response) {
          const status = e.response.status;
          const body =
            typeof e.response.data === "string"
              ? e.response.data
              : JSON.stringify(e.response.data ?? {}, null, 2);

          console.error("☁️ kakao-login failed:", status, body);
          alert(`카카오 로그인 실패\n${status}${body}`);
          nav(
            `/login?error=${status}&desc=${encodeURIComponent(
              body.slice(0, 200)
            )}`,
            { replace: true }
          );
        } else {
          console.error(e);
          nav("/login?error=network", { replace: true });
        }
      }
    })();
  }, [location.search, nav]);

  return <div className="p-6 text-center">카카오 로그인 처리 중입니다…</div>;
}