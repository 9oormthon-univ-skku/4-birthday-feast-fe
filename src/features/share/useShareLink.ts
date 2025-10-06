// src/features/share/useShareLink.ts
import { useCallback, useMemo } from 'react';

export function useShareLink(userId: string | number) {
  const url = useMemo(() => `${window.location.origin}/feast/${userId}`, [userId]);

  const share = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: '생일한상',
          text: '내 생일상에 초대할게요 🎂',
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert('링크를 클립보드에 복사했어요.');
      }
    } catch {
      /* 취소 등 무시 */
    }
  }, [url]);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(url);
    alert('링크를 복사했어요.');
  }, [url]);

  return { url, share, copy };
}
