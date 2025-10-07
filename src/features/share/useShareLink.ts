// src/features/share/useShareLink.ts
import { useCallback, useMemo } from "react";

/**
 * 공유용 링크 생성 훅 (code 기반)
 * - /main?code={uuid} 형태로 접근
 * - Web Share API 또는 클립보드 복사 지원
 */
export function useShareLink(code: string | undefined | null) {
  const url = useMemo(() => {
    if (!code) return "";
    const origin = window.location.origin;
    const params = new URLSearchParams({ code });
    return `${origin}/main?${params.toString()}`;
  }, [code]);

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
      /* 사용자가 공유 취소 시 무시 */
    }
  }, [url]);

  const copy = useCallback(async () => {
    if (!url) return alert("공유 가능한 링크가 없습니다.");
    await navigator.clipboard.writeText(url);
    alert("링크를 복사했어요.");
  }, [url]);

  return { url, share, copy };
}
