// src/hooks/useShareLink.ts
import { useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { getStoredUserId, LS_LAST_QUIZ } from "@/stores/authStorage";
import { qk } from "@/apis/queryKeys";
import type { UserMeResponse } from "@/apis/user";

// const LS_LAST_QUIZ_ID = "bh.lastQuizId";

/**
 * 공유용 링크 생성 훅 (B안 라우팅)
 * 항상 `/u/:userId/main?code=...&quizId=...&name=...` 형태의 링크를 생성합니다.
 * - code: 인자로 전달
 * - quizId: localStorage("bh.lastQuizId")에서 로드 (있을 때만)
 * - name: React Query 캐시(qk.auth.me)에서 호스트 이름 로드 (없으면 생략)
 */
export function useShareLink(code: string | undefined | null) {
  const { userId: userIdParam } = useParams();
  const storedId = getStoredUserId();
  const userId = userIdParam ?? storedId ?? null;

  // ✅ me 캐시에서 사용자 이름 가져오기 (네트워크 호출 없음)
  const qc = useQueryClient();
  const me = qc.getQueryData<UserMeResponse>(qk.auth.me) ?? null;
  const rawName = me?.name?.trim();
  const shareName = rawName && rawName.length > 0 ? rawName : undefined;

  const url = useMemo(() => {
    if (!code || !userId) return "";

    // quizId는 로컬스토리지에서 로드 (없으면 추가 안 함)
    let quizId: string | null = null;
    try {
      quizId = localStorage.getItem(LS_LAST_QUIZ);
    } catch {
      // private mode 등 예외는 무시
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const params = new URLSearchParams();
    params.set("code", code);
    if (quizId) params.set("quizId", quizId);
    // ✅ 이름도 쿼리에 포함 (게스트가 열었을 때 바로 표시 가능)
    if (shareName) params.set("name", shareName);

    return `${origin}/u/${userId}/main?${params.toString()}`;
  }, [code, userId, shareName]);

  const share = useCallback(async () => {
    if (!url) return alert("공유 가능한 링크가 없습니다.");

    const title = shareName ? `${shareName}의 생일한상` : "생일한상";
    const text = shareName
      ? `${shareName}의 생일한상에 초대할게요 🎂`
      : "내 생일한상에 초대할게요 🎂";

    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({ title, text, url });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert("링크를 클립보드에 복사했어요.");
      } else {
        alert(url);
      }
    } catch {
      // 사용자가 공유 취소 시 무시
    }
  }, [url, shareName]);

  const copy = useCallback(async () => {
    if (!url) return alert("공유 가능한 링크가 없습니다.");
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      alert("링크를 복사했어요.");
    } else {
      alert(url);
    }
  }, [url]);

  return { url, share, copy };
}
