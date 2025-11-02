// src/features/message/useBirthdayCards.ts
import { useEffect, useMemo } from "react";
// import type { BirthdayCardLike } from "@/types/birthday";
import { useFeastThisYear } from "@/hooks/useFeastThisYear";
import { useBirthdayMode } from "@/app/ModeContext";
import { useGuestBirthday } from "@/hooks/useGuestBirthday";
import type { GuestBirthdayCard } from "@/apis/guest";
import { BirthdayCard } from "@/apis/birthday";
import { BirthdayCardLike } from "@/types/birthday";

/* ----------------------------------------------------------------------------- 
 * 로컬스토리지 폴백
 * ---------------------------------------------------------------------------*/
const STORAGE_KEY = "birthday_cards";

type LocalCard = {
  birthdayCardId: string | number;
  message: string;
  nickname?: string;
  imageUrl?: string;
};

function readLocalCards(): LocalCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/* ----------------------------------------------------------------------------- 
 * 서버 → BirthdayCard 어댑터
 * ---------------------------------------------------------------------------*/
export type ServerBirthdayCard = BirthdayCard | GuestBirthdayCard;

export function adaptServerCards(list: ServerBirthdayCard[]): BirthdayCardLike[] {
  return list.map((c) => ({
    birthdayCardId: c.birthdayCardId,
    message: c.message,
    nickname: (c.nickname ?? "").trim() || "익명",
    imageUrl: c.imageUrl ?? undefined,
  }));
}

export function adaptLocalCards(list: LocalCard[]): BirthdayCardLike[] {
  return list.map((c) => ({
    birthdayCardId: c.birthdayCardId,
    message: c.message,
    nickname: (c.nickname ?? "").trim() || "익명",
    imageUrl: c.imageUrl ?? undefined,
  }));
}

/* ----------------------------------------------------------------------------- 
 * 메인 훅
 * ---------------------------------------------------------------------------*/
export function useBirthdayCards() {
  const { isHost, isGuest } = useBirthdayMode();

  // Host: 올해 생일상 (캐시 포함)
  const {
    data: hostFeast,
    loading: hostLoading,
    reload: hostReload,
    preloadThisYearQuietly,
  } = useFeastThisYear();

  // Guest: 게스트 생일상
  const {
    data: guestFeast,
    isLoading: guestLoading,
    refetch: guestRefetch,
  } = useGuestBirthday({
    // 게스트 토큰 만료 시 자동 재시도는 훅 내부에서 401 방지 처리
    refetchOnWindowFocus: false,
    enabled: isGuest,
  });

  // 앱 진입 시 조용히 프리페치: Host에서만 수행
  useEffect(() => {
    if (isHost) {
      preloadThisYearQuietly();
    }
  }, [isHost, preloadThisYearQuietly]);

  // 서버 카드 우선 사용, 없으면 로컬 폴백
  const serverCards: ServerBirthdayCard[] = useMemo(() => {
    const list =
      isHost
        ? (hostFeast?.birthdayCards ?? [])
        : isGuest
          ? (guestFeast?.birthdayCards ?? [])
          : [];
    return Array.isArray(list) ? (list as ServerBirthdayCard[]) : [];
  }, [isHost, isGuest, hostFeast?.birthdayCards, guestFeast?.birthdayCards]);

  const data: BirthdayCardLike[] = useMemo(() => {
    if (serverCards.length > 0) return adaptServerCards(serverCards);
    return adaptLocalCards(readLocalCards());
  }, [serverCards]);

  // 다른 탭/창의 로컬 변경 감지 → 서버/캐시도 재확인
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        if (isHost) hostReload();
        else if (isGuest) void guestRefetch();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [isHost, isGuest, hostReload, guestRefetch]);

  // 캐시가 있어 즉시 카드가 만들어지면 로딩 표시를 줄여 UX 개선
  const primaryLoading = isHost ? hostLoading : guestLoading;
  const isLoading = primaryLoading && serverCards.length === 0;

  const error: Error | null = null; // 오류 처리는 각 소스 훅 내부에서 관리

  const count = useMemo(() => data.length, [data]);

  const refetch = () => {
    if (isHost) hostReload();
    else if (isGuest) void guestRefetch();
  };

  return { data, isLoading, error, count, refetch };
}
