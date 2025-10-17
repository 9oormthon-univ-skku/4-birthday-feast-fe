import { useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getStoredUserId } from "@/features/auth/authStorage";

/**
 * 공유용 링크 생성 훅 (B안 라우팅)
 * 항상 `/u/:userId/main?code=...` 형태의 링크를 생성합니다.
 */
export function useShareLink(code: string | undefined | null) {
  const { userId: userIdParam } = useParams();
  const storedId = getStoredUserId();
  const userId = userIdParam ?? storedId ?? null;

  const url = useMemo(() => {
    if (!code || !userId) return "";
    const origin = window.location.origin;
    const params = new URLSearchParams({ code });
    return `${origin}/u/${userId}/main?${params.toString()}`;
  }, [code, userId]);

  const share = useCallback(async () => {
    if (!url) return alert("공유 가능한 링크가 없습니다.");
    try {
      if (navigator.share) {
        await navigator.share({
          title: "생일한상",
          text: "내 생일상에 초대할게요 🎂",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("링크를 클립보드에 복사했어요.");
      }
    } catch {
      // 사용자가 공유 취소 시 무시
    }
  }, [url]);

  const copy = useCallback(async () => {
    if (!url) return alert("공유 가능한 링크가 없습니다.");
    await navigator.clipboard.writeText(url);
    alert("링크를 복사했어요.");
  }, [url]);

  return { url, share, copy };
}
