// src/features/auth/useLogout.ts
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postLogout } from "@/apis/auth";
// import { clearAccessToken } from "@/stores/authToken";
import {
  clearAuthUserId,
  clearLastBirthdayId,
  clearLastQuizId,
} from "@/stores/authStorage";
import { qk } from "@/apis/queryKeys";

export function useLogout() {
  const nav = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationKey: ["auth", "logout"],
    mutationFn: async () => {
      try {
        await postLogout(); // 서버 로그아웃
      } catch (err) {
        // 서버 실패해도 로컬 정리는 진행
        // eslint-disable-next-line no-console
        console.error("서버 로그아웃 실패:", err);
        alert(`서버 로그아웃 실패\n${err}`)
      }
      return true;
    },
    onSettled: async () => {
      // 1) 로컬 세션/스토리지 정리
      try {
        // clearAccessToken();
        clearAuthUserId();
        clearLastBirthdayId(); // ✅ 추가
        clearLastQuizId();     // ✅ 추가

        // (중복 방어용 레거시 키가 있다면 유지)
        localStorage.removeItem("bh.auth.accessToken");
      } catch { }

      // 2) 진행 중 쿼리 취소 + 캐시 정리
      try {
        await queryClient.cancelQueries();

        queryClient.setQueryData(qk.auth.token, null);
        queryClient.removeQueries({ queryKey: ["auth"], exact: false });
        queryClient.removeQueries({ queryKey: ["user"], exact: false });
        queryClient.removeQueries({ queryKey: ["birthdays"], exact: false });
        queryClient.removeQueries({ queryKey: ["cards"], exact: false });
        queryClient.removeQueries({ queryKey: ["quiz"], exact: false });
      } catch { }

      // 3) 라우팅
      nav("/login", { replace: true });
    },
  });

  const logout = async () => {
    await mutateAsync();
  };

  return { logout };
}
