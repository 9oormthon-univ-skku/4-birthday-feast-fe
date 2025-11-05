// src/features/message/useBirthdayCards.ts
import { useEffect, useMemo, useRef } from "react";
import { useFeastThisYear } from "@/hooks/useFeastThisYear";
import { useBirthdayMode } from "@/app/ModeContext";
import { useGuestBirthday } from "@/hooks/useGuestBirthday";
import { BirthdayCardLike } from "@/types/birthday";
/* ----------------------------------------------------------------------------- 
 * 메인 훅
 * ---------------------------------------------------------------------------*/
export function useBirthdayCards() {
  const { isHost, isGuest } = useBirthdayMode();

  // Host: 올해 생일상 (캐시 포함)
  const {
    data: hostCards,
    loading: hostLoading,
    reload: hostReload,
    preloadThisYearQuietly,
  } = useFeastThisYear();

  // Guest: 게스트 생일상
  const {
    data: guestCards,
    isLoading: guestLoading,
    refetch: guestRefetch,
  } = useGuestBirthday({
    // 게스트 토큰 만료 시 자동 재시도는 훅 내부에서 401 방지 처리
    refetchOnWindowFocus: false,
    enabled: isGuest,
  });

  // ✅ 앱 진입 시 조용히 프리페치(Host만, 1회 가드)
  const didPrefetchRef = useRef(false);
  useEffect(() => {
    if (isHost && !didPrefetchRef.current) {
      didPrefetchRef.current = true;
      preloadThisYearQuietly();
    }
  }, [isHost, preloadThisYearQuietly]);

  const { data } = useMemo(() => {
    if (isHost) {
      const list = hostCards?.birthdayCards ?? [];
      return { data: (Array.isArray(list) ? list : []) as BirthdayCardLike[] };
    }
    if (isGuest) {
      const list = guestCards?.birthdayCards ?? [];
      return { data: (Array.isArray(list) ? list : []) as BirthdayCardLike[] };
    }
    return { data: [] as BirthdayCardLike[] };
  }, [isHost, isGuest, hostCards, guestCards]);

  const hasData = data.length > 0;

  // 캐시가 있어 즉시 카드가 만들어지면 로딩 표시를 줄여 UX 개선
  const primaryLoading = isHost ? hostLoading : isGuest ? guestLoading : false;
  const isLoading = primaryLoading && !hasData;

  const error: Error | null = null; // 오류 처리는 각 소스 훅 내부에서 관리

  const count = useMemo(() => data.length, [data]);

  const refetch = () => {
    if (isHost) hostReload();
    else if (isGuest) void guestRefetch();
  };

  return { data, isLoading, error, count, refetch };
}
