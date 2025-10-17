// src/features/share/useShareLink.ts
import { useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getStoredUserId } from "@/features/auth/authStorage";

const LS_LAST_QUIZ_ID = "bh.lastQuizId";

/**
 * 공유용 링크 생성 훅 (통합 버전)
 * 항상 /u/:userId/:birthdayId/quiz/:quizId?code=... 형태의 링크를 생성합니다.
 * 모든 ID는 useParams → localStorage 순서로 확보합니다.
 */
export function useShareLink(code: string | undefined | null) {
  const { userId: userIdParam } = useParams();

  const storedUserId = getStoredUserId();
  const storedQuizId =
    typeof window !== "undefined" ? localStorage.getItem(LS_LAST_QUIZ_ID) : null;

  const userId = userIdParam ?? storedUserId ?? null;
  const quizId = storedQuizId ?? null;

  const url = useMemo(() => {
    if (!code || !userId || !quizId) return "";

    const origin = window.location.origin;
    const base = `${origin}/u/${userId}/quiz/${quizId}`;
    const params = new URLSearchParams({ code });
    return `${base}?${params.toString()}`;
  }, [code, userId, quizId]);

  const share = useCallback(async () => {
    if (!url) return alert("공유 가능한 링크가 없습니다.");
    try {
      if (navigator.share) {
        await navigator.share({
          title: "생일한상 퀴즈 🎉",
          text: "내 생일 퀴즈에 도전해보세요!",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("링크를 클립보드에 복사했어요.");
      }
    } catch {
      // 사용자가 공유를 취소하면 무시
    }
  }, [url]);

  const copy = useCallback(async () => {
    if (!url) return alert("공유 가능한 링크가 없습니다.");
    await navigator.clipboard.writeText(url);
    alert("링크를 복사했어요.");
  }, [url]);

  return { url, share, copy };
}
