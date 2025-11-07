// src/pages/AuthKakaoCallback.tsx
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { kakaoLogin } from "@/apis/auth";
import { setAccessToken } from "@/stores/authToken";
import {
  setAuthSessionUserId,
  setLastBirthdayId,
  setLastQuizId,
} from "@/stores/userStorage";

export default function AuthKakaoCallback() {
  const nav = useNavigate();
  const location = useLocation();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    let cancelled = false;

    const run = async () => {
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

      sessionStorage.removeItem("kakao_oauth_state");

      try {
        const data = await kakaoLogin(code);
        if (cancelled) return;

        setAccessToken(data.accessToken ?? null);
        setAuthSessionUserId(data.userId ?? null);
        setLastBirthdayId(data?.birthdayId ?? null);
        setLastQuizId(data?.quizId ?? null);

        nav(`/u/${data.userId}/main`, { replace: true });
      } catch (e) {
        if (axios.isAxiosError(e) && e.response) {
          const status = e.response.status;
          const body =
            typeof e.response.data === "string"
              ? e.response.data
              : JSON.stringify(e.response.data ?? {}, null, 2);
          alert(`카카오 로그인 실패\n${status}${body}`);
          nav(`/login?error=${status}&desc=${encodeURIComponent(body.slice(0, 200))}`, { replace: true });
        } else {
          nav("/login?error=network", { replace: true });
        }
      }
    };

    // Promise 반환을 방지하기 위해 명시적으로 버림
    void run();

    // cleanup은 void만 반환
    return () => {
      cancelled = true;
    };
  }, [location.search, nav]);

  return <div className="p-6 text-center">카카오 로그인 처리 중입니다…</div>;
}