// src/features/message/useBirthdayCards.ts
import { useEffect, useMemo } from "react";
import type { BirthdayCard } from "@/types/birthday";
import { useFeastThisYear } from "@/hooks/useFeastThisYear";
import { GuestBirthdayCard } from "@/apis/guest";

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
type ServerBirthdayCard = BirthdayCard | GuestBirthdayCard;

function adaptServerCards(list: ServerBirthdayCard[]): BirthdayCard[] {
  return list.map((c) => ({
    birthdayCardId: c.birthdayCardId,
    message: c.message,
    nickname: (c.nickname ?? "").trim() || "익명",
    imageUrl: c.imageUrl ?? undefined, // ✅ 항상 imageUrl 그대로 사용
  }));
}

function adaptLocalCards(list: LocalCard[]): BirthdayCard[] {
  return list.map((c) => ({
    birthdayCardId: c.birthdayCardId,
    message: c.message,
    nickname: (c.nickname ?? "").trim() || "익명",
    imageUrl: c.imageUrl ?? undefined, // ✅ 그대로 사용
  }));
}

/* ----------------------------------------------------------------------------- 
 * 메인 훅
 * ---------------------------------------------------------------------------*/
export function useBirthdayCards() {
  // 올해 생일상 데이터(캐시 포함)를 즉시 사용
  const { data: feast, loading, reload, preloadThisYearQuietly } = useFeastThisYear();

  // 앱 진입 시 조용히 프리페치(최초 1회)
  useEffect(() => {
    preloadThisYearQuietly();
  }, [preloadThisYearQuietly]);

  // 서버 카드 우선 사용, 없으면 로컬 폴백
  const serverCards: ServerBirthdayCard[] = useMemo(() => {
    return Array.isArray(feast?.birthdayCards)
      ? (feast!.birthdayCards as ServerBirthdayCard[])
      : [];
  }, [feast?.birthdayCards]);

  const data: BirthdayCard[] = useMemo(() => {
    if (serverCards.length > 0) return adaptServerCards(serverCards);
    return adaptLocalCards(readLocalCards());
  }, [serverCards]);

  // 다른 탭/창에서 로컬 카드가 바뀌면 서버/캐시도 재확인
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        reload(); // 올해 데이터 쿼리 invalidate+refetch
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [reload]);

  // 캐시가 있어 즉시 카드가 만들어지면 로딩 표시를 줄여 UX 개선
  const isLoading = loading && serverCards.length === 0;
  const error: Error | null = null; // 오류 처리는 useFeastThisYear 내부에서 관리 중

  const count = useMemo(() => data.length, [data]);
  const refetch = () => void reload();

  return { data, isLoading, error, count, refetch };
}
