import { useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getStoredUserId } from "@/features/auth/authStorage";

const LS_LAST_QUIZ_ID = "bh.lastQuizId";

/**
 * 공유용 링크 생성 훅 (B안 라우팅)
 * 항상 `/u/:userId/main?code=...&quizId=...` 형태의 링크를 생성합니다.
 * - code: 인자로 전달
 * - quizId: localStorage("bh.lastQuizId")에서 로드
 */
export function useShareLink(code: string | undefined | null) {
  const { userId: userIdParam } = useParams();
  const storedId = getStoredUserId();
  const userId = userIdParam ?? storedId ?? null;

  const url = useMemo(() => {
    if (!code || !userId) return "";

    // quizId는 로컬스토리지에서 로드 (없으면 추가 안 함)
    let quizId: string | null = null;
    try {
      quizId = localStorage.getItem(LS_LAST_QUIZ_ID);
    } catch {
      // private mode 등 예외는 무시
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const params = new URLSearchParams();
    params.set("code", code);
    if (quizId) params.set("quizId", quizId);

    return `${origin}/u/${userId}/main?${params.toString()}`;
  }, [code, userId]);

  const share = useCallback(async () => {
    if (!url) return alert("공유 가능한 링크가 없습니다.");
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({
          title: "생일한상",
          text: "내 생일상에 초대할게요 🎂",
          url,
        });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert("링크를 클립보드에 복사했어요.");
      } else {
        // 환경에 따라 clipboard가 없을 수 있음
        alert(url);
      }
    } catch {
      // 사용자가 공유 취소 시 무시
    }
  }, [url]);

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
